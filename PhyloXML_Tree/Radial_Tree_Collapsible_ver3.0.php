<html>
  <head>
    <title> Collapsible radial tree </title>
    <script type = "text/javascript" src = "http://d3js.org/d3.v3.min.js"> </script>
    <script type = "text/javascript" src = "js/jquery.js"> </script>
    <script type = "text/javascript" src = "js/expandCollapse.js"> </script>
    <script type="text/javascript" src="js/jkl-dumper.js" charset="Shift_JIS"></script>
    <script type="text/javascript" src="js/jkl-parsexml.js"></script>
    <script type="text/javascript" src="js/loadxmldoc.js"></script> 
    <script type="text/javascript" src="js/expandCollapse.js"></script>
    <script type="text/javascript" src="js/jquery.js"></script>  

    <meta charset = "utf-8">
    <style type = "text/css">

        #title {
            text-align: center;
        }
        .node {
            cursor: pointer;
        }
    
        .node circle {
            fill: transparent;
            stroke: steelblue;
            stroke-width: 1.5px;
            opacity: 0.5;
        }
        
        .node text {
            font-family: sans-serif;
            font-size: 11px;
        }
        
        .link {
            fill: none;
            stroke: lightgrey;
            stroke-width: 1.5px;
        }
        
        </style>
    </head>

  <body>

<?php
        

        #echo "The uploaded file name is " . "<strong>" . $Filename . "</strong><br>";

        
?>


        <h1 id="title"> Collapsible radial tree - ver. 3.0 </h1>
        <div id="usage" style="display:none">
            <h4 > Usage: </h4>
            <ul>
                <li> The tree data was converted to json file from phyloxml. </li>
                <li> Collapsing or expaning all nodes can be done in one time by pressing the each button. </li>
                <li> Expand/Collapse button is incomplete that works as expanding or collaping. </li>
                <li> Clicking each node or name expands or collapses the tree. </li>
                <li> Blue text color or light blue nodes indicates that the node still contains not collapsed node(s). </li>
                <li> Mouse event functions:
                    <ul> 
                        <li> Green node indicates that it is a leaf node or all child nodes are collapsed. </li> 
                        <li> Red node indicates that the node stil contains not collapsed node(s). </li>
                        <li> Each node name will be shown in bigger size at right side of mouse cursor and in yellowgreen box when the cursor places on the node name. </li>
                    </ul>
                </li>
            </ul>
        </div>
        <div>
        <input type="button" onclick="return toggleMe('usage')" value="Show Usage">
        </div>
        <div id="option">
            <div id="buttons">
            <button id="collapseAll">Collapse All</button>
            <button id="expandAll">Expand All</button>
            <button id="expand_collapse">Expand/Collapse</button>
            <br>
        </div>
        

        <div id="infoBox" style="width:500px; height:100px; background-color:beige; border:4px double green;"> </div>

        <span id = "Filepath"></span>

        <div id="treeContainer"> </div>

        <script>
            //old data
            //<button id="expandAll">Expand All</button>
            //<button id="expandOne">Expand 1lv</button>
        </script>

        <script>

        // get filename from the parser
        var filename = window.opener.fin;
        console.log("Passed fin name? : " + filename);
        //var filename = "<?php echo $_FILES["file"]["name"]; ?>";
        //console.log("FILENAME : " + filename);
        parser();

        function parser() {
                /////// Set the modified file name.
                //////  This must be changed if the modifyXML.py has been changed.
            var url = "uploaded/modified_" + filename;
            var xml = new JKL.ParseXML( url, null );
            xml.setOutputArrayElements( ["clade"], ["name"] );
            var data = xml.parse();
            
            var dumper = new JKL.Dumper();
            var text = dumper.dump( data );
            
            var outData = output(text);
            var Datalength = outData.length;

            saveJSON(outData);
            
            function output(text) {
                if ( typeof(text) == "undefined" ) return "";
                text = text.replace(new RegExp('(.*)phylogeny(.*)', 'g'), '').replace(/"clade"/g, '"children"').replace(/"#text"/g, '"text"').replace(/"rooted"/g, '"name"').replace(/"true"/g, '"ROOT"').replace(/"confidence"/g, '"property"').replace(/""name"":/g,"").replace(/""ROOT","/g, "");

                // newText contains parsed valid JSON data
                // To remove last '}' for valid JSON data (removed parent 'phylogeny')
                newText = text.substr(text.indexOf("{"), text.lastIndexOf("}")-1); 
                return newText;
            }

        }

        function saveJSON(outData) {
            //var outData = "HELLO WORLD!";
            var name = filename;
            $.ajax({
                type: "POST",
                url: "saveJSON.php",
                data: { jsonData: outData, XMLname: name },
                success: function(data)
                {
                    console.log("success AJAX!");
                }
            })

            gen_Tree(name);
        }

        function gen_Tree(data) {
        //get Filepath from the control page
        //var parent = $(window.opener.document).contents();
        //var data = parent.find("#listName").val();
        var filePath = "uploaded/" + data + ".json";
        //$("#Filepath").html(filePath);

        //d3.json("/xml_to_json_Parser/pythonUploader/uploaded/testTree2.xml.json", function(error, jsonData)
        d3.json(filePath , function(error, jsonData) 
        {    
            var diameter = 1100;
            var width = $(document).width();
            var height = $(document).height();
            var root;
            var getFirstSize = false;
            var NodeSize = { min:null, max:null };
            var nsDivider = nodeSizeDivider();
            var i = 0;
            var totalNodes = 0;
            var maxLabelLength = 0;
            var duration = 600;

            var setNodeSize_max = 30;       // set node size scale
            var setNodeSize_min = 5;
            var setNodeSize_default = 10;
            var setLinkLength = 2.2;         // multiplier#, bigger# : longer link length 
            
            var tree = d3.layout.tree()
                .size([360, diameter / 2 - 80 ])
                .separation(function(a, b) { 
                    //return ((a.parent == root) && (b.parent == root)) ? 4: 1; })
                    return (a.parent == b.parent == root ? 1 : 10) })

            var diagonal = d3.svg.diagonal.radial()
                .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });
            
            /*
            function visit(parent, visitFn, childrenFn) {
                if (!parent) return;
                visitFn(parent);
                var children = childrenFn(parent);
                if (children) {
                    var count = children.length;
                    for (var i = 0; i < count; i++) {
                        visit(children[i], visitFn, childrenFn);
                    }
                }
            }
         
            // Call visit function to establish maxLabelLength
            // visit(jsonData, function(d), function(d)) 
            visit(jsonData, function(d) {
                totalNodes++;
                maxLabelLength = Math.max(d.name.length, maxLabelLength);
                }, function(d) {
                return d.children && d.children.length > 0 ? d.children : null;
                });
            */
            // Define the zoom function for the zoomable tree
            function zoom() {
                svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }

            // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
            var zoomListener = d3.behavior.zoom()
                .scaleExtent([0.3, 3])
                .on("zoom", zoom);


            var canvas = d3.select("#treeContainer").append("svg")
                .attr("width", width )
                .attr("height", height )
                .call(zoomListener)
                //.append("g")
                //.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");                    
                    
            d3.select(self.frameElement).style("height", height );
            
            function update(source) {

                var nodes = tree.nodes(root);
                
                // Normalize for fixed-depth.
                nodes.forEach(function(d) { 
                    d.y = d.depth * 80; //});
                    //d.y = (d.depth * (maxLabelLength * setLinkLength));
                    console.log("maxLabelLength :" + maxLabelLength);
                    console.log("totalNodes:" + totalNodes);

                });

                // Update the nodes…
                var node = svg.selectAll("g.node")
                    .data(nodes, function(d) { return d.id || (d.id = ++i); });
                
                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                //.on("click", click);
                
				
                var nodeCircle = nodeEnter.append("circle")
                    //.attr("r", node_regSize)
                    .attr("r", function(d) {
                        
                        if (d.property == null) { return setNodeSize_default }
                        else if (d.property.text < nsDivider * setNodeSize_min) { return setNodeSize_min;}
                        else { return d.property.text / nsDivider}
                        
                        })
                    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; })

                   			// Node: mouse event
                    .on("mouseover", function(d) {
                    	//tooltip.style("visibility", "visible");
                        d3.select(this).style("fill", function(d) { 
                        	return d._children ? "red" : "green"; })
                        .transition()
                        .attr("r", function(d) {
                            if (d.property == null) { return setNodeSize_default }
                            else { return (d.property.text / nsDivider) + 4 }
                        })
                    })
                    .on("mousemove", function(d) {
                    		return tooltip.style("top", (event.pageY-10)+"px")
                    						.style("left",(event.pageX+10)+"px");})
                    
                    .on("mouseout", function(d) {
                        tooltip.style("visibility", "hidden");
                        d3.select(this).style("fill", function(d) {
                        	return d._children ? "lightsteelblue" : "white"; })
                        .transition()
                        .attr("r", function(d) {
                            if (d.property == null) { return setNodeSize_default }
                            // set minimum node size
                            else if (d.property.text < nsDivider * setNodeSize_min) { return setNodeSize_min;}
                            else { return d.property.text / nsDivider}
                            })
                        // change font color
                        nodeText.style("fill", function(d) {
                            return d._children ? "blue" : "black"; })
                        })
                    .on("click", click);
               
                var nodeText = nodeEnter.append("text")
               	//.attr("dy", ".35em")
                .text(function(d) { return d.name; })
                //.attr("text-anchor", "start")
                //.attr("dx", function(d) {
                //      if (d.x <= 180) { return 9; }
                //      else
                //      {
                //      if (d.name.length < 8) { return 18; }
                //      else if (d.name.length > 7 && d.name.length < 12) { return 8; }
                //      else if (d.name.length > 11 && d.name.length < 16) { return 0; }
                //      else if (d.name.length > 13) { return -30; }
                //      }})
                //.attr("transform", function(d) {
                //      return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + d.name.length + ")"; })

                .style("fill", function(d) {
                    	return d._children ? "blue" : "black"; })

                	// TEXT: mouse over event  - color, tooltip
				.on("mouseover", function(d) {
					tooltip.style("visibility", "visible");
                    tooltip_box.style("visibility", "visible");
                    
                    d3.select(this).style("fill", function(d) {
                    	// print name using tooltip
                    	tooltip.text(d.name)
                        
                        if (d.name == null) {
                            tooltip_box_name.text("\tName: " + "undefinded");
                        }    
                        else {
                            tooltip_box_name.text("\tName: " + d.name);
                        }
                        
                        var chkErr = false;

                        try {
                            if (d.property.text == null);
                        }
                        catch(err) {
                            chkErr = true; 
                            tooltip_box_nodeSize.text("\tNode size: undefinded");
                        }

                        if (chkErr == false) {
                            tooltip_box_nodeSize.text("\tNode size: " + d.property.text);
                        }

                        if (d.branch_length == null) {
                            tooltip_box_branchLength.text("\tBranch_length: " + "undefinded");
                        }
                        else { 
                            tooltip_box_branchLength.text("\tBranch_length: " + d.branch_length);
                        }
                    	return d._children ? "red" : "green"; })
                })
                .on("mousemove", function(d) {
                		return tooltip.style("top", (event.pageY-10)+"px")
                						.style("left",(event.pageX+10)+"px");})
                
                .on("mouseout", function(d) {                	                  
                    tooltip.style("visibility", "hidden");
                    tooltip_box.style("visibility", "hidden"); 
                    d3.select(this).style("fill", function(d) {
                    	return d._children ? "blue" : "black"; })
                })
                .on("click", click)
                .style("fill", function(d) {
                    	return d._children ? "blue" : "black"; })

                // tooltip - mouse over, move, out
				var tooltip = d3.select("body")		
				.append("div")
				.style("position", "absolute")
				.style("z-index", "13")
				.style("color", "teal")
				.style("font-weight", "bold")
				.style("font-family", "sans-serif")
				.style("visibility", "hidden")

                var tooltip_box = d3.select("#infoBox")     
                .append("div")
                .style("position", "absolute")
                .style("z-index", "11")
                .style("color", "black")
                .style("font-weight", "bold")
                .style("font-family", "sans-serif")
                .style("visibility", "hidden")

                var tooltip_box_name = tooltip_box.append("p")
                .style("margin-left", "10")
                var tooltip_box_nodeSize = tooltip_box.append("p")
                .style("margin-left", "10")
                var tooltip_box_branchLength = tooltip_box.append("p")
                .style("margin-left", "10")
                    // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
                
                nodeUpdate.select("circle")
                //.attr("r", node_regSize)
                .attr("r", function(d) {
                    if (d.property == null) { return setNodeSize_default }
                            // set minimum node size
                    
                    else if (d.property.text < nsDivider * setNodeSize_min) { return setNodeSize_min;}
                    else { return d.property.text / nsDivider}
                     
                    })
                .style("fill", function(d) { 
                    return d._children ? "lightsteelblue" : "#fff"; });
                
                var nodeUpdate_text = nodeUpdate.select("text")
                .style("fill-opacity", 1)
                .attr("dx", function(d) {
                    if (d.name == null) {return 9;}
                    else {
                      if (d.x < 180) { return 9; }
                      else
                      {
                        if (d.name.length < 8) { return 0; }
                        else if (d.name.length > 7 && d.name.length < 12) { return -5; }
                        else if (d.name.length > 11 && d.name.length < 18) { return -13; }
                        else if (d.name.length > 17 && d.name.length < 25) { return -23; }
                        else {return -35}
                      }}
                })
                .attr("dy", ".35em")
                .attr("transform", function(d) {
                    if (d.name == null) {
                      return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + 60 + ")";
                    }
                    else {
                      return d.x < 180 ? "translate(0)" : "rotate(180)translate(-" + ( (d.name.length +25) * 2) + ")"; 
                    }
                })

                nodeText.style("fill", function(d) {
                        return d._children ? "blue" : "black"; })


                var nodeExit = node.exit()
                .transition()
                .duration(duration)
                //.attr("transform", "translate(0,0)" )
                .remove();
                
                nodeExit.select("circle")
                .attr("r", 0.1);
                
                nodeExit.select("text")
                .style("fill-opacity", 0.1);
                


                var links = tree.links(nodes);
                
                var link = svg.selectAll("path.link")
                .data(links, function(d) { return d.target.id; });
                
                // Enter any new links at the parent's previous position.
                link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", function(d) {
                      var o = {x: source.x0, y: source.y0};
                      return diagonal({source: o, target: o});
                      });
                      
                // Transition links to their new position.
                link.transition()
                .duration(duration)
                .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                .duration(duration)
                .attr("d", function(d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                    })
                    .remove();
                    
                    // Stash the old positions for transition.
                nodes.forEach(function(d) {
                              d.x0 = d.x;
                              d.y0 = d.y;
                              });

                //var currDepth = 1;  // root level
                d3.select("#collapseAll").on('click', function() {
                    //console.log("collapse button!!");
                    //click(root);
                    root.children.forEach(collapseAll); 
                    //currDepth = 2;  // parent == root
                    console.log("Root: " + chk_root);
                    update(root);  
                })

                d3.select("#expandAll").on("click", function() { 
                    //console.log("expand button!!");
                    // Collapse everything first then expand everything
                    root.children.forEach(collapseAll);
                    update(root);
                    root.children.forEach(expandAll); 
                    update(root);
                    console.log("Root: " + chk_root);
                })

                d3.select("#expand_collapse").on("click", function(d) { 
                    //console.log("expand button!!");
                    root.children.forEach(expand_collapse);
                    console.log(d._children.length);
                    console.log("-------------------");
                    console.log(root.children.length);
                    console.log(d._children.depth);
                    //update(root);
                })

                /*
                d3.select("#collapseOne").on('click', function() {
                    //console.log("collapse button!!");
                    //if (currDepth > 2) {
                    //    root.children.forEach(collapseOne(d);
                    //}
                    //collapseOne(d.children); 
                    root.children.forEach(collapseOne());
                    update(jsonData);  
                })

                d3.select("#expandOne").on("click", function() { 
                    //console.log("expand button!!");
                    root.children.forEach(expandOne);
                    update(jsonData);
                })
                */
                
            }
            
            var chk_root = false;

            // Toggle children on click.
            function click(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                
                //centerNode(d);
                update(d);
            }
            
            // Collapse nodes
            function collapseAll(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children.forEach(collapseAll);
                    d.children = null;
                }
                chk_root = true;
                
                //update(d)
            }

            function expandAll(d) {
                if (d._children) { 
                    
                    d.children = d._children; 
                    d.children.forEach(expandAll);
                    d._children = null;
                }
                chk_root = false;
                //root.children.forEach(expandAll);

                //update(d);
            
            }
            
            function expand_collapse(d) {
                if (d._children) { 
                    //console.log(d._children.length);
                    //console.log("-------------------");
                    //console.log(root.children.length);
                    //console.log(d._children.depth);
                    d.children = d._children; 
                    d.children.forEach(click);
                    d._children = null;
                }
                else
                {
                    d.parent.children.forEach(click);
                    //d_.children = d.children;
                    //d.children.forEach(click);
                    d.children = null;
                }
                update(d);

            }
            
            function centerNode(source) {
                scale = zoomListener.scale();
                x = -source.y0;
                y = -source.x0;
                x = x * scale + width / 2;
                y = y * scale + height / 2;
                d3.select('g').transition()
                    .duration(duration)
                    .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
                zoomListener.scale(scale);
                zoomListener.translate([x, y]);
            }

            function setNodeSize(obj) {
                if (obj.hasOwnProperty("property") === null)
                {
                    NodeSize.min = 10;
                    NodeSize.max = 10;
                }
                else if(obj.hasOwnProperty("property")) 
                {
                    var temp = parseInt(obj.property.text);
                    var target_min = parseInt(NodeSize.min);
                    var target_max = parseInt(NodeSize.max);

                    if (!getFirstSize) {
                        NodeSize.min = temp;
                        NodeSize.max = temp;
                        getFirstSize = true;
                    } 
                    if (temp < NodeSize.min) {
                            NodeSize.min = obj.property.text;
                    }
                    if (temp > NodeSize.max) {
                            NodeSize.max = obj.property.text;
                    }                           
                } 
                if ("children" in obj) {
                    obj.children.forEach(function(child){
                        setNodeSize(child);
                    });
                }
            }

            function nodeSizeDivider() {
                //var targetExpNodeSize = 15;
                var divideBy = NodeSize.max / setNodeSize_max;
                var divideBy = 30;
                return parseInt(divideBy);
            }

            var svg = canvas.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

            var chk_NodeSize = false;
            if(!chk_NodeSize) {
                setNodeSize(jsonData);
                chk_NodeSize = true;
            }

            console.log("Min: " + NodeSize.min +" | "+ "Max: " + NodeSize.max);
                // start with all children collapsed
            //jsonData.children.forEach(expand_collapse);
            jsonData.children.forEach(expandAll);

            root = jsonData;
            root.x0 = height / 2;
            root.y0 = 0;
            update(root);
            centerNode(root);
        });
        }
        </script>

    </body>
</html>

<html>
	<head>
	<title> Collapsible Indented Tree </title>
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

        .node rect {
		  cursor: pointer;
		  fill: #fff;
		  fill-opacity: .5;
		  stroke: #3182bd;
		  stroke-width: 1.5px;
		}

		.node text {
		  font: 11px sans-serif;
		  pointer-events: none;
		}

		path.link {
		  fill: none;
		  stroke: lightgrey;
		  stroke-width: 1.5px;
		}

    </style>
	</head>

    <body>
    

    <h1 id="title"> Collapsible Indented Tree ver. 1.2 </h1>
        <div id="usage" style="display:none">
            <h4 > Usage: </h4>
            <ul>
                <li> Collapsing or expaning all nodes can be done in one time by pressing the each button. </li>
                <li> Expand two level button works for expanding two level of the tree. It shows ancestors briefly. </li>
                <li> Clicking each node or name expands or collapses the tree. </li>
                <li> Blue box means it has one or more number of child, and orange box indicates leaf node.</li>
                <li> Blue text in blue box indicates the parent node contains child node that is not unfolded. </li>
	        </ul>
        </div>
        <div>
        <input type="button" onclick="return toggleMe('usage')" value="Show Usage">
        </div>
        <div id="option">
            <div id="buttons">
            <button id="collapseAll">Collapse All</button>
            <button id="expandAll">Expand All</button>
            <button id="expand_2lv">Expand two levels</button>
            <br>
        </div>

    	<script type="text/javascript">
		
		//------- get input filename from the parser
		var filename = window.opener.fin;
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


        function gen_Tree(data)
        {
        	var filePath = "uploaded/" + data + ".json";

			var margin = {top: 30, right: 20, bottom: 30, left: 20};
			var width = $(document).width();
	        var height = $(document).height();
			//var width = 960 - margin.left - margin.right;
		    var barHeight = height / 45;
		    var barWidth = width / 2;

			var i = 0;
		    var duration = 500;
		    var root;

			var tree = d3.layout.tree()
			    .nodeSize([0, 20]);

			var diagonal = d3.svg.diagonal()
			    .projection(function(d) { return [d.y, d.x]; });

			var svg = d3.select("body").append("svg")
			    .attr("width", width + margin.left + margin.right)
			  	.append("g")
			    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			d3.json(filePath, function(error, jsonData) {
			  jsonData.x0 = 0;
			  jsonData.y0 = 0;
			  update(root = jsonData);
			});

			function update(source) {
				var nodes = tree.nodes(root);

				var height = Math.max(500, nodes.length * barHeight + margin.top + margin.bottom);

				d3.select("svg").transition()
				.duration(duration)
				.attr("height", height);

				d3.select(self.frameElement).transition()
				.duration(duration)
				.style("height", height + "px");

				// Compute the "layout".
				nodes.forEach(function(n, i) {
				n.x = i * barHeight;
				});

				// Update the nodes…
				var node = svg.selectAll("g.node")
				.data(nodes, function(d) { return d.id || (d.id = ++i); });

				var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
				.style("opacity", 1e-6);

				// Enter any new nodes at the parent's previous position.
				var nodeRect = nodeEnter.append("rect")
				.attr("y", -barHeight / 2)
				.attr("height", barHeight)
				.attr("width", barWidth)
				.style("fill", color)
				
				.on("click", click);

				var nodeText = nodeEnter.append("text")
				.attr("dy", 3.5)
				.attr("dx", 15)
				.text(function(d) { return d.name; });
				//.style("fill", text_color)
				

				// Mouse event functions
				nodeEnter
					.on("mouseover", function(d) {
						d3.select(this).select("rect").style("fill", function(d) { 
					    	return d._children ? "red" : "green"; })
			    		d3.select(this).select("text").style("font-size", 15);			    
					    
					})
					.on("mouseout", function(d) {
						d3.select(this).select("text").style("font-size", 11)
						d3.select(this).select("rect").style("fill", color)
						d3.select(this).select("text").text(function(d) { 
					    		return d.name })
					   
					});

				// Transition nodes to their new position.
				nodeEnter.transition()
				  .duration(duration)
				  .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
				  .style("opacity", 1);

				node.transition()
				.duration(duration)
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1)
				.select("rect").style("fill", color)
				
				node.transition()
				.duration(duration)
				.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
				.style("opacity", 1)
				.select("text").style("fill", text_color)

				// Transition exiting nodes to the parent's new position.
				node.exit().transition()
				  .duration(duration)
				  .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
				  .style("opacity", 1e-6)
				  .remove();

				// Update the links…
				var link = svg.selectAll("path.link")
				  .data(tree.links(nodes), function(d) { return d.target.id; });

				// Enter any new links at the parent's previous position.
				link.enter().insert("path", "g")
				  .attr("class", "link")
				  .attr("d", function(d) {
				    var o = {x: source.x0, y: source.y0};
				    return diagonal({source: o, target: o});
				  })
				.transition()
				  .duration(duration)
				  .attr("d", diagonal);

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

				d3.select("#collapseAll").on('click', function() {
	                root.children.forEach(collapseAll); 
	                update(root);  
	            })

	            d3.select("#expandAll").on("click", function() { 
				// Collapse everything first then expand everything
	                root.children.forEach(collapseAll);
	                update(root);
	                root.children.forEach(expandAll); 
	                update(root);
	                console.log("Root: " + chk_root);
	            })

	            d3.select("#expand_2lv").on("click", function(d) {
	            // Collapse everything first then expand everything
	                root.children.forEach(collapseAll);
	                update(root); 
	                root.children.forEach(expand_2lv);
	                //console.log(d._children.length);
	                //console.log("-------------------");
	                //console.log(root.children.length);
	                //console.log(d._children.depth);
	                update(root);
	            })

				// Stash the old positions for transition.
				nodes.forEach(function(d) {
					d.x0 = d.x;
					d.y0 = d.y;
					});
			}

			// Toggle children on click.
			function click(d) {
				if (d.children) {
				d._children = d.children;
				d.children = null;
				} else {
				d.children = d._children;
				d._children = null;
				}
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
	        }

	        function expandAll(d) {
	            if (d._children) { 
	                
	                d.children = d._children; 
	                d.children.forEach(expandAll);
	                d._children = null;
	            }
	            chk_root = false;
	        }
	        
	        function expand_2lv(d) {
	            if (d._children) { 
	                //console.log(d._children.length);
	                //console.log("-------------------");
	                //console.log(root.children.length);
	                //console.log(d._children.depth);
	                d.children = d._children; 
	                d.children.forEach(click);
	                d._children = null;
	            }
	            chk_root = false;
	        }

			function color(d) {
				return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
			}

			function text_color(d) {
				return d._children ? "blue" : "black";
			}
		}
    </script>


    </body>


</html>
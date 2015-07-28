<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title> Sequences sunburst </title>
    <script src="http://d3js.org/d3.v3.min.js"></script>
    <script type ="text/javascript" src ="js/jquery.js"> </script>
    <script type ="text/javascript" src ="js/expandCollapse.js"> </script>
    <script type="text/javascript" src="js/jkl-dumper.js" charset="Shift_JIS"></script>
    <script type="text/javascript" src="js/jkl-parsexml.js"></script>
    <script type="text/javascript" src="js/loadxmldoc.js"></script> 
    <script type="text/javascript" src="js/expandCollapse.js"></script>
    <script type="text/javascript" src="js/jquery.js"></script>  

    <link rel="stylesheet" type="text/css"
      href="https://fonts.googleapis.com/css?family=Open+Sans:400,600">
    <style type="text/css">
      
      #title {
        text-align: center;
      }
      #main {
        float: left;
        width: 750px;
      }
      #sequence {
        font-family: 'Open Sans', sans-serif;
        font-size: 12px;
        width: 600px;
        height: 70px;
      }
      #sequence text {
        font-weight: 900;
        fill: white;
      }
      #chart {
        position: relative;
      }
      #chart path {
        stroke: #fff;
      }
      #explanation {
        font-family: 'Open Sans', sans-serif;
        font-size: 12px;
        font-weight: 400;
        background-color: #fff;
        width: 960px;
        height: 700px;
        margin-top: 10px;
        position: absolute;
        top: 360px;
        left: 400px;
        width: 200px;
        text-align: center;
        font-size: 20px;
        color: #666;
        z-index: -1;
      }
      #percentage {
        font-size: 2.5em;
      }
    </style>
  </head>

  <body>
  <h1 id="title"> Sequences Sunburst -ver. 2.0 </h1>
        <div id="usage" style="display:none">
            <h4 > Usage: </h4>
            <ul>
                <li> blah blah blah..
            </ul>
        </div>

    <div id="main">
      <div id="sequence"></div>
      <div id="chart">
        <div id="explanation" style="visibility: hidden;">
          <g id="nodeName"></g>
          <span id="percentage"></span><br/>
          of total clade size.
        </div>
      </div>
    </div>
    <br><br>
    
    <script type="text/javascript" >
      //------- get input filename from the parser
    var filename = window.opener.fin;
        //console.log("FILENAME : " + filename);
    gen_Tree(filename);

    function gen_Tree(data) {
        
        var filePath = data;
        // Dimensions of sunburst.
        //var width = $(document).width();
        //var height = $(document).height();
        //console.log("width: " + window_width + " // " + "height : " + window_height)
        var width = 1000;
        var height = 800;
        var radius = Math.min(width, height) / 2;
        var color_map = {};
        var num_node = 0;

        // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
        var b = {
          w: 75, h: 30, s: 3, t: 10
        };

        // Total size of all segments; we set this later, after loading the data.
        var totalSize = 0; 

        var vis = d3.select("#chart").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .append("svg:g")
            .attr("id", "container")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        var partition = d3.layout.partition()
            .size([2 * Math.PI, radius * radius])
            .value(function(d) { 
              var size_int = parseInt(d.property.text);
              return size_int; });

        var arc = d3.svg.arc()
            .startAngle(function(d) { return d.x; })
            .endAngle(function(d) { return d.x + d.dx; })
            .innerRadius(function(d) { return Math.sqrt(d.y); })
            .outerRadius(function(d) { return Math.sqrt(d.y + d.dy); });

        // Use d3.text and d3.csv.parseRows so that we do not need to have a header
        // row, and can receive the csv as an array of arrays.

      d3.json(filePath, function(error, jsonData) {
          createVisualization(jsonData);
          var show_nodeName = d3.select("#nodeName");

        // Main function to draw and set up the visualization, once we have the data.
        function createVisualization(json) {

          // Basic setup of page elements.
          initializeBreadcrumbTrail();
          //drawLegend();
          //d3.select("#togglelegend").on("click", toggleLegend);

          // Bounding circle underneath the sunburst, to make it easier to detect
          // when the mouse leaves the parent g.
          vis.append("svg:circle")
              .attr("r", radius)
              .style("opacity", 0);

          // For efficiency, filter nodes to keep only those large enough to see.
          var nodes = partition.nodes(json)
              .filter(function(d) {
              return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
              });

          var path = vis.data([json]).selectAll("path")
              .data(nodes)
              .enter().append("svg:path")
              .attr("display", function(d) { return d.depth ? null : "none"; })
              .attr("d", arc)
              .attr("fill-rule", "evenodd")
              .text(function(d) { return d.name })
              .style("fill", function(d) {
                  var get_color = gen_RandomColor();
                  color_map[num_node] = { name: d.name, color: get_color };
                  num_node++;
                  return get_color;
              })
              .style("opacity", 0.5)
              .on("mouseover", mouseover);

          // Add the mouseleave handler to the bounding circle.
          d3.select("#container").on("mouseleave", mouseleave);
          
          // Get total size of the tree = value of root node from partition.
          totalSize = path.node().__data__.value;
         };

        // Fade all but the current sequence, and show it in the breadcrumb trail.
        function mouseover(d) {

          var percentage = (100 * d.value / totalSize).toPrecision(3);
          var percentageString = percentage + "%";
          if (percentage < 0.1) {
            percentageString = "< 0.1%";
          }
          var nodes = partition.nodes(jsonData)
              .filter(function(d) {
              return (d.dx > 0.005); // 0.005 radians = 0.29 degrees
              });
          var centerInfo = d3.select("#percentage")
              .text(percentageString);


              
          d3.select("#explanation")
              .style("visibility", "");

          var sequenceArray = getAncestors(d);
          updateBreadcrumbs(sequenceArray, percentageString);

          // Fade all the segments.
          d3.selectAll("path")
              .style("opacity", 0.3);

          // Then highlight only those that are an ancestor of the current segment.
          vis.selectAll("path")
              .filter(function(node) {
                        return (sequenceArray.indexOf(node) >= 0);
                      })
              .style("opacity", 1);
        }

        // Restore everything to full opacity when moving off the visualization.
        function mouseleave(d) {

          // Hide the breadcrumb trail
          d3.select("#trail")
              .style("visibility", "hidden");

          // Deactivate all segments during transition.
          d3.selectAll("path").on("mouseover", null);

          // Transition each segment to full opacity and then reactivate it.
          d3.selectAll("path")
              .transition()
              .duration(500)
              .style("opacity", 1)
              .each("end", function() {
                      d3.select(this).on("mouseover", mouseover);
                    });

          d3.select("#explanation")
              .style("visibility", "hidden");
        }

        // Given a node in a partition layout, return an array of all of its ancestor
        // nodes, highest first, but excluding the root.
        function getAncestors(node) {
          var path = [];
          var current = node;
          while (current.parent) {
            path.unshift(current);
            current = current.parent;
          }
          return path;
        }

        function initializeBreadcrumbTrail() {
          // Add the svg area.
          var trail = d3.select("#sequence").append("svg:svg")
              .attr("width", width)
              .attr("height", 50)
              .attr("id", "trail");
          // Add the label at the end, for the percentage.
          trail.append("svg:text")
            .attr("id", "endlabel")
            .style("fill", "#000");
        }

        // Generate a string that describes the points of a breadcrumb polygon.
        function breadcrumbPoints(d, i) {
          var points = [];
          points.push("0,0");
          points.push((b.w*1.7) + ",0");
          points.push((b.w*1.7) + b.t + "," + (b.h / 2));
          points.push( (b.w*1.7) + "," + b.h);
          points.push("0," + b.h);
          if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
            points.push(b.t + "," + (b.h /2 ));
          }
          return points.join(" ");
        }

        // Update the breadcrumb trail to show the current sequence and percentage.
        function updateBreadcrumbs(nodeArray, percentageString) {

          // Data join; key function combines name and depth (= position in sequence).
          var curr_name;
          var g = d3.select("#trail")
              .selectAll("g")
              .data(nodeArray, function(d) { 
                curr_name = d.name;
                var nodeName = curr_name + d.depth;
                console.log("curr_name :" + curr_name)
              //------ show node name on center circle 
                show_nodeName.text(curr_name);
                return curr_name; 
              });

          // Add breadcrumb and label for entering nodes.
          var entering = g.enter()
                          .append("svg:g");

          entering.append("svg:polygon")
              .attr("points", breadcrumbPoints)
              .style("fill", function(d) { 
                for (var i=0; i<num_node; i++)
                {
                  if (curr_name === color_map[i].name)
                  {
                    return color_map[i].color; 
                  }
                }
              });

              /// array text property
          entering.append("svg:text")
              .attr("x", ((b.w*1.7) + b.t) / 2)
              .attr("y", b.h / 2)
              .attr("dy", "0.35em")
              .attr("text-anchor", "middle")
              .attr("font-size", 10)
              .text(function(d) {
                return d.name });

          // Set position for entering and updating NODES.
          g.attr("transform", function(d, i) {
            return "translate(" + i * ( (b.w*1.7) + b.s) + ", 0)";
          });

          // Remove exiting nodes.
          g.exit().remove();

          // Now move and update the percentage at the end.
          d3.select("#trail").select("#endlabel")
              .attr("x", (nodeArray.length + 0.5) * ((b.w*1.65) + b.s))
              .attr("y", b.h / 2)
              .attr("dy", "0.35em")
              .attr("text-anchor", "middle")
              .text(percentageString)
              .style("stroke", "black")

          // Make the breadcrumb trail visible, if it's hidden.
          d3.select("#trail")
              .style("visibility", "");

        }

        function gen_RandomColor() {
          return '#'+Math.floor(Math.random()*16777215).toString(16);
        }
      })
    }
    </script>
    
  </body>
</html>
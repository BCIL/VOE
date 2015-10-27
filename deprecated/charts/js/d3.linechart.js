function D3LineChart(options) {
	if (!(this instanceof D3LineChart)) throw new TypeError("D3LineChart constructor cannot be called as a function.");
	var defaultOptions = {
		container: "#linechart",
		spacing: 0.5,
		verticalText: null,
		interpolate: "linear",
		
		tooltipOnMouseOver:	function(d, element, base) {
			begin=0;
			end=0;
			chr="";
			window.tooltip_d = d;
			window.tooltip_ele = element;
			window.tooltip_base = base;
			var xPosition = parseInt($(element).attr('cx'))-base.tooltipWidth/2+base.options.margin.left+3;
			var yPosition = base.y.range()[0]-parseInt($(element).attr('cy'))+base.options.margin.bottom+15;
			d3.select(base.options.container+" .tooltip")
				.style("left", xPosition + "px")
				.style("bottom", yPosition + "px")	
				.html(base.options.tooltipText(d, element));
			$(base.options.container+" .tooltip").show();
			$(element).parent().find("path").css("opacity", 1);

			var a = document.getElementById("chr_selector");
			if (a != null){
				var chr_chk = a.options[a.selectedIndex].value;
				if(chr_chk != 'null') {
					var chr_doc = document.getElementById("chr_selector")
					chr = chr_doc.options[chr_doc.selectedIndex].text;
					
					begin = prev_pos;		// caculated at ToolTipText section.
					end = curr_pos;
					$('#UCSClink').empty();
					var w=$(document).width(), h=20;

					if (chr.length < 3) {
						$('#UCSClink').append("<button type='button' class='btn btn-success btn-md' id=ucsc>Browse UCSC ( chr"+chr+": "+begin+" - "+end+" )</button>");
					}
					else {
						$('#UCSClink').append("<button type='button' class='btn btn-success btn-md' id=ucsc>Browse UCSC ( "+chr+": "+begin+" - "+end+" )</button>");
					}

						//http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position="+chr+"%3A"+begin+"-"+end+"
					//$('#UCSClink').append("<span style='margin-left:5%'><a href='http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position="+chr+"%3A"+begin+"-"+end+"' target='_blank'><font id='ucsc'>Browse UCSC for "+chr+" information ("+begin+"-"+end+")</font></a><span>");
				
					
					var e = document.getElementById('ucsc');
					var t = 6;
					var n = 0;
					var c = ['red', "white"];
					var i = window.setInterval(function() {
						if (e.style.color != c[0]) {
							e.style.color = c[0] 
							n++;
						}
						else {
							e.style.color = c[1]
							n++;
						}
						if (n == t) { window.clearInterval(i) };
					},800);
				
					document.getElementById("ucsc").onclick = function() {
						if (chr.length < 3) {
							window.open("http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position=chr"+chr+"%3A"+begin+"-"+end,'_target');
						}
						else {
							window.open("http://genome.ucsc.edu/cgi-bin/hgTracks?db=hg19&position="+chr+"%3A"+begin+"-"+end,'_target');
						}
					}
				}
			}
		},
		tooltipOnMouseOut: function(d, element, base) {
			$(base.options.container+" .tooltip").hide();
			$(element).parent().find("path").css("opacity", 0.5);
		},
		renderTableMouseClick: function (d, element, base) {
			var isDisabled = $("#update_btn").attr("disabled");
			if(!isDisabled) {
				$("#genTable_indicator").show();
				setTimeout(function(){
					$("#genTable_indicator").hide();
				}, 1500)
				renderPositionTable(chr,begin,end);
			}
		}
	}	
	if (typeof options == 'object') this.options = $.extend(defaultOptions, options);
	else this.options = defaultOptions;
    D3Core.call(this, this.options);
}

inheritPrototype(D3LineChart, D3Core);

D3LineChart.prototype.prepareItem = function() {
		this.item = this.category.selectAll("path")
			.data(function(d) { return new Array(d); });
		this.circle = this.category.selectAll(".circle")
    		.data(function(d) { return d.values; })
}

D3LineChart.prototype.itemEnter = function() {
	var base = this;
	base.item
		.enter()
		.append("path")
		.attr("clip-path", "url(#clip)")
		.attr("class", "line")
		.style("stroke", function(d) { return base.color(d.key); })
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })
		.attr('d',  function(d) { return base.lineLayout(d.values.map(function(element) { return {x: element.x, y: base.y.domain()[0] }; })); })
		.transition().duration(1000)
		.attr("d", function(d) { return base.lineLayout(d.values); });
	
	base.circle
    	.enter().append("circle")
    	.attr("class", "circle")
    	.attr("r", 5)
    	.attr("original-x", function(d) { return d.x; })
    	.attr("original-y", function(d) { return d.y; })
    	.style("fill", function(d) { return base.color($(this).parent().attr("original-key")); })
		.attr("cx", function(d) { return base.x(d.x); })
		.attr("cy", base.y(base.y.domain()[0]))  
		.transition().duration(900)
    	.attr("cy", function(d) { return base.y(d.y); });
}

D3LineChart.prototype.itemUpdate = function() {
	var base = this;
	base.item
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })	
		.transition().duration(800)
		.attr('d',  function(d) { return base.lineLayout(d.values); });
	
	base.circle
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })
		.transition().duration(800)
		.attr("cx", function(d) { return base.x(d.x); })
		.attr("cy", function(d) { return base.y(d.y); });
}

D3LineChart.prototype.itemExit = function() {
	var base = this;
	base.item.exit()
	    .transition().duration(300).ease("cubic-in-out")
	    .attr("y", base.y(base.y.domain()[0]))  
	    .remove();
	
	base.circle.exit()
	    .transition().duration(300).ease("cubic-in-out")
	    .attr("cy", base.y(base.y.domain()[0]))  
	    .remove();
}

D3LineChart.prototype.tooltipRender = function() {
	var base = this;
	base.circle.on("mouseover", function(d) { base.options.tooltipOnMouseOver(d, this, base); });
	base.circle.on("mouseout", function(d) { base.options.tooltipOnMouseOut(d, this, base); });
	base.circle.on("click", function(d) { base.options.renderTableMouseClick(d, this, base); });
}

D3LineChart.prototype.showVerticalText = function() {
	this.svg.append("text")
    	.attr("transform", "rotate(-90)")
    	.attr("y", 6)
    	.attr("dy", ".71em")
    	.style("text-anchor", "end")
    	.text(this.options.verticalText);
}

D3LineChart.prototype.render = function() {
	D3Core.prototype.render.apply(this);
	if (this.options.verticalText!=null) this.showVerticalText();
}

D3LineChart.prototype.prepare = function() {
	D3Core.prototype.prepare.apply(this);
	var base = this;
	this.lineLayout = d3.svg.line()
		.interpolate(this.options.interpolate)
		.x(function(d) { return base.x(d.x); })
		.y(function(d) { return base.y(d.y); });
}
function D3LineChart(options) {
	if (!(this instanceof D3LineChart)) throw new TypeError("D3LineChart constructor cannot be called as a function.");
	var defaultOptions = {
		container: "#linechart",
		spacing: 0.5,
		verticalText: null,
		interpolate: "linear",
		
		tooltipOnMouseOver:	function(d, element, base) {
			tooltip_div.transition()        
                .duration(200)      
                .style("opacity", .9);      
            tooltip_div.html(base.options.tooltipText(d, element))  
                .style("left", (d3.event.pageX) - 80 + "px")     
                .style("top", (d3.event.pageY) - 40 + "px");    
			begin=0;
			end=0;
			chr="";
			
		},
		tooltipOnMouseOut: function(d, element, base) {
			tooltip_div.transition()        
                .duration(400)      
                .style("opacity", 0);
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
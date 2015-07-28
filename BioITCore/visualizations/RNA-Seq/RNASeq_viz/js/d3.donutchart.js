function D3DonutChart(options) {
	if (!(this instanceof D3DonutChart)) throw new TypeError("D3DonutChart constructor cannot be called as a function.");
    var defaultOptions = {
		container: "#donut",
		data: [ { key: "category 1", value: 55 }, { key: "category 2", value: 25 }, { key: "category 3", value: 20 } ],
		innerRatio: 0.8,
		outerRatio: 0.4,
		showInnerCircle: false,
		textCenter: function(data) { return "All data"; },
		textCenterDY: "0.5em",
		textPercentage: function(d) { return (((d.endAngle - d.startAngle) / (2 * Math.PI)) * 100).toFixed(2)+"% ("+d.value+")"; },
		tooltipOnMouseOver: function(d, element, base) { 		    
			var coordinates = base.arc.centroid(d);			
			var xPosition = coordinates[0]+base.width/2-base.tooltipWidth/2;
			var yPosition = base.height/2-coordinates[1]+base.options.margin.bottom+50;
			d3.select(base.options.container+" .tooltip")
				.style("left", xPosition + "px")
				.style("bottom", yPosition + "px")	
				.html(base.options.tooltipText(d, element));
			$(base.options.container+" .tooltip").show();
		},
		tooltipOnMouseOut: function(d, element, base) {
			$(base.options.container+" .tooltip").hide();
		},
		tooltipText: function(d, element) { return "<p>Tooltip<br />value: "+$(element).attr("original-value")+"<p>"; }
	}	
	if (typeof options == 'object') this.options = $.extend(defaultOptions, options);
	else this.options = defaultOptions;
    this.options.showRuler = false;
    D3Core.call(this, this.options);
}

inheritPrototype(D3DonutChart, D3Core);

D3DonutChart.prototype.prepareCategory = function() { 
	var base = this;
	this.category = this.svg.selectAll(".category")
		.data(base.pie(base.dataset));

}

D3DonutChart.prototype.prepareItem = function() {
	var base = this;
	this.item = this.category.selectAll("path")
		.data(function(d) { return new Array(d); });
	
	/*this.text = this.textCategory.selectAll("text")
		.data(function(d) { return new Array(d); });*/
	
	this.text = this.svg.append("g").attr("class", "textGroup").selectAll("text").data(base.pie(base.dataset));
}

D3DonutChart.prototype.itemEnter = function() {
	var base = this;
	base.item
		.enter()
		.append("path")
		.attr("original-value", function(d) { return d.data.value; })		
	    .attr("fill", function(d, i) { return base.color(d.data.key); })			
	    .transition().delay(function(d, i) { return i *250; })
	    .duration(250)
	    .attrTween('d', function(d) {
		   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
		   return function(t) {
		       d.endAngle = i(t);
		     return base.arc(d);
		   }
		})
	    .ease("cubic-in-out")
	    .each(function(d) { this._current = d; });
	
	if (base.options.showInnerCircle) {
		base.circle = base.svg
				.append("circle")
				.attr("class", "circle")
				.attr("r", base.radius * base.options.outerRatio);
	}
	
	base.text.enter().append("text")
	    .attr("transform", function(d) { return "translate(" + base.arc.centroid(d) + ")"; })
	    .attr("text-anchor", "middle")
	    .text(function(d) { return base.options.textPercentage(d); })
	    .style("pointer-events", "none");
}

D3DonutChart.prototype.itemUpdate = function() {
	var base = this;
	this.svg.selectAll(".textGroup").remove();
	this.text = this.svg.append("g").attr("class", "textGroup").selectAll("text").data(base.pie(base.dataset));
	
	base.item
		.attr("original-value", function(d) { return d.data.value; })	
		.transition().duration(250).ease("cubic-in-out")
	    .attrTween('d', function(d) {
		   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
		   return function(t) {
		       d.endAngle = i(t);
		     return base.arc(d);
		   }
		})
	    .each(function(d) { this._current = d; });
	
	if (base.options.showInnerCircle) {
		base.circle
			.transition().duration(250).ease("cubic-in-out")
			.attr("r", base.radius * base.options.outerRatio);
	}
	

	base.text.enter().append("text")
	    .attr("transform", function(d) { return "translate(" + base.arc.centroid(d) + ")"; })
	    .attr("text-anchor", "middle")
	    .text(function(d) { return base.options.textPercentage(d); })
	    .style("pointer-events", "none");
}

D3DonutChart.prototype.itemExit = function() { 
	var base = this;
	base.item
		.exit()
		.transition().duration(250).ease("cubic-in-out")
	    .attrTween('d', function(d) {
		   var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
		   return function(t) {
		       d.endAngle = 0;
		     return base.arc(d);
		   }
		});
}

D3DonutChart.prototype.prepare = function() {
	D3Core.prototype.prepare.apply(this);
	this.radius = Math.min(this.width, this.height) / 2;
    this.formats = { percent: d3.format('#'), integer: d3.format('f') };
    
    this.arc = d3.svg.arc()
		.innerRadius(this.radius*this.options.innerRatio)
		.outerRadius(this.radius*this.options.outerRatio);
	
	this.pie = d3.layout.pie().sort(null)
		.value(function(d) {
			return d.value;
		});
	
	this.svg.attr("transform", "translate(" + this.width/2 + "," + this.height/2 + ")");
}

D3DonutChart.prototype.resize = function() {
	var base = this;
	this.width = $(this.options.container).width() - this.margin.left - this.margin.right;
    this.height = $(this.options.container).height() - this.margin.top - this.margin.bottom;
    d3.select(this.options.container).select("svg").style('width', (this.width+this.margin.left+this.margin.right) + 'px').style('height', (this.height+this.margin.bottom+this.margin.top) + 'px');
    this.svg.transition().duration(250).ease("cubic-in-out").attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");
	this.radius = Math.min(this.width, this.height) / 2;
    this.arc = d3.svg.arc()
		.innerRadius(this.radius*this.options.innerRatio)
		.outerRadius(this.radius*this.options.outerRatio);
    this.item.transition().duration(250).attr("d", this.arc);
    this.text.attr("transform", function(d) {
    	return "translate(" + base.arc.centroid(d) + ")";
    });
}

D3DonutChart.prototype.prepareScales = function() { 
	var base = this;
	this.color = d3.scale.ordinal().range(this.options.colors);
	this.color.domain(base.dataset.map(function(d) { return d.key; }));	
}

D3DonutChart.prototype.axesUpdate = function() {
	
}


D3DonutChart.prototype.tableRender = function() { 

}



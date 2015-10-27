function D3StackedBar(options) {
	if (!(this instanceof D3StackedBar)) throw new TypeError("D3StackedBar constructor cannot be called as a function.");
    var defaultOptions = {
		container: "#stackedbar",
		spacing: 0.2,
		verticalText: null,
		tooltipOnMouseOver: function(d, element, base) { 		    
			var xPosition = parseInt($(element).attr("x")) + parseInt($(element).attr("width"))/2-base.tooltipWidth/2+base.options.margin.left;
			var yPosition = base.y.range()[0]-parseInt($(element).attr("y"))+base.options.margin.bottom+5;
			d3.select(base.options.container+" .tooltip")
				.style("left", xPosition + "px")
				.style("bottom", yPosition + "px")	
				.html(base.options.tooltipText(d, element));
			$(base.options.container+" .tooltip").show();
		},
		tooltipOnMouseOut: function(d, element, base) {
			$(base.options.container+" .tooltip").hide();
		}
	}	
	if (typeof options == 'object') this.options = $.extend(defaultOptions, options);
	else this.options = defaultOptions;
    D3Core.call(this, this.options);
}

inheritPrototype(D3StackedBar, D3Core);

D3StackedBar.prototype.prepareItem = function() {
	this.item = this.category.selectAll("rect")
		.data(function(d) { return d.values; });
}

D3StackedBar.prototype.itemEnter = function() {
	var base = this;
	base.item
		.enter().append("rect")
		.attr("x", function(d) { return base.x(d.x); })
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })
		.attr("y", function(d) { return base.height; })   
		.attr("width", base.x.rangeBand())
		.attr("height", 0)
		.attr("class", "rect")
		.transition().delay(300).duration(500).ease("cubic-in-out")
		.attr("height", function(d) { return base.y(0)-base.y(d.size); })
		.attr("y", function(d) { return base.y(d.y0); });
}

D3StackedBar.prototype.itemUpdate = function() {
	var base = this;
	base.item
		.attr("original-x", function(d) { return d.x; })
		.attr("original-y", function(d) { return d.y; })	
		.transition().duration(500).ease("cubic-in-out")
		.attr("x", function(d) { return base.x(d.x); })
		.attr("y", function(d) { return base.y(d.y0); })
		.attr("height", function(d) { return base.y(0)-base.y(d.size); })
		.attr("width", base.x.rangeBand());
}

D3StackedBar.prototype.itemExit = function() {
	var base = this;
	base.item.exit()
	    .transition().duration(300).ease("cubic-in-out")
	    .attr("height", 0)
	    .attr("y", function(d) { return base.height; })  
	    .remove();
}

D3StackedBar.prototype.showVerticalText = function() {
	this.svg.append("text")
		.attr("transform", "rotate(-90)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text(this.options.verticalText);
}

D3StackedBar.prototype.render = function() {
	D3Core.prototype.render.apply(this);
	if (this.options.verticalText!=null) this.showVerticalText();
}

D3StackedBar.prototype.resize = function() {
	this.width = $(this.options.container).width() - this.margin.left - this.margin.right;
    this.height = $(this.options.container).height() - this.margin.top - this.margin.bottom;
    d3.select(this.options.container).select("svg").style('width', (this.width+this.margin.left+this.margin.right) + 'px').style('height', (this.height+this.margin.bottom+this.margin.top) + 'px');
    this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], this.options.spacing);
    this.y = d3.scale.linear().range([this.height, 0]);
	this.prepareScales();
    this.itemUpdate();
    this.axesUpdate();
}

D3StackedBar.prototype.prepareScales = function() {
	var base = this;
	
	this.x = d3.scale.ordinal().rangeRoundBands([0, this.width], this.options.spacing);
    this.y = d3.scale.linear().range([this.height, 0]);
    this.color = d3.scale.ordinal().range(this.options.colors);
    if (this.options.showRuler) this.prepareAxes();
	
    this.barStack = function(data) {
        var i = base.x.domain().length;
        while (i--) {
            var posBase = 0, negBase = 0;
            data.forEach(function(category) {
                var item = category.values[i]
                item.size = Math.abs(item.y);
                if (item.y < 0) {
                    item.y0 = negBase;
                    negBase -= item.size;
                } else {
                    posBase += item.size;
                    item.y0 = posBase;
                }
            });
        }
        data.extent = d3.extent(d3.merge(d3.merge(data.map(function(category) {
            return category.values.map(function(item) {
                return [item.y0, item.y0 - item.size]
            })
        }))));
        return data;
    };
    
	base.x.domain(base.dataset[0].values.map(function(d) { return d.x; }));
	base.categories = base.barStack(base.dataset);
	base.color.domain(base.dataset.map(function(item) { return item.key; }));
	base.y.domain(base.dataset.extent);
}


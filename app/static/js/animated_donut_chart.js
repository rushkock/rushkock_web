function animated_donut_chart(percentage, chart_class, skill){
var duration = 1500,
    transition = 200,
    percent = percentage;
var width = 150;
var height = 150;
var thickness = 12;
var anglesRange = 1 * Math.PI
var dataset = {
            lower: calcPercent(0),
            upper: calcPercent(percent)
        },
        radius = Math.min(width, height) / 2.5;
var colors = ["#fb4f5d", "#efefef"]
var arc = d3.arc()
.innerRadius(radius - thickness)
.outerRadius(radius);

var pie = d3.pie()
.value(function(d) { return d; })
.sort(null)
.startAngle(anglesRange * -1)
    	.endAngle( anglesRange);

var svg = d3.select(chart_class).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2.5  + ")");

var path = svg.selectAll("path")
                .data(pie(dataset.lower))
                .enter().append("path")
                .attr('fill', '#efefef')
                .attr("d", arc)
                .each(function (d) {
                    this._current = d;
                });
var text = svg.append("text")
        .attr("text-anchor", "middle")
        .style("font-family", "'apercu',sans-serif")
        .style("fill", "black")
        .style('font-size', '4em')
        .attr("dy", ".3em");

svg.append("text")
   .attr("text-anchor", "middle")
   .style("font-family", "'apercu',sans-serif")
   .style("fill", "black")
   .style('font-size', '1.2em')
   .attr("dy", "1em")
   .attr("dx", "1.2em")
   .text("/5");

var skill = svg.append("text")
                .attr("text-anchor", "middle")
                .style('font-size', '1.5em')
                .style("fill", "black")
                .attr("dy", "3.2em")
                .text(skill);

var progress = 0;
 format = d3.format("0");
var timeout = setTimeout(function () {
    clearTimeout(timeout);
    path = path.data(pie(dataset.upper))
                .attr('fill', (d,i) => {
                return i == 0 ? (d.value > 1 ? '#fb4f5d' : '#00FF00') : '#fb4f5d80';
                });
    path.transition().duration(duration).attrTween("d", function (a) {
        var i = d3.interpolate(this._current, a);
        var i2 = d3.interpolateNumber(progress, percent)
         console.log(i2);
        this._current = i(0);
        return function (t) {
            text.text( Math.round(i2(t)));
            return arc(i(t));
        };
    });
}, 200);

function calcPercent(percent) {
    return [percent, 5 - percent];
};
}

// Ruchella Kock
// 12460796
// Description:
// This scripts makes all the visualizations for the visualization page.
// It also contains general function used in multiple scripts.

window.onload = function()
{
  var requests = [d3.json('../static/data/suicides/json/world_countries.json'),
                  d3.json('../static/data/suicides/json/suicide_pooled.json'),
                  d3.json('../static/data/suicides/json/suicide.json'),
                  d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json')];

  Promise.all(requests).then(function(response) {
     makeMap(response);
     allData = processDate(response[1], 1998);
     data = processDate(response[2], 1998);
     filterSunburst(allData, data, '10');
     makeBar(response);
  }).catch(function(e) {
      throw(e);
  });
};

// this function returns the data for the chosen year
function processDate (data, year) {
  var date = [];
  var yearF = parseFloat(year);
  for (var i in data){
    if (data[i].year === yearF) {
      date.push(data[i]);
    }
  }
  return date;
}

// this functions gets the states that the mouse is hovering over
function getSelectedCountry (d, pooledData, country, property, property2) {
  var selectedState = '';
  var element = '';
  if (country === 'country') {
    element = d[property][property2];
  } else {
    element = d[property];
  }

  // note intentional use of == and not ===
  pooledData.forEach(function (e) { if (e[country] == element) { selectedState = e; }});
  return selectedState;
}

function sorting (data) {
  var sortedData = data.sort(function (a, b) { return b.suicides_per_10000 - a.suicides_per_10000; });
  return sortedData;
}

// color function for barchart and map
function getColor (data) {
  var min = d3.min(data, function (d) { return d.suicides_per_10000; });
  var max = d3.max(data, function (d) { return d.suicides_per_10000; });
  var seventh = (max - min) / 7;

  var color = d3.scaleLinear()
                .domain([min, min + seventh, min + seventh * 2, min + seventh * 3,
                         min + seventh * 4, min + seventh * 5, min + seventh * 6, max])
                .range(['#d0d1e6', '#a6bddb', '#74a9cf', '#3690c0', '#0570b0',
                        '#045a8d', '#023858']);
  return color;
}

// this functions makes the legends and writes the text
// source : https://www.visualcinnamon.com/2016/05/smooth-color-legend-d3-svg-gradient.html
function makeLegend (select, color, min, max, ticks, start, stop) {
  var width = 400;
  var height = 200;
  var defs = d3.select(select)
               .append('defs');

  var svg = defs.append('svg')
                .attr('width', width)
                .attr('height', height)
                .append('g')
                .attr('class', 'legend');


  var linearGradient = svg.append('linearGradient')
                          .attr('id', 'linear-gradient' + stop);

  // chosen horizontal gradient
  linearGradient.attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '0%');

  // set the color for the start
  linearGradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', start);

  // set the color for the end
  linearGradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', stop);

  // draw the rectangle and fill with gradient
  svg.append('rect')
     .attr('width', 300)
     .attr('x', 30)
     .attr('y', 15)
     .attr('height', 20)
     .style('fill', 'url(#linear-gradient' + stop + ')');

  //Set scale for x-axis
  var xScale = d3.scaleLinear()
  	             .range([0, 300])
  	             .domain([Math.round(min), Math.round(max)]);

  // make xAxis
  var xAxis = d3.axisBottom(xScale)
                .ticks(ticks);

  svg.append('g')
     .attr('class', 'x axis')
     .attr('transform', 'translate('+ 30 + ',' + 35 + ')')
     .call(xAxis);
}

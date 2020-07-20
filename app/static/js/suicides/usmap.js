// Ruchella kock
// 12460796
// Description: this script makes two maps of the united states with two different
// data sets. Next to the map there is some data information
// Realized with help from:
// https://bl.ocks.org/mbostock/4090848
// http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f
// https://github.com/rushkock/dataprocessing/tree/master/homework/week_6

window.onload = function()
{
  var requests = [d3.json('../static/data/suicides/json/us_states.json'),
                  d3.json('../static/data/suicides/json/suicides_us.json'),
                  d3.json('../static/data/suicides/json/depression.json'),
                  d3.json('https://gist.githubusercontent.com/mbostock/4348373/raw/85f18ac90409caa5529b32156aa6e71cf985263f/flare.json')];

  Promise.all(requests).then(function (response) {

     var states = preprocessing(response, 1);
     var range = ['#f1eef6', '#d0d1e6', '#74a9cf', '#2b8cbe', '#045a8d'];
     makeUSMap('.USmap', '.boxMap', '.subBoxMap', range, response, states,
               '#f1eef6', '#045a8d');

     states = preprocessing(response, 2);
     range = ['#ffeda0', '#fed976', '#fd8d3c', '#fc4e2a', '#7f0000'];
     makeUSMap('.USmap2', '.boxMap2', '.subBoxMap2', range, response, states,
               '#ffeda0', '#7f0000');

  }).catch(function (e) {
      throw(e);
  });
};

function makeUSMap (select, legendPos, subBox, range, response, states, start, stop) {
  // this functions makes a svg, draws a map of united states

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
                width = 960 - margin.left - margin.right,
                height = 600 - margin.top - margin.bottom;

  var svg = d3.select(select)
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g');

  var usPath = d3.geoPath();

  var max = d3.max(states, function (d) { return d.percentage;} );
  var min = d3.min(states, function (d) { return d.percentage;} );
  var fifth = (max - min) / 5;

  //http://colorbrewer2.org/#type=sequential&scheme=PuBu&n=5
  var colorUS = d3.scaleLinear()
                  .domain([min, min + fifth, min + fifth * 2, min + fifth * 3, max])
                  .range(range);

  var map = svg.append('g')
               .attr('class', 'states')
               .selectAll('path')
               .data(topojson.feature(response[0], response[0].objects.states).features)
               .enter()
               .append('path')
               .attr('d', usPath);

    // style and colors
    map.attr('fill', function (d, i) {
            foundColor = '';
            states.forEach(function (t) { if (t.FIPS == d.id) {
                            foundColor = colorUS(t.percentage); }
            });
           return foundColor;
        })
       .style('stroke', 'white')
       .style('stroke-width', 1.5)
       .style('opacity', 0.8);

    //on mouseover show data info in the box
    map.on('mouseover', function (d) {
            selectedState = getSelectedCountry(d, states, 'FIPS', 'id', '');
            if (subBox === '.subBoxMap') {
              subBoxMap(selectedState, '');
            } else {
              subBoxMap(selectedState, '2');
            }

            d3.select(subBox)
              .selectAll('*')
              .style('visibility', 'visible');
        })
       .on('mouseout', function (d) {
           d3.select(subBox)
             .selectAll('*')
             .style('visibility', 'hidden');
          });

      makeLegend(legendPos, colorUS, min, max, 6, start, stop);
}

// this function writes the text in the subBox (small box with borders on the right of the page)
function subBoxMap (data, value) {
    if (data != '') {
    d3.select('.subBoxMapCountry' + value)
      .select('h1')
      .text(data.state);
    d3.select('.subBoxMapSuicidesPercentage' + value)
      .text(data.percentage + ' %');
    d3.select('.subBoxMapUpper' + value)
      .text(data.lower_CI + '%');
    d3.select('.subBoxMapLower' + value)
      .text(data.upper_CI + '%');
   }
}

// this function processes the whole data set (states)
function preprocessing (response, number) {
  var states = [];
  for (var i in response[number]) {
    if (response[number][i].state === response[number][i].substate) {
      states.push(response[number][i]); }
  }
  return states;
}

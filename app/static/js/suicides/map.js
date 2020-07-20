// Ruchella kock
// 12460796
// Description: this script makes a map of the world
// Realized with help from:
// http://bl.ocks.org/micahstubbs/8e15870eb432a21f0bc4d3d527b2d14f

// this function makes the world map
function makeMap (response) {
  // pooledData is the data set where all values for one year is summed
  // (No male/ female or age groups. Just one value for 1998 for each country)
  // filterData is the data set where all values are still present for one year
  // (With male/ female or age groups, 12 values for 1998 for each country )
  var pooledData = processDate(response[1], 1998);
  var filterData = processDate(response[2], 1998);

  var tooltip = d3.select('.worldMap')
                  .append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);

  // make svg
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

  var svg = d3.select('.worldMap')
              .append('svg')
              .attr('width', width)
              .attr('height', height)
              .append('g')
              .attr('class', 'map');

  var color = getColor(pooledData);
  var min = d3.min(pooledData, function (d) { return d.suicides_per_10000; });

  var year = makeSlider(response, color, tooltip);
  onClick(response, pooledData, filterData, color, tooltip, year);

  var projection = d3.geoMercator()
                     .scale(130)
                     .translate([width / 2, height / 1.5]);

  path = d3.geoPath()
           .projection(projection);

  // make the map
  svg.append('g')
     .attr('class', 'countries')
     .selectAll('path')
     .data(response[0].features)
     .enter()
     .append('path')
     .attr('d', path)
     .style('opacity', 0.8)
     .style('stroke', 'white')
     .style('stroke-width', 0.3);

  mouseOver(response, pooledData, color, tooltip);
  makeLegend('.boxMap', color, min, 60, 15, '#f1eef6', '#023858');
  noData ();
}

// this function updates the data of the map, changes the colors and the tooltip
function update (response, newData, filtered, color, tooltip) {
  var data = [];
  if (value === 'all') {
    data = newData;
  } else {
    data = filtered;
  }

  mouseOver(response, data, color, tooltip);
}

// this function fills the color and adds a tooltip on mouseover
function mouseOver (response, data, color, tooltip) {
  var countries = d3.select('.countries')
                    .selectAll('path')
                    .data(response[0].features)
                    .style('fill', function (d) {
                            var foundColor = '';
                            data.forEach(function (t) {
                              if (t.country === d.properties.name) {
                                foundColor = color(t.suicides_per_10000); }
                              });
                            return foundColor;
                    });

    countries.on('mouseover', function (d) {
              tooltip.transition()
                     .duration(10)
                     .style('opacity', 1)
                     .style('stroke', 'black')
                     .style('stroke-width', 5);

              // get the country the user is hovering over
              var selectedCountry = getSelectedCountry(d, data, 'country', 'properties', 'name');
              subBoxMap(selectedCountry);
              if (selectedCountry === '') {
                  tooltip.html('<div id="thumbnail"><span> No Data')
                         .style('left', (d3.event.pageX) + 'px')
                         .style('top', (d3.event.pageY) + 'px');
              } else {
                d3.select('.subBoxMap')
                  .selectAll('*')
                  .style('visibility', 'visible');

                tooltip.html('<div id="thumbnail"><span> Country: ' +
                             selectedCountry.country + '<br> Suicides per 10000: ' +
                             Math.round(selectedCountry.suicides_per_10000))
                       .style('left', (d3.event.pageX) + 'px')
                       .style('top', (d3.event.pageY)  + 'px');
                }

                d3.select(this)
                  .style('opacity', 1)
                  .style('stroke', 'white')
                  .style('stroke-width', 3);
     })
    .on('mouseout', function (d) {
        d3.select('.subBoxMap')
          .selectAll('*')
          .style('visibility', 'hidden');

        tooltip.transition()
               .duration(500)
               .style('stroke', 'white')
               .style('opacity', 0);

        d3.select(this)
          .style('opacity', 0.8)
          .style('stroke', 'white')
          .style('stroke-width', 0.3);
    });
}

// this function makes the slider for the years and it also returns which year is chosen
// source: https://bl.ocks.org/johnwalley/e1d256b81e51da68f7feb632a53c3518
function makeSlider (data, color, tooltip) {
  var dataTime = d3.range(0, 30).map(function (d) {
    return new Date(1987 + d, 1, 1);
  });

  var sliderTime = d3.sliderBottom()
                     .min(d3.min(dataTime))
                     .max(d3.max(dataTime))
                     .step(1000 * 60 * 60 * 24 * 365)
                     .width(900)
                     .tickFormat(d3.timeFormat('%Y'))
                     .tickValues(dataTime)
                     .default(new Date(1998, 10, 3))
                     .on('onchange', function(val){
                       d3.select('p#value-time').text(d3.timeFormat('%Y')(val));
                       var year = d3.timeFormat('%Y')(sliderTime.value());

                       // get the data for the correct year and call all the
                       // functions to make the visualizations for the right year
                       var newData = processDate(data[1], year);
                       var filteredData = processDate(data[2], year);
                       var ageFiltered = filter(data, newData, filteredData, color, tooltip);

                       filterSunburst(newData, filteredData, sunburstValue, year);
                       update(data, newData, ageFiltered, color, tooltip);
                       updateBar(newData, color);
                       onClick(data, newData, filteredData, color, tooltip);
                      });

  var gTime = d3.select('div#slider-time')
                .append('svg')
                .attr('width', 1100)
                .attr('height', 100)
                .append('g')
                .attr('transform', 'translate(30, 30)');

  gTime.call(sliderTime);
  year = d3.timeFormat('%Y')(sliderTime.value());
  d3.select('p#value-time').text(year);
  return year;
}

// this function writes the text in the subBox (small box with borders on the right of the page)
function subBoxMap (data) {
    var box = d3.select('.subBoxMap');
    if (data != '') {
    d3.select('.subBoxMapCountry')
      .select('h1')
      .text(data.country);
    d3.select('.subBoxMapSuicidesPer10000')
      .text(Math.round(data.suicides_per_10000));
    d3.select('.subBoxMapSuicidesPercentage')
      .text(data.percentage_suicides.toFixed(2) + ' %');
    d3.select('.subBoxMapSuicides')
      .text(data.suicides_no);
    d3.select('.subBoxMapPopulation')
      .text(data.population);
   }
}

// this function adds a black rectangle with the label no data
function noData () {
 var svg = d3.select('.boxMap')
             .append('svg')
             .attr('width', 60)
             .attr('height', 50)
             .attr('class', 'noDataLegend');

    svg.append('rect')
       .attr('width', 20)
       .attr('x', 20)
       .attr('y', 10)
       .attr('height', 20)
       .style('fill', 'black');

    svg.append("text")
       .attr("x", 0)
       .attr("y", 45)
       .text("No Data");
}

///////////////////////////////////////////////////////////////////////////////
/////////////////        Functions that process data    //////////////////////
//////////////////////////////////////////////////////////////////////////////

// global variables
var sunburstValue = '10';
var value = 'all';
var idCheck = '';
var id = '';

// when one of the dropdowns are clicked this function determines
// what should happen
function onClick (response, allData, filteredData, color, tooltip, year) {
 d3.selectAll('.dropdown-item')
   .on('click', function(){
      // check which dropdown was chosen, get the right value,
      // write the text and set the id. Call the filter function
      idCheck = this.getAttribute('id');

      if (idCheck === 'sunburstDropdown') {
        sunburstValue = this.getAttribute('value');
        var sunburstFilter = filterSunburst(allData, filteredData,
                                            sunburstValue, year);

        if (sunburstValue != 'allCountries') {
          d3.select('.sunburstFilter')
            .text('Top ' + sunburstValue);
        } else {
          d3.select('.sunburstFilter')
            .text('All countries');
        }
      }
      else if (idCheck === 'gender') {
        value = this.getAttribute('value');
        id = 'gender';
        d3.select('.filter')
          .text(value);
      } else {
        value = this.getAttribute('value');
        id = 'age';
        d3.select('.filter')
          .text(value);
      }
      filter(response, allData, filteredData, color, tooltip);
   });
}

// this function filters the data when user choses an age
function filter (response, allData, filteredData, color, tooltip) {
    var formatData = [];
    // if a filter was chosen and the id is gender or age then filter data
    if (value != 'all' && id != '') {
      var data = filteredData;
      // put the data with the chosen filter in a container
      var container = [];
      if (id === 'age') {
          for (var i in data) {
            if (data[i].age === value) {
              container.push(data[i]);
            }
          }
      } else {
        for (var j in data) {
          if (data[j].sex === value) {
            container.push(data[j]);
          }
        }
      }

      // for each country sum the values together (e.g. chosen filter male
      // sum all the age groups together to get one value per year)
      var newContainer = d3.nest()
                           .key(function (d) { return d.country; })
                           .rollup(function (v) { return {
                             suicides_no: d3.sum(v, function(d) { return d.suicides_no; }),
                             suicides_per_10000: d3.sum(v, function(d) { return d.suicides_per_10000; }),
                             percentage_suicides: d3.sum(v, function(d) { return d.percentage_suicides; }),
                             population: d3.sum(v, function(d) { return d.population; })
                            }; })
                           .entries(container);

      // get the data in the right format and add it to the list formatData
      for (var k in newContainer) {
        var values = newContainer[k].value;
        values.country = newContainer[k].key;
        formatData.push(values);
      }

      update(response, allData, formatData, color, tooltip);
    }
    else if (value === 'all' && id != '') {
      update(response, allData, allData, color, tooltip);
    }
    return formatData;
}

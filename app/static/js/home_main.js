window.onload = function()
{
  $('.hero-image').css({'height': (($(window).height()))+'px'});
  $('.hero-image').css({'width': '100%'});


  $(window).on('resize', function(){
   $('.hero-image').css({'height': (($(window).height()))+'px'});
  });

  var requests = []
  Promise.all(requests).then(function(response) {
    today = new Date()
    born = new Date("07-28-1998")
    convertmili(Math.abs(today-born))

    animated_donut_chart(4,".python", "Python")
    animated_donut_chart(4,".javascript", "Data Viz")
    animated_donut_chart(3,".matlab", "Matlab")
    animated_donut_chart(3,".R", "R")
    animated_donut_chart(3,".SQL", "SQL")
  }).catch(function(e) {
      throw(e);
  });
};

function convertmili( mSeconds )
{
    var checkYear = Math.floor(mSeconds / 31536000000);
    return checkYear;
}

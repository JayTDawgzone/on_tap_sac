

// Updates Boxes at top of page with current tap counts, popular beer, etc.
d3.json('https://sacontap.wn.r.appspot.com/api/totals').then(function(result,error) {

  let popularTap = result.popular_tap;
  let popularBrewery = result.popular_brewery;
  let totalAccounts = result.total_accounts;
  let totalTaps = result.total_taps;
  let lastUpdated = result.date;

  d3.select('#unique-beers').text(totalTaps);
  d3.select('#unique-bars').text(totalAccounts);
  d3.select('#popular-beer').text(popularTap);
  d3.select('#popular-brewery').text(popularBrewery);
  d3.select('#last-updated').text(lastUpdated);


})

// Resize map to 100%
$(window).on("resize", function () { $("#map").height($(window).height()); }).trigger("resize");

// Submit search when enter is pressed
$('#searchbar').keypress(function(event){
  var keycode = (event.keyCode ? event.keyCode : event.which);
  if(keycode == '13'){
     $(this).parent().parent().find('button').click();
  }
});

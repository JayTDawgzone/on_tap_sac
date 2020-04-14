

// Updates Boxes at top of page with current tap counts, popular beer, etc.
d3.json('http://127.0.0.1:5000/api/totals').then(function(result,error) {

  console.log(result);
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

jQuery(function($) {
  
  function initialize() {
    var mapOptions = {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById('loanmap'), mapOptions);
  }
  
  function showLoans() {
    $.ajax({
      url: 'http://api.kivaws.org/v1/lending_actions/recent.json',
      dataType: 'jsonp',
      jsonp: 'jsonp',
      cache: false,
      beforeSend: function() {
        $('#recentlist').empty();
        $('h2').text('Loading loans.....');
        $('#refresh').hide();
      },
      complete: function() {
        $('h2').text('Here are ten of the most recent loans made on Kiva. Choose one to display it on the map.');
      },
      success: function(recentLoans) {
        console.log(recentLoans);
        var loanNum = 0;
        for (var i = 0; i < 100; i++) {
          var lenderName = recentLoans.lending_actions[i].lender.name;
          var lenderLocation = recentLoans.lending_actions[i].lender.whereabouts;
          var borrowerName = recentLoans.lending_actions[i].loan.name;
          var borrowerLocation = recentLoans.lending_actions[i].loan.location.geo.pairs;
          var loanDesc = recentLoans.lending_actions[i].loan.activity + ": " + recentLoans.lending_actions[i].loan.use;
          if ((!lenderLocation  == "") && (loanNum < 10)) {
            $('#recentlist').append('<li class="loans">' + loanDesc + '</li>');
            loanNum++;
          }
        }
        $('#refresh').show();
      }
    });
  }
  
  initialize()
  showLoans();
  
  $('#refresh').click(showLoans);
   
});

/*  Google API key
 *  AIzaSyBM9PzWdICM7biOie_xBaQTakihDnLc3ss
 */  


/*  var randomPage = Math.floor((Math.random()*6000)+1);
  
  $.getJSON("http://api.kivaws.org/v1/lenders/search.json?country_code=US&page=" + randomPage + "&jsonp=?", function(randomLenders) {
    console.log(randomLenders);
    var lenderNum = 0;
    for (var i = 0; i < 50; i++) {
      var lenderName = randomLenders.lenders[i].name;
      var lenderLocation = randomLenders.lenders[i].whereabouts;
      if ((!lenderLocation  == "") && (lenderNum < 10)) {
        $('#recent').append('<p>This lender is ' + lenderName + " - " + lenderLocation + '</p>');
        lenderNum++;
      }
      
    }
  });


  $.getJSON("http://api.kivaws.org/v1/lending_actions/recent.json?jsonp=?", function(recentLoans) {
    console.log(recentLoans);
    var loanNum = 0;
    for (var i = 0; i < 100; i++) {
      var lenderName = recentLoans.lending_actions[i].lender.name;
      var lenderLocation = recentLoans.lending_actions[i].lender.whereabouts;
      var borrowerName = recentLoans.lending_actions[i].loan.name;
      var borrowerLocation = recentLoans.lending_actions[i].loan.location.geo.pairs;
      if ((!lenderLocation  == "") && (loanNum < 10)) {
        $('#recent').append('<p>The lender is ' + lenderName + " - " + lenderLocation + ' and the borrower is ' + borrowerName + ' - ' + borrowerLocation + '</p>');
        loanNum++;
      }
      
    }
  });
*/

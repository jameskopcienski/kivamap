jQuery(function($) {
  
  function initialize() {    //display initial map
    var mapOptions = {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    var map = new google.maps.Map(document.getElementById('loanmap'), mapOptions);
  }
  
  function displayMap() {    //display map with loan loacations
    var loanNum = $(this).attr('id');
    console.log(loanNum);
  }
  
  function showLoans() {
    $.ajax({
      url: 'http://api.kivaws.org/v1/lending_actions/recent.json',
      dataType: 'jsonp',
      jsonp: 'jsonp',
      cache: false,
      beforeSend: function() {    //empty previous list, display loading text, hide refresh button
        $('#recentlist').empty();
        $('h2').text('Loading loans.....');
        $('#refresh').hide();
      },
      complete: function() {     //display list header
        $('h2').text('Here are ten of the most recent loans made on Kiva. Choose one to display it on the map.');
      },
      success: function(recentLoans) {
        console.log(recentLoans);
        var listNum = 0;
        for (var i = 0; i < 100; i++) {   //array contains 100 objects
          var lenderLocation = recentLoans.lending_actions[i].lender.whereabouts;
          var loanDesc = recentLoans.lending_actions[i].loan.activity + ": " + recentLoans.lending_actions[i].loan.use;
          if ((!lenderLocation  == "") && (listNum < 10)) {    //skip lenders with no location, limit list to 10 items
            $('#recentlist').append('<a id="' + i + '" class="loans"><li>' + loanDesc + '</li></a>');  //assign anchor id to array index
            listNum++;
          }
        }
        $('#refresh').show();
        $('#recentlist').on('click', '.loans', displayMap);
      }
    });
  }
  
  initialize();
  showLoans();
  
  $('#refresh').click(showLoans);
   
});

/*  Google API key
 *  AIzaSyBM9PzWdICM7biOie_xBaQTakihDnLc3ss
 */  

/*
      var lenderName = recentLoans.lending_actions[i].lender.name;
      var borrowerName = recentLoans.lending_actions[i].loan.name;
      var borrowerLocation = recentLoans.lending_actions[i].loan.location.geo.pairs;
*/    
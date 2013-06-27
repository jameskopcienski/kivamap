jQuery(function($) {
  
  var geocoder;
  var map;
  var mapArray= [];
  function initialize() {    //display initial map
    geocoder = new google.maps.Geocoder();
    var mapOptions = {
      zoom: 2,
      center: new google.maps.LatLng(0, 0),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById('loanmap'), mapOptions);
  }
  
  function displayMap() {                                    //display map with loan locations
    $('.selected').removeClass('selected');
    $(this).addClass('selected');                  //highlight selected loan

    var loanNum = $(this).data('loannum');
    var lenderId = $(this).data('lenid');
    var lenderName = $(this).data('lenname');
    var lenderLocation = $(this).data('lenloc');
    var lenderImage = $(this).data('lenimage');
    var borrowerId = $(this).data('borid');
    var borrowerName = $(this).data('borname');
    var borrowerLocation = $(this).data('borloc');
    var borrowerCountry = $(this).data('borcntry');
    var borrowerImage = $(this).data('borimage');
    console.log(loanNum, lenderLocation, borrowerLocation);

    geocoder.geocode( { 'address': lenderLocation}, function(results, status) {  //get lender geo coordinates; returns as an object
      if (status == google.maps.GeocoderStatus.OK) {

        if (mapArray) {
          for (i in mapArray) {       //remove previous line and markers
            mapArray[i].setMap(null);
          }
        }

        var lenderLatLng = new google.maps.LatLng(results[0].geometry.location.jb, results[0].geometry.location.kb);
        var borLatLng = new google.maps.LatLng(borrowerLocation.split(' ')[0], borrowerLocation.split(' ')[1]);          //split borrower geo coordinates string into latitude and longitude
        var loanLineCoordinates = [lenderLatLng, borLatLng];                      //set coordinates for polyline

        var loanLine = new google.maps.Polyline({            //draw line between lender and borrower
          path: loanLineCoordinates,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        var bounds = new google.maps.LatLngBounds();          //create map boundary to set proper zoom level
        for (var i = 0; i < loanLineCoordinates.length; i++) {
          bounds.extend(loanLineCoordinates[i]);
        }
        map.fitBounds(bounds);
        loanLine.setMap(map);

        var lenderMarker = new google.maps.Marker({          //add markers at the ends of the polyline
          map: map,
          position: lenderLatLng,
          title: 'Lender'
        });
        var borrowerMarker = new google.maps.Marker({
          map: map,
          position: borLatLng,
          title: 'Borrower'
        });
        mapArray.push(loanLine, lenderMarker, borrowerMarker);
        
        var lenderString = '<div id="lenderWindow">' +       //pop-up windows
                          '<p class="winTitle">Lender</p>' +
                          '<p class="winName">' + lenderName + '</p>' +
                          '<p class="winLoc">' + lenderLocation + '</p>' +
                          '<a href="http://www.kiva.org/lender/' + lenderId + '" target="_blank"><img src="http://www.kiva.org/img/w200h200/' + lenderImage + '.jpg"></a>' +
                          '</div>';
  
        var borrowerString = '<div id="borrowerWindow">' +
                          '<p class="winTitle">Borrower</p>' +
                          '<p class="winName">' + borrowerName + '</p>' +
                          '<p class="winLoc">' + borrowerCountry + '</p>' +
                          '<a href="http://www.kiva.org/lend/' + borrowerId + '" target="_blank"><img src="http://www.kiva.org/img/w200h200/' + borrowerImage + '.jpg"></a>' +
                          '</div>';
  
        var lenderWindow = new google.maps.InfoWindow({
          content: lenderString
        });
  
        var borrowerWindow = new google.maps.InfoWindow({
          content: borrowerString
        });
  
        google.maps.event.addListener(lenderMarker, 'click', function() {
          lenderWindow.open(map, lenderMarker);
        });

        google.maps.event.addListener(borrowerMarker, 'click', function() {
          borrowerWindow.open(map, borrowerMarker);
        });

      } else {
        alert('Geocode was not successful for the following reason: ' + status);  //something wrong with the lender location
      }
    });
  }
  
  function showLoans() {
    initialize();
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
        for (var i = 0; i < 100; i+=3) {   //array contains 100 objects, increment by 3 to avoid repeat lenders
          var lenWhere = recentLoans.lending_actions[i].lender.whereabouts;
          var loanNum = 'data-loannum="' + i + '"';
          var lenderId = ' data-lenid="' + recentLoans.lending_actions[i].lender.lender_id + '"';
          var lenderName = ' data-lenname="' + recentLoans.lending_actions[i].lender.name + '"';
          var lenderLocation = ' data-lenloc="' + lenWhere + '"';
          var lenderImage = ' data-lenimage="' + recentLoans.lending_actions[i].lender.image.id + '"';
          var borrowerId = ' data-borid="' + recentLoans.lending_actions[i].loan.id + '"';
          var borrowerName = ' data-borname="' + recentLoans.lending_actions[i].loan.name + '"';
          var borrowerLocation = ' data-borloc="' + recentLoans.lending_actions[i].loan.location.geo.pairs + '"';
          var borrowerCountry = ' data-borcntry="' + recentLoans.lending_actions[i].loan.location.country + '"';
          var borrowerImage = ' data-borimage="' + recentLoans.lending_actions[i].loan.image.id + '"';
          var loanDesc = recentLoans.lending_actions[i].loan.activity + ": " + recentLoans.lending_actions[i].loan.use;
          if ((!lenWhere  == "") && (listNum < 10)) {    //skip lenders with no location, limit list to 10 items
            $('#recentlist').append('<a class="loans"' + loanNum + borrowerId + borrowerName + borrowerLocation + borrowerCountry + borrowerImage + lenderId + lenderName + lenderLocation + lenderImage + '><li>' + loanDesc + '</li></a>'); //use data- to send data to displayMap function
            listNum++;
          }
        }
        $('#refresh').show();
        $('#recentlist').on('click', '.loans', displayMap);   //display loan on the map when it is selected
      }
    });
  }
  
  showLoans();
  
  $('#refresh').click(showLoans);
   
});

/*  Google API key
 *  AIzaSyBM9PzWdICM7biOie_xBaQTakihDnLc3ss
 */  

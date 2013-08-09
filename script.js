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
    };
    map = new google.maps.Map(document.getElementById('loanmap'), mapOptions);
  }
  
  function displayMap() {                                    //display map with loan locations
    $('.selected').removeClass('selected');
    $(this).addClass('selected');                  //highlight selected loan

    var lenderId = $(this).data('lenid');          //data from selected loan
    var lenderName = $(this).data('lenname');
    var lenderLocation = $(this).data('lenloc');
    var lenderImage = $(this).data('lenimage');
    var borrowerId = $(this).data('borid');
    var borrowerName = $(this).data('borname');
    var borrowerLocation = $(this).data('borloc');
    var borrowerCountry = $(this).data('borcntry');
    var borrowerImage = $(this).data('borimage');

    geocoder.geocode( { 'address': lenderLocation}, function(results, status) {  //get lender geo coordinates; returns as an object
      if (status == google.maps.GeocoderStatus.OK) {

        if (mapArray) {
          for (i in mapArray) {       //remove previous line and markers
            mapArray[i].setMap(null);
          }
        }

        var lenderLatLng = new google.maps.LatLng(results[0].geometry.location.lat(), results[0].geometry.location.lng());
        var borLatLng = new google.maps.LatLng(borrowerLocation.split(' ')[0], borrowerLocation.split(' ')[1]);          //split borrower geo coordinates string into latitude and longitude
        var loanLineCoordinates = [lenderLatLng, borLatLng];                      //set coordinates for polyline

        var loanLine = new google.maps.Polyline({            //set properties for line between lender and borrower
          path: loanLineCoordinates,
          strokeColor: '#4b9123',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        var bounds = new google.maps.LatLngBounds();          //create map boundary to set proper zoom level
        for (var i = 0; i < loanLineCoordinates.length; i++) {
          bounds.extend(loanLineCoordinates[i]);
        }
        
        map.fitBounds(bounds);                               //draws the lines and sets the boundary and zoom level
        loanLine.setMap(map);

        var lenderMarker = new google.maps.Marker({          //add markers at the ends of the polyline
          map: map,
          position: lenderLatLng,
          icon: 'images/green_MarkerL.png',
          title: 'Lender'
        });
        var borrowerMarker = new google.maps.Marker({
          map: map,
          position: borLatLng,
          icon: 'images/green_MarkerB.png',
          title: 'Borrower'
        });
        mapArray.push(loanLine, lenderMarker, borrowerMarker); //save map data for later clearing
        
        var lenderString = '<div id="lenderWindow" class="popwindow">' +       //pop-up windows
                          '<p class="wintitle">Lender</p>' +
                          '<p class="winname">' + lenderName + '</p>' +
                          '<p class="winloc">' + lenderLocation + '</p>' +
                          '<a href="http://www.kiva.org/lender/' + lenderId + '" target="_blank"><img src="http://www.kiva.org/img/w200h200/' + lenderImage + '.jpg"></a>' +
                          '<p class="wincaption">Click photo for more info about this lender on kiva.org</p>' +
                          '</div>';
  
        var borrowerString = '<div id="borrowerWindow" class="popwindow">' +
                          '<p class="wintitle">Borrower</p>' +
                          '<p class="winname">' + borrowerName + '</p>' +
                          '<p class="winloc">' + borrowerCountry + '</p>' +
                          '<a href="http://www.kiva.org/lend/' + borrowerId + '" target="_blank"><img src="http://www.kiva.org/img/w200h200/' + borrowerImage + '.jpg"></a>' +
                          '<p class="wincaption">Click photo for more info about this borrower on kiva.org</p>' +
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
      timeout: 10000,
      beforeSend: function() {                    //empty previous list, display loading text, hide refresh button
        $('#recentlist').empty();
        $('h2').text('Loading loans.....');
        $('#refresh').hide();
      },
      complete: function() {                      //display list header
        $('h2').html('Here are ten of the most recent loans made on Kiva.<br>Choose one to display it on the map, then click on a green marker to see more information.');
      },
      success: function(recentLoans) {
        var listNum = 0;
        var prevLender = "";
        for (var i = 0; i < 100; i++) {   //array contains 100 objects
          var lenWhere = recentLoans.lending_actions[i].lender.whereabouts;
          var lenderId = ' data-lenid="' + recentLoans.lending_actions[i].lender.lender_id + '"';
          if ((lenWhere !== "") && (lenderId !== prevLender) && (listNum < 10)) {    //skip lenders with no location and repeat lenders; limit list to 10 items
            
            var lenName = recentLoans.lending_actions[i].lender.name;
            var lenderName = ' data-lenname="' + lenName + '"';     //data to load into each link
            var lenderLocation = ' data-lenloc="' + lenWhere + '"';
            var lenderImage = ' data-lenimage="' + recentLoans.lending_actions[i].lender.image.id + '"';
            var borrowerId = ' data-borid="' + recentLoans.lending_actions[i].loan.id + '"';
            var borName = recentLoans.lending_actions[i].loan.name;
            var borrowerName = ' data-borname="' + borName + '"';
            var borrowerLocation = ' data-borloc="' + recentLoans.lending_actions[i].loan.location.geo.pairs + '"';
            var borrowerCountry = ' data-borcntry="' + recentLoans.lending_actions[i].loan.location.country + '"';
            var borrowerImage = ' data-borimage="' + recentLoans.lending_actions[i].loan.image.id + '"';
            var loanDesc = recentLoans.lending_actions[i].loan.use;
            
            $('#recentlist').append('<a class="loans"' + borrowerId + borrowerName + borrowerLocation + borrowerCountry + borrowerImage + lenderId + lenderName + lenderLocation + lenderImage + '><li><span>' + lenName + '</span> made a loan to <span>' + borName + '</span> ' + loanDesc + '</li></a>'); //use data- to send data to displayMap function

            listNum++;
            prevLender = lenderId;
          }
        }
        $('#refresh').show();                                 //display refresh list button
        
        $('#recentlist').on('click', '.loans', displayMap);   //display loan on the map when it is selected
      },
      error: function(recentLoans) {
        $('h2').text('Hmmmm....there was some difficulty in getting the data from kiva.org. Click the Refresh List button to try again.');
        $('#refresh').show();
      }
    });
  }
  
  showLoans();
  
  $('#refresh').click(showLoans);
   
});

/*  Google API key
 *  AIzaSyBM9PzWdICM7biOie_xBaQTakihDnLc3ss
 */  

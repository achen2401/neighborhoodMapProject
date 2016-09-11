//initialize map global variables
var map, bounds, infoWindow, markers = [], pageLoaded = false;

/**
* function to handle page load
**/
function handleLoading() {
   $("#loadingContainer").hide();
};

/**
 * Location object & array
 *
 **/
//initialize a Location constructor
var Location = function(data) {
    this.title = data.title;
    this.address = data.address;
    this.position = data.position; //lat lng object
    this.id = data.id;
    this.type = data.type;
    this.icon = data.icon;
    this.marker = data.marker;
};
var LOCATION_TYPE = ['park', 'point of interest', 'museum', 'all'];
var locationList = [];

//making an ajax call to retrieve location data
function initLocationList() {
    $.ajax({
        url: 'data/data.json',
        method: 'GET',
        dataType: "json"
    }).done(function(data) {
        //console.log(data);
        locationList = data.data;
        vm.initList(); //binding location list to view model
        handleLoading();
    }).fail(function() {
        alert('Error retrieving location data');
        handleLoading();
    });
};

/**
 * map related function
 **/
//initialize the map
function initMap() {
   //use a constructor to create a new map JS object.
   map = new google.maps.Map(document.getElementById('map'), {center: {lat: 47.625305, lng: -122.322183}, zoom: 8});
   bounds = new google.maps.LatLngBounds();
   infoWindow = new google.maps.InfoWindow({ content: ""});
   //initialize location list after map is drawn
   initLocationList();
};

//function that is invoked when google map cannot be loaded via call to api
function handleGoogleMapError() {
    alert("Unable to load Google Map.  Try refreshing the browser to reload it.");
};


//function for instantiating a marker
function initMarker(data) {

    var marker = new google.maps.Marker({'title': data.title, 'position': data.position, 'map': map, 'animation': google.maps.Animation.DROP, 'icon': data.icon, 'mapData': data, 'id': data.id });

    //onclick event
    //requesting information from wiki requires making a jsonp call, which means that there is no callback when error occurs
    //therefore, need to use setTimeout to catch error
    marker.addListener("click", function() {
        var self = this;
        var wikiRequestTimeout = setTimeout( //handle failed request here
            function() {
                infoWindow.setContent(self.title + '<br/>' + self.mapData.address + '<br/><span class="warning">Unable to complete request to Wiki.</span>');
                infoWindow.open(map, self);
                self.setAnimation(null)}, 3000);

        toggleBounce(this);//animate the marker
        $.ajax({
            url: 'https://en.wikipedia.org/w/api.php',
            data: {'action': 'opensearch', 'search': self.title, 'format': 'json'},
            dataType: 'jsonp',
            type: 'GET'
        }).done(function(data) {
            var wikiUrl = '';
            if (data && data.length && data[3]) { //contains the url for the wiki page
                wikiUrl = data[3][0];
            }
            //only lists link if it is available
            var content = self.title + "<br/>" + self.mapData.address;
            if (wikiUrl) content += '&nbsp;<a href="' + wikiUrl + '" title="about" target="_blank"><span class="glyphicon glyphicon-info-sign" aria-hidden="true"></span></a>';
            infoWindow.setContent(content);
            infoWindow.open(map, self); //open info window now content is retrieved
            clearTimeout(wikiRequestTimeout);
            self.setAnimation(null); //stop marker from continuing to bounce

        });
    });

    bounds.extend(marker.position);
    marker.setMap(map);
    return marker;
 };

//animate marker
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) marker.setAnimation(null);
  else marker.setAnimation(google.maps.Animation.BOUNCE);
};

/**
  * KO View Model
**/
var ViewModel = function() {
    var self = this;

    self.locationTypes = ko.observableArray(LOCATION_TYPE);
    self.locationList = ko.observableArray([]);
    self.currentLocationType = ko.observable('all');
    self.currentLocation = ko.observable(self.locationList()[0]);
    self.currentNavListState = ko.observable('open');

    //populates location list with default specified locations
    self.initList = function() {
        locationList.forEach(function(location) {
            location.marker = initMarker(location);
            self.locationList.push(new Location(location));
        });
        map.fitBounds(bounds);
    };

    self.filterLocationList = function(type) {

        if (type == self.currentLocationType()) return false; // no need to re-draw if the location is the same as before

        infoWindow.close(); //make sure it is closed when list is re-filtered;

        var targetType = type, newList;

        if(targetType && String(targetType).toLowerCase() !=  'all') {
            self.currentLocationType(targetType);
            newList = locationList.filter(function(location) {
                if (location.type == targetType) {
                    location.marker.setVisible(true);
                    return true;
                } else {
                    location.marker.setVisible(false);
                    return false;
                }
            });
        } else {
            self.currentLocationType('');
            locationList.forEach(function(location) {
                location.marker.setVisible(true); //unhide all markers if not filtered
            });
            newList = locationList; //default list;
        }

        self.locationList(newList); //reset the current location list with the new filtered list
    };

    self.triggerMarker = function(location) {
        self.setCurrentLocation(location);
        google.maps.event.trigger(location.marker, 'click');
        if ($("#close-nav-container").is(":visible")) self.setNavListState(); //hide side nav bar since it is blocking the map

    };

    self.setNavListState = function() {
        if (self.currentNavListState() == 'open') self.currentNavListState('closed');
        else self.currentNavListState('open');
    };

    self.setCurrentLocation = function(location) {
        self.currentLocation(location);
    };
};

var vm = new ViewModel();

ko.applyBindings(vm);


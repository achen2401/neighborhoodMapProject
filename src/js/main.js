//initialize map global variables
var map, bounds, infoWindow, markers = [];

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
        locationList.forEach(function(location) {
            initMarker(location); //initialize marker for each location
        });
        vm.initList(); //binding location list to view model
    }).fail(function() {
        alert('Error retrieving location data');
    });
};

/**
 * map related function
 * including helper functions for markers
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

//function for locating marker
function getMarker(id) {
    var targetMarker;
    for (var index=0; index < markers.length; index++) {
        if (markers[index].id == id) {
            targetMarker = markers[index];
            break;
        }
    }
    return targetMarker;
};

//hide all markers on the map, and emptied the markers array that holds pre-existing markers
function clearMarkers() {
    markers.forEach(function(marker) { marker.setMap(null);});
    markers = null;
};

//show markers on the map
function showMarkers() {
    markers.forEach(function(marker) { marker.setMap(map); });
};


//function for instantiating a marker
function initMarker(data) {

    var marker = new google.maps.Marker({'title': data.title, 'position': data.position, 'map': map, 'animation': google.maps.Animation.DROP, 'icon': data.icon, 'mapData': data, 'id': data.id });

    //onclick event
    //requesting information from wiki requires making a jsonp call, which means that there is no callback when error occurs
    //therefore, need to use setTimeout to catch error
    marker.addListener("click", function() {
        var self = this;
        var wikiRequestTimeout = setTimeout(function() { console.log('unable to process request'); return ''; }, 5000);
        toggleBounce(this);//animate the marker
        $.ajax( {
            url: 'https://en.wikipedia.org/w/api.php',
            data: {'action': 'opensearch', 'search': self.title, 'format': 'json'},
            dataType: 'jsonp',
            type: 'POST',
            success: function(data) {
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
                marker.setAnimation(null); //stop marker from continuing to bounce
            }
         });
    });

    bounds.extend(marker.position);
    marker.setMap(map);
    if (!markers) markers = [];
    markers.push(marker);
    map.fitBounds(bounds);
    return marker;
 };

//animate marker
function toggleBounce(marker) {
  if (marker.getAnimation() !== null) marker.setAnimation(null);
  else marker.setAnimation(google.maps.Animation.BOUNCE);
};

/**
 * helper function for opening the side nav menu
 **/
function toggleSideNav() {
    $("#nav-container").toggleClass("open");
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

     //populates location list with default specified locations
    self.initList = function() {
        locationList.forEach(function(location) {
            self.locationList.push(new Location(location));
        });
    };

    //filter out the locations based on the type selected
    self.filterLocationList = function(type) {
        if (type == self.currentLocationType()) return false; // no need to re-draw if the location is the same as before

        var targetType = type, newList;

        if(targetType && String(targetType).toLowerCase() !=  'all') {
            self.currentLocationType(targetType);
            newList = locationList.filter(function(location) {
                return location.type == targetType;
            });
        } else {
            self.currentLocationType('');
            newList = locationList; //default list;
        }

        self.locationList(newList); //reset the current location list with the new filtered list
        clearMarkers(); //clear the map of markers first
        self.locationList().forEach(function(location) {
            initMarker(location); //create marker for new locations
        });
        showMarkers(); //show new markers
    };

    self.triggerMarker = function(location) {
        self.setCurrentLocation(location);
        var marker = getMarker(self.currentLocation().id); //get current marker
        if (marker) google.maps.event.trigger(marker, 'click'); //trigger click event of the marker
        if ($("#close-nav-container").is(":visible")) toggleSideNav(); //hide side nav bar since it is blocking the map
    }

    self.setCurrentLocation = function(location) {
        self.currentLocation(location);
    }
};

var vm = new ViewModel();

ko.applyBindings(vm);
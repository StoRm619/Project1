const centerInit = { lat: 32.8800604, lng: -117.2362022 };
let infowindow;
let places = [];
let currentAdd = '';
let service;
let geocoder;

function initMap() {
    let map = new google.maps.Map(document.getElementById('map'), {
        center: centerInit,
        zoom: 13,
        mapTypeId: 'roadmap'
    });

    service = new google.maps.places.PlacesService(map);
    geocoder = new google.maps.Geocoder();
    // Create the search box and link it to the UI element.
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
        searchBox.setBounds(map.getBounds());
    });

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.

    searchBox.addListener('places_changed', function() {
        let currentLocInput = searchBox.getPlaces();

        if (currentLocInput.length == 0) return;

        currentAdd = currentLocInput[0].formatted_address;
        console.log({ currentAdd })
        let currentGeo = currentLocInput[0].geometry;


        let bounds = new google.maps.LatLngBounds();
        if (currentGeo.viewport) bounds.union(currentGeo.viewport);
        else bounds.extend(currentGeo.location);
        map.fitBounds(bounds);

        geocodeAddress(currentAdd, callSearchNearby);
    });

    $('#submit').on('click', filterResults);
}

function filterResults() {
    if (currentAdd) {
        geocodeAddress(currentAdd, callSearchNearby);
    }
};

function callSearchNearby(latLng) {
    let requestNearby = {
        location: latLng,
        radius: '8000', //in meters.
        type: ['restaurant']
    };
    service.nearbySearch(requestNearby, callGetDetails);
}

function callGetDetails(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        // controle asyncronous place details requests with the following values
        let detailsRequestCompletedCount = 0;
        let allDetailsRequestsComplete = () =>
            detailsRequestCompletedCount === results.length;
        places = [];
        for (var i = 0; i < results.length; i++) {
            let request = {
                placeId: results[i].place_id,
                fields: ['name', 'rating', 'formatted_address']
            };
            // service.getDetails(request, makeDetailCallback(places));
            service.getDetails(request, function(results, status) {
                detailsRequestCompletedCount += 1;
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                    places.push({
                        name: results.name,
                        address: results.formatted_address,
                        rating: results.rating
                    });
                }
                if (allDetailsRequestsComplete()) {
                    console.log('all details are done now. proceed.')

                    getTravelTime();
                }
            });
        }
        console.log('SearchCallback, places:', places);
    }
}

function getTravelTime() {
    var origin = currentAdd;

    //Pushing address values into destinations array for distance matrix calculations
    var destination = [];
    for (var h = 0; h < places.length; h++) {
        destination.push(places[h].address);
    }

    var selectTransporatation = document.getElementById('methodTransportation');
    var userSelectMode =
        selectTransporatation.options[selectTransporatation.selectedIndex].value;

    var service2 = new google.maps.DistanceMatrixService();
    service2.getDistanceMatrix({
            origins: [origin],
            destinations: destination,

            travelMode: userSelectMode,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
        },
        function(response, status) {
            if (status !== 'OK') {
                alert('Error was: ' + status);
            } else {
                var originList = response.originAddresses;
                let timeMax = parseInt(document.getElementById('inputTime').value);

                var results = response.rows[0].elements;

                $("#resultsDisplay").empty();
                for (var j = 0; j < results.length; j++) {

                    if (parseInt(results[j].duration.text) < timeMax) {
                        console.log(places[j].name)
                        console.log(results[j].duration.text)
                        console.log(results[j].distance.text)
                        var newRow = $("<tr>").append(
                            $("<td>").text(places[j].name),
                            $("<td>").text(places[j].price),
                            $("<td>").text(places[j].rating),
                            $("<td>").text(results[j].duration.text),
                            $("<td>").text(places[j].address),
                        );
                        //Appending all of new div to html of page
                        $("#resultsDisplay").append(newRow)
                    }

                }
            }
        }
    );
};

function geocodeAddress(address, callback) {
    // var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            let currentLatLng = results[0].geometry.location;
            console.log('Geocoding: ', { lat: currentLatLng.lat(), lng: currentLatLng.lng() });
            callback(currentLatLng);
        } else alert('Geocode was not successful for the following reason: ' + status);
    });
}
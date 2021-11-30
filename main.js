window.onload = init

function init(){

 var Stadia_AlidadeSmoothDark = L.tileLayer('https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png', {
	maxZoom: 20,
	attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
   });

   var Esri_WorldGrayCanvas = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});
var CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
});

var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var OpenStreetMap_Mapnik2 = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});


/**
 * Creating the Choropleth Map for Covid Cases
 */

// Function for the colours and classifying it accoring to cases.. Hex from Color brewer

 function getColor(d) {
    return d > 50000 ? '#800026' :
           d > 30000  ? '#BD0026' :
           d > 20000  ? '#E31A1C' :
           d > 10000  ? '#FC4E2A' :
           d > 5000   ? '#FD8D3C' :
           d > 2000   ? '#FEB24C' :
           d > 1000   ? '#FED976' :
                      '#FFEDA0';
}

  function style(feature) {
      return {
         weight: 2,
         opacity: 1,
         color: 'white',
         dashArray: '3',
         fillOpacity: 0.7,
         fillColor: getColor(feature.properties.CASES)
     };
   }

   // This function will highligh the layer when an event is triggered a
   function highlightFeature(e) {
        var layer = e.target;

        layer.setStyle({
            weight: 2,
            color: '#666',
            dashArray: '',
            fillOpacity: 0.7
        });

        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
         }
         info.update(layer.feature.properties);
    }



// this functions resets the highlighted feature 
    function resetHighlight(e) {
        CumCases.resetStyle(e.target);
        info.update();
    }

    
    function zoomToFeature(e) {
        map.fitBounds(e.target.getBounds());
    }

	function onEachFeature(feature, layer) {
		layer.on({
			mouseover: highlightFeature,
			mouseout: resetHighlight,
			click: zoomToFeature
		});
	}

/**
 * Marker cluster
 */
     var markers = L.markerClusterGroup(); 
    
     var geoJsonLayer = L.geoJson(markersD, {
        onEachFeature: function (feature, layer) {
            layer.bindPopup(feature.properties.amenity);
        }
    });
    markers.addLayer(geoJsonLayer);

    // Adding the Geojson Data
    var CumCases = L.geoJSON(ghcovid, {
        style:style,
        onEachFeature: onEachFeature
    }); 

   

// Map layer

    var map = L.map('L-map', {
        center: [ 8.964844, -1.373291],
    
		zoom: 7, //use 7 for production
        minZoom: 6, 
        //layers: [ CartoDB_DarkMatter, CumCases, markers]
        layers: [ OpenStreetMap_Mapnik, markers]
    })
	
    // control that shows state info on hover
    var info = L.control({
        position: 'bottomright',
    });
    
    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) 
    {
        /* this._div.innerHTML = '<h4> Cummulative Covid Cases </h4>' +  (props ?
            '<b>' + props.REGION + '</b><br />' + props.CASES + ' Cummulative Cases'
            : 'Hover over region'); */
    };

    info.addTo(map);

// Creating a Legend
   var legend = L.control({position: 'bottomright'});

   legend.onAdd = function (map) {

     var div = L.DomUtil.create('div', 'info legend'),
         //grades = [0, 1000, 2000, 5000, 10000, 20000, 30000, 50000],
         grades = [],
         labels = [],
         from, to;

     // loop through our Cases and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1];

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' +  to : '+'));
    }
 
    div.innerHTML = labels.join('<br>');
    return div;
    };

    legend.addTo(map);

	/**
     * LAYER GROUP 
     */

	
	var baseLayers = {
        "Open Street Map": OpenStreetMap_Mapnik,
        "CartoDB_DarkMatter": CartoDB_DarkMatter, 
        "Esri_WorldGrayCanvas": Esri_WorldGrayCanvas,
        "Stadia_AlidadeSmoothDark": Stadia_AlidadeSmoothDark,
        "OSM": OpenStreetMap_Mapnik 
	};

	var overlays = {
		 "Health Faclities": markers,
        "Covid-Cases": CumCases
	};

	L.control.layers(baseLayers, overlays).addTo(map);
	
}
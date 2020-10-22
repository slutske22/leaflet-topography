// import '../build/index.js';
import Topography from '../build/leaflet-topography.js';

// Define some maps options
var mapOptions = {
	center: { lat: 20.644973760193032, lng: -156.10400190576914 },
	zoom: 15,
};

//Create a map and assign it to the map div
var map = (window.map = L.map('leafletMapid', mapOptions));

//  Add a baselayer
var USGS_USImagery = L.tileLayer(
	'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
	{
		maxZoom: 20,
		attribution:
			'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
	}
).addTo(map);

Topography.configure({
	map,
	token: process.env.MAPBOX_TOKEN,
	scale: 13,
	spread: 4,
	priority: 'storage',
});

const bounds = map.getBounds();

if (map.getZoom() >= 13) {
	Topography.preload([bounds]);
}

map.on('click', (e) => {
	console.log('Requesting Topography...');
	Topography.getTopography(e.latlng).then((results) => console.log(results));
});

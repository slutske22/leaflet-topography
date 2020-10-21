// import '../build/index.js';
import Topography from '../build/leaflet-topography.js';

// Define some maps options
var mapOptions = {
	center: { lat: 20.704019268909484, lng: -156.25198759138587 },
	zoom: 13,
};

//Create a map and assign it to the map div
var map = (window.map = L.map('leafletMapid', mapOptions));

//  Add a baselayer
var esriOceans = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
	{
		attribution:
			'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
		maxZoom: 18,
	}
).addTo(map);

// Testing .env
// var mapboxRGB = L.tileLayer(
// 	`https://api.mapbox.com/v4/mapbox.terrain-rgb/{z}/{x}/{y}.pngraw?access_token=${process.env.MAPBOX_TOKEN}`
// ).addTo(map);

Topography.configure({
	map,
	token: process.env.MAPBOX_TOKEN,
	scale: 13,
});

// map.on('click', async (e) => {
// 	console.log('Requesting Topography...');
// 	const results = await Topography.getTopography(e.latlng);
// 	console.log(results);
// });

const bounds = map.getBounds();

Topography.preload([bounds]);

map.on('click', (e) => {
	console.log('Requesting Topography...');
	Topography.getTopography(e.latlng).then((results) => console.log(results));
});

// import '../build/index.js';
import Topography from '../build/index.js';

console.log('Topography', Topography);

// Define some maps options
var mapOptions = {
	center: { lat: 20.77694995473552, lng: -156.29021108150485 },
	zoom: 10,
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
});

map.on('click', async (e) => {
	console.log(e.latlng);
	const results = await Topography.getTopography(e.latlng);
	console.log(results);
});

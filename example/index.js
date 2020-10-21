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
L.tileLayer(
	'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}{r}.{ext}',
	{
		attribution:
			'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 18,
		ext: 'png',
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
	spread: 6,
});

// map.on('click', async (e) => {
// 	console.log('Requesting Topography...');
// 	const results = await Topography.getTopography(e.latlng);
// 	console.log(results);
// });

const bounds = map.getBounds();

if (map.getZoom() >= 13) {
	Topography.preload([bounds]);
}

map.on('click', (e) => {
	console.log('Requesting Topography...');
	Topography.getTopography(e.latlng).then((results) => console.log(results));
});

import '../build/index.js';
import Topography, { getTopography } from '../build/index.js';

// const { Topography } = L;
console.log('Topography', Topography);
console.log('getTopography', getTopography);

// Define some maps options
var mapOptions = {
	center: { lat: 20.77694995473552, lng: -156.29021108150485 },
	zoom: 10,
};

//Create a map and assign it to the map div
var map = (window.map = L.map('leafletMapid', mapOptions));

//  Add a baselayer
var mapBoxOutdoors = L.tileLayer(
	'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean_Basemap/MapServer/tile/{z}/{y}/{x}',
	{
		attribution:
			'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
		maxZoom: 18,
	}
).addTo(map);

map.on('click', (e) => console.log(e.latlng));

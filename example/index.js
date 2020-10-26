import Topography from '../build/leaflet-topography.js';
import * as Geocoding from 'esri-leaflet-geocoder';
import { initializeDemo } from './demo';
import './layers.js';

// Define some maps options
// hawaii:
var mapOptions = {
	center: { lat: 20.644973760193032, lng: -156.10400190576914 },
	zoom: 15,
};

// himalayas:
// var mapOptions = {
// 	center: { lat: 30.221101852485987, lng: 85.6494140625 },
// 	zoom: 5,
// };

//Create a map and assign it to the map div
export const map = (window.map = L.map('leafletMapid', mapOptions));

Geocoding.geosearch({ useMapBounds: false }).addTo(map);

//  Add a baselayer
export const USGS_USImagery = L.tileLayer(
	'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
	{
		maxZoom: 20,
		attribution:
			'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
	}
);
USGS_USImagery.addTo(map);

export const modal = document.getElementById('key-modal');
const submitButton = document.getElementById('key-submit');
const textArea = document.getElementById('key-input');
const warning = document.getElementById('warning');

submitButton.addEventListener('click', () => {
	if (textArea.value) {
		initializeDemo(textArea.value);
	} else {
		warning.classList.add('show');
	}
});

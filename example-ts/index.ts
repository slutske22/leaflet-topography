import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as L from 'leaflet';
import * as Geocoding from 'esri-leaflet-geocoder';
import { initializeDemo } from './demo';
import './layers.ts';

// Define some maps options
// Puerto Rico:
var mapOptions = {
	center: [18.27, -66.4],
	zoom: 13,
	minZoom: 10,
	maxZoom: 15,
};

//Create a map and assign it to the map div
// @ts-ignore
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
export const resultsContainer = document.getElementById(
	'topo-results-container'
);
export const resultsMarkup = document.getElementById('topo-results');
const submitButton = document.getElementById('key-submit');
const textArea = <HTMLInputElement>document.getElementById('key-input');
const warning = document.getElementById('warning');

submitButton.addEventListener('click', () => {
	if (textArea.value) {
		initializeDemo(textArea.value);
	} else {
		warning.classList.add('show');
	}
});

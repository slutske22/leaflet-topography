import 'leaflet.control.layers.tree';
import './leaflet.tree.css';
import Topography from '../build/leaflet-topography.js';
import { map, modal, USGS_USImagery } from './index';
import {
	elevationLayers,
	slopeLayers,
	aspectLayers,
	slopeaspectLayers,
} from './layers';

window.addEventListener('DOMContentLoaded', () => {
	if (process.env.MAPBOX_TOKEN) {
		initializeDemo(process.env.MAPBOX_TOKEN);
	}
});

export function initializeDemo(key) {
	//
	modal.style.display = 'none';

	// Configure leaflet-topography
	Topography.configure({
		map,
		token: key,
		scale: 13,
		spread: 4,
		priority: 'storage',
	});

	// Preload map area on load
	const bounds = map.getBounds();

	if (map.getZoom() >= 13) {
		Topography.preload([bounds]);
	}

	// Implement getTopography function
	map.on('click', (e) => {
		console.log('Requesting Topography...');
		Topography.getTopography(e.latlng).then((results) =>
			console.log(
				'LatLng:',
				e.latlng,
				'Zoom:',
				map.getZoom(),
				'Topography:',
				results
			)
		);
	});

	// Create layers control tree for various TopoLayer samples
	const baseTree = {
		layer: USGS_USImagery,
		label: 'Basemap',
		children: [
			{
				label: '<code class="tree-title"> topotype: elevation</code>',
				children: elevationLayers.map((l) => ({
					label: l.name,
					layer: l.layer,
				})),
			},
			{
				label: '<code class="tree-title"> topotype: slope</code>',
				children: slopeLayers.map((l) => ({
					label: l.name,
					layer: l.layer,
				})),
			},
			{
				label: '<code class="tree-title"> topotype: aspect</code>',
				children: aspectLayers.map((l) => ({
					label: l.name,
					layer: l.layer,
				})),
			},
			{
				label: '<code class="tree-title"> topotype: slopeaspect</code>',
				children: slopeaspectLayers.map((l) => ({
					label: l.name,
					layer: l.layer,
				})),
			},
		],
	};

	L.control.layers.tree(baseTree, null, { collapsed: false }).addTo(map);
}

import 'leaflet.control.layers.tree';
import './leaflet.tree.css';
import Topography from 'leaflet-topography';
import {
	map,
	modal,
	resultsContainer,
	resultsMarkup,
	USGS_USImagery,
} from './index';
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
	resultsContainer.style.display = 'block';
	const csb = document.getElementById('codesandbox-container');
	const topLeft = document.querySelector('.leaflet-right.leaflet-top');
	topLeft.appendChild(csb);

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
		resultsMarkup.innerHTML = 'Requesting Topography...';
		Topography.getTopography(e.latlng).then((results) => {
			resultsMarkup.innerHTML =
				JSON.stringify(e.latlng, null, 2) +
				'<br>' +
				JSON.stringify(results, null, 2);
		});
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

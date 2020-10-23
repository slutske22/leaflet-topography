import Topography from '../build/leaflet-topography.js';

const elevationlayer = (window.elevationlayer = new Topography.TopoLayer({
	topotype: 'elevation',
}));

const aspectlayer = (window.aspectlayer = new Topography.TopoLayer({
	topotype: 'aspect',
}));

const aspectlayercontinuous = (window.aspectlayercontinuous = new Topography.TopoLayer(
	{
		topotype: 'aspect',
		continuous: true,
	}
));

const aspectlayerMidnightBlue = (window.aspectlayerMidnightBlue = new Topography.TopoLayer(
	{
		topotype: 'aspect',
		colors: [
			'#303E73',
			'#7A85AD',
			'#515E90',
			'#172557',
			'#07123A',
			'#164A5B',
			'#75CFEC',
			'#172557',
			'#303E73',
		],
		continuous: true,
	}
));

const aspectlayerCardinalDirections = (window.aspectlayerCardinalDirections = new Topography.TopoLayer(
	{
		topotype: 'aspect',
		colors: ['#f4fa00', '#9afb0c', '#0068c0', '#ca009c', '#f4fa00'],
		continuous: true,
	}
));

const aspectlayerNorthSouth = (window.aspectlayerNorthSouth = new Topography.TopoLayer(
	{
		topotype: 'aspect',
		colors: ['#0068c0', '#b10012', '#0068c0'],
		continuous: true,
	}
));

const customelevation = (window.customelevation = new Topography.TopoLayer({
	topotype: 'elevation',
	colors: [
		'#164A5B',
		'#75CFEC',
		'#8b4513',
		'#FCFFA0',
		'#e15f02',
		'#008000',
		'#855723',
		'#006400',
		'#ffffff',
	],
	breakpoints: [-850, 0, 300, 500, 700, 800, 1500, 2400, 8700],
	continuous: true,
}));

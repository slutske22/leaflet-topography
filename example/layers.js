import Topography from '../build/leaflet-topography.js';

const elevationLayers = [
	{
		name: 'Default',
		layer: (window.elevationlayer = new Topography.TopoLayer({
			topotype: 'elevation',
		})),
	},
	{
		name: 'Disontinuous Custom Colors',
		layer: (window.elevationDisontinuous = new Topography.TopoLayer({
			topotype: 'elevation',
			// continuous: false,
			// breaksAt0: false,
			colors: [
				'#ffffff',
				'#ffffff',
				'#ffffff',
				'#eeeeee',
				'#303E73',
				'#7A85AD',
				'#515E90',
				'#172557',
				'#07123A',
				'#164A5B',
				'#75CFEC',
				'#172557',
				'#303E73',
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
		})),
	},
	{
		name: 'Continuous Custom Colors',
		layer: (window.elevationcustomcontinuous = new Topography.TopoLayer({
			topotype: 'elevation',
			continuous: false,
			colors: [
				'#164A5B',
				'#75CFEC',
				'#8b4513',
				'#FCFFA0',
				'#e15f02',
				'#008000',
				'#855723',
				'#006400',
				'#eeffaa',
				'#aaeeee',
				'#aaaaee',
				'#ffffff',
			],
			breakpoints: [
				-850,
				0,
				300,
				500,
				700,
				800,
				1500,
				2400,
				5000,
				6000,
				8500,
				8900,
			],
		})),
	},
	{
		name: 'Continuous Colors, Break at 0',
		layer: (window.elevationcontbreak = new Topography.TopoLayer({
			topotype: 'elevation',
			colors: [
				'#164A5B',
				'#75CFEC',
				'#8b4513',
				'#FCFFA0',
				'#e15f02',
				'#008000',
				'#855723',
				'#b10012',
				'#8b4513',
				'#164A5B',
				'#ffffff',
			],
			breakpoints: [-850, 300, 500, 700, 800, 1200, 2500, 3000, 8000, 8700],
			continuous: true,
			breaksAt0: true,
		})),
	},
];

const aspectLayers = [
	{
		name: 'Default',
		layer: (window.aspectlayer = new Topography.TopoLayer({
			topotype: 'aspect',
		})),
	},
	{
		name: 'Default, Continuous',
		layer: (window.aspectlayercontinuous = new Topography.TopoLayer({
			topotype: 'aspect',
			continuous: true,
		})),
	},
	{
		name: 'Midnight Blue',
		layer: (window.aspectlayerMidnightBlue = new Topography.TopoLayer({
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
		})),
	},
	{
		name: 'Cardinal Directions',
		layer: (window.aspectlayerCardinalDirections = new Topography.TopoLayer({
			topotype: 'aspect',
			colors: ['#f4fa00', '#9afb0c', '#0068c0', '#ca009c', '#f4fa00'],
			continuous: true,
		})),
	},
	{
		name: 'North and South',
		layer: (window.aspectlayerNorthSouth = new Topography.TopoLayer({
			topotype: 'aspect',
			colors: ['#0068c0', '#b10012', '#0068c0'],
			continuous: true,
		})),
	},
];

const slopeaspectLayer = [
	{
		name: 'Default',
		layer: (window.slopeaspectlayer = new Topography.TopoLayer({
			topotype: 'slopeaspect',
		})),
	},
];

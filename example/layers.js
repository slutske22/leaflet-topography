// import { TopoLayer } from '../build/leaflet-topography.js';
import { TopoLayer } from 'leaflet-topography';
import customWorker from './custom.worker';

export const elevationLayers = [
	{
		name: 'Default',
		layer: (window.elevationlayer = new TopoLayer({
			topotype: 'elevation',
		})),
	},
	{
		name: 'Disontinuous Custom Colors',
		layer: (window.elevationDisontinuous = new TopoLayer({
			topotype: 'elevation',
			customization: {
				continuous: false,
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
			},
		})),
	},
	{
		name: 'Continuous Custom Colors',
		layer: (window.elevationcustomcontinuous = new TopoLayer({
			topotype: 'elevation',
			customization: {
				breaksAt0: false,
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
			},
		})),
	},
	{
		name: 'Continuous Colors, Break at 0',
		layer: (window.elevationcontbreak = new TopoLayer({
			topotype: 'elevation',
			customization: {
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
				breakpoints: [
					-850,
					300,
					500,
					700,
					800,
					1200,
					2500,
					3000,
					8000,
					8700,
				],
				continuous: true,
				breaksAt0: true,
			},
		})),
	},
];

export const slopeLayers = [
	{
		name: 'Default',
		layer: (window.slopelayer = new TopoLayer({
			topotype: 'slope',
		})),
	},
	{
		name: 'Tri Color',
		layer: (window.slopelayerTricolor = new TopoLayer({
			topotype: 'slope',
			customization: {
				colors: ['#000000', '#808080', '#fd632a'],
			},
		})),
	},
	{
		name: 'Greater Than 70',
		layer: (window.slopelayer70 = new TopoLayer({
			topotype: 'slope',
			customization: {
				colors: ['#000000', '#fd632a', '#fd632a'],
				brakpoints: [0, 70, 90],
				continuous: false,
			},
		})),
	},
];

export const aspectLayers = [
	{
		name: 'Default',
		layer: (window.aspectlayer = new TopoLayer({
			topotype: 'aspect',
		})),
	},
	{
		name: 'Default, Continuous',
		layer: (window.aspectlayercontinuous = new TopoLayer({
			topotype: 'aspect',
			customization: {
				continuous: true,
			},
		})),
	},
	{
		name: 'Midnight Blue',
		layer: (window.aspectlayerMidnightBlue = new TopoLayer({
			topotype: 'aspect',
			customization: {
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
			},
		})),
	},
	{
		name: 'Cardinal Directions',
		layer: (window.aspectlayerCardinalDirections = new TopoLayer({
			topotype: 'aspect',
			customization: {
				colors: ['#f4fa00', '#9afb0c', '#0068c0', '#ca009c', '#f4fa00'],
				continuous: true,
			},
		})),
	},
	{
		name: 'North and South',
		layer: (window.aspectlayerNorthSouth = new TopoLayer({
			topotype: 'aspect',
			customization: {
				colors: ['#0068c0', '#b10012', '#0068c0'],
				continuous: true,
			},
		})),
	},
];

export const slopeaspectLayers = [
	{
		name: 'Default',
		layer: (window.slopeaspectlayer = new TopoLayer({
			topotype: 'slopeaspect',
		})),
	},
	{
		name: 'Continuous',
		layer: (window.slopeaspectlayerContinuous = new TopoLayer({
			topotype: 'slopeaspect',
			customization: {
				continuous: true,
			},
		})),
	},
	{
		name: 'Midnight Blue',
		layer: (window.slopeaspectlayerMidnightBlue = new TopoLayer({
			topotype: 'slopeaspect',
			customization: {
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
			},
		})),
	},
	{
		name: 'Continuous',
		layer: (window.slopeaspectlayerWest = new TopoLayer({
			topotype: 'slopeaspect',
			customization: {
				colors: ['#6c9b0a', '#08006f', '#6c9b0a', '#6c9b0a'],
				breakpoints: [0, 225, 305, 360],
				fallback: '#6c9b0a',
			},
		})),
	},
];

// Allowing user to provide worker still experimental
export const customLayers = [
	{
		name: 'Sea Level Rise 3m',
		layer: new TopoLayer({
			topotype: 'custom',
			worker: customWorker,
		}),
	},
];

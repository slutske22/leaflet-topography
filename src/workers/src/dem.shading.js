import Rainbow from 'rainbowvis.js';

/**
 * Transforms ImageData() array of rgb encoded elevation values into elevation values (in meters)
 * @param {ImageData() Uint8ClampedArray} data
 */
export function raster2dem(data) {
	const dem = new Int16Array(256 * 256);

	var x, y, i, j;

	// from https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#decode-data
	function height(R, G, B) {
		return -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
	}

	for (x = 0; x < 256; x++) {
		for (y = 0; y < 256; y++) {
			i = x + y * 256;
			j = i * 4;
			dem[i] = height(data[j], data[j + 1], data[j + 2]);
		}
	}

	return dem;
}

/**
 * Transforms Int16Array of elevation data into Uint8ClampedArray of rgba values
 * @param {Int16Array} dem
 */
export function shading(dem) {
	var px = new Uint8ClampedArray(256 * 256 * 4);

	for (let i = 0; i < dem.length; i++) {
		var hex = `#${hypsotint(dem[i])}`;
		var rgb = hexToRgb(hex);

		px[4 * i + 0] = rgb.r;
		px[4 * i + 1] = rgb.g;
		px[4 * i + 2] = rgb.b;
		px[4 * i + 3] = 255;
	}

	return px;
}

/**
 * Transforms hex color values of form '#XXXXXX' to rgb value
 * @param {string} hex
 * from https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 */
function hexToRgb(hex) {
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function (m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: parseInt(result[1], 16),
				g: parseInt(result[2], 16),
				b: parseInt(result[3], 16),
		  }
		: null;
}

/**
 * Creates array of Rainbow gradient objects with specified value ranges and color spectrums
 */
//
var colors = [
	'#164A5B',
	'#75CFEC',
	'#FCFFA0',
	'#008000',
	'#855723',
	'#006400',
	'#493829',
	'white',
];
// var colors =      ['white', '#164A5B', 'white', '#164A5B', 'white', '#164A5B', 'white', '#164A5B']
var breakpoints = [-850, 0, 300, 800, 1500, 2400, 8700];

var gradients = (() => {
	var collection = [];

	for (let i = 0; i < breakpoints.length - 1; i++) {
		var rainbow = new Rainbow();
		rainbow.setNumberRange(breakpoints[i], breakpoints[i + 1]);
		rainbow._numberRange = [breakpoints[i], breakpoints[i + 1]];

		// discontinuous use of colors between negative and position values
		if (i === 0) {
			rainbow.setSpectrum(colors[i], colors[i + 1]);
			rainbow._spectrum = [colors[i], colors[i + 1]];
		} else {
			rainbow.setSpectrum(colors[i + 1], colors[i + 2]);
			rainbow._spectrum = [colors[i + 1], colors[i + 2]];
		}

		collection.push(rainbow);
	}

	return collection;
})();

/**
 * Takes in an elevation value and outputs a hex color value based on the gradients map
 * @param {Number} elevation
 */
function hypsotint(elevation) {
	for (let i = 0; i < breakpoints.length - 1; i++) {
		if (breakpoints[i] < elevation && elevation <= breakpoints[i + 1]) {
			return gradients[i].colorAt(elevation);
		}
	}

	return '000000';
}

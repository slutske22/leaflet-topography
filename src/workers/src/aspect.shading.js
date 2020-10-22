import Rainbow from 'rainbowvis.js';

/**
 * Transforms ImageData() array of rgb encoded elevation values into elevation values (in meters)
 * @param {ImageData() Uint8ClampedArray} data
 */
function raster2dem(data) {
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
 * Transforms raster array into aspect values in degrees
 * @param {Int16Array} dem
 */
export function raster2aspect(raster) {
	const dem = raster2dem(raster);

	const aspects = new Float32Array(256 * 256);

	var x, y, dx, dy, i, j;

	for (x = 1; x < 255; x++) {
		for (y = 1; y < 255; y++) {
			i = y * 256 + x;

			dx =
				(dem[i - 255] +
					2 * dem[i + 1] +
					dem[i + 257] -
					(dem[i - 257] + 2 * dem[i - 1] + dem[i + 255])) /
				8;
			dy =
				(dem[i + 255] +
					2 * dem[i + 256] +
					dem[i + 257] -
					(dem[i - 257] + 2 * dem[i - 256] + dem[i - 255])) /
				8;

			aspects[i] =
				dx !== 0
					? 90 - Math.atan2(dy, -dx) * (180 / Math.PI)
					: 90 - 90 * (dy > 0 ? 1 : -1);
		}
	}

	/** Shameless Hack:
	 * When calculating slope, we can't get values
	 * that are on the edge of a tile, as we can't
	 * get their neighbors.  Their neighbors are on
	 * a different tile.  Rather than trying to coordinate
	 * data between tiles, this loop takes the pixel
	 * 2 pixels deep from each edge and copies it to
	 * the edge pixel.  The hack is 1px wide and barely
	 * visible
	 */
	for (x = 0; x < 256; x++) {
		for (y = 0; y < 256; y++) {
			i = y * 256 + x;

			if (x === 0) {
				j = y * 256 + x + 1;
				aspects[i] = aspects[j];
			}
			if (x === 255) {
				j = y * 256 + x - 1;
				aspects[i] = aspects[j];
			}
			if (y === 0) {
				j = (y + 1) * 256 + x;
				aspects[i] = aspects[j];
			}
			if (y === 255) {
				j = (y - 1) * 256 + x;
				aspects[i] = aspects[j];
			}
		}
	}

	return aspects;
}

/**
 * Transforms Int16Array of elevation data into Uint8ClampedArray of rgba values
 * @param {Int16Array} dem
 */
export function shading(aspects) {
	var px = new Uint8ClampedArray(256 * 256 * 4);

	for (let i = 0; i < aspects.length; i++) {
		var hex = `#${hypsotint(aspects[i])}`;
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
	'9afb0c',
	'00ad43',
	'0068c0',
	'6c00a3',
	'ca009c',
	'ff5568',
	'ffab47',
	'f4fa00',
	'9afb0c',
];
var breakpoints = [
	0,
	22.5,
	67.5,
	112.5,
	157.5,
	202.5,
	247.5,
	292.5,
	337.5,
	360,
];

/**
 * Takes in an elevation value and outputs a hex color value based on the colors brackets
 * @param {Number} elevation
 */
function hypsotint(aspect) {
	let correctedAspect =
		aspect < 0 ? 360 + (aspect % 360) : aspect > 360 ? aspect % 360 : aspect;

	for (let i = 0; i < breakpoints.length - 1; i++) {
		if (
			breakpoints[i] < correctedAspect &&
			correctedAspect <= breakpoints[i + 1]
		) {
			return colors[i];
		}
	}

	return '00ad43';
}

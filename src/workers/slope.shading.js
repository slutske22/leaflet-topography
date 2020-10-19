import Rainbow from 'rainbowvis.js';

/**
 * Transforms ImageData() array of rgb encoded elevation values into elevation values in meters
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
 * Transforms dem array of elevation values into slope values in degrees
 * @param {Int16Array} dem
 */
export function raster2slopes(raster) {
	const dem = raster2dem(raster);

	const slopes = new Float32Array(256 * 256);

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

			slopes[i] = Math.atan(Math.sqrt(dx * dx + dy * dy));
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
				slopes[i] = slopes[j];
			}
			if (x === 255) {
				j = y * 256 + x - 1;
				slopes[i] = slopes[j];
			}
			if (y === 0) {
				j = (y + 1) * 256 + x;
				slopes[i] = slopes[j];
			}
			if (y === 255) {
				j = (y - 1) * 256 + x;
				slopes[i] = slopes[j];
			}
		}
	}

	return slopes;
}

/**
 * Transforms Int16Array of elevation data into Uint8ClampedArray of rgba values
 * @param {Int16Array} dem
 */
export function shading(slopes) {
	var px = new Uint8ClampedArray(256 * 256 * 4);

	var gradient = new Rainbow();
	gradient.setNumberRange(0, Math.PI / 2);
	gradient.setSpectrum('black', 'white');

	for (let i = 0; i < slopes.length; i++) {
		var hex = `#${gradient.colorAt(slopes[i])}`;
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

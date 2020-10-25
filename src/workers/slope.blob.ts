// Build a worker from an anonymous function body
export default URL.createObjectURL(
	new Blob(
		[
			'(',

			function () {
				self.dems = {};
				onmessage = function (e) {
					const { customization, RainbowAsString } = e.data;
					const rainbowCreator = new Function('return ' + RainbowAsString);
					const Rainbow = rainbowCreator();

					self.slopeshades = {};

					if (e.data === 'clear') {
						self.slopeshades = {};
						return;
					}

					if (e.data.raster) {
						const { data } = e.data.raster;
						self.slopeshades[e.data.id] = raster2slopes(data);
						self.shades = shading(
							Rainbow,
							self.slopeshades[e.data.id],
							customization
						);
					}

					postMessage({
						id: e.data.id,
						message: 'from worker',
						ele: self.slopeshades[e.data.id],
						shades: self.shades,
					});
				};

				function raster2dem(data) {
					const dem = new Int16Array(256 * 256);

					var x, y, i, j;

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

				function raster2slopes(raster) {
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

							slopes[i] =
								(Math.atan(Math.sqrt(dx * dx + dy * dy)) * 180) /
								Math.PI;
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

				function shading(Rainbow, slopes, customization) {
					let continuous = true,
						userColors,
						userBreakpoints,
						fallback;

					if (customization) {
						continuous =
							customization.continuous === undefined
								? true
								: customization.continuous;
						userColors = customization.colors;
						userBreakpoints = customization.breakpoints;
						fallback = customization.fallback;
					}

					function hexToR(h) {
						return parseInt(cutHex(h).substring(0, 2), 16);
					}
					function hexToG(h) {
						return parseInt(cutHex(h).substring(2, 4), 16);
					}
					function hexToB(h) {
						return parseInt(cutHex(h).substring(4, 6), 16);
					}
					function cutHex(h) {
						return h.charAt(0) == '#' ? h.substring(1, 7) : h;
					}

					var colors = userColors || ['#000000', '#FFFFFF'];

					var start = 0,
						end = 90,
						range = end - start,
						bracket = range / (colors.length - 1);

					var derivedBreakpoints = (() => {
						let group = [];
						for (let i = 0; i < colors.length - 1; i++) {
							let breakpoint = i * bracket;
							group.push(breakpoint);
						}
						group.push(end);
						return group;
					})();

					var breakpoints = userBreakpoints || derivedBreakpoints;

					var gradients = (() => {
						var collection = [];

						for (let i = 0; i < breakpoints.length - 1; i++) {
							var rainbow = new Rainbow();
							rainbow.setNumberRange(breakpoints[i], breakpoints[i + 1]);
							rainbow._numberRange = [
								breakpoints[i],
								breakpoints[i + 1],
							];
							rainbow.setSpectrum(colors[i], colors[i + 1]);
							rainbow._spectrum = [colors[i], colors[i + 1]];
							collection.push(rainbow);
						}

						return collection;
					})();

					// console.log(
					// 	'colors',
					// 	colors,
					// 	'breakpoints',
					// 	breakpoints,
					// 	'gradients',
					// 	gradients
					// );

					function hypsotint(slope) {
						for (let i = 0; i < breakpoints.length - 1; i++) {
							if (
								breakpoints[i] < slope &&
								slope <= breakpoints[i + 1]
							) {
								return continuous
									? gradients[i].colorAt(slope)
									: colors[i];
							}
						}

						return fallback || colors[0];
					}

					var px = new Uint8ClampedArray(256 * 256 * 4);

					for (let i = 0; i < slopes.length; i++) {
						var color = (slopes[i] * 255) / (Math.PI / 2);
						var hex = `${hypsotint(slopes[i])}`;

						px[4 * i + 0] = hexToR(hex);
						px[4 * i + 1] = hexToG(hex);
						px[4 * i + 2] = hexToB(hex);
						px[4 * i + 3] = 255;
					}

					return px;
				}
			}.toString(),

			')()',
		],
		{ type: 'application/javascript' }
	)
);

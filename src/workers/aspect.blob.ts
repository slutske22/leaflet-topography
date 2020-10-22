// Build a worker from an anonymous function body
export default URL.createObjectURL(
	new Blob(
		[
			'(',

			function () {
				self.slopeaspects = {};

				onmessage = function (e) {
					if (e.data.raster) {
						const { data } = e.data.raster;
						self.slopeaspects[e.data.id] = raster2slopeaspect(data);
						self.shades = shading(
							self.slopeaspects[e.data.id].slopes,
							self.slopeaspects[e.data.id].aspects
						);
					}

					postMessage({
						id: e.data.id,
						message: 'from worker',
						ele: self.slopeaspects[e.data.id],
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

				function raster2slopeaspect(raster) {
					const dem = raster2dem(raster);

					const aspects = new Float32Array(256 * 256);
					const slopes = new Float32Array(256 * 256);

					var x, y, dx, dy, i;

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
								aspects[i] = aspects[j];
								slopes[i] = slopes[j];
							}
							if (x === 255) {
								j = y * 256 + x - 1;
								aspects[i] = aspects[j];
								slopes[i] = slopes[j];
							}
							if (y === 0) {
								j = (y + 1) * 256 + x;
								aspects[i] = aspects[j];
								slopes[i] = slopes[j];
							}
							if (y === 255) {
								j = (y - 1) * 256 + x;
								aspects[i] = aspects[j];
								slopes[i] = slopes[j];
							}
						}
					}

					return { slopes, aspects };
				}

				function shading(slopes, aspects) {
					var px = new Uint8ClampedArray(256 * 256 * 4);

					for (let i = 0; i < aspects.length; i++) {
						var rgb = hypsotint(slopes[i], aspects[i]);

						px[4 * i + 0] = rgb.R;
						px[4 * i + 1] = rgb.G;
						px[4 * i + 2] = rgb.B;
						px[4 * i + 3] = 255;
					}

					return px;
				}

				var colorsrgb = [
					{ R: '154', G: '251', B: '012' },
					{ R: '000', G: '173', B: '067' },
					{ R: '000', G: '104', B: '192' },
					{ R: '108', G: '000', B: '163' },
					{ R: '202', G: '000', B: '156' },
					{ R: '255', G: '085', B: '104' },
					{ R: '255', G: '171', B: '071' },
					{ R: '244', G: '250', B: '000' },
					{ R: '154', G: '251', B: '012' },
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

				function hypsotint(slope, aspect) {
					let correctedAspect =
						aspect < 0
							? 360 + (aspect % 360)
							: aspect > 360
							? aspect % 360
							: aspect;

					for (let i = 0; i < breakpoints.length - 1; i++) {
						if (
							breakpoints[i] < correctedAspect &&
							correctedAspect <= breakpoints[i + 1]
						) {
							return colorsrgb[i];
						}
					}

					return { R: '154', G: '251', B: '012' };
				}
			}.toString(),

			')()',
		],
		{ type: 'application/javascript' }
	)
);

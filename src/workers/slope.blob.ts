// Build a worker from an anonymous function body
export default URL.createObjectURL(
	new Blob(
		[
			'(',

			function () {
				self.dems = {};
				onmessage = function (e) {
					self.slopeshades = {};

					if (e.data === 'clear') {
						self.slopeshades = {};
						return;
					}

					if (e.data.raster) {
						const { data } = e.data.raster;
						self.slopeshades[e.data.id] = raster2slopes(data);
						self.shades = shading(self.slopeshades[e.data.id]);
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

				function shading(slopes) {
					var px = new Uint8ClampedArray(256 * 256 * 4);

					for (let i = 0; i < slopes.length; i++) {
						var color = (slopes[i] * 255) / (Math.PI / 2);

						px[4 * i + 0] = color;
						px[4 * i + 1] = color;
						px[4 * i + 2] = color;
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

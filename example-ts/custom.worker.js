// Build a worker from an anonymous function body
export default URL.createObjectURL(
	new Blob(
		[
			'(',

			function () {
				self.dems = {};

				onmessage = function (e) {
					if (e.data === 'clear') {
						self.dems = {};
						return;
					}

					if (e.data.raster) {
						const { data } = e.data.raster;
						const { customization } = e.data;
						self.dems[e.data.id] = raster2dem(data);
						self.shades = shading(self.dems[e.data.id], customization);
					}

					postMessage({
						id: e.data.id,
						shades: self.shades,
					});
				};

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
				 * Transforms Int16Array of elevation data into Uint8ClampedArray of rgba values
				 * @param {Int16Array} dem
				 */
				function shading(dem, customization) {
					let color = [135, 206, 250, 1],
						threshhold = 3;
					if (customization) {
						color = customization.color;
						threshhold = customization.threshhold;
					}

					var px = new Uint8ClampedArray(256 * 256 * 4);

					for (let i = 0; i < dem.length; i++) {
						let rgba;

						if (dem[i] > 0 && dem[i] >= threshhold) {
							console.log('in here');
							rgba = color;
						} else {
							rgba = [0, 0, 0, 0];
						}

						px[4 * i + 0] = rgba[0];
						px[4 * i + 1] = rgba[1];
						px[4 * i + 2] = rgba[2];
						px[4 * i + 3] = rgba[3];
					}

					return px;
				}
			}.toString(),

			')()',
		],
		{ type: 'application/javascript' }
	)
);

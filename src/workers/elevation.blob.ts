// Build a worker from an anonymous function body
export default URL.createObjectURL(
	new Blob(
		[
			'(',

			function () {
				onmessage = function (e) {
					self.dems = {};

					if (e.data.raster) {
						const { customization, RainbowAsString } = e.data;
						const rainbowCreator = new Function(
							'return ' + RainbowAsString
						);
						const Rainbow = rainbowCreator();
						const { data } = e.data.raster;
						self.dems[e.data.id] = raster2dem(data);
						self.shades = shading(
							Rainbow,
							self.dems[e.data.id],
							customization
						);
					}

					postMessage({
						id: e.data.id,
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

				function shading(Rainbow, dem, customization) {
					let continuous = true,
						breaksAt0 = true,
						userColors,
						userBreakpoints,
						fallback;

					if (customization) {
						continuous =
							customization.continuous === undefined
								? true
								: customization.continuous;
						breaksAt0 = customization.breaksAt0 =
							customization.breaksAt0 === undefined
								? true
								: customization.breaksAt0;
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

					var colors = userColors || [
						'#164A5B',
						'#75CFEC',
						'#FCFFA0',
						'#008000',
						'#855723',
						'#006400',
						'#493829',
						'#3d3d3d',
						'#ffffff',
					];

					var colorsHashless = colors.map((color) => {
						const hashless = color.substring(1);
						return hashless;
					});

					const start = -850,
						end = 8700,
						range = end - start,
						bracket = range / (colors.length - 1);

					const derivedBreakpoints = (() => {
						let group = [];
						for (let i = 0; i < colors.length - 1; i++) {
							let breakpoint = start + i * bracket;
							group.push(breakpoint);
							group.sort((a, b) => a - b);
						}
						group.push(end);
						return group;
					})();

					const backupBreakpoints = [
						-850,
						0,
						300,
						800,
						1500,
						2400,
						5000,
						7200,
						8700,
					];

					var breakpoints = (() => {
						if (userBreakpoints) {
							return userBreakpoints;
						} else {
							return userColors ? derivedBreakpoints : backupBreakpoints;
						}
					})();

					if (breaksAt0 && !breakpoints.includes(0)) {
						breakpoints.push(0);
						breakpoints.sort((a, b) => a - b);
					}

					var gradients = continuous
						? (() => {
								var collection = [];

								for (let i = 0; i < breakpoints.length - 1; i++) {
									var rainbow = new Rainbow();
									rainbow.setNumberRange(
										breakpoints[i],
										breakpoints[i + 1]
									);
									rainbow._numberRange = [
										breakpoints[i],
										breakpoints[i + 1],
									];

									// discontinuous use of colors between negative and position values
									if (!breaksAt0) {
										rainbow.setSpectrum(colors[i], colors[i + 1]);
										rainbow._spectrum = [colors[i], colors[i + 1]];
									} else if (breaksAt0 && i < breakpoints.length - 2) {
										if (i === 0) {
											rainbow.setSpectrum(colors[i], colors[i + 1]);
											rainbow._spectrum = [colors[i], colors[i + 1]];
										} else {
											if (
												i === 1 &&
												userColors &&
												!userBreakpoints
											) {
												colors.push(colors[colors.length - 1]);
											}
											rainbow.setSpectrum(
												colors[i + 1],
												colors[i + 2]
											);
											rainbow._spectrum = [
												colors[i + 1],
												colors[i + 2],
											];
										}
									}

									collection.push(rainbow);
								}

								return collection;
						  })()
						: null;

					// console.log(
					// 	'colors',
					// 	colors,
					// 	'breakpoints',
					// 	breakpoints,
					// 	'gradients',
					// 	gradients
					// );

					function hypsotint(elevation) {
						for (let i = 0; i < breakpoints.length - 1; i++) {
							if (
								breakpoints[i] < elevation &&
								elevation <= breakpoints[i + 1]
							) {
								return continuous
									? gradients[i].colorAt(elevation)
									: colorsHashless[i];
							}
						}

						return fallback || '#000000';
					}

					var px = new Uint8ClampedArray(256 * 256 * 4);

					for (let i = 0; i < dem.length; i++) {
						var hex = `#${hypsotint(dem[i])}`;

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

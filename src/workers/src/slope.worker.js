import { raster2slopes, shading } from './slope.shading.js';

self.slopeshades = {};

onmessage = function (e) {
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

import { raster2aspect, shading } from './aspect.shading.js';

self.aspects = {};

onmessage = function (e) {
	if (e.data === 'clear') {
		self.dems = {};
		return;
	}

	if (e.data.raster) {
		const { data } = e.data.raster;
		self.aspects[e.data.id] = raster2aspect(data);
		self.shades = shading(self.aspects[e.data.id]);
	}

	postMessage({
		id: e.data.id,
		message: 'from worker',
		ele: self.aspects[e.data.id],
		shades: self.shades,
	});
};

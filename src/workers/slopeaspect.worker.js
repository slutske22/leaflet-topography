import { raster2slopeaspect, shading } from './slopeaspect.shading.js';

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

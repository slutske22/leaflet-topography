import { GridLayer, DomUtil } from 'leaflet';
import workers from './workers/blobs';

import * as ElevationWorker from './workers/dem.worker.js';
import * as SlopeWorker from './workers/slope.worker.js';
import * as AspectWorker from './workers/aspect.worker.js';
import * as SlopeAspectWorker from './workers/slopeaspect.worker.js';

// const elevationworker = new Worker(
// 	new URL('./workers/dem.worker.js', import.meta.url)
// );
// const slopeworker = new Worker(
// 	new URL('./workers/slope.worker.js', import.meta.url)
// );
// const aspectworker = new Worker(
// 	new URL('./workers/aspect.worker.js', import.meta.url)
// );
// const slopeaspectworker = new Worker(
// 	new URL('./workers/slopeaspect.worker.js', import.meta.url)
// );

// const workers = {
// 	elevation: elevationworker,
// 	slope: slopeworker,
// 	aspect: aspectworker,
// 	slopeaspect: slopeaspectworker,
// };

// const workers = {
// 	elevation: ElevationWorker,
// 	slope: SlopeWorker,
// 	aspect: AspectWorker,
// 	slopeaspect: SlopeAspectWorker,
// };

var uniqueId = (function () {
	var lastId = 0;
	return function () {
		return ++lastId;
	};
})();

const TopoLayer = GridLayer.extend({
	// add worker initialization to beforeAdd Method
	beforeAdd: function (map) {
		map._addZoomLimit(this);

		// object to hold canvas contexts as they are created and updated
		this._contexts = {};

		// array to recieve worker objects when they get created
		this._workers = [];

		// grab topotype from options
		const { topotype } = this.options;

		// create workers
		for (let i = 0; i < 16; i++) {
			var number = i < 9 ? `0${i + 1}` : i + 1;
			this._workers[i] = new Worker(workers[topotype], {
				name: `Worker ${topotype} ${number}`,
			});
			this._workers[i].onmessage = (e) => this.updateTile(e, this);
		}
	},

	onRemove: function (map) {
		// terminate all workers when layer is removed
		for (let i = 0; i < 16; i++) {
			this._workers[i].terminate();
		}
		// original leaflet code:
		this._removeAllTiles();
		DomUtil.remove(this._container);
		map._removeZoomLimit(this);
		this._container = null;
		this._tileZoom = undefined;
	},

	// createTile method required - creates a new tile of the gridlayer
	createTile: function (coords) {
		const { token } = this.options;

		var tile = <HTMLCanvasElement>DomUtil.create('canvas', 'leaflet-tile');
		var size = this.getTileSize();
		tile.width = size.x;
		tile.height = size.y;

		var ctx = tile.getContext('2d');
		var demCtx;
		var id = uniqueId();

		this._contexts[id] = ctx;

		// define a new image element and its attributes
		var demImg = new Image();
		var { x, y, z } = coords;
		demImg.crossOrigin = '*';
		demImg.onload = function () {
			var c = document.createElement('canvas');
			c.width = c.height = 256;
			demCtx = c.getContext('2d');
			demCtx.drawImage(demImg, 0, 0);
			redraw();
		};
		demImg.src = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${token}`;

		const redraw = () => {
			var data = {
				id: id,
				raster: demCtx.getImageData(0, 0, 256, 256),
			};

			var workerIndex = (x + y) % this._workers.length;
			this._workers[workerIndex].postMessage(data);
		};

		return tile;
	},

	updateTile: function (e, instance) {
		var ctx = instance._contexts[e.data.id];
		var imgData = ctx.createImageData(256, 256);

		var shades = e.data.shades;
		imgData.data.set(shades);
		ctx.putImageData(imgData, 0, 0);
	},
});

export default TopoLayer;

import L from 'leaflet';
import type { Map, LatLng } from 'leaflet';
import config from './config';
import type { UserOptions } from './types';

async function getTopography(
	latlng: LatLng,
	map: Map,
	userOptions: UserOptions
) {
	//
	const options = Object.assign(config, userOptions);
	const { scale, priority } = options;

	const point = map.project(latlng, scale);

	const pixelDiff = 2;

	const projectedN = { ...point, y: point.y - pixelDiff },
		projectedS = { ...point, y: point.y + pixelDiff },
		projectedE = { ...point, x: point.x + pixelDiff },
		projectedW = { ...point, x: point.x - pixelDiff };

	const N = map.unproject(projectedN, scale),
		S = map.unproject(projectedS, scale),
		E = map.unproject(projectedE, scale),
		W = map.unproject(projectedW, scale);

	const elePoint = getElevation(point, priority),
		eleN = getElevation(projectedN, priority),
		eleS = getElevation(projectedS, priority),
		eleE = getElevation(projectedE, priority),
		eleW = getElevation(projectedW, priority);

	const dx = map.distance(E, W),
		dy = map.distance(N, S);

	const dzdx = (eleE - eleW) / dx,
		dzdy = (eleN - eleS) / dy;

	const slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);
	const aspect =
		dx !== 0
			? 90 - Math.atan2(dzdy, dzdx) * (180 / Math.PI)
			: 90 - 90 * (dy > 0 ? 1 : -1);

	return { elevation: elePoint, slope, aspect };
	//
}

/*
 * Takes in a projected point and returns an elevation
 * @param {Object} point | L.Point projected point from map.project(LatLng, Zoom)
 */
function getElevation(point, priority) {
	// const { DEMTiles } = store.getState().data.topography;
	// const { priority } = store.getState().firestarter.config;
	const { X, Y, Z } = getTileCoord(point);
	const tileName = `X${X}Y${Y}Z${Z}`;
	const tile = DEMTiles[tileName];

	if (!tile) {
		console.log('theres no tile');
		fetchDEMTile({ X, Y, Z }, priority);
		return;
	}

	const xyPositionOnTile = {
		x: Math.floor(point.x) - X * 256,
		y: Math.floor(point.y) - Y * 256,
	};

	var RGBA;

	if (priority === 'speed') {
		// Tile data already saved as Uint8ClampedArray, just need to pull the RGBA values, quick for high volumes

		RGBA = getRGBfromImgData(tile, xyPositionOnTile.x, xyPositionOnTile.y);
	} else {
		//
		// if (priority === "storage")
		// Tile data in form of ImageBitMap, need to call .getImageData for coordinate, much slower for high volumes
		//
		var canvas = document.createElement('canvas');
		var c = canvas.getContext('2d');
		c.drawImage(tile, 0, 0);
		var pixelData = c.getImageData(
			xyPositionOnTile.x,
			xyPositionOnTile.y,
			1,
			1
		).data;

		RGBA = {
			R: pixelData[0],
			G: pixelData[1],
			B: pixelData[2],
			A: pixelData[3],
		};
	}

	const { R, G, B } = RGBA;

	return -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
}

/**
 * Takes in ImageData object (created when saving a tile to the store), and xy coordinate
 * of point on tile, returns RGBA value of that pixel from that ImageData's Uint8ClampedArray
 * @param {ImageData Object} imgData | imagedata from tile
 * @param {Number} x | x position on tile of coordinate
 * @param {Number} y | y position on tile of coordinate
 */
function getRGBfromImgData(imgData: ImageData, x: number, y: number) {
	var index = y * imgData.width + x;
	var i = index * 4;
	var d = imgData.data;
	return { R: d[i], G: d[i + 1], B: d[i + 2], A: d[i + 3] };
}

export async function fetchDEMTile(tileCoord, priority) {
	const { x, y, z } = tileCoord;
	const imageUrl = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${x}/${y}.pngraw?access_token=${Mapbox_Access_Token}`;
	const tileName = `X${x}Y${y}Z${z}`;

	// Create a canvas, so I can write the image data to it and then call getImageData on it
	var transferCanvas = document.createElement('canvas');
	transferCanvas.width = transferCanvas.height = 256;
	var c = transferCanvas.getContext('2d');

	await loadImage(imageUrl).then((image) => {
		if (priority === 'speed') {
			//
			// MORE STORAGE BUT MUCH FASTER
			// Draw the image to a canvas and then use Canvas2DContext.getImageData to pull the RGBA data
			// in the form of a Uint8Clamped array for the entire tile
			c.drawImage(image, 0, 0, 256, 256);
			var pixelData = c.getImageData(0, 0, 256, 256);
			store.dispatch(saveTile(pixelData, tileName));
		} else {
			//
			// if (priority === "storage")
			// LESS STORAGE NEEDED BUT MUCH SLOWER:
			// Write the image to an ImageBitMap and then call .getImageData for each pixel inside the getElevation function
			createImageBitmap(image, 0, 0, 256, 256).then((ibm) =>
				store.dispatch(saveTile(ibm, tileName))
			);
		}
	});
}

/**
 * Takes in image src url as string, returns promise that resolves when image is loaded
 * Async await version of Image().onload
 * @param {string} src | url string of image to load
 */
function loadImage(src: string) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = '*';
		img.addEventListener('load', () => resolve(img));
		img.addEventListener('error', (err) => reject(err));
		img.src = src;
	});
}

/**
 * Take in a projection point and return the tile coordinates { X, Y, Z } of that point
 * @param {Object} projectedPoint | L.Point { x, y }
 * @param {Number} zoom | Zoom value
 */
function getTileCoord(projectedPoint, zoom: number = 15) {
	return {
		X: Math.floor(projectedPoint.x / 256),
		Y: Math.floor(projectedPoint.y / 256),
		Z: zoom,
	};
}

export default getTopography;

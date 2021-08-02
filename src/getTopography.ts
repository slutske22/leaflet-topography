import * as L from 'leaflet';
import type { LatLng } from 'leaflet';
import configure, { _config } from './config';
import { fetchDEMTile } from './utils';
import type { ConfigOptions } from './types';

/**
 * Takes in an L.LatLng and returns { elevation, slope, aspect }
 * @param {Object} latlng | L.LatLng
 * @param userOptions | user options
 */
async function getTopography(
	latlng: LatLng,
	userOptions?: Partial<ConfigOptions>
) {
	//
	// SETUP:
	// merge options from configuration _config with option passed in current function call
	const options = Object.assign(_config, userOptions);
	const { tilesUrl, scale, spread, priority, token, retrieveTile, saveTile } =
		options;

	// Sound alarms if certain config options are not given by user
	if (!tilesUrl && !token) {
		throw new Error(
			`You must provide either a 'tilesUrl' or 'token' proerty in leaflet-topography config / options`
		);
	}

	/**
	 * Takes in a projected point and returns an elevation
	 * @param {Object} point | L.Point
	 */
	async function getElevation(point: { x: number; y: number }) {
		//
		const { X, Y, Z } = getTileCoord(point);
		const tileName = `X${X}Y${Y}Z${Z}`;

		// get the tile from the cache
		const tile = retrieveTile(tileName);

		// if tile doesn't yet exist, fetch it, wait until its fetched, and rerun this function
		if (!tile) {
			await fetchDEMTile({ X, Y, Z }, { tilesUrl, priority, token, saveTile });
			return await getElevation(point);
		}

		const xyPositionOnTile = {
			x: Math.floor(point.x) - X * 256,
			y: Math.floor(point.y) - Y * 256,
		};

		var RGBA;

		if (priority === 'speed') {
			// Tile data already saved as Uint8ClampedArray, just need to pull the RGBA values, quick for high volumes
			RGBA = getRGBfromImgData(
				tile as ImageData,
				xyPositionOnTile.x,
				xyPositionOnTile.y
			);
		} else {
			// if (priority === "storage")
			// Tile data in form of ImageBitMap, need to call .getImageData for coordinate, much slower for high volumes
			var canvas = document.createElement('canvas');
			canvas.width = canvas.height = 256;
			var c = canvas.getContext('2d');
			c.drawImage(tile as ImageBitmap, 0, 0);
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

		return _config.heightFunction
			? _config.heightFunction(R, G, B)
			: -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
	}

	/**
	 * Takes in ImageData object (created when saving a tile to the store), and xy coordinate
	 * of point on tile, returns RGBA value of that pixel from that ImageData's Uint8ClampedArray
	 * @param {Object} imgData
	 * @param {Number} x
	 * @param {Number} y
	 */
	function getRGBfromImgData(imgData: ImageData, x: number, y: number) {
		var index = y * imgData.width + x;
		var i = index * 4;
		var d = imgData.data;
		return { R: d[i], G: d[i + 1], B: d[i + 2], A: d[i + 3] };
	}

	/**
	 * Take in a projection point and return the tile coordinates { X, Y, Z } of that point
	 * @param {Object} projectedPoint
	 */
	function getTileCoord(projectedPoint: { x: number; y: number }) {
		return {
			X: Math.floor(projectedPoint.x / 256),
			Y: Math.floor(projectedPoint.y / 256),
			Z: scale,
		};
	}

	// -------------------------------------------------------------- //
	//                                                                //
	//       Central getTopography function using mapbox:             //
	//                                                                //
	// -------------------------------------------------------------- //
	const point = L.CRS.EPSG3857.latLngToPoint(latlng, scale);

	const pixelDiff = spread;

	const projectedN = { ...point, y: point.y - pixelDiff },
		projectedS = { ...point, y: point.y + pixelDiff },
		projectedE = { ...point, x: point.x + pixelDiff },
		projectedW = { ...point, x: point.x - pixelDiff };

	// @ts-ignore - ts complaining at me about projectedXs not being proper L.Point types
	const N = L.CRS.EPSG3857.pointToLatLng(projectedN, scale);
	// @ts-ignore
	const S = L.CRS.EPSG3857.pointToLatLng(projectedS, scale);
	// @ts-ignore
	const E = L.CRS.EPSG3857.pointToLatLng(projectedE, scale);
	// @ts-ignore
	const W = L.CRS.EPSG3857.pointToLatLng(projectedW, scale);

	const elevation = await getElevation({ x: point.x, y: point.y }),
		eleN = await getElevation(projectedN),
		eleS = await getElevation(projectedS),
		eleE = await getElevation(projectedE),
		eleW = await getElevation(projectedW);

	const dx = E.distanceTo(W),
		dy = N.distanceTo(S);

	const dzdx = (eleE - eleW) / dx,
		dzdy = (eleN - eleS) / dy;

	const resolution = (dx + dy) / 2;

	const slope = Math.atan(Math.sqrt(dzdx ** 2 + dzdy ** 2)) * (180 / Math.PI);
	const aspect =
		dx !== 0
			? (Math.atan2(dzdy, dzdx) * (180 / Math.PI) + 180) % 360
			: (90 * (dy > 0 ? 1 : -1) + 180) % 360;

	return { elevation, slope, aspect, resolution };
}

export default getTopography;

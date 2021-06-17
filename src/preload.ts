import xyz from 'xyz-affair';
import type { LatLngBounds } from 'leaflet';
import { _config } from './config';
import { fetchDEMTile } from './utils';

/**
 * Takes in array of LatLngBounds objects and returns array of XYZ coordinate objects
 * for all maptiles in those bounds
 * @param {Array} latLngBoundsArray | Array of LatLngBounds objects
 * @param {Number} scale | Map zoom value for which you want to get tile coords
 */
function getTileCoords(latLngBoundsArray: LatLngBounds[], scale: number) {
	var allTileCoordsUnfiltered = [];

	latLngBoundsArray.forEach((latlngBounds) => {
		const south = latlngBounds.getSouth(),
			north = latlngBounds.getNorth(),
			east = latlngBounds.getEast(),
			west = latlngBounds.getWest();

		const boundsAsArray = [
			[west, south],
			[east, north],
		];

		const tileCoords = xyz(boundsAsArray, scale);

		allTileCoordsUnfiltered = [...allTileCoordsUnfiltered, ...tileCoords];
	});

	// filter duplicate values
	const filteredTileCoords = allTileCoordsUnfiltered.filter(
		(elem, index, self) =>
			self.findIndex((t) => {
				return t.x === elem.x && t.y === elem.y && t.z === elem.z;
			}) === index
	);

	return filteredTileCoords;
}

const preload = async (bounds: LatLngBounds[], userOptions) => {
	const options = Object.assign(_config, userOptions);
	const { tilesUrl, token, scale, priority, saveTile } = options;

	const tileCoords = getTileCoords(bounds, scale);

	tileCoords.forEach(async ({ x, y, z }) => {
		const coord = { X: x, Y: y, Z: z };
		await fetchDEMTile(coord, { tilesUrl, priority, token, saveTile });
	});
};

export default preload;

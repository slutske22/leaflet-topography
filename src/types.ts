import type { Map } from 'leaflet';

export type Priority = 'storage' | 'speed';
export type SaveTile = (name: string, tiledata: ImageData | ImageBitmap) => any;

export interface ConfigOptions {
	/**
	 * The zoom level of the tiles to be used
	 */
	scale: number;
	/**
	 * How many pixels apart between pixels being used in calculations
	 */
	spread: number;
	/**
	 * Whether or not to prioritize speed or in-memory storage when storing tile data
	 */
	priority: Priority;
	/**
	 * Custom function to save DEM tile data to a non-default location
	 */
	saveTile: SaveTile;
	/**
	 * Custom function to retrieve DEM tile data from a non-default location
	 */
	retrieveTile: (name: string) => ImageData | ImageBitmap;
	/**
	 * Custom tile URL to use if not using standard Mapbox RGB-encoded DEM tiles
	 */
	tilesUrl?: string;
	/**
	 * Mapbox API Token
	 */
	token?: string;
	/**
	 * Custom height function to be used, if using a custom tile URL
	 */
	heightFunction?: (R: number, G: number, B: number) => number;
}

export interface TileCoord {
	X: number;
	Y: number;
	Z: number;
}

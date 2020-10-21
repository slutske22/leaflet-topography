import type { Map } from 'leaflet';

export type Priority = 'storage' | 'speed';
export type SaveTile = (name: string, tiledata: ImageData | ImageBitmap) => any;

export interface ConfigOptions {
	service?: 'mapbox' | 'esri';
	scale: number;
	spread: number;
	priority: Priority;
	saveTile: SaveTile;
	retrieveTile: (name: string) => ImageData | ImageBitmap;
	_tileCache: any;
}

export interface UserOptions extends ConfigOptions {
	token: string;
	map: Map;
}

export interface TileCoord {
	X: number;
	Y: number;
	Z: number;
}

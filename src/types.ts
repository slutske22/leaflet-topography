import type { Map } from 'leaflet';

export type Priority = 'storage' | 'speed';
export type SaveTile = (name: string, tiledata: ImageData | ImageBitmap) => any;

export interface ConfigOptions {
	scale: number;
	spread: number;
	priority: Priority;
	saveTile: SaveTile;
	retrieveTile: (name: string) => ImageData | ImageBitmap;
	map?: Map;
	tilesUrl?: string;
	token?: string;
	heightFunction?: (R: number, G: number, B: number) => number;
}

export interface TileCoord {
	X: number;
	Y: number;
	Z: number;
}

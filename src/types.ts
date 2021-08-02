import type { GridLayerOptions } from 'leaflet';

/**
 * Whether or not to prioritize speed or in-memory storage when storing tile data
 * Value of 'storage' will save in-memory storage by storing tile data as ImageBitMaps
 * Value of 'speed' will be faster by storing tile data as canvas ImageData
 */
export type Priority = 'storage' | 'speed';

/**
 * Custom function to save DEM tile data to a non-default location
 */
export type SaveTile = (name: string, tiledata: ImageData | ImageBitmap) => any;

/**
 * Configuration options
 */
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

/**
 * Options for creating a new TopoLayer
 */
export interface TopoLayerOptions
	extends GridLayerOptions,
		Partial<ConfigOptions> {
	/**
	 * What type of TopoLayer we want to create
	 */
	topotype: 'elevation' | 'slope' | 'aspect' | 'slopeaspect' | 'custom';
	/**
	 * Customization object for customizing colorization of TopoLayer
	 */
	customization?: {
		colors?: string[];
		breakpoints?: number[];
		continuous?: boolean;
		breaksAt0?: boolean;
		fallback?: string;
		heightFunction?: (R: number, G: number, B: number) => number;
	};
	/**
	 * Potential to add custom worker script in the user's desired format
	 */
	worker?: any;
}

/**
 * Simple tile coordinate type
 */
export interface TileCoord {
	X: number;
	Y: number;
	Z: number;
}

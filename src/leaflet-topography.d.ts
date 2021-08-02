import * as L from 'leaflet';
import { ConfigOptions, TopoLayerOptions } from './types';

declare function getTopography(
	latlng: L.LatLng,
	userOptions?: Partial<ConfigOptions>
): Promise<{
	elevation: any;
	slope: number;
	aspect: number;
	resolution: number;
}>;

declare function configure(userConfig: Partial<ConfigOptions>): ConfigOptions;

declare function preload(
	bounds: L.LatLngBounds[],
	userOptions?: any
): Promise<void>;

declare class TopoLayer extends L.GridLayer {
	constructor(options: TopoLayerOptions);
}

declare module 'leaflet' {
	export namespace Topography {
		export function getTopography(
			latlng: L.LatLng,
			userOptions?: Partial<ConfigOptions>
		): Promise<{
			elevation: any;
			slope: number;
			aspect: number;
			resolution: number;
		}>;

		export function configure(
			userConfig: Partial<ConfigOptions>
		): ConfigOptions;

		export function preload(
			bounds: L.LatLngBounds[],
			userOptions?: any
		): Promise<void>;

		export class TopoLayer extends L.GridLayer {
			constructor(options: TopoLayerOptions);
		}

		export const _config: ConfigOptions;

		export const _tileCache: {};
	}
}

export {
	getTopography,
	configure,
	preload,
	TopoLayer,
	ConfigOptions,
	TopoLayerOptions,
};

export default L.Topography;

import * as L from 'leaflet';
import { ConfigOptions } from './types';
import { TopoLayerOptions } from './TopoLayer';

declare module 'leaflet' {
	namespace Topography {
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

export default L.Topography;

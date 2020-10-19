import Topography from './index';
import { ConfigOptions } from './types';

export const tileCache = {};

const config: ConfigOptions = {
	service: 'mapbox',
	priority: 'speed',
	scale: 15,
	saveTile: (name, tileData) => (Topography.tileCache[name] = tileData),
	retrieveTile: undefined,
	tileCache,
};

export default config;

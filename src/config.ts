import Topography from './index';
import { ConfigOptions } from './types';

const config: ConfigOptions = {
	service: 'mapbox',
	priority: 'speed',
	scale: 15,
	saveTile: (name, tileData) => (Topography.tileCache[name] = tileData),
	retrieveTile: undefined,
	tileCache: Topography.tileCache,
};

export default config;

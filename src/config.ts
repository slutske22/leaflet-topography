import Topography from './index';
import { ConfigOptions } from './types';

// default cache for saving tiles
export const tileCache = {};

// function to set the _config of L.Topography
const config = (userConfig: ConfigOptions) => {
	const newConfig = Object.assign(_config, userConfig);
	_config = newConfig;
	return _config;
};

// configuration object, should not be modified directly, use config function below
export var _config: ConfigOptions = {
	service: 'mapbox',
	priority: 'speed',
	scale: 15,
	tileCache: tileCache,
};

export default config;

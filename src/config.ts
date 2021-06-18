import { ConfigOptions } from './types';

// default cache for saving tiles
export const _tileCache = {};

// function to set the _config of L.Topography
const configure = (userConfig: Partial<ConfigOptions>) => {
	const newConfig = Object.assign(_config, userConfig);
	_config = newConfig;
	return _config;
};

// configuration object, should not be modified directly, use config function below
export var _config: ConfigOptions = {
	scale: 14,
	spread: 4,
	priority: 'storage',
	saveTile: (name, tileData) => {
		_tileCache[name] = tileData;
	},
	retrieveTile: (tileName) => _tileCache[tileName],
	heightFunction: function (R, G, B) {
		return -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
	},
};

export default configure;

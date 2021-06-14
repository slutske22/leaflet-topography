import { ConfigOptions } from './types';

// default cache for saving tiles
export const _tileCache = {};

// function to set the _config of L.Topography
const configure = (userConfig: ConfigOptions) => {
	const newConfig = Object.assign(_config, userConfig);
	_config = newConfig;
	return _config;
};

// configuration object, should not be modified directly, use config function below
export var _config: ConfigOptions = {
	priority: 'storage',
	scale: 14,
	spread: 4,
	saveTile: (name: string, tileData: ImageData | ImageBitmap) =>
		(_tileCache[name] = tileData),
	retrieveTile: (tileName) => _tileCache[tileName],
};

export default configure;

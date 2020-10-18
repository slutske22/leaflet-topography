import { ConfigOptions } from './types';

const config: ConfigOptions = {
	service: 'mapbox',
	priority: 'storage',
	scale: 15,
	saveTile: (name, tiledata) =>
		localStorage.setItem(name, JSON.stringify(tiledata)),
	retrieveTile: (name) => localStorage.getItem(name),
};

export default config;

export interface ConfigOptions {
	service?: 'mapbox' | 'esri';
	scale?: number;
	priority: 'storage' | 'speed';
}

export interface UserOptions extends ConfigOptions {
	token: string;
}

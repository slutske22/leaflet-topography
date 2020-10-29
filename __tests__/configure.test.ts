import Topography from '../src';

describe('The configure function', () => {
	it('merges new options with the existing L.Topography._config', () => {
		const { configure, _config } = Topography;

		const userConfig = {
			map: 'someMap',
			token: 'someToken',
		};

		const newConfig = Topography.configure(userConfig);

		expect(_config).toEqual(newConfig);
	});
});

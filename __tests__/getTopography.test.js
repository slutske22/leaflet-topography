import assert from 'assert';
import L from 'leaflet';
import { getTopography } from '../src';

describe('getTopography', () => {
	global.URL.createObjectURL = jest.fn();

	it('returns a results object', () => {
		global.URL.createObjectURL = jest.fn(() => 'details');

		console.log('inside test');
	});
});

import assert from 'assert';
import L from 'leaflet';
import { getTopography } from '../src';

describe('getTopography', () => {
	it('returns a results object', async () => {
		console.log('inside test');

		const mapDiv = document.createElement('div');
		const map = L.map(mapDiv, { center: [0, 0], zoom: 12 });

		const token = process.env.MAPBOX_TOKEN;

		const results = await getTopography(
			{ lat: 32, lng: -117 },
			{ map, token }
		);

		console.log(results);
	});
});

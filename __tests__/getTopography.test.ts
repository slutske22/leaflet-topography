import L from 'leaflet';
import { getTopography } from '../src';
import * as utils from '../src/utils';

describe('getTopography', () => {
	it('getTopography returns a results object', () => {
		const mapDiv = document.createElement('div');
		const map = L.map(mapDiv, { center: [0, 0], zoom: 12 });

		const token = process.env.MAPBOX_TOKEN;

		// const pointToTest = {
		// 	lat: 20.64580398238765,
		// 	lng: -156.10152263641146,
		// };
		// const pointsTile = { X: 543, Y: 3615, Z: 13 };

		const mockImage = new Image();
		mockImage.src = './13-543-3615.png';

		utils.loadImage = jest.fn(() => Promise.resolve(mockImage));

		// getTopography(
		// 	// @ts-ignore
		// 	{ lat: 32, lng: -117 },
		// 	{ map, token }
		// ).then((results) => {
		// 	console.log(results);
		// 	expect(results).toBe(
		// 		expect.objectContaining({
		// 			elevation: expect.any(Number),
		// 			slope: expect.any(Number),
		// 			aspect: expect.any(Number),
		// 			resolution: expect.any(Number),
		// 		})
		// 	);
		// });

		utils.loadImage().then((img) => console.log(img));

		expect(utils.loadImage()).resolves.toEqual(mockImage);
	});
});

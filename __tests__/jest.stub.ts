import 'regenerator-runtime/runtime';
import dotenv from 'dotenv';

dotenv.config();

jest.setTimeout(30000);

// getTopography mocks
HTMLCanvasElement.prototype.getContext = () => {
	// return whatever getContext has to return
};

// TopoLayer mocks
if (typeof window.URL.createObjectURL === 'undefined') {
	window.URL.createObjectURL = () => {
		// Do nothing
	};
}

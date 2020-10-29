import 'regenerator-runtime/runtime';

if (typeof window.URL.createObjectURL === 'undefined') {
	window.URL.createObjectURL = () => {
		// Do nothing
		// Mock this function for mapbox-gl to work
	};
}

import * as L from 'leaflet';
import getTopography from './getTopography';

const Topography = {
	getTopography,
	tileCache: {},
};

L.Topography = Topography;

// @ts-ignore
if (window.L && !window.L.Topography) {
	L.Topography = Topography;
}

export { getTopography };

export default Topography;

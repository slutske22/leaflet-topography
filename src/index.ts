import L from 'leaflet';
import getTopography from './getTopography';

const Topography = {
	getTopography,
};

L.Topography = Topography;

// @ts-ignore
if (window.L && !window.L.Topography) {
	L.Topography = Topography;
}

export { getTopography };

export default Topography;

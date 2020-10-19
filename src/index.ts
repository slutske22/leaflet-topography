import L from 'leaflet';

// if in node dev environment, expect and use L to be available as peer dependency
// if in non-module environment, expect L to be available as global object
const Leaflet = L || window.L;

console.log('Leaflet', Leaflet);

import getTopography from './getTopography';
import config, { tileCache } from './config';

const Topography = {
	getTopography,
	tileCache,
};

Leaflet.Topography = Topography;

export { getTopography };

export default Topography;

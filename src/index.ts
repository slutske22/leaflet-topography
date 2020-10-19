import * as L from 'leaflet';
import getTopography from './getTopography';
import config, { _config, tileCache } from './config';

// if in node dev environment, expect and use L to be available as peer dependency
// if in non-module environment, expect L to be available as global object
const Leaflet = L || window.L;

export const Topography = {
	getTopography,
	tileCache,
	_config,
	config,
};

Leaflet.Topography = Topography;

export { getTopography };

export default Topography;

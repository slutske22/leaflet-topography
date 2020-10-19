import * as L from 'leaflet';
import getTopography from './getTopography';
import TopoLayer from './TopoLayer';
import configure, { _config, tileCache } from './config';

// if in node dev environment, expect and use L to be available as peer dependency
// if in non-module environment, expect L to be available as global object
const Leaflet = L || window.L;

export const Topography = {
	getTopography,
	tileCache,
	TopoLayer,
	_config,
	configure,
};

Leaflet.Topography = Topography;

export { getTopography, TopoLayer, configure };

export default Topography;

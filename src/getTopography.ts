import L from 'leaflet';
import type { LatLng } from 'leaflet'
import config from './config';

const getTopography = async (latLng: LatLng, userOptions) => {
	const options = Object.assign(config, userOptions);
};

export default getTopography;

import * as L from 'leaflet';

import { UserOptions } from './src/types';

declare module 'leaflet' {
	interface Topography {
		getTopography: (
			latlng: L.LatLng,
			userOptions: UserOptions
		) => Promise<{ elevation: number; slope: number; aspect: number }>;
		tileCache: object;
	}
}

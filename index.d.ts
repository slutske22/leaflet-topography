import * as L from 'leaflet';
import { ConfigOptions } from './src/types';

declare module 'leaflet' {
	interface Topography {
		getTopography: (
			latlng: L.LatLng,
			userOptions: ConfigOptions
		) => Promise<{ elevation: number; slope: number; aspect: number }>;
		tileCache: object;
	}
}

declare module 'worker-loader!*' {
	// You need to change `Worker`, if you specified a different value for the `workerType` option
	class WebpackWorker extends Worker {
		constructor();
	}

	// Uncomment this if you set the `esModule` option to `false`
	// export = WebpackWorker;
	export default WebpackWorker;
}

declare module 'file-loader?name=[name].js!*' {
	const value: string;
	export = value;
}

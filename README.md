<img width="100%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/banner.png">

<p align="center">
   <h1 align="center">leaflet-topography</h1>
</p>
<p align="center">
   <i align="center">a set of tools for calculating and visualizing topography in leafletjs</i>
   <h2 align="center"><a href="https://codesandbox.io/s/react-esri-leaflet-example-n15yn">&#128064; Demo &#128064;</a></h2>
</p>

leaflet-topography is a leaflet plugin which offers functions and layers for calculating and visuzalizing topographic data in a leaflet map. These tools are based on the [Mapbox RGB Encoded DEM](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb), which means you must use your mapbox access token to use these tools.

## Installation and Use

You can install leaflet-topography through npm:

```
npm i leaflet-topography
```

Or you can download `leaflet-topography.js` from the `/build` folder and include it anywhere in your project - either in your HTML `<head>` or by doing an `import './leaflet-topography.js'` in your project.  leaflet-topography will attach to the leaflet global `L`, and `L.Topography` will now be available for use.  You can also import relevant tools directly:

````javascript
import Topography, { getTopography, configure, TopoLayer } from 'leaflet-topography'
````
## Tools:

### `getTopography(latlng, options): { elevation, slope, aspect }`

This is leaflet-topography's central tool. This async function takes in an `L.LatLng` object, and a semi-optional configuration object, and returns a promise which resolves to the result, which contains elevation, slope, and aspect data for that `latlng`.  You can use `async / await` syntax, or `.then` syntax:

````javascript
import Topography from 'leaflet-topography'

const map = (window.map = L.map('mapdiv', mapOptions));
const params = {
  map,
  token: 'your_mapbox_access_token'
}

// async / await syntax
map.on('click', async (e) => {
  const results = await Topography.getTopography(e.latlng);
});

// promise .then syntax
map.on('click', (e) => {
	Topography.getTopography(e.latlng).then((results) => console.log(results));
});
````

Under the hood, leaflet-topography uses your mapbox token to fetch the [Mapbox-RGB-Terrain](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb) tile associated with your `latlng`, and it them performs calculations to return elevation, slope, and aspect for that location.  For a detailed explanation of what's going on, you can read my article, ["Slope and Aspect as a Function of LatLng in Leaflet"](https://observablehq.com/@slutske22/slope-as-a-function-of-latlng-in-leaflet)

### TopoLayer

The `TopoLayer` constructor will build a new tile layer, derived from the Mapbox RGB Terrain tileset.  Using web workers, a `TopoLayer` transforms the rgb DEM to visualize topographic features.  It takes a configuration object as the contructor's argument:

````javascript
import { TopoLayer } from 'leaflet-topography'

const elevationLayer = new TopoLayer({ topotype: 'elevation', token: 'your_mapbox_token' })
elevationLayer.addTo(map)
````

### preconfiguring leaflet-topography

In order to use these tools, you must provide a mapbox access token. To use `getTopography`, you must also pass an instance of a leaflet map as an option. While you can pass your token as an argument each time you call `getTopography` or create a new `TopoLayer`, you may find it useful to configure leaflet-topography ahead of time. You can use the `config` option to do so:

```javascript
// Create a map
const map = L.map('mapDiv', mapOptions));

// Configure leaflet-topography
L.Topography.config({
  map,
  token: your_mapbox_token
});

// Use leaflet topography
map.on(click, async e => {
  const { elevation, slope, aspect } = await L.Topography.getTopography(e)
  console.log(elevation, slope, aspect)
})
```


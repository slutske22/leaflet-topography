<p align="center">
   <img width="160px" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topography-icon.png">
   <h1 align="center">leaflet-topography</h1>
</p>
<p align="center">
   <i align="center">a set of tools for calculating and visualizing topography in leafletjs</i>
   <h2 align="center"><a href="https://codesandbox.io/s/react-esri-leaflet-example-n15yn">&#128064; Demo &#128064;</a></h2>
</p>

leaflet-topography is a leaflet plugin which offers functions and layers for calculating and visuzalizing topographic data in a leaflet map. These tools are based on the [Mapbox RGB Encoded DEM](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb), which means you must use your mapbox access token to use these tools.

<img width="100%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topography-banner.png">

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

- [**`getTopography`**](#gettopography)
- [**`TopoLayer`**](#topolayer)
- **`configure`**

<hr>

<h3 id="gettopography"><code>getTopography(latlng, options): { elevation, slope, aspect }</code></h3>

This is leaflet-topography's central tool. This async function takes in an `L.LatLng` object, and a semi-optional configuration object, and returns a promise which resolves to the result, which contains elevation, slope, and aspect data for that `latlng`.  You can use `async / await` syntax, or `.then` syntax:

````javascript
import Topography from 'leaflet-topography'

const map = L.map('mapdiv', mapOptions));

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

### Options

<table>
   <tr>
      <td> <b> Option </b> </td>
      <td> <b> Type </b> </td>
      <td> <b> Default </b> </td>
      <td> <b> Description </b> </td>
   </tr>
   <tr>
      <td>
         <b>map</b><br>
         required 
      </td>
      <td> <code> L.Map </code> </td>
      <td> none </td>
      <td> Instance of leaflet map, required for proper projections </td>
   </tr>
   <tr>
      <td>
         <b>token</b><br>
         required 
      </td>
      <td> <code> string </code> </td>
      <td> none </td>
      <td> Mapbox token, required to retrieve mapbox tiles used in calculations </td>
   </tr>
   <tr>
      <td>
         <b>scale</b>
      </td>
      <td> <code> number </code> </td>
      <td> 15 </td>
      <td> Zoom level of retrieved tiles.  Using a lower scale will give slope and aspect calculations with lower resolution.  Not recommended to use scale less than 12 </td>
   </tr>
   <tr>
      <td>
         <b>priority</b>
      </td>
      <td> <code> 'speed' | 'storage' </code> </td>
      <td> 'speed' </td>
      <td> Priority used by the <code>getTopography</code> algorithm.  When prioritizing speed, retrieved tile data is cached as an <code>ImageData</code> <code>Uint8ClampedArray</code>.  Retrieving pixel data from cached <code>Uint8ClampedArray</code>s is very fast, but each <code>Uint8ClampedArray</code> takes up almost 3 megabytes of in-browser memory.  Prioritizing storage will cache tile data as an <code>ImageBitmap</code>, which required about 40 <i>bytes</i> of storage.  However, retrieving pixel data from an <code>ImageBitmap</code> requires calling <code>drawImage</code> and <code>getImageData</code>, which takes more time. </td>
   </tr>
   <tr>
      <td>
         <b>saveTile</b>
      </td>
      <td> <code> fn(name: string, tileData: ImageData | ImageBitmap) => void </code> </td>
      <td> undefined </td>
      <td> Custom function provided by the user to define tile-cacheing behavior. </td>
   </tr>
</table>

<hr>

### `TopoLayer`

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


<p align="center">
   <img width="160px" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topography-icon.png">

   <h1 align="center">leaflet-topography</h1>
</p>
<p align="center">
   <i align="center">a set of tools for calculating and visualizing topography in leafletjs</i>
   <h2 align="center"><a href="https://codesandbox.io/s/react-esri-leaflet-example-n15yn">&#128064; Demo &#128064;</a></h2>
</p>



Leaflet-topography is a leaflet plugin which offers functions and layers for calculating and visuzalizing topographic data in a leaflet map. These tools are based on the [Mapbox RGB Encoded DEM](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb), which means you must use your mapbox access token to use these tools.

## Why?

While [other tools](#alternatives) exist to calculate and visualize topography in leaflet, this package is designed to do so at lightning speed. Under the hood, leaflet-topography uses your mapbox token to fetch the [Mapbox-RGB-Terrain](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb) tile associated with your `latlng`, and it them performs calculations to return elevation, slope, and aspect for that location.  The point's associated DEM tile is cached in the format and location of your choice. This means that further queries that fall in the same tile return topography data quickly, without the need for another network request.  For a detailed explanation of how this works, you can read my article, ["Slope and Aspect as a Function of LatLng in Leaflet"](https://observablehq.com/@slutske22/slope-as-a-function-of-latlng-in-leaflet)


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

const options = {
  map,
  token: 'your_mapbox_access_token'
}

// async / await syntax
map.on('click', async (e) => {
  const results = await Topography.getTopography(e.latlng, options);
});

// promise .then syntax
map.on('click', (e) => {
  Topography.getTopography(e.latlng, options)
    .then((results) => console.log(results));
});
````

Results are returned with the following units:

| result       |   unit                            |  range                                       |
|--------------|-----------------------------------|----------------------------------------------|
| `elevation`  | meters relative to sea level      | -413 to 8,848 (Dead Sea to Mt Everest)       |
| `slope`      | degrees                           | 0 - 90 (flat to vertical cliff)              |
| `aspect`     | degrees in polar coordinates (0 due east increasing counterclockwise) | 0 - 360  |

### Options

You must pass an options as the second argument of `getTopography`, *or* you can use the [`configure`](#configure) function to preconfigure leaflet-topography.

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
      <td> Zoom level of retrieved tiles.  Using a lower scale will give slope and aspect calculations with lower resolution.  Not recommended to use scale less than 12, values greater than 15 not possible </td>
   </tr>
   <tr>
      <td>
         <b>spread</b>
      </td>
      <td> <code> number </code> </td>
      <td> 2 </td>
      <td> Number of pixels away from queried point to use for calculations.  Larger numbers give lower resolution.  If you are using a spread > 4 you should consider simply lowering your scale. You probably don't need to touch this. </td>
   </tr>
   <tr>
      <td>
         <b>priority</b>
      </td>
      <td> <code> 'speed' | 'storage' </code> </td>
      <td> 'speed' </td>
      <td> Priority used by the <code>getTopography</code> algorithm.  When prioritizing speed, retrieved tile data is cached as an <code>ImageData</code> <code>Uint8ClampedArray</code>.  Retrieving pixel data from cached <code>Uint8ClampedArray</code>s is very fast, but each <code>Uint8ClampedArray</code> takes up almost 3 megabytes of in-browser memory.  Prioritizing storage will cache tile data as an <code>ImageBitmap</code>, which requires about 40 <i>bytes</i> of storage per bitmap.  However, retrieving pixel data from an <code>ImageBitmap</code> requires calling <code>drawImage</code> and <code>getImageData</code>, which is slightly slower.  Difference will not be noticeable when requesting topography one point at a time, but can make a big difference when querying hundreds of points in a small area in a small amount of time.  </td>
   </tr>
   <tr>
      <td>
         <b>saveTile</b>
      </td>
      <td> <code> function </code> </td>
      <td> undefined </td>
      <td> Custom function provided by the user to define tile-cacheing behavior. Must take the form <code>function(name: string, tileData: ImageData | ImageBitmap) => void</code>.  See the <a href="#cacheing-tiles">cacheing tiles</a> section for more information.</td>
   </tr>
   <tr>
      <td>
         <b>retrieveTile</b>
      </td>
      <td> <code> function </code> </td>
      <td> undefined </td>
      <td> Custom function provided by the user to define where to retrieve tile data from.  Must take the form <code>function(name: string) => tileData: ImageData | ImageBitmap</code>. See the <a href="#cacheing-tiles">cacheing tiles</a> section for more information.</td>
   </tr>
</table>

<hr>


### Cacheing Tiles

The key feature of leaflet-topography that enables returning topography data for high volumes of points in the same area in a short time is its data-cacheing behavior.  Note the loose use of the word 'cache' - it is really in-memory storage.  The default behavior is to simply store the DEM tiles in an object, with the key being the tile name in the format `X<X>Y<Y>Z<Z>`, and the value being the data, either as a `Uint8ClampedArray` or an `ImageBitmap`.  By default, the tiles are stored in `L.Topography._tileCache`. However, you have the option to define your own cacheing functions to store the tiles wherever you like.  You can use the `saveTile` and `retrieveTile` options to do this.  For example, if you wanted to store the tiles on the `window` object instead (not recommended), you could do this:

````javascript
import { configure } from 'leaflet-topography'

const mySaveFunction = (name, data) => window.myTemporaryCache[name] = data
const myRetrieveFunction = (name) => return window.myTemporaryCache[name]

configure({
   safeTile: mySaveFunction,
   retrieveTile: myRetrieveFunction
})
````
And now your tiles will be saved to and retrieved from the `window.myTemporaryCache` object.  There are many in-browser data storage options.  [This example](...) uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) to store tile data.

### `TopoLayer`

The `TopoLayer` constructor will build a new tile layer, derived from the Mapbox RGB Terrain tileset.  Using web workers, a `TopoLayer` transforms the rgb DEM to visualize topographic features.  It takes a configuration object as the contructor's argument:

````javascript
import { TopoLayer } from 'leaflet-topography'

const elevationLayer = new TopoLayer({ topotype: 'elevation', token: 'your_mapbox_token' })
elevationLayer.addTo(map)
````

### `configure`

You may find it useful to configure leaflet-topography ahead of time. You can use the `configure` function to do so, which will eliminate the need to pass an `options` argument to `getTopography`, or to pass your token to the `TopoLayer` constructor.

```javascript
// Create a map
const map = L.map('mapDiv', mapOptions));

// Configure leaflet-topography
L.Topography.configure({
  map,
  token: your_mapbox_token
});

// Use leaflet topography, no need to pass options
map.on(click, async e => {
  const { elevation, slope, aspect } = await L.Topography.getTopography(e.latlng)
  console.log(elevation, slope, aspect)
})

// Add a TopoLayer, no need to pass token
const elevationLayer = new TopoLayer({ topotype: 'elevation' })
```

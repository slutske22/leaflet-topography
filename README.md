<p align="center">
   <img width="160px" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topography-icon.png">

   <h1 align="center">leaflet-topography</h1>
</p>
<p align="center">
   <i align="center">a set of tools for calculating and visualizing topography in leafletjs</i>
   <h2 align="center"><a href="https://slutske22.github.io/leaflet-topography/">&#128064; Demo &#128064;</a></h2>
</p>





Leaflet-topography is a leaflet plugin which offers functions and layers for calculating and visuzalizing topographic data in a leaflet map. These tools are based on the [Mapbox RGB Encoded DEM](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb), which means you must use your mapbox access token to use these tools.

<p float="left">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-1.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-2.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-3.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-4.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-6.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-7.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-5.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-8.PNG">
</p>

## Why?

While [other tools](#alternatives) exist to calculate and visualize topography in leaflet, this package is designed to do so at lightning speed. Under the hood, leaflet-topography uses your mapbox token to fetch the [Mapbox-RGB-Terrain](https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#mapbox-terrain-rgb) tile associated with your `latlng`, and it then performs calculations to return elevation, slope, and aspect for that location.  The point's associated DEM tile is cached in the format and location of your choice. This means that further queries that fall in the same tile return topography data quickly, without the need for another network request.  For a detailed explanation of how this works, you can read my article, ["Slope and Aspect as a Function of LatLng in Leaflet"](https://observablehq.com/@slutske22/slope-as-a-function-of-latlng-in-leaflet)




## Installation and Use

You can install leaflet-topography through npm:

```
npm i leaflet-topography
```

Or you can include the package in your HTML `head` using unpkg: 

````html
<head>
   <script src="leaflet-CDN-comes-first" type="text/javascript"></script>
   <script src="https://unpkg.com/leaflet-topography" type="text/javascript"></script>
</head>
````

leaflet-topography will attach to the leaflet global `L`, and `L.Topography` will now be available for use.  You can also import relevant tools directly:

````javascript
import Topography, { getTopography, configure, TopoLayer } from 'leaflet-topography'
````
## Tools:

<ul>
   <li><h3><a href="#gettopography-section"><code>getTopography</code></a></h3></li>
   <li><h3><a href="#topolayer-section"><code>TopoLayer</code></a></h3></li>
   <li><h3><a href="#configure-section"><code>configure</code></a></h3></li>
   <li><h3><a href="#preload-section"><code>preload</code></a></h3></li>
</ul>

<hr>

<h3 id="gettopography-section"><code>getTopography</code></h3>

<img width="100%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topography-banner.png">

This is leaflet-topography's central tool. This async function takes in an `L.LatLng` object, and a semi-optional configuration object, and returns a promise which resolves to the result, which contains elevation, slope, and aspect data for that `latlng`.  You can use `async / await` syntax, or `.then` syntax:

````javascript
import Topography from 'leaflet-topography'

const map = L.map('mapdiv', mapOptions));

const options = {
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

<span id="results">Results are returned with the following units:</span>

| result        |   unit                            |  range                                       |
|---------------|-----------------------------------|----------------------------------------------|
| `elevation`   | meters relative to sea level      | -413 to 8,848 (Dead Sea to Mt Everest)       |
| `slope`       | degrees                           | 0 - 90 (flat to vertical cliff)              |
| `aspect`      | degrees in polar coordinates (0 due east increasing counterclockwise) | 0 - 360  |
| `resolution`* | meters                            | less than 1 to greater than 20,000,000       |

<sub>(*Resolution is a metadata value describing roughly how large the area used to calculate slope and aspect is.  Slope and aspect are calculated based on a `latlng`'s 4 neighboring pixels.  Higher `scale` values have smaller distances between pixels, so the neightbors are closer together, and the resolution is better.  Higher `spread` values mean skipping more pixels to choose a neighbor, which worsens resolution.  Larger resolution in this context means the surface being measured is more "smoothed out".) </sub>

### Options

You must pass an options as the second argument of `getTopography`, *or* you can use the [`configure`](#configure-section) function to preconfigure leaflet-topography.

<table>
   <tr>
      <td> <b> Option </b> </td>
      <td> <b> Type </b> </td>
      <td> <b> Default </b> </td>
      <td> <b> Description </b> </td>
   </tr>
   <tr>
      <td>
         <b>token</b><br>
         required* 
      </td>
      <td> <code> string </code> </td>
      <td> none </td>
      <td> Mapbox token, required to retrieve mapbox tiles used in calculations.  Not required when using <code>tilesUrl</code> </td>
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
      <td> Number of pixels away from queried point to use for calculations.  Larger numbers give lower resolution and "smooth" the surface being measured.  If you are using a spread > 10 you should consider simply lowering your scale. </td>
   </tr>
   <tr>
      <td>
         <b>priority</b>
      </td>
      <td> <code> 'speed' | 'storage' </code> </td>
      <td> 'storage' </td>
      <td> Priority used by the <code>getTopography</code> algorithm.  When prioritizing speed, retrieved tile data is cached as an <code>ImageData</code> <code>Uint8ClampedArray</code>.  Retrieving pixel data from cached <code>Uint8ClampedArray</code>s is very fast, but each <code>Uint8ClampedArray</code> takes up almost 3 megabytes of in-browser memory.  Prioritizing storage will cache tile data as an <code>ImageBitmap</code>, which requires about 40 <i>bytes</i> of storage per bitmap.  However, retrieving pixel data from an <code>ImageBitmap</code> requires calling <code>drawImage</code> and <code>getImageData</code>, which is slightly slower.  Difference will not be noticeable when requesting topography one point at a time, but can make a big difference when querying hundreds of points in a small area in a small amount of time.  </td>
   </tr>
   <tr>
      <td>
         <b>saveTile</b>
      </td>
      <td> <code> function </code> </td>
      <td> <code> (name, tileData) => { L.Topography._tileCache[name] = tileData } </code> </td>
      <td> Custom function provided by the user to define tile-cacheing behavior. Must take the form <code>function(name: string, tileData: ImageData | ImageBitmap) => void</code>.  See the <a href="#cacheing-tiles">cacheing tiles</a> section for more information.</td>
   </tr>
   <tr>
      <td>
         <b>retrieveTile</b>
      </td>
      <td> <code> function </code> </td>
      <td> <code>(tileName) => L.Topography._tileCache[tileName]</code> </td>
      <td> Custom function provided by the user to define where to retrieve tile data from.  Must take the form <code>function(name: string) => tileData: ImageData | ImageBitmap</code>. See the <a href="#cacheing-tiles">cacheing tiles</a> section for more information.</td>
   </tr>
   <tr>
      <td>
         <b>tilesUrl</b>
      </td>
      <td> <code> string </code> </td>
      <td> none </td>
      <td> Optional url for custom tiles to be used instead of Mapbox rgb-terrain.  Must be in the standard <a href="https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames">slippymap tilename</a> format.  <br>
      <a href="https://codesandbox.io/s/github/slutske22/leaflet-topography/tree/main/example-ts">👁 See demo project here  👁</a> (Note this demo relies on custom tiles that may no longer be available by the time you read this). </td>
   </tr>
   <tr>
      <td>
         <b>heightFunction</b>
      </td>
      <td> <code> function </code> </td>
      <td> <code>function(R, G, B) => -10000 + (R * 256 * 256 + G * 256 + B) * 0.1</code> </td>
      <td> Optional override function for calculating elevation value based on a pixel's RGB value.  Must be in the format of <code> function(R: number, G: number, B: number) => number </code> </td>
   </tr>
</table>

### Cacheing Tiles

The key feature of leaflet-topography that enables returning topography data for high volumes of points in the same area in a short time is its data-cacheing behavior.  Note the loose use of the word 'cache' - it is really in-memory storage.  The default behavior is to simply store the DEM tiles in an object, with the key being the tile name in the format `X<X>Y<Y>Z<Z>`, and the value being the data, either as a `Uint8ClampedArray` or an `ImageBitmap`.  By default, the tiles are stored in `L.Topography._tileCache`. However, you have the option to define your own cacheing functions to store the tiles wherever you like.  You can use the `saveTile` and `retrieveTile` options to do this.  For example, if you wanted to store the tiles on the `window` object instead (not recommended), you could do this:

````javascript
import { configure } from 'leaflet-topography'

const mySaveFunction = (name, data) => { window.myTemporaryCache[name] = data }
const myRetrieveFunction = (name) => return window.myTemporaryCache[name]

configure({
   safeTile: mySaveFunction,
   retrieveTile: myRetrieveFunction
})
````
And now your tiles will be saved to and retrieved from the `window.myTemporaryCache` object.  There are [many in-browser data storage options](https://developers.google.com/web/fundamentals/instant-and-offline/web-storage), and these functions can be adapted to work with the storage method of your choice.

<hr>


<h3 id="topolayer-section"><code>TopoLayer</code></h3>


<p float="left">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-a.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-b.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-e.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-c.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-d.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-g.png">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-f.PNG">
   <img width="12%" src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/topo-h.png">
</p>

The `TopoLayer` constructor will build a new tile layer, derived from the Mapbox RGB Terrain tileset.  Using web workers and [RainbowVis.js](https://github.com/anomal/RainbowVis-JS), a `TopoLayer` transforms the rgb DEM to visualize topographic features.  All of the thumbnails above were generated with variations of a `TopoLayer`. It takes a configuration object as the contructor's argument:

````javascript
import { TopoLayer } from 'leaflet-topography'

const elevationLayer = new TopoLayer({ 
  topotype: 'elevation', 
  token: 'your_mapbox_token'
  customization: <customization_options>
});

elevationLayer.addTo(map)
````

### Constructor Options

<table>
   <tr>
      <td> <b> Option </b> </td>
      <td> <b> Type </b> </td>
      <td> <b> Description </b> </td>
   </tr>
   <tr>
      <td>
         <b>topotype</b><br>
         required
      </td>
      <td><code>string<code></td>
      <td>Type of topography to render.  Can be one of `elevation`, `slope`, `aspect`, or `slopeaspect`.</td>
   </tr>
   <tr>
      <td>
         <b>token</b><br>
         required
      </td>
      <td><code>string<code></td>
      <td>Mapbox access token.  Can be omitted if it was already used in the <a href="#configure"><code>configure</code></a> function.</td>
   </tr>
   <tr>
      <td><b>customization</b></td>
      <td>
         <code>object</code>
      </td>
      <td>Customization object that allows you to customize the color choice and distribution of the TopoLayer.  See below for details.</td>
   </tr>  
</table>

### Customization Options

The optional `customization` object allows you to customize the way colors are rendered.  It takes the following options, all of which are optional:

<table>
   <tr>
      <td> <b> Option </b> </td>
      <td> <b> Type </b> </td>
      <td> <b> Description </b> </td>
   </tr>
   <tr>
      <td><b>colors</b></td>
      <td><code>Array&lt;string&gt;</code> <br> hex color value</td>
      <td>You can pass an array of hex color values to choose the colors rendered by the workers, mapped to the breakpoints you define</td>
   </tr>   
   <tr>
      <td><b>breakpoints</b></td>
      <td><code>Array&lt;number&gt;</code></td>
      <td>Determines how colors are spread across values.  Should span the range of <a href="#results">possible values of results</a>.  If you provide <code>colors</code> without providing <code>breakpoints</code>, the breakpoints will be generated evenly for you across the topotype's range.</td>
   </tr>
   <tr>
      <td><b>continuous</b></td>
      <td><code>boolean</code></td>
      <td>
         Determines if color should be a continuous gradient, or render in class breaks according to whether or not the topo value falls in the breakpoint range
         <ul>
            <li><code>topotype: 'elevation' | 'slope'</code> defaults to true
            </li>
            <li><code>topotype: 'aspect' | 'slopeaspect'</code> defaults to false
            </li>
         </ul>
         </td>
   </tr>
   <tr>
      <td><b>breaksAt0</b></td>
      <td><code>boolean</code></td>
      <td>Only relevant to <code>topotype: 'elevation'</code>.  Determines whether or not to inject a breakpoint at elevation = 0 and apply discontinuous use of color gradients.  Creates a nice water effect when set to <code>true</code>, but may be visually deceptive for land topography that is below sea level. Defaults to <code>true</code>.</td>
   </tr>
   <tr>
      <td><b>fallback</b></td>
      <td><code>string</code><br> hex color value</td>
      <td>Fallback color to use if calculated topo values escape the color mapping algorithm.</a></td>
   </tr>
</table>

### Colors and Breakpoints Hints and Tips

There are countless combinations of <code>colors</code>, <code>breakpoints</code>, <code>continuous</code>, and <code>breakAt0</code>. Many uses cases are untested, so open an issue or PR if you run into problems. Here are a few tips to get nice results:

<table>
   <tr>
      <td>
         <b><code>topotype</code></b>
      </td>
      <td>
         <b>Hints / Requirements</b>
      </td>
   </tr>
   <tr>
      <td>
         <code>elevation</code>
      </td>
      <td>
        If using <code>breaksAt0: true</code>, <code>colors</code> and <code>breakpoints</code> must be of the same length, <i>unless</i> your <code>breakpoints</code> <i>already includes</i> <code>0</code>.  If it already includes <code>0</code>, <code>breakpoints</code> must contain <i>one value more</i> than <code>colors</code>.  See the <a href="https://slutske22.github.io/leaflet-topography/">demo</a> for examples.
      </td>
   </tr>
   <tr>
      <td>
         <code>slope</code>
      </td>
      <td>
         Slope layers are fairly simple, but see the <a href="#limitations">limitations</a> section.
      </td>
   </tr>
   <tr>
      <td>
         <code>aspect</code>
      </td>
      <td>
         <code>colors</code> and <code>breakpoints</code> should be of the same length.  <code>colors</code> must be circular, meaning its first value is the same as its last.  <code>breakpoints</code> must start and end with <code>0</code> and <code>360</code>:
         <code><pre>
   const customAspectLayer = new Topography.TopoLayer({
      topotype: 'aspect',
      colors: ['#303E73', '#7A85AD', '#515E90', '#ca009c', '#303E73'],
      breakpoints: [0, 90, 80, 270, 360],
   })
         </pre></code>
      </td>
   </tr>
   <tr>
      <td>
         <code>slopeapsect</code>
      </td>
      <td>
         All the same rules apply as from <code>topotype: aspect</code>.  I would recommend not using <code>continuous: true</code> on a <code>slopeaspect</code> layer, as it is very CPU heavy and slow.  This needs optimization.  I would recommend considering another visualization for that specific effect.  <a href="https://www.esri.com/arcgis-blog/products/imagery/imagery/new-aspect-slope-raster-function-now-available/" target="_blank">Read more here.</a>
      </td>
   </tr>
</table>


<hr>

<h3 id="configure-section"><code>configure</code></h3>

You may find it useful to preconfigure leaflet-topography ahead of time. You can use the `configure` function to do so, which will eliminate the need to pass an `options` argument to `getTopography`, or to pass your token to the `TopoLayer` constructor.

```javascript
// Create a map
const map = L.map('mapDiv', mapOptions));

// Configure leaflet-topography
L.Topography.configure({
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

<hr>

<h3 id="preload-section"><code>preload</code></h3>

`preload` is a convenience function which takes in an aray of `L.LatLngBounds` and saves all DEM tiles within those bounds to the cache.  If you know you will be doing analysis in a certain area(s), `preload` will perform all the data fetching ahead of time.  You must call `configure` with your `token` or `tilesUrl` before calling `preload`:

````javascript
import L from 'leaflet';
import { preload, configure } from 'leaflet-topography';

const map = L.map('mapdiv', mapOptions));

configure({
  token: 'your_mapbox_access_token',
  priority: 'storage'
});

const corner1 = L.latLng(40.712, -74.227);
const corner2 = L.latLng(40.774, -74.125);
const analysisArea1 = L.latLngBounds(corner1, corner2);

const corner3 = L.latLng(41.712, -72.227);
const corner4 = L.latLng(41.774, -72.125);
const analysisArea2 = L.latLngBounds(corner3, corner4);

preload([analysisArea1, analysisArea2]);

map.on('click', e => {
  getTopography(e.latlng)
    .then(results => console.log(results));
});
````

**Be careful!** Calling `preload` on too large an area with a high `scale` may cause your browser to try to fetch hundreds or even millions of tile images at once!

<hr>

## Limitations

- `TopoLayer`
  - `topotype: slope` does not consider distance betwen pixels when calculating and coloring slope.  Lower zoom levels produce higher slope values, meaning the layer tends to "white out" as you zoom out, and "black out" as you zoom in.  Interestingly, this is in contrast to using `rasterFunction: "Slope_Degrees"` on an esri-leaflet terrain layer, which blacks out as you zoom out.
  - `topotype: slopeaspect` with a `continuous: true` is *very* slow, as each pixel's color must be calculated across two gradients - one to interpolate between aspect colors, and another to interpolate between the resultant aspect color and the slope value.  This goes against the philosophy of this plugin, and should probably not be used.
  - **Bug**: When creating a `TopoLayer`, you can pass a custom `heightFunction` on a per-layer basis inside the `customization` object.  However, [currently there is a bug that is not allowing the stringified function to be passed to the web workers when passed as a `customization` option](https://stackoverflow.com/questions/68029421/failed-to-execute-postmessage-on-worker-x-could-not-be-cloned).  For this reason, I recommend defining your `heightFunction` in the `configure` function:
  
        L.Topography.configure({
          heightFunction: (R, G, B) => return some_function_of_R_G_B
        })

  - If you want to define the `heightFunction` for a specific TopoLayer only, you can pass it as a property of `customization`, but if must be stringified:

        const customTopo = new TopoLayer({
           topotype: 'aspect',
           tilesUrl: "your_url_here",
           customization: {
              heightFunction ((R, G, B) => {
                 return return some_function_of_R_G_B;
              }).toString()
           }
        })
   
  

### Planned Improvements

- Fix aforementioned `TopoLayer` bug
- Units option for `getTopography`?
- Fade-in effect on `TopoLayer` tiles when imageData is posted
- Incorporate zoom level into `TopoLayer({ topotype: slope })` for consistent visuals across zoom levels
- Smoothen `TopoLayer` at higher levels
- General colorization algorithm optimization

## Alternatives

[Esri-leaflet](https://esri.github.io/esri-leaflet/) can be used for both querying and visualizing topographic data in leaflet with relative ease.  You can see some examples of how to do this in my articles [Slope and Aspect as a function of `LatLng`](https://observablehq.com/@slutske22/slope-as-a-function-of-latlng-in-leaflet) and [Visualizing Topography](https://observablehq.com/@slutske22/slope-and-aspect-in-leaflet).  Leaflet-topography grew out of my dissatisfaction esri-leaflet, as I was in need of a way to query hundrends of points in the same area for topographic data in a very short time (on the order of seconds).  

There are *many* tile layers and image layers which visualize slope, aspect, hillshade, and elevation, and you are likely to find a pre-fab layer that suits your needs.  I wanted to have full control over customizing the coloration of my layers, which is what inspired `TopoLayer`.

## Further Reading

If you are interesting in nerding out on this as hard as me, here are some interesting articles about topography and hillshading, also in a mapbox context:

- [Hillshade, by Sahil Chinoy](https://observablehq.com/@sahilchinoy/hillshader)
- [DIY Hillshade, by Andy Woodruff](https://observablehq.com/@awoodruff/diy-hillshade)
- [Mapbox hillshade and satellite map blending, by Armand Emamdjomeh](https://observablehq.com/@emamd/mapbox-hillshade-and-satellite-map-blending)

### License

GPL-3.0 License

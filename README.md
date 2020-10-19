<img src="https://raw.githubusercontent.com/slutske22/leaflet-topography/HEAD/assets/banner.png">
<p align="center">
   <h1 align="center">leaflet-topography</h1>
</p>
<p align="center">
   <i align="center">a set of tools for calculating and visualizing topography in leafletjs</i>
   <h2 align="center"><a href="https://codesandbox.io/s/react-esri-leaflet-example-n15yn">&#128064; Demo &#128064;</a></h2>
</p>

leaflet-topography is a leaflet plugin which offers functions and layers for calculating and visuzalizing topographic data in a leaflet map. These tools are based on the Mapbox RGB encoded DEM, which means you must use your mapbox access token to use these tools.

## Installation

You can install leaflet-topography through npm:

```
npm i leaflet-topography
```

## preconfiguring leaflet-topography

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

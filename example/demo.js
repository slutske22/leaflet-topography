import Topography from "leaflet-topography";
// import Topography from '../build/leaflet-topography.js';
import "leaflet.control.layers.tree";
import "./leaflet.tree.css";

import {
  map,
  modal,
  resultsContainer,
  resultsMarkup,
  USGS_USImagery,
} from "./index";
import {
  elevationLayers,
  slopeLayers,
  aspectLayers,
  slopeaspectLayers,
  customUrlLayers,
} from "./layers";

/**
 * Create a .env file and pop your MAPBOX_TOKEN in there so as not to have
 * to enter it every time
 */
window.addEventListener("DOMContentLoaded", () => {
  if (process.env.MAPBOX_TOKEN) {
    initializeDemo(process.env.MAPBOX_TOKEN);
  }
});

/**
 * Primary function which initializes demo
 */
export function initializeDemo(key) {
  /**
   * Adjust some CSS once elements are loaded:
   */
  modal.style.display = "none";
  resultsContainer.style.display = "block";
  const csb = document.getElementById("codesandbox-container");
  csb.style.display = "flex";
  const topLeft = document.querySelector(".leaflet-right.leaflet-top");
  topLeft.appendChild(csb);

  // Configure leaflet-topography
  Topography.configure({
    token: key,
    scale: 13,
    spread: 4,
    priority: "storage",
  });

  // Preload map area on load
  const bounds = map.getBounds();
  Topography.preload([bounds]);

  // Implement getTopography function
  map.on("click", (e) => {
    resultsMarkup.innerHTML = "Requesting Topography...";
    Topography.getTopography(e.latlng).then((results) => {
      resultsMarkup.innerHTML =
        JSON.stringify(e.latlng, null, 2) +
        "<br>" +
        JSON.stringify(results, null, 2);
    });
  });

  // Create layers control tree for various TopoLayer samples
  const baseTree = {
    layer: USGS_USImagery,
    label: "Basemap",
    children: [
      {
        label: '<code class="tree-title"> topotype: elevation</code>',
        children: elevationLayers.map((l) => ({
          label: l.name,
          layer: l.layer,
        })),
      },
      {
        label: '<code class="tree-title"> topotype: slope</code>',
        children: slopeLayers.map((l) => ({
          label: l.name,
          layer: l.layer,
        })),
      },
      {
        label: '<code class="tree-title"> topotype: aspect</code>',
        children: aspectLayers.map((l) => ({
          label: l.name,
          layer: l.layer,
        })),
      },
      {
        label: '<code class="tree-title"> topotype: slopeaspect</code>',
        children: slopeaspectLayers.map((l) => ({
          label: l.name,
          layer: l.layer,
        })),
      },
      {
        label: '<code class="tree-title"> custom tile url</code>',
        children: customUrlLayers.map((l) => ({
          label: l.name,
          layer: l.layer,
        })),
      },
    ],
  };

  L.control.layers.tree(baseTree, null, { collapsed: false }).addTo(map);

  /**
   * When baselayer changes, reconfigure leaflet-topography to use the correct
   * height functions.  Necessary to showcase both the visual TopoLayers, as well
   * as the analytic getTopography functions, with the correct height function
   */
  map.on("baselayerchange", function (e) {
    if (e.layer.name === "bathymetry") {
      // Configure to use the bathymetry tiles urls, as well as the correct custom height function
      Topography.configure({
        tilesUrl:
          "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
        heightFunction: (red, green, blue) =>
          red * 256 + green + blue / 256 - 32768,
        scale: 12,
      });
    } else {
      // Set tilesUrl back to undefined to default back to mapbox
      Topography.configure({
        tilesUrl: undefined,
        heightFunction: (R, G, B) => {
          return -10000 + (R * 256 * 256 + G * 256 + B) * 0.1;
        },
      });

      e.layer.redraw();
      console.log(Topography._config);
    }
  });
}

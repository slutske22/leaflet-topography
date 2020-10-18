"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopography = void 0;
var leaflet_1 = require("leaflet");
var getTopography_1 = require("./getTopography");
exports.getTopography = getTopography_1.default;
var Topography = {
    getTopography: getTopography_1.default,
};
leaflet_1.default.Topography = Topography;
if (window.L && !window.L.Topography) {
    leaflet_1.default.Topography = Topography;
}
exports.default = Topography;
//# sourceMappingURL=index.js.map
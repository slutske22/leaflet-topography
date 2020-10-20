// struggling to get webpack and typescript to cooperate to create workers that are wrapped and and bundled into the single build bundle, so i'm cheating and using blobs. not great at all because editing is super hard...is there a better solution?

const worker4elevationtext = new Blob(
	[
		`
    onmessage = function (e) {


      self.dems = {}

       if (e.data.raster) {

          const { data } = e.data.raster
          self.dems[e.data.id] = raster2dem(data)
          self.shades = shading(self.dems[e.data.id])

       }

       postMessage({
          id: e.data.id,
          shades: self.shades
       })

     }



  function raster2dem (data){

       const dem = new Int16Array(256 * 256)

       var x, y, i, j

       function height (R, G, B) {
          return -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
       }

       for (x = 0; x < 256; x++) {
          for (y = 0; y < 256; y++){
             i = x + y * 256
             j = i * 4
             dem[i] = height( data[j], data[j + 1], data[j + 2] )
          }
       }

       return dem

    }


    function shading(dem){

       var px = new Uint8ClampedArray( 256 * 256 * 4 )

       for (let i = 0; i < dem.length; i++){


        var hex = \`#\${hypsotint(dem[i])}\`

        px[4*i + 0] = hexToR(hex)
        px[4*i + 1] = hexToG(hex)
        px[4*i + 2] = hexToB(hex)
        px[4*i + 3] = 255

       }

       return px

    }


    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}


    var colors =      ['#164A5B', '#75CFEC', '#FCFFA0', '#008000', '#855723',  '#006400', '#493829', 'white']
    var breakpoints = [       -850,        0,        300,    800,      1500,         2400,       8700      ]

    var gradients = (() => {

       var collection = []

       for (let i = 0; i < breakpoints.length - 1; i++){

          var rainbow = new Rainbow()
          rainbow.setNumberRange( breakpoints[i], breakpoints[i + 1] )
          rainbow._numberRange = [ breakpoints[i], breakpoints[i + 1] ]

          // discontinuous use of colors between negative and position values
          if (i === 0){
             rainbow.setSpectrum( colors[i], colors[i + 1] )
             rainbow._spectrum = [ colors[i], colors[i + 1] ]
          } else {
             rainbow.setSpectrum( colors[i + 1], colors[i + 2] )
             rainbow._spectrum = [ colors[i + 1], colors[i + 2] ]
          }

          collection.push(rainbow)

       }

       return collection

    })()


    function hypsotint(elevation){

       for (let i = 0; i < breakpoints.length - 1; i++){

          if (breakpoints[i] < elevation && elevation <= breakpoints[i + 1]){

             return gradients[i].colorAt(elevation)

          }

       }

       return '000000'

    }




    function Rainbow()
    {
      "use strict";
      var gradients = null;
      var minNum = 0;
      var maxNum = 100;
      var colours = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
      setColours(colours);

      function setColours (spectrum) 
      {
        if (spectrum.length < 2) {
          throw new Error('Rainbow must have two or more colours.');
        } else {
          var increment = (maxNum - minNum)/(spectrum.length - 1);
          var firstGradient = new ColourGradient();
          firstGradient.setGradient(spectrum[0], spectrum[1]);
          firstGradient.setNumberRange(minNum, minNum + increment);
          gradients = [ firstGradient ];

          for (var i = 1; i < spectrum.length - 1; i++) {
            var colourGradient = new ColourGradient();
            colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
            colourGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1)); 
            gradients[i] = colourGradient; 
          }

          colours = spectrum;
        }
      }

      this.setSpectrum = function () 
      {
        setColours(arguments);
        return this;
      }

      this.setSpectrumByArray = function (array)
      {
        setColours(array);
        return this;
      }

      this.colourAt = function (number)
      {
        if (isNaN(number)) {
          throw new TypeError(number + ' is not a number');
        } else if (gradients.length === 1) {
          return gradients[0].colourAt(number);
        } else {
          var segment = (maxNum - minNum)/(gradients.length);
          var index = Math.min(Math.floor((Math.max(number, minNum) - minNum)/segment), gradients.length - 1);
          return gradients[index].colourAt(number);
        }
      }

      this.colorAt = this.colourAt;

      this.setNumberRange = function (minNumber, maxNumber)
      {
        if (maxNumber > minNumber) {
          minNum = minNumber;
          maxNum = maxNumber;
          setColours(colours);
        } else {
          throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
        return this;
      }
    }

    function ColourGradient() 
    {
      "use strict";
      var startColour = 'ff0000';
      var endColour = '0000ff';
      var minNum = 0;
      var maxNum = 100;

      this.setGradient = function (colourStart, colourEnd)
      {
        startColour = getHexColour(colourStart);
        endColour = getHexColour(colourEnd);
      }

      this.setNumberRange = function (minNumber, maxNumber)
      {
        if (maxNumber > minNumber) {
          minNum = minNumber;
          maxNum = maxNumber;
        } else {
          throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
      }

      this.colourAt = function (number)
      {
        return calcHex(number, startColour.substring(0,2), endColour.substring(0,2)) 
          + calcHex(number, startColour.substring(2,4), endColour.substring(2,4)) 
          + calcHex(number, startColour.substring(4,6), endColour.substring(4,6));
      }

      function calcHex(number, channelStart_Base16, channelEnd_Base16)
      {
        var num = number;
        if (num < minNum) {
          num = minNum;
        }
        if (num > maxNum) {
          num = maxNum;
        } 
        var numRange = maxNum - minNum;
        var cStart_Base10 = parseInt(channelStart_Base16, 16);
        var cEnd_Base10 = parseInt(channelEnd_Base16, 16); 
        var cPerUnit = (cEnd_Base10 - cStart_Base10)/numRange;
        var c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
        return formatHex(c_Base10.toString(16));
      }

      function formatHex(hex) 
      {
        if (hex.length === 1) {
          return '0' + hex;
        } else {
          return hex;
        }
      } 

      function isHexColour(string)
      {
        var regex = /^#?[0-9a-fA-F]{6}$/i;
        return regex.test(string);
      }

      function getHexColour(string)
      {
        if (isHexColour(string)) {
          return string.substring(string.length - 6, string.length);
        } else {
          var name = string.toLowerCase();
          if (colourNames.hasOwnProperty(name)) {
            return colourNames[name];
          }
          throw new Error(string + ' is not a valid colour.');
        }
      }

      // Extended list of CSS colornames s taken from
      // http://www.w3.org/TR/css3-color/#svg-color
      var colourNames = {
        aliceblue: "F0F8FF",
        antiquewhite: "FAEBD7",
        aqua: "00FFFF",
        aquamarine: "7FFFD4",
        azure: "F0FFFF",
        beige: "F5F5DC",
        bisque: "FFE4C4",
        black: "000000",
        blanchedalmond: "FFEBCD",
        blue: "0000FF",
        blueviolet: "8A2BE2",
        brown: "A52A2A",
        burlywood: "DEB887",
        cadetblue: "5F9EA0",
        chartreuse: "7FFF00",
        chocolate: "D2691E",
        coral: "FF7F50",
        cornflowerblue: "6495ED",
        cornsilk: "FFF8DC",
        crimson: "DC143C",
        cyan: "00FFFF",
        darkblue: "00008B",
        darkcyan: "008B8B",
        darkgoldenrod: "B8860B",
        darkgray: "A9A9A9",
        darkgreen: "006400",
        darkgrey: "A9A9A9",
        darkkhaki: "BDB76B",
        darkmagenta: "8B008B",
        darkolivegreen: "556B2F",
        darkorange: "FF8C00",
        darkorchid: "9932CC",
        darkred: "8B0000",
        darksalmon: "E9967A",
        darkseagreen: "8FBC8F",
        darkslateblue: "483D8B",
        darkslategray: "2F4F4F",
        darkslategrey: "2F4F4F",
        darkturquoise: "00CED1",
        darkviolet: "9400D3",
        deeppink: "FF1493",
        deepskyblue: "00BFFF",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1E90FF",
        firebrick: "B22222",
        floralwhite: "FFFAF0",
        forestgreen: "228B22",
        fuchsia: "FF00FF",
        gainsboro: "DCDCDC",
        ghostwhite: "F8F8FF",
        gold: "FFD700",
        goldenrod: "DAA520",
        gray: "808080",
        green: "008000",
        greenyellow: "ADFF2F",
        grey: "808080",
        honeydew: "F0FFF0",
        hotpink: "FF69B4",
        indianred: "CD5C5C",
        indigo: "4B0082",
        ivory: "FFFFF0",
        khaki: "F0E68C",
        lavender: "E6E6FA",
        lavenderblush: "FFF0F5",
        lawngreen: "7CFC00",
        lemonchiffon: "FFFACD",
        lightblue: "ADD8E6",
        lightcoral: "F08080",
        lightcyan: "E0FFFF",
        lightgoldenrodyellow: "FAFAD2",
        lightgray: "D3D3D3",
        lightgreen: "90EE90",
        lightgrey: "D3D3D3",
        lightpink: "FFB6C1",
        lightsalmon: "FFA07A",
        lightseagreen: "20B2AA",
        lightskyblue: "87CEFA",
        lightslategray: "778899",
        lightslategrey: "778899",
        lightsteelblue: "B0C4DE",
        lightyellow: "FFFFE0",
        lime: "00FF00",
        limegreen: "32CD32",
        linen: "FAF0E6",
        magenta: "FF00FF",
        maroon: "800000",
        mediumaquamarine: "66CDAA",
        mediumblue: "0000CD",
        mediumorchid: "BA55D3",
        mediumpurple: "9370DB",
        mediumseagreen: "3CB371",
        mediumslateblue: "7B68EE",
        mediumspringgreen: "00FA9A",
        mediumturquoise: "48D1CC",
        mediumvioletred: "C71585",
        midnightblue: "191970",
        mintcream: "F5FFFA",
        mistyrose: "FFE4E1",
        moccasin: "FFE4B5",
        navajowhite: "FFDEAD",
        navy: "000080",
        oldlace: "FDF5E6",
        olive: "808000",
        olivedrab: "6B8E23",
        orange: "FFA500",
        orangered: "FF4500",
        orchid: "DA70D6",
        palegoldenrod: "EEE8AA",
        palegreen: "98FB98",
        paleturquoise: "AFEEEE",
        palevioletred: "DB7093",
        papayawhip: "FFEFD5",
        peachpuff: "FFDAB9",
        peru: "CD853F",
        pink: "FFC0CB",
        plum: "DDA0DD",
        powderblue: "B0E0E6",
        purple: "800080",
        red: "FF0000",
        rosybrown: "BC8F8F",
        royalblue: "4169E1",
        saddlebrown: "8B4513",
        salmon: "FA8072",
        sandybrown: "F4A460",
        seagreen: "2E8B57",
        seashell: "FFF5EE",
        sienna: "A0522D",
        silver: "C0C0C0",
        skyblue: "87CEEB",
        slateblue: "6A5ACD",
        slategray: "708090",
        slategrey: "708090",
        snow: "FFFAFA",
        springgreen: "00FF7F",
        steelblue: "4682B4",
        tan: "D2B48C",
        teal: "008080",
        thistle: "D8BFD8",
        tomato: "FF6347",
        turquoise: "40E0D0",
        violet: "EE82EE",
        wheat: "F5DEB3",
        white: "FFFFFF",
        whitesmoke: "F5F5F5",
        yellow: "FFFF00",
        yellowgreen: "9ACD32"
      }
    }




  
  `,
	],
	{ type: 'text/javascript' }
);
const worker4elevation = URL.createObjectURL(worker4elevationtext);

const worker4slopetext = new Blob(
	[
		`

    self.dems = {}
    onmessage = function (e) {


      self.slopeshades = {}

       if (e.data === 'clear') {

          self.slopeshades = {}
          return

       }

       if (e.data.raster) {

          const { data } = e.data.raster
          self.slopeshades[e.data.id] = raster2slopes(data)
          self.shades = shading(self.slopeshades[e.data.id])

       }

       postMessage({
          id: e.data.id,
          message: 'from worker',
          ele: self.slopeshades[e.data.id],
          shades: self.shades
       })

     }



  function raster2dem (data){

       const dem = new Int16Array(256 * 256)

       var x, y, i, j

       function height (R, G, B) {
          return -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
       }

       for (x = 0; x < 256; x++) {
          for (y = 0; y < 256; y++){
             i = x + y * 256
             j = i * 4
             dem[i] = height( data[j], data[j + 1], data[j + 2] )
          }
       }

       return dem

    }
    

  

    function raster2slopes(raster){

       const dem = raster2dem(raster)

       const slopes = new Float32Array( 256 * 256 )

       var x, y, dx, dy, i, j

       for (x = 1; x < 255; x++){
          for (y = 1; y < 255; y++){

             i = y * 256 + x

             dx = ((dem[i - 255] + 2 * dem[i + 1]   + dem[i + 257]) -
                (dem[i - 257] + 2 * dem[i - 1]   + dem[i + 255])) / 8;
             dy = ((dem[i + 255] + 2 * dem[i + 256] + dem[i + 257]) -
                (dem[i - 257] + 2 * dem[i - 256] + dem[i - 255])) / 8;

             slopes[i] = Math.atan( Math.sqrt( dx * dx + dy * dy ) )

          }
       }

       /** Shameless Hack: 
        * When calculating slope, we can't get values
        * that are on the edge of a tile, as we can't
        * get their neighbors.  Their neighbors are on
        * a different tile.  Rather than trying to coordinate
        * data between tiles, this loop takes the pixel
        * 2 pixels deep from each edge and copies it to
        * the edge pixel.  The hack is 1px wide and barely
        * visible
        */
       for (x = 0; x < 256; x++){
          for (y = 0; y < 256; y++){

             i = y * 256 + x

             if (x === 0){
                j = y * 256 + x + 1
                slopes[i] = slopes[j]
             }
             if (x === 255){
                j = y * 256 + x - 1
                slopes[i] = slopes[j]
             }
             if (y === 0){
                j = (y + 1) * 256 + x
                slopes[i] = slopes[j]
             }
             if (y === 255){
                j = (y - 1) * 256 + x
                slopes[i] = slopes[j]
             }


          }
       }


       return slopes

    }


    function shading(slopes){

       var px = new Uint8ClampedArray( 256 * 256 * 4 )

       for (let i = 0; i < slopes.length; i++){

            var color = slopes[i] * 255 / (Math.PI / 2)

            px[4*i + 0] = color
            px[4*i + 1] = color
            px[4*i + 2] = color
            px[4*i + 3] = 255



       }

       return px

    }
  
  `,
	],
	{ type: 'text/javascript' }
);
const worker4slope = URL.createObjectURL(worker4slopetext);

const worker4aspecttext = new Blob(
	[
		`

    self.slopeaspects = {}

    onmessage = function (e) {

       if (e.data.raster) {

          const { data } = e.data.raster
          self.slopeaspects[e.data.id] = raster2slopeaspect(data)
          self.shades = shading(self.slopeaspects[e.data.id].slopes, self.slopeaspects[e.data.id].aspects)

       }

       postMessage({
          id: e.data.id,
          message: 'from worker',
          ele: self.slopeaspects[e.data.id],
          shades: self.shades
       })

    }

    function raster2dem(data){

       const dem = new Int16Array(256 * 256)

       var x, y, i, j

       function height (R, G, B) {
          return -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
       }

       for (x = 0; x < 256; x++) {
          for (y = 0; y < 256; y++){
             i = x + y * 256
             j = i * 4
             dem[i] = height( data[j], data[j + 1], data[j + 2] )
          }
       }

       return dem

    }
    

  

    function raster2slopeaspect(raster){

       const dem = raster2dem(raster)

       const aspects = new Float32Array( 256 * 256 )
       const slopes = new Float32Array( 256 * 256 )

       var x, y, dx, dy, i

       for (x = 1; x < 255; x++){
          for (y = 1; y < 255; y++){

             i = y * 256 + x

             dx = ((dem[i - 255] + 2 * dem[i + 1]   + dem[i + 257]) -
                (dem[i - 257] + 2 * dem[i - 1]   + dem[i + 255])) / 8;
             dy = ((dem[i + 255] + 2 * dem[i + 256] + dem[i + 257]) -
                (dem[i - 257] + 2 * dem[i - 256] + dem[i - 255])) / 8;

             aspects[i] = dx !== 0
                ? 90 - Math.atan2( dy, -dx ) * (180 / Math.PI)
                : 90 - 90 * (dy > 0 ? 1 : -1)

             slopes[i] = Math.atan( Math.sqrt( dx * dx + dy * dy ) ) * 180 / Math.PI

          }
       }


       /** Shameless Hack: 
        * When calculating slope, we can't get values
        * that are on the edge of a tile, as we can't
        * get their neighbors.  Their neighbors are on
        * a different tile.  Rather than trying to coordinate
        * data between tiles, this loop takes the pixel
        * 2 pixels deep from each edge and copies it to
        * the edge pixel.  The hack is 1px wide and barely
        * visible
        */
       for (x = 0; x < 256; x++){
          for (y = 0; y < 256; y++){

             i = y * 256 + x

             if (x === 0){
                j = y * 256 + x + 1
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (x === 255){
                j = y * 256 + x - 1
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (y === 0){
                j = (y + 1) * 256 + x
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (y === 255){
                j = (y - 1) * 256 + x
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }

          }
       }

       return {slopes, aspects}

    }


    function shading(slopes, aspects){

       var px = new Uint8ClampedArray( 256 * 256 * 4 )

       for (let i = 0; i < aspects.length; i++){

          var rgb = hypsotint(slopes[i], aspects[i])

          px[4*i + 0] = rgb.R
          px[4*i + 1] = rgb.G
          px[4*i + 2] = rgb.B
          px[4*i + 3] = 255

       }

       return px

    }

    var colorsrgb = [
      { R: 154, G: 251, B: 012 },
      { R: 000, G: 173, B: 067 },
      { R: 000, G: 104, B: 192 },
      { R: 108, G: 000, B: 163 },
      { R: 202, G: 000, B: 156 },
      { R: 255, G: 085, B: 104 },
      { R: 255, G: 171, B: 071 },
      { R: 244, G: 250, B: 000 },
      { R: 154, G: 251, B: 012 },
    ]

    var breakpoints = [ 0,      22.5,      67.5,     112.5,   157.5,   202.5,      247.5,     292.5,    337.5,     360]

    function hypsotint(slope, aspect){

       let correctedAspect = aspect < 0
          ? 360 + aspect % 360
          : aspect > 360 
             ? aspect % 360 
             : aspect

       for (let i = 0; i < breakpoints.length - 1; i++){

          if (breakpoints[i] < correctedAspect && correctedAspect <= breakpoints[i + 1]){

            return colorsrgb[i]

          }

       }

       return { R: 154, G: 251, B: 012 }


    }

  
  `,
	],
	{ type: 'text/javascript' }
);
const worker4aspect = URL.createObjectURL(worker4aspecttext);

const worker4slopeaspecttext = new Blob(
	[
		`


    onmessage = function (e) {


       self.slopeaspects = {}

       if (e.data.raster) {

        const { data } = e.data.raster
        self.slopeaspects[e.data.id] = raster2slopeaspect(data)
        self.shades = shading(self.slopeaspects[e.data.id].slopes, self.slopeaspects[e.data.id].aspects)

       }

       postMessage({
          id: e.data.id,
          shades: self.shades
       })

     }



      function raster2dem(data){

         const dem = new Int16Array(256 * 256)

         var x, y, i, j

         // from https://docs.mapbox.com/help/troubleshooting/access-elevation-data/#decode-data
         function height (R, G, B) {
            return -10000 + ((R * 256 * 256 + G * 256 + B) * 0.1)
         }

         for (x = 0; x < 256; x++) {
            for (y = 0; y < 256; y++){
               i = x + y * 256
               j = i * 4
               dem[i] = height( data[j], data[j + 1], data[j + 2] )
            }
         }

         return dem

      }


      function raster2slopeaspect(raster){

         const dem = raster2dem(raster)

         const aspects = new Float32Array( 256 * 256 )
         const slopes = new Float32Array( 256 * 256 )

         var x, y, dx, dy, i

         for (x = 1; x < 255; x++){
            for (y = 1; y < 255; y++){

               i = y * 256 + x

               dx = ((dem[i - 255] + 2 * dem[i + 1]   + dem[i + 257]) -
                  (dem[i - 257] + 2 * dem[i - 1]   + dem[i + 255])) / 8;
               dy = ((dem[i + 255] + 2 * dem[i + 256] + dem[i + 257]) -
                  (dem[i - 257] + 2 * dem[i - 256] + dem[i - 255])) / 8;

               aspects[i] = dx !== 0
                  ? 90 - Math.atan2( dy, -dx ) * (180 / Math.PI)
                  : 90 - 90 * (dy > 0 ? 1 : -1)

               slopes[i] = Math.atan( Math.sqrt( dx * dx + dy * dy ) ) * 180 / Math.PI

            }
         }


       /** Shameless Hack: 
        * When calculating slope, we can't get values
        * that are on the edge of a tile, as we can't
        * get their neighbors.  Their neighbors are on
        * a different tile.  Rather than trying to coordinate
        * data between tiles, this loop takes the pixel
        * 2 pixels deep from each edge and copies it to
        * the edge pixel.  The hack is 1px wide and barely
        * visible
        */
       for (x = 0; x < 256; x++){
          for (y = 0; y < 256; y++){

             i = y * 256 + x

             if (x === 0){
                j = y * 256 + x + 1
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (x === 255){
                j = y * 256 + x - 1
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (y === 0){
                j = (y + 1) * 256 + x
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }
             if (y === 255){
                j = (y - 1) * 256 + x
                aspects[i] = aspects[j]
                slopes[i] = slopes[j]
             }


          }
       }

         return {slopes, aspects}

      }


    function shading(slopes, aspects){

     var px = new Uint8ClampedArray( 256 * 256 * 4 )


     for (let i = 0; i < aspects.length; i++){

        var hex = hypsotint(slopes[i], aspects[i])

        px[4*i + 0] = hexToR(hex)
        px[4*i + 1] = hexToG(hex)
        px[4*i + 2] = hexToB(hex)
        px[4*i + 3] = 255

       }

       return px

    }


    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}


    var colors =      [  '#9afb0c',  '#00ad43', '#0068c0', '#6c00a3', '#ca009c',  '#ff5568', '#ffab47', '#f4fa00', '#9afb0c']
    var breakpoints = [ 0,      22.5,      67.5,     112.5,   157.5,   202.5,      247.5,     292.5,    337.5,     360]
    var gradients = colors.map( color => {
       let rainbow = new Rainbow()
       rainbow.setNumberRange(0, 70)
       rainbow.setSpectrum('#808080', color)
       return rainbow
    })



    function hypsotint(slope, aspect){

       let correctedAspect = aspect < 0
          ? 360 + aspect % 360
          : aspect > 360 
             ? aspect % 360 
             : aspect

       for (let i = 0; i < breakpoints.length - 1; i++){

          if (breakpoints[i] < correctedAspect && correctedAspect <= breakpoints[i + 1]){

              

             if (slope < 70){

                return gradients[i].colorAt(slope)

             } 

             return colors[i]

          }

       }

       return '#00ad43'

    }




    function Rainbow()
    {
      "use strict";
      var gradients = null;
      var minNum = 0;
      var maxNum = 100;
      var colours = ['ff0000', 'ffff00', '00ff00', '0000ff']; 
      setColours(colours);

      function setColours (spectrum) 
      {
        if (spectrum.length < 2) {
          throw new Error('Rainbow must have two or more colours.');
        } else {
          var increment = (maxNum - minNum)/(spectrum.length - 1);
          var firstGradient = new ColourGradient();
          firstGradient.setGradient(spectrum[0], spectrum[1]);
          firstGradient.setNumberRange(minNum, minNum + increment);
          gradients = [ firstGradient ];

          for (var i = 1; i < spectrum.length - 1; i++) {
            var colourGradient = new ColourGradient();
            colourGradient.setGradient(spectrum[i], spectrum[i + 1]);
            colourGradient.setNumberRange(minNum + increment * i, minNum + increment * (i + 1)); 
            gradients[i] = colourGradient; 
          }

          colours = spectrum;
        }
      }

      this.setSpectrum = function () 
      {
        setColours(arguments);
        return this;
      }

      this.setSpectrumByArray = function (array)
      {
        setColours(array);
        return this;
      }

      this.colourAt = function (number)
      {
        if (isNaN(number)) {
          throw new TypeError(number + ' is not a number');
        } else if (gradients.length === 1) {
          return gradients[0].colourAt(number);
        } else {
          var segment = (maxNum - minNum)/(gradients.length);
          var index = Math.min(Math.floor((Math.max(number, minNum) - minNum)/segment), gradients.length - 1);
          return gradients[index].colourAt(number);
        }
      }

      this.colorAt = this.colourAt;

      this.setNumberRange = function (minNumber, maxNumber)
      {
        if (maxNumber > minNumber) {
          minNum = minNumber;
          maxNum = maxNumber;
          setColours(colours);
        } else {
          throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
        return this;
      }
    }

    function ColourGradient() 
    {
      "use strict";
      var startColour = 'ff0000';
      var endColour = '0000ff';
      var minNum = 0;
      var maxNum = 100;

      this.setGradient = function (colourStart, colourEnd)
      {
        startColour = getHexColour(colourStart);
        endColour = getHexColour(colourEnd);
      }

      this.setNumberRange = function (minNumber, maxNumber)
      {
        if (maxNumber > minNumber) {
          minNum = minNumber;
          maxNum = maxNumber;
        } else {
          throw new RangeError('maxNumber (' + maxNumber + ') is not greater than minNumber (' + minNumber + ')');
        }
      }

      this.colourAt = function (number)
      {
        return calcHex(number, startColour.substring(0,2), endColour.substring(0,2)) 
          + calcHex(number, startColour.substring(2,4), endColour.substring(2,4)) 
          + calcHex(number, startColour.substring(4,6), endColour.substring(4,6));
      }

      function calcHex(number, channelStart_Base16, channelEnd_Base16)
      {
        var num = number;
        if (num < minNum) {
          num = minNum;
        }
        if (num > maxNum) {
          num = maxNum;
        } 
        var numRange = maxNum - minNum;
        var cStart_Base10 = parseInt(channelStart_Base16, 16);
        var cEnd_Base10 = parseInt(channelEnd_Base16, 16); 
        var cPerUnit = (cEnd_Base10 - cStart_Base10)/numRange;
        var c_Base10 = Math.round(cPerUnit * (num - minNum) + cStart_Base10);
        return formatHex(c_Base10.toString(16));
      }

      function formatHex(hex) 
      {
        if (hex.length === 1) {
          return '0' + hex;
        } else {
          return hex;
        }
      } 

      function isHexColour(string)
      {
        var regex = /^#?[0-9a-fA-F]{6}$/i;
        return regex.test(string);
      }

      function getHexColour(string)
      {
        if (isHexColour(string)) {
          return string.substring(string.length - 6, string.length);
        } else {
          var name = string.toLowerCase();
          if (colourNames.hasOwnProperty(name)) {
            return colourNames[name];
          }
          throw new Error(string + ' is not a valid colour.');
        }
      }

      // Extended list of CSS colornames s taken from
      // http://www.w3.org/TR/css3-color/#svg-color
      var colourNames = {
        aliceblue: "F0F8FF",
        antiquewhite: "FAEBD7",
        aqua: "00FFFF",
        aquamarine: "7FFFD4",
        azure: "F0FFFF",
        beige: "F5F5DC",
        bisque: "FFE4C4",
        black: "000000",
        blanchedalmond: "FFEBCD",
        blue: "0000FF",
        blueviolet: "8A2BE2",
        brown: "A52A2A",
        burlywood: "DEB887",
        cadetblue: "5F9EA0",
        chartreuse: "7FFF00",
        chocolate: "D2691E",
        coral: "FF7F50",
        cornflowerblue: "6495ED",
        cornsilk: "FFF8DC",
        crimson: "DC143C",
        cyan: "00FFFF",
        darkblue: "00008B",
        darkcyan: "008B8B",
        darkgoldenrod: "B8860B",
        darkgray: "A9A9A9",
        darkgreen: "006400",
        darkgrey: "A9A9A9",
        darkkhaki: "BDB76B",
        darkmagenta: "8B008B",
        darkolivegreen: "556B2F",
        darkorange: "FF8C00",
        darkorchid: "9932CC",
        darkred: "8B0000",
        darksalmon: "E9967A",
        darkseagreen: "8FBC8F",
        darkslateblue: "483D8B",
        darkslategray: "2F4F4F",
        darkslategrey: "2F4F4F",
        darkturquoise: "00CED1",
        darkviolet: "9400D3",
        deeppink: "FF1493",
        deepskyblue: "00BFFF",
        dimgray: "696969",
        dimgrey: "696969",
        dodgerblue: "1E90FF",
        firebrick: "B22222",
        floralwhite: "FFFAF0",
        forestgreen: "228B22",
        fuchsia: "FF00FF",
        gainsboro: "DCDCDC",
        ghostwhite: "F8F8FF",
        gold: "FFD700",
        goldenrod: "DAA520",
        gray: "808080",
        green: "008000",
        greenyellow: "ADFF2F",
        grey: "808080",
        honeydew: "F0FFF0",
        hotpink: "FF69B4",
        indianred: "CD5C5C",
        indigo: "4B0082",
        ivory: "FFFFF0",
        khaki: "F0E68C",
        lavender: "E6E6FA",
        lavenderblush: "FFF0F5",
        lawngreen: "7CFC00",
        lemonchiffon: "FFFACD",
        lightblue: "ADD8E6",
        lightcoral: "F08080",
        lightcyan: "E0FFFF",
        lightgoldenrodyellow: "FAFAD2",
        lightgray: "D3D3D3",
        lightgreen: "90EE90",
        lightgrey: "D3D3D3",
        lightpink: "FFB6C1",
        lightsalmon: "FFA07A",
        lightseagreen: "20B2AA",
        lightskyblue: "87CEFA",
        lightslategray: "778899",
        lightslategrey: "778899",
        lightsteelblue: "B0C4DE",
        lightyellow: "FFFFE0",
        lime: "00FF00",
        limegreen: "32CD32",
        linen: "FAF0E6",
        magenta: "FF00FF",
        maroon: "800000",
        mediumaquamarine: "66CDAA",
        mediumblue: "0000CD",
        mediumorchid: "BA55D3",
        mediumpurple: "9370DB",
        mediumseagreen: "3CB371",
        mediumslateblue: "7B68EE",
        mediumspringgreen: "00FA9A",
        mediumturquoise: "48D1CC",
        mediumvioletred: "C71585",
        midnightblue: "191970",
        mintcream: "F5FFFA",
        mistyrose: "FFE4E1",
        moccasin: "FFE4B5",
        navajowhite: "FFDEAD",
        navy: "000080",
        oldlace: "FDF5E6",
        olive: "808000",
        olivedrab: "6B8E23",
        orange: "FFA500",
        orangered: "FF4500",
        orchid: "DA70D6",
        palegoldenrod: "EEE8AA",
        palegreen: "98FB98",
        paleturquoise: "AFEEEE",
        palevioletred: "DB7093",
        papayawhip: "FFEFD5",
        peachpuff: "FFDAB9",
        peru: "CD853F",
        pink: "FFC0CB",
        plum: "DDA0DD",
        powderblue: "B0E0E6",
        purple: "800080",
        red: "FF0000",
        rosybrown: "BC8F8F",
        royalblue: "4169E1",
        saddlebrown: "8B4513",
        salmon: "FA8072",
        sandybrown: "F4A460",
        seagreen: "2E8B57",
        seashell: "FFF5EE",
        sienna: "A0522D",
        silver: "C0C0C0",
        skyblue: "87CEEB",
        slateblue: "6A5ACD",
        slategray: "708090",
        slategrey: "708090",
        snow: "FFFAFA",
        springgreen: "00FF7F",
        steelblue: "4682B4",
        tan: "D2B48C",
        teal: "008080",
        thistle: "D8BFD8",
        tomato: "FF6347",
        turquoise: "40E0D0",
        violet: "EE82EE",
        wheat: "F5DEB3",
        white: "FFFFFF",
        whitesmoke: "F5F5F5",
        yellow: "FFFF00",
        yellowgreen: "9ACD32"
      }
    }




  
  `,
	],
	{ type: 'text/javascript' }
);
const worker4slopeaspect = URL.createObjectURL(worker4slopeaspecttext);

const workers = {
	elevation: worker4elevation,
	slope: worker4slope,
	aspect: worker4aspect,
	slopeaspect: worker4slopeaspect,
};

export default workers;

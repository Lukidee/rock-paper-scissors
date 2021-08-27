// --------------------------------------
// utility functions for conversions, etc
// --------------------------------------


// turns a value from 0-255 to a decimal between 0 and 1
// approximated at two decimal points
function intToDec(input) {
  return Math.floor(input/2.55)/100;
}
// returns hsl values from rgb input
// taken from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function rgbToHsl(r, g, b){
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if(max == min){
      h = s = 0; // achromatic
  }else{
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
  }
  // start custom hsl code
  h = Math.round(h*360);
  s = Math.round(s*100);
  l = Math.round(l*100);
  // end custom hsl code
  return [h, s, l];
}
// returns rgb values from hsl input
// taken from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion
function hslToRgb(h, s, l){
  // start custom code
  h = h/360;
  s = s/100;
  l = l/100;
  // end custom code
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}



// --------------------------------------------
// new methods that extend the ImageData object
// --------------------------------------------


// fills the ImageData object with random noise
// alpha parameter is optional
ImageData.prototype.createNoise = function(w, h, a) {
  var length = w*h*4;
  if (a == true) {
    for(var i = 0; i < length; i += 4) {
      this.data[i+0] = Math.random() * 255;
      this.data[i+1] = Math.random() * 255;
      this.data[i+2] = Math.random() * 255;
      this.data[i+3] = Math.random() * 255;
    }
  }
  else {
    for(var i = 0; i < length; i += 4) {
      this.data[i+0] = Math.random() * 255;
      this.data[i+1] = Math.random() * 255;
      this.data[i+2] = Math.random() * 255;
      this.data[i+3] = 255;
    }
  }
}


// returns color data from pixel at specified coordinate
// as an array [red, green, blue, alpha]
ImageData.prototype.getPixel = function(x, y, output) {
  var red = this.data[((this.width * y) + x) * 4];
  var green = this.data[((this.width * y) + x) * 4 + 1];
  var blue = this.data[((this.width * y) + x) * 4 + 2];
  var alpha = this.data[((this.width * y) + x) * 4 + 3];
  var color = [];
  switch (output) {
    case "hsl":
      color[0] = rgbToHsl(red, green, blue)[0];
      color[1] = rgbToHsl(red, green, blue)[1];
      color[2] = rgbToHsl(red, green, blue)[2];
      color[3] = intToDec(alpha);
    break;
    case "hex":
      var r = red.toString(16);
        if(r.length < 2) { r = '0' + r; }
      var g = green.toString(16);
        if(g.length < 2) { g = '0' + g; }
      var b = blue.toString(16);
        if(b.length < 2) { b = '0' + b; }
        color[0] = r;
        color[1] = g;
        color[2] = b;
        color[3] = intToDec(alpha);
    break;
    default:
      color[0] = red;
      color[1] = green;
      color[2] = blue;
      color[3] = intToDec(alpha);
    break;
  }
  return color;
}


// sets the value of a pixel at coordinates x, y
ImageData.prototype.setPixel = function(x, y, r, g, b, a, mode) {
  var red;
  var blue;
  var green;
  var alpha;
  switch (mode) {
    case 'hsl':
      var hsl = (hslToRgb(r,g,b));
      red = hsl[0];
      green = hsl[1];
      blue = hsl[2];
    break;
    case 'hex':
      red = parseInt(r, 16);
      green = parseInt(g, 16);
      blue = parseInt(b, 16);
    break;
    default:
      red = r;
      green = g;
      blue = b;
    break;
  }
  // converts x, y coordinates to ImageData.data array index
  var index = (x*4) + (y * this.width * 4);
  this.data[index+0] = red;
  this.data[index+1] = green;
  this.data[index+2] = blue;
  this.data[index+3] = a;
}


// returns the x and y coordinates of the specified index in the imageData.data array
ImageData.prototype.getCoordinates = function(index) {
  if (index % 4 > 0) {
    index -= index % 4;
  }
  var coordinates = [];
  coordinates[0] = (index / 4) % this.width;
  coordinates[1] = Math.floor((index / 4) / this.width);
  return(coordinates);
}

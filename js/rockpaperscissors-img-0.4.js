$(document).ready(function() {

  // setup canvas
  var canvas = document.getElementById('canvas');
  var c = canvas.getContext('2d');
  canvas.width = 250;
  canvas.height = 250;

  // setup ImageData
  var imgData = c.createImageData(canvas.width, canvas.height);

  // vars used for FPS meter
  var time1;
  var time2;
  var cycleTime;
  var fpsCounter = document.getElementById('fpscounter');


  // -------------------------------------------
  // ------ begin image to ImageData code ------
  // -------------------------------------------

  // preload background images
  var numberOfImages = 27;
  var imageFolder = 'pexels';
  var images = [];
  var preloaded = false;
  for (var i = 1; i <= numberOfImages; i++) {
    images[i-1] = new Image();
    images[i-1].src = 'img/' + imageFolder + '/bg-' + i + '.jpg';
    images[i-1].id = 'bg-' + i;
  }
  preloaded = true;

  // add <img> tag to DOM, before the canvas
  //document.getElementById('imgContainer').innerHTML = '<img src="img/bg-1.jpg" id="bgimage">';
  canvas.insertAdjacentHTML('beforebegin', '<img src="img/bg-1.jpg" id="bgimage">');

  // randomly changes the background to an image
  var bgImage = document.getElementById("bgimage");
  var bgImageData;
  var randomImage;
  var currentImage;
  function setBackground() {
    randomImage = Math.floor(Math.random()*numberOfImages);
    if (randomImage == currentImage) setBackground();
    else {
      currentImage = randomImage;
      bgImage.src = images[randomImage].src;

      c.drawImage(images[randomImage],0,0);
      //dummyImgData = dc.getImageData(0,0,dummyCanvas.width,dummyCanvas.height);
      imgData = c.getImageData(0,0,canvas.width,canvas.height);
      c.putImageData(imgData,0,0);
    }
  }
  var initTimeout = setTimeout(setBackground, 1000);

  // -----------------------------------------
  // ------ end image to ImageData code ------
  // -----------------------------------------




  // ---------------------------------------------
  // ------ begin Rock/Paper/Scissors logic ------
  // ---------------------------------------------

  var color,
      dominantColor,
      adjustedColor = [],
      neighborAxis,
      neighborX,
      neighborY,
      neighborColor,
      neighborDominantColor,
      neighborAdjustedColor = [],
      adjustmentRate,
      adjustmentBias,
      aggressiveness,
      mutationChance;



  function adjustColor(c, nc) {
    var modifiedAdjustmentRate = adjustmentRate * (Math.random() * 2);
    // var ca = Math.max(c, nc) - Math.round(modifiedAdjustmentRate * (Math.min(c, nc) ) );
    if (Math.random() > adjustmentBias) {
      var ca = Math.min(c, nc) + Math.round(modifiedAdjustmentRate * (Math.max(c, nc) ) );
    }
    else {
      var ca = Math.max(c, nc) - Math.round(modifiedAdjustmentRate * (Math.min(c, nc) ) );
    }
    return ca;
  }


  function mutateColor(mir, mig, mib) {
    // invert
    // var mor = 255 - mir;
    // var mog = 255 - mig;
    // var mob = 255 - mib;
    //return [mor, mog, mob];

    // shift RGB values
    // return [mib, mir, mig];

    // shift hue, saturation or lightness
    var hsl = rgbToHsl(mir, mig, mib);
    var mod = 3;
    var rnd = Math.random();
    if (rnd > 0.834) {
      // hue up
      hsl[0] += mod*5;
      if (hsl[0] > 360) hsl[0] -= 360;
    }
    else if (rnd > 0.667) {
      // hue down
      hsl[0] -= mod*5;
      if (hsl[0] < 0) hsl[0] += 360;
    }
    else if (rnd > 0.5) {
      // saturation up
      if (hsl[1] < (100 - mod)) hsl[1] += mod;
    }
    else if (rnd > 0.333) {
      // saturation down
      if (hsl[1] > (0 + mod)) hsl[1] -= mod;
    }
    else if (rnd > 0.167) {
      // lightness up
      if (hsl[2] < (100 - mod)) hsl[2] += mod;
    }
    else {
      // lightness down
      if (hsl[2] > (0 + mod)) hsl[2] -= mod;
    }
    var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    return [ rgb[0], rgb[1], rgb[2] ];

    // shift hue
    // var hsl = rgbToHsl(mir, mig, mib);
    // var maxShift = 120;
    // var mod = Math.ceil(Math.random() * maxShift);
    // var rnd = Math.random();
    // if (rnd > 0.5) {
    //   // hue up
    //   hsl[0] += mod;
    //   if (hsl[0] > 360) hsl[0] -= 360;
    // }
    // else  {
    //   // hue down
    //   hsl[0] -= mod;
    //   if (hsl[0] < 0) hsl[0] += 360;
    // }
    // var rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    // return [ rgb[0], rgb[1], rgb[2] ];
  }



  function rockPaperScissors() {

    // start timing
    time1 = performance.now();

    // loop through every pixel on the canvas
    for (var i = 0; i < canvas.width; i++) {
      for (var j = 0; j < canvas.height; j++) {


        // store color data of current pixel
        color = imgData.getPixel(i, j);
        // find out which color channel has the highest value
        dominantColor = color.indexOf(Math.max(color[0], color[1], color[2]));


        // pick a random neighbor (if not a border pixel)
        neighborAxis = (Math.random() < 0.5) ? 0 : 1;
        if (i <= 0) neighborX = neighborAxis;
          else if (i >= canvas.width - 1) neighborX = -1 * neighborAxis;
          else neighborX = (Math.random() < 0.5) ? 0 : neighborAxis;
        if (j <= 0) neighborY = neighborAxis;
          else if (j >= canvas.height - 1) neighborY = -1 * neighborAxis;
          else neighborY = (Math.random() < 0.5) ? 0 : neighborAxis;


        // store color data of selected neighbor pixel
        neighborColor = imgData.getPixel(i+neighborX, j+neighborY);
        // find out which color channel has the highest value
        neighborDominantColor = neighborColor.indexOf(Math.max(neighborColor[0], neighborColor[1], neighborColor[2]));


        if (Math.random() > mutationChance) {

          // no mutation: use rock paper scissors rule
          if (Math.random() > aggressiveness) {

            // not an aggressive pixel: adjusts colors gradually based on a variable
            switch (dominantColor) {

              // red is dominant
              case 0:
                // red --> green
                if (neighborDominantColor == 1) {
                  neighborAdjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  neighborAdjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  neighborAdjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i, j, neighborAdjustedColor[0], neighborAdjustedColor[1], neighborAdjustedColor[2], 255);
                }
                // red <-- blue
                else if (neighborDominantColor == 2) {
                  adjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  adjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  adjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i+neighborX, j+neighborY, adjustedColor[0], adjustedColor[1], adjustedColor[2], 255);
                }
              break;

              // green is dominant
              case 1:
                // green --> blue
                if (neighborDominantColor == 2) {
                  neighborAdjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  neighborAdjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  neighborAdjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i, j, neighborAdjustedColor[0], neighborAdjustedColor[1], neighborAdjustedColor[2], 255);
                }
                // green <-- red
                else if (neighborDominantColor == 0) {
                  adjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  adjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  adjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i+neighborX, j+neighborY, adjustedColor[0], adjustedColor[1], adjustedColor[2], 255);
                }
              break;

              // blue is dominant
              case 2:
                // blue --> red
                if (neighborDominantColor == 0) {
                  neighborAdjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  neighborAdjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  neighborAdjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i, j, neighborAdjustedColor[0], neighborAdjustedColor[1], neighborAdjustedColor[2], 255);
                }
                // blue <-- green
                else if (neighborDominantColor == 1) {
                  adjustedColor[0] = adjustColor(color[0], neighborColor[0]);
                  adjustedColor[1] = adjustColor(color[1], neighborColor[1]);
                  adjustedColor[2] = adjustColor(color[2], neighborColor[2]);
                  imgData.setPixel(i+neighborX, j+neighborY, adjustedColor[0], adjustedColor[1], adjustedColor[2], 255);
                }
              break;
            }

          }

          else {
            // pixel is aggressive: no averaging... kill or be killed
            switch (dominantColor) {
              case 0:
                // red --> green
                // red <-- blue
                if (neighborDominantColor == 1) {
                  imgData.setPixel(i, j, neighborColor[0], neighborColor[1], neighborColor[2], 255);
                }
                else if (neighborDominantColor == 2) {
                  imgData.setPixel(i+neighborX, j+neighborY, color[0], color[1], color[2], 255);
                }
              break;
              // green --> blue
              // green <-- red
              case 1:
                if (neighborDominantColor == 2) {
                  imgData.setPixel(i, j, neighborColor[0], neighborColor[1], neighborColor[2], 255);
                }
                else if (neighborDominantColor == 0) {
                  imgData.setPixel(i+neighborX, j+neighborY, color[0], color[1], color[2], 255);
                }
              break
              // blue --> red
              // blue <-- green
              case 2:
                if (neighborDominantColor == 0) {
                  imgData.setPixel(i, j, neighborColor[0], neighborColor[1], neighborColor[2], 255);
                }
                else if (neighborDominantColor == 1) {
                  imgData.setPixel(i+neighborX, j+neighborY, color[0], color[1], color[2], 255);
                }
              break;
            }
          }

        }

        else {

          // mutation: pixel changes color
          var mutatedColor = mutateColor(neighborColor[0], neighborColor[1], neighborColor[2]);
          //var mutatedColor = mutateColor(neighborColor[0], neighborColor[1], neighborColor[2]);
          imgData.setPixel(i, j, mutatedColor[0], mutatedColor[1], mutatedColor[2], 255);

        }

      }


    }

    // draw the image on the canvas
    c.putImageData(imgData, 0, 0);

    // tracks time and calls FPS counter function
    time2 = performance.now();
    cycleTime = time2 - time1;

  }

  // -------------------------------------------
  // ------ end Rock/Paper/Scissors logic ------
  // -------------------------------------------



  // initialize menu items
  var adjustmentRateSlider = document.getElementById("adjustmentrate");
  adjustmentRate = adjustmentRateSlider.value;
  var adjustmentBiasSlider = document.getElementById("adjustmentbias");
  adjustmentBias = adjustmentBiasSlider.value;
  var aggressivenessSlider = document.getElementById("aggressiveness");
  aggressiveness = aggressivenessSlider.value;
  var mutationChanceSlider = document.getElementById("mutationchance");
  mutationChance = mutationChanceSlider.value;

  var cssFiltersCheckbox = document.getElementById("cssfilters");
  var cssFilters = cssFiltersCheckbox.checked;
  var blurSlider = document.getElementById("blur");
  var blur = blurSlider.value;
  var saturationSlider = document.getElementById("saturation");
  var saturation = saturationSlider.value;
  var brightnessSlider = document.getElementById("brightness");
  var brightness = brightnessSlider.value;
  var contrastSlider = document.getElementById("contrast");
  var contrast = contrastSlider.value;
  var hueRotateSlider = document.getElementById("huerotate");
  var hueRotate = hueRotateSlider.value;

  // menu interaction
  adjustmentRateSlider.oninput = function() { adjustmentRate = adjustmentRateSlider.value; }
  adjustmentBiasSlider.oninput = function() { adjustmentBias = adjustmentBiasSlider.value; }
  aggressivenessSlider.oninput = function() { aggressiveness = aggressivenessSlider.value; }
  mutationChanceSlider.oninput = function() { mutationChance = mutationChanceSlider.value; }

  cssFiltersCheckbox.onchange = function() { cssFilters = cssFiltersCheckbox.checked; }
  blurSlider.oninput = function() { blur = blurSlider.value; }
  saturationSlider.oninput = function() { saturation = saturationSlider.value; }
  brightnessSlider.oninput = function() { brightness = brightnessSlider.value; }
  contrastSlider.oninput = function() { contrast = contrastSlider.value; }
  hueRotateSlider.oninput = function() { hueRotate = hueRotateSlider.value; }

  // jQuery stuff
  $("#controlpanel").animate({width:'toggle'},50);
  $("#hiddenbutton").click(function() {
    if (window.innerWidth < 500) {
      $("#fpscounter").animate({opacity:'toggle'},200);
    }
    $("#controlpanel").animate({width:'toggle'},200);
    this.blur();
  });


  // places a new image when spacebar is pressed
  $(document).keydown(function(e) {
    if (e.keyCode == 32) {
      setBackground();
      // reset the timer for the image rotation
      clearInterval(iSetBackground);
      iSetBackground = setInterval(setBackground, 30000);
    }
  });
  $(canvas).click(function(){
	  setBackground();
	  // reset the timer for the image rotation
	  clearInterval(iSetBackground);
	  iSetBackground = setInterval(setBackground, 30000);
  });



  // adds CSS filters with constantly shifting hues
  var hue = 0;
  function filterShift() {
    if (cssFilters == true) {
      $('canvas').css('filter', 'blur(' + blur + 'px) saturate(' + saturation + '%) brightness(' + brightness + '%) contrast(' + contrast + '%) hue-rotate(' + Math.round(hue) + 'deg)');
      hue += parseInt(hueRotate); // why did this get read as a string? the other sliders worked fine :/
      if(hue > 360) hue -= 360;
    }
    else {
      $('canvas').css('filter', 'none');
    }
  }


  // FPS counter
  function calculateFPS() {
    var fps = 1000 / cycleTime;
    fpsCounter.innerHTML = Math.floor(fps) + '<span>fps</span>';
  }


  // setup intervals
  if (preloaded) {
    setBackground();
    var iSetBackground = setInterval(setBackground, 30000);
  }
  var iRockPaperScissors = setInterval(rockPaperScissors, 5); // 5
  var iFilterShift = setInterval(filterShift, 60);
  var iCalculateFPS = setInterval(calculateFPS, 1000);

});

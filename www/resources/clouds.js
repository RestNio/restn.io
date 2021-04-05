/*
 * A speed-improved perlin and simplex noise algorithms for 2D.
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 * Clouds (helper) added by Kasper Müller
 *
 * Version 2021-02-19
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 *
 */

(function(global){

    var module = global.noise = {};
  
    function Grad(x, y, z) {
      this.x = x; this.y = y; this.z = z;
    }
    
    Grad.prototype.dot2 = function(x, y) {
      return this.x*x + this.y*y;
    };
  
    Grad.prototype.dot3 = function(x, y, z) {
      return this.x*x + this.y*y + this.z*z;
    };

    const perScale = Math.sqrt(3.0/4.0);
  
    var grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
                 new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
                 new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
  
    var p = [151,160,137,91,90,15,
    131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
    190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
    88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
    77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
    102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
    135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
    5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
    223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
    129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
    251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
    49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
    138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
    // To remove the need for index wrapping, double the permutation table length
    var perm = new Array(512);
    var gradP = new Array(512);
  
    // This isn't a very good seeding function, but it works ok. It supports 2^16
    // different seed values. Write something better if you need more seeds.
    module.seed = function(seed) {
      if(seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }
  
      seed = Math.floor(seed);
      if(seed < 256) {
        seed |= seed << 8;
      }
  
      for(var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
          v = p[i] ^ (seed & 255);
        } else {
          v = p[i] ^ ((seed>>8) & 255);
        }
  
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
      }
    };
  
    module.seed(0);
  
    // ##### Perlin noise stuff
  
    function fade(t) {
      return t*t*t*(t*(t*6-15)+10);
    }
  
    function lerp(a, b, t) {
      return (1-t)*a + t*b;
    }

    module.lerp = lerp;
  
    // 3D Perlin Noise
    module.perlin3 = function(x, y, z) {
      // Find unit grid cell containing point
      var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
      // Get relative xyz coordinates of point within that cell
      x = x - X; y = y - Y; z = z - Z;
      // Wrap the integer cells at 255 (smaller integer period can be introduced here)
      X = X & 255; Y = Y & 255; Z = Z & 255;
  
      // Calculate noise contributions from each of the eight corners
      var n000 = gradP[X+  perm[Y+  perm[Z  ]]].dot3(x,   y,     z);
      var n001 = gradP[X+  perm[Y+  perm[Z+1]]].dot3(x,   y,   z-1);
      var n010 = gradP[X+  perm[Y+1+perm[Z  ]]].dot3(x,   y-1,   z);
      var n011 = gradP[X+  perm[Y+1+perm[Z+1]]].dot3(x,   y-1, z-1);
      var n100 = gradP[X+1+perm[Y+  perm[Z  ]]].dot3(x-1,   y,   z);
      var n101 = gradP[X+1+perm[Y+  perm[Z+1]]].dot3(x-1,   y, z-1);
      var n110 = gradP[X+1+perm[Y+1+perm[Z  ]]].dot3(x-1, y-1,   z);
      var n111 = gradP[X+1+perm[Y+1+perm[Z+1]]].dot3(x-1, y-1, z-1);
  
      // Compute the fade curve value for x, y, z
      var u = fade(x);
      var v = fade(y);
      var w = fade(z);
  
      // Interpolate
      return lerp(
          lerp(
            lerp(n000, n100, u),
            lerp(n001, n101, u), w),
          lerp(
            lerp(n010, n110, u),
            lerp(n011, n111, u), w),
         v);
    };

    // Output 0-1 perlin 3d with scale.
    // @7kasper
    module.perper = function (x, y, t, scale) {
        return ((module.perlin3(x*scale, y*scale, t) + perScale) / (perScale * 2))
    };

    /**
     * CLOUDS
     * Rough scetch to create nice cloud backgroun using this perlin library
     * and a simple 2D canvas context.
     */
    module.doClouds = function(elem) {
        // Setup context. Get the main canvas.
        const canvas = elem;
        // Get context and pixeldata to the canvas.
        const ctx = canvas.getContext('2d');
        let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
        // Seed the perlin generator:
        module.seed(Math.random());
        let pixelData = pixels.data;
        
        const res = 4;

        function resize() {
            ctx.canvas.width = window.innerWidth /res;
            ctx.canvas.height = window.innerHeight /res;
            pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
            pixelData = pixels.data;
            console.log('Resising!');
        }

        let t = 0;
        const dT = 0.0000001;
        let mxT = 0;
        let myT = 0;

        let mouseX = 0.0;
        let mouseY = 0.0;


        let targetX = 0.0;
        let targetY = 0.0;
        let targetS = -100;

        function updateMouse(e) {
            mouseX = ((e.clientX * 2) / window.innerWidth) - 1;
            mouseY = ((e.clientY * 2) / window.innerHeight) - 1;
        }

        let lerpXT = 0.0;
        let lerpYT = 0.0;
        const lerpdT = 0.01;

        function easeOutSine(x) {
            return Math.sin((x * Math.PI) / 2);
        }

        function keppe() {

            targetX += (mouseX - targetX) / 20;
            targetY += (mouseY - targetY) / 20;


            for (let y = 0; y < canvas.height; y++) {
                for (let x = 0; x < canvas.width; x++) {
                    


                    let index = (y * canvas.width + x) * 4;
                    // let n = ((noise.perlin3(x/50, y/50, t += 0.00000005) + perScale) / (perScale * 2));
                    t += dT; mxT += dT * targetX * targetS; myT += dT * targetY * targetS;
                    let nBase   = noise.perper(x + mxT,   y + myT,   t/3, 0.02);
                    let nMiddle = noise.perper(x + mxT,   y + myT,   t/2, 0.04);
                    let nTop    = noise.perper(x + mxT*2, y + myT*2, t,   0.08);
                    let nval = Math.round((nBase * 6 + nMiddle * 3 + nTop) * (255 / 15) + 85); // 100 + 155;
                    pixelData[index + 0] = nval; // Red channel)
                    pixelData[index + 1] = nval; // Green channel
                    pixelData[index + 2] = nval; // Blue channel
                    pixelData[index + 3] = 255; // Alpha channel
                }
            }
            ctx.putImageData(pixels, 0, 0);
            window.requestAnimationFrame(keppe);
        }
        keppe();

        window.addEventListener('mousemove', updateMouse);

        window.addEventListener('resize', resize);
    }
  
  })(this);
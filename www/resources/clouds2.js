/*
 * Script to create nice fluffy clouds for the restn.io background page :-)
 *
 * Based on example code by Stefan Gustavson (stegu@itn.liu.se).
 * Optimisations by Peter Eastman (peastman@drizzle.stanford.edu).
 * Better rank ordering method by Stefan Gustavson in 2012.
 * Converted to Javascript by Joseph Gentle.
 * Converted to ES6 by Kasper Müller
 * Clouds (helper) added by Kasper Müller
 *
 * Version 2021-03-05
 *
 * This code was placed in the public domain by its original author,
 * Stefan Gustavson. You may use it as you see fit, but
 * attribution is appreciated.
 */

'use strict';

// ============================
//           Gradiant
// ============================

class Grad {

    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    /**
     * Gets a 2 dimensional dot product on the x and y of the grad.
     * @param {number} x
     * @param {number} y
     * @returns the dot product.
     */
    dot2(x, y) {
        return this.x * x + this.y * y;
    }

    /**
     * Gets a 3 dimensional dot product.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns the dot product.
     */
    dot3(x, y, z) {
        return this.x * x + this.y * y + this.z * z;
    }

}

// ============================
//         Perlin Noise
// ============================

class Perlin3D {

    // Grad 3 reference
    static grad3 = [new Grad(1,1,0),new Grad(-1,1,0),new Grad(1,-1,0),new Grad(-1,-1,0),
        new Grad(1,0,1),new Grad(-1,0,1),new Grad(1,0,-1),new Grad(-1,0,-1),
        new Grad(0,1,1),new Grad(0,-1,1),new Grad(0,1,-1),new Grad(0,-1,-1)];
    
    // Propability field.
    static p = [151,160,137,91,90,15,
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
    
    // Scalefactor on perlin noise (for output 0-1 instead of 0-perlindimension)
    static perScale = Math.sqrt(3.0/4.0);
    
    perm = new Array(512);
    gradP = new Array(512);
    _seed = 0;

    /**
     * Creates a perlin noise object with given seed.
     * @param {number} seed the seed to use.
     */
    constructor(seed = 0) {
        this.seed(seed);
    }

    /**
     * Set the seed for the perlon noise.
     * @param {number} seed the seed for the perlin noise object.
     */
    seed(seed) {
        this._seed = seed;
        if (seed > 0 && seed < 1) {
            // Scale the seed out
            seed *= 65536;
        }

        seed = Math.floor(seed);
        if (seed < 256) {
            seed |= seed << 8;
        }

        for (let i = 0; i < 256; i++) {
            let v;
            if (i & 1) {
            v = Perlin3D.p[i] ^ (seed & 255);
            } else {
            v = Perlin3D.p[i] ^ ((seed>>8) & 255);
            }

            this.perm[i]  = this.perm[i + 256] = v;
            this.gradP[i] = this.gradP[i + 256] = Perlin3D.grad3[v % 12];
        }
    };

    /**
     * Fades the value.
     * @param {number} t - the dimension variable
     * @returns the faded value
     */
    static fade(t) {
        return t*t*t*(t*(t*6-15)+10);
    }

    /**
     * Lerp (linear interpolation) on a value.
     * @param {number} a number a
     * @param {number} b number b
     * @param {number} t the dimension variable
     * @returns the lerped value.
     */
    static lerp(a, b, t) {
        return (1-t)*a + t*b;
    }

    /**
     * Computes perlin noise based on the seed and 3 dimension variables.
     * @param {number} x the x variable
     * @param {number} y the y variable
     * @param {number} z the z variable
     * @returns a noisy value
     */
    perlin(x, y, z) {
        // Find unit grid cell containing point
        let X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
        // Get relative xyz coordinates of point within that cell
        x = x - X; y = y - Y; z = z - Z;
        // Wrap the integer cells at 255 (smaller integer period can be introduced here)
        X = X & 255; Y = Y & 255; Z = Z & 255;
    
        // Calculate noise contributions from each of the eight corners
        let n000 = this.gradP[X+  this.perm[Y+  this.perm[Z  ]]].dot3(x,   y,     z);
        let n001 = this.gradP[X+  this.perm[Y+  this.perm[Z+1]]].dot3(x,   y,   z-1);
        let n010 = this.gradP[X+  this.perm[Y+1+this.perm[Z  ]]].dot3(x,   y-1,   z);
        let n011 = this.gradP[X+  this.perm[Y+1+this.perm[Z+1]]].dot3(x,   y-1, z-1);
        let n100 = this.gradP[X+1+this.perm[Y+  this.perm[Z  ]]].dot3(x-1,   y,   z);
        let n101 = this.gradP[X+1+this.perm[Y+  this.perm[Z+1]]].dot3(x-1,   y, z-1);
        let n110 = this.gradP[X+1+this.perm[Y+1+this.perm[Z  ]]].dot3(x-1, y-1,   z);
        let n111 = this.gradP[X+1+this.perm[Y+1+this.perm[Z+1]]].dot3(x-1, y-1, z-1);
    
        // Compute the fade curve value for x, y, z
        let u = Perlin3D.fade(x);
        let v = Perlin3D.fade(y);
        let w = Perlin3D.fade(z);
    
        // Interpolate
        return Perlin3D.lerp(
            Perlin3D.lerp(
                Perlin3D.lerp(n000, n100, u),
                Perlin3D.lerp(n001, n101, u), w),
            Perlin3D.lerp(
                Perlin3D.lerp(n010, n110, u),
                Perlin3D.lerp(n011, n111, u), w),
            v
        );
    };

    /**
     * Computes scaled perlin noise based on the seed and 3 dimension variables.
     * @param {number} x the x variable
     * @param {number} y the y variable
     * @param {number} t the unscaled t (time) variable
     * @param {number} [scale=1] the xy scale to use
     * @returns a scaled noisy value (number between 0-1)
     */
    perper(x, y, t, scale=1) {
        return ((this.perlin(x*scale, y*scale, t) + Perlin3D.perScale) / (Perlin3D.perScale * 2))
    };

}

// ============================
//            Clouds
// ============================

class Clouds extends Perlin3D {

    // Time differential.
    dT = 0.003;
    // Target speed
    targetS = -100;

    // Position and time muxes:
    mxT = 0;
    myT = 0;
    t   = 0;

    /**
     * Creates clouds object.
     * @param {number} [seed] the seed to instantiate the perlin noise with.
     * @param {number} [dT] the time differential. Effectively sets the cloudspeed.
     * @param {number} [targetS] the speed the target is tracked at.
     */
    constructor(seed = 0, dT = 0.003, targetS = -100) {
        super(seed);
        this.dT = dT;
        this.targetS = targetS;
    }

    /**
     * Goes to the next time frame for the cloud animation.
     * @param {number} targetX the x to go towards with targetSpeed.
     * @param {number} targetY the y to go towards with targetSpeed.
     */
    newFrame(targetX, targetY) {
        this.t   += this.dT;
        this.mxT += this.dT * targetX * this.targetS; 
        this.myT += this.dT * targetY * this.targetS;
    }

    /**
     * Gets cloud color for a certain pixel.
     * @param {number} x the x position
     * @param {number} y the y position
     * @returns a number between 0-255
     */
    getCloudPixel(x, y) {
        let nBase   = this.perper(x + this.mxT,   y + this.myT,   this.t/3, 0.02);
        let nMiddle = this.perper(x + this.mxT,   y + this.myT,   this.t/2, 0.04);
        let nTop    = this.perper(x + this.mxT*2, y + this.myT*2, this.t,   0.08);
        return Math.round((nBase * 6 + nMiddle * 3 + nTop) * (255 / 15) + 85); // 100 + 155;
    }

}
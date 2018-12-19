class KCD_PixelData {
    static getPixelData(image_elem, canvas_elem) {
        let img = document.getElementById(image_elem);
        let canvas = document.getElementById(canvas_elem);

        canvas.width = img.width;
        canvas.height = img.height;

        if (img.width !== img.height) {
            alert('Terrain hightmap requires equal width and heights!\nCurrent width x height is ' + img.width + " x " + img.height);
            console.error('Terrain hightmap requires equal width and heights!\nCurrent width x height is ' + img.width + " x " + img.height);
        }

        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);

        /**
         * The readonly ImageData.data property returns a Uint8ClampedArray representing
         * a one-dimensional array containing the data in the RGBA order, with integer
         * values between 0 and 255 (included).
         * * https://developer.mozilla.org/en-US/docs/Web/API/ImageData/data
         * 
         * RGBA color values are an extension of RGB color values with an alpha channel
         * - which specifies the opacity for a color. An RGBA color value is specified
         * with: rgba(red, green, blue, alpha). The alpha parameter is a number between
         * 0.0 (fully transparent) and 1.0 (fully opaque).
         * * https://www.w3schools.com/css/css3_colors.asp
         */

        let imgData = canvas.getContext('2d').getImageData(0, 0, img.height, img.width);
        let data = imgData.data;
        let normPixels = [];

        for (let i = 0, n = data.length; i < n; i += 4) {

            const AVERAGE_NUM = 3;

            /**
             * get the average value of the R, G, B values
             *  
             * Because a height describes our height values based on a grayscale /
             * monochrome color image map we're getting our height by averaging the
             * three rgb color values.  They should all be the same value anyway but
             * averaging would allow using images that may not be monochrome
             */
            normPixels.push((data[i] + data[i + 1] + data[i + 2]) / AVERAGE_NUM);
        }

        let terrain = {
            data: normPixels,
            segments: img.width - 1
        };

        return terrain;
    }
}

class KCD_Animator {

    constructor(model, animations, start_action) {
        this.previousAction = start_action;
        this.activeAction = start_action;

        this.mixer = new THREE.AnimationMixer(model);
        this.actions = {};

        for (let i = 0; i < animations.length; i++) {
            let clip = animations[ i ];
            let action = this.mixer.clipAction(clip);
            this.actions[ clip.name ] = action;
        }

        this.activeAction = this.actions[start_action];
        this.activeAction.play();
    }

    fadeToAction(name, duration) {
        this.previousAction = this.activeAction;
        this.activeAction = this.actions[ name ];

        if (this.previousAction !== this.activeAction) {
            this.previousAction.fadeOut(duration);
        }

        this.activeAction
                .reset()
                .setEffectiveTimeScale(1)
                .setEffectiveWeight(1)
                .fadeIn(duration)
                .play();
    }
}


// for grabbing the img and building the pixel data for the terrain
class PixelData {
    // static method
    static getMapPixelData(image_elem, canvas_elem) {
        let img = document.getElementById(image_elem);
        let canvas = document.getElementById(canvas_elem);

        canvas.width = img.width;
        canvas.height = img.height;
        
        /*
         * the image is loaded in the browser as a standard img tag and
         * we get the pixel data out of it to make the height map.
         * 
         */

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

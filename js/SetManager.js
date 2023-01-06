class SetManager
{
    constructor(THREE, CONSTANTS, SCENE) {
        this.THREE = THREE;
        this.CONSTANTS = CONSTANTS;
        this.scene = SCENE;
        this.camera;
    }

    initRenderer(CHASE_CAMERA) {
        let renderer = new this.THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x56579e);
        // shadow map
        renderer.shadowMap.enabled = true;
        renderer.shadowCameraNear = 3;
        renderer.shadowCameraFar = CHASE_CAMERA.far;
        renderer.shadowCameraFov = 50;
        renderer.shadowMapDarkness = 0.5;
        renderer.shadowMapWidth = 1024;
        renderer.shadowMapHeight = 1024;
        renderer.shadowMapDebug = false;
        // add it
        renderer.domElement.id = "render_canvas";
        document.body.appendChild(renderer.domElement);
        return renderer;
    }

    initCamera(THREE) {
        this.camera = new THREE.PerspectiveCamera(
              this.CONSTANTS.CAMERA_FOV,
              this.CONSTANTS.CAMERA_ASPECT,
              this.CONSTANTS.CAMERA_NEAR,
              this.CONSTANTS.CAMERA_FAR);
              
        this.camera.userData.leftRightOffset = 0.0;
        this.camera.userData.upDownOffset = 0.0;
        
        return this.camera;
    }

    initLights() {
        //  low evening light
        let ambientLight = new this.THREE.AmbientLight(this.CONSTANTS.LIGHT_SPECS.ALIGHT_COLOR);

        this.scene.add(ambientLight);

        // simulated moonlight
        let directionalLight = new this.THREE.DirectionalLight(this.CONSTANTS.LIGHT_SPECS.DLIGHT_COLOR, 1);
        directionalLight.position.copy(this.CONSTANTS.LIGHT_SPECS.DLIGHT_POS);
        directionalLight.castShadow = this.CONSTANTS.LIGHT_SPECS.DLIGHT_CAST;

        // shadows
        directionalLight.shadow.camera.top = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_TR;
        directionalLight.shadow.camera.right = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_TR;
        directionalLight.shadow.camera.bottom = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_BL;
        directionalLight.shadow.camera.left = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_BL;

        directionalLight.shadow.mapSize.width = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_MAPSIZE;
        directionalLight.shadow.mapSize.height = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_MAPSIZE;

        directionalLight.shadow.camera.near = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_NEAR; // default
        directionalLight.shadow.camera.far = this.CONSTANTS.LIGHT_SPECS.DLIGHT_SHADOW_FAR;

        this.scene.add(directionalLight);
    }

    initSky(scene) {
        scene.background = new this.THREE.CubeTextureLoader()
              .setPath(this.CONSTANTS.SKY_SPECS.SKY_PATH)
              .load(this.CONSTANTS.SKY_SPECS.SKY_IMAGES);
    }
    
    addGround(SNOW_GROUND, CONSTANTS, GROUND_DATA) {
        // GROUND TEXTURE
        const TEXTURE_REPEAT = 10;

        // texture already preloaded
        SNOW_GROUND.wrapS = this.THREE.RepeatWrapping;
        SNOW_GROUND.wrapT = this.THREE.RepeatWrapping;
        SNOW_GROUND.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);

        // set the snow material
        let terrain_material = new this.THREE.MeshStandardMaterial({
            color: 0xccccff,
            roughness: 1.0,
            map: SNOW_GROUND,
            bumpMap: SNOW_GROUND,
            bumpScale: 5,
            flatShading: false,
            fog: true
            //opacity: 0.2,
            //transparent: true
        });

        // Over in utilities.js
        // Get ground pixel data for building ground model using an array containing
        // the "height" values of ALL of the image pixels.  The image is an actual
        // img tag in the html with display none.  This means it's already loaded and
        // we can use anything that works in an img tag
        let terrain = PixelData.getMapPixelData("heightmap_image", "heightmap_canvas");

        /*
         * PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
         * width — Width along the X axis. Default is 1.
         * height — Height along the Y axis. Default is 1.
         * widthSegments — Optional. Default is 1.
         * heightSegments — Optional. Default is 1.
         *
         * Our heightmap is a component of our structure and simply an array of data
         * more than an image: Keep in mind that the GROUND_MESH geometry always has +1 more vertices
         * than segments. If there's 100 x 100 segments means 101 x 101 vertices, etc,.
         * This means that the texture image should always be +1 width and height to
         * the segments and that number is sent back with the pixel data
         */
        GROUND_DATA.GEOMETRY = new this.THREE.PlaneGeometry(CONSTANTS.GROUND_SIZE, CONSTANTS.GROUND_SIZE, terrain.segments, terrain.segments);
        GROUND_DATA.GEOMETRY.userData.vertices = [];

        // actually create and add the ground
        GROUND_DATA.MESH = new this.THREE.Mesh(GROUND_DATA.GEOMETRY, terrain_material);
        GROUND_DATA.MESH.position.set(0, 0, 0);

        //rotate it so up is Y
        GROUND_DATA.MESH.geometry.rotateX(-Math.PI / 2);

        //update its matrix so the vertex positions reflect the rotation
        GROUND_DATA.MESH.updateMatrix();
        GROUND_DATA.MESH.geometry.applyMatrix4(GROUND_DATA.MESH.matrix);
        GROUND_DATA.MESH.matrix.identity();

        // yes, we will have shadows
        GROUND_DATA.MESH.receiveShadow = true;

        // here we apply the height information from the image to the PlaneGeometry.
        // So modifying the Y position of all vertices to show ground height according
        // to our map
        const positionAttribute = GROUND_DATA.GEOMETRY.getAttribute("position");

        for (let i = 0; i < positionAttribute.count; i++) {
            // temp vertex holder
            const vertex = new this.THREE.Vector3();
            // extract the vertex information
            vertex.fromBufferAttribute(positionAttribute, i);
            // add the image data and whatever mod we decised on
            vertex.y += terrain.data[i] * CONSTANTS.TERRAIN_HEIGHT_MOD;
            // and set that position
            positionAttribute.setY(i, vertex.y);
            // while we're here looping over the vertex data, get the vertex xyz
            // positions and store them for easy use later when positioning objects
            // on the ground
            GROUND_DATA.GEOMETRY.userData.vertices.push(vertex);
        }

        // calculate the highpoint for the wolf
        let vertices = GROUND_DATA.GEOMETRY.userData.vertices;
        GROUND_DATA.HIGHPOINT = new this.THREE.Vector3(0, 0, 0);
        // the highest z is the hill top
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y > GROUND_DATA.HIGHPOINT.y) {
                GROUND_DATA.HIGHPOINT.copy(vertices[i]);
            }
        }

        // and add it
        this.scene.add(GROUND_DATA.MESH);
    }
}

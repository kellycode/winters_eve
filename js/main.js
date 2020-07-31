// just for the IDE
if (!THREE) {
    var THREE = {};
    console.error('THREE is not loaded');
}

(function WintersEve() {
    'use strict';

    // CONSTANTS
    const TERRAIN_HEIGHT_MOD = 2;
    const CAMERA_HEIGHT = 100;
    const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
    // no trees if less than 10000
    const GROUND_SIZE = 10000;
    const SKY_HEIGHT = 3000;
    const MOON_SCALE = 1000;
    const MOON_POS = new THREE.Vector3(-GROUND_SIZE * 2, GROUND_SIZE * 2 / 2, 0);
    const MOONLIGHT_POS = new THREE.Vector3(-GROUND_SIZE, GROUND_SIZE / 2, 0);
    const SHOW_STATS = false;
    const AMB_LIGHT_COLOR = 0x222222;
    const DIR_LIGHT_COLOR = 0x455767;
    const DEER_COUNT = 10;
    const SNOWFLAKES = 50000;

    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, GROUND_SIZE * 5);
    let renderer;
    let raycaster = new THREE.Raycaster();
    let ground_mesh;
    let controls = new SimpleWASDControls(camera, document);
    // only loads if touch is available
    let m_controls = new SimpleMobileControls(camera, document);
    let snowMaterials = [];
    let loading = '';
    let stats;

    if (SHOW_STATS) {
        stats = new Stats();
        document.body.appendChild(stats.dom);
    }

    // LIGHTS
    let directionalLight;
    let ambientLight;

    // TEXTURE ITEMS
    let textureManager = new THREE.LoadingManager();
    let textureLoader = new THREE.TextureLoader(textureManager);
    let groundTextureMap;
    let snowFlakeImage;
    let treeTexture;
    let moonSprite;
    let moonTexture;
    let firTexture;

    // ANIMATION ITEMS
    let wolfAnimMixer, deerAnimMixer;
    let clock_deer = new THREE.Clock();
    let clock_wolf = new THREE.Clock();
    let clock_snowman = new THREE.Clock();
    let jsonLoader = new THREE.LegacyJSONLoader( );
    let snowStorms = [];
    let snowman;

    function loadScene() {
        setUpRenderer();
        setupCamera();
        addLights();
        addSky();
        addGround();
        addAnimals();
        addFallingSnow();
        addMoon();
        addSnowman();
        addTrees();
        render();
    }

    function updateLoadingPercent() {
        loading = document.getElementById("load_percent").innerHTML;
        loading = parseInt(loading) + 14;
        document.getElementById("load_percent").innerHTML = loading;
        if (loading > 100) {
            let elem = document.querySelector(".standard_notice");
            elem.style.display = 'none';
        }
    }

    function preloadTextures() {
        textureManager.onStart = function (item, loaded, total) {
            // this gets called after any item has been loaded
            updateLoadingPercent();
        };
        textureManager.onLoad = function (a, b, c) {
            // called when all textures are loaded
            loadScene();
        };
        textureManager.onProgress = function (item, loaded, total) {
            // this gets called after any item has been loaded
            // update loading notifications 2,3,4 & 5 for each image
            updateLoadingPercent();
        };
        textureManager.onError = function (url) {
            console.error('Failed to load texture ' + url);
        };
        // textureLoader is a synchronous loader so we can throw it all the 
        // texture requests at once without blocking
        groundTextureMap = textureLoader.load("assets/snow_ground.jpg");
        snowFlakeImage = textureLoader.load("assets/snowflake.png");
        treeTexture = textureLoader.load("assets/sb.png");
        firTexture = textureLoader.load("assets/fir.jpg");
        moonTexture = textureLoader.load("assets/moon_sd.png");
    }

    window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }, false);


    function setUpRenderer() {
        renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x56579e);
        // shadow map
        renderer.shadowMap.enabled = true;
        renderer.shadowCameraNear = 3;
        renderer.shadowCameraFar = camera.far;
        renderer.shadowCameraFov = 50;
        renderer.shadowMapDarkness = 0.5;
        renderer.shadowMapWidth = 1024;
        renderer.shadowMapHeight = 1024;
        renderer.shadowMapDebug = false;
        // add it
        renderer.domElement.id = "render_canvas";
        document.body.appendChild(renderer.domElement);
    }

    function addMoon() {
        let spriteMap = moonTexture;
        let spriteMaterial = new THREE.SpriteMaterial({map: spriteMap, color: 0xffffff});
        moonSprite = new THREE.Sprite(spriteMaterial);
        moonSprite.position.copy(MOON_POS);
        moonSprite.scale.set(MOON_SCALE, MOON_SCALE, 1);
        scene.add(moonSprite);
    }

    function addTrees() {
        if(GROUND_SIZE < 10000) {
            console.log('GROUND_SIZE is too small to add trees');
            return;
        }
        
        let TF = new TreeFactory();
        // get the list of ground vertices to plant a tree at random locations
        let vertices = ground_mesh.geometry.vertices;
        // add however many trees
        for (let i = 0; i < 100; i++) {
            let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
            let tree = TF.simpleTree(treeTexture);
            tree.position.set(randomVertex.x, randomVertex.y, randomVertex.z);
            // don't plant tree on the camera
            if (camera.position.distanceTo(tree.position) < 1000) {
                i--;
                continue;
            }
            tree.scale.y = tree.scale.x = tree.scale.z = 10;
            tree.receiveShadow = true;
            tree.castShadow = true;
            scene.add(tree);
        }
    }

    function addAnimals() {
        wolfAnimMixer = new THREE.AnimationMixer(scene);
        deerAnimMixer = new THREE.AnimationMixer(scene);

        let vertices = ground_mesh.geometry.vertices;
        let highPoint = new THREE.Vector3(0, 0, 0);

        // the highest y is the hill top for the wolf
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y > highPoint.y) {
                highPoint.copy(vertices[i]);
            }
        }

        // I need to make the deprecated json models
        // go away but they're what I have atm

        // add the wolf
        let wolfLoader = function (geometry, materials) {
            // update loading notification 5
            updateLoadingPercent();
            let material = materials[ 0 ];
            material.morphTargets = true;
            material.color.setHex(0x8b6e4f);
            material.map = firTexture;
            let mesh = new THREE.Mesh(geometry, materials);
            // set on the hilltop
            mesh.position.copy(highPoint);
            // TODO: move this to model - maybe
            let scale = 20;
            mesh.scale.set(scale, scale, scale);
            mesh.rotation.y = THREE.Math.randFloat(-1, 1);
            mesh.castShadow = true;
            mesh.updateMatrix();
            mesh.geometry.computeVertexNormals();
            scene.add(mesh);
            // wolf manages it's own
            wolfAnimMixer.clipAction(mesh.geometry.animations[ 0 ], mesh)
                    .setDuration(2) // seconds
                    .startAt(0)
                    .play();
        };
        jsonLoader.load('assets/models/wolf_sitting.js', wolfLoader);

        // add a few deer
        function createDeer(deerGeometry, materials) {
            updateLoadingPercent();
            let material = materials[ 0 ];
            material.morphTargets = true;
            material.color.setHex(0x774f25);
            // add however many deer
            for (let i = 0; i < DEER_COUNT; i++) {
                let mesh = new THREE.Mesh(deerGeometry, materials);
                let scale = 10;
                mesh.scale.set(scale, scale, scale);
                let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
                mesh.position.set(randomVertex.x, randomVertex.y + 50, randomVertex.z);
                mesh.rotation.set(0, Math.random() * Math.PI, 0);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                mesh.geometry.dynamic = true;
                mesh.geometry.computeVertexNormals();
                scene.add(mesh);
                deerAnimMixer.clipAction(deerGeometry.animations[ 0 ], mesh)
                        .setDuration(10)			// one second
                        .startAt(0)	// random phase (already running)
                        .play();
            }
        }
        jsonLoader.load("assets/models/deer.js", createDeer);
    }

    // utility random range
    function getRangeRandom(min, max) {
        return min + Math.random() * (max - min);
    }

    function addFallingSnow() {
        // however many groups of 100k snow flakes
        // atm only need 1
        let NUM_STORMS = 1;

        for (let i = 0; i < NUM_STORMS; i++) {
            let snowVertices = [];
            let snowGeometry = new THREE.BufferGeometry();

            for (let c = 0; c < SNOWFLAKES; c++) {
                let x = Math.random() * GROUND_SIZE;
                let y = Math.random() * SKY_HEIGHT / 2;
                let z = Math.random() * GROUND_SIZE;
                snowVertices.push(x, y, z);
            }

            snowGeometry.addAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
            // size of snowflake
            let size = getRangeRandom(15, 20);

            snowMaterials[ i ] = new THREE.PointsMaterial({size: size, map: snowFlakeImage, blending: THREE.AdditiveBlending, depthTest: false, transparent: true});
            // a brightness of 0.5 to 1 of white
            snowMaterials[ i ].color.setHSL(0, 0, Math.random() * 0.5 + 0.5);

            let particles = new THREE.Points(snowGeometry, snowMaterials[ i ]);

            particles.position.x = -GROUND_SIZE / 2;
            particles.position.z = -GROUND_SIZE / 2;

            particles.userData.speed = getRangeRandom(1, 2);

            snowStorms.push(particles);

            scene.add(particles);
        }
    }

    function init() {
        preloadTextures();
    }

    function addLights() {
        //  low evening light
        ambientLight = new THREE.AmbientLight(AMB_LIGHT_COLOR);
        scene.add(ambientLight);

        // simulated moonlight
        directionalLight = new THREE.DirectionalLight(DIR_LIGHT_COLOR, 1);
        directionalLight.position.copy(MOONLIGHT_POS);
        directionalLight.castShadow = true;

        // shadows
        directionalLight.shadow.camera.left = -5000;
        directionalLight.shadow.camera.bottom = -5000;
        directionalLight.shadow.camera.right = 5000;
        directionalLight.shadow.camera.top = 5000;
        directionalLight.shadow.mapSize.width = 2048;  // default
        directionalLight.shadow.mapSize.height = 2048; // default
        directionalLight.shadow.camera.near = 0.5;    // default
        directionalLight.shadow.camera.far = GROUND_SIZE * 2;     // default

        scene.add(directionalLight);
    }


    // Camera starts in the center of world and the position height is modified
    // later based on terrain height when the terrain at that point
    function setupCamera() {
        camera.position.setX(0);
        camera.position.setY(0);
        camera.position.setZ(0);
        // a better view
        camera.rotation.set(0, Math.PI / 2, 0);
    }

    function addSky() {
        // load and add the skybox
        let envMap = new THREE.CubeTextureLoader()
                .setPath('assets/skyboxes/forest/')
                .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);

        scene.background = envMap;
    }

    function addGround() {
        // GROUND TEXTURE
        const TEXTURE_REPEAT = 10;
        // texture already preloaded
        groundTextureMap.wrapS = THREE.RepeatWrapping;
        groundTextureMap.wrapT = THREE.RepeatWrapping;
        groundTextureMap.repeat.set(TEXTURE_REPEAT, TEXTURE_REPEAT);
        // set the material
        let terrain_material = new THREE.MeshStandardMaterial({
            color: 0xccccff,
            roughness: 1.0,
            map: groundTextureMap,
            bumpMap: groundTextureMap,
            bumpScale: 5,
            flatShading: false,
            fog: true
        });


        // Get ground pixel data for building ground model using an array containing
        // the "height" values of ALL of the image pixels
        let terrain = KCD_PixelData.getPixelData('heightmap_image', 'heightmap_canvas')

        // SAFE_CAM_HEIGHT is for saving the highest z vertex in the ground model with player
        // (camera) height to it so at load the camera is 100 units above the ground below it
        let SAFE_CAM_HEIGHT = 0;

        /*
         * PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
         * width — Width along the X axis. Default is 1.
         * height — Height along the Y axis. Default is 1.
         * widthSegments — Optional. Default is 1. 
         * heightSegments — Optional. Default is 1.
         * 
         * Our heightmap is a component of our structure and simply an array of data
         * more than an image: Keep in mind that the ground_mesh geometry always has +1 more vertices
         * than segments. If there's 100 x 100 segments means 101 x 101 vertices, etc,.
         * This means that the texture image should always be +1 width and height to
         * the segments and that number is sent back with the pixel data
         */
        let terrain_geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, terrain.segments, terrain.segments);

        // just a quick check but this should never happen since geometry segments are built based on the terrain.data
        if (terrain.data.length !== terrain_geometry.vertices.length) {
            console.error("Image pixel data and Geometry Vertices are NOT equal!");
            console.log("............length: " + terrain.data.length + ", vertices length: " + terrain_geometry.vertices.length);
        }

        for (let i = 0; i < terrain_geometry.vertices.length; i++)
        {
            // modify the terrain z height as needed
            terrain_geometry.vertices[i].z += terrain.data[i] * TERRAIN_HEIGHT_MOD;

            // get the highest point on the ground so we know wherever we set the
            // camera, it'll be above ground, yes, it's kind of lazy.
            // Why Z rather than Y, cause the ground loads, bu default, sideways
            if (terrain_geometry.vertices[i].z > SAFE_CAM_HEIGHT) {
                SAFE_CAM_HEIGHT = terrain_geometry.vertices[i].z + CAMERA_HEIGHT;
            }
        }

        // set camera to a safe height
        camera.position.setY(SAFE_CAM_HEIGHT);

        // so shadows and light know what to do
        terrain_geometry.computeFaceNormals();
        terrain_geometry.computeVertexNormals();

        // actually create and add the ground
        ground_mesh = new THREE.Mesh(terrain_geometry, terrain_material);
        ground_mesh.position.set(0, 0, 0);

        //now that the ground is ready, rotate it properly
        ground_mesh.geometry.rotateX(-Math.PI / 2);

        // yes, we will have shadows
        ground_mesh.receiveShadow = true;

        scene.add(ground_mesh);
    }

    function addSnowman() {
        let loader = new THREE.GLTFLoader().setPath('assets/models/');

        let grabSnowman = function (gltf) {
            gltf.scene.scale.y = gltf.scene.scale.x = gltf.scene.scale.z = 120;
            gltf.scene.position.setX(-658);
            gltf.scene.position.setY(192);
            gltf.scene.position.setZ(15);

            snowman = gltf.scene;
            snowman.userData.isWalking = false;

            snowman.userData.animator = new KCD_Animator(snowman, gltf.animations, 'Idle');

            scene.add(gltf.scene);
        };

        let snowmanLoadFail = function (e) {
            console.error(e);
        };

        loader.load('snowman1.glb', grabSnowman, undefined, snowmanLoadFail);
    }

    function upDateParticles() {
        for (let i = 0; i < snowStorms.length; i++) {
            var arr = snowStorms[i].geometry.attributes.position.array;
            for (let j = 0; j < arr.length; j += 3) {
                arr[j + 1] -= 3;
                if (arr[j + 1] < 0) {
                    arr[j + 1] += SKY_HEIGHT / 2;
                }
            }
            snowStorms[i].geometry.attributes.position.needsUpdate = true;
        }
    }

    function updateSnowman() {
        if (snowman) {
            // get the ground y, 1000 is fairly arbitrary
            var castFrom = new THREE.Vector3(snowman.position.x, snowman.position.y + 1000, snowman.position.z);
            raycaster.set(castFrom, DOWN_VECTOR);
            let intersects = raycaster.intersectObject(ground_mesh);
            if (intersects.length > 0) {
                // set the snowman at ground level
                snowman.position.setY(intersects[0].point.y);
            }

            // snowman always looks at the camera (player)
            snowman.lookAt(camera.position.x, camera.position.y - 100, camera.position.z);

            // should snowman be moving towards player
            if (snowman.position.distanceTo(camera.position) > 500) {
                var snowman_speed = 2;
                snowman.translateZ(snowman_speed);

                // if the snowman isn't walking animation atm, he should be
                if (!snowman.userData.isWalking) {
                    snowman.userData.animator.fadeToAction('Walk', 0.5);
                    snowman.userData.isWalking = true;
                }
            }
            else {
                // if the snowman is walking animation atm, he shouldn't be
                if (snowman.userData.isWalking) {
                    snowman.userData.animator.fadeToAction('Idle', 0.5);
                    snowman.userData.isWalking = false;
                }
            }
            var dt = clock_snowman.getDelta();

            if (snowman.userData.animator.mixer)
                snowman.userData.animator.mixer.update(dt);

        }
    }

    function render() {
        // simple gravity
        // use raycaster to keep camera on the ground
        // casts down to see how far the ground and keeps
        // camera at CAMERA_HEIGHT units above it
        raycaster.set(camera.position, DOWN_VECTOR);
        let intersects = raycaster.intersectObject(ground_mesh);

        // if camera is above the ground
        if (intersects.length > 0) {
            let camOffset = CAMERA_HEIGHT - intersects[0].distance;
            camera.position.setY(camera.position.y + camOffset);
        }

        if (SHOW_STATS) {
            stats.update();
        }

        upDateParticles();

        if (wolfAnimMixer)
            wolfAnimMixer.update(clock_wolf.getDelta());
        if (deerAnimMixer)
            deerAnimMixer.update(clock_deer.getDelta());

        controls.updateCameraMotion();

        updateSnowman();

        // touch controls
        if (m_controls.touch_present)
            m_controls.updateMobileCameraMotion();

        requestAnimationFrame(render);

        renderer.render(scene, camera);
    }

    init();
})();

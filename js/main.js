/*
 * 
 * updated to THREE revision 138 March, 2022
 * 
 */

function WintersEve(THREE, Stats, GLTFLoader) {
    'use strict';

    if (!THREE) {
        var THREE = {};
        console.error('THREE is not loaded for main.js');
    }

    // CONSTANTS
    // multiplier for the terrain height to exagerate or smooth
    const TERRAIN_HEIGHT_MOD = 2;
    // kinda standard human height
    const CAMERA_HEIGHT = 100;
    // raycaster direction
    const DOWN_VECTOR = new THREE.Vector3(0, -1, 0);
    // no trees if less than 10000
    const GROUND_SIZE = 10000;
    // for the falling snow top
    const SKY_HEIGHT = 3000;
    // moon things
    const MOON_SCALE = 1000;
    const MOON_POS = new THREE.Vector3(-GROUND_SIZE * 2, GROUND_SIZE * 2 / 2, 0);
    const MOONLIGHT_POS = new THREE.Vector3(-GROUND_SIZE, GROUND_SIZE / 2, 0);
    // The three stats box thing
    const SHOW_STATS = false;
    // light
    const AMB_LIGHT_COLOR = 0x222222;
    const DIR_LIGHT_COLOR = 0x455767;
    // how many
    const DEER_COUNT = 10;
    const SNOWFLAKES = 50000;
    const TREE_COUNT = 100;
    const TREE_SINK = 100;
    const TREE_SCALE = 20;

    // GLOBAL-ish
    let G_HIGHPOINT;

    // world stuff
    let scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, GROUND_SIZE * 5);
    let renderer;
    let raycaster = new THREE.Raycaster();
    let ground_mesh;
    // where the vertices are now stored as well
    let terrain_geometry;
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
    // doto: reanimate the wolf and deer gltf conversions or make new ones
    let wolfAnimMixer, deerAnimMixer;
    let clock_deer = new THREE.Clock();
    let clock_wolf = new THREE.Clock();
    let clock_snowman = new THREE.Clock();

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

    /*
     * this posts the 4 key loading bits
     * 1. texture loading starts
     * 2. texture loading ends
     * 3. trees built n added
     * 4. deer built n added
     * we just add 25 (percent) after each is done and
     * getting to 100 means we're done.  not doing any
     * heavy error checking or cool stuff like that,
     * just letting the user know that something's happening.
     */

    function updateLoadingPercent() {
        loading = document.getElementById("load_percent").innerHTML;
        loading = parseInt(loading) + 25;
        document.getElementById("load_percent").innerHTML = loading;
        if (loading >= 100) {
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
            updateLoadingPercent();
            loadScene();
        };
        textureManager.onProgress = function (item, loaded, total) {
            // this gets called after any item has been loaded
            // update loading notifications 2,3,4 & 5 for each image
            // do nothing atm
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
        if (GROUND_SIZE < 10000) {
            console.log('GROUND_SIZE is too small to add trees');
            return;
        }

        let TF = new TreeFactory(THREE);

        // get the list of ground vertices to plant a tree at random locations
        let vertices = terrain_geometry.userData.vertices;

        // lower trees a bit to simulate snow depth
        let snowDepth = TREE_SINK;

        // add however many trees
        for (let i = 0; i < TREE_COUNT; i++) {
            let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
            let tree = TF.simpleTree(treeTexture);
            tree.position.set(randomVertex.x, randomVertex.y - snowDepth, randomVertex.z);

            // don't plant tree on the camera
            if (camera.position.distanceTo(tree.position) < 1000) {
                i--;
                continue;
            }

            // don't plant tree on the wolf
            // wolf is at the highpoint
            if (G_HIGHPOINT.distanceTo(tree.position) < 500) {
                i--;
                continue;
            }

            tree.scale.y = tree.scale.x = tree.scale.z = TREE_SCALE;
            tree.receiveShadow = true;
            tree.castShadow = true;

            scene.add(tree);
        }
        updateLoadingPercent();
    }

    function addAnimals() {
        wolfAnimMixer = new THREE.AnimationMixer(scene);
        deerAnimMixer = new THREE.AnimationMixer(scene);

        let vertices = terrain_geometry.userData.vertices;
        G_HIGHPOINT = new THREE.Vector3(0, 0, 0);

        // the highest z is the hill top for the wolf
        for (let i = 0; i < vertices.length; i++) {
            if (vertices[i].y > G_HIGHPOINT.y) {
                G_HIGHPOINT.copy(vertices[i]);
            }
        }

        let loader = new GLTFLoader().setPath('assets/models/');

        let addTheWolf = function (gltf) {
            gltf.scene.scale.y = gltf.scene.scale.x = gltf.scene.scale.z = 15;
            gltf.scene.position.copy(G_HIGHPOINT);

            let wolfMaterial = gltf.scene.children[0].material;
            wolfMaterial.morphTargets = true;
            wolfMaterial.color.setHex(0x8b6e4f);
            wolfMaterial.map = firTexture;

            //update its matrix so the geometry shares the rotation
            let wolfMesh = gltf.scene.children[0];
            // wolf looks some random direction
            wolfMesh.geometry.rotateZ(THREE.Math.randFloat(-Math.PI, Math.PI));
            wolfMesh.castShadow = true;
            wolfMesh.updateMatrix();
            wolfMesh.geometry.computeVertexNormals();

            scene.add(gltf.scene);
        };

        let wolfLoadFail = function (e) {
            console.log("Wolf load failed:");
            console.error(e);
        };

        loader.load('wolf_sitting.glb', addTheWolf, undefined, wolfLoadFail);


        // add a few deer
        function createDeer(deerGLTF) {

            let deerMaterial = deerGLTF.scene.children[0].material;
            let deerMesh = deerGLTF.scene.children[0];

            deerMaterial.morphTargets = true;
            deerMaterial.color.setHex(0x774f25);

            // add however many deer
            for (let i = 0; i < DEER_COUNT; i++) {

                let scale = 10;

                deerMesh.scale.set(scale, scale, scale);

                let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];

                // 37.5 is cheating, I know what the height is, should be checked
                deerMesh.position.set(randomVertex.x, randomVertex.y + 37.5, randomVertex.z);
                //deerMesh.rotation.set(0, Math.random() * Math.PI, 0);
                deerMesh.castShadow = true;
                deerMesh.receiveShadow = true;
                //deerMesh.geometry.dynamic = true;
                deerMesh.geometry.computeVertexNormals();

                scene.add(deerGLTF.scene.clone());

                // need to put on my modeler/animator height and make some new deer
                // but no animal animations atm
//                deerAnimMixer.clipAction(deerGeometry.animations[ 0 ], mesh)
//                        .setDuration(10)			// one second
//                        .startAt(0)	// random phase (already running)
//                        .play();
            }
            updateLoadingPercent();
        }

        let deerLoadFail = function (e) {
            console.log("Deer load failed:");
            console.error(e);
        };

        loader.load("deer.glb", createDeer, undefined, deerLoadFail);
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

            snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowVertices, 3));
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

        // set the snow material
        let terrain_material = new THREE.MeshStandardMaterial({
            color: 0xccccff,
            roughness: 1.0,
            map: groundTextureMap,
            bumpMap: groundTextureMap,
            bumpScale: 5,
            flatShading: false,
            fog: true
        });

        // Over in utilities.js
        // Get ground pixel data for building ground model using an array containing
        // the "height" values of ALL of the image pixels.  The image is an actual
        // img tag in the html with display none.  This means it's already loaded and
        // we can use anything that works in an img tag
        let terrain = KCD_PixelData.getPixelData('heightmap_image', 'heightmap_canvas');

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
        terrain_geometry = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE, terrain.segments, terrain.segments);
        terrain_geometry.userData.vertices = [];

        // actually create and add the ground
        ground_mesh = new THREE.Mesh(terrain_geometry, terrain_material);
        ground_mesh.position.set(0, 0, 0);

        //rotate it so up is Y
        ground_mesh.geometry.rotateX(-Math.PI / 2);

        //update its matrix so the vertex positions reflect the rotation
        ground_mesh.updateMatrix();
        ground_mesh.geometry.applyMatrix4(ground_mesh.matrix);
        ground_mesh.matrix.identity();

        // yes, we will have shadows
        ground_mesh.receiveShadow = true;

        // here we apply the height information from the image to the PlaneGeometry.
        // So modifying the Y position of all vertices to show ground height according
        // to our map
        const positionAttribute = terrain_geometry.getAttribute('position');

        for (let i = 0; i < positionAttribute.count; i++) {
            // temp vertex holder
            const vertex = new THREE.Vector3();
            // extract the vertex information
            vertex.fromBufferAttribute(positionAttribute, i);
            // add the image data and whatever mod we decised on
            vertex.y += terrain.data[i] * TERRAIN_HEIGHT_MOD;
            // and set that position
            positionAttribute.setY(i, vertex.y);
            // get a height to insure the camera starts above ground so our
            // first ray caster down is sure to find something
            if (vertex.y > SAFE_CAM_HEIGHT) {
                SAFE_CAM_HEIGHT = vertex.y + CAMERA_HEIGHT;
            }

            // while we're here looping over the vertex data, get the vertex xyz
            // positions and store them for easy use later when positioning objects
            // on the ground
            terrain_geometry.userData.vertices.push(vertex);
        }


        // set camera to the safe height to start
        camera.position.setY(SAFE_CAM_HEIGHT);

        // and add it
        scene.add(ground_mesh);
    }

    function addSnowman() {
        let loader = new GLTFLoader().setPath('assets/models/');

        let grabSnowman = function (gltf) {
            gltf.scene.scale.y = gltf.scene.scale.x = gltf.scene.scale.z = 120;
            gltf.scene.position.setX(-658);
            gltf.scene.position.setY(192);
            gltf.scene.position.setZ(15);

            snowman = gltf.scene;
            
            // set up the animations
            snowman.userData.isWalking = false;
            snowman.userData.animator = new KCD_Animator(THREE, snowman, gltf.animations, 'Idle');
            
            // shadow makes it all real
            gltf.scene.traverse(function (node) {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });

            scene.add(gltf.scene);
        };

        let snowmanLoadFail = function (e) {
            console.error(e);
        };

        loader.load('snowman.glb', grabSnowman, undefined, snowmanLoadFail);
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

        // need to put on my modeler/animator height and make some new critters
        // but no animal animations atm
        /*
         if (wolfAnimMixer)
         wolfAnimMixer.update(clock_wolf.getDelta());
         if (deerAnimMixer)
         deerAnimMixer.update(clock_deer.getDelta());
         */

        controls.updateCameraMotion();

        updateSnowman();

        // touch controls
        if (m_controls.touch_present)
            m_controls.updateMobileCameraMotion();

        requestAnimationFrame(render);

        renderer.render(scene, camera);
    }

    init();
}

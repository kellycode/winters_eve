
function WintersEve(THREE) {
    "use strict";

    if (!THREE) {
        console.error("THREE is not loaded");
        alert("THREE is not loaded");
        return;
    }

    let SCENE = new THREE.Scene();

    let CONSTANTS = new SceneConstants(THREE);
    let SET_MANAGER = new SetManager(THREE, CONSTANTS, SCENE);
    let PROP_MANAGER = new PropManager(THREE, CONSTANTS, SCENE);
    let PRELOAD_MANAGER = new PreloadManager(THREE, CONSTANTS);
    let ACTOR_MANAGER = new ActorManager(THREE, CONSTANTS, SCENE);

    // initialized in SetManager addGround() and contains
    // the ground GEOMETRY, MESH, HIGHPOINT
    let GROUND_DATA = {};

    // three
    let CHASE_CAMERA = SET_MANAGER.initCamera(THREE);
    document.MOUSE_EVENTS = new MouseEvents(document, CHASE_CAMERA);
    let RENDERER = SET_MANAGER.initRenderer(CHASE_CAMERA);

    let PLAYER_KEY_CONTROLS;
    let PLAYER_MOBILE_CONTROLS;

    let M_LOADED = false;
    let T_LOADED = false;

    let STATS;
    let PLAYER_MIXER;

    // Props and Actors
    let WOLF_GLB, DEER_GLB, SNOWMAN_GLB, SNOOPY_GLB;
    let SNOW_GROUND, SNOWFLAKE, SNOW_BRANCH, FUR, MOON;
    
    let DEER = [];

    // models
    let M_PRELOADS = [
        //'wolf_sitting.glb',
        'test_wolf.glb',
        'new_deer.glb',
        'snowman_walk_idle.glb',
        'snoopy_walk_idle_left_right.glb'];

    // textures
    let T_PRELOADS = [
        "assets/snow_ground.jpg",
        "assets/snowflake.png",
        "assets/snowy_branch.png",
        "assets/fur.jpg",
        "assets/moon_sd.png"
    ]

    // ANIMATION ITEMS
    // other animation items unused atm
    // TODO: reanimate the wolf and deer gltf conversions or make new ones
    //let wolfAnimMixer, deerAnimMixer, playerAnimMixer;
    //let clock_deer = new THREE.Clock();
    //let clock_wolf = new THREE.Clock();

    let SNOWSTORMS = [];
    let SNOWMAN;
    let PLAYER;

    if (CONSTANTS.SHOW_STATS) {
        STATS = new Stats();
        document.body.appendChild(STATS.dom);
    }

    // listener for completion of
    // model and texture preload completions
    function setPreloadCompletions(result, type) {

        if (type === 'models') {
            [WOLF_GLB, DEER_GLB, SNOWMAN_GLB, SNOOPY_GLB] = result;
            updateLoadingProgress("models preloaded");
            M_LOADED = true;
        } else if (type === 'textures') {
            [SNOW_GROUND, SNOWFLAKE, SNOW_BRANCH, FUR, MOON] = result;
            updateLoadingProgress("textures preloaded");
            T_LOADED = true;
        }

        if (T_LOADED && M_LOADED) {
            loadScene();
        }
    }

    function fadeLoadingInfo() {
        let LOADING_INFO = document.getElementById("loading_info");

        LOADING_INFO.style.transition = '5.0s';
        LOADING_INFO.style.opacity = 0;

        setTimeout(function () {
            LOADING_INFO.style.display = "none";
        }, 5000);
    }

    let loadProgressCount = 0;

    function updateLoadingProgress(item) {
        let infoMethod = CONSTANTS.SHOW_LOADING_PROGRESS;
        let loadingInfoDiv = document.getElementById("loading_info");
        loadProgressCount++;

        switch (infoMethod) {
            case 'none':
                loadingInfoDiv.style.display = "none";
                return;
                break;
            case 'screen':
                let current = loadingInfoDiv.innerHTML;
                loadingInfoDiv.innerHTML
                      = current + '<span>' + loadProgressCount + '. ' + item + '</span>' + '<br>';
                break;
            case 'console':
                console.log(loadProgressCount + '. ' + item);
                break;
        }

        // render is last call
        if (item === 'render started') {
            fadeLoadingInfo();
        }

    }

    function loadScene() {
        // scene basics
        SET_MANAGER.initLights(SCENE);
        updateLoadingProgress("lights in");
        
        SET_MANAGER.initSky(SCENE);
        updateLoadingProgress("sky in");
        
        SET_MANAGER.addGround(SNOW_GROUND, CONSTANTS, GROUND_DATA);
        updateLoadingProgress("ground in");

        PLAYER = ACTOR_MANAGER.addPlayer(SNOOPY_GLB, PLAYER_MIXER);
        updateLoadingProgress("player in");

        // CONTROLLERS
        // standard keyboard controls always loaded
        PLAYER_KEY_CONTROLS = new PlayerKeyControls(PLAYER, CONSTANTS, document);
        // if it's a touch environ add those controls
        if (TOUCH_ENVIRON) {
            PLAYER_MOBILE_CONTROLS = new PlayerTouchControls(PLAYER, CONSTANTS, document);
        }
        updateLoadingProgress("controls in");

        SNOWMAN = ACTOR_MANAGER.addSnowman(SNOWMAN_GLB);
        updateLoadingProgress("snowman in");

        // wolf requires the ground high point so
        // must be loaded after the ground
        PROP_MANAGER.addTheWolf(WOLF_GLB, GROUND_DATA);
        updateLoadingProgress("wolf in");

        PROP_MANAGER.addTheDeer(DEER_GLB, GROUND_DATA, DEER)
        updateLoadingProgress("deer in");

        PROP_MANAGER.addFallingSnow(SNOWFLAKE, SNOWSTORMS);
        updateLoadingProgress("snowfall in");

        PROP_MANAGER.addMoon(MOON);
        updateLoadingProgress("moon in");

        // trees loaded after ground and player
        PROP_MANAGER.addTrees(GROUND_DATA, CHASE_CAMERA, SNOW_BRANCH);
        updateLoadingProgress("trees in");

        updateLoadingProgress("render started");
        render();
    }

    window.addEventListener(
          "resize",
          function () {
              CHASE_CAMERA.aspect = window.innerWidth / window.innerHeight;
              CHASE_CAMERA.updateProjectionMatrix();
              RENDERER.setSize(window.innerWidth, window.innerHeight);
          },
          false
          );

    function init() {
        PRELOAD_MANAGER.preloadTextures(T_PRELOADS, setPreloadCompletions);
        PRELOAD_MANAGER.preloadModels(M_PRELOADS, setPreloadCompletions);
    }

    function render() {
        // simple gravity
        // use raycaster to keep camera on the ground
        // casts down to see how far the ground and keeps
        // camera at PLAYER_HEIGHT units above it
        if (PLAYER && SNOWMAN) {
            ACTOR_MANAGER.setPlayerOnGround(GROUND_DATA);
            ACTOR_MANAGER.updateChaseCamera(CHASE_CAMERA);
            ACTOR_MANAGER.updateSnowman(PLAYER, GROUND_DATA);
            PLAYER_KEY_CONTROLS.updatePlayerPosition();
            ACTOR_MANAGER.animatePlayerMotion(PLAYER_KEY_CONTROLS);
            // touch
            if (PLAYER_MOBILE_CONTROLS)
                PLAYER_MOBILE_CONTROLS.updateMobileCameraMotion();
        }

        if (STATS) {
            STATS.update();
        }

        PROP_MANAGER.updateSnowfall(SNOWSTORMS);

        // need to put on my modeler/animator height and make some new critters
        // but no animal animations atm
        /*
         if (wolfAnimMixer)
         wolfAnimMixer.update(clock_wolf.getDelta());
         if (deerAnimMixer)
         deerAnimMixer.update(clock_deer.getDelta());
         */

        requestAnimationFrame(render);

        RENDERER.render(SCENE, CHASE_CAMERA);
    }

    init();
}

class PropManager
{
    constructor(THREE, CONSTANTS, SCENE) {
        this.THREE = THREE;
        this.CONSTANTS = CONSTANTS;
        this.scene = SCENE;
        this.WOLF = {};
    }

    getGroundHighpoint = function () {

    }

    addTheWolf = function (WOLF_GLB, GROUND_DATA) {
        this.WOLF = WOLF_GLB;
        this.WOLF.scene.scale.y = this.WOLF.scene.scale.x = this.WOLF.scene.scale.z = 0.5;
        this.WOLF.scene.position.copy(GROUND_DATA.HIGHPOINT);

        // wolf looks some random direction
        this.WOLF.scene.rotateY(this.THREE.MathUtils.randFloat(-Math.PI, Math.PI));

        //this.WOLF.scene.castShadow = true;

        // no idea why
        this.WOLF.scene.updateMatrix();
        //this.WOLF.scene.children[0].children[1].material.flatShading = false;

        // for a bit smoother appearance
        // https://discourse.threejs.org/t/how-to-get-smooth-mesh-of-the-obj/41546
//        let childGeometry = this.WOLF.scene.children[0].children[1].geometry;
//        childGeometry.deleteAttribute('normal');
//        childGeometry = THREE.BufferGeometryUtils.mergeVertices(childGeometry);
//        childGeometry.computeVertexNormals();

        this.WOLF.scene.animations = this.WOLF.animations;

        this.WOLF.actions = {};

        WOLF_GLB.animations.forEach((clip) => {
            this.WOLF.actions[clip.name] = clip;
        });

        this.WOLF.userData.animator = new Animator(
              THREE,
              this.WOLF.scene,
              this.WOLF.animations,
              "Survey"
              );

        this.WOLF.userData.animator.mixer.timeScale = 0.2;

        this.WOLF.userData.clock = new THREE.Clock();

        // enable shadow
        this.WOLF.scene.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });

        this.scene.add(this.WOLF.scene);
    }

    updateWolf = function () {
        let delta = this.WOLF.userData.clock.getDelta();

        if (this.WOLF.userData.animator.mixer) {
            this.WOLF.userData.animator.mixer.update(delta);
        }
    }

    addTheDeer = function (DEER_GLB, LARGE_DEER, GROUND_DATA, DEER) {
        // unused atm for future ref
        // let deerAnimMixer = new this.THREE.AnimationMixer(this.scene);

        let vertices = GROUND_DATA.GEOMETRY.userData.vertices;
        let deerMesh;

        // add however many deer
        for (let i = 0; i < this.CONSTANTS.DEER_COUNT; i++) {
            let scale;

            if(i % 5 === 0) {
                deerMesh = LARGE_DEER.scene.children[0];
                deerMesh.children[0].material.metalness = 0;
                scale = 5;
            } else {
                deerMesh = DEER_GLB.scene.children[0];
                scale = 1;
            }
            
            deerMesh = deerMesh.clone();

            deerMesh.scale.set(scale, scale, scale);

            let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];

            deerMesh.position.set(randomVertex.x, randomVertex.y, randomVertex.z);

            deerMesh.castShadow = true;
            deerMesh.receiveShadow = true;

            let r = Math.random() * Math.PI * 2;
            deerMesh.rotateY(r);

            this.scene.add(deerMesh);

            // need to put on my modeler/animator height and make some new deer
            // but no animal animations atm
            // deerAnimMixer.clipAction(deerGeometry.animations[ 0 ], mesh)
            // .setDuration(10)	// one second
            // .startAt(0) // random phase (already running)
            // .play();
        }
    }

    addMoon(MOON) {
        let spriteMap = MOON;
        let spriteMaterial = new this.THREE.SpriteMaterial({
            map: spriteMap,
            color: 0xffffff
        });
        let moonSprite = new this.THREE.Sprite(spriteMaterial);
        moonSprite.position.copy(this.CONSTANTS.MOON_POS);
        moonSprite.scale.set(this.CONSTANTS.MOON_SCALE, this.CONSTANTS.MOON_SCALE, 1);
        this.scene.add(moonSprite);
    }

    getRangeRandom(min, max) {
        return min + Math.random() * (max - min);
    }

    // atm the snow is over the whole scene all the time so the camera can walk
    // into falling snow and looks like snow motion should look.  Seems like
    // there should be a way to make it more efficient
    addFallingSnow(SNOWFLAKE, SNOWSTORMS) {
        // multiplier of CONSTANTS.SNOWFLAKES
        let numberOfStorms = 1;
        let snowMaterials = [];

        for (let i = 0; i < numberOfStorms; i++) {
            let snowVertices = [];
            let snowGeometry = new this.THREE.BufferGeometry();

            for (let c = 0; c < this.CONSTANTS.SNOWFLAKES; c++) {
                let x = Math.random() * this.CONSTANTS.GROUND_SIZE;
                let y = (Math.random() * this.CONSTANTS.SKY_HEIGHT) / 2;
                let z = Math.random() * this.CONSTANTS.GROUND_SIZE;
                snowVertices.push(x, y, z);
            }

            snowGeometry.setAttribute("position", new this.THREE.Float32BufferAttribute(snowVertices, 3));

            // size of snowflake
            let size = this.getRangeRandom(15, 20);

            snowMaterials[i] = new this.THREE.PointsMaterial({
                size: size,
                map: SNOWFLAKE,
                blending: this.THREE.AdditiveBlending,
                depthTest: false,
                transparent: true
            });

            // hue, saturation, lightness
            // white color with a lightness of 0.5 to 1 of white
            snowMaterials[i].color.setHSL(0, 0, Math.random() * 0.5 + 0.5);

            let particles = new this.THREE.Points(snowGeometry, snowMaterials[i]);

            particles.position.x = particles.position.z = -this.CONSTANTS.GROUND_SIZE / 2;

            particles.userData.speed = this.getRangeRandom(1, 2);

            SNOWSTORMS.push(particles);

            this.scene.add(particles);
        }
    }

    updateSnowfall(SNOWSTORMS) {
        for (let i = 0; i < SNOWSTORMS.length; i++) {
            var arr = SNOWSTORMS[i].geometry.attributes.position.array;
            for (let j = 0; j < arr.length; j += 3) {
                arr[j + 1] -= 3;
                if (arr[j + 1] < 0) {
                    arr[j + 1] += this.CONSTANTS.SKY_HEIGHT / 2;
                }
            }
            SNOWSTORMS[i].geometry.attributes.position.needsUpdate = true;
        }
    }

    addTrees(GROUND_DATA, CHASE_CAMERA, SNOW_BRANCH) {
        if (this.CONSTANTS.GROUND_SIZE < 10000) {
            console.log("GROUND_SIZE is too small to add trees");
            return;
        }

        let treeFactory = new TreeFactory(THREE);

        // get the list of ground vertices to plant a tree at random locations
        let vertices = GROUND_DATA.GEOMETRY.userData.vertices;

        // lower trees a bit to simulate snow depth
        let snowDepth = this.CONSTANTS.TREE_SINK;

        // add however many trees
        for (let i = 0; i < this.CONSTANTS.TREE_COUNT; i++) {
            let randomVertex = vertices[Math.floor(Math.random() * vertices.length)];
            let tree = treeFactory.simpleTree(SNOW_BRANCH);
            tree.position.set(randomVertex.x, randomVertex.y - snowDepth, randomVertex.z);

            // don't plant tree on the CAMERA
            if (CHASE_CAMERA.position.distanceTo(tree.position) < 1000) {
                i--;
                continue;
            }

            // don't plant tree on the wolf
            // wolf is at the highpoint
            if (GROUND_DATA.HIGHPOINT.distanceTo(tree.position) < 500) {
                i--;
                continue;
            }

            tree.scale.y = tree.scale.x = tree.scale.z = this.CONSTANTS.TREE_SCALE;
            tree.receiveShadow = true;
            tree.castShadow = true;

            this.scene.add(tree);
        }
    }
}

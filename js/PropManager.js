class PropManager
{
    constructor(THREE, CONSTANTS, SCENE) {
        this.THREE = THREE;
        this.CONSTANTS = CONSTANTS;
        this.scene = SCENE;
    }

    getGroundHighpoint = function () {

    }

    addTheWolf = function (WOLF_GLB, FUR, GROUND_DATA) {
        let wolf = WOLF_GLB.scene
        wolf.scale.y = wolf.scale.x = wolf.scale.z = 15;
        wolf.position.copy(GROUND_DATA.HIGHPOINT);

        let wolfMaterial = wolf.children[0].material;
        wolfMaterial.morphTargets = true;
        wolfMaterial.color.setHex(0x8b6e4f);
        wolfMaterial.map = FUR;

        //update its matrix so the geometry shares the rotation
        let wolfMesh = wolf.children[0];
        // wolf looks some random direction
        wolfMesh.geometry.rotateZ(this.THREE.MathUtils.randFloat(-Math.PI, Math.PI));

        wolfMesh.castShadow = true;
        wolfMesh.updateMatrix();
        wolfMesh.geometry.computeVertexNormals();

        this.scene.add(wolf);
    }

    addTheDeer = function (DEER_GLB, GROUND_DATA) {
        // unused atm for future ref
        // let deerAnimMixer = new this.THREE.AnimationMixer(this.scene);

        let vertices = GROUND_DATA.GEOMETRY.userData.vertices;
        let deerMaterial = DEER_GLB.scene.children[0].material;
        let deerMesh = DEER_GLB.scene.children[0];

        deerMaterial.morphTargets = true;
        deerMaterial.color.setHex(0x774f25);

        // add however many deer
        for (let i = 0; i < this.CONSTANTS.DEER_COUNT; i++) {
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

            this.scene.add(DEER_GLB.scene.clone());

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

    
    addTrees(GROUND_DATA, CAMERA, SNOW_BRANCH) {
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
            if (CAMERA.position.distanceTo(tree.position) < 1000) {
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

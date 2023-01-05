class ActorManager {

    constructor(THREE, CONSTANTS, SCENE) {
        this.THREE = THREE;
        this.CONSTANTS = CONSTANTS;
        this.scene = SCENE;
        this.SNOWMAN;
        this.PLAYER;
    }

    addPlayer(SNOOPY_GLB, PLAYER_MIXER) {

        this.PLAYER = SNOOPY_GLB.scene;

        // scale
        this.PLAYER.scale.y = this.PLAYER.scale.x = this.PLAYER.scale.z = 120;

        this.PLAYER.position.setX(0);
        this.PLAYER.position.setY(0);
        this.PLAYER.position.setZ(0);

        // SNOOPY ANIMATION ITEM
        PLAYER_MIXER = new this.THREE.AnimationMixer(this.PLAYER);

        this.PLAYER.actions = {};

        // making a list
        SNOOPY_GLB.animations.forEach((clip) => {
            this.PLAYER.actions[clip.name] = clip;
        });

        // for keeping track
        this.PLAYER.userData.isWalking = false;
        this.PLAYER.userData.isLefting = false;
        this.PLAYER.userData.isRighting = false;
        
        this.PLAYER.userData.animator = new Animator(
              THREE,
              this.PLAYER,
              SNOOPY_GLB.animations,
              "idle"
              );
        this.PLAYER.userData.animator.mixer.timeScale = 2.0;

        // enable shadow
        this.PLAYER.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });

        this.PLAYER.userData.raycaster = new this.THREE.Raycaster();

        this.PLAYER.userData.clock = new THREE.Clock();

        this.scene.add(this.PLAYER);

        return this.PLAYER;
    }

    animatePlayerMotion(PLAYER_KEY_CONTROLS) {
        // check for keypress requests
        // forward and backward use the same animation
        let forward = PLAYER_KEY_CONTROLS.player_action.moveForward;
        let backward = PLAYER_KEY_CONTROLS.player_action.moveBack;
        // strafeLeft and turnLeft: same animation
        let left = PLAYER_KEY_CONTROLS.player_action.strafeLeft;
        let turnLeft = PLAYER_KEY_CONTROLS.player_action.turnLeft;
        // strafeRight and turnRight: same animation
        let right = PLAYER_KEY_CONTROLS.player_action.strafeRight;
        let turnRight = PLAYER_KEY_CONTROLS.player_action.turnRight;

        // for prioritizing
        let walkRequested = forward || backward;
        let leftRequested = left || turnLeft;
        let rightRequested = right || turnRight;

        // doing now
        let isWalking = this.PLAYER.userData.isWalking;
        let isLefting = this.PLAYER.userData.isLefting;
        let isRighting = this.PLAYER.userData.isRighting;
        
        // insure only one at a time
        if (!isLefting && !isRighting) {
            if (walkRequested && !isWalking) {
                this.PLAYER.userData.animator.fadeToAction("walk", 0.5);
                this.PLAYER.userData.isWalking = true;
                return;
            } else if (!walkRequested && isWalking) {
                this.PLAYER.userData.animator.fadeToAction("idle", 0.5);
                this.PLAYER.userData.isWalking = false;
            }
        }

        if (!isWalking && !isRighting) {
            if (leftRequested && !isLefting) {
                this.PLAYER.userData.animator.fadeToAction("strafe_left", 0.5);
                this.PLAYER.userData.isLefting = true;
            } else if (!leftRequested && isLefting) {
                this.PLAYER.userData.animator.fadeToAction("idle", 0.5);
                this.PLAYER.userData.isLefting = false;
            }
        }

        if (!isWalking && !isLefting) {
            if (rightRequested && !isRighting) {
                this.PLAYER.userData.animator.fadeToAction("strafe_right", 0.5);
                this.PLAYER.userData.isRighting = true;
            } else if (!rightRequested && isRighting) {
                this.PLAYER.userData.animator.fadeToAction("idle", 0.5);
                this.PLAYER.userData.isRighting = false;
            }
        }

        let delta = this.PLAYER.userData.clock.getDelta();

        if (this.PLAYER.userData.animator.mixer) {
            this.PLAYER.userData.animator.mixer.update(delta);
        }
    }

    setPlayerChaseCameraPos(CAMERA) {
        let rotZ = Math.cos(this.PLAYER.rotation.y);
        let rotX = Math.sin(this.PLAYER.rotation.y);
        // behind player
        let distance = -200;
        CAMERA.position.x = this.PLAYER.position.x - distance * rotX;
        // above player position
        CAMERA.position.y = this.PLAYER.position.y + 100;
        CAMERA.position.z = this.PLAYER.position.z - distance * rotZ;

        CAMERA.lookAt(this.PLAYER.position.x, this.PLAYER.position.y, this.PLAYER.position.z);
    }

    setPlayerOnGround(GROUND_DATA) {
        let castFrom = new this.THREE.Vector3(this.PLAYER.position.x, this.PLAYER.position.y + 1000, this.PLAYER.position.z);

        this.PLAYER.userData.raycaster.set(castFrom, this.CONSTANTS.DOWN_VECTOR);
        let intersects = this.PLAYER.userData.raycaster.intersectObject(GROUND_DATA.MESH);

        // if camera is above the ground
        if (intersects.length > 0) {
            let camOffset = this.CONSTANTS.PLAYER_HEIGHT - intersects[0].distance;
            this.PLAYER.position.setY(this.PLAYER.position.y + camOffset);
        }
    }

    addSnowman(SNOWMAN_GLB) {
        this.SNOWMAN = SNOWMAN_GLB.scene;
        this.SNOWMAN.userData.clock = new this.THREE.Clock();

        this.SNOWMAN.scale.y = this.SNOWMAN.scale.x = this.SNOWMAN.scale.z = 120;
        this.SNOWMAN.position.setX(-658);
        this.SNOWMAN.position.setY(192);
        this.SNOWMAN.position.setZ(15);

        // set up the animations
        this.SNOWMAN.userData.isWalking = false;
        this.SNOWMAN.userData.animator = new Animator(this.THREE, this.SNOWMAN, SNOWMAN_GLB.animations, "Idle");

        this.SNOWMAN.userData.raycaster = new this.THREE.Raycaster();

        // shadow makes it all real
        this.SNOWMAN.traverse(function (node) {
            if (node.isMesh) {
                node.castShadow = true;
            }
        });

        this.scene.add(this.SNOWMAN);

        return this.SNOWMAN;
    }

    updateSnowman(PLAYER, GROUND_DATA) {

        // get the ground y, 1000 is fairly arbitrary
        var castFrom = new this.THREE.Vector3(this.SNOWMAN.position.x, this.SNOWMAN.position.y + 1000, this.SNOWMAN.position.z);
        this.SNOWMAN.userData.raycaster.set(castFrom, this.CONSTANTS.DOWN_VECTOR);
        let intersects = this.SNOWMAN.userData.raycaster.intersectObject(GROUND_DATA.MESH);

        if (intersects.length > 0) {
            // set the snowman at ground level
            this.SNOWMAN.position.setY(intersects[0].point.y);
        }

        // snowman always looks at the player
        this.SNOWMAN.lookAt(PLAYER.position);

        // should snowman be moving towards player
        if (this.SNOWMAN.position.distanceTo(PLAYER.position) > 500) {
            var snowman_speed = 2;
            this.SNOWMAN.translateZ(snowman_speed);

            // if the snowman isn't walking animation atm, he should be
            if (!this.SNOWMAN.userData.isWalking) {
                this.SNOWMAN.userData.animator.fadeToAction("Walk", 0.5);
                this.SNOWMAN.userData.isWalking = true;
            }
        } else {
            // if the snowman is walking animation atm, he shouldn't be
            if (this.SNOWMAN.userData.isWalking) {
                this.SNOWMAN.userData.animator.fadeToAction("Idle", 0.5);
                this.SNOWMAN.userData.isWalking = false;
            }
        }

        let clock_delta = this.SNOWMAN.userData.clock.getDelta();

        if (this.SNOWMAN.userData.animator.mixer)
            this.SNOWMAN.userData.animator.mixer.update(clock_delta);

    }
}

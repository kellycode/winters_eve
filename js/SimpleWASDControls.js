

SimpleWASDControls = function (camera, domElement) {
    var scope = this;

    this.domElement = (domElement !== undefined) ? domElement : document;

    this.player_action = {
        walking: false
    };

    this.camera_action = {
        moveUp: false,
        moveDown: false,
        moveForward: false,
        moveBackward: false,
        turnLeft: false,
        turnRight: false,
        strafeLeft: false,
        strafeRight: false
    };

    this.USER_MOVE_SPEED = 10;
    this.USER_TURN_SPEED = 0.05;
    this.PLAYER_HEIGHT = 100;

    this.isPlayerActionChanged = function () {
        // if we're not walking but we're supposed to be
        if (!this.player_action.walking && (this.camera_action.moveForward || this.camera_action.moveBackward)) {
            this.player_action.walking = true;
            return 'Walk';
        }
        // if we're walking but not supposed to be
        else if (this.player_action.walking && (!this.camera_action.moveForward && !this.camera_action.moveBackward)) {
            this.player_action.walking = false;
            return 'Idle';
        }
        else {
            return false;
        }
    };

    this.onKeyDown = function (event) {
        switch (event.keyCode) {
            case 87: /*W*/
            case 38: /*up arrow*/
                scope.camera_action.moveForward = true;
                break;
            case 68: /*D*/
            case 39: /*right arrow*/
                scope.camera_action.turnRight = true;
                break;
            case 65: /*A*/
            case 37: /*left arrow*/
                scope.camera_action.turnLeft = true;
                break;
            case 83: /*S*/
            case 40: /*down arrow*/
                scope.camera_action.moveBackward = true;
                break;
            case 109: /*numpad -*/
                scope.camera_action.moveDown = true;
                break;
            case 107: /*numpad +*/
                scope.camera_action.moveUp = true;
                break;
            case 81: /*Q*/
                scope.camera_action.strafeLeft = true;
                break;
            case 69: /*E*/
                scope.camera_action.strafeRight = true;
                break;
        }
    };

    this.onKeyUp = function (event) {
        switch (event.keyCode) {
            case 87: /*W*/
            case 38: /*up arrow*/
                scope.camera_action.moveForward = false;
                break;
            case 68: /*D*/
            case 39: /*right arrow*/
                scope.camera_action.turnRight = false;
                break;
            case 65: /*A*/
            case 37: /*left arrow*/
                scope.camera_action.turnLeft = false;
                break;
            case 83: /*S*/
            case 40: /*down arrow*/
                scope.camera_action.moveBackward = false;
                break;
            case 109: /*numpad -*/
                scope.camera_action.moveDown = false;
                break;
            case 107: /*numpad +*/
                scope.camera_action.moveUp = false;
                break;
            case 81: /*Q*/
                scope.camera_action.strafeLeft = false;
                break;
            case 69: /*E*/
                scope.camera_action.strafeRight = false;
                break;
        }
    };

    this.updateCameraMotion = function (camera) {
        if (scope.camera_action.moveUp) {
            camera.position.y += this.USER_MOVE_SPEED;
        }
        if (scope.camera_action.moveDown) {
            camera.position.y -= this.USER_MOVE_SPEED;
        }
        if (scope.camera_action.moveForward) {
            camera.position.z -= Math.cos(camera.rotation.y) * this.USER_MOVE_SPEED;
            camera.position.x -= Math.sin(camera.rotation.y) * this.USER_MOVE_SPEED;
        }
        if (scope.camera_action.moveBackward) {
            camera.position.z += Math.cos(camera.rotation.y) * this.USER_MOVE_SPEED;
            camera.position.x += Math.sin(camera.rotation.y) * this.USER_MOVE_SPEED;
        }
        if (scope.camera_action.turnLeft) {
            camera.rotation.y += this.USER_TURN_SPEED;
        }
        if (scope.camera_action.turnRight) {
            camera.rotation.y -= this.USER_TURN_SPEED;
        }
        if (scope.camera_action.strafeLeft) {
            camera.position.z += Math.cos(camera.rotation.y - Math.PI / 2) * this.USER_MOVE_SPEED;
            camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * this.USER_MOVE_SPEED;
        }
        if (scope.camera_action.strafeRight) {
            camera.position.z -= Math.cos(camera.rotation.y - Math.PI / 2) * this.USER_MOVE_SPEED;
            camera.position.x -= Math.sin(camera.rotation.y - Math.PI / 2) * this.USER_MOVE_SPEED;
        }
    };

    this.domElement.addEventListener('keydown', this.onKeyDown, false);
    this.domElement.addEventListener('keyup', this.onKeyUp, false);
};



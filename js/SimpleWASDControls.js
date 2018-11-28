

SimpleWASDControls = function (camera, domElement) {
    var scope = this;
    
    this.domElement = (domElement !== undefined) ? domElement : document;

    this.camera_action = {
        moveUp: false,
        moveDown: false,
        moveForward: false,
        moveBack: false,
        turnLeft: false,
        turnRight: false,
        strafeLeft: false,
        strafeRight: false
    };

    this.USER_MOVE_SPEED = 20;
    this.USER_TURN_SPEED = 0.05;
    this.PLAYER_HEIGHT = 100;

    this.onKeyDown = function (event) {
        switch (event.keyCode) {
            case 87: /*W*/
                scope.camera_action.moveForward = true;
                break;
            case 68: /*D*/
                scope.camera_action.turnRight = true;
                break;
            case 65: /*A*/
                scope.camera_action.turnLeft = true;
                break;
            case 83: /*S*/
                scope.camera_action.moveBack = true;
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
                scope.camera_action.moveForward = false;
                break;
            case 68: /*D*/
                scope.camera_action.turnRight = false;
                break;
            case 65: /*A*/
                scope.camera_action.turnLeft = false;
                break;
            case 83: /*S*/
                scope.camera_action.moveBack = false;
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

    this.updateCameraMotion = function () {
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
        if (scope.camera_action.moveBack) {
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



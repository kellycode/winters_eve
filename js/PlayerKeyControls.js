PlayerKeyControls = function (player, CONSTANTS, domElement) {
    var scope = this;

    this.domElement = domElement !== undefined ? domElement : document;

    this.player_action = {
        moveUp: false,
        moveDown: false,
        moveForward: false,
        moveBack: false,
        turnLeft: false,
        turnRight: false,
        strafeLeft: false,
        strafeRight: false,
        fast: false
    };

    this.onKeyDown = function (event) {
        
        if(event.shiftKey) {
            scope.player_action.fast = true;
        }
        
        switch (event.keyCode) {
            case 87: /*W*/
            case 38 /*up arrow*/:
                scope.player_action.moveForward = true;
                break;
            case 68: /*D*/
            case 39 /*right arrow*/:
                scope.player_action.turnRight = true;
                break;
            case 65: /*A*/
            case 37 /*left arrow*/:
                scope.player_action.turnLeft = true;
                break;
            case 83: /*S*/
            case 40 /*down arrow*/:
                scope.player_action.moveBack = true;
                break;
            case 109 /*numpad -*/:
                scope.player_action.moveDown = true;
                break;
            case 107 /*numpad +*/:
                scope.player_action.moveUp = true;
                break;
            case 81 /*Q*/:
                scope.player_action.strafeLeft = true;
                break;
            case 69 /*E*/:
                scope.player_action.strafeRight = true;
                break;
        }
    };

    this.onKeyUp = function (event) {
        
        if(!event.shiftKey) {
            scope.player_action.fast = false;
        }
        
        switch (event.keyCode) {
            case 87: /*W*/
            case 38 /*up arrow*/:
                scope.player_action.moveForward = false;
                break;
            case 68: /*D*/
            case 39 /*right arrow*/:
                scope.player_action.turnRight = false;
                break;
            case 65: /*A*/
            case 37 /*left arrow*/:
                scope.player_action.turnLeft = false;
                break;
            case 83: /*S*/
            case 40 /*down arrow*/:
                scope.player_action.moveBack = false;
                break;
            case 109 /*numpad -*/:
                scope.player_action.moveDown = false;
                break;
            case 107 /*numpad +*/:
                scope.player_action.moveUp = false;
                break;
            case 81 /*Q*/:
                scope.player_action.strafeLeft = false;
                break;
            case 69 /*E*/:
                scope.player_action.strafeRight = false;
                break;
        }
    };

    this.updatePlayerPosition = function () {
        
        let playerMoveSpeed = CONSTANTS.PLAYER_MOVE_SPEED;
        
        if(scope.player_action.fast) {
            playerMoveSpeed *= 3;
        }
        
        if (scope.player_action.moveUp) {
            player.position.y += playerMoveSpeed;
        }
        if (scope.player_action.moveDown) {
            player.position.y -= playerMoveSpeed;
        }
        if (scope.player_action.moveForward) {
            player.position.z -= Math.cos(player.rotation.y) * playerMoveSpeed;
            player.position.x -= Math.sin(player.rotation.y) * playerMoveSpeed;
        }
        if (scope.player_action.moveBack) {
            player.position.z += Math.cos(player.rotation.y) * playerMoveSpeed;
            player.position.x += Math.sin(player.rotation.y) * playerMoveSpeed;
        }
        if (scope.player_action.turnLeft) {
            player.rotation.y += CONSTANTS.PLAYER_TURN_SPEED;
        }
        if (scope.player_action.turnRight) {
            player.rotation.y -= CONSTANTS.PLAYER_TURN_SPEED;
        }
        if (scope.player_action.strafeLeft) {
            player.position.z += Math.cos(player.rotation.y - Math.PI / 2) * playerMoveSpeed;
            player.position.x += Math.sin(player.rotation.y - Math.PI / 2) * playerMoveSpeed;
        }
        if (scope.player_action.strafeRight) {
            player.position.z -= Math.cos(player.rotation.y - Math.PI / 2) * playerMoveSpeed;
            player.position.x -= Math.sin(player.rotation.y - Math.PI / 2) * playerMoveSpeed;
        }
    };

    this.domElement.addEventListener("keydown", this.onKeyDown, false);
    this.domElement.addEventListener("keyup", this.onKeyUp, false);
};

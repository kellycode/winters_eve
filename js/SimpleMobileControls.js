SimpleMobileControls = function (camera, domElement) {
    let scope = this;
    scope.left;
    scope.right;

    this.touch_present = true;

    // make sure we have touch
    try {
        domElement.createEvent("TouchEvent");
        this.touch_present = true;
    } catch (e) {
        this.touch_present = false;
        return;
    }

    this.domElement = (domElement !== undefined) ? domElement : document;

    // add the needed styles
    let css =
            `
            .m_control {
                position: fixed;
                text-decoration:none;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;   
                z-index: 2;
                border-radius: 16px;
                border-style: outset;
                border-color: #333333;
                background-color: transparent;;
                font-weight: bold;
                }
            .m_control img {
                height: 72px;
                width: 72px;
                }
            #rt_control {
                bottom: 20px;
                right: 20px;
                }
            #lf_control {
                bottom: 20px;
                left: 20px;
                }
            #lf_control img {
                -webkit-transform: scaleX(-1);
                transform: scaleX(-1);
                }
            `;


    var style = domElement.createElement('style');
    domElement.head.appendChild(style);
    style.innerHTML = css;

    this.mouse_action = {
        leftDown: false,
        rightDown: false
    };

    this.camera_action = {
        moveForward: false,
        moveBack: false,
        turnLeft: false,
        turnRight: false
    };

    this.USER_MOVE_SPEED = 20;
    this.USER_TURN_SPEED = 0.05;
    this.PLAYER_HEIGHT = 100;

    this.onLeftMouseDown = function () {
        console.log('lmd');
        scope.mouse_action.leftDown = true;
    };

    this.onLeftMouseUp = function () {
        console.log('lmu');
        scope.mouse_action.leftDown = false;
    };

    this.onRightMouseDown = function () {
        console.log('rmd');
        scope.mouse_action.rightDown = true;
    };

    this.onRightMouseUp = function () {
        console.log('rmu');
        scope.mouse_action.rightDown = false;
    };

    this.updateMobileCameraMotion = function () {

        if (scope.mouse_action.leftDown && scope.mouse_action.rightDown) {
            camera.position.z -= Math.cos(camera.rotation.y) * this.USER_MOVE_SPEED;
            camera.position.x -= Math.sin(camera.rotation.y) * this.USER_MOVE_SPEED;
        } else if (scope.mouse_action.leftDown && !scope.mouse_action.rightDown) {
            camera.rotation.y += this.USER_TURN_SPEED;
        } else if (!scope.mouse_action.leftDown && scope.mouse_action.rightDown) {
            camera.rotation.y -= this.USER_TURN_SPEED;
        }
    };

    // load the dom and callbacks down here when they're visible
    this.addDomElements = function () {
        // add the control elements
        scope.left = domElement.createElement('div');
        scope.left.id = 'lf_control';
        scope.left.className = 'm_control';
        scope.left.innerHTML = '<img src="./assets/up_turn.png" alt="up turn">';
        domElement.getElementsByTagName('body')[0].appendChild(scope.left);

        scope.right = domElement.createElement('div');
        scope.right.id = 'rt_control';
        scope.right.className = 'm_control';
        scope.right.innerHTML = '<img src="./assets/up_turn.png" alt="up turn">';
        domElement.getElementsByTagName('body')[0].appendChild(scope.right);

        scope.left.addEventListener('touchstart', scope.onLeftMouseDown, false);
        scope.left.addEventListener('touchend', scope.onLeftMouseUp, false);
        scope.right.addEventListener('touchstart', scope.onRightMouseDown, false);
        scope.right.addEventListener('touchend', scope.onRightMouseUp, false);
    };

    this.addDomElements();

};



class MouseEvents {

    constructor(domElement, camera) {
        this.direction = "";
        this.oldx = 0;
        this.oldy = 0;
        // it's just document
        this.domElement = domElement;
        //this.domElement.addEventListener('mousemove', this.mouseMoveListener.bind(this));
        
        this.camera = camera;
    }

    mouseMoveListener = function (e) {
        
        if(e.which !== 1) {
            return;
        }
        
        if (e.pageX > this.oldx && e.pageY === this.oldy) {
            this.direction = "East";
        } else if (e.pageX === this.oldx && e.pageY > this.oldy) {
            this.direction = "South";
        } else if (e.pageX === this.oldx && e.pageY < this.oldy) {
            this.direction = "North";
        } else if (e.pageX < this.oldx && e.pageY === this.oldy) {
            this.direction = "West";
        }
        
        switch(this.direction) {
            case 'East':
                this.camera.userData.leftRightOffset += 0.025;
                break;
            case 'West':
                this.camera.userData.leftRightOffset -= 0.025;
                break;
            case 'North':
                this.camera.userData.upDownOffset += 1;
                break;
            case 'South':
                this.camera.userData.upDownOffset -= 1;
                break;
        }

        this.oldx = e.pageX;
        this.oldy = e.pageY;
    }
    
    getMouseMoveDirection = function() {
        return this.direction;
    }

}
/*/ James Kayes ©2018 <jkayes2718@gmail.com>
 *  Takes a THREE.js camera and updates its rotation and look at acording to the mouse position.
/*/
Math.toRadians = function(angle) {
    return angle * (Math.PI/180);
}
class FirstPersonView {
    constructor(camera) {
        this.camera = camera;
        this.yaw = 0.0;
        this.pitch = 0.0;
        this.cosY = Math.cos(Math.toRadians(this.yaw));
        this.cosP = Math.cos(Math.toRadians(this.pitch));
        this.sinY = Math.sin(Math.toRadians(this.yaw));
        this.sinP = Math.sin(Math.toRadians(this.pitch));
        this.active = false;
        this.lastMouseTime = null;
        
        let look_x = camera.position.x + (this.sinP * this.cosY);
        let look_y = camera.position.y + this.sinP * this.sinY;
        let look_z = camera.position.z + this.cosP;
        this.forward = new THREE.Vector3(look_x, look_y, look_z);
        this.forward = new THREE.Vector3();
    }

    activate() {
        fpv = this;
        var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
			if (havePointerLock) {
				var element = document.body;

				var pointerlockchange = function (event) {

				};

				var pointerlockerror = function (event) {
					console.log("Error with pointer lock.");

				};

				// Hook pointer lock state change events
				document.addEventListener('pointerlockchange', pointerlockchange, false );
				document.addEventListener('mozpointerlockchange', pointerlockchange, false );
                document.addEventListener('webkitpointerlockchange', pointerlockchange, false );
                
				document.addEventListener('pointerlockerror', pointerlockerror, false );
				document.addEventListener('mozpointerlockerror', pointerlockerror, false );
                document.addEventListener('webkitpointerlockerror', pointerlockerror, false );
                
                document.addEventListener('mousemove', this.onMouseMove, false );
                document.addEventListener('click', function (event) {
					// Ask the browser to lock the pointer
					element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                    element.requestPointerLock();
                    fpv.active = true;

                }, false );
                
                document.addEventListener( 'keydown', this.onKeyDown, false );
				document.addEventListener( 'keyup', this.onKeyUp, false );
               

			} else {
				alert("Browser doesn't seem to support the Pointer Lock API");

			}
    }

    deactivate() {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

        // Attempt to unlock
        document.exitPointerLock();
        this.active = false;
    }

    update(dt) {
        if(fpv.moveForward) {
            this.camera.position.addScaledVector(this.forward, 5000 * dt);
            console.log(this.camera.position);
        }
        if(fpv.moveBackward) {
            this.camera.position.addScaledVector(this.forward, 5000 *dt);
        }
    }

    onKeyDown(event) {
        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                fpv.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                fpv.moveLeft = true; 
                break;

            case 40: // down
            case 83: // s
                fpv.moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                fpv.moveRight = true;
                break;

        }
    }

    onKeyUp(event) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                fpv.moveForward = false;
                break;

            case 37: // left
            case 65: // a
                fpv.moveLeft = false; 
                break;

            case 40: // down
            case 83: // s
                fpv.moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                fpv.moveRight = false;
                break;

        }
    }

    onMouseMove(event) {
        if(fpv.lastMouseTime !== null && fpv.active) {
            let dt = event.timeStamp - fpv.lastMouseTime;
            if(dt){
                fpv.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                fpv.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                // Update yaw and pitch acording to mouse movement:
                fpv.yaw += 0.000002 * fpv.movementX * dt;
                fpv.yaw %= 360;
                fpv.pitch += 0.000002 * fpv.movementY * dt;
                fpv.pitch %= 180;
                

                fpv.cosY = Math.cos(Math.toRadians(fpv.yaw));
                fpv.cosP = Math.cos(Math.toRadians(fpv.pitch));
                fpv.sinY = Math.sin(Math.toRadians(fpv.yaw));
                fpv.sinP = Math.sin(Math.toRadians(fpv.pitch));

                let look_x = camera.position.x + (fpv.sinP * fpv.cosY);
                let look_y = camera.position.y + fpv.sinP * fpv.sinY;
                let look_z = camera.position.z + fpv.cosP;
                this.forward = new THREE.Vector3(look_x, look_y, look_z);

                //camera.lookAt(this.forward);
            }
        }
        else {
            fpv.lastMouseTime = event.timeStamp;
        }
    }

}
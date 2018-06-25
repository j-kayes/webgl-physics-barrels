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
    }

    activate() {
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

				// Ask the browser to lock the pointer
                element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
                element.requestPointerLock();
                this.active = true;

			} else {
				instructions.innerHTML = "Your browser doesn't seem to support the Pointer Lock API";

			}
    }

    deactivate() {
        document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

        // Attempt to unlock
        document.exitPointerLock();
        this.active = false;
    }

    onMouseMove(event) {
        if(this.lastMouseTime !== null) {
            let dt = event.timeStamp - this.lastMouseTime;
            this.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            this.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
            this.yaw += 0.02 * this.movementX * dt;
            this.pitch += 0.02 * this.movementY * dt;
        }
        else {
            this.lastMouseTime = event.timeStamp;
        }

        
    }

    update() {
        this.cosY = Math.cos(Math.toRadians(this.yaw));
        this.cosP = Math.cos(Math.toRadians(this.pitch));
        this.sinY = Math.sin(Math.toRadians(this.yaw));
        this.sinP = Math.sin(Math.toRadians(this.pitch));
        
        // From parametric equation of sphere:
        camera.lookAt(sinY * cosP, sinP, cosP - cosY);
        

    }

}
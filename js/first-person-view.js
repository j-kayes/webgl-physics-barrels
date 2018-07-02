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
        this.pitch = 40.0;
        this.cosY = Math.cos(Math.toRadians(this.yaw));
        this.cosP = Math.cos(Math.toRadians(this.pitch));
        this.sinY = Math.sin(Math.toRadians(this.yaw));
        this.sinP = Math.sin(Math.toRadians(this.pitch));
        this.active = false;
        this.lastMouseTime = null;
        
        this.lookAt = new THREE.Vector3();
        this.lookAt.x = camera.position.x + this.cosP * this.sinY;
        this.lookAt.y = camera.position.y - this.sinP;
        this.lookAt.z = camera.position.z - (this.cosP *this.cosY);

        this.forward = new THREE.Vector3().subVectors(this.lookAt, this.camera.position).normalize();
        this.left = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), this.forward).normalize();

        this.camera.lookAt(this.lookAt);
        this.camSpeed = 5.0;
        this.camFastSpeed = 8.0;
        this.lookSensitivity = 0.75;
        fpv = this;
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
                
                document.addEventListener('mousemove', this.onMouseMove, false );
                
                // Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPoin-Lock;
                element.requestPointerLock();
                
                document.addEventListener( 'keydown', this.onKeyDown, false );
				document.addEventListener( 'keyup', this.onKeyUp, false );
                this.active = true;

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

    onKeyDown(event) {
        switch (event.keyCode) {
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

            case 27: // esc
                fpv.deactivate();
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
    // Have to use fpv value in place of 'this' as the reference changes due to this being a browser event:
    onMouseMove(event) {
        if(fpv.lastMouseTime !== null && fpv.active) {
            let dt = document.threeClock.getDelta();
            if(dt) {
                fpv.movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
                fpv.movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
                // Update yaw and pitch acording to mouse movement:
                fpv.yaw += fpv.lookSensitivity * fpv.movementX * dt;
                fpv.yaw %= 360;
                fpv.pitch += fpv.lookSensitivity * fpv.movementY * dt;
                fpv.pitch %= 360;

                fpv.cosY = Math.cos(Math.toRadians(fpv.yaw));
                fpv.cosP = Math.cos(Math.toRadians(fpv.pitch));
                fpv.sinY = Math.sin(Math.toRadians(fpv.yaw));
                fpv.sinP = Math.sin(Math.toRadians(fpv.pitch));

                /*/ The 'lookat' vector is updated to point towards a point on the unit sphere 
                    surrounding the camera acording to the yaw and pitch angles above.
                    This can be calculated by hand with trigonometry.
                */
                fpv.lookAt.x = camera.position.x + fpv.cosP * fpv.sinY;
                fpv.lookAt.y = camera.position.y - fpv.sinP;
                fpv.lookAt.z = camera.position.z - (fpv.cosP * fpv.cosY);

                fpv.forward.subVectors(fpv.lookAt, fpv.camera.position).normalize();
                fpv.left.crossVectors(new THREE.Vector3(0, 1, 0), fpv.forward).normalize();

                fpv.camera.lookAt(fpv.lookAt);
            }
        }
        else {
            fpv.lastMouseTime = event.timeStamp;
        }
    }

    update(dt) {
        if(fpv.moveForward) {
            this.camera.position.addScaledVector(this.forward, this.camSpeed * dt);
        }
        if(fpv.moveBackward) {
            this.camera.position.addScaledVector(this.forward, -this.camSpeed * dt);
        }
        if(fpv.moveLeft) {
            this.camera.position.addScaledVector(this.left, this.camSpeed * dt);
        }
        if(fpv.moveRight) {
            this.camera.position.addScaledVector(this.left, -this.camSpeed * dt);
        }
    }
}
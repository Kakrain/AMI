THREE.Marine = function ( geometry, material, useVertexTexture ,_ambiente) {

  THREE.SkinnedMesh.call( this, geometry, material );
this.animations = {};
  this.weightSchedule = [];
  this.warpSchedule = [];
  this.States = {
    UPRIGHT: 0,
    UPRIGHT_FIRING: 1,
    KNEELING: 2,
    KNEELING_FIRING: 3,
    NONE: 4
  };
  this.destino=null;
  this.currentState = this.States.UPRIGHT;
  this.nextState = this.States.NONE;

  this.enableMovement = true;
var boxes=[];
var self = this;
var armas=[];
this.addWeapon=function(mesh){
    armas[armas.length]=mesh;
    boxes[22].add(mesh);
}
var ambiente=_ambiente;

  this.rotationInputAxis = 0;
  this.velocity = 0;

  this.aceleration = 1 / 2.5;
  this.runUnitsPerSecond = 100;
  this.rotationUnitsPerSecond = 1;

for(var i = 0; i < self.skeleton.bones.length; i++)
  {
    var b = new THREE.Object3D();
    b.applyMatrix(self.skeleton.bones[i].matrix);
    b.matrix.copy(self.skeleton.bones[i].matrix);
    boxes[i] = b;
  }
    for(var i = 0; i < self.skeleton.bones.length; i++)
    {
      if(self.skeleton.bones[i].parent instanceof THREE.SkinnedMesh) self.add(boxes[i]);
      else
      {
        for(var j = 0; j < self.skeleton.bones.length; j++)
        {
          if(self.skeleton.bones[i].parent == self.skeleton.bones[j])
          {
            boxes[j].add(boxes[i]);
          }
        }
      }
    }
    for ( var i = 0; i < geometry.animations.length; ++i ) {

        var animName = geometry.animations[ i ].name;
        this.animations[ animName ] = new THREE.Animation( this, geometry.animations[ i ] );

      }

 /*
  this.idleAnim = new THREE.Animation( this, "idle" );
  this.walkAnim = new THREE.Animation( this, "walk_with_gun" );
  this.runAnim = new THREE.Animation( this, "run_with_gun" );
  this.kneelAnim = new THREE.Animation( this, "kneel_idle" );
  this.kneelFiringAnim = new THREE.Animation( this, "kneel_firing" );
  this.idleFiringAnim = new THREE.Animation( this, "idle_with_gun_firing" );
*/
this.idleAnim = this.animations[ animName ];
//$.notify("idleanim: "+this.idleAnim,{autoHide:false});
  this.walkAnim = this.animations["walk_with_gun"];
  this.runAnim = this.animations["run_with_gun"];
  this.kneelAnim =this.animations["kneel_idle"];
  this.kneelFiringAnim = this.animations["kneel_firing"];
  this.idleFiringAnim = this.animations["idle_with_gun_firing"];
  // Start off with the upright blend anims playing
  this.idleAnim.play(true, 0, 1);
  this.walkAnim.play(true, 0, 0);
  this.runAnim.play(true, 0, 0);

  var forwardPressed = false;
  var isFiring = false;
  

  //----------------------------------------------------------------------------
  this.update = function( delta ) {
 for(var i = 0; i < boxes.length; i++)
    {
      boxes[i].position.copy(self.skeleton.bones[i].position);
      boxes[i].rotation.copy(self.skeleton.bones[i].rotation);
    }
    updateInputAxes( delta );
    updateMovement( delta );
    updateAnimation();
   

  };

  //----------------------------------------------------------------------------
  var updateInputAxes = function( delta ) {

    var axisDelta = delta * self.aceleration;

    if ( self.destino!=null && self.currentState === self.States.UPRIGHT ) {
      self.velocity += axisDelta;
    } else {
      // decay linearly
      self.velocity -= axisDelta;
    }

    self.velocity = Math.max( self.velocity, 0 );
    self.velocity = Math.min( self.velocity, 1 );

  };

  //----------------------------------------------------------------------------
  var updateMovement = function( delta ) {

    if (self.destino!=null && self.enableMovement ) {

      /*if ( self.currentState === self.States.UPRIGHT ) {

        self.rotation.y += self.rotationInputAxis * delta;
        self.updateMatrix();

      }*/

    self.destino.y = self.position.y;
    self.lookAt(self.destino);
    self.rotation.y+=Math.PI;

      var forward = self.getForward().clone();
      var movement = self.velocity * self.runUnitsPerSecond * delta;

      forward.multiplyScalar( movement );
      self.position.add( forward );
      self.position.y=ambiente.getYat(self.position);

    }

  };

  //----------------------------------------------------------------------------
  var updateAnimation = function() {

    if ( self.nextState !== self.States.NONE ) {

      updateAnimationTransitions();

    } else {

      // Apply current state logic
      if ( self.currentState === self.States.UPRIGHT ) {

        // map values from [0,1] --> [idle, walk, run] --> [0, 0.5, 1]
        if ( self.velocity > 0.5 ) {

          var alpha = Math.abs( ( self.velocity - 0.5 ) / 0.5 );
          self.idleAnim.weight = 0;
          self.walkAnim.weight = 1 - alpha;
          self.runAnim.weight = alpha;

        } else {

          var alpha = Math.abs( self.velocity / 0.5 );
          self.idleAnim.weight = 1 - alpha;
          self.walkAnim.weight = alpha;
          self.runAnim.weight = 0;

        }

      }
    }

  };

  //----------------------------------------------------------------------------
  var updateAnimationTransitions = function() {

    // Apply transitions
    switch ( self.currentState ) {

      case self.States.UPRIGHT: {

        if ( self.nextState === self.States.KNEELING ) {

          self.velocity = 0;

          self.idleAnim.stop( 0.3 );
          self.walkAnim.stop( 0.3 );
          self.runAnim.stop( 0.3 );

          self.kneelAnim.play(true, 0, 1, 0.3);

          self.currentState = self.nextState;

        } else if ( self.nextState === self.States.UPRIGHT_FIRING ) {

          self.velocity = 0;

          self.idleAnim.stop( 0.1 );
          self.walkAnim.stop( 0.1 );
          self.runAnim.stop( 0.1 );

          self.idleFiringAnim.play(false, 0, 1, 0.1);

          var stopFiringBeginTime = (self.idleFiringAnim.data.length - 0.3) * 1000;

          setTimeout( function() {
            if ( self.nextState === self.States.NONE ) {
              self.nextState = self.States.UPRIGHT;
            }

          }, stopFiringBeginTime );

          self.currentState = self.nextState;

        }

        break;
      }
      case self.States.UPRIGHT_FIRING: {

        if ( self.nextState === self.States.UPRIGHT ) {

          self.idleFiringAnim.stop( 0.3 );
          self.idleAnim.play(true, 0, 1, 0.3 );
          self.walkAnim.play(true, 0, 0 );
          self.runAnim.play(true, 0, 0 );

          self.currentState = self.nextState;

        }

        break;
      }
      case self.States.KNEELING: {

        if ( self.nextState === self.States.UPRIGHT ) {
          self.kneelAnim.stop( 0.3 );

          self.idleAnim.play(true, 0, 0, 0.3);
          self.walkAnim.play(true, 0, 0, 0.3);
          self.runAnim.play(true, 0, 0, 0.3);

          self.currentState = self.nextState;

        } else if ( self.nextState === self.States.KNEELING_FIRING ) {

          self.kneelAnim.stop( 0.2 );

          // hack in case firing is still fading out, force it off so it will play
          self.kneelFiringAnim.stop(0);

          self.kneelFiringAnim.play( false, 0, 1, 0.2 );
          self.currentState = self.nextState;

          var stopFiringBeginTime = (self.kneelFiringAnim.data.length - 0.3) * 1000;

          setTimeout( function() {
            if ( self.nextState === self.States.NONE ) {
              self.nextState = self.States.KNEELING;
            }

          }, stopFiringBeginTime );

        }
        break;
      }
      case self.States.KNEELING_FIRING: {

        if ( self.nextState === self.States.KNEELING ) {

          self.kneelFiringAnim.stop( 0.2 );
          self.kneelAnim.play( true, 0, 1, 0.2 );
          self.currentState = self.nextState;

        }
        break;
      }

    }

    self.nextState = self.States.NONE;

  };
this.setWalking=function(flag){
  forwardPressed = flag;
}
  //----------------------------------------------------------------------------
  /*var onKeyDown = function( e ) {

    if ( e.keyCode === 87 || e.keyIdentifier === 'Up' )
      forwardPressed = true;
    else if ( e.keyCode === 68 || e.keyIdentifier === 'Right' ) {
      this.rotationInputAxis = -1;
    }
    else if ( e.keyCode === 65 || e.keyIdentifier === 'Left' )
      this.rotationInputAxis = 1;
    else if ( e.keyCode === 67 || e.keyCode === 16 ) {

      if ( this.currentState === this.States.UPRIGHT )
        this.nextState = this.States.KNEELING;
      else if ( this.currentState === this.States.KNEELING )
        this.nextState = this.States.UPRIGHT;
    } else if ( e.keyCode === 32 ) {

      if ( self.currentState === self.States.KNEELING ) {
        self.nextState = self.States.KNEELING_FIRING;
      } else if ( self.currentState === self.States.UPRIGHT ) {
        self.nextState = self.States.UPRIGHT_FIRING;
      }
    }

  }

  //----------------------------------------------------------------------------
  var onKeyUp = function( e ) {

    if ( e.keyCode === 87 || e.keyIdentifier === 'Up' )
      forwardPressed = false;
    else if ( e.keyCode === 68  || e.keyIdentifier === 'Right' )
      this.rotationInputAxis = 0;
    else if ( e.keyCode === 65 || e.keyIdentifier === 'Left' )
      this.rotationInputAxis = 0;

  }
*/

  //----------------------------------------------------------------------------
  var bind = function( scope, func ) {
    return function() {
      func.apply( scope, arguments );
    }
  }

 // window.addEventListener( 'keydown', bind( this, onKeyDown ), false );
 // window.addEventListener( 'keyup', bind( this, onKeyUp ), false );
 // window.addEventListener( 'mousedown', bind( this, onMouseDown ), false );

};

//------------------------------------------------------------------------------
THREE.Marine.prototype = Object.create( THREE.SkinnedMesh.prototype );

THREE.Marine.prototype.getForward = function() {

  var forward = new THREE.Vector3();

  return function() {

    // pull the character's forward basis vector out of the matrix
    forward.set(
      -this.matrix.elements[ 8 ],
      -this.matrix.elements[ 9 ],
      -this.matrix.elements[ 10 ]
    );

    return forward;
  }

}();


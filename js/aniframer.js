function Aniframer (id_canvas, updateCallBack) {
	this.canvas=null;									//Canvas object
	this.ctx  = null;									//Canvas context
	this.run = false;									//by default, the loop is paused until is set to true.
	
	this.drawCallBack = null;							//Gets the draw funtion the user uses to draw. Called Every frameRequest
	this.audio = {};									//Array of audio clips.
	
	this.time = {
		now : window.performance.now(),					//Holds the current us time
		lastFrameTime : window.performance.now(),		//Holds the us time of the start of each frame
		fps : 0 										//holds the fps counter
	};
	
	this.status = {
		run : false,									//by default, the loop is paused until is set to true.
		preloadDone : false								//preloadDone flag. Comes true when is done/required
	};
	
	this.MR = 0;										//Motion Ratio. Refers to the fractions of a second the last frame took to render. microsends.
	
	/* 
		calls the function that resizes canvas
			+
		Auto resize Canvas
		Checks every 500ms for canvas size changes.
		Updates the canvas size and all size vars defined.
	*/
	var _this = this;
	updateCanvasSize(_this, id_canvas);
	this.checkResize = window.setInterval(function(){updateCanvasSize(_this, id_canvas);}, 500);
	
	
	//this.ctx.translate(0.5, 0.5);
	_this.ctx.imageSmoothingEnabled = true;
	
	//Sets the canvas and the draw callback.
	_this.updateCallBack = updateCallBack;









	//Sets the width and height attribute on canvas object
	function updateCanvasSize(_this, id_canvas){
		_this.canvas = document.getElementById(id_canvas);
		_this.canvas.w = _this.canvas.scrollWidth;
		_this.canvas.h = _this.canvas.scrollHeight;

		_this.canvas.setAttribute("width", _this.canvas.w);
		_this.canvas.setAttribute("height", _this.canvas.h);
		
		_this.ctx = _this.canvas.getContext( '2d' );
	}
	
	
	
	
}






/* INIT */
/* ####################################################### */
Aniframer.prototype.init = function(id_canvas, updateCallBack){
	// Start loop
	//this.loop();
};



/* Loop */
/* ####################################################### */
Aniframer.prototype.loop = function(){
	this.time.now = window.performance.now();
	
	var frameDuration = window.performance.now() - this.time.lastFrameTime;
	this.time.lastFrameTime = window.performance.now();
	this.time.fps = (1000 / frameDuration).toFixed(2);
	this.MR = frameDuration / 1000;

	if (this.run){
		var _this = this;												//copy of 'this'. 'this' inside setInterval() refers to setInterval() itself. Need to reference the outside 'this'
		this.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);
		this.updateCallBack();											//Calls the user funtion assigned to draw the scene
		window.requestAnimationFrame( function() { _this.loop(); } );	//Every newFrame this.loop() is called.
	}

};









// ******************************************************************************************************************
// Audio Controls
// ------------------------------------------------------------------------------------------------------------------

/* Add audio  */
/* ####################################################### */
Aniframer.prototype.addAudio = function(audio_name, audio_path, callBackFunction){ 
	if (typeof audio_name === "string" && audio_name.length>1 && typeof audio_path === "string" && audio_path.length>4){
		var audio_player = new Audio();
		audio_player.src = audio_path;
		
		this.audio[audio_name] = {
			audio : audio_player,
			audioname : audio_name,
			preload : false
		};
		this.audio[audio_name].audio.autoplay = false;
		
		var _this = this;
		this.audio[audio_name].audio.addEventListener('canplaythrough', function(){preloadAudio(_this, audio_name, callBackFunction);} , false);
	}
};

function preloadAudio(_callerFn, audio_name, callBackFunction) {
	_callerFn.audio[audio_name].preload = true;
	callBackFunction(_callerFn.audio[audio_name].audioname);
}





// ******************************************************************************************************************
// Animation Controls
// ------------------------------------------------------------------------------------------------------------------


/* Run/Stop Animation  */
/* ####################################################### */
Aniframer.prototype.startAnimation = function(){ this.run=true; this.loop();  };
Aniframer.prototype.stopAnimation = function(){  this.run=false; };
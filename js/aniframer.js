function Aniframer () {
	this.canvas=null;									//Canvas object
	this.ctx  = null;									//Canvas context
	this.run = false;									//by default, the loop is paused until is set to true.
	this.drawCallBack = null;							//Gets the draw funtion the user uses to draw. Called Every frameRequest
	
	this.time = {
		now : window.performance.now(),					//Holds the current us time
		lastFrameTime : window.performance.now(),		//Holds the us time of the start of each frame
		lastFrameDuration : 0,							//The duration in us of the last frame
		fps : 0 										//holds the fps counter
	};
	
	this.MR = 0;										//Motion Ratio. Refers to the fractions of a second the last frame took to render. microsends.
	
}




/* INIT */
/* ####################################################### */
Aniframer.prototype.init = function(id_canvas, drawCallBack){
	this.canvas = document.getElementById(id_canvas);
	this.ctx = this.canvas.getContext( '2d' );
	this.canvas.w = this.canvas.width;
	this.canvas.h = this.canvas.height;
	
	//this.ctx.translate(0.5, 0.5);
	this.ctx.imageSmoothingEnabled = true;

	this.drawCallBack = drawCallBack;
	console.log ("Aniframer plugin initialized.");

};



/* Loop */
/* ####################################################### */
Aniframer.prototype.loop = function(){
	this.time.now = window.performance.now();	
	if (this.run){
		var _this = this;					//copy of 'this'. 'this' inside setInterval() refers to setInterval() itself. Need to reference the outside 'this'
		var frameNow = window.performance.now();
		var frameDuration = frameNow - this.time.lastFrameTime;
		this.MR = frameDuration / 1000;
		this.time.lastFrameTime = frameNow;

		this.time.fps = (1000 / frameDuration).toFixed(2);
		this.time.lastFrameDuration = (frameDuration / 1000).toFixed(3);

		this.ctx.clearRect(0, 0, this.canvas.w, this.canvas.h);
		this.drawCallBack(); 				//Calls the user funtion assigned to draw the scene
		window.requestAnimationFrame( function() { _this.loop(); } ); //Every newFrame this.loop() is called.
	}else{
		this.fps = 0;
	}
};



/* Run + Pause Animation  */
/* ####################################################### */
Aniframer.prototype.startAnim = function(){ this.run = true; this.loop(); return true; };
Aniframer.prototype.pauseAnim = function(){ this.run = false;  return false; };

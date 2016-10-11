/* ================================================================================================================================================================= */
/*	Define Vars */
/* ================================================================================================================================================================= */

/* Instatiates Aniframer -> ( id_canvas, update_callback_function) */
var AF = new Aniframer('star_wars_intro', Update);

/* UI Elements */
var dbgBox = document.getElementById('debugBox');
var audioplayer = document.getElementById('audioplayer');
var introText_textArea = document.getElementById('introText');
var scrolling_text_container = document.getElementById('scrollingText_container');
var perspectiveText_base = document.getElementById('perspectiveText_base');




/* Animation Vars */
var yellowcolor = "255, 166, 0";			//Default yellow text color

/* Debug options*/
var showDebugInfo = true;
var debugTimer;
var debug;

/* Animation Objects */
var sky = {};								//Sky object.
var logo = {};								//Logo object
var introText = {};							//Intro text object
var loadingAnimation = {};					//Initial Loading animation




//The default timeline.
//The times are in miliseconds. To all values are added the loading time.
var timeline = {
	start_logo: 2000,
	start_text: 11000,
	start_fade_out_logo: 14500,
	end_logo: 16000,
	intro_text_fadeout_start: 77000,
	intro_text_fadeout_end: 80000,		//1m + 20s
	sky_zoom_in: 81000					//1m + 21s = 81000
};


/* Animation Controls */
var animationControls = {
	playing : 0,				//Holds the value of the full animation stages (loading|play|pause|end)
	step : "loading",				//Holds the value of the full animation stages (loading|play|pause|end)
	preloadCount : 0,
	playTime : 0,
	animationPauseStarted : 0,		//TS indicating when the pause started
	animationTimerDrift : 0,		//Total of unused time from the global Timer. Counts the amount of time spent with pauses and loding animations. To be discounted on AF.Timer.now.
	pause : function(){
		this.playing = 0;
		this.step = "pause";
		this.animationPauseStarted = AF.time.now;
	},
	play : function(){
		this.playing = 1;
		this.step = "play";
		this.animationTimerDrift += AF.time.now - this.animationPauseStarted;
		this.animationPauseStarted = 0;
	},
	updateAnimationTime : function(){		//Global animation time without the pauses and loading animation times.
		if (this.step=="play") this.playTime =  AF.time.now - this.animationTimerDrift;
		
	}
	
};



/* ================================================================================================================================================================= */
/*	Animation Logic Setup */
/* ================================================================================================================================================================= */

//Initiate all vars. Works as reset to
init();
AF.startAnimation();


/*
	Inits all the objects with their current update/draw functions
 */
function init(){
	//init debug info
	init_debug();

	// Audio:
	animationControls.preloadCount++;
	AF.addAudio("starwars", "sound/star_wars_intro.mp3", preLoadCallBack);
	
	
	//Init loadingAnimation and assigns the event handler for the play Button
	init_loadingAnimation();
	AF.canvas.addEventListener("click", loadingAnimation.playBtClick, false);
	
	//Init loadingAnimation and assigns the event handler for the play Button
	init_sky();
	
	init_logo();
	animationControls.preloadCount++;
	logo.calibrateSize();
	
	init_intro_text();
}

function play(){
	animationControls.play();
	audioplayer.play();
}

function pause(){
	animationControls.pause();
	audioplayer.pause();
}



//Preload Callback. Called after when udio is loaded
//Called by AF plugin
function preLoadCallBack(audio_name) {
	if (AF.audio[audio_name].audioname=="starwars"){
		audioplayer.src = AF.audio[audio_name].audio.src;
		animationControls.preloadCount--;
	}
}





function Update() {
	//Update Animation time
	animationControls.updateAnimationTime();
	
	//Show debug info
	debug.show();
	
	
	
	
	
	//Show sky
	sky.update();
	sky.draw();
	
	
	if (animationControls.step=="loading"){
		loadingAnimation.update();
		loadingAnimation.draw();
	}




	//if (animationControls.step=="play"){
		
		logo.update();
		introText.update();
		
		logo.draw();
		introText.draw();
	//}

};













/* ================================================================================================================================================================= */
/*	Object Creation Setup functions */
/* ================================================================================================================================================================= */
// Show debug info
function init_debug(){
	console.log ("Debug init");
	debug = {
		lastUpdate : 0,
		fps : 0,
		totalSeconds : 0,
		animSeconds : 0,
		show : function(){
			if (AF.time.now - this.lastUpdate > 100){
				this.fps =  AF.time.fps;
				this.totalSeconds = (AF.time.now / 1000).toFixed(1);
				this.animSeconds = (animationControls.playTime / 1000).toFixed(1);
				this.lastUpdate = AF.time.now;
			}
			AF.ctx.font = '45% consolas';
			AF.ctx.fillStyle = "#00FF00";
			AF.ctx.textAlign = "left";
			AF.ctx.fillText("FPS: " + this.fps, 10, 10);
			AF.ctx.fillText("GlobalTimer: " + this.totalSeconds, 90, 10);
			AF.ctx.fillText("AnimationTimer: " + this.animSeconds, 200, 10);
		}
	};
}



// Loading animation. Just a simple loading text in very dim red with outer glow in the center of the screen
function init_loadingAnimation(){
	loadingAnimation = {
		opacity: 0.1,								// holds the opacity value for animation
		opacity_direction: 1,						// holds the opacity increment directionvalue for animation
		fontSize : Math.floor(AF.canvas.h * 0.1),	// Font size
		playFontSize : Math.floor(AF.canvas.h * 0.05),	// Font size
		playBtWidth : 100,
		playBtClick: function (event) {
			//Clicke everywhere for pause
			if (animationControls.step=="play" || animationControls.step=="pause"){
				if (animationControls.playing==1)
					pause();
				else
					play();
			}
			
			//This function is firedUp when the click event happens.
			//The scope of this function is relative to the event caller and not the loadingAnimation object.
			//So, the loadingAnimation properties must be called directly from the outside
			if (animationControls.preloadCount==0 && animationControls.step=="loading"){
				var x = event.offsetX;
				var y = event.offsetY;
				
				//check for play button click.
				//When clicked, starts the intro animation
				if (x>(AF.canvas.w/2)-(loadingAnimation.playBtWidth/2) && x<(AF.canvas.w/2)+(loadingAnimation.playBtWidth/2) &&
					y>(AF.canvas.h/2)-(loadingAnimation.playFontSize) && y<(AF.canvas.h/2) ){
					play();
				}
			}
			

			
			
		},
		update: function () {
			if (animationControls.preloadCount>0){
				//Update text animation
				this.opacity += AF.MR  * this.opacity_direction * 0.3; //0.3 for slower animation
				if (this.opacity>0.5 || this.opacity<0.1) this.opacity_direction *= -1;
			}
		},
		draw: function () {
			if (animationControls.preloadCount>0){
				//Loading text animation
				AF.ctx.save();
				AF.ctx.shadowBlur = this.fontSize/2;
				AF.ctx.shadowColor = "rgba(255, 255, 255, " + this.opacity + ")";

				AF.ctx.font = this.fontSize + 'px STARWARS';
				AF.ctx.fillStyle = "rgba(0, 0, 0, " + this.opacity + ")";
				AF.ctx.textAlign = "center";

				AF.ctx.fillText("loading", AF.canvas.w / 2, AF.canvas.h / 2);
				AF.ctx.restore();
			}else{
				//Show play button
				AF.ctx.font = this.playFontSize + 'px consolas';
				AF.ctx.fillStyle = "#FFFFFF";
				AF.ctx.textAlign = "center";
				this.playBtWidth = AF.ctx.measureText("PLAY").width;
				AF.ctx.fillText("PLAY", AF.canvas.w / 2, AF.canvas.h / 2);
			}
		}
	};
}


// Sky animation. Just stars that starts to move at the end to give an efect of motion from the POV
function init_sky(){
	sky = {
		sky: [],
		stars_count: 400,
		radius_factor: 1.5,
		
		//init all stars
		init: function () {
			for (var c = 0; c <= this.stars_count - 1; c++) {
				var _x = Math.round(Math.random() * AF.canvas.w);		//Distributes the star long width
				var _y = Math.round(Math.random() * AF.canvas.h);		//Distributes the star long height
				var _r = Math.max(Math.random().toFixed(4), 0.5);		//star radius. from 0.5 to 4px
				var _color = Math.max((120*_r).toFixed(0), 80);			//For rgb. Min 80, max 120*star radius. As bigger the star is, the whiter it is also
				this.sky[c] = {											//Adds the star to the sky array
					x: _x,
					y: _y,
					radius: _r,
					color: _color
				};
			}
		},
		
		
		
		// Regenerates a new star when called.
		// Used to renew stars when they get outside canvas boundaries.
		renewStar : function (c){
			this.sky[c].y = AF.canvas.h + Math.round(Math.random() * 30);
			this.sky[c].x = Math.round(Math.random() * AF.canvas.w);
		},

		// Every frame update.
		// Makes all the calculations
		update: function () {
			//Is timeline scheduled?
			if (animationControls.playTime >= timeline.sky_zoom_in) {
				
				//Loop all stars
				for (var c = 0; c <= this.stars_count - 1; c++) {
					
					//if a star is outside the canvas boundaries, is renewed
					if (this.sky[c].y<0 || this.sky[c].x<0 || this.sky[c].x>AF.canvas.w) this.renewStar(c);
					
					//Sky accelaration. To prevent imediate motion when the sky starts to move
					//Accelaration takes 2 seconds (2000ms) from 0 to 1.
					var accel = (animationControls.playTime - timeline.sky_zoom_in) / 2000;
					accel = Math.min(accel.toFixed(2), 1);
					
					//Final update of the star position. 
					//The far a star is from the center x, the most speed it gains on x.
					//The higher the y position is, the most speed on y it has.
					//The y speed also derivates from the radius, trying to give the effect that the smaller, the far away the star is, and the far, the slowest.
					this.sky[c].x += AF.MR * accel * (this.sky[c].x-((AF.canvas.w/2) + 300)) * 0.08;
					this.sky[c].y -= AF.MR * accel * (20 +  ((this.sky[c].y/100)*this.sky[c].radius*4) * 3);
				}
			}
			
		},
		draw: function () {
			for (var c = 0; c <= this.stars_count - 1; c++) {
				AF.ctx.beginPath();
				AF.ctx.arc(this.sky[c].x, this.sky[c].y, this.sky[c].radius * this.radius_factor, 0, 2 * Math.PI, false);
				AF.ctx.fillStyle = "rgba("+ this.sky[c].color +", "+ this.sky[c].color +", "+ this.sky[c].color +", 1)";		//'#666666';
				AF.ctx.fill();
			}
		}
	};
	sky.init();
}


// The star wars logo zoomOut animation
function init_logo(){
	logo = {
		y_star: AF.canvas.h / 2, //position y
		y_wars: AF.canvas.h / 2, //position y
		initial_size: 0, //Starts on 400, ends on 20. Takes 13 seconds to zoomOut. 13/380 =
		size: 0, //Starts on 400, ends on 20. Takes 13 seconds to zoomOut. 13/380 =
		logoHPos: 0,
		lineWidth: 10,
		fade: 1,
		calibrateSize: function () {
			var w = 0;
			while (w<AF.canvas.w*1.2){
				this.initial_size++;
				AF.ctx.font = Math.floor(this.initial_size) + 'px STARWARS';
				w = AF.ctx.measureText("STAR").width;
			}
			animationControls.preloadCount--;
			this.size = this.initial_size;
			
		},
		update: function () {
			
			//Zoom Out
			if (animationControls.playTime >= timeline.start_logo && animationControls.playTime <= timeline.end_logo) {
				this.size -= AF.MR * (this.initial_size / ((timeline.end_logo-timeline.start_logo)/1000)) * animationControls.playing;
				this.lineWidth = 0.03 * this.size;
				this.y_star = (AF.canvas.h / 2);
				this.y_wars = this.y_star + this.size * 0.75; // 0.75 to compensate the padding around the font
				
				
				//logo fade out
				if (animationControls.playTime >= timeline.start_fade_out_logo) {
					this.fade -= AF.MR * (1 / ((timeline.end_logo - timeline.start_fade_out_logo) / 1000)) * animationControls.playing;
					this.fade = Math.max(0, this.fade);
				}
				
				if (animationControls.playTime>=timeline.end_logo) this.fade = 0;
			}
		},
		draw: function () {
			if (animationControls.playTime >= timeline.start_logo) {
				AF.ctx.font = Math.floor(this.size) + 'px STARWARS';
				AF.ctx.lineWidth = this.lineWidth;
				AF.ctx.strokeStyle = "rgba(" + yellowcolor + ", " + this.fade.toFixed(2)+")";
				AF.ctx.textAlign = "center";

				AF.ctx.strokeText("STAR", AF.canvas.w / 2, this.y_star);
				AF.ctx.strokeText("WARS", AF.canvas.w / 2, this.y_wars);
			}
		}
	};
}




function init_intro_text(){
	// Intro Text ================================================================================================================
	introText = {
		y: perspectiveText_base.offsetHeight,
		//Preset default text
		text : 'It is a period of civil war.\nRebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.\nDuring the battle, Rebel spies managed to steal secret plans to the Empire\'s ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.\nPursued by the Empire\'s sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy....\n'.toUpperCase().replace(/(?:\r\n|\r|\n)/g, '<br><br>'),
		opacity: 1,
		update: function () {
			//if (animationControls.playTime>=1000){
			if (animationControls.playTime >= timeline.start_text && animationControls.playTime < timeline.intro_text_fadeout_end) {
				this.y -= AF.MR * ((scrolling_text_container.offsetHeight + perspectiveText_base.offsetHeight)/((timeline.intro_text_fadeout_end - timeline.start_text)/1000)) *  animationControls.playing;; //180%

				if (animationControls.playTime >= timeline.intro_text_fadeout_start) {
					this.opacity -= (1 / ((timeline.intro_text_fadeout_end - timeline.intro_text_fadeout_start) / 1000)) * AF.MR  * animationControls.playing;;
				}
			}
		},
		draw: function () {
			
			//Converts line breaks to <br> and adds to scrolling_text_container div
			scrolling_text_container.innerHTML = this.text;
			scrolling_text_container.style.top = this.y.toFixed(2) + "px";
			scrolling_text_container.style.opacity = this.opacity;
			console.log(scrolling_text_container.style.top);
			
			
		}
	};
}
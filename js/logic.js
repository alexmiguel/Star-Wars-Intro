/* Define Vars */
/* ####################################################### */


/* Instatiates Aniframer */
var AF = new Aniframer();
var audio = new Audio();
var dbgBox = document.getElementById('debugBox');
var player = document.getElementById('player');
var introText_textArea = document.getElementById('introText');
var scrolling_text_container = document.getElementById('scrolling_text_container');
var sky = {};
var logo = {};
var introText = {};
var timeline = {};
var yellowcolor = "255, 166, 0";
var introText_defs = {
	fontSize: 25,
	maxLineWidth: 600,
	scrollSpeed: 16
};
var preLoadDone = false;		//Flag to indicate that the preLoad is done
var startAnimTS = 0;			//Holds the start time of animation. Holds the time when the preLoad function ends



introText_textArea.innerHTML = 'It is a period of civil war.\nRebel spaceships, striking from a hidden base, have won their first victory against the evil Galactic Empire.\n';
introText_textArea.innerHTML += 'During the battle, Rebel spies managed to steal secret plans to the Empire\'s ultimate weapon, the DEATH STAR, an armored space station with enough power to destroy an entire planet.\n';
introText_textArea.innerHTML += 'Pursued by the Empire\'s sinister agents, Princess Leia races home aboard her starship, custodian of the stolen plans that can save her people and restore freedom to the galaxy....\n';









function init() {
	// UI INIT ============

	//Assign eventHadlers
	document.getElementById("btPlay").addEventListener("click", play, false);
	document.getElementById("btPause").addEventListener("click", pause, false);
	
	//Converts line breaks to <br> and adds to scrolling_text_container div
	scrolling_text_container.innerHTML = introText_textArea.innerHTML.toUpperCase().replace(/(?:\r\n|\r|\n)/g, '<br><br>');	
	


	
	preload();
	startAnimTS = window.performance.now();

	



	timeline = {
		start_logo: 2000 + startAnimTS,
		start_text: 11000 + startAnimTS,
		start_fade_out_logo: 14500 + startAnimTS,
		end_logo: 15000 + startAnimTS,
		intro_text_fadeout_start: 77000 + startAnimTS,
		intro_text_fadeout_end: 80000 + startAnimTS,	//1m + 20s
		sky_zoom_in: 81000 + startAnimTS				//1m + 21s
	};






	// Sky ================================================================================================================
	sky = {
		sky: [],
		stars_count: 400,
		radius_factor: 1.5,
		
		init: function () {
			for (var c = 0; c <= this.stars_count - 1; c++) {
				var _x = Math.round(Math.random() * AF.canvas.w);
				var _y = Math.round(Math.random() * AF.canvas.h);
				var _r = Math.max(Math.random().toFixed(4), 0.5);
				var _color = Math.max((120*_r).toFixed(0), 80);
				this.sky[c] = {
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
			if (AF.time.now >= timeline.sky_zoom_in) {
				
				//Loop all stars
				for (var c = 0; c <= this.stars_count - 1; c++) {
					
					//if a star is outside the canvas boundaries, is renewed
					if (this.sky[c].y<0 || this.sky[c].x<0 || this.sky[c].x>AF.canvas.w) this.renewStar(c);
					
					//Sky accelaration. To prevent imediate motion when the sky starts to move
					//Accelaration takes 2 seconds (2000ms) from 0 to 1.
					var accel = (AF.time.now - timeline.sky_zoom_in) / 2000;
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



	// Logo ================================================================================================================
	logo = {
		y_star: AF.canvas.h / 2, //position y
		y_wars: AF.canvas.h / 2, //position y
		size: 400, //Starts on 400, ends on 20. Takes 13 seconds to zoomOut. 13/380 =
		logoHPos: 0,
		lineWidth: 10,
		fade: 1,
		update: function () {
			//Zoom Out
			if (AF.time.now >= timeline.start_logo && AF.time.now <= timeline.end_logo) {
				this.size -= AF.MR * (380 / ((timeline.end_logo - timeline.start_logo) / 1000));
				this.lineWidth -= (10 / ((timeline.end_logo - timeline.start_logo) / 1000)) * AF.MR;
				this.lineWidth = Math.max(0, this.lineWidth);
				this.y_star = (AF.canvas.h / 2);
				this.y_wars = this.y_star + this.size * 0.75; // 0.75 to compensate the padding around the font

				//logo fade out
				if (AF.time.now >= timeline.start_fade_out_logo) {
					this.fade -= AF.MR * (1 / ((timeline.end_logo - timeline.start_fade_out_logo) / 1000));
					this.fade = Math.max(0, this.fade);
				}
				
				if (AF.time.now>=timeline.end_logo) this.fade = 0;
			}
		},
		draw: function () {
			if (AF.time.now >= timeline.start_logo) {
				AF.ctx.font = Math.floor(this.size) + 'px STARWARS';
				AF.ctx.lineWidth = this.lineWidth;
				AF.ctx.strokeStyle = "rgba(" + yellowcolor + ", " + this.fade.toFixed(2);
				+")";
				AF.ctx.textAlign = "center";

				AF.ctx.strokeText("STAR", AF.canvas.w / 2, this.y_star);
				AF.ctx.strokeText("WARS", AF.canvas.w / 2, this.y_wars);
			}
		}
	};



	// Intro Text ================================================================================================================
	introText = {
		y: Number(scrolling_text_container.offsetTop),
		opacity: 1,
		update: function () {
			//if (AF.time.now>=1000){
			if (AF.time.now >= timeline.start_text) {
				this.y -= Number(AF.MR * introText_defs.scrollSpeed);

				if (AF.time.now >= timeline.intro_text_fadeout_start) {
					this.opacity -= (1 / ((timeline.intro_text_fadeout_end - timeline.intro_text_fadeout_start) / 1000)) * AF.MR;
				}
			}
		},
		draw: function () {
			scrolling_text_container.style.top = this.y.toFixed(2) + "px";
			scrolling_text_container.style.opacity = this.opacity;

		}
	};



	// Intro Text ================================================================================================================
	loadingAnimation = {
		top:  (AF.canvas.h * 0.1),										// 10% of height
		height: (AF.canvas.h * 0.8),									// 80% of canvas height
		width: (AF.canvas.h * 0.8) * 0.03,								// 3% of lightSaber height
		left: (AF.canvas.w / 2) - (((AF.canvas.h * 0.8) * 0.03) / 2),	// center it
		opacity: 0.5,													// holds the opacity value for animation
		opacity_direction: 1,											// holds the opacity increment directionvalue for animation
		update: function () {
			this.opacity += AF.MR  * this.opacity_direction;
			if (this.opacity>1 || this.opacity<0) this.opacity_direction *= -1;
		},
		draw: function () {
			AF.ctx.save();
			AF.ctx.shadowBlur = this.width * 3;
			AF.ctx.shadowColor = "rgba(255, 50, 50, 1)";
			AF.ctx.fillStyle = "rgba(255, 180, 180, " + this.opacity + ")";
	
			AF.ctx.beginPath();
			AF.ctx.moveTo(this.left, this.top+this.height);
			AF.ctx.lineTo(this.left, this.top);
			AF.ctx.arc(AF.canvas.w / 2, this.top, this.width/2, Math.PI, 0, false);
			AF.ctx.moveTo(this.left, this.top+this.height);
			AF.ctx.lineTo(this.left+this.width, this.top);
			AF.ctx.lineTo(this.left + this.width, this.top+this.height);
			AF.ctx.fill();
			AF.ctx.restore();
		}
	};





}










var update = function Update() {
	dbgBox.innerHTML = "Elapsed Time (sec): " + (AF.time.now / 1000).toFixed(1);
	dbgBox.innerHTML += "<br>Last Frame Time (ms): " + AF.time.lastFrameDuration;
	dbgBox.innerHTML += "<br>FPS: " + AF.time.fps;
	
	if (preLoadDone===false){
		loadingAnimation.update();
	}else{
		sky.update();
		logo.update();
		introText.update();
	}
	Draw();
};


function Draw() {
	if (preLoadDone===false){
		loadingAnimation.draw();
	}else{
		sky.draw();
		logo.draw();
		introText.draw();
	}


	/*
	 AF.ctx.rect(0,0,200,75);
	 AF.ctx.lineWidth = 1;
	 AF.ctx.fillStyle = "#FFFFFF";
	 AF.ctx.fill();

	 AF.ctx.font = '100px STARWARS';
	 AF.ctx.lineWidth = 2;
	 AF.ctx.strokeStyle = '#FF0000';
	 AF.ctx.strokeText("STAR WARS", 0, 70);
	 */




	// Skew Text example
	/*
	 a	Horizontal scaling
	 b	Horizontal skewing
	 c	Vertical skewing
	 d	Vertical scaling
	 e	Horizontal moving
	 f	Vertical moving
	 */

	/*
	 // Test of simple skew
	 AF.ctx.font = '20px STARWARS' ;
	 AF.ctx.fillStyle = 'red' ;
	 AF.ctx.setTransform (1, 0, 0.1, 1, 0, 0);
	 AF.ctx.fillText ('your text', 100, 100) ;
	 AF.ctx.setTransform (1, 0, 0, 1, 0, 0);
	 */

	/*
	 //Test of skew in Boxes
	 AF.ctx.strokeStyle = "#FF0000";
	 AF.ctx.beginPath();
	 AF.ctx.moveTo(140,150);
	 AF.ctx.lineTo(160,150);
	 AF.ctx.stroke();
	 AF.ctx.beginPath();
	 AF.ctx.moveTo(150,140);
	 AF.ctx.lineTo(150,160);
	 AF.ctx.stroke();

	 //Verde - No moving translation
	 AF.ctx.beginPath();
	 AF.ctx.setTransform (1, 0, 0.8, 1, 0, 0);
	 AF.ctx.fillStyle="#00FF00";
	 AF.ctx.rect(150, 150, 150, 50);
	 AF.ctx.fill();

	 //Azul - Moving translation
	 AF.ctx.beginPath();
	 AF.ctx.setTransform (1, 0, 0.8, 1, 150, 200);
	 AF.ctx.fillStyle="#0000FF";
	 AF.ctx.rect(0, 0, 150, 50);
	 AF.ctx.fill();




	 //Reset
	 AF.ctx.setTransform (1, 0, 0, 1, 0, 0);
	 */
}










function preload() {
	console.log("Start audio loading...");
	audio.src = "sound/star_wars_intro.mp3";
	audio.addEventListener('canplaythrough', preLoadCallBack, false);
}


function preLoadCallBack() {
	player.src = audio.src;
	player.pause();
}




function play() {
	player.play();
	//Starts the animation loop
	AF.startAnim();
	
	// Start Animation
	preLoadDone = true;
}

function pause() {
	player.pause();

}



/* AF.init( [id_canvas], [update_callback_function]); */
AF.init('star_wars_intro', update);


//Initiate all vars. Works as reset to
init();

//Starts the animation loop
AF.pauseAnim();




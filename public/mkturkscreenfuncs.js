//================== LOAD STATUS DISPLAY ==================//
function writeTextonBlankCanvas(textstr,x,y){
	var blank_canvasobj=document.getElementById("canvas"+canvas.blank)
	var visible_ctxt = blank_canvasobj.getContext('2d')
	visible_ctxt.textBaseline = "hanging"
	visible_ctxt.fillStyle = "white"
	visible_ctxt.font = "18px Verdana"
	visible_ctxt.fillText(textstr,x,y)
}
function updateStatusText(){
	var textobj = document.getElementById("headsuptext");
	textobj.innerHTML = ble.statustext
	// updateHeadsUpDisplay()
}
//================== STATUS DISPLAY (end) ==================//
//================== CANVAS SETUP ==================//
	// Sync: Setup heads-up display canvas
	function setupCanvasHeadsUp(){
		canvasobj=document.getElementById("canvasheadsup");
		canvasobj.width=window.innerWidth;
		canvasobj.height=Math.round(window.innerHeight*canvas.headsupfraction);
		canvas.offsettop = canvasobj.height;
		if (canvas.headsupfraction == 0){
			canvasobj.style.display="none";
		}
		else{
			canvasobj.style.display="block";
		}
		var context=canvasobj.getContext('2d');
		context.fillStyle="#202020";
		context.fillRect(0,0,canvasobj.width,canvasobj.height);
		canvasobj.addEventListener('mousedown',mousedown_listener,false);
		canvasobj.addEventListener('touchstart',touchstart_listener,false);
	}
	// Sync: Setup canvas
	function setupCanvas(id){
		str="canvas" + id;
		canvasobj=document.getElementById(str);
		// center in page
		canvasobj.style.top=canvas.offsettop + "px";
		canvasobj.style.left=canvas.offsetleft + "px";
		canvasobj.width=windowWidth;
		canvasobj.height=windowHeight;
		canvasobj.style.margin="0 auto";
		canvasobj.style.display="block"; //visible
		// assign listeners
		// handle touch & mouse behavior independently http://www.html5rocks.com/en/mobile/touchandmouse/
		canvasobj.addEventListener('mousedown',mousedown_listener,false);
		canvasobj.addEventListener('mousemove',mousemove_listener,false);
		canvasobj.addEventListener('mouseup',mouseup_listener,false);
		canvasobj.addEventListener('touchstart',touchstart_listener,false);
		// canvasobj.addEventListener('touchmove',touchmove_listener,false);
		canvasobj.addEventListener('touchmove',touchmove_listener,{passive: true}) // based on console suggestion: Consider marking event handler as 'passive' to make the page more responive. https://github.com/WICG/EventListenerOptions/blob/gh-pages/explainer.md
		canvasobj.addEventListener('touchend',touchend_listener,false);
		// store canvas size
		canvasSize=[canvasobj.width, canvasobj.height];
	} //setupCanvas
	// Sync: Adjust canvas for the device pixel ratio & browser backing store size
	// from http://www.html5rocks.com/en/tutorials/canvas/hidpi/#disqus_thread
	function scaleCanvasforHiDPI(id){
		if (devicePixelRatio !== backingStoreRatio){
			str="canvas" + id;
			canvasobj=document.getElementById(str);
			context=canvasobj.getContext("2d");
			var oldWidth = canvasobj.width;
			var oldHeight = canvasobj.height;
			canvasobj.width = oldWidth * canvasScale;
			canvasobj.height = oldHeight * canvasScale;
			canvasobj.style.width = windowWidth + "px";
			canvasobj.style.height = windowHeight + "px";
			canvasobj.style.margin="0 auto";
			context.scale(canvasScale,canvasScale);
		} //if
	} //scaleCanvasforHiDPI
//================== CANVAS SETUP (end) ==================//
function updateHeadsUpDisplay(){
	var textobj = document.getElementById("headsuptext");
	// Overall performance
	var ncorrect = 0;
	for (var i=0; i<=trial.correctItem.length-1; i++){
  		if (trial.correctItem[i] == trial.response[i]){
  			ncorrect++;
  		}
	}
	var pctcorrect = Math.round(100 * ncorrect / trial.response.length);
	// Task type
	var task1 = "";
	var task2 = "";
	if (trial.rewardStage == 0){
		task1 = "Fixation";
	}
	else if (trial.rewardStage == 1){
		task1 = "Match to Sample var" + trial.imageFolderSample;
		task2 = trial.sampleON + "ms, " + trial.nway + "-way, " + trial.objectlist.length + "-obj";
	}
	if (canvas.headsupfraction > 0){
		textobj.innerHTML = trial.subjid + ": <font color=green><b>" + pctcorrect + "%</b></font> " + "(" + ncorrect + " of " + trial.response.length +")" + "<br>" + "Estimated Reward: <font color=green><b>" + Math.round(trial.rewardper1000*ncorrect/1000) + "mL</b></font> (" + Math.round(trial.rewardper1000) + " per 1000)" + "<br> " + "<br>" + " Stage " + trial.currentAutomatorStage + ": " + task1 + "<br>" + task2 + "<br>" + "<br>" + "<br>" + "<font color=red><b>" + "<font color=blue><b>" + ble.statustext + "<br></font>";
	}
	else if (canvas.headsupfraction == 0){
		textobj.innerHTML = ble.statustext
	}
}
//================== IMAGE RENDERING ==================//
	// Sync: buffer trial images
	function bufferTrialImages(){
		// (pre)render canvas (synchronous)
		function renderCanvas(idxcv,idxim,usesample,grid){
			var canvasobj=document.getElementById("canvas"+idxcv);
			var context=canvasobj.getContext('2d');
			var indpos
			indpos=grid;
			var xleft=[];
			var ytop=[];
			var xbound=[];
			var ybound=[];
			for (var i in idxim){
				if (usesample==true){
					xleft[i] = Math.round(xgridcent[indpos[i]] - 0.5*imagesSample.wd*imagesSample.scale/canvasScale);
					ytop[i] = Math.round(ygridcent[indpos[i]] - 0.5*imagesSample.ht*imagesSample.scale/canvasScale);
					context.drawImage(imagesSamplePack[imagesSample.packpointer[idxim[i]]],imagesSample.pixLR[idxim[i]][0],0,imagesSample.wd,imagesSample.ht,xleft[i],ytop[i],imagesSample.wd*imagesSample.scale/canvasScale,imagesSample.ht*imagesSample.scale/canvasScale);
					xbound[i]=[xleft[i], xleft[i]+imagesSample.wd*imagesSample.scale/canvasScale];
					ybound[i]=[ytop[i], ytop[i]+imagesSample.ht*imagesSample.scale/canvasScale];
				}
				else if (usesample==false){
					xleft[i] = Math.round(xgridcent[indpos[i]] - 0.5*imagesTest.wd*imagesTest.scale/canvasScale);
					ytop[i] = Math.round(ygridcent[indpos[i]] - 0.5*imagesTest.ht*imagesTest.scale/canvasScale);
					context.drawImage(imagesTestPack[imagesTest.packpointer[idxim[i]]],imagesTest.pixLR[idxim[i]][0],0,imagesTest.wd,imagesTest.ht,xleft[i],ytop[i],imagesTest.wd*imagesTest.scale/canvasScale,imagesTest.ht*imagesTest.scale/canvasScale);
					xbound[i]=[xleft[i], xleft[i]+imagesTest.wd*imagesTest.scale/canvasScale];
					ybound[i]=[ytop[i], ytop[i]+imagesTest.ht*imagesTest.scale/canvasScale];
				}
				if (grid.length > 1 && trial.hidetestdistractors==1 && parseInt(i) != trial.correctItem[trial.current]){
					context.fillStyle="#7F7F7F";
					context.fillRect(xleft[i],ytop[i],imagesTest.wd*imagesTest.scale/canvasScale,imagesTest.ht*imagesTest.scale/canvasScale);
					xbound[i]=[xleft[i], xleft[i]+imagesTest.wd*imagesTest.scale/canvasScale];
					ybound[i]=[ytop[i], ytop[i]+imagesTest.ht*imagesTest.scale/canvasScale];
				} //gray out distractors
				xbound[i][0]=xbound[i][0]+canvas.offsetleft;
				xbound[i][1]=xbound[i][1]+canvas.offsetleft;
				ybound[i][0]=ybound[i][0]+canvas.offsettop;
				ybound[i][1]=ybound[i][1]+canvas.offsettop;
			};
			// bounding boxes of images on canvas
			return {
				x: xbound,
				y: ybound
			};
		}
		//buffer (sample & test canvases)
		//sample
		var canvasobj=document.getElementById("canvas"+canvas.sample); // Gray out before buffering sample
		var context=canvasobj.getContext('2d');
		context.fillStyle="#7F7F7F";
		context.fillRect(0,100, canvasobj.width,canvasobj.height); // 100 is for the photodiode bar at the top of the screen
		renderCanvas(canvas.sample,[trial.sample[trial.current]],true,trial.samplegrid);
		
		//test
		var canvasobj=document.getElementById("canvas"+canvas.test); // Gray out before buffering test
		var context=canvasobj.getContext('2d');
		context.fillStyle="#7F7F7F";
		context.fillRect(0,100, canvasobj.width,canvasobj.height); // 100 is for the photodiode bar at the top of the screen
		if (trial.keepSampleON==1){
			renderCanvas(canvas.test,[trial.sample[trial.current]],true,trial.samplegrid);
		}
		//** SR
		// use objectgrid instead of testgrid for positioning choices
		if (trial.objectgrid.length == trial.objectlist.length){
			for (var i=0; i<=trial.test[trial.current].length-1; i++){
				// Determine which object/grid image belongs to
				var currobj = imagesTest.obj[trial.test[trial.current][i]]
				var currind = []
				for (var j=0; j<=trial.objectlist.length-1; j++){
					if (trial.objectlist[j]==currobj){
						currind = j // index of object currently being looked at
					}
				}
				trial.testgrid[i] = trial.objectgrid[currind] // test locations are set by objectgrid
			}
		}
		//** SR end
		boundingBoxesTest = renderCanvas(canvas.test,trial.test[trial.current],false,trial.testgrid);
		canvas.buffered = 1;
	}
	// Promise: display trial images
	function displayTrial(sequence,tsequence){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(){
			//console.log('displayed images')
		});
		var start = null;
		function updateCanvas(timestamp){
			if (!start) start = timestamp;
			if (timestamp - start > tsequence[frame.current]){
				//console.log('displaying frame' + currframe + ' ' + timestamp);
				// Move canvas in front
				var prev_canvasobj=document.getElementById("canvas"+canvas.front);
				var curr_canvasobj=document.getElementById("canvas"+sequence[frame.current]);
				if (canvas.front != canvas.blank){
					prev_canvasobj.style.zIndex="0";
				} // move back
				if (sequence[frame.current] != canvas.blank){
					curr_canvasobj.style.zIndex="100";
					canvas.front = sequence[frame.current];
				} // move to front
				else{
					canvas.front = canvas.blank;
				}
				
				frame.shown[frame.current]=1;
				frame.current++;
			}; // if show new frame
			// continue if not all frames shown
			if (frame.shown[frame.shown.length-1] != 1){
				window.requestAnimationFrame(updateCanvas);
			}
			else{
				resolveFunc(1);
			}
		}
		//requestAnimationFrame advantages: goes on next screen refresh and syncs to browsers refresh rate on separate clock (not js clock)
		window.requestAnimationFrame(updateCanvas); // kick off async work
		return p
	} //displayTrial
	function renderBlank(){
		var canvasobj=document.getElementById("canvas"+canvas.blank);
		var context=canvasobj.getContext('2d');
		context.fillStyle="#7F7F7F";
		context.fillRect(0,0,canvasobj.width,canvasobj.height);
		context.fillStyle="black";
		context.fillRect(0,0,canvasobj.width,60);
	}
	function renderReward(){
		var canvasobj=document.getElementById("canvas"+canvas.reward);
		var context=canvasobj.getContext('2d');
		context.fillStyle="green";
		context.fillRect(xgridcent[4]-200,ygridcent[4]-200,400,400);
		if (env.species == 'marmoset'){
			context.fillStyle="black";
			context.fillRect(0,0,canvasobj.width,100);
		}
	}
	function renderPhotoReward(){
		var canvasobj=document.getElementById("canvas"+canvas.photoreward);
		var context=canvasobj.getContext('2d');
		context.fillStyle="green";
		context.fillRect(xgridcent[4]-200,ygridcent[4]-200,400,400);
		if (env.species == 'marmoset'){
			context.fillStyle="white";
			context.fillRect(0,0,canvasobj.width,100);
		}
	}
	function renderPunish(){
		var canvasobj=document.getElementById("canvas"+canvas.punish);
		var context=canvasobj.getContext('2d');
		context.rect(xgridcent[4]-200,ygridcent[4]-200,400,400);
		context.fillStyle="black";
		context.fill();
		context.fillStyle="black";
		context.fillRect(0,0,canvasobj.width,60);
	}
	function renderTouchFixation(){
		var canvasobj=document.getElementById("canvas"+canvas.touchfix);
		var context=canvasobj.getContext('2d');
		context.clearRect(0,0,canvasobj.width,canvasobj.height);
		var rad = trial.fixationradius;
		var xcent = xgridcent[trial.fixationgrid[trial.current]];
		var ycent = ygridcent[trial.fixationgrid[trial.current]];
		context.beginPath();
		context.arc(xcent,ycent,rad,0*Math.PI,2*Math.PI);
		if (env.species == "macaque" || env.species == "human"){
			context.fillStyle="white";
		}
		else if (env.species == "marmoset"){
			context.fillStyle="blue";
		}
		context.fill();
		boundingBoxFixation.x = [xcent-rad+canvas.offsetleft, xcent+rad+canvas.offsetleft];
		boundingBoxFixation.y = [ycent-rad+canvas.offsettop, ycent+rad+canvas.offsettop];
		// //add eye fixation
		// context.fillStyle="red";
		// context.fillRect(xgridcent[4]-6,ygridcent[4]-6,12,12);
		// // add red dot in center
		// context.fillStyle="red";
		// context.fillRect(xgridcent[trial.fixationgrid[trial.current]]+rad/2-6,xgridcent[trial.fixationgrid[trial.current]]-rad/2-6,12,12);
		context.fillStyle="black";
		context.fillRect(0,0,canvasobj.width,40);
	}
	function renderEyeFixation(){
		var canvasobj=document.getElementById("canvas"+canvas.eyefix);
		var context=canvasobj.getContext('2d');
		context.fillStyle="red";
		context.fillRect(xgridcent[4]-6,ygridcent[4]-6,12,12);
	}
//================== IMAGE RENDERING (end) ==================//
//================== PROMISE STATES ==================//
	// Promise: Select Subject
	function subjidPromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User selected ' + resolveval)});
		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}
	function subjectlist_listener(event){
		console.log("subject selected");
		trial.subjid = subjectlist[this.value];
		subjectdialog.close();
		waitforClick.next(1);
		return
	}
	// Promise: Edit Parameters Text
	function editParamsPromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User is done editing params')});
		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}
	function doneEditing_listener(event){
		console.log("Done editing params")
		waitforClick.next(1);
		return
	}
	function headsuptext_listener(event){
		trial.need2writeParameters = 1
		return
	}
	function doneTesting_listener(event){
		console.log("User is done testing. Start saving data");
		trial.savedata=1
		trial.purge=1
		document.querySelector("button[name=doneTesting]").style.display = "none"
		return
	}
	// Promise: fixation
	function fixationPromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){
			//console.log('Fixation Promise resolved' + resolveval)
		});
		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				console.log('moved generator forward')
				resolveFunc(imclicked);
			}
		}
		trial.waitingforFixation = 1;
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		//Start timer
		movefixationTimer = setTimeout(function(){trial.waitingforFixation=1; trial.brokeFixation=1; clearTimeout(fixationTimer); waitforClick.next(1); },trial.fixationinterval);
		return p;
	}
	// Promise: response
	function responsePromise(){
		var resolveFunc
		var errFunc
		p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then(function(resolveval){console.log('User clicked ' + resolveval)});
		function *waitforclickGenerator(){
			var imclicked =[-1];
			while (true){
				imclicked = yield imclicked;
				resolveFunc(imclicked);
			}
		}
		trial.waitingforResponse = 1;
		waitforClick = waitforclickGenerator(); // start async function
		waitforClick.next(); //move out of default state
		return p;
	}
	//Asynch: play sound
	function playSound(idx){
		audiocontext.resume()
		var source = audiocontext.createBufferSource(); // creates a sound source
		source.buffer = sounds.buffer[idx];                    // tell the source which sound to play
		if (idx==0){
			gainNode.gain.value=0.15; //set boost pedal to 15% volume
		}
		else if (idx==2 | idx==3){
			gainNode.gain.value=0.05; //set boost pedal to 5% volume
		}
		source.connect(gainNode);
		// gainNode.connect(audiocontext.destination); //Connect boost pedal to output
		// source.connect(audiocontext.destination);       // connect the source to the context's destination (the speakers)
		source.start(0);                        // play the source now
	}
	// Promise: dispense reward (through audio control)
	function dispenseReward(){
		return new Promise(function(resolve,reject){
			audiocontext.resume()
			var oscillator = audiocontext.createOscillator();
			gainNode.gain.value=1;
			if (env.pump == 1){
				oscillator.type='square'; //Square wave
				oscillator.frequency.value=25; //frequency in hertz				
			} //peristaltic (adafruit)
			else if (env.pump==2){
				oscillator.type='square'; //Square wave
				oscillator.frequency.value=0.1; //frequency in hertz
			} //submersible (TCS)
			else if (env.pump==3){
				oscillator.type='square'; //Square wave
				oscillator.frequency.value=10; //frequency in hertz		
			} //diaphragm (TCS)
			else if (env.pump==4){
				oscillator.type='square'; //Square wave
				oscillator.frequency.value=0.1; //frequency in hertz				
			} //piezoelectric (takasago)
			else if (env.pump==5){
				oscillator.type='square';
				oscillator.frequency.value=0.1;
			} //diaphragm new (TCS)
			else if (env.pump==6){
				oscillator.type='square'; //Square wave
				oscillator.frequency.value=0.1; //frequency in hertz				
			} //piezoelectric 7ml/min (takasago)
			// oscillator.connect(audiocontext.destination); //Connect sound to output
			// //var gainNode = audiocontext.createGainNode(); //Create boost pedal
			// //gainNode.gain.value=0.3; //set boost pedal to 30% volume
			oscillator.connect(gainNode);
			// //gainNode.connect(audiocontext.destination); //Connect boost pedal to output
			// // oscillator.onended=function(){
			// // 	console.log('done with reward pulse');
			// // 	resolve(1);
			// // }
			var currentTime=audiocontext.currentTime;


			oscillator.start(currentTime);
			oscillator.stop(currentTime + trial.reward);
			setTimeout(function(){console.log('sound done'); resolve(1);},trial.reward*1000);
		}).then();
	}
	// Promise: punish time-out
	function dispensePunish(){
		return new Promise(function(resolve,reject){
			setTimeout(function(){resolve(1);},trial.punish); //milliseconds
		}).then();
	}
//================== PROMISE STATES (end) ==================//
//================== MOUSE & TOUCH EVENTS ==================//
	function mousedown_listener(event){
		if(typeof event === 'undefined'){
			console.log('no click, loading images, initializing response promise');
			return
		};
		var x = event.clientX
		var y = event.clientY
		if (y < canvas.offsettop){
			//clicked on headsup display
			if (videoobj.style.zIndex != 100){
				if (trial.takephoto == 0){
					videoobj.play();
				}
				videoobj.style.zIndex = 100;
			}
			else if (videoobj.style.zIndex != 0){
				if (trial.takephoto == 0){
					videoobj.pause();
				}
				videoobj.style.zIndex = 0;
			}
		}
		if (trial.waitingforFixation == 1){
			//determine if clicked on fixation dot
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				trial.brokeFixation = 0;
				trial.xytfixation[trial.current]=[x,y,Math.round(performance.now())];
				//Start timer
				fixationTimer = setTimeout(function(){ trial.waitingforFixation=0;clearTimeout(movefixationTimer); waitforClick.next(1);},trial.fixationdur);
			} //if clicked fixation
			else{
			}
		}
		if (trial.waitingforResponse == 1){
			//determine if clicked in test box
			for (var q=0; q<=boundingBoxesTest.x.length-1; q++){
				if (x >= boundingBoxesTest.x[q][0] && x <= boundingBoxesTest.x[q][1] &&
					y >= boundingBoxesTest.y[q][0] && y <= boundingBoxesTest.y[q][1]){
					trial.response[trial.current]=q;
					trial.xytresponse[trial.current]=[x,y,Math.round(performance.now())];
					waitforClick.next(q);
					return
				}
			}
		}
	}
	function mousemove_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation==0){
			var x = event.clientX
			var y = event.clientY
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				//holding fixation
			}
			else{
				// moved from fixation dot, cancel fixation timers
				trial.brokeFixation = 1;
				clearTimeout(fixationTimer);
			}
		}
	}
	function mouseup_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation == 0){
			// broke touch with fixation dot too early, cancel fixation timers
			trial.brokeFixation = 1;
			clearTimeout(fixationTimer);
		}
	}
	function touchstart_listener(event){
		event.preventDefault(); //prevents additional downstream call of click listener
		if(typeof event === 'undefined'){
			console.log('no click, loading images, initializing responsepromise');
			return
		};
		var x = event.targetTouches[0].pageX;
		var y = event.targetTouches[0].pageY;
		if (y < canvas.offsettop){
			//clicked on headsup display
			if (videoobj.style.zIndex != 100){
				if (trial.takephoto == 0){
					videoobj.play();
				}
				videoobj.style.zIndex = 100;
			}
			else if (videoobj.style.zIndex != 0){
				if (trial.takephoto == 0){
					videoobj.pause();
				}
				videoobj.style.zIndex = 0;
			}
		}
		if (trial.waitingforFixation == 1){
			//determine if clicked on fixation dot
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				trial.brokeFixation = 0;
				trial.xytfixation[trial.current]=[x,y,Math.round(performance.now())];
				//Start timer
				fixationTimer = setTimeout(function(){console.log('started fixation timer');trial.waitingforFixation=0;clearTimeout(movefixationTimer); waitforClick.next(1);},trial.fixationdur);
			} //if clicked fixation
			else{
				if (trial.rewardStage == 0){
					console.log('clicked outside fixation');
					trial.xytfixation[trial.current]=[x,y,Math.round(performance.now())];
					trial.waitingforFixation=0;
					trial.brokeFixation = 1;
					clearTimeout(movefixationTimer);
					clearTimeout(fixationTimer);
					waitforClick.next(0);
				} //advance to punish for clicking outside fixation
			}
		}
		if (trial.waitingforResponse == 1){
			//determine if clicked in test box
			for (var q=0; q<=boundingBoxesTest.x.length-1; q++){
				if (x >= boundingBoxesTest.x[q][0] && x <= boundingBoxesTest.x[q][1] &&
					y >= boundingBoxesTest.y[q][0] && y <= boundingBoxesTest.y[q][1]){
					trial.response[trial.current]=q;
					trial.xytresponse[trial.current]=[x,y,Math.round(performance.now())];
					waitforClick.next(q);
					return
				}
			}
		}
	}
	function touchmove_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation==0){
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				//holding fixation
			}
			else{
				// moved from fixation dot, cancel fixation timers
				trial.brokeFixation = 1;
				console.log('was fixating but moved out');
				clearTimeout(fixationTimer);
			}
		}
		else if (trial.waitingforFixation==1 && trial.brokeFixation==1){
			//check if moved back into fixation
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;
			if ( x >= boundingBoxFixation.x[0] && x <= boundingBoxFixation.x[1] &&
				 y >= boundingBoxFixation.y[0] && y <= boundingBoxFixation.y[1]){
				//gained fixation
				trial.brokeFixation = 0;
				touchstart_listener(event);
			}
		}
		//Allows dragging into response box
		if (trial.waitingforResponse == 1){
			var x = event.targetTouches[0].pageX;
			var y = event.targetTouches[0].pageY;
			//determine if moved into a test box
			for (var q=0; q<=boundingBoxesTest.x.length-1; q++){
				if (x >= boundingBoxesTest.x[q][0] && x <= boundingBoxesTest.x[q][1] &&
					y >= boundingBoxesTest.y[q][0] && y <= boundingBoxesTest.y[q][1]){
					trial.response[trial.current]=q;
					trial.xytresponse[trial.current]=[x,y,Math.round(performance.now())];
					waitforClick.next(q);
					return
				}
			}
		}
	}
	function touchend_listener(event){
		if (trial.waitingforFixation==1 && trial.brokeFixation == 0){
			// broke touch with fixation dot too early, cancel fixation timers
			trial.brokeFixation = 1;
			console.log('was fixating but lifted finger');
			clearTimeout(fixationTimer);
		}
	}
//================== MOUSE & TOUCH EVENTS (end) ==================//
//================== UTILITIES ==================//
	/* Randomize array element order in-place.  Using Fisher-Yates shuffle algorithm. http://bost.ocks.org/mike/shuffle/ */
	// To test your shuffling algorithm: go to http://bost.ocks.org/mike/shuffle/compare.html
	function shuffleArray(array){
		// Expand to index vector if needed
		if (array.length==1){
			var len=array[0];
			for (var i = 0; i<=len-1; i++){array[i]=i;}
		}
	    for (var i = array.length - 1; i > 0; i--) {
	        var j = Math.floor(Math.random() * (i + 1));
	        var temp = array[i];
	        array[i] = array[j];
	        array[j] = temp;
	    }
	    return array
	}
	// convert base64 to buffer array (from: http://stackoverflow.com.80bola.com/questions/27524283/save-image-to-dropbox-with-data-from-canvas?rq=1)
	function _base64ToArrayBuffer(base64){
		base64 = base64.split('data:image/png;base64,').join('');
		var binary_string =  window.atob(base64),
		len = binary_string.length,
		bytes = new Uint8Array( len ),
		i;
		for (i = 0; i < len; i++){
			bytes[i] = binary_string.charCodeAt(i);
		}
		return bytes.buffer;
	}
//================== UTILITIES (end) ==================//

	function getTest(nway){
		//draw category then draw images from that category
		// randomly choose an image with that category (could also do a prototype)
		// Generate cat list from sample images
		var objectlist=[];
		for (var i=0; i<=imagesSample.serial.length-1; i++){
			if (objectlist.indexOf(imagesSample.obj[i]) == -1 && imagesSample.obj[i] != imagesSample.obj[trial.sample[trial.current]]){
				objectlist[objectlist.length]=imagesSample.obj[i]; //add category
			}//if
		}//for
		// Shuffle wrt categories
		if (objectlist.length > 1){
			shuffleArray(objectlist);
		}
		//Take the first nway-1 categories
		var testArrayObj=[];
		for (var i=0; i<=nway-2; i++){
			testArrayObj[i]=objectlist[i];
		}
		//Insert sample object at end position
		testArrayObj[nway-1]=imagesSample.obj[trial.sample[trial.current]];
		// Shuffle wrt array position
		var shuffleind=[];
		shuffleind[0]=nway;
		shuffleArray(shuffleind);
		var testArrayObj_shuffleItems=[];
		var correctItem = shuffleind[shuffleind.length-1];
		for (var i=0; i<=nway-1; i++){
			testArrayObj_shuffleItems[shuffleind[i]] = testArrayObj[i];
		}
		// Shuffle wrt images in a category
		var testArray=[];
		objshuffled = testArrayObj_shuffleItems;
		for (var i=0; i<=nway-1; i++){
			// Generate image list
			var imlist=[];
			for (var j=0; j<=imagesTest.serial.length-1; j++){
				if (imagesTest.obj[j] == objshuffled[i]){
					imlist[imlist.length]=j;
				}
			}
			if (imlist.length > 1){
				shuffleArray(imlist);
			}
			testArray[i]=imlist[0];
		}
		return {
				correctItem: correctItem,
				testArray: testArray
			};
	}
function setReward(){
	var m = 0;
	var b = 0;
	if (env.pump == 1){
		// m = 1.13; b = 15.04;
		m = 0.99; b = 14.78;
	} //peristaltic (adafruit)
	else if (env.pump == 2){
		// m = 3.20; b = -15.47;
		m = 1.40; b = -58.77;
	} //submersible (tcs)
	else if (env.pump == 3){
		// m = 0.80; b = -3.00;
		m=0.91; b = -15;
	} //diaphragm (tcs)
	else if (env.pump == 4){
		m = 0.0531; b=-1.2594;
	} //piezoelectric (takasago)
	else if (env.pump == 5){
		m = 2.4463; b=53.6418;
	} //new diaphragm (tcs)
	else if (env.pump == 6){
		if (env.liquid==1 || env.liquid==3){
			m=0.1251; b=-0.0833; //1=water 2=water-condensed milk 3=marshmallow slurry (4/30mL)
		}
		else if (env.liquid==2){
			m=0.0550; b=0.6951; //water-condensed milk (50/50)
		}
	} //piezoelectric 7mL/min (takasago)
	trial.reward = (trial.rewardper1000 - b)/m/1000;
}
class ScreenDisplayer{
	constructor(bounds){
		this.calibrateBounds(bounds)
		this.last_fixation_xcentroid = undefined 
		this.last_fixation_ycentroid = undefined
		this.last_fixation_diameter = undefined 
		
		this.last_eyeFixation_xcentroid = undefined
		this.last_eyeFixation_ycentroid = undefined
		this.last_eyeFixation_diameter = undefined
		this.last_eyeFixation_drawn = undefined

		this._sequence_canvases = {} // key: sequence. key: frame. value: canvas 
		this.canvas_sequences = {} // key: sequence_id
		this.time_sequences = {} // key: sequence_id

		this.canvas_blank = this.createCanvas('canvas_blank')
		this.canvas_blank.style['z-index'] = 50

		this.canvas_front = this.canvas_blank

		this.canvas_reward = this.createCanvas('canvas_reward')
		this.canvas_punish = this.createCanvas('canvas_punish')
		this.canvas_fixation = this.createCanvas('canvas_fixation', true)
		
		this.resizeTimeout = false
	}

	async build(){

		await this.renderBlank(this.canvas_blank)
		await this.renderReward(this.canvas_reward)
		await this.renderPunish(this.canvas_punish) 

	}

	calibrateBounds(bounds){
		// Called by Playspace whenever the window size changes 

		this.height = bounds['height']
		this.width = bounds['width'] 

		this.leftBound = bounds['leftBound']
		this.rightBound = bounds['rightBound']
		this.topBound = bounds['topBound']
		this.bottomBound = bounds['bottomBound']

	}   

	getSequenceCanvas(sequence_id, i_frame){
		if(this._sequence_canvases[sequence_id] == undefined){
			this._sequence_canvases[sequence_id] = []
		}
		if(this._sequence_canvases[sequence_id][i_frame] == undefined){
			this._sequence_canvases[sequence_id][i_frame] = this.createCanvas(sequence_id+'_frame'+i_frame)
		}

		return this._sequence_canvases[sequence_id][i_frame]
	}
   
	async bufferStimulusSequence(stimulusFramePackage){
		this.assetType = stimulusFramePackage['assetType']
		if (this.assetType == 'image') {
			await this._buffer_imgs(stimulusFramePackage)
		} else if (this.assetType == 'video') {
			await this._buffer_vids(stimulusFramePackage)
		} else {
			console.log('Type load ' + this.assetType + 'not yet implemented')
		}
	}

	async _buffer_imgs(stimulusFramePackage) {
		this.loopVid = false
		var sampleImage = stimulusFramePackage['sampleAsset']
		var sampleDiameterPixels = stimulusFramePackage['sampleDiameterPixels'] 
		var sampleXCentroid = stimulusFramePackage['sampleXCentroid'] 
		var sampleYCentroid = stimulusFramePackage['sampleYCentroid']

		var choiceImage = stimulusFramePackage['choiceAsset'] 
		var choiceDiameterPixels = stimulusFramePackage['choiceDiameterPixels'] 
		var choiceXCentroid = stimulusFramePackage['choiceXCentroid'] 
		var choiceYCentroid = stimulusFramePackage['choiceYCentroid']

		var sampleOn = stimulusFramePackage['sampleOn'] 
		var sampleOff = stimulusFramePackage['sampleOff'] 
		
		var frame_canvases = []
		var frame_durations = []
		// Draw sample screen
		var sampleCanvas = this.getSequenceCanvas('stimulus_sequence', 0)
		await this.renderBlank(sampleCanvas) // todo: only do this on window resize
		await this.drawImagesOnCanvas(sampleImage, sampleXCentroid, sampleYCentroid, sampleDiameterPixels, sampleCanvas)
		
		frame_canvases.push(sampleCanvas)
		frame_durations.push(sampleOn)

		// Optionally draw blank delay screen
		if(sampleOff > 0){
			var delayCanvas = this.getSequenceCanvas('stimulus_sequence', 1)
			await this.renderBlank(delayCanvas) // todo: only do this on window resize
			delayCanvas = await this.renderBlank(blankCanvas)
			frame_canvases.push(delayCanvas)
			frame_durations.push(sampleOff)
		}

		// Draw test screen
		var testCanvas = this.getSequenceCanvas('stimulus_sequence', frame_canvases.length)
		this.test_dims = []
		await this.renderBlank(testCanvas) // todo: only do this on window resize
		await this.drawImagesOnCanvas(choiceImage, choiceXCentroid, choiceYCentroid, choiceDiameterPixels, testCanvas)

		frame_canvases.push(testCanvas)
		frame_durations.push(0)

		this.canvas_sequences['stimulus_sequence'] = frame_canvases
		this.time_sequences['stimulus_sequence'] = frame_durations
	}

	async _buffer_vids(stimulusFramePackage) {
		this.loopVid = stimulusFramePackage['loopVid']
		this.vidStartOffset = 0.5
		this.sample_vid = stimulusFramePackage['sampleAsset']
		var sampleDiameterPixels = stimulusFramePackage['sampleDiameterPixels'] 
		var sampleXCentroid = stimulusFramePackage['sampleXCentroid'] 
		var sampleYCentroid = stimulusFramePackage['sampleYCentroid']

		this.choice_vid = stimulusFramePackage['choiceAsset'] 
		var choiceDiameterPixels = stimulusFramePackage['choiceDiameterPixels'] 
		var choiceXCentroid = stimulusFramePackage['choiceXCentroid'] 
		var choiceYCentroid = stimulusFramePackage['choiceYCentroid']

		var sampleOn = stimulusFramePackage['sampleOn'] 
		var sampleOff = stimulusFramePackage['sampleOff'] 
		
		var frame_canvases = []
		var frame_durations = []
		// Draw sample screen
		var sampleCanvas = this.getSequenceCanvas('stimulus_sequence', 0)
		await this.renderBlank(sampleCanvas) // todo: only do this on window resize

		this.sample_dims = await this._get_draw_dims(this.sample_vid, sampleXCentroid, sampleYCentroid, sampleDiameterPixels)
		// this.sample_vid.load()

		frame_canvases.push(sampleCanvas)
		frame_durations.push(sampleOn)

		// Optionally draw blank delay screen
		if(sampleOff > 0){
			var delayCanvas = this.getSequenceCanvas('stimulus_sequence', 1)
			await this.renderBlank(delayCanvas) // todo: only do this on window resize
			delayCanvas = await this.renderBlank(blankCanvas)
			frame_canvases.push(delayCanvas)
			frame_durations.push(sampleOff)
		}

		// Draw test screen
		var testCanvas = this.getSequenceCanvas('stimulus_sequence', frame_canvases.length)
		this.test_dims = []
		await this.renderBlank(testCanvas) // todo: only do this on window resize

		for (var i_vid = 0; i_vid<this.choice_vid.length; i_vid++) {
			this.test_dims.push(
					await this._get_draw_dims(this.choice_vid[i_vid], choiceXCentroid[i_vid], choiceYCentroid[i_vid], choiceDiameterPixels[i_vid])
				)
			// this.choice_vid[i_vid].load()
		}

		frame_canvases.push(testCanvas)
		frame_durations.push(0)

		this.canvas_sequences['stimulus_sequence'] = frame_canvases
		this.time_sequences['stimulus_sequence'] = frame_durations
	}

	async drawImagesOnCanvas(images, 
		xcentroids_pixels, 
		ycentroids_pixels,
		diameter_pixels,
		canvasobj){

		if(images.constructor == Array){
			// Iterate over the images in this frame and draw them all
			for (var i_image = 0; i_image<images.length; i_image++){

				await this._drawImage(
					images[i_image], 
					xcentroids_pixels[i_image], 
					ycentroids_pixels[i_image], 
					diameter_pixels[i_image], 
					canvasobj)
			}
		}

		else{
			await this._drawImage(images, xcentroids_pixels, 
				ycentroids_pixels,
				diameter_pixels,
				canvasobj)
		}
	}

	async _drawImage(image, xcentroid_pixel, ycentroid_pixel, diameter_pixels, canvasobj){

		// Special cases for 'image'
		if(image == 'dot'){
			await this.drawDot(xcentroid_pixel, ycentroid_pixel, diameter_pixels, 'white', canvasobj)
			return
		}
		if(image == 'blank'){
			await this.renderBlank(canvasobj)
			return
		}
		var nativeWidth = image.naturalWidth 
		var nativeHeight = image.naturalHeight

		if (nativeHeight > nativeWidth){
			var drawHeight = diameter_pixels
			var drawWidth = diameter_pixels * nativeWidth / nativeHeight
		}
		else{
			var drawWidth = diameter_pixels 
			var drawHeight = diameter_pixels * nativeHeight / nativeWidth
		}

		// in units of window
		var original_left_start = xcentroid_pixel - diameter_pixels/2 // in virtual pixel coordinates
		var original_top_start = ycentroid_pixel - diameter_pixels/2

		var context = canvasobj.getContext('2d')
		await context.drawImage(image, original_left_start, original_top_start, drawWidth, drawHeight)
		return 
	}

	async _get_draw_dims(vid, xcentroid_pixel, ycentroid_pixel, diameter_pixels) {
		var nativeWidth = vid.videoWidth 
		var nativeHeight = vid.videoHeight

		if (nativeHeight > nativeWidth){
			var drawHeight = diameter_pixels
			var drawWidth = diameter_pixels * nativeWidth / nativeHeight
		}
		else{
			var drawWidth = diameter_pixels 
			var drawHeight = diameter_pixels * nativeHeight / nativeWidth
		}

		// in units of window
		var original_left_start = xcentroid_pixel - diameter_pixels/2 // in virtual pixel coordinates
		var original_top_start = ycentroid_pixel - diameter_pixels/2

		return [original_left_start, original_top_start, drawWidth, drawHeight]
	}

	 
	async bufferFixation(fixationFramePackage){

		var xcentroid_pixel = fixationFramePackage['fixationXCentroidPixels'] 
		var ycentroid_pixel = fixationFramePackage['fixationYCentroidPixels']
		var fixationDiameter_pixels = fixationFramePackage['fixationDiameterPixels'] 
		// input arguments in playspace units 

		// Clear canvas if different 
		if (this.last_fixation_xcentroid == xcentroid_pixel 
			&& this.last_fixation_ycentroid == ycentroid_pixel
			&& this.last_fixation_diameter == fixationDiameter_pixels
			&& this.last_eyeFixation_xcentroid == fixationFramePackage['eyeFixationXCentroidPixels']
			&& this.last_eyeFixation_ycentroid == fixationFramePackage['eyeFixationYCentroidPixels']
			&& this.last_eyeFixation_diameter == fixationFramePackage['eyeFixationDiameterPixels']
			&& this.last_eyeFixation_drawn == fixationFramePackage['drawEyeFixationDot']
			){
			// TODO also check for changes to eye fixation
			return 
		}

		await this.renderBlank(this.canvas_fixation)

		// Draw touch initiation dot
		await this.drawDot(
						xcentroid_pixel, 
						ycentroid_pixel, 
						fixationDiameter_pixels, 
						'white', 
						this.canvas_fixation)

		// Draw eye fixation dot 
		if(fixationFramePackage['drawEyeFixationDot'] == true){
			await this.drawDot(
								fixationFramePackage['eyeFixationXCentroidPixels'], 
								fixationFramePackage['eyeFixationYCentroidPixels'], 
								fixationFramePackage['eyeFixationDiameterPixels'], 
								'#2d2d2d', 
								this.canvas_fixation
							)
		} 
	   

		this.last_fixation_xcentroid = xcentroid_pixel
		this.last_fixation_ycentroid = ycentroid_pixel
		this.last_fixation_diameter = fixationDiameter_pixels
		this.last_eyeFixation_xcentroid = fixationFramePackage['eyeFixationXCentroidPixels']
		this.last_eyeFixation_ycentroid = fixationFramePackage['eyeFixationYCentroidPixels']
		this.last_eyeFixation_diameter = fixationFramePackage['eyeFixationDiameterPixels']
		this.last_eyeFixation_drawn = fixationFramePackage['drawEyeFixationDot']
	}

	async drawText(textString, fontSize, color, xcentroid_pixel, ycentroid_pixel, canvasobj){
		var context = canvasobj.getContext('2d')
		fontSize = fontSize || 8
		color = color || 'black'
		context.font = fontSize+"px Arial"
		context.fillStyle = color
		context.fillText(textString, xcentroid_pixel, ycentroid_pixel)
		context.fill()

	}

	async drawDot(xcentroid_pixel, ycentroid_pixel, diameter_pixel, color, canvasobj){
		var context=canvasobj.getContext('2d');

		context.beginPath();
		context.arc(xcentroid_pixel,ycentroid_pixel,diameter_pixel/2,0*Math.PI,2*Math.PI);
		context.fillStyle=color; 
		context.fill();
	}


	renderBlank(canvasobj){
		var resolveFunc
		var errFunc
		var p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		})

		if (canvasobj.constructor != Array){
			canvasobj = [canvasobj]
		}

		for (var i in canvasobj){
			var i_canvasobj = canvasobj[i]
			var context=i_canvasobj.getContext('2d');
			context.fillStyle="#7F7F7F";
			var width = parseFloat(i_canvasobj.style.width)
			var height = parseFloat(i_canvasobj.style.height)

			context.fillRect(0,0,width,height);
			context.fill()
			if ( (i+1) == canvasobj.length)
				resolveFunc()
		}

		return p	
	}

	async displayFixation(){
		var timestamps = await this.displayScreenSequence(this.canvas_fixation, 0)
		return timestamps[0]
	}

	async displayBlank(){
		await this.displayScreenSequence(this.canvas_blank, 0)
	}

	async displayStimulusSequence(){
		if (this.assetType == 'image') {
			var timestamps = await this.displayScreenSequence(
				this.canvas_sequences['stimulus_sequence'], 
				this.time_sequences['stimulus_sequence'])
		} else if (this.assetType == 'video') {
			var timestamps = await this.displayVidSequence(this.canvas_sequences['stimulus_sequence'])
		}
		return timestamps
	}


	async displayReward(msec_duration){
		var timestamps = await this.displayScreenSequence([this.canvas_blank, this.canvas_reward, this.canvas_blank],
			[0, msec_duration, 0])
		return timestamps
	}

	async displayPunish(msec_duration){
		var timestamps = await this.displayScreenSequence([this.canvas_blank, this.canvas_punish, this.canvas_blank],
			[0, msec_duration, 0])
		return timestamps
	}

	displayVidSequence(sequence){		
		var resolveFunc
		var errFunc
		var p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		})

		var lastframe_timestamp = undefined;
		var frame_unix_timestamps = []

		var prev_canvasobj = this.canvas_front

		var current_frame_index = -1
		var frames_left_to_animate = sequence.length

		var _this = this
		var sample_video_duration = this.sample_vid.duration 
		var fps = 30                                            // 30 fps videos
		var num_frames = sample_video_duration * fps
		sample_video_duration = sample_video_duration * 1000    // ms

		prev_canvasobj.style.zIndex="0";
		sequence[1].style.zIndex="0";
		sequence[0].style.zIndex="100";
		prev_canvasobj = sequence[0];

		var ctx_sample = sequence[0].getContext('2d')
		var ctx_test = sequence[1].getContext('2d')

		this.sample_vid.addEventListener('play', function() {
			_this._playback(_this.sample_vid, _this.sample_dims, ctx_sample, sample_video_duration, num_frames);
		}, {once: true})

		this.sample_vid.addEventListener("ended", (e) => {
			frame_unix_timestamps[0] = performance.now()
			prev_canvasobj.style.zIndex='0'
			sequence[1].style.zIndex="100";
			// reset canvas:
			_this.renderBlank(sequence[0])
			// make sure that the current time of the video is set to the beginning
			_this.choice_vid[0].currentTime = _this.vidStartOffset
			_this.choice_vid[1].currentTime = _this.vidStartOffset

			_this.choice_vid[0].play()
			_this.choice_vid[1].play()
		}, {once: true});

		this.choice_vid[0].addEventListener('play', function() {
			_this.canvas_front = sequence[1]
			_this._playback(_this.choice_vid, _this.test_dims, ctx_test, sample_video_duration, num_frames);
		}, {once: true})

		this.choice_vid[0].addEventListener("ended", (e) => {
			frame_unix_timestamps[1] = performance.now()

			if(!_this.choice_vid[1].ended) {
				_this.choice_vid[1].pause()
				_this.choice_vid[1].currentTime = _this.vidStartOffset
			}

			resolveFunc(frame_unix_timestamps)
		}, {once: true});

		this.sample_vid.play()
		return p
	}

	_playback(video, dims, context, duration, num_frames) {
		var resolveFunc
		var errFunc
		var p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		})

		if (video.constructor !== Array) {
			video = [video]
			dims = [dims]
		}
		var frames_drawn = 0
		var last_frame = -1
		var start = null

		function step(timestamp) {
			if (!start) start = timestamp
			var progress = timestamp - start
			var delta = progress / duration
			var current_frame = Math.floor(num_frames * delta)
			if (progress < duration || frames_drawn <= num_frames) {
				if (current_frame !== last_frame) {
					for (var i = 0; i < video.length; i++) {
						context.drawImage(video[i], dims[i][0], dims[i][1], dims[i][2], dims[i][3])
					}
					last_frame = current_frame
					frames_drawn++
				}
				window.requestAnimationFrame(step)
			} else {
				resolveFunc()
			}
		}
		window.requestAnimationFrame(step);
		return p
	}

	async loopStimulus() {
		var choiceCanvas = this.getSequenceCanvas('stimulus_sequence', 1)
		//
		if(this.loopVid) {
			var ctx_test = choiceCanvas.getContext('2d')
			while (choiceCanvas.style.zIndex == '100') {
				this.choice_vid[0].currentTime = this.vidStartOffset
				this.choice_vid[1].currentTime = this.vidStartOffset
				this.choice_vid[0].play()
				this.choice_vid[1].play()
				await this._playback(this.choice_vid, this.test_dims, ctx_test, 2500, 75)
				for (var i = 0; i < this.choice_vid.length; i++) {
					if(!this.choice_vid[i].ended) {
						this.choice_vid[i].pause()	
					}
				}
			}
			await this.renderBlank(choiceCanvas)
		}
	}

	async stopChoiceStimulusSequence() {
		for (var vidID = 0; vidID < this.choice_vid.length; vidID++) {
			if(!this.choice_vid[vidID].ended) {
				this.choice_vid[vidID].pause()	
			}
			this.choice_vid[vidID].currentTime = this.vidStartOffset
		}
		var choiceCanvas = this.getSequenceCanvas('stimulus_sequence', 1)
		choiceCanvas.style.zIndex = "0";
		await this.renderBlank(choiceCanvas)

	}

	togglePlayspaceBorder(on_or_off){
		// Turns on / off the dotted border
		if(on_or_off == 1){
			var bs = '1px dotted #E6E6E6' // border style 
		}
		else{
			var bs = '0px'
		}
		this.canvas_blank.style.border = bs
		this.canvas_reward.style.border = bs
		this.canvas_punish.style.border = bs
		this.canvas_fixation.style.border = bs

		for (var sequence in this._sequence_canvases){
			if(this._sequence_canvases.hasOwnProperty(sequence)){
				for (var i = 0; i<this._sequence_canvases[sequence].length; i ++){
					this._sequence_canvases[sequence][i].style.border = bs
				}
			}
		}
	}


	createCanvas(canvas_id, use_image_smoothing){
		use_image_smoothing = false || use_image_smoothing
		var canvasobj = document.createElement('canvas')
		canvasobj.id = canvas_id
		this.setupCanvas(canvasobj, use_image_smoothing)
		document.body.appendChild(canvasobj)
		return canvasobj 
	}

	displayScreenSequence(sequence, t_durations){
		//console.log('calling screen sequence. t_durations', t_durations)
		if(typeof(t_durations) == "number"){
			t_durations = [t_durations]
		}
		if(sequence.constructor != Array){
			sequence = [sequence]
		}
		var resolveFunc
		var errFunc
		var p = new Promise(function(resolve,reject){
			resolveFunc = resolve;
			errFunc = reject;
		}).then();
		//console.log('seq', sequence, 'tseq', tsequence)

		var lastframe_timestamp = undefined;
		var frame_unix_timestamps = []


		var prev_canvasobj = this.canvas_front

		var current_frame_index = -1
		var frames_left_to_animate = sequence.length

		var _this = this


		function updateCanvas(timestamp){

			// If time to show new frame OR first frame, 
			if (timestamp - lastframe_timestamp >= t_durations[current_frame_index] || lastframe_timestamp == undefined){
				current_frame_index++;
				frame_unix_timestamps[current_frame_index] = performance.now() //in milliseconds, rounded to nearest hundredth of a millisecond
				// Move canvas in front
				var curr_canvasobj = sequence[current_frame_index]
				prev_canvasobj.style.zIndex="0";
				curr_canvasobj.style.zIndex="100";
				prev_canvasobj = curr_canvasobj;

				lastframe_timestamp = timestamp
				//console.log('lastframe_timestamp', lastframe_timestamp)
				frames_left_to_animate--
				
			}; 
			// continue if not all frames shown
			if (frames_left_to_animate>0){
				window.requestAnimationFrame(updateCanvas);
			}
			else{
				_this.canvas_front = curr_canvasobj
				resolveFunc(frame_unix_timestamps);
			}
		}

		//requestAnimationFrame advantages: goes on next screen refresh and syncs to browsers refresh rate on separate clock (not js clock)
		window.requestAnimationFrame(updateCanvas); // kick off async work
		return p
	} 


	drawRectangle(canvasobj, width_pixels, height_pixels, color, alpha){
		var context=canvasobj.getContext('2d');
		context.fillStyle=color 
		context.globalAlpha = alpha
		var width = parseFloat(canvasobj.style.width)
		var height = parseFloat(canvasobj.style.height)

		var square_width = width_pixels
		var square_height = height_pixels
		context.fillRect(width/2 - square_width/2,height/2 - square_width/2, square_width,square_height);

		context.fill()
	}

	renderReward(canvasobj){
		var rewardColor =  "#00cc00"
		var rewardAlpha = 0.5
		var width_pixels = this.width * 2/3
		var height_pixels = this.height * 2/3 
		this.drawRectangle(canvasobj, width_pixels, height_pixels, rewardColor, rewardAlpha)
	}

	renderPunish(canvasobj){

		var punishColor = 'black'
		var punishAlpha = 1
		
		var width_pixels = this.width * 2/3
		var height_pixels = this.height* 2/3 

		this.drawRectangle(canvasobj, width_pixels, height_pixels, punishColor, punishAlpha)
	}


	async bufferCanvasWithImage(image, canvasobj, dx, dy, dwidth, dheight){
		// In playspace units
		var context = canvasobj.getContext('2d')
		context.fillStyle="#7F7F7F"; 
		context.fillRect(0,0,canvasobj.width,canvasobj.height);

		context.drawImage(image, dx, dy, dwidth, dheight)

		var _boundingBox = [{}]
		_boundingBox[0].x = [dx,dx+dwidth]
		_boundingBox[0].y = [dy, dy+dheight]

		return _boundingBox
	}

	setupCanvas(canvasobj, use_image_smoothing){
		use_image_smoothing =  use_image_smoothing || false 
		var context = canvasobj.getContext('2d')

		var devicePixelRatio = window.devicePixelRatio || 1
		var backingStoreRatio = context.webkitBackingStorePixelRatio ||
		context.mozBackingStorePixelRatio ||
		context.msBackingStorePixelRatioproportion2pixels ||
		context.oBackingStorePixelRatio ||
		context.backingStorePixelRatio || 1 // /1 by default for chrome?

		var _ratio = devicePixelRatio / backingStoreRatio


		canvasobj.width = this.width * _ratio;
		canvasobj.height = this.height * _ratio;

		// Center canvas 
		// https://stackoverflow.com/questions/5127937/how-to-center-canvas-in-html5
		canvasobj.style.padding = 0

		canvasobj.style.margin = 'auto'
		canvasobj.style.display="block"; //visible
		canvasobj.style.position = 'absolute'
		canvasobj.style.top = 0
		canvasobj.style.bottom = 0
		canvasobj.style.left = 0  
		canvasobj.style.right = 0
		canvasobj.style.border='1px dotted #E6E6E6' 

		canvasobj.style.width=this.width+'px'; // Set browser canvas display style to be workspace_width
		canvasobj.style.height=this.height+'px';

		// Draw blank gray 
		context.fillStyle="#7F7F7F"; 
		context.fillRect(0,0,canvasobj.width,canvasobj.height);


		// Remove overflow?
		//https://www.w3schools.com/cssref/pr_pos_overflow.asp

		context.imageSmoothingEnabled = use_image_smoothing // then nearest neighbor?


		if(_ratio !== 1){
		  scaleContext(context)
		}
	}
}


function scaleContext(context){
	var devicePixelRatio = window.devicePixelRatio || 1
	var backingStoreRatio = context.webkitBackingStorePixelRatio ||
	context.mozBackingStorePixelRatio ||
	context.msBackingStorePixelRatio ||
	context.oBackingStorePixelRatio ||
	context.backingStorePixelRatio || 1 // /1 by default for chrome?
	var _ratio = devicePixelRatio / backingStoreRatio

	context.scale(_ratio, _ratio) 
}







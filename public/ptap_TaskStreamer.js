class TaskStreamerClass2{
    constructor(
        ImageBuffer, 
        taskSequence,
        imageBags, 
        ){

        this.IB = ImageBuffer
        this.imageBags = imageBags
        this.taskSequence = taskSequence 
        
        var initialState = undefined
        // Viewing information (for rendering canvases of appropriate size)
        this.TERMINAL_STATE = false 

        this.tasks = []

        for (var tkNumber = 0; tkNumber < this.taskSequence.length; tkNumber ++){
            var taskType = this.taskSequence[tkNumber]['taskType']
            if (taskType == 'SR'){
                this.tasks.push(new StimulusResponseGenerator(this.IB, this.imageBags, this.taskSequence[tkNumber], initialState))    
            }
            else if (taskType == 'MTS'){
                throw "MTS not implemented yet"
                //this.tasks.push(new MTSGenerator(this.IB, this.imageBags, this.taskSequence[tkNumber], this.canvasBank))  
            }
            else if (taskType == 'StimulusTrainMTS'){
                this.tasks.push(new StimulusTrainMTSGenerator(this.IB, this.imageBags, this.taskSequence[tkNumber]))
            }
        }

        // TaskStreamer state 
        this.taskNumber = 0
    }

    async get_step(){
        var stepPackage = await this.tasks[this.taskNumber].get_step()
        this.lastStepPackage = stepPackage 

        this.lastReward = stepPackage['reward']
        this.lastStateHash = stepPackage['stateHash']
        this.lastStepNumber = stepPackage['stepNumber']
        return stepPackage
    }

    deposit_step_outcome(stepOutcomePackage){

        this.tasks[this.taskNumber].deposit_step_outcome(stepOutcomePackage)

        // Check if current generator determined that the transition criterion was met
        if(this.tasks[this.taskNumber].can_transition()){
            this.taskNumber+=1

            // Check terminal state
            if(this.taskNumber > this.taskSequence.length){
                this.TERMINAL_STATE = true
            }
        }
    }
}


class StimulusTrainMTSGenerator{
    constructor(IB, imageBags, taskParams, initialState){
        this.IB = IB // Imagebuffer
        this.imageBags = imageBags
        this.taskParams = taskParams 
        this.state = initialState 
        
        this.actionHistory = []
        this.rewardHistory = []

        this.initialize_canvases()
        
        this.AB = {} // "agent behavior"
        this.AB['trialNumberTask'] = []
        this.AB['return'] = []
        this.AB['sampleBag'] = []
        this.AB['choiceBag'] = []
        this.AB['sampleId'] = []
        this.AB['action'] = []
        this.AB['responseX'] = []
        this.AB['responseY'] = []
        this.AB['fixationX'] = []
        this.AB['fixationY'] = []
        this.AB['timestampStart'] = []
        this.AB['timestampFixationOnset'] = []
        this.AB['timestampFixationAcquired'] = []
        this.AB['timestampResponse'] = []
        this.AB['timestampReinforcementOn'] = []
        this.AB['timestampReinforcementOff'] = []
        this.AB['timestampStimulusOn'] = []
        this.AB['timestampStimulusOff'] = []
        this.AB['timestampChoiceOn'] = []
        this.AB['reactionTime'] = []
    }

    initialize_canvases(){

        // Canvases needed to run the task
        var numStimulusFrames = this.taskParams['numStimulusFrames']
        this.stimulusFrames = []
        for (var i = 0; i < numStimulusFrames; i++){
            this.stimulusFrames.push(Playspace2.get_new_canvas('frame_stimulus'+i))
            Playspace2.fill_gray(this.stimulusFrames[i])
        }


        this.canvasFixation = Playspace2.get_new_canvas('frame_fixation')
        this.canvasChoice = Playspace2.get_new_canvas('frame_choice')
        this.canvasPunish = Playspace2.get_new_canvas('frame_punish')
        this.canvasReward = Playspace2.get_new_canvas("frame_reward")

        // Fill out what you can
        Playspace2.fill_gray(this.canvasFixation)
        Playspace2.fill_gray(this.canvasChoice)
        Playspace2.draw_reward(this.canvasReward)
        Playspace2.draw_punish(this.canvasPunish)

        // Initiation button and eye fixation dot
        Playspace2.draw_circle(this.canvasFixation, 
            this.taskParams['fixationXCentroid'], 
            this.taskParams['fixationYCentroid'], 
            Playspace2.deg2propX(this.taskParams['fixationDiameterDegrees']), 'white')

        Playspace2.draw_eye_fixation_dot(this.canvasFixation, 0.5, 0.5)
    }

    can_transition(){
        return false
    }

    async deposit_step_outcome(stepOutcomePackage){
        var action = stepOutcomePackage['action']

        this.currentStepNumber+=1
        if (this.currentStepNumber > 2){ 
            this.currentStepNumber = 0 // back to fixation
        }
  
        this.actionHistory.push(action)

        // Update internal behavior

    }

    async buffer_trial(){

        // Called before fixation is presented. 

        var sampleBag = np.choice(this.taskParams['sampleBagNames'])
        var sampleId = np.choice(this.imageBags[sampleBag])
        var sampleImage = await this.IB.get_by_name(sampleId)
        Playspace2.draw_image(this.canvasStimulus, sampleImage, 0.5, 0.5, Playspace2.deg2propX(8))

        this.rewardMap = this.taskParams['rewardMap'][sampleBag]
        this.currentSampleBag = sampleBag
        this.currentSampleId = sampleId 
    }

    async get_step(){
        if (this.currentStepNumber == undefined){
            this.currentStepNumber = 0
        }

        var frameData = {}
        var actionRegions = {}
        var soundData = {}
        var reward = 0
        var actionTimeoutMsec = 0

        if (this.currentStepNumber == 0){

            await this.buffer_trial() // Buffer before presenting the fixation
            // Run fixation

            frameData['canvasSequence'] = [this.canvasFixation]
            frameData['durationSequence'] = [0]
            actionRegions['x'] = this.taskParams['fixationXCentroid']  // playspace units
            actionRegions['y'] = this.taskParams['fixationYCentroid']  // playspace units
            actionRegions['diameter'] = Playspace2.deg2propX(this.taskParams['fixationDiameterDegrees'])
            actionTimeoutMsec = undefined
            reward = 0 
        }

        else if(this.currentStepNumber == 1){
            // Run stimulus train
            frameData['canvasSequence'] = this.stimulusFrames
            frameData['canvasSequence'].push(this.frame_choice)
            
            var durSeq = np.ones(this.stimulusFrames.length) * 16.66667
            durSeq.push(0)

            frameData['durationSequence'] = durSeq
            actionRegions['x'] = this.taskParams['actionXCentroid']  // playspace units
            actionRegions['y'] = this.taskParams['actionYCentroid']  // playspace units
            actionRegions['diameter'] = Playspace2.deg2propX(this.taskParams['actionDiameterDegrees'])
            actionTimeoutMsec = 5000
            reward = 0
        }

        else if(this.currentStepNumber == 2){
            // Run reinforcement screen (based on user action)
            var reward = this.rewardMap[this.actionHistory[this.actionHistory.length-1]['actionIndex']]
            if (reward >= 1){
                // Reward screen
                frameData['canvasSequence'] = [this.canvasReward, this.canvasReward]
                frameData['durationSequence'] = [200, 0]
                actionRegions['x'] = 0
                actionRegions['y'] = 0
                actionRegions['diameter'] = 0
                actionTimeoutMsec = 0
                soundData['soundName'] = 'reward_sound'
                reward = 1
            }

            else{
                // Punish screen screen
                frameData['canvasSequence'] = [this.canvasPunish, this.canvasPunish]
                frameData['durationSequence'] = [2000, 0]
                actionRegions['x'] = 0
                actionRegions['y'] = 0
                actionRegions['diameter'] = 0
                actionTimeoutMsec = 0
                soundData['soundName'] = 'punish_sound'
                reward = 0
            }
        }

        var stepPackage = {
            'frameData':frameData, 
            'soundData':soundData,
            'actionRegions':actionRegions, 
            'actionTimeoutMsec':actionTimeoutMsec,
            'reward':reward, 
        }

        return stepPackage
    }
}



class StimulusResponseGenerator{
    constructor(IB, imageBags, taskParams, initialState){
        // taskParams: entry of TASK_SEQUENCE

        this.IB = IB // Imagebuffer
        this.imageBags = imageBags
        this.taskParams = taskParams 
        this.state = initialState 
        
        this.actionHistory = []
        this.rewardHistory = []

        this.initialize_canvases()
        
        this.AB = {} // "agent behavior"
        this.AB['trialNumberTask'] = []
        this.AB['return'] = []
        this.AB['sampleBag'] = []
        this.AB['sampleId'] = []
        this.AB['action'] = []
        this.AB['responseX'] = []
        this.AB['responseY'] = []
        this.AB['fixationX'] = []
        this.AB['fixationY'] = []
        this.AB['timestampStart'] = []
        this.AB['timestampFixationOnset'] = []
        this.AB['timestampFixationAcquired'] = []
        this.AB['timestampResponse'] = []
        this.AB['timestampReinforcementOn'] = []
        this.AB['timestampReinforcementOff'] = []
        this.AB['timestampStimulusOn'] = []
        this.AB['timestampStimulusOff'] = []
        this.AB['timestampChoiceOn'] = []
        this.AB['reactionTime'] = []

        this.stateTable = {} // stateHash to meta 
    }

    initialize_canvases(){
        // Canvases needed to run the task
        this.canvasFixation = Playspace2.get_new_canvas('SR_fixation')
        this.canvasStimulus = Playspace2.get_new_canvas('SR_stimulus')
        this.canvasDelay = Playspace2.get_new_canvas('SR_delay')
        this.canvasChoice = Playspace2.get_new_canvas('SR_choice')
        this.canvasPunish = Playspace2.get_new_canvas('SR_punish')
        this.canvasReward = Playspace2.get_new_canvas("SR_reward")

        // Fill out what you can
        Playspace2.fill_gray(this.canvasFixation)
        Playspace2.fill_gray(this.canvasStimulus)
        Playspace2.fill_gray(this.canvasDelay)
        Playspace2.fill_gray(this.canvasChoice)
        Playspace2.draw_reward(this.canvasReward)
        Playspace2.draw_punish(this.canvasPunish)

        // Initiation button and eye fixation dot
        Playspace2.draw_circle(this.canvasFixation, 
            this.taskParams['fixationXCentroid'], 
            this.taskParams['fixationYCentroid'], 
            Playspace2.deg2propX(this.taskParams['fixationDiameterDegrees']), 'white')

        Playspace2.draw_eye_fixation_dot(this.canvasFixation, 0.5, 0.5)

        // Choice screen 
        for (var a in this.taskParams['actionXCentroid']){
            Playspace2.draw_circle(this.canvasChoice, this.taskParams['choiceXCentroid'][a], 
                this.taskParams['choiceYCentroid'][a], Playspace2.deg2propX(this.taskParams['choiceDiameterDegrees'][a]), 'white')    
        }
    }

    can_transition(){
        var minTrialsCriterion = this.taskParams['minTrialsCriterion']
        var averageReturnCriterion = this.taskParams['averageReturnCriterion']

        if (minTrialsCriterion == undefined){
            return false 
        }
        if (averageReturnCriterion == undefined){
            averageReturnCriterion = 0
        }
        var nstepsPerTrial = 3 
        if(this.rewardHistory.length < minTrialsCriterion * nstepsPerTrial){
            return false
        }
        var sumReward = np.sum(this.rewardHistory.slice(-1 * minTrialsCriterion * nstepsPerTrial))
        var averageReward = sumReward / ( minTrialsCriterion * nstepsPerTrial)

        console.log(averageReward)
        if(averageReward < averageReturnCriterion / nstepsPerTrial){
            return false
        }


        return true
    }

    get_state_table(){
        // Return whatever you want (JSON-like)
        // Hopefully, with key: stateHash, value: whatever state info 
        return this.stateTable
    }

    async deposit_step_outcome(stepOutcomePackage){
        var action = stepOutcomePackage['action']

        this.currentStepNumber+=1
        if (this.currentStepNumber > 2){
            this.currentStepNumber = 0
        }
  
        this.actionHistory.push(action)

        // Update internal behavior

    }

    async buffer_trial(){

        // Called before fixation is presented. 

        var sampleBag = np.choice(this.taskParams['sampleBagNames'])
        var sampleId = np.choice(this.imageBags[sampleBag])
        var sampleImage = await this.IB.get_by_name(sampleId)
        Playspace2.draw_image(this.canvasStimulus, sampleImage, 0.5, 0.5, Playspace2.deg2propX(8))

        this.rewardMap = this.taskParams['rewardMap'][sampleBag]
        this.currentSampleBag = sampleBag
        this.currentSampleId = sampleId 
    }

    update_state_hash_table(stepNumber, reward){
        var stateHash = 'SR'
        var latentString = ''

        var stateMetaData = {} 

        if (stepNumber == 0){
            // fixation
            stateHash+='_F'

        }
        else if (stepNumber == 1){
            // stimulus and choice screen
            stateHash+='_SC'

        }
        else if (stepNumber == 2){
            // reward or punish screen 
            if (reward > 0){
                stateHash+='_R'
            }
            else{
                stateHash+='_P'
            }
        }
        
        //var hash = latentString.hashCode()
        //stateHash = stateHash + '_' + hash


        // Update hash code 

        return stateHash
    }
    async get_step(){
        if (this.currentStepNumber == undefined){
            this.currentStepNumber = 0
        }

        var frameData = {}
        var actionRegions = {}
        var soundData = {}
        var reward = 0
        var actionTimeoutMsec = 0

        var assetId = undefined 

        if (this.currentStepNumber == 0){

            await this.buffer_trial() // Buffer before presenting the fixation
            // Run fixation

            frameData['canvasSequence'] = [this.canvasFixation]
            frameData['durationSequence'] = [0]
            actionRegions['x'] = this.taskParams['fixationXCentroid']  // playspace units
            actionRegions['y'] = this.taskParams['fixationYCentroid']  // playspace units
            actionRegions['diameter'] = Playspace2.deg2propX(this.taskParams['fixationDiameterDegrees'])
            actionTimeoutMsec = undefined
            reward = 0 
            assetId = 'fixationDot'
        }
        else if(this.currentStepNumber == 1){
            // Run stimulus, (optionally) delay, and choice

            frameData['canvasSequence'] = [this.canvasStimulus, this.canvasChoice]
            frameData['durationSequence'] = [200, 0]

            actionRegions['x'] = this.taskParams['actionXCentroid']  // playspace units
            actionRegions['y'] = this.taskParams['actionYCentroid']  // playspace units
            actionRegions['diameter'] = Playspace2.deg2propX(this.taskParams['actionDiameterDegrees'])
            actionTimeoutMsec = 5000
            reward = 0
            assetId = this.currentSampleId
        }

        else if(this.currentStepNumber == 2){
            // Run reinforcement screen (based on user action)
            var reward = this.rewardMap[this.actionHistory[this.actionHistory.length-1]['actionIndex']]
            if (reward >= 1){
                // Reward screen
                frameData['canvasSequence'] = [this.canvasReward, this.canvasReward]
                frameData['durationSequence'] = [200, 0]
                actionRegions['x'] = 0
                actionRegions['y'] = 0
                actionRegions['diameter'] = 0
                actionTimeoutMsec = 0
                soundData['soundName'] = 'reward_sound'
                reward = 1
                assetId = 'rewardScreenGreen'
            }

            else{
                // Punish screen screen
                frameData['canvasSequence'] = [this.canvasPunish, this.canvasPunish]
                frameData['durationSequence'] = [2000, 0]
                actionRegions['x'] = 0
                actionRegions['y'] = 0
                actionRegions['diameter'] = 0
                actionTimeoutMsec = 0
                soundData['soundName'] = 'punish_sound'
                reward = 0
                assetId = 'punishScreenBlack'
            }
        }

        var stateHash = this.update_state_hash_table(this.currentStepNumber, reward)


        var stepPackage = {
            'frameData':frameData, 
            'soundData':soundData,
            'actionRegions':actionRegions, 
            'actionTimeoutMsec':actionTimeoutMsec,
            'reward':reward, 
            'stateHash':stateHash, 
            'assetId':assetId,
            'stepNumber':this.currentStepNumber}

        this.rewardHistory.push(reward)
        return stepPackage
    }

}




class UXclass{
    constructor(){

    }
    writeToTrialCounterDisplay(s){
        var elem = document.getElementById('TrialCounter')
        elem.innerHTML = s; // text
    }
}

class MonkeyUX extends UXclass{
    constructor(){
        super()
        toggleElement(1, "SessionTextBox")
        toggleElement(1, 'DebugMessageTextBox')
        toggleElement(1, 'TrialCounter')
        document.querySelector("button[name=doneTestingTask]").addEventListener(
        'touchend',this.doneTestingTask_listener,false)
        document.querySelector("button[name=doneTestingTask]").addEventListener(
        'mouseup',this.doneTestingTask_listener,false)

        connectBLEButtonPromise()
    }

    async poll(trialOutcome){
        this.writeToTrialCounterDisplay(trialOutcome['trialNumberSession']+1)
        return
    }

    debug2record(){
        console.log('debug2record: UX (not implemented yet)')
        toggleElement(0, "SessionTextBox")
        toggleElement(0, "DebugMessageTextBox")
        document.body.style['background-color'] = '#7F7F7F'
      
        this.writeToTrialCounterDisplay('-')

    }
    

    updateSessionTextbox(agentId, ExperimentName){
        var sess_textbox = document.getElementById("SessionTextBox")

        var line1_prefix = "<b>Subject:</b> "
        var linebreak = "<br>"
        var line2_prefix = "<b>Game:</b> "

        sess_textbox.innerHTML = line1_prefix + agentId + linebreak + line2_prefix + ExperimentName
    }

    doneTestingTask_listener(event){
        event.preventDefault()
        //console.log("User is done testing. Start saving data");
        FLAGS.debug_mode = 0

        document.querySelector("button[name=doneTestingTask]").style.display = "none"
        TaskStreamer.debug2record()
        Playspace.debug2record()
        DataWriter.debug2record()
        UX.debug2record()

        return
    }
}

class MechanicalTurkUX extends UXclass{
    constructor(minimumTrials, maximumTrials, bonusUSDPerCorrect){
        super()
        this.minimumTrials = minimumTrials // for enabling early turn-in
        this.maximumTrials = maximumTrials
        this.bonusUSDPerCorrect = bonusUSDPerCorrect
        this.bonusEarned = 0
    }

    debug2record(){
        toggleElement(1, 'MechanicalTurk_ProgressBar')
        toggleElement(1, 'MechanicalTurk_TrialBar')


        toggleElement(0, "DebugMessageTextBox")

        return
    }
    async run_instructions_dialogue(instructionsDialogueString){
        if(instructionsDialogueString != undefined){
            if (instructionsDialogueString.constructor == String){
                if(instructionsDialogueString.length > 0){
                    await this.showMechanicalTurkInstructions(instructionsDialogueString)
                    return
                }
            }
        }
        
        var screen1_instructions =  "" 
        screen1_instructions += "<ul>"
        screen1_instructions +='<p><text style="font-weight:bold; font-size:large">Thank you for your interest and contributing to research at at MIT!</text>'
        screen1_instructions += "<pi><li>Please use the latest version of <b>Google Chrome</b> to work on this HIT. It may not work correctly on other browsers."
        screen1_instructions += "<p><li>You will be presented with rapidly flashed images. <b>Your task is to figure out where to click on parts of the screen based on the information in the images.</b>"
        screen1_instructions += '<p><li>The sound of a bell means you did something right, and received a small bonus reward.'
        screen1_instructions += "<p><li>Each trial begins with a <b>WHITE DOT</b>. Click the dot to begin the trial."
        //screen1_instructions += '<p><li>When the top right button turns  <text style="font-weight:bold; color:green">GREEN</text> you can press it to submit early, though we encourage you to continue working for bonus rewards.'
        screen1_instructions += "<p><li>The HIT will submit <b>AUTOMATICALLY</b> after a certain number of trials. If the HIT freezes or does not submit, please contact us to resolve the issue and receive compensation for your time."
        
        //screen1_instructions += '<p><li>Highly productive workers may be contacted for exclusive, higher-paying HITs.' 
                screen1_instructions += '<p><text style="color:#7A7A7A; font-size:smaller; font-style:italic">If you cannot meet these requirements or if doing so could cause discomfort or injury, do not accept this HIT. You will not be penalized in any way.</text>'
        screen1_instructions += "</ul>"

        await this.showMechanicalTurkInstructions(screen1_instructions)
        
    }

    async run_hand_selection_dialogue(){
        var hand_used = await this.showHandSelectionDialogue_and_getUserSelection()
        return hand_used
    }
    async run_device_selection_dialogue(){
        var device_selected = await this.showDeviceSelectionDialogue_and_getUserSelection()
        return device_selected
    }

    async showDeviceSelectionDialogue_and_getUserSelection(){
    // Turn on dialogue
    this.MechanicalTurk_DeviceSelected = 'not_selected'
    document.getElementById("MechanicalTurkCursorDeviceSelectionScreen").style.visibility = 'visible'
    return new Promise(function(resolve, reject){
        FLAGS.clicked_device_selection = resolve
    })
    }

    async showHandSelectionDialogue_and_getUserSelection(){
        // Turn on dialogue
        this.MechanicalTurk_Handedness = 'not_selected'
        document.getElementById("MechanicalTurkHandSelectionScreen").style.visibility = 'visible'
        return new Promise(function(resolve, reject){
            FLAGS.clicked_hand_selection = resolve
        })
    }

    show_preview_splash(){
        toggleElement(1, 'PreviewModeSplash')
    }
    async showMechanicalTurkInstructions(instructions_text){
  
        document.getElementById("MechanicalTurkInstructionsSplash").style.visibility = 'visible'
        document.getElementById("InstructionSplashText").innerHTML = instructions_text


        var btn = document.getElementById('CloseInstructionsButton')
        btn.disabled = false 
        btn.innerHTML = 'Continue'

        return new Promise(function(resolve, reject){
            FLAGS.clicked_close_instructions = resolve
        })
    }

}
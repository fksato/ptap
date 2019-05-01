
import construct_landing_page as c 
reload(c)

SAVE_LOCATION = '../public/landing_pages/examples/'

def makeVideoMechanicalTurkMTS(): 

    STIMBAGS = {"stimulus_objectome_flute":["/resources/test_01.mp4", "/resources/test_02.mp4"], 
    "token_objectome_flute": ["/resources/test_token_01.mp4"], 
    "stimulus_objectome_dog": ["/resources/test_03.mp4", "/resources/test_04.mp4"], 
    "token_objectome_dog": ["/resources/test_token_02.mp4"], 
    # "stimulus_objectome_pineapple": [""]
    # "token_objectome_pineapple": [""],
    }

    GAME = {'gameId':'example_MechanicalTurk_MTS',
            "periodicRewardIntervalMsec":0,
            "periodicRewardAmount":0,
            "onFinish":"continue",
            "minimumTrials":5,
            "maximumTrials":10,
    }

    TASK_SEQUENCE = [{
                    "assetTpye":"video",
                    "taskType":"MTS", 
                    "sampleBagNames":['stimulus_objectome_dog', 'stimulus_objectome_flute'], 
                    "fixationXCentroid":0.5,
                    "fixationYCentroid":0.8,
                    "fixationDiameterDegrees":3,
                    "sampleXCentroid":0.5,
                    "sampleYCentroid":0.5,
                    "sampleDiameterDegrees":8,
                    "actionXCentroid":[0.3, 0.7], 
                    "actionYCentroid":[0.8, 0.8],
                    "actionDiameterDegrees":[6, 6],
                    "choiceXCentroid":[0.3, 0.7],
                    "choiceYCentroid":[0.8, 0.8],
                    "choiceDiameterDegrees":[4, 4],
                    "choiceMap":{"stimulus_objectome_flute":"token_objectome_flute", 
                    # "stimulus_objectome_pineapple":"token_objectome_pineapple", 
                    'stimulus_objectome_dog':"token_objectome_dog"}, 
                    "sampleOnMsec":200, 
                    "sampleOffMsec":0,
                    "choiceTimeLimitMsec":5000,
                    "punishTimeOutMsec":400,
                    "punishStreakTimeOutMultiplier":1.2,
                    "rewardTimeOutMsec":150,
                    "probabilityRepeatWhenWrong":0,
                    "averageReturnCriterion":0.8, 
                    "minTrialsCriterion":5,
                    "sampleSampleWithReplacement":False,
                    "drawEyeFixationDot":True
                    }]

    GAME_PACKAGE = {'IMAGEBAGS':IMAGEBAGS, 'GAME':GAME, 'TASK_SEQUENCE':TASK_SEQUENCE}
    ENVIRONMENT = {
                      'playspace_degreesVisualAngle':24,
                      'playspace_verticalOffsetInches':0, 
                      'playspace_viewingDistanceInches':8, 
                      'screen_virtualPixelsPerInch':143.755902965,
                      'primary_reinforcer_type':'monetary', 
                      'action_event_type':['mouseup', 'touchstart', 'touchmove'],
                      'rigEnvironment':'mechanicalturk', 
                      "bonusUSDPerCorrect":0.0005, 
                      "juiceRewardPer1000Trials":250, 
                      "instructionsDialogueString":"<ul><p><text style=\"font-weight:bold; font-size:large\">Thank you for your interest and contributing to research at at MIT!</text><pi><li>Please use the latest version of <b>Google Chrome</b> to work on this HIT. It may not work correctly on other browsers.<p><li>You will be presented with rapidly flashed images. <b>Your task is to match images with the one that was rapidly flashed (this will become clear after you try a few trials).</b><p><li>The sound of a bell means you did something right, and received a small bonus reward.<p><li>Each trial begins with a <b>WHITE DOT</b>. Click the dot to begin the trial.<p><li>The HIT will submit <b>AUTOMATICALLY</b> after a certain number of trials. If the HIT freezes or does not submit, please contact us to resolve the issue and receive compensation for your time.<p><text style=\"color:#7A7A7A; font-size:smaller; font-style:italic\">If you cannot meet these requirements or if doing so could cause discomfort or injury, do not accept this HIT. You will not be penalized in any way.</text></ul>"
                  }   

    sessionPackage = {'GAME_PACKAGE':GAME_PACKAGE, 'ENVIRONMENT':ENVIRONMENT}
    c.write_landing_page(sessionPackage, agentId = None, landingPageName = 'landingPage_test_Video_MTS.html', saveDirectoryPath = SAVE_LOCATION) 
    return 

def makeImageMechanicalTurkMTS(): 

    STIMBAGS = {"stimulus_objectome_flute":["/resources/test_01.png", "/resources/test_02.png"], 
    "token_objectome_flute": ["/resources/test_token_01.png"], 
    "stimulus_objectome_dog": ["/resources/test_03.png", "/resources/test_04.png"], 
    "token_objectome_dog": ["/resources/test_token_02.png"], 
    # "stimulus_objectome_pineapple": [""]
    # "token_objectome_pineapple": [""],
    }

    GAME = {'gameId':'example_MechanicalTurk_MTS',
            "periodicRewardIntervalMsec":0,
            "periodicRewardAmount":0,
            "onFinish":"continue",
            "minimumTrials":5,
            "maximumTrials":10,
    }

    TASK_SEQUENCE = [{
                    "assetType":"image"
                    "taskType":"MTS", 
                    "sampleBagNames":['stimulus_objectome_dog', 'stimulus_objectome_flute'], 
                    "fixationXCentroid":0.5,
                    "fixationYCentroid":0.8,
                    "fixationDiameterDegrees":3,
                    "sampleXCentroid":0.5,
                    "sampleYCentroid":0.5,
                    "sampleDiameterDegrees":8,
                    "actionXCentroid":[0.3, 0.7], 
                    "actionYCentroid":[0.8, 0.8],
                    "actionDiameterDegrees":[6, 6],
                    "choiceXCentroid":[0.3, 0.7],
                    "choiceYCentroid":[0.8, 0.8],
                    "choiceDiameterDegrees":[4, 4],
                    "choiceMap":{"stimulus_objectome_flute":"token_objectome_flute", 
                    # "stimulus_objectome_pineapple":"token_objectome_pineapple", 
                    'stimulus_objectome_dog':"token_objectome_dog"}, 
                    "sampleOnMsec":200, 
                    "sampleOffMsec":0,
                    "choiceTimeLimitMsec":5000,
                    "punishTimeOutMsec":400,
                    "punishStreakTimeOutMultiplier":1.2,
                    "rewardTimeOutMsec":150,
                    "probabilityRepeatWhenWrong":0,
                    "averageReturnCriterion":0.8, 
                    "minTrialsCriterion":5,
                    "sampleSampleWithReplacement":False,
                    "drawEyeFixationDot":True
                    }]

    GAME_PACKAGE = {'IMAGEBAGS':IMAGEBAGS, 'GAME':GAME, 'TASK_SEQUENCE':TASK_SEQUENCE}
    ENVIRONMENT = {
                      'playspace_degreesVisualAngle':24,
                      'playspace_verticalOffsetInches':0, 
                      'playspace_viewingDistanceInches':8, 
                      'screen_virtualPixelsPerInch':143.755902965,
                      'primary_reinforcer_type':'monetary', 
                      'action_event_type':['mouseup', 'touchstart', 'touchmove'],
                      'rigEnvironment':'mechanicalturk', 
                      "bonusUSDPerCorrect":0.0005, 
                      "juiceRewardPer1000Trials":250, 
                      "instructionsDialogueString":"<ul><p><text style=\"font-weight:bold; font-size:large\">Thank you for your interest and contributing to research at at MIT!</text><pi><li>Please use the latest version of <b>Google Chrome</b> to work on this HIT. It may not work correctly on other browsers.<p><li>You will be presented with rapidly flashed images. <b>Your task is to match images with the one that was rapidly flashed (this will become clear after you try a few trials).</b><p><li>The sound of a bell means you did something right, and received a small bonus reward.<p><li>Each trial begins with a <b>WHITE DOT</b>. Click the dot to begin the trial.<p><li>The HIT will submit <b>AUTOMATICALLY</b> after a certain number of trials. If the HIT freezes or does not submit, please contact us to resolve the issue and receive compensation for your time.<p><text style=\"color:#7A7A7A; font-size:smaller; font-style:italic\">If you cannot meet these requirements or if doing so could cause discomfort or injury, do not accept this HIT. You will not be penalized in any way.</text></ul>"
                  }   

    sessionPackage = {'GAME_PACKAGE':GAME_PACKAGE, 'ENVIRONMENT':ENVIRONMENT}
    c.write_landing_page(sessionPackage, agentId = None, landingPageName = 'landingPage_test_Imgae_MTS.html', saveDirectoryPath = SAVE_LOCATION) 
    return 

if __name__ == '__main__':
    makeImageMechanicalTurkMTS()
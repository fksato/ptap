# Creates landing page based on template 
import os 
import json 
import time 

LANDING_PAGE_TEMPLATE_LOCATION = '../public/landing_pages/landing_page_template.html'

assert os.path.exists(LANDING_PAGE_TEMPLATE_LOCATION)


def write_landing_page(sessionPackage, agentID = None, landingPageName = None, saveDirectoryPath = '.'): 

    # Perform cursory check of sessionPackage
    assert 'ENVIRONMENT' in sessionPackage
    assert 'GAME_PACKAGE' in sessionPackage 

    with open(LANDING_PAGE_TEMPLATE_LOCATION, 'r') as f: 
        html_string = f.read()

    sessionPackageString = json.dumps(sessionPackage)
    html_string = html_string.replace('__SESSION_PACKAGE_GOES_HERE__', sessionPackageString)

    if agentID is not None: 
        html_string = html_string.replace('__AGENTID_GOES_HERE__', agentID)

    if landingPageName is None: 
        landingPageName = 'LandingPage_'+int(time.time())+'.html'

    if not landingPageName.endswith('.html'): 
        landingPageName+='.html'


    saveLocation = os.path.join(saveDirectoryPath, landingPageName)
    saveStringToDisk(html_string, saveLocation)
    print 'Saved at %s'%saveLocation


def saveStringToDisk(string, savepath): 
    with open(savepath, 'w') as myfile:
        myfile.write(string)
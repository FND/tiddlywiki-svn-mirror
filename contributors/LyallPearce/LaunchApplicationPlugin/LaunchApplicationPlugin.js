/***
|''Name:''|LaunchApplicationPlugin|
|''Author:''|Lyall Pearce|
|''Source:''|http://www.Remotely-Helpful.com/TiddlyWiki/LaunchApplication.html|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''Version:''|1.2.0|
|''~CoreVersion:''|2.2.4|
|''Requires:''| |
|''Overrides:''| |
|''Description:''|Launch an application from within TiddlyWiki using a button|
!!!!!Usage
<<<
{{{<<LaunchApplication "buttonLabel" "tooltip" "application" ["arguments" ...]>>}}}
* buttonLabel is anything you like
* tooltip is anything you like
* application is a path to the executable
* arguments is any command line arguments the application requires.
* You must supply relative path from the location of the TiddlyWiki OR a fully qualified path
* Forward slashes works fine for Windows

eg.

{{{
<<LaunchApplication "Emacs" "Linux Emacs" "file:///usr/bin/emacs">>
}}}
<<LaunchApplication "Emacs" "Linux Emacs" "file:///usr/bin/emacs">>

{{{
<<LaunchApplication "LocalProgram" "Program relative to Tiddly html file" "localDir/bin/emacs">>
}}}
<<LaunchApplication "LocalProgram" "Program relative to Tiddly html file" "localDir/bin/emacs">>
					     
{{{
<<LaunchApplication "Open Notepad" "Text Editing" "file:///e:/Windows/notepad.exe">>
}}}
<<LaunchApplication "Open Notepad" "Text Editing" "file:///e:/Windows/notepad.exe">>

{{{
<<LaunchApplication "C Drive" "Folder" "file:///c:/">>
}}}
<<LaunchApplication "C Drive" "Folder" "file:///c:/">>


!!!!!Revision History
* 1.1.0 - leveraged some tweaks from from Bradly Meck's version (http://bradleymeck.tiddlyspot.com/#LaunchApplicationPlugin) and the example text.
* 1.2.0 - Make launching work in Linux too and use displayMessage() to give diagnostics/status info.

<<<
***/
//{{{
version.extensions.LaunchApplication = {major: 1, minor: 2, revision: 0, date: new Date(2007,07,21)};
config.macros.LaunchApplication = {};

function LaunchApplication(appToLaunch,appParams) {
    if(! appToLaunch)
	return;
    var tiddlyBaseDir = self.location.pathname.substring(0,self.location.pathname.lastIndexOf("\\")+1);
    if(!tiddlyBaseDir || tiddlyBaseDir == "") {
	tiddlyBaseDir = self.location.pathname.substring(0,self.location.pathname.lastIndexOf("/")+1);
    }
    // if Returns with a leading slash, we don't want that.
    if(tiddlyBaseDir.substring(0,1) == "/") {
	tiddlyBaseDir = tiddlyBaseDir.substring(1);
    }
    if(appToLaunch.indexOf("file:///") == 0) // windows would have C:\ as the resulting file
    {
	tiddlyBaseDir = "";
	appToLaunch = appToLaunch.substring(8);
    }

    if (config.browser.isIE) {
	// want where the tiddly is actually located, excluding tiddly html file

	var theShell = new ActiveXObject("WScript.Shell");
	if(theShell) {
            // the app name may have a directory component, need that too
	    // as we want to start with current working dir as the location
	    // of the app.
	    var appDir = appToLaunch.substring(0, appToLaunch.lastIndexOf("\\"));
	    if(! appDir || appDir == "") {
		appDir = appToLaunch.substring(0, appToLaunch.lastIndexOf("/"));
	    }
	    appParams = appParams.length > 0 ? " \""+appParams.join("\" \"")+"\"" : "";
	    try {
		theShell.CurrentDirectory = decodeURI(tiddlyBaseDir + appDir);
		var commandString = ('"' +decodeURI(tiddlyBaseDir+appToLaunch) + '" ' + appParams);
		pluginInfo.log.push(commandString);
	        theShell.run(commandString);
		} catch (e) {
		    displayMessage("LaunchApplication cannot locate/execute file '"+tiddlyBaseDir+appToLaunch+"'");
		    return;
		}
	} else {
	    displayMessage("LaunchApplication failed to create ActiveX component WScript.Shell");
	}
    } else { // Not IE
	// want where the tiddly is actually located, excluding tiddly html file
	netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
        var file = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
	try { // try linux/unix format
	    file.initWithPath(decodeURI(tiddlyBaseDir+appToLaunch));
	    } catch (e) {
	    try { // leading slash on tiddlyBaseDir
		tiddlyBaseDir="/"+tiddlyBaseDir;
		file.initWithPath(decodeURI(tiddlyBaseDir+appToLaunch));
	    } catch (e) {
		try { // try windows format
		     tiddlyBaseDir = "";
		     file.initWithPath(decodeURI(tiddlyBaseDir+appToLaunch).replace(/\//g,"\\"));
		     } catch (e) {
			displayMessage("LaunchApplication cannot locate file '"+tiddlyBaseDir+appToLaunch+"'");
			return;
		     } // try windows mode
		}; // try with leading slash in tiddlyBaseDir
	    }; // try linux/unix mode
	try {
	    if (file.isFile() && file.isExecutable()) {
		displayMessage("LaunchApplication executing '"+tiddlyBaseDir+appToLaunch+"'");
		var process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		process.run(false, appParams, appParams.length);
	    }
	    else
	    {
		displayMessage("LaunchApplication launching '"+tiddlyBaseDir+appToLaunch+"'");
		file.launch();
	    }
	 } catch (e) {
	     displayMessage("LaunchApplication cannot execute/launch file '"+tiddlyBaseDir+appToLaunch+"'");
	 }
    }
};

config.macros.LaunchApplication.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
    // 0=ButtonText, 1=toolTop, 2=AppToLaunch, 3...AppParameters
    if (params[0] && params[1] && params[2]) {
        var theButton = createTiddlyButton(place, params[0], params[1], onClickLaunchApplication);
        theButton.setAttribute("appToLaunch", params[2]);
        params.splice(0,3);
	var appParams = "";
	for (var i = 1; i <params.length; i++) {
            appParams += ' "'+params[i]+'"';
        }
        theButton.setAttribute("appParameters", appParams);
        return;
    }
}

function onClickLaunchApplication(e) {
     var theAppToLaunch = this.getAttribute("appToLaunch");
     var theAppParams = this.getAttribute("appParameters");
     LaunchApplication(theAppToLaunch,theAppParams);
 }

//}}}

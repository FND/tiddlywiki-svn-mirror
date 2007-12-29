/***
|''Name:''|LaunchApplicationPlugin|
|''Author:''|Lyall Pearce|
|''Source:''|http://www.Remotely-Helpful.com/TiddlyWiki/LaunchApplication.html|
|''License:''|[[Creative Commons Attribution-Share Alike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''Version:''|1.4.0|
|''~CoreVersion:''|2.3.0|
|''Requires:''| |
|''Overrides:''| |
|''Description:''|Launch an application from within TiddlyWiki using a button|
!!!!!Usage
<<<
{{{<<LaunchApplication "buttonLabel" "tooltip" "application" ["arguments" ...]>>}}}
{{{<<LaunchApplicationButton "buttonLabel" "tooltip" "application" ["arguments" ...]>>}}}
{{{<<LaunchApplicationLink "buttonLabel" "tooltip" "application" ["arguments" ...]>>}}}
* buttonLabel is anything you like
* tooltip is anything you like
* application is a path to the executable (which is Operating System dependant)
* arguments is any command line arguments the application requires.
* You must supply relative path from the location of the TiddlyWiki OR a fully qualified path
* Forward slashes works fine for Windows

{{{<<LaunchApplication...>>}}} functions the same as {{{<<LaunchApplicationButton...>>}}}

eg.

{{{
<<LaunchApplicationButton "Emacs" "Linux Emacs" "file:///usr/bin/emacs">>
}}}
<<LaunchApplicationButton "Emacs" "Linux Emacs" "file:///usr/bin/emacs">>

{{{
<<LaunchApplicationLink "LocalProgram" "Program relative to Tiddly html file" "localDir/bin/emacs">>
}}}
<<LaunchApplicationLink "LocalProgram" "Program relative to Tiddly html file" "localDir/bin/emacs">>
					     
{{{
<<LaunchApplicationButton "Open Notepad" "Text Editing" "file:///e:/Windows/notepad.exe">>
}}}
<<LaunchApplicationButton "Open Notepad" "Text Editing" "file:///e:/Windows/notepad.exe">>

{{{
<<LaunchApplicationLink "C Drive" "Folder" "file:///c:/">>
}}}
<<LaunchApplicationLink "C Drive" "Folder" "file:///c:/">>


!!!!!Revision History
* 1.1.0 - leveraged some tweaks from from Bradly Meck's version (http://bradleymeck.tiddlyspot.com/#LaunchApplicationPlugin) and the example text.
* 1.2.0 - Make launching work in Linux too and use displayMessage() to give diagnostics/status info.
* 1.3.0 - execute programs relative to TiddlyWiki html file plus fix to args for firefox.
* 1.3.1 - parameters to the macro are properly parsed, allowing dynamic paramters using {{{ {{javascript}} }}} notation.
* 1.4.0 - updated core version and fixed empty tooltip and added launch link capability

<<<
***/
//{{{
version.extensions.LaunchApplication = {major: 1, minor: 4, revision: 0, date: new Date(2007,12,29)};
config.macros.LaunchApplication = {};
config.macros.LaunchApplicationButton = {};
config.macros.LaunchApplicationLink = {};

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
        var launchString;
	try { // try linux/unix format
            launchString = decodeURI(tiddlyBaseDir+appToLaunch);
	    file.initWithPath(launchString);
	} catch (e) {
	    try { // leading slash on tiddlyBaseDir
                launchString = decodeURI("/"+tiddlyBaseDir+appToLaunch);
		file.initWithPath(launchString);
	    } catch (e) {
		try { // try windows format
		    launchString = decodeURI(appToLaunch).replace(/\//g,"\\");
		    file.initWithPath(launchString);
		} catch (e) {
		    try { // try windows format
			launchString = decodeURI(tiddlyBaseDir+appToLaunch).replace(/\//g,"\\");
			file.initWithPath(launchString);
		    } catch (e) {
			displayMessage("LaunchApplication cannot locate file '"+launchString+"' : "+e);
			return;
		    } // try windows mode
		} // try windows mode
	    }; // try with leading slash in tiddlyBaseDir
	}; // try linux/unix mode
	try {
	    if (file.isFile() && file.isExecutable()) {
		displayMessage("LaunchApplication executing '"+launchString+"' "+appParams.join(" "));
		var process = Components.classes['@mozilla.org/process/util;1'].createInstance(Components.interfaces.nsIProcess);
		process.init(file);
		process.run(false, appParams, appParams.length);
	    }
	    else
	    {
		displayMessage("LaunchApplication launching '"+launchString+"' "+appParams.join(" "));
		file.launch(); // No args available with this option
	    }
	} catch (e) {
	    displayMessage("LaunchApplication cannot execute/launch file '"+launchString+"'");
	}
    }
};

config.macros.LaunchApplication.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
    // 0=ButtonText, 1=toolTip, 2=AppToLaunch, 3...AppParameters
    if (params[0] && (params[1] || params[1] == "") && params[2]) {
        var theButton = createTiddlyButton(place, getParam(params,"buttonText",params[0]), getParam(params,"toolTip",params[1]), onClickLaunchApplication);
        theButton.setAttribute("appToLaunch", getParam(params,"appToLaunch",params[2]));
        params.splice(0,3);
        theButton.setAttribute("appParameters", params.join(" "));
        return;
    }
}
config.macros.LaunchApplicationButton.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
    config.macros.LaunchApplication.handler (place,macroName,params,wikifier,paramString,tiddler);
}

config.macros.LaunchApplicationLink.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
    // 0=ButtonText, 1=toolTip, 2=AppToLaunch, 3...AppParameters
    if (params[0] && (params[1] || params[1] == "") && params[2]) {
        //var theLink = createExternalLink(place, getParam(params,"buttonText",params[0]));
        var theLink = createTiddlyButton(place, getParam(params,"buttonText",params[0]), getParam(params,"toolTip",params[1]), onClickLaunchApplication,"link");
        theLink.setAttribute("appToLaunch", getParam(params,"appToLaunch",params[2]));
        params.splice(0,3);
        theLink.setAttribute("appParameters", params.join(" "));
        return;
    }
}

function onClickLaunchApplication(e) {
	var theAppToLaunch = this.getAttribute("appToLaunch");
	var theAppParams = this.getAttribute("appParameters").readMacroParams();
	LaunchApplication(theAppToLaunch,theAppParams);
}

//}}}

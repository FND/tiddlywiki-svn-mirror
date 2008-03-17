var recursionCount = 0;
function JSSerializeDOM(rootElem,outputElem) {
	var s = "";
	// console.log("trying...");
	// console.log(rootElem);
	for (var i in rootElem) {
		if (typeof rootElem[i] == "function") {
			// console.log("function: "+i);
			s = i+": ";
			s += rootElem[i].toString();
			s += "\n\n";
			createTiddlyText(outputElem,s);
		} else if(typeof rootElem[i] == "object") {
			// console.log("object: "+i);
			if (rootElem[i] && !rootElem[i].nodeType && rootElem[i] !== rootElem) {
				// console.log("recursing: "+i+" "+(recursionCount++));
				try {
					JSSerialize(rootElem[i],outputElem);
				} catch(ex) {
					throw "problem: "+rootElem+" "+ex;
				}
			}
		}
	}
}

function JSSerializeScript(place) {
	var scripts = document.documentElement.getElementsByTagName("script");
	var output = "";
	for (var i=0;i<scripts.length;i++) {
		output += scripts[i].textContent;
	}
	createTiddlyText(place,output);
}

config.macros.JSSerialize = {};

config.macros.JSSerialize.handler = function(place,macroName,params) {
	if(params[0]) {
		if(params[0] == "DOM")
			JSSerializeDOM(window,place);
		else if(params[0] == "script")
			JSSerializeScript(place);
		else return false;
	}
};

// NB: This doesn't give the right result if someone has added shadow tiddlers
config.macros.ShadowSerialize = {};

config.macros.ShadowSerialize.handler = function(place,macroName,params) {
	var saver = new TW21Saver();
	var output = "";
	for(var i in config.shadowTiddlers) {
		var tiddler = new Tiddler(i);
		tiddler.text = config.shadowTiddlers[i];
		output += saver.externalizeTiddler(store,tiddler);
	}
	createTiddlyText(place,output);
};


/***
!Usage:
<<FileSaving fileName 'macroName [param1 [...]]'>>

where "macroName" is the macro you want to run to create the output
***/
config.macros.FileSaving = {
	syntaxError: "Error in FileSaving macro. Usage: <<FileSaving fileName 'macroName [param1 [...]]'>>"
};

config.macros.FileSaving.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	config.messages.fileSaved = "file successfully saved";
	config.messages.fileFailed = "file save failed";
	var saveName = params[0];
	if(params[1]) {
		var macroParams = params[1].split(" ");
		var macro = macroParams[0];
		macroParams = macroParams.splice(1,p.length);
		var macroParamString = macroParams.join(" ");
	} else {
		displayMessage(this.syntaxError);
		return false;
	}
	var localPath = getLocalPath(document.location.toString());
	var savePath;
	if((p = localPath.lastIndexOf("/")) != -1)
		savePath = localPath.substr(0,p) + "/" + saveName;
	else if((p = localPath.lastIndexOf("\\")) != -1)
		savePath = localPath.substr(0,p) + "\\" + saveName;
	else
		savePath = localPath + "." + saveName;
	var e = document.createElement("div");
	createTiddlyText(place,"generating...");
	
	config.macros[macro].handler(e,macro,macroParams,wikifier,macroParamString,tiddler);
	createTiddlyText(place,"saving...");
	var fileSave = saveFile(savePath,convertUnicodeToUTF8(e.textContent));
	if(fileSave) {
		createTiddlyText(place,"saved...");
		// would rather use displayMessage, but doesn't work when opening tiddler
		// displayMessage(config.messages.fileSaved,"file://" + savePath);
	}
	else
		alert(config.messages.fileFailed,"file://"+savePath);
};
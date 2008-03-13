var recursionCount = 0;
function JSSerialize(rootElem,outputElem) {
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

config.macros.JSSerialize = {};

config.macros.JSSerialize.handler = function(place) {
	JSSerialize(window,place);
};

/***
!Usage:
<<FileSaving fileName macro>>

where "handler" is the macro you want to run to create the output
***/
config.macros.FileSaving = {};

config.macros.FileSaving.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	config.messages.fileSaved = "file successfully saved";
	config.messages.fileFailed = "file save failed";
	var saveName = params[0];
	var macro = params[1];
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
	config.macros[macro].handler(e,"FileSaving",null,paramString,null);
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
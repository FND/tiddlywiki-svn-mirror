/***
!pseudo-code

get slices from SaveList tiddler
for each slice
	split out the parameters from the slice
	combine the path and filename to make the save path
	run TiddlyTemplating with the template and save path
	
***/
config.macros.fileSave = {
	buttonLabel: "Save all files"
};

config.macros.fileSave.handler = function(place,macroName,params) {
	if (readOnly)
		return;
	var label;
	if (document.location.toString().substr(0,4) == "http") 
		return;
	else
		label = this.buttonLabel;
	createTiddlyButton(place, label, null, function() {config.macros.fileSave.save(place);});
};

config.macros.fileSave.save = function() {
	var listSlices = store.calcAllSlices(config.macros.saveListHelper.defaultSaveList);
	for(var i in listSlices) {
		if(listSlices.hasOwnProperty(i)) {
			// split out parameters from slice
			var params = config.macros.saveListHelper.getSliceParams(listSlices[i]);
			var saveParams = [params.savePath,params.template];
			// run TiddlyTemplating with the template and path
			config.macros.TiddlyTemplating.handler(null,null,saveParams);
		}
	}
};

config.macros.saveListHelper = {
	defaultSaveList: "SaveList",
	defaultTemplate: null,
	defaultFilename: "index.html",
	defaultPath: null
};

config.macros.saveListHelper.add = function(params) {
	var t = store.getTiddler(this.defaultSaveList);
	var slices = store.calcAllSlices(this.defaultSaveList);
	// keep going: no duplicates, format params
	t.text += this.newSlice(params);
};

config.macros.saveListHelper.getSliceParams = function(slice) {
	var p = slice.parseParams("anon",null,true);
	var params = {};
	params.template = p[1] ? p[1].value : this.defaultTemplate;
	params.filename = p[2] ? p[2].value : this.defaultFilename;
	params.path = p[3] ? p[3].value : this.defaultPath;
	params.savePath = params.path ? params.path+"/"+params.filename : params.filename;
	return params;
};

config.macros.saveListHelper.newSlice = function(params) {
	// assumes params are named: name, template, filename, path
	if(params)
		return params.name+": "+params.template+" "+params.filename+" "+params.path;
};
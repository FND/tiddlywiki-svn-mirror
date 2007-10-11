config.macros.param_test = {};

config.macros.param_test.handler = function(place,macroName,params) {

	// params[0] is the name of a tiddler with the function in it
	if (store.tiddlerExists(params[0])) {
		// get the slice named "function"
		var s = store.getTiddlerSlice(params[0],"function");
		console.log(s);
		var func_string = "var func = " + s;
		console.log(func_string);
		eval(func_string);
		console.log(func);
		return func;
	} else {
		displayMessage("error opening tiddler: " + params[0]);
	}

};
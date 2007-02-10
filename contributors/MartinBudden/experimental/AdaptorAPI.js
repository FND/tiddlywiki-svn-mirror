// Adaptor APIs

// Use Cases:

// ImportTiddlers -
// createAdaptor, getWorkspaceList, openWorkspace, getTiddlerList, n*getTiddler, closeAdaptor

// Save hosted tiddler -
// createAdaptor, openWorkspace, putTiddler, closeAdaptor

// Get hosted tiddler -
// createAdaptor, openWorkspace, getTiddler, closeAdaptor

// Sync -
// createAdaptor, openWorkspace, getTiddlerList, n*(putTiddler/getTiddler), closeAdaptor

// Callbacks and their parameters:
/*
Callbacks are often called by a series of function, eg

getWorkspaceList(),getWorkspaceListCallback(),params.callback()

Rather than each function in the series having its own set of parameters it both easier and more extensible
if the same "params" object is passed from each function to the next. That way each function can be regarded
as an operator in a "pipeline", doing an operation on the params "object" and passing it onto the next
function in the pipeline.

There are two pipeline formats used:
1) Generally functions pass on a params hash to their callback function
    getWorkspaceList(params)
    getWorkspaceListCallback(status,params,responseText,xhr)
    params.callback(params)
    
2) getTiddler and putTiddler pass on a tiddler object to their callback functions
    getTiddler(tiddler)
    getTiddlerCallback(status,tiddler,responseText,xhr)
    tiddler.fields['temp.callback'](tiddler);
*/

// Adaptor APIs, using a hypothetical ExampleAdaptor

// Note that callback functions, eg ExampleAdaptor.getTiddlerListCallback, are never directly called by the user

function ExampleAdaptor()
{
	this.host = null;
	this.workspace = null;
	return this;
}

// Open the specified host/server
//#   host - url of host (eg, "http://www.example.net/")
//#   params.callback - optional function to be called on completion
//#   params is itself passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support openHost(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(params)
//#   params.status - true if OK, string if error
//#   params.adaptor - reference to this adaptor object
//#   params - parameters as originally passed into the openHost function
ExampleAdaptor.prototype.openHost = function(host,params)
{
//...
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params);
	return true;
};

// Gets the list of workspaces on a given host
//#   params.callback - optional function to be called on completion
//#   params is itself passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getWorkspaceList(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(params)
//#   params.status - true if OK, false if error
//#   params.statusText - error message if there was an error
//#   params.adaptor - reference to this adaptor object
//#   params - parameters as originally passed into the getWorkspaceList function

ExampleAdaptor.prototype.getWorkspaceList = function(params)
{
//...
	params.adaptor = this;
	var req = doHttpGET(url,ExampleAdaptor.getWorkspaceListCallback,params);
	return typeof req == 'string' ? req : true;
};
ExampleAdaptor.getWorkspaceListCallback = function(status,params,responseText,xhr)
{
	if(status) {
//...
		params.status = true;
	} else {
		params.status = false;
		params.statusText = xhr.statusText;
	}
	if(params.callback)
		params.callback(params);
};

// Open the specified workspace
//#   workspace - name of workspace to open
//#   params.callback - optional function to be called on completion
//#   params is passed to callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support openWorkspace(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(params)
//#   params.status - true if OK, false if error
//#   params.statusText - error message if there was an error
//#   params.adaptor - reference to this adaptor object
//#   params - parameters as originally passed into the openWorkspace function
ExampleAdaptor.prototype.openWorkspace = function(workspace,params)
{
//...
	if(params && params.callback)
		window.setTimeout(params.callback,0,true,this,params);
	return true;
};

// Gets the list of tiddlers within a given workspace
//#   params.callback - optional function to be called on completion
//#   params is passed on to callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getTiddlerList(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(params)
//#   params.status - true if OK, false if error
//#   params.statusText - error message if there was an error
//#   params.adaptor - reference to this adaptor object
//#   params - parameters as originally passed into the getTiddlerList function
ExampleAdaptor.prototype.getTiddlerList = function(params)
{
//...
	params.adaptor = this;
	var req = doHttpGET(url,ExampleAdaptor.getTiddlerListCallback,params);
	return typeof req == 'string' ? req : true;
};
ExampleAdaptor.getTiddlerListCallback = function(status,params,responseText,xhr)
{
	if(status) {
//...
		params.status = true;
	} else {
		params.status = false;
		params.statusText = xhr.statusText;
	}
	if(params.callback)
		params.callback(params);
};

// Retrieves a tiddler from a given workspace on a given server
//#   tiddler.title - title of the tiddler to get
//#   tiddler.fields['temp.callback'] - optional function to be called on completion
//#   tiddler is passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support getTiddler(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(tiddler)
//#   tiddler.fields['temp.statusText'] - error message if there was an error, otherwise undefined
//#   tiddler.fields['temp.adaptor'] - reference to this adaptor object
//#   tiddler - as passed into the putTiddler function
ExampleAdaptor.prototype.getTiddler = function(tiddler)
{
//...
	tiddler.fields.wikiformat = 'example';
	tiddler.fields['server.type'] = 'example';
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttpGET(url,ExampleAdaptor.getTiddlerCallback,tiddler);
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.getTiddlerCallback = function(status,tiddler,responseText,xhr)
{
	if(status) {
//...
		params.status = true;
	} else {
		params.status = false;
		params.statusText = xhr.statusText;
	}
	var callback = tiddler.fields['temp.callback'];
	if(callback)
		callback(tiddler);
};

// Puts a tiddler to a given workspace on a given server
//#   tiddler.title - title of the tiddler to put
//#   tiddler.fields['temp.callback'] - optional function to be called on completion
//#   tiddler is passed on as a parameter to the callback function
//# Return value is true if the request was successfully issued, false if this connector doesn't support putTiddler(),
//#   or an error description string if there was a problem
//# The callback parameters are callback(tiddler)
//#   tiddler.fields['temp.statusText'] - error message if there was an error, otherwise undefined
//#   tiddler.fields['temp.adaptor'] - reference to this adaptor object
//#   tiddler - as passed into the putTiddler function
ExampleAdaptor.prototype.putTiddler = function(tiddler)
{
//...
	tiddler.fields['temp.adaptor'] = this;
	var req = doHttp('POST',url,tiddler.text,ExampleAdaptor.mimeType,null,null,ExampleAdaptor.putTiddlerCallback,tiddler,{"X-Http-Method": "PUT"});
	return typeof req == 'string' ? req : true;
};

ExampleAdaptor.putTiddlerCallback = function(status,tiddler,responseText,xhr)
{
	if(status) {
//...
		tiddler.fields['temp.status'] = true;
	} else {
		tiddler.fields['temp.status'] = false;
		tiddler.fields['temp.statusText'] = xhr.statusText;
	}
	var callback = tiddler.fields['temp.callback'];
	if(callback)
		callback(tiddler);
};

ExampleAdaptor.prototype.close = function()
{
//...
	return true;
};

config.adaptors['example'] = ExampleAdaptor;

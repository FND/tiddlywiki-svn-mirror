

var engineCallbacks = [];
var engineUrl;
var lastScript;

var currentScriptName = "new";
var currentScript = {script:[]};
var currentScriptParameters="";
var currentExecution  = null;
var currentExecutionObject;
var currentExecutionPanel;
var allowExecutionRefresh = false;

var ScriptEngine ={};
ScriptEngine.callback = function(c, v){
	var f = engineCallbacks[c];
	f(v);
	engineCallbacks[c] = null;
};

ScriptEngine.dispatchRequest = function (callback, command, params){
	engineCallbacks.push(callback);
	var q="?admin&c="+(engineCallbacks.length -1).toString();
	q = q +"&cmd="+command;
	if (params !== undefined){
		for (p in params){
			if (p){
				q = q +"&" + p + "=" +params[p];
			}
		}
	}
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.src =  e("scriptEngineUrl").value + q;
	document.getElementsByTagName('head')[0].appendChild(script);
};

function showScriptEngineStartPage(){
	
	var validationConfigurationCallback = function(configValidation){
	
		var validateNotificationCallbackUrl = function (notificationUrlValidation){
			if (configValidation === true){
				 content = "<p>Your server configuration is valid.</p>";
			}
			else{
				content= "<p>";
				if (configValidation.errors.length >0 ){
					content = content + "ERRORS<br><ul>"; 
					for (var i=0; i<configValidation.errors.length; i++){
						content = content + "<li><i>" + configValidation.errors[i]+"</i></li>";
					}
					content = content + "</ul>"; 
				}
				if (configValidation.warnings.length >0 ){
					content = content + "<br/>WARNINGS<br><ul>";
					for (i=0; i<configValidation.warnings.length; i++){
						content = content + "<li><i>" + configValidation.warnings[i]+"</i></li>";
					}
					content = content + "</ul>"; 
				}
			}
			content= content +"<hr/>";
			if (notificationUrlValidation !== null){
				if (notificationUrlValidation.valid === true){
					 content = content + "Your notification URL on the Ribbit REST server is configured correctly<br/><br/>"+
					 	"Your notification url is <i>" + notificationUrlValidation.notificationUrl +"</i>";
					 
				}
				else{
					content = content + "<p>Your notification URL on the Ribbit REST server is NOT configured correctly<br/><br/>"+
						"Ribbit has it defined as - <i>" + notificationUrlValidation.notificationUrl +"</i><br/>"+
						"Which is addressable as -  <i>" + notificationUrlValidation.resolvedNotificationUrl +"</i><br/>"+
						"You've deployed here -  <i>" + notificationUrlValidation.serverUrl +"</i><br/>"+
						"<div style='font-size:10pt'>Note that there is currently a REST bug where, although the notification URL is stored correctly, it is not presented correctly through the getApplication API call."+
						"<br/>Until this bug is still in place your notification URL will be reported to be at<br/>https://rest.ribbit.com/rest/<i>your path</i></div>";
				}
			}
			else{
				content = content + "Until you have set the correct Ribbit credentials we cannot validate your notification URL";
			}
			
			e("scriptManagerContent").innerHTML = content;
		};
		ScriptEngine.dispatchRequest(validateNotificationCallbackUrl, "validateNotificationUrl");
	};
	ScriptEngine.dispatchRequest(validationConfigurationCallback, "validateConfiguration");	
}
function loggedInToScriptEngine(result){
	if (result.error === undefined){
		createCookie("ribbit_script_engine_url", e("scriptEngineUrl").value, 365);
		e("engineUrl").innerHTML = e("scriptEngineUrl").value;
		e("configureUrl").style.visibility="hidden";
		showScriptEngineStartPage();
		e("scriptManagerContainer").style.visibility="visible";
	}
}



function loginToScriptEngine(){
	var params={};
	params.username = e("scriptEngineUsername").value;
	params.password = e("scriptEnginePassword").value;
	params.consumerKey = e("consumerKey").value;
	var callback = function (result){
		loggedInToScriptEngine(result);
		if (result.error !== undefined){
			alert(result.error);
		}
	};
	ScriptEngine.dispatchRequest(callback, "login",params);	
}

function checkLoggedInToScriptEngine(){
	if (e("scriptEngineUrl").value.length >0){
		var params={};
		params.consumerKey = e("consumerKey").value;
		ScriptEngine.dispatchRequest(loggedInToScriptEngine,"validateSession", params);
	}
}



function logoffScriptEngine(){
	var r = function (result){
		e("configureUrl").style.visibility="visible";
		e("scriptManagerContainer").style.visibility="hidden";
		
	};
	ScriptEngine.dispatchRequest(r,"logoff");
}



function saveScript(){
	var script = Ribbit.Util.JSON.parse(e("currentScript").value);
	var name = e("currentScriptName").value;
	if (name.length === 0 || name === "new"){
		alert ("Please enter a name");
	}
	else{
		
		var callback = function (result){
			if (result.error !== undefined){
				alert(result.error);
			}
			else{
				alert("Script saved ok");
			}
		};
		var params = {};
		params.script = name;
		params.json = Ribbit.Util.JSON.stringify(script);
		ScriptEngine.dispatchRequest(callback,"saveScript",params);
	}
	
}


function validateScript(){
	try{
		var o = Ribbit.Util.JSON.parse(e("currentScript").value);
		e("scriptValidator").innerHTML="&nbsp;";
		var inp = ce("input");
		inp.type="button";
		inp.value="Save";
		inp.onclick = function(){ return function(){saveScript();};}();
		e("scriptValidator").appendChild(inp);	
		e("scriptFormatter").disabled = "";
	}
	catch (ex){
		e("scriptValidator").innerHTML="&nbsp;<span style='color:#ff0000'>"+ ex.message +"</span>";
		e("scriptFormatter").disabled = "disabled";
	}
	currentScript = e("currentScript").value;
}



function showScriptEditor(){
	
	var script = currentScript;
	if (!Ribbit.Util.isString(script)){
		script = Ribbit.Util.JSON.stringify(script,null,5);	
	}
	var tbl = ce("table");
	tbl.setAttribute("class","output");
	tbl.setAttribute("className","output");
	var t = ce("tbody");
	var tr = ce("tr");
	var td = ce("td");
	td.innerHTML = "<input type='button' value='Reset' onclick='newScript();'><input type='button' id='scriptFormatter' value='Format' onclick='formatScript();'>&nbsp;Script Name - ";
	var inp = ce("input");
	inp.onkeyup = function(){ return function(){validateScript();};}();
	inp.id="currentScriptName";
	inp.type="text";
	td.appendChild(inp);
	var d = ce("span");
	d.id="scriptValidator";
	d.innerHTML="";
	td.appendChild(d);
	d = ce("hr");
	td.appendChild(d);
	td.innerHTML = td.innerHTML + "Params:&nbsp;<input type='text' value='' onkeyup='currentScriptParameters = e(\"currentScriptParameters\").value;' id='currentScriptParameters'>"+
						"&nbsp;<input type='button' value='Run' onclick='runScript();'>" +
						"&nbsp;<span id='showCurrentScript'></span>";
	tr.appendChild(td);
	t.appendChild(tr);
	tr=ce("tr");
	td = ce("td");
	var text = ce("textarea");
	text.id="currentScript";
	text.onkeyup = function(){ return function(){validateScript();};}();
	text.cols=100;
	text.rows=30;
	text.value=script;
	text.onkeypress = function(ev){
		ev = ev || window.event;
		var code = ev.keyCode || ev.which;
		var c = String.fromCharCode(code);
		if(c === "\t"){
			var el = e("currentScript"); 
			//IE support
			 
			if (document.selection) {
				el.focus();
				sel = document.selection.createRange();
				sel.text = "     ";
			}
			//MOZILLA/NETSCAPE support
			else if (el.selectionStart || el.selectionStart == '0') {
				var startPos = el.selectionStart;
				var endPos = el.selectionEnd;
				el.value = el.value.substring(0, startPos) + "     " +
					el.value.substring(endPos, el.value.length);
				el.selectionStart = startPos + 5;
				el.selectionEnd = startPos + 5;
			} 
			else {
				el.value += "     ";
			}
			return false;
		} 
		else{ 
			return true;
		}
	};

	td.appendChild(text);
	tr.appendChild(td);
	t.appendChild(tr);
	tbl.appendChild(t);
	e("scriptManagerContent").innerHTML = "";
	e("scriptManagerContent").appendChild(tbl);
	validateScript();
	e("currentScriptName").value=currentScriptName;
	e("currentScriptParameters").value=currentScriptParameters;
}

function newScript(){
	currentScriptName = "new";
	currentScript = {script:[]};
	showScriptEditor();
}

function showScript(script){
	
	var callback = function (result){
		if (result.error !== undefined){
			alert (result.error);
		}
		else{
			currentScript = result;
			currentScriptName = script;
			showScriptEditor();
						
		}
	};
	var params = {};
	params.script = script;
	ScriptEngine.dispatchRequest(callback, "getScript", params);
}

function runScript(){
	
	var tempFile = e("currentScriptName").value + new Date().getTime();
	var scriptParams = {};
	var bits = e("currentScriptParameters").value.split(',');
	for (var i in bits) {
		if (i) {
			var kvp = bits[i].split('=');
			scriptParams[kvp[0]] = kvp[1];
		}
	}
	var saveTempCallback = function (result){
		if (result.error !== undefined){
			alert (result.error);
		}
		else {
			var runCallback = function(result) {
				if (result.error !== undefined){
					alert (result.error);
				}
				else {
					alert("Started script " + result);
					e("showCurrentScript").innerHTML = "<a href='#' class='novisit' onclick='getCurrent(\""+result+"\");'>"+result+"</a>";
					lastScript = result;
					
					var deleteParams = {};
					deleteParams.script = tempFile;
					
					ScriptEngine.dispatchRequest(function(result){}, "deleteScript", deleteParams);
				}
			};
			
			
			
			var saveTempParams = {};
			saveTempParams.script = tempFile;
			saveTempParams.params = Ribbit.Util.JSON.stringify(scriptParams);
			ScriptEngine.dispatchRequest(runCallback, "execute", saveTempParams);
		}
	};

	var params = {};
	params.script = tempFile;
	params.json = Ribbit.Util.JSON.stringify(Ribbit.Util.JSON.parse(e("currentScript").value));
	ScriptEngine.dispatchRequest(saveTempCallback,"saveScript",params);
}

function formatScript() {
	try {
		var o = Ribbit.Util.JSON.parse(e("currentScript").value);
		e("currentScript").value = Ribbit.Util.JSON.stringify(o,null,5);
	}
	catch (ex){
	}
}

function getScripts(){
	var gotMaps = function (result){
		var maps = result;
		var callback = function (result){
			if (result.error !== undefined){
				alert(result.error);
			}
			else{
				e("scriptManagerContent").innerHTML = "";
				var tbl = ce("table");
				tbl.setAttribute("class","output");
				tbl.setAttribute("className","output");
				var t = ce("tbody");
				var tr=ce("tr");
				var td=ce("td");
				td.innerHTML="Script Name";
				tr.appendChild(td);
				td=ce("td");
				td.innerHTML="&nbsp;";
				tr.appendChild(td);
				td=ce("td");
				td.innerHTML="&nbsp;";
				tr.appendChild(td);
				t.appendChild(tr);
				
				for (var i=0; i<result.length; i++){
					tr=ce("tr");
					td = ce("td");
					td.innerHTML = result[i];
					tr.appendChild(td);
					
					td = ce("td");	
					td.innerHTML="<a href='#' class='novisit' onclick='showScript(\"" + result[i] + "\");>Show</a>";
					tr.appendChild(td);
					
					td = ce("td");
					td.innerHTML="<a href='#' class='novisit' onclick='deleteScript(\"" + result[i] + "\");>Delete</a>";
					for (var j in maps){
						if (j){
							if (maps[j] === result[i]){
								td.innerHTML="mapped to " + j.substring(4,j.length);
								break;
							}
						}
					}
					tr.appendChild(td);
					
					t.appendChild(tr);
				}
				tbl.appendChild(t);
				e("scriptManagerContent").appendChild(tbl);
				
			}
		};
		ScriptEngine.dispatchRequest(callback, "getScripts");
	};
	ScriptEngine.dispatchRequest(gotMaps, "getInboundMappings");
}

function deleteScript(script){
	if (confirm("are you sure you want to delete script '" + script+"'?")){
		params = {};
		params.script = script;
		
		callback = function (result){
			if (result.error !== undefined){
				alert (result.error);
			}
			else{
				getScripts();
				alert("Deleted script '" + script + "'");
			}
		};
		ScriptEngine.dispatchRequest(callback, "deleteScript", params);
	}
	
}

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function appendZero(s){
	s = "" + s;
	return s.length === 1 ? "0" + s : s;
}

function showLocalDate(timestamp)
{
	var dt = new Date(timestamp * 1000);
	return dt.getDate() + "-" + months[dt.getMonth()] + "-" + dt.getFullYear() + " " + appendZero(dt.getHours()) + ":" + appendZero(dt.getMinutes()) + ":" + appendZero(dt.getSeconds());
}

function showExecutionScript(){
	var o = {};
	o.params = currentExecutionObject.inputParams;
	o.script = Ribbit.Util.JSON.parse(currentExecutionObject.inputScript).script;
	e("executionResult").value=Ribbit.Util.JSON.stringify(o,null,5);
	e("aShowScript").style.fontWeight="bold";
	e("aShowEvents").style.fontWeight="";
	e("aShowExecution").style.fontWeight="";
	currentExecutionPanel="script";
}
function showExecutionEvents(){
	e("executionResult").value =Ribbit.Util.JSON.stringify(currentExecutionObject.events,null,5);
	e("aShowScript").style.fontWeight="";
	e("aShowEvents").style.fontWeight="bold";
	e("aShowExecution").style.fontWeight="";

	currentExecutionPanel="events";
}
function showExecutionExecution(){
	e("executionResult").value =Ribbit.Util.JSON.stringify(currentExecutionObject.execution,null,5);
	e("aShowScript").style.fontWeight="";
	e("aShowEvents").style.fontWeight="";
	e("aShowExecution").style.fontWeight="bold";

	currentExecutionPanel="execution";
}

function showExecution(){
	e("executionViewRow").innerHTML="";
	var bodyTd = ce("td");
	bodyTd.innerHTML = "<span style='font-size:12pt'>Script " +  currentExecution + "</span>&nbsp;<br/>";
	
	var tbl = ce("table");
	tbl.setAttribute("class","output");
	tbl.setAttribute("className","output");
	tbl.style.border="0";
	var t = ce("tbody");
	var tr=ce("tr");
	
	var td=ce("td");
	td.innerHTML="<a href='#' id='aShowScript' class='novisit' onclick='showExecutionScript();'>Script</a>&nbsp;" +
				"<a href='#' id='aShowEvents' class='novisit' onclick='showExecutionEvents();'>Events</a>&nbsp;" +
				"<a href='#' id='aShowExecution' class='novisit' onclick='showExecutionExecution();'>Trace</a>&nbsp;";
	if (allowExecutionRefresh){
		td.innerHTML  = td.innerHTML  + "&nbsp;<a href='#' class='novisit' onclick='getExecution(\"" + currentExecution + "\");'>Refresh</a>&nbsp;";
	}
	tr.appendChild(td);
	t.appendChild(tr);
	
	tr=ce("tr");
	td=ce("td");
	
	var text = ce("textarea");
	text.cols=80;
	text.rows=30;
	text.style.borderStyle="none";
	text.setAttribute("readonly","readonly");
	text.id="executionResult";	
	td.appendChild(text);
	
	tr.appendChild(td);
	t.appendChild(tr);
	
	bodyTd.appendChild(t);
	
	e("executionViewRow").appendChild(bodyTd);
	
	switch (currentExecutionPanel) {
		case "events": 
			showExecutionEvents();
			break;
		case "execution": 
			showExecutionExecution();
			break;
		default:
			showExecutionScript();
			break;
	}

}
function getExecution(execution){
	
	var callback = function (result){
		if (result.error !== undefined){
			alert (result.error);
		}
		else {
			currentExecution = execution;
			currentExecutionObject = result;
			showExecution();
		}
	};
	var params = {};
	params.execution = execution;
	ScriptEngine.dispatchRequest(callback, "getExecution", params);
}

function getExecutionList(method, loadScript){
	var callback = function (result) {
		if (result === null){
			if (method==="getCurrent" && loadScript !== undefined){
				allowExecutionRefresh = false;
				getExecutionList("getHistory", loadScript);
			}
			else{
				alert ("Nothing found");
			}
		}
		else if (result.error !== undefined) {
			alert(result.error);
		}
		else {
			
			result.sort(function(a,b){
				return a.last_modified > b.last_modified;
				}
			);
			e("scriptManagerContent").innerHTML = "";
			var outerTable = ce("table");
			outerTable.style.border="0";
			var ot = ce("tbody");
			var oTr = ce("tr");
			oTr.vAlign = "top";
			var oTd = ce("td");
			var tbl = ce("table");
			tbl.width="260px";
			tbl.setAttribute("class","output");
			tbl.setAttribute("className","output");
			var t = ce("tbody");
			var tr=ce("tr");
			var td=ce("td");
			td.innerHTML="Script";
			tr.appendChild(td);
			td=ce("td");
			td.innerHTML="Date";
			tr.appendChild(td);
			td=ce("td");
			td.innerHTML="&nbsp;";
			tr.appendChild(td);
			t.appendChild(tr);
			for (var i=result.length-1; i>=0; i--){
				tr=ce("tr");
				td = ce("td");
				td.innerHTML = result[i].execution_id;
				tr.appendChild(td);		
				
				td = ce("td");	
				td.innerHTML=showLocalDate(result[i].last_modified);
				tr.appendChild(td);
				
				td = ce("td");	
				td.innerHTML="<a href='#' class='novisit' onclick='getExecution(\"" + result[i].execution_id + "\");>Show</a>";
				tr.appendChild(td);
				
				t.appendChild(tr);
			}
			tbl.appendChild(t);
			oTd.appendChild(tbl);
			oTr.appendChild(oTd);
			
			oTd = ce("td");
			tbl = ce("table");
			tbl.setAttribute("class","output");
			tbl.setAttribute("className","output");
			tbl.style.border="0";
			t = ce("tbody");
			tr=ce("tr");
			tr.vAlign="top";
			tr.setAttribute("id", "executionViewRow");
			td = ce("td");
			td.setAttribute("id", "executionView");
			
			
			tr.appendChild(td);
			t.appendChild(tr);
			tbl.appendChild(t);
			
			oTd.appendChild(tbl);
			oTr.appendChild(oTd);
			ot.appendChild(oTr);
			outerTable.appendChild(ot);
			e("scriptManagerContent").appendChild(outerTable);
			if (loadScript !== undefined){
				getExecution(loadScript);
			}
		}
	};

	ScriptEngine.dispatchRequest(callback, method);
}

function getCurrent(loadScript){
	allowExecutionRefresh = true;
	getExecutionList("getCurrent",loadScript);
}

function getHistory(loadScript){
	allowExecutionRefresh = false;
	getExecutionList("getHistory", loadScript);
}

function getDevices(){
	
	var maps;
	
	var getDevicesCallback = function (result){

		if (result.error !== undefined){
			alert(result.error);
		}
		else{
			e("scriptManagerContent").innerHTML = 
				"<a href='#' class='novisit' onclick='createInboundNumber()'>Create Inbound Number</a>&nbsp;&nbsp;";
			var dd = ce("select");
			dd.id="inboundLocale";
			dd.options[dd.options.length] = new Option("USA", "USA");
			dd.options[dd.options.length] = new Option("GBR", "GBR");
			
			e("scriptManagerContent").appendChild(dd);
			$("#inboundLocale").jec();
			e("inboundLocale").value="USA";
			e("scriptManagerContent").innerHTML = e("scriptManagerContent").innerHTML +"<br/><br/>";
			
			
			var tbl = ce("table");
			tbl.setAttribute("class","output");
			tbl.setAttribute("className","output");
			var t = ce("tbody");
			var tr=ce("tr");
			var td=ce("td");
			td.innerHTML="Number";
			tr.appendChild(td);
			td=ce("td");
			td.innerHTML="Configuration";
			tr.appendChild(td);
			td=ce("td");
			td.innerHTML="&nbsp;";
			tr.appendChild(td);
			td=ce("td");
			td.innerHTML="Mapped Script";
			tr.appendChild(td);
			t.appendChild(tr);
			for (var i=0; i<result.length; i++){
				tr=ce("tr");
				td=ce("td");
				td.innerHTML = result[i].id;
				tr.appendChild(td);
				
				td = ce("td");
				if (result[i].valid){
					td.innerHTML = "valid";
				}
				else{
					td.innerHTML="<a href='#' class='novisit' onclick='configureInboundNumber(\"" + result[i].id + "\");>Use for inbound Scripts</a>";
				}
				tr.appendChild(td);
				
				td = ce("td");
				td.innerHTML="<a href='#' class='novisit' onclick='removeInboundDevice(\"" + result[i].id + "\");>Remove Device (permanently!)</a>";
				tr.appendChild(td);
	
				td = ce("td");
				
				if (!result[i].valid){
					td.innerHTML="&nbsp;";
				}
				else if (maps["tel:"+ result[i].id]=== undefined){
					td.innerHTML="<a href='#' class='novisit' onclick='createMapping(\"" + result[i].id + "\");>Map a script</a>";
				}
				else{
					var h = "<a href='#' class='novisit' onclick='showScript(\"" + maps["tel:"+ result[i].id] + "\")';>"+maps["tel:"+ result[i].id]+"</a>&nbsp;";
					h = h + "(<a href='#' class='novisit' onclick='removeInboundMapping(\"" + result[i].id + "\")';>remove</a>)";
					td.innerHTML=h;
				}
				tr.appendChild(td);

				t.appendChild(tr);	
			}
			tbl.appendChild(t);
			e("scriptManagerContent").appendChild(tbl);
			e("scriptManagerContent").appendChild(ce("br"));
			e("scriptManagerContent").appendChild(ce("br"));
			var d = ce("div");
			d.id="scriptMapper";
			e("scriptManagerContent").appendChild(d);
		}	
	};
	
	var getMapsCallback = function (result){
		ScriptEngine.dispatchRequest(getDevicesCallback, "getDevices");
		maps = result;
	};
	ScriptEngine.dispatchRequest(getMapsCallback, "getInboundMappings");
}

function createMapping(number){
	
	var gotScripts = function(result){
		var scripts = result;
		var gotMaps = function(result){
			var maps = result;
			var d = e("scriptMapper");
			d.innerHTML="Please select a script to map to " + number +"<br/>It must be a script that starts with 'answerCall' <br/><br/>";			
			var dd = ce("select");
			dd.id="scriptSelector";
			for (var j in scripts){
				if (j){
					var script = scripts[j];
					var b = true;
					for (i in maps){
						if (maps[i] === script){
							b = false;
							break;
						}
					}
					if (b){
						dd.options[dd.options.length] = new Option(script, script);
					}
				}
			}
			d.appendChild(dd);
			d.innerHTML = d.innerHTML +"&nbsp;";
			
			var inp = ce("input");
			inp.type="button";
			inp.onclick = function(number){
				return function(){
					var mapped = function(result){
						if (result.error !== undefined){
							alert (result.error);
						}
						else if (result === false){
							alert ("An error occured creating the mapping");
						}
						else{
							getDevices();
						}
					};
					var params = {};
					params.number = number;
					params.script = e("scriptSelector").options[e("scriptSelector").selectedIndex].value;
					ScriptEngine.dispatchRequest(mapped, "addInboundMapping", params);
					
				};
			}(number);
			inp.value="Create Map";
			d.appendChild(inp);
			
		};
		ScriptEngine.dispatchRequest(gotMaps, "getInboundMappings");
	};
	ScriptEngine.dispatchRequest(gotScripts, "getScripts");
}

function removeInboundMapping(number){
	if (confirm("Are you sure?")){
		params = {};
		params.number= number;
		
		callback = function (result){
			if (result.error !== undefined){
				alert (result.error);
			}
			else{
				getDevices();
				alert("Deleted mapping for number '" + number + "'");
			}
		};
		ScriptEngine.dispatchRequest(callback, "removeInboundMapping", params);
	}
	
}

function configureInboundDevice(number) {
	
	var callback = function(result) {
		if (result.error !== undefined){
			alert(result.error);
		}
		getDevices();
	};
	var params = {};
	params.deviceId = number;
	ScriptEngine.dispatchRequest(callback, "configureInboundDevice", params);
}

function createInboundNumber(){
	var locale = e("inboundLocale").value;
	var params = {};
	
	if (locale.length === 0){
		alert ("Please select a locale");
	}
	else{
		var callback = function(result) {
			if (result.error !== undefined){
				alert(result.error);
			}
			else {
				alert("Inbound number " + result + " created for " + locale);
				configureInboundDevice(result);
			}
		};
		params.locale = locale;
		ScriptEngine.dispatchRequest(callback, "createInboundNumber", params);
	}
}

function removeInboundDevice(number) {
	if (!confirm("Are you sure you want to delete the inbound number '" + number+"'?")){
		return;
	}
	
	var callback = function(result) {
		if (result.error !== undefined){
			alert(result.error);
		}
		else {
			getDevices();
		}
	};
	var params = {};
	params.deviceId = number;
	ScriptEngine.dispatchRequest(callback, "removeInboundDevice", params);
}


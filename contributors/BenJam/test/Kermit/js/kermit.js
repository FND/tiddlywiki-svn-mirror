var resources;
var layouts = {};
var hist=[];
var busy;
var current;
var loadedScriptManager = false;
var loggingIn = false;
function e(id) {
	return document.getElementById(id);
}
function ce(type){
	return document.createElement(type);
}

function storage (v){
	try{
		if (window && window.sessionStorage){		
			if (Ribbit.Util.isSet(v)){
				sessionStorage.kermit = Ribbit.Util.JSON.stringify(v); 
			}
			else if (!Ribbit.Util.isSet(sessionStorage.kermit)){
				sessionStorage.kermit = "{}";
			}
			return Ribbit.Util.JSON.parse(sessionStorage.kermit);
		}
		else if (window && window.localStorage){
			if (Ribbit.Util.isSet(v)){
				localStorage.kermit = Ribbit.Util.JSON.stringify(v); 
			}
			else if (!Ribbit.Util.isSet(localStorage.kermit)){
				localStorage.kermit = "{}";
			}
			return Ribbit.Util.JSON.parse(localStorage.kermit);
		}
	}
	catch(e){
		var ca = document.cookie.split(';');
		var n = "kermit=";
		var val= {};
		if (Ribbit.Util.isSet(v)){
			var date = new Date();
			date.setTime(date.getTime()+(365*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
			document.cookie = n +Ribbit.Util.JSON.stringify(v)+expires+"; path=/";
			val = v;
		}
		else{
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				
				while (c.charAt(0)===' ') {
					c = c.substring(1,c.length);
				}
				if (c.indexOf(n) === 0){
					 var s = c.substring(n.length,c.length);
					 val = Ribbit.Util.JSON.parse(s);					 
				}
			}
		}
		return val;
		
		
	}
	return {};
}

function createCookie(name,value) {
	
	var v = storage();
	v[name]= value;
	storage(v);
}



function readCookie(n) {
	var s = storage();
	return Ribbit.Util.isSet(s[n]) ? s[n] :""; 
}	

var playingUrl = false;
var playingFile = false;

function updatePlayStatus(status){
	playingUrl = false;
	playingFile = false;
	e("playUrlButton").value="Play";
	e("playFileButton").value="Play";
	if (status === "error"){
		alert ("The file could not be played");
	}
	
}

function showPlayFile(){
	if (loggingIn){
		alert("Please complete the login process first");
		return;
	}
	if (window.location.href.substring(0,4)!=="http"){
		alert("Kermit uses a Flash Movie to play mp3 files.\n\nThe Flash sandbox does not allow Flash and Javascript to interact when you are running a web page from a file URI.\n\nHence this feature is only available when kermit is hosted in a web server, which may be local");
		return;
	}
	if (!Ribbit.Util.isSet(Ribbit.userId)){
		alert("Please login first");
		return;
	}
	e("auth").style.visibility="hidden";
	$("#scriptManager").hide();
	e("fileplayer").style.visibility="visible";
	e("layout").innerHTML="";
}


function showScriptManager(){
	if (loggingIn){
		alert("Please complete the login process first");
		return;
	}
	if (!loadedScriptManager){
		checkLoggedInToScriptEngine();
		loadedScriptManager = true;
	}
	$("#scriptManager").show();
	e("auth").style.visibility="hidden";
	e("fileplayer").style.visibility="hidden";
	e("layout").innerHTML="";
}

function playFile(){
	if (playingFile){
		e("player").stopPlaying();
		playingFile = false;
		e("playFileButton").value="Play";
		return;
	}
	if (playingUrl){
		alert("Please stop the playing url first");
		return;
	}
	var file = e("playFileInput").value;
	var domain = e("playDomainInput").value;
	var folder = e("playFolderInput").value;
	if (!Ribbit.Util.isValidString(file) || !Ribbit.Util.isValidString(domain) || !Ribbit.Util.isValidString(folder) ){
		alert("All of file, folder and domain must be specified");
		return;
	}
	if (!Ribbit.Util.stringEndsWith(file,".mp3")){
		alert("Please enter a filename that ends with '.mp3'");
		return;
	}
	var url= Ribbit.getStreamableUrl(file, folder, domain);
	try{
		e("player").playSound(url);
		playingFile = true;
		e("playFileButton").value="Stop";
	}
	catch (er){
		alert("The flash player could not be started. Do you have a flash blocker installed, or a version of Flash less than 10?");
	}

}
function playUrl(){
	if (playingUrl){
		e("player").stopPlaying();
		playingUrl = false;
		e("playUrlButton").value="Play";
		return;
	}
	if (playingFile){
		alert("Please stop the playing file first");
		return;
	}
	var url = e("playUrlInput").value;
	if (!Ribbit.Util.stringEndsWith(url,".mp3")){
		alert("Please enter a URL that ends with '.mp3'");
		return;
	}
	try{
		url= Ribbit.getStreamableUrl(url);
	}
	catch (er){
		alert("Please enter a valid URL that ends with '.mp3'.\n\nUse one of these two formats:\n\n '" + e("environment").options[e("environment").options.selectedIndex].value +"media/yourdomain/yourfolder/yourfile.mp3'\nor just '/media/yourdomain/yourfolder/yourfile.mp3'");
		
	}
	try{
		e("player").playSound(url);
		playingUrl = true;
		e("playUrlButton").value="Stop";
	}
	catch (er2){
		alert("The flash player could not be started. Do you have a flash blocker installed, or a version of Flash less than 10?");
}
}


function init(){
	var ck = e("consumerKey").value;
	var sk = e("secretKey").value;
	Ribbit.init(ck, null, null, sk,false);
	createCookie("ribbit_consumer_key",ck,365);
	createCookie("ribbit_secret_key",sk,365); 
	Ribbit.endpoint =  e("environment").value;
	createCookie("ribbit_environment",Ribbit.endpoint,365);
		
}

function findMethod(r,m){
	for (var i in resources.resources){
		if (i>=0){
			if (resources.resources[i].name == r){
				var res = resources.resources[i];
				for (var j in res.methods){
					if (res.methods[j].name == m){
						return res.methods[j];
					}
				}
				break;
			}
		}
	}
}
function findRibbitObject(t){
	for (var i in Ribbit){
		if (i.toLowerCase() === t.toLowerCase() ){
			return new Ribbit[i]();
		}
	}
}
function findObject(t){
	for (var i in resources.objects){
		if (resources.objects[i].name === t){
			return resources.objects[i];
		}
	}
}

function showConfig(){
	e("auth").style.visibility="visible";
	e("fileplayer").style.visibility="hidden";
	$("#scriptManager").hide();
	e("layout").innerHTML="";	
}
function showRaw(){
	if (loggingIn){
		alert("Please complete the login process first");
		return;
	}
	e("auth").style.visibility="hidden";
	e("fileplayer").style.visibility="hidden";
	$("#scriptManager").hide();
	
	e("layout").innerHTML = e("raw").innerHTML;
	$("#rawHttpMethod").jec();
}

function addHistoryItem(text, href){
	var li = ce("li");
	a = ce("a");
	if (text.length > 30){ text = text.substring(0,30);}
	a.innerHTML=text;
	a.href=href;
	li.appendChild(a);
	e("history-item-list").appendChild(li);
	$('#history-menu').menu({
		content:$('#history-menu').next().html(),
		flyOut:true
	});
	e("history-menu").style.visibility="visible";
}

function setBusy(b){
	if (b){
		e("wait").style.visibility="visible";
	}
	else{
		e("wait").style.visibility="hidden";
	}
}

function getParams(r, m){
	for (var i in resources.resources){
		if (i>=0){
			if (resources.resources[i].name == r){
				var res = resources.resources[i];
				for (var j in res.methods){
					if (res.methods[j].name == m){
						var meth = res.methods[j];
						break;
					}
				}
				break;
			}
		}
	}
	var p = [];
	for (i in meth.params){
		if (i>=0){
			if ( !meth.params[i].type || meth.params[i].type.substring(0,3)==="xs:"){
				
				p.push({setter:"value",el:"inp"+r+m+meth.params[i].name, value:e("inp"+r+m+meth.params[i].name).value});
			}
			else if (meth.params[i].type){
				var obj = findObject(meth.params[i].type);
				for (j in obj.params){
					if (j){
						
						var pm =obj.params[j];
						if (pm.type.substring(0,3)==="xs:" && e("inp"+r+m+meth.params[i].name+pm.name)){
							p.push({setter:"value",el:"inp"+r+m+meth.params[i].name+pm.name, value:e("inp"+r+m+meth.params[i].name+pm.name).value});
						}
						else{
							if (pm.isArray){
								var f="inp"+r+m+meth.params[i].name+pm.name;
								var obj2 = findObject(pm.type);
								var l=0;
								var go = true;
								while(go){
									
									for (k in obj2.params){
										if (k){
											if (e(f+obj2.params[k].name+l)){
												p.push({setter:"value",el:f+obj2.params[k].name+l, value:e(f+obj2.params[k].name+l).value});
											}
											else{
												go = false;
												break;
											}
										}
									}
									l++;
								}
								
							}
						}
					}
				}
			}
		}
	} 
	p.push({setter:"html", el:"request"+r+m, value:e("request"+r+m).innerHTML});
	p.push({setter:"html", el:"response"+r+m, value:e("response"+r+m).innerHTML});
	p.push({setter:"html", el:"output"+r+m, value:e("output"+r+m).innerHTML});
	return p;
}

function getRawParams(){
	var p = [];
	p.push ({setter:"value", el:"rawUri", value:e("rawUri").value});
	p.push ({setter:"value", el:"rawHttpMethod", value:e("rawHttpMethod").value});
	p.push ({setter:"value", el:"rawBody", value:e("rawBody").value});
	p.push ({setter:"html", el:"rawRequest", value:e("rawRequest").innerHTML});
	p.push ({setter:"html", el:"rawResponse", value:e("rawResponse").innerHTML});
	p.push ({setter:"html", el:"rawOutput", value:e("rawOutput").innerHTML});
	return p;
}

function autoCustomGet(uri){
	showRaw();
	e("rawHttpMethod").value="GET";
	e("rawUri").value=uri;
	e("rawDo").click();
}
function createTable(arr){
	var tbl = ce("table");
	tbl.setAttribute("class","output");
	tbl.setAttribute("className","output");
	var t = ce("tbody");
	if (arr.length >0){
		if (Ribbit.Util.isString(arr[0])){
			for (var i = 0; i<arr.length; i++){
				var tr = ce("tr");
				var td = ce("td");
				td.innerHTML = arr[i];
				tr.appendChild(td);
				t.appendChild(tr);
			}
		}
		else{
			
			
			var params = [];
			for (i = 0; i < arr.length; i++){
				var c = 0;
				for (var p in arr[i]){
					if (p){
						c++;
					}
				}
				if (c > params.length){
					params = [];
					for (var j in arr[i]){
					
						if (j){
							params.push(j);
						}
					}
				}
			}
			tr = ce("tr");
			for (i = 0 ;i<params.length; i++){
				td = ce("td");
				td.align="center";
				td.innerHTML="<b>" + params[i] + "</b>";
				tr.appendChild(td);
			} 
			t.appendChild(tr);
			for (i = 0; i<arr.length; i++){
				tr = ce("tr");
				for (j = 0; j<params.length; j++){
					td = ce("td");
					if (arr[i][params[j]] === undefined){
						td.innerHTML="&nbsp;";
					}
					else if (Ribbit.Util.isArray(arr[i][params[j]])){
						td.appendChild(createTable(arr[i][params[j]]));
					}
					else if (typeof arr[i][params[j]] === "object"){
						td.appendChild(createTable([arr[i][params[j]]]));
					}
					else{
						td.innerHTML = arr[i][params[j]];
					}
					tr.appendChild(td);
				}
				t.appendChild(tr);
			}
		}
	}
	t.setAttribute("class","output");	
	t.setAttribute("className","output");	
	tbl.appendChild(t);	
	return tbl;
}


function createPagedTable(o){
	var tbl = ce("table");
	var t = ce("tbody");
	var tr = ce("tr");
	var td = ce("td");
	td.innerHTML = o.totalResults + " total results, with " + o.itemsPerPage +" items per page. Results start at item " + o.startIndex;
	tr.appendChild(td);
	t.appendChild(tr);
	tr = ce("tr");
	td = ce("td");
	td.appendChild(createTable(o.entry));
	tr.appendChild(td);
	t.appendChild(tr);
	tbl.appendChild(t);
	return tbl;			
}

function processResponse(r){
	var d = ce("div");
	if(r.startIndex !== undefined){
		d.appendChild(createPagedTable(r));
	}
	else if (Ribbit.Util.isArray(r)){
		d.appendChild(createTable(r));
	}
	else if (typeof r === "object"){
		d.appendChild(createTable([r]));
	}
	else if (typeof r === "string"){
		var s="";
		if (r.substring(0,4) ==="http"){
			s = r.replace(Ribbit.endpoint,"");
		}
		else{
			s = findMethod(current.resource,current.method).uri;
			if (Ribbit.Util.isValidString(s)){
				if (s==="tokens"){
					s="tokens/{userId}";
				}
				s = s +"/" +r;
				if (s ==="tokens"){
					s ="tokens/{userId}";
				}
				if (s.indexOf("{userId}")>0){
					s = s.replace("{userId}",Ribbit.userId);
				}
			}
		}
		if (s.indexOf("{") >0 || findMethod(current.resource,current.method).httpMethod==="GETSTREAMABLEURL"){
			d.innerHTML=r;
		}
		else{
			d.innerHTML="<a href=\"#\" onclick=\"autoCustomGet('" + s +"');\">" + r +"</a>";
		}
	}
	else if (typeof r === "boolean"){
		d .innerHTML = r ? "Succeeded" :"Failed";
	}
	return d;
}

function getValueFromParam(val,p){
	var v = val;
	if (v !== ""){
		v = (v === "true") ? true : v;
		v = (v === "false") ? false : v;
		v = (p.type === "xs:dateTime") ? new Date(v) : v ;
		v = (p.type === "xs:int" || p.type === "xs:long" ) ? parseInt(v,10) : v;
		if (p.isArray === true){v = v.split(',');}
		return v;
	}
	else{
		return null;
	}
	
}

function makeRequest(request){
	init();
	
	setBusy(true);
	request = request.split("|");
	var res = request[0];
	var meth =request[1];
	e("output"+res+meth).innerHTML="";
	e("request"+res+meth).innerHTML="";
	e("response"+res+meth).innerHTML="";
	e("but"+res+meth).disabled="disabled";
	e("report"+res+meth).style.visibility ="visible";
	var call = {resource:res,method:meth};
	var params = {};
	for (var i in resources.resources){
		if (resources.resources[i].name == res){
			res = resources.resources[i];
			for (var j in res.methods){
				if (j>=0){
					if (res.methods[j].name == meth){
						meth = res.methods[j];
						for (var k in meth.params){
							if (k>=0){
								if (!meth.params[k].type || meth.params[k].type.substring(0,3)==="xs:"){
									var v = e("inp"+res.name+meth.name+meth.params[k].name).value;
									params[meth.params[k].name] = getValueFromParam(v,meth.params[k]);
								}
								else{
									for (var l in resources.objects){
										if (resources.objects[l].name === meth.params[k].type){
											var obj = resources.objects[l];
											var robj = findRibbitObject(obj.name);
											for (var n in robj){
												if (typeof robj[n] !== 'function'){
													var isObject = false;
													var isArray = false;
													for (var o in obj.params){
														if (o){
															if (obj.params[o].name === n && obj.params[o].type.substring(0,3)!== "xs:"){
																if (obj.params[o].isArray){
																	isObject = true;
																	var sobj = findRibbitObject(obj.params[o].type);
																	for (var p in sobj){
																		if (p){
																			break;
																		}
																	}
																	var z=0;
																	while (true){
																		var fl = "inp"+res.name+meth.name+meth.params[k].name+n+p+z;
																		fl = e(fl);
																		if (!fl){
																			break;
																		}
																		z++;
																	}
																	if (z>0){
																		var arr = [];
																		for (p=0; p<z; p++){
																			sobj = findRibbitObject(obj.params[o].type);
																			for (var q in sobj){
																				if (typeof sobj[q] !== 'function'){
																					fl = e("inp"+res.name+meth.name+meth.params[k].name+n+q+p);
																					for (var r in resources.objects){
																						if (resources.objects[r].name === obj.params[o].type){
																							for (var s in resources.objects[r].params){
																								if (resources.objects[r].params[s].name === q){
																									if (resources.objects[r].params[s].type.substring(0,3)==="xs:" ){
																										sobj[q] = getValueFromParam(fl.value,resources.objects[r].params[s]);
																									}
																								}
																							}
																						}
																					}
																					
																				}
																			}
																			arr.push(sobj);
																		}
																	}
																	robj[n] = arr;
																	
																}
															}
															else {
																var el = e("inp"+res.name+meth.name+meth.params[k].name+n);
																if (el){
																	for (p in resources.objects[l].name){
																		if (resources.objects[l].params[p].name === n){
																			robj[n] = getValueFromParam(el.value,resources.objects[l].params[p]);
																			break;
																		}
																	}
																}
															}
															break;
														}
													}
													
												}
											}
										}
									}
									var add = false;
									for (p in robj){
										if (typeof robj[p] !== 'function' && Ribbit.Util.isSet(robj[p])){
											add = true;
											break;
										}
									}
									if (add){
										params[meth.params[k].name] = robj;
									}
									
								}
							}
						}
						break;
					}
				}
			}
			break;
		}
	}
	call.params = params;
	var handler = {
			resource:res.name,
			method : meth.name,
			callback : function(val){
				e("but"+this.resource+this.method).disabled="";
				if (val.hasError === true){
					if (val.status === 0 || val.status === ""){
						e("report"+this.resource+this.method).style.visibility="hidden";
					}
					setBusy(false);
					alert(val.message);
				}
				else{
					var el = e("output"+this.resource+this.method);
					el.innerHTML = "";
					el.appendChild(processResponse(val));
				}
				
				if (e("layout" +this.resource+this.method)){
					hist.push({
								type:"method",
								layout:e("layout" +this.resource+this.method).innerHTML,
								method:this.method,
								resource:this.resource,
								params:getParams(this.resource,this.method)
							});
					addHistoryItem((val.hasError ? "Failed - ":"")+this.resource+"."+this.method, hist.length-1);
				}
				setBusy(false);
			}
	};
	call.callback= function(val){handler.callback(val);};
	var logger = {
			resource:res.name,
			method:meth.name,
			log:function(val){
				var s="";
				if (val.direction === "request"){
					s= val.method  +" to " + val.uri ;
					for (i in val.headers){
						if (i>=0){
							s +="<br>" + val.headers[i][0] + ":<i>" + val.headers[i][1] +"</i>";
						}
					}
					if (val.body){
						s+="<br/>"+val.body;
					}
					e("request"+this.resource+this.method).innerHTML = s;
				}
				if (val.direction === "response"){
					s = "HTTP STATUS - " + val.responseStatus +"<BR>";
					if (Ribbit.Util.isValidString(val.responseLocation)){
						s += "Location:<i>" +val.responseLocation + "</i>";
					}
					else if (val.responseText !== ""){
						s += "<i>"+val.responseText.substr(0,500) + "</i>" +(val.responseText.length <= 500 ? "": ".....<br/>("+val.responseText.length+" characters)");
					}
					e("response"+this.resource+this.method).innerHTML = s;	
				}
			}
	};
	Ribbit.log = function(val){logger.log(val);};
	Ribbit.exec(call);
}
	
function createObjectLayout(inputId,targetCell,objectname,index){
	var obj = null;
	for (var i in resources.objects){
		if (i>=0){
			if (resources.objects[i].name == objectname){
				obj = resources.objects[i];
				break;
			}
		}
	}
	if (index === null || index === 0 ){targetCell.innerHTML="";}
	var objectT = ce("table");
	var objectTable = ce("tbody");
	if (index === 0 ){
		var tr = ce("tr");
		var td = ce("td");
		td.colSpan=2;
		td.align="right";
		var inp = ce("input");
		inp.type="button";
		inp.value="Add another " + objectname;
		inp.id=inputId+"addbutton";
		inp.onclick=function(n,c,t,i){return function(){ createObjectLayout(n,c,t,i);};}(inputId, targetCell, objectname, 1);
		td.appendChild(inp);
		td.appendChild(ce("hr"));
		tr.appendChild(td);
		
		objectTable.appendChild(tr);
	}
	else if (index !== null && index > 0){
		tr = ce("tr");
		td = ce("td");
		td.colSpan=2;
		td.appendChild(ce("hr"));
		tr.appendChild(td);
		objectTable.appendChild(tr);
		inp = e(inputId+"addbutton");
		inp.onclick=function(n,c,t,i){return function(){ createObjectLayout(n,c,t,i);};}(inputId, targetCell, objectname, index+1);
	}
	for (i in obj.params){
		if (i){
			var p = obj.params[i];
			tr = ce("tr");
			td=ce("td");
			td.innerHTML= p.name;
			tr.appendChild(td);
			td=ce("td");
			inp = ce("input");
			if (p.type.substring(0,3)==="xs:"){
				inp.type="input";
				inp.id= inputId + p.name + (index === null ? "":index);
				inp.title = p.doc;
			}
			else{
				inp.type="button";
				if( p.isArray){
					inp.value="Add a " + p.type;
					inp.onclick = function(n,c,t,i){return function(){ createObjectLayout(n,c,t,i);};}(inputId+p.name + (index === null ? "":0),td, p.type,0);
				}
			}
			td.appendChild(inp);
			tr.appendChild(td);
			objectTable.appendChild(tr);
		}
	}
	objectT.appendChild(objectTable);
	targetCell.appendChild(objectT);
}

function createMethodLayout(resource,method){
	var d = ce("div");
	d.id="layout"+resource.name+method.name;
	var paramT = ce("table");
	paramT.width="400px";
	var paramTable = ce("tbody");
	var tr= ce("tr");
	var tdtitle = ce("td");
	tdtitle.colSpan=3;
	var h = ce("h2");
	h.innerHTML = method.name;
	tdtitle.appendChild(h);
	tr.appendChild(tdtitle);
	paramTable.appendChild(tr);
	tr= ce("tr");
	var tddoc = ce("td");
	tddoc.colSpan=3;
	tddoc.innerHTML = method.docs;
	tr.appendChild(tddoc);
	paramTable.appendChild(tr);
	tr= ce("tr");
	var tdu = ce("td");
	tdu.colSpan=3;
	tdu.align="center";
	if (Ribbit.Util.isValidString(method.uri)){
		tdu.innerHTML = "<hr/>"+resource.name+" " + method.name+" - <i>" + method.httpMethod + " to uri " +"/" + method.uri.replace("{","<b>","g").replace("}","</b>","g")+"</i><hr/>";
	}
	else{
		tdu.innerHTML="<hr/>"+ resource.name+"/"+method.name +" is a helper method<hr/>";
	}
	tr.appendChild(tdu);
	paramTable.appendChild(tr);
	
	for (var i in method.params){
			if (i>=0){
			tr =ce("tr");
			var tdk = ce("td");
			tdk.innerHTML=method.params[i].name + (method.params[i].required ? " *":""); 
						
			tr.appendChild(tdk);
			
			var tdv = ce("td");
			
			var inp = ce("input");
			inp.id="inp"+resource.name+method.name+method.params[i].name;
			if (!method.params[i].type || method.params[i].type.substring(0,3) === "xs:"){
				inp.type="text";
			}
			else{
				inp.type ="button";
				inp.value="Construct a " + method.params[i].type;
				inp.onclick = function(id,cell,name,index){ return function(){createObjectLayout(id, cell,name,index );};}(inp.id, tdv, method.params[i].type , method.params[i].isArray ? 0 : null );
			}
			if (method.params[i].name==="startIndex"){
				inp.value=0;
			}
			if (method.params[i].name==="count"){
				inp.value=10;
			}
			inp.title=method.params[i].doc;
			
			tdv.appendChild(inp);
			tr.appendChild(tdv);
			var tdh = ce("td");
			tdh.innerHTML= method.params[i].isArray===true ? "<i><span style='font-size:8pt'>create an array by separating with a comma</span><i>" : 
					method.params[i].type === "xs:dateTime" ? "<i><span style='font-size:8pt'>mm/dd/yyyy (hh:mm:ss)</span><i>" : "";
			tr.appendChild(tdh);
			paramTable.appendChild(tr);
		}
	}
	var trb = ce("tr");
	var tdb = ce("td");
	trb.appendChild(tdb);
	var tds = ce("td");
	var but = ce("input");
	but.id ="but"+resource.name+method.name;
	but.type="button";
	but.value= method.httpMethod === "GETSTREAMABLEURL" ? "Make Url" :method.httpMethod;
	but.onclick=function(){makeRequest(resource.name+"|"+method.name);};
	tds.align="right";
	tds.appendChild(but);
	trb.appendChild(tds);
	tdb = ce("td");
	trb.appendChild(tdb);
	
	paramTable.appendChild(trb);
	paramT.appendChild(paramTable);
	
	//create outputTable
	var outputT = ce("table");
	var outputTable = ce("tbody");
	var outputRow = ce("tr");
	outputRow.vAlign="top";
	//add parameter table
	td = ce("td");
	
	td.appendChild(paramT);
	outputRow.appendChild(td);

	//create report table
	var reportT = ce("table");
	reportT.style.visibility="hidden";
	reportT.id="report" + resource.name+method.name;
	var reportTable = ce("tbody");
	
	var logRow= ce("tr");
	td = ce("td");
	td.innerHTML = "<b>Request</b>";
	logRow.appendChild(td);
	reportTable.appendChild(logRow);
	
	logRow = ce("tr");
	td = ce("td");
	var dr = ce("div");
	dr.id="request"+resource.name+method.name;
	dr.setAttribute("class","output");
	dr.setAttribute("className","output");
	td.appendChild(dr);
	logRow.appendChild(td);
	reportTable.appendChild(logRow);

	logRow= ce("tr");
	td = ce("td");
	td.innerHTML = "<b>Response</b>";
	logRow.appendChild(td);
	reportTable.appendChild(logRow);

	logRow = ce("tr");
	td = ce("td");
	dr = ce("div");
	dr.id="response"+resource.name+method.name;
	dr.setAttribute("class","output");
	dr.setAttribute("className","output");
	td.appendChild(dr);
	logRow.appendChild(td);
	reportTable.appendChild(logRow);

	logRow= ce("tr");
	td = ce("td");
	td.innerHTML = "<b>Result</b>";
	logRow.appendChild(td);
	reportTable.appendChild(logRow);
	
	logRow=ce("tr");
	td = ce("td");
	dr = ce("div");
	dr.setAttribute("class","output");
	dr.setAttribute("className","output");
	dr.id="output"+resource.name+method.name;
	td.appendChild(dr);
	logRow.appendChild(td);
	reportTable.appendChild(logRow);

	td = ce("td");
	reportT.appendChild(reportTable);
	td.appendChild(reportT);
	
	outputRow.appendChild(td);
	outputTable.appendChild(outputRow );
	outputT.appendChild(outputTable);
	d.appendChild(outputT);
	
	return d;
}

function showLayout(layout){
	if (loggingIn){
		alert("Please complete the login process first");
		return;
	}
	e("auth").style.visibility="hidden";
	e("fileplayer").style.visibility="hidden";
	$("#scriptManager").hide();
	e("layout").style.visibility="visible";
	current = {};
	current.type="method";
	r = unescape(layout).split("|");
	current.resource=r[0];
	current.method=r[1];	
	for (var i in resources.resources){
		if (resources.resources[i].name == r[0]){
			var res = resources.resources[i];
			for (var j in res.methods){
				if (res.methods[j].name == r[1]){
					var meth = res.methods[j];
					break;
				}
			}
			break;
		}
	}
	var d = createMethodLayout(res,meth);
	e("layout").innerHTML="";
	e("layout").appendChild(d);
}

function executeRaw(){
	init();
	e("rawOutput").innerHTML="";
	e("rawRequest").innerHTML="";
	e("rawResponse").innerHTML="";
	e("rawTable").style.visibility="visible";
	setBusy(true);
	var handler = {
			callback: function(val){
				if (val.hasError === true){
					setBusy(false);
					alert("Status '" + val.status +"' returned from server");
				}
				else{
					var el = e("rawOutput");
					el.innerHTML = "";
					if (val.substring(0,1)=="{"){
						val = Ribbit.Util.JSON.parse(val);
					}
					el.appendChild(processResponse(val));
				}

				hist.push({
					type:"raw",
					params:getRawParams()
				});
				addHistoryItem((val.hasError ? "Failed - ":"") + e("rawHttpMethod").value +" "+ e("rawUri").value, hist.length-1);
				
				setBusy(false);
			}
	};
	var logger = {
			log:function(val){
				var s="";
				if (val.direction==="request"){
					s= val.method  +" to " + val.uri;
					for (i in val.headers){
						if (i >=0){
							s +="<br>" + val.headers[i][0] + ":<i>" + val.headers[i][1] +"</i>";
						}
					}
					if (val.body){
						s+="<br/>"+val.body;
					}
					e("rawRequest").innerHTML = s;
				}
				if (val.direction ==="response"){
					s = "HTTP STATUS - " + val.responseStatus +"<BR>";
					if (Ribbit.Util.isValidString(val.responseLocation)){
						s += "Location:<i>" +val.responseLocation + "</i>";
					}
					else if (val.responseText !== ""){
						s += "<i>"+val.responseText.substr(0,500) + "</i>" +(val.responseText.length <= 500 ? "": ".....<br/>("+val.responseText.length+" characters)");
					}
					e("rawResponse").innerHTML = s;
				}
			}
	};
	var cb =function(val){handler.callback(val);};
	var rsr = new Ribbit.RibbitSignedRequest();
	var b = e("rawBody").value !== "" ? e("rawBody").value : null ;
	var u =  e("rawUri").value;
	if (u.substring(0,1) =="/") {u = u.substring(1,u.length);}
	Ribbit.log = function(val){logger.log(val);};
	rsr.doCustom (e("rawHttpMethod").value, u, b,cb);
}
Ribbit.useJsonp = true;
e("useJsonp").checked= Ribbit.useJsonp ? "checked" :"";
function toggleJsonp(){
	Ribbit.useJsonp =! Ribbit.useJsonp;
}

function loadLayout(i){
	if (loggingIn){
		alert("Please complete the login process first");
		return;
	}
	var h = hist[i];
	if (h === undefined){return;}
	
	$("#scriptManager").hide();
	e("auth").style.visibility="hidden";
	e("fileplayer").style.visibility="hidden";
	e("layout").style.visibility="visible";
	if (h.type=="raw"){
		showRaw();
		e("rawTable").style.visibility="visible";
	}
	else{
		var b = "but"+h.resource + h.method;
		e("layout").innerHTML ="";
		var d = ce("div");
		d.id="layout"+h.resource + h.method;
		d.innerHTML = h.layout;
		e("layout").appendChild(d);
		e("but"+h.resource + h.method).onclick=function(){makeRequest(h.resource +"|"+ h.method);};
	}
	for (var j in h.params){
		if (j >= 0){
			var p  = h.params[j];
			if (p.setter==="html"){
				e(p.el).innerHTML = p.value;
			}
			else{
				e(p.el).value = p.value;
			}
		}
	}
}

function showLoginDetails(){
	var impersonate = readCookie("ribbit_impersonate") === "true";
	e("logonStatus").innerHTML = "Logged on as " + Ribbit.username +" <i>(id " + Ribbit.userId +")</i>";
	e("logonStatus").style.color="#00aa00";
	e("ribbitMobile").style.visibility="hidden";
	$("#loginButton").hide();
	e("userPasswordEntry").innerHTML ="";
	if (impersonate){
		e("userPasswordEntry").innerHTML =e("impersonation").innerHTML;
		e("userIdToImpersonate").onchange=function(){return function(){Ribbit.setImpersonatedUserId(e('userIdToImpersonate').value);};}();
	}
}
function toggleRibbitMobileStuff(val){
	if (Ribbit.Util.isValidString(val)){
		e("redirectAnchor").href=val;
		e("redirectAnchor").innerHTML=val;
		e("ribbitMobileLogin").style.visibility="visible";
		e("ribbitMobile").style.visibility="hidden";
	}
	else{
		e("redirectAnchor").href="#";
		e("redirectAnchor").innerHTML="";
		e("ribbitMobileLogin").style.visibility="hidden";
	}
}

function onGotUrl(result){
	setBusy(false);
	if (result){
		toggleRibbitMobileStuff(result);
	}
	else{
		alert ("Failed to get a request token");
	}
}
function ribbitMobileLogin(){
	init();
	Ribbit.log = function(val){};
	loggingIn = true;
	setBusy(true);
	Ribbit.createUserAuthenticationUrl(onGotUrl);
}


function ribbitMobileApproved(){
	var onChecked = function(result){
		setBusy(false);
		if (!result.hasError){
			createCookie("ribbit_impersonate","false",365);
			toggleRibbitMobileStuff(true);
			showLoginDetails(false);
			loggingIn = false;
		}
		else{
			alert ("Failed to exchange request tokens for access tokens. Did you approve the app?");
		}
	};
	setBusy(true);
	Ribbit.checkAuthenticatedUser(onChecked);
}

function logoff(){
	Ribbit.Logoff();
	window.location.reload();
}


function logon(){
	init();
	Ribbit.log = function(val){};
	cb = function(val){
			setBusy(false);
			if (val === true){
				createCookie("ribbit_impersonate","true",365);
				showLoginDetails();
				}
			else{
				alert("Incorrect username or password");
			}
		};
	var uid = e("userName").value;
	var pwd = e("userPassword").value;
	e("logonStatus").innerHTML = "Not logged on";
	e("logonStatus").style.color="#ff0000";
	setBusy(true);
	Ribbit.Login(cb, uid, pwd);
}

function methodsSorter(a,b){
	return a.name > b.name;
}

function sortMethods(data){
	
	for (var i in data.resources){
		if (i>=0){
			data.resources[i].methods = data.resources[i].methods.sort(methodsSorter);
		}
	}
	return data;
}

function getQueryVariable(variable) {
	var q = window.location.search.substring(1);
	var v = q.split("&");
	for (var i=0;i<v.length;i++) {
		var p = v[i].split("=");
		if (p[0] === variable) {
			return p[1];
		}
	}
	return null;
} 

function setup(){
	e("consumerKey").value = readCookie("ribbit_consumer_key");
	e("secretKey").value = readCookie("ribbit_secret_key");
	e("scriptEngineUrl").value = readCookie("ribbit_script_engine_url");
	el = e("environment");
	if (getQueryVariable("showScript") !== "true"){
		var sc = e("topScriptMenu");
		sc.parentNode.removeChild(sc);
	}
	
	Ribbit.accessTokenExpired = function(){
		Ribbit.Logoff();
		if (confirm("Your login session has expired. Pressing OK will reload the page")){
			window.location.reload();
		}
		else{
			e("userPasswordEntry").innerHTML = e("userPasswordContents").innerHTML;
			$("#loginButton").show();
		}
	};
	
	
	var c = Ribbit.readCookie();
	e("userPasswordEntry").innerHTML = e("userPasswordContents").innerHTML;
	if (c.consumerToken === e("consumerKey").value &&
		c.endpoint === readCookie("ribbit_environment")){
		
		if (e("userName")){
			if (Ribbit.Util.isValidString(c.accessToken) && Ribbit.Util.isValidString(c.username)){
				showLoginDetails();
			}
			else{
				 e("userName").value = "";
			}
		}
		
	}
	$.getJSON("environments.json", function(data) {
		el = e("environment");
		for (var j in data) {
			if (data[j]) {
				el.options[j] = new Option(data[j].name, data[j].uri);
			}
		}
		for (var i=0; i <el.length; i++){
			if (el.options[i].value === readCookie("ribbit_environment")){
				el.selectedIndex = i;
				break;
			}
		}
	});
	$.getJSON("js/kermitResource.json", function(data){
		var ul = ce("ul");		
		data= sortMethods(data);
		resources = data;
		var resourceholder = e("tabs");
		for (var i in data.resources){
			if (i>=0){
				var res = data.resources[i];
				var rli = ce("li");
				var a = ce("a");
				a.href="#";
				a.innerHTML=res.name;
				rli.appendChild(a);
				var u = ce("ul");
				var v = null;
				var max = 10;
				for (var j in res.methods){
					if (j>=0){
						var meth = res.methods[j];
						var mli = ce("li");
						
						a = ce("a");
						a.innerHTML=meth.name;
						a.href=res.name+"|"+meth.name;
						mli.appendChild(a);
						if (j >= max ){
							if (j % max === 0){
								if (v !== null){
									var mi = ce("li");
									var b = ce("a");
									b.innerHTML ="more";
									b.href="#";
									mi.appendChild(b);
									mi.appendChild(v);
									u.appendChild(mi);
								}
								v = ce("ul");
							}
						}
						if (v !== null){
							v.appendChild(mli);
						}
						else{
							u.appendChild(mli);
						}
					}
				}
				if (v !== null){
					mi = ce("li");
					b = ce("a");
					b.innerHTML ="more";
					b.href="#";
					mi.appendChild(b);
					mi.appendChild(v);
					u.appendChild(mi);
				}
				rli.appendChild(u);
				ul.appendChild(rli);
			}
		}
		var menu=e("menu-items");
		menu.appendChild(ul);
		$('#menu').menu({
			content:$('#menu').next().html(),
			flyOut:true
		});
		if (window.location.href.substring(0,4)==="http"){
			swfobject.embedSWF("player/RibbitPlayer.swf", "player", 1, 1,"10.0.0");
		}
		showConfig();		
	});
}
setup();
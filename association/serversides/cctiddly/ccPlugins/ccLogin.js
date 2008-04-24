/***
|''Name:''|ccLogin|
|''Description:''|Login Plugin for ccTiddly|
|''Version:''|2.1.5|
|''Date:''|Nov 27, 2007|
|''Source:''||
|''Author:''|SimonMcManus|
|''License:''|[[BSD open source license]]|
|''~CoreVersion:''|2.1.6|
|''Browser:''| Firefox |
***/

//{{{
config.backstageTasks.push("login");
merge(config.tasks,{login:{text: "login",tooltip: "Login to your TiddlyWiki",content: '&lt;&lt;ccLogin&gt;&gt;'}});

config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){};
var loginState=null;
var registerState=null;

config.macros.toolbar.isCommandEnabled=function(command,tiddler){	
	var title=tiddler.title;
	if (workspace_delete=="D"){
		// REMOVE OPTION TO DELETE TIDDLERS 
		if (command.text=='delete'){
			return false;
		}
	}
	if (workspace_udate=="D"){
		// REMOVE EDIT LINK FROM TIDDLERS 
		if (command.text=='edit'){
			return false;
		}
	}
	var ro=tiddler.isReadOnly();
	var shadow=store.isShadowTiddler(title) && !store.tiddlerExists(title);
	return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
};

// Returns output var with output.txtUsername and output.sessionToken
function findToken(cookieStash){
	var output={};
	if (!cookieStash){
		return false;
	}	
	//  THIS IS VERY HACKY AND SHOULD BE REFACTORED WHEN TESTS ARE IN PLACE
	var cookies=cookieStash.split('path=/');
	for(var c=0; c < cookies.length ; c++){
		var cl =cookies[c].split(";");
		for(var e=0; e &lt; cl.length; e++){ 
			var p=cl[e].indexOf("=");
			if(p!=-1){
				var name=cl[e].substr(0,p).trim();
				var value=cl[e].substr(p+1).trim();       
				if (name=='txtUserName'){
					output.txtUserName=value;
				}
				if (name=='sessionToken'){
					output.sessionToken=value;
				}
			}
		}
	}	
	return output;
}



function cookieString(str){
	var cookies = str.split(";");
	var output = {};
	for(var c=0; c < cookies.length; c++){
		var p = cookies[c].indexOf("=");
		if(p != -1) {
			var name = cookies[c].substr(0,p).trim();
			var value = cookies[c].substr(p+1).trim();
			if (name=='txtUserName'){
				output.txtUserName=value;
			}
			if (name=='sessionToken'){
				output.sessionToken=value;
			}
		}
	}
	return output;
}



function isLoggedIn(){
	var cookieValues=findToken(document.cookie);
	if (cookieValues.sessionToken && cookieValues.sessionToken!=='invalid' && cookieValues.txtUserName){
		return true;
	}else{
		return false;
	}
}

config.macros.ccLogin={};
config.macros.ccLogin.handler=function(place,macroName,params,wikifier,paramString,tiddler){
	var img=createTiddlyElement(place,"img");
	var loginDiv=createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(loginDiv);
};

config.macros.ccLogin.refresh=function(place,errorMsg){
	var loginDivRef=document.getElementById("LoginDiv");
	removeChildren(loginDivRef);
	var wrapper=createTiddlyElement(place,"div");
	var cookieValues=findToken(document.cookie);
	var frm="";
	if (isLoggedIn()){
		// user is logged in
		var msg=createTiddlyElement(wrapper,"div");
		wikify("You are viewing the workspace "+workspace +" and you are logged in as "+decodeURIComponent(decodeURIComponent(cookieValues.txtUserName)),msg);
		frm=createTiddlyElement(n,"form",null);
		frm.action="";
		frm.method="get";
		// TODO need to decide which method we are going to be using for login, form get, or on submit
		frm.onsubmit=config.macros.ccLogin.logoutOnSubmit;
		wrapper.appendChild(frm);		
		var logout=createTiddlyElement(null,"input",logout,logout);
		logout.setAttribute("type","hidden");
		logout.value="1";   
		logout.name="logout";   
		frm.appendChild(logout);	

		createTiddlyElement(frm,"br");
		var btn=createTiddlyElement(null,"input","button","button");
		btn.setAttribute("type","submit");
		btn.setAttribute("value","Logout");   
		frm.appendChild(btn);			
	}else{
		//user not logged in.	
		frm=createTiddlyElement(wrapper,"form",null,"wizard");
		frm.onsubmit=this.loginOnSubmit;

		createTiddlyElement(frm,"h1",null,null,"Login");
		createTiddlyElement(frm,"h2",null,null,"Login to ccTiddly");	
		createTiddlyElement(frm,"br");
		var body=createTiddlyElement(frm,"div",null,"wizardBody");
		var step=createTiddlyElement(body,"div",null,"wizardStep");

		if(errorMsg!==null){  
			createTiddlyElement(step,"span",null,null,errorMsg);
			createTiddlyElement(step,"br");
		}
		createTiddlyElement(step,"br");
		var oidfrm=createTiddlyElement(step,"form",null,null);
		oidfrm.method='get';
		oidfrm.action='includes/openid/try_auth.php';

		if (openid_enabled==1){
			createTiddlyElement(oidfrm,"br");
			createTiddlyText(oidfrm,"You can get an openID from ");
			var link=createExternalLink(oidfrm,'http://myopenid.com');
			link.textContent='http://myopenid.com';
			createTiddlyElement(oidfrm,"br");
			createTiddlyElement(oidfrm,"br");
			createTiddlyText(oidfrm,'OpenID:');
	
			var oidaction=createTiddlyElement(null,"input",null);
			oidaction.setAttribute("type","hidden");
			oidaction.setAttribute("value","verify");
			oidfrm.appendChild(oidaction);
	
			var oidid=createTiddlyElement(null,"input",null);
			oidid.setAttribute("type","text");
			oidid.setAttribute("name","openid_identifier");
			oidfrm.appendChild(oidid);
	
			var oidsub=createTiddlyElement(null,"input",null);
			oidsub.setAttribute("type","submit");
			oidsub.setAttribute("value","Verify");
			oidfrm.appendChild(oidsub);
		}else{ 
			var user_label=createTiddlyElement(step,"label",null,"label","Username");
			user_label.setAttribute("for","cctuser");
			var txtuser=createTiddlyElement(step,"input","cctuser","input");
			if (cookieValues.txtUserName!==null){
				txtuser.value=cookieValues.txtUserName ;
			}
			createTiddlyElement(step,"br");
			var pass_label=createTiddlyElement(step,"label",null,"label","Password");
			pass_label.setAttribute("for","cctpass");

			var txtpass=createTiddlyElement(null,"input","cctpass","input",null,{"type":"password"});
			//  var txtpass=createTiddlyElement(step,"input","cctpass","cctpass");
			txtpass.setAttribute("type","password");
			step.appendChild(txtpass);
			createTiddlyElement(step,"br");

			var submitSpan=createTiddlyElement(step,"div");
			submitSpan.setAttribute("class","submit");

			var btn1=createTiddlyElement(null,"input",this.prompt,"button");
			btn1.setAttribute("type","submit");
			btn1.setAttribute("id","loginButton");
			btn1.value="Login";
			submitSpan.appendChild(btn1);

			createTiddlyElement(submitSpan,'p');	
			var li=createTiddlyElement(submitSpan,'li');
			createTiddlyLink(li,'Register','Register');
			var li1=createTiddlyElement(submitSpan,'li');
			createTiddlyLink(li1,'Forgotten Details','Forgotten Details');
		}
	}
};

config.macros.killLoginCookie=function(){
	var c='sessionToken=invalid';
	c+="; expires=Fri, 1 Jan 1811 12:00:00 UTC; path=/";
	document.cookie=c;
};

config.macros.ccLogin.logoutOnSubmit=function(){
	var loginDivRef=findRelated(this,"loginDiv","className","parentNode");
	removeChildren(loginDivRef);
	document.cookie="sessionToken=invalid;   expires=15/02/2009 00:00:00";
	//config.macros.ccLogin.refresh(loginDivRef);
	doHttp('POST',url+'msghandle.php',"logout=1");
	window.location=window.location;      
	return false;
};

config.macros.ccLogin.logoutCallback=function(status,params,responseText,uri,xhr){
	displayMessage(status);
	//return true;
};
	
config.macros.ccLogin.loginCheckResp=function(){
		alert("Your Login has timed out. ");
			var but1=document.getElementById('loginButton');
		but1.disabled=false;
		but1.setAttribute("class","button");		
};

config.macros.ccLogin.loginOnSubmit=function(){
	var user=document.getElementById('cctuser').value;
	var pass=document.getElementById('cctpass').value;
	var but1=document.getElementById('loginButton');
	but1.disabled=true;
	but1.setAttribute("class","buttonDisabled");
	var params={}; 
	loginState ='';
	params.origin=this; 
	setTimeout(config.macros.ccLogin.loginCheckResp,3000);
	var loginResp=doHttp('POST',url+'/msghandle.php',"cctuser=" + encodeURIComponent(user)+"&amp;cctpass="+Crypto.hexSha1Str(pass).toLowerCase(),null,null,null,config.macros.ccLogin.loginCallback,params);
	return false;
};

config.macros.ccLogin.loginCallback=function(status,params,responseText,uri,xhr){
	var cookie;
	cookie=xhr.getResponseHeader("Set-Cookie");
	var cookieValues=findToken(cookie);
	config.macros.ccLogin.saveCookie(cookieValues);
	if(xhr.status!==401){
		window.location.reload();
	} else{
		if (xhr.responseText!==""){
			displayMessage(xhr.responseText);
		}
		var loginDivRef=findRelated(params.origin,"loginDiv","className","parentNode");
		removeChildren(loginDivRef);
		config.macros.ccLogin.refresh(loginDivRef,'Login Failed ');
		loginState='fail';
	}
	return true;
};

config.macros.ccLogin.saveCookie=function(cookieValues){
	// Save the session token in cookie.
	var c='sessionToken'+"="+cookieValues.sessionToken;

	c+="; expires=Fri, 1 Jan 2811 12:00:00 UTC; path=";
	document.cookie=c;
	// Save the txtUserName in the normal tiddlywiki format
   if (cookieValues.txtUserName!==null){
		 config.options.txtUserName=cookieValues.txtUserName;
		saveOptionCookie("txtUserName");
	}
};

function restart(){
	var tiddlers="";
 	tiddlers=store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));
	if (isLoggedIn()){
		tiddlers=store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));
	}
	story.displayTiddlers(null,tiddlers);	
	invokeParamifier(params,"onstart");
	window.scrollTo(0,0);
}
//}}}
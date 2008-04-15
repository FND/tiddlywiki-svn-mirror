<div title="AnonDefaultTiddlers" modifier="ccTiddly">
<pre>
[[Login]] [[GettingStarted]]
</pre>
</div>

<div title="ccLogin" modifier="ccTiddly"  tags="systemConfig excludeLists excludeSearch" >
<pre>	
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
merge(config.tasks,{
	login: {text: "login", tooltip: "Login to your TiddlyWiki", content: '&lt;&lt;ccLogin&gt;&gt;'}
});


function isLoggedIn()
{
	return true;
}

config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){};
var  loginState = null;
var  registerState = null;
<?php 

if ($workspace_create == "D")
{
	// REMOVE "new tiddler" and "new Journal link"
	// SHOW LOGIN TIDDLER
	?>
	// hide new journal
	config.macros.newJournal.handler=function(place,macroName,params,wikifier,paramString,tiddler){};

	// hide new tiddler 
	config.macros.newTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler){};
	<?php
} 

if ($workspace_read == "D")
{
	// DONT ANY OF RIGHT SIDE BAR 
	// SHOW LOGIN TIDDLER
	?>
//		displayMessage("You do NOT have read permissions. Please login to view the full Tiddlywiki");
	<?php
} 	
?>
config.macros.toolbar.isCommandEnabled = function(command,tiddler)
{	
	var title = tiddler.title;
	<?php
	if ($workspace_delete == "D")
	{
		// REMOVE OPTION TO DELETE TIDDLERS 
		?>	if (command.text=='delete')	
				return false;
				<?php
			}
			if ($workspace_udate == "D")
			{
				// REMOVE EDIT LINK FROM TIDDLERS 
				?>	if (command.text=='edit')	
					return false;
			<?php
			}
			?>
		var ro = tiddler.isReadOnly();

		var shadow = store.isShadowTiddler(title) && !store.tiddlerExists(title);
		return (!ro || (ro && !command.hideReadOnly)) && !(shadow && command.hideShadow);
	}

	var url = "<?php echo getURL();?>";
	// Returns output var with output.txtUsername and output.sessionToken

	function findToken(cookieStash) {
	var output = {};
	//SIMONMCMANUS
	if (!cookieStash)
	{
		return false;
	}
	
	var cookies =cookieStash.split("\n");
	for(var c=0; c&lt; cookies.length ; c++) {
		var cl = cookies[c].split(";");
		for(var e=0; e&lt;cl.length; e++) {
			var p = cl[e].indexOf("=");
			if(p != -1) {
				var name = cl[e].substr(0,p).trim();
				var value = cl[e].substr(p+1).trim();       
				if (name== 'txtUserName') {
					output.txtUserName = value;
				}
				if (name== 'sessionToken') {
					output.sessionToken = value;
				}
			}
		}
	}
	return output;
}

config.macros.ccLoginStatus = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {

	var loginDiv = createTiddlyElement(place,"div",null,"loginDiv",null);
		this.refresh(loginDiv);
	},
	
		   refresh: function(place, errorMsg) {
	  var loginDivRef = document.getElementById ("LoginDiv");
	 removeChildren(loginDivRef);
	 var wrapper = createTiddlyElement(place,"div");
		var cookieValues = findToken(document.cookie);
	
		if ( cookieValues.sessionToken && cookieValues.sessionToken!== 'invalid' && cookieValues.txtUserName) {
			createTiddlyElement(wrapper,"br");
			var name = decodeURIComponent(decodeURIComponent(cookieValues.txtUserName));
			
			var frm = createTiddlyElement(n,"form",null);
			frm.action = "";
			frm.method = "get";
			 //frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
			wrapper.appendChild(frm);	
			var str = wikify("You are viewing the workspace "+workspace +" and  are logged in as :  " + name , frm);
		  
			var logout = createTiddlyElement(null,"input", logout, logout);
			logout.setAttribute("type","hidden");
			logout.value = "1";   
			logout.name = "logout";   
			frm.appendChild(logout);	

			var btn = createTiddlyElement(null,"input", null);
			btn.setAttribute("type","submit");
			btn.value = "Logout";   
			frm.appendChild(btn);	

		} else {
			wikify("[[Login]]", wrapper);
		}
		
	}
}

config.macros.ccRegister = {
handler: function(place,macroName,params,wikifier,paramString,tiddler) 
{
	var registerDiv = createTiddlyElement(place,"div",null,"loginDiv",null);
	this.refresh(registerDiv);
},	    
refresh: function(place, errorMsg) 
{
	  var loginDivRef = document.getElementById("LoginDiv");
	 removeChildren(loginDivRef);
	var wrapper = createTiddlyElement(place,"div");

// SIMON MCMANUS 
<?php 
if ($tiddlyCfg['can_create_account'] != 1)
{
	?>
		createTiddlyElement(place,'div', null, "annotation",  'You do not have permissions to register for an account ');
		return null;
	<?php

}

?>




	if (errorMsg == '201')
	{
		return false;
	}
	var frm = createTiddlyElement(place,"form",null,"wizard");
	frm.onsubmit = this.registerOnSubmit;
	createTiddlyElement(frm,"h1", null, null,  "Register");
	createTiddlyElement(frm,"h2", null, null,  "Sign up for an account");
	createTiddlyElement(frm, "br");
	var body = createTiddlyElement(frm,"div",null, "wizardBody");
	var step = createTiddlyElement(body,"div",null, "wizardStep");

	var user_label = createTiddlyElement(step, "label", null, "label", "Username");
	user_label.setAttribute("for","username");
	var username = createTiddlyElement(step, "input", "username" , "input", "username");			
	username.setAttribute("onkeyup","config.macros.ccRegister.usernameKeyPress()");
	username.setAttribute("tabindex","1");
	createTiddlyElement(step, "span", 'username_error', 'inlineError', '');
	createTiddlyElement(step, "br");
	
	var mail_label = createTiddlyElement(step, "label", null, "label", "E-Mail Address");
	mail_label.setAttribute("for","username");
	var mail = createTiddlyElement(step, "input", "mail" , "input", "mail");		
	mail.setAttribute("onKeyUp","config.macros.ccRegister.mailKeyUp(this.value)");
	mail.setAttribute("tabindex","2");
	createTiddlyElement(step, "span", 'mail_error', 'inlineError', '');
	createTiddlyElement(step, "br");
	
	var pw1_label = createTiddlyElement(step, "label", null, "label", "Password");
	pw1_label.setAttribute("for","password1");
	var password1 = createTiddlyElement(step,"input", "password1","input", "password1");
	password1.type="password";
	createTiddlyElement(step, "span", 'pass1_error', 'inlineError', '');
	createTiddlyElement(step, "br");
	
	var pw2_label = createTiddlyElement(step, "label", null, "label", "Password Confirmation");
	pw2_label.setAttribute("for","password2");
	var password2 = createTiddlyElement(step,"input", "password2", "input", "password2");
	password2.type="password";
	
	createTiddlyElement(step, "span", 'pass2_error', 'inlineError', '');
	createTiddlyElement(step, "br");

	var a = 	createTiddlyElement(step, "div", null, "submit");
	var btn = createTiddlyElement(a,"input",this.prompt,"button", "button");
	 btn.setAttribute("type","submit");
	btn.setAttribute("value","Register Account"); 
	btn.setAttribute("id","registerAccountSubmit");
	createTiddlyElement(a, "span", "submitStatus", null, "");
},


emailValid : function(str) {
	if((str.indexOf(".") > 0) && (str.indexOf("@") > 0))
	{	
		return true;
	}else
	{
		return false;
	}
}, 

registerOnSubmit: function() {

	
	if(this.username.value === '')
	{
		document.getElementById('username_error').innerHTML = 'Please enter a username';
		this.username.setAttribute("class", "inputError");
		return false;
	}else
	{
		document.getElementById('username_error').innerHTML = 'Please enter a username';
		this.username.setAttribute("class", "input");
	}
	
	if(this.username.value =='')
	{
		displayMessage('no username entered');
	
	}
	if(config.macros.ccRegister.emailValid(this.mail.value))
	{
		var mail_space = document.getElementById('mail_error');
		mail_space.innerHTML="email ok";
		mail_space.setAttribute("class","inlineOk");
	}else
	{
		var mail_space = document.getElementById('mail_error');
		mail_space.innerHTML = 'not a valid email address ';
		mail_space.setAttribute("class","inlineError");
		return false;
	}
	
	
	if(this.password1.value === '')
	{
		document.getElementById('pass1_error').innerHTML = 'Please enter a password';
		this.password1.setAttribute("class", "inputError");
		return false;
	}else
	{
			document.getElementById('pass1_error').innerHTML = '';
			this.password1.setAttribute("class", "input");
	}
	if(this.password2.value === '')
	{
		document.getElementById('pass2_error').innerHTML = 'Please enter a password';
		this.password2.setAttribute("class", "inputError");
		return false;
	}else
	{
		document.getElementById('pass2_error').innerHTML = '';
		this.password2.setAttribute("class", "input");
	}
	if(this.password1.value != this.password2.value )
	{			

		this.password1.setAttribute("class", "inputError");
		document.getElementById('pass2_error').innerHTML = 'Please ensure both passwords match';
		this.password2.setAttribute("class", "inputError");
		return false;
	}
	
	
	var submit = document.getElementById('registerAccountSubmit');
	submit.disabled =true;
	submit.setAttribute("class","buttonDisabled");
	document.getElementById('submitStatus').innerHTML = 'Please wait, your account is being created.';
	
	
	
	setTimeout("config.macros.ccRegister.registerCheckResp()", 3000);
	doHttp('POST', url+'handle/register.php', "username=" + encodeURIComponent(this.username.value)+ "&amp;password="+Crypto.hexSha1Str(this.password1.value).toLowerCase(),null,null,null, config.macros.ccRegister.registerCallback,null);
			return false;
},

registerCheckResp: function() {
	if (registerState !="Fail" && registerState !="ok")
		alert("Your registration has timed out. ");
}, 


registerCallback: function(status,params,responseText,uri,xhr) {
	if(xhr.status == '201')
	{
			registerState = "ok";
			  var loginDiv = document.getElementById("LoginDiv");
			document.getElementById('submitStatus').innerHTML = 'Your account has been created ';
			document.getElementById('username').value = '';
			document.getElementById('mail').value = '';
			document.getElementById('password1').value = '';
			document.getElementById('password2').value = '';
			
			document.getElementById('username_error').innerHTML = '';
			document.getElementById('mail_error').innerHTML = '';
			document.getElementById('pass1_error').innerHTML = ''; 
			document.getElementById('pass2_error').innerHTML = ''; 
			var but = 	document.getElementById('registerAccountSubmit');
			but.disabled = false;
			but.setAttribute("class","button");
			document.getElementById('registerAccountSubmit').setAttribute('class', 'button');
	}else {
			registerState = "Fail";
	}
},


mailKeyUp: function(mail) {
	if(config.macros.ccRegister.emailValid(mail))
	{
					var a = document.getElementById('mail_error');
					var field = document.getElementById('mail');
					a.innerHTML = 'The email address is valid ';
					a.setAttribute("class","inlineOk");
					field.setAttribute("class", "input");
	}
},


usernameKeyPress: function() {

	doHttp('POST', url+'handle/register.php', "username="+document.getElementById("username").value+"&amp;free=1",null,null,null, config.macros.ccRegister.usernameCallback,null);
	return false;
},

usernameCallback: function(status,params,responseText,uri,xhr) {
		if(responseText > 0)
	{
	var error = document.getElementById('username_error');
	var field = document.getElementById('username');
	error.innerHTML = 'The username has already been taken. ';
	error.setAttribute("class","inlineError");
	field.setAttribute("class", "inputError");
	}else
	{
		var a = document.getElementById('username_error');
		var field = document.getElementById('username');
		a.innerHTML = 'The username is available ';
		a.setAttribute("class","inlineOk");
		field.setAttribute("class", "input");
	}
}	
}


config.macros.ccLogin = {
	
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	   var img = createTiddlyElement(place,"img");
	   img.src = 'http://www.cot.org.uk/designforliving/companies/logos/bt.jpg ';
		var loginDiv = createTiddlyElement(place,"div",null,"loginDiv",null);
		this.refresh(loginDiv);
	},

	refresh: function(place, errorMsg) {
		var loginDivRef = document.getElementById("LoginDiv");
		removeChildren(loginDivRef);
		var wrapper = createTiddlyElement(place,"div");
		var cookieValues = findToken(document.cookie);

		if ( cookieValues.sessionToken &amp;&amp;  cookieValues.sessionToken!== 'invalid' &amp;&amp; cookieValues.txtUserName) {
			// user is logged in
			var msg = createTiddlyElement(wrapper,"div");
			wikify("You are viewing the workspace "+workspace +" and you are logged in as " + decodeURIComponent(decodeURIComponent(cookieValues.txtUserName)), msg);
		  
		  
		  
			var frm = createTiddlyElement(n,"form",null);
			frm.action = "";
			frm.method = "get";
			// TODO need to decide which method we are going to be using for login, form get, or on submit
			frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
			wrapper.appendChild(frm);	
	
var logout = createTiddlyElement(null,"input", logout, logout);
logout.setAttribute("type","hidden");
logout.value = "1";   
logout.name = "logout";   
frm.appendChild(logout);	

			createTiddlyElement(frm,"br");
			var btn = createTiddlyElement(null,"input", null, "button");
			btn.setAttribute("type","submit");
			btn.value = "Logout";   
			frm.appendChild(btn);	
			
			
		} else {
			//user not logged in.
			
			var frm = createTiddlyElement(wrapper,"form",null, "wizard");
			frm.onsubmit = this.loginOnSubmit;

			createTiddlyElement(frm,"h1", null, null,  "Login");
			createTiddlyElement(frm, "h2", null, null,  "Login to ccTiddly");	
			createTiddlyElement(frm, "br");
			var body = createTiddlyElement(frm,"div",null, "wizardBody");
			var step = createTiddlyElement(body,"div",null, "wizardStep");

			if (errorMsg!= null)
			{  
				createTiddlyElement(step,"span", null, null, errorMsg);
				createTiddlyElement(step,"br");
			}
			createTiddlyElement(step,"br");
			var oidfrm = createTiddlyElement(step,"form",null, null);
			oidfrm.method = 'get';
			oidfrm.action='includes/openid/try_auth.php';
	
	
<?php 
 if ($tiddlyCfg['pref']['openid_enabled'] ==1)
{
	?>
		createTiddlyElement(oidfrm,"br");
		createTiddlyText(oidfrm,"You can get an openID from ");
		
		var link = createExternalLink(oidfrm, 'http://myopenid.com');
		link.textContent=  'http://myopenid.com';
		
		createTiddlyElement(oidfrm,"br");
		createTiddlyElement(oidfrm,"br");
		createTiddlyText(oidfrm, 'OpenID:');
		
		var oidaction = createTiddlyElement(null,"input",null);
		oidaction.setAttribute("type","hidden");
		oidaction.setAttribute("value","verify");
		oidfrm.appendChild(oidaction);
		
		var oidid = createTiddlyElement(null,"input",null);
		oidid.setAttribute("type","text");
		oidid.setAttribute("name","openid_identifier");
		oidfrm.appendChild(oidid);
		
		var oidsub = createTiddlyElement(null,"input",null);
		oidsub.setAttribute("type","submit");
		oidsub.setAttribute("value","Verify");
		oidfrm.appendChild(oidsub);
		
<?php 
}else { 
?>
	var user_label = createTiddlyElement(step, "label", null, "label", "Username");
	user_label.setAttribute("for","cctuser");
	var txtuser = createTiddlyElement(step,"input","cctuser", "input")
	if (cookieValues.txtUserName !=null) {
		txtuser.value =cookieValues.txtUserName ;
	}
	createTiddlyElement(step,"br");
	var pass_label = createTiddlyElement(step, "label", null, "label", "Password");
	pass_label.setAttribute("for","cctpass");

var txtpass =  createTiddlyElement(null, "input", "cctpass", "input", null, {"type":"password"});
//  var txtpass = createTiddlyElement(step,"input", "cctpass","cctpass");
 txtpass.setAttribute("type","password");
	 step.appendChild(txtpass);
		createTiddlyElement(step,"br");
	
	
		var submitSpan = createTiddlyElement(step, "div");
		submitSpan.setAttribute("class","submit");
	
		var btn = createTiddlyElement(null,"input",this.prompt, "button");
		btn.setAttribute("type","submit");
		btn.setAttribute("id","loginButton");
		btn.value = "Login"
		submitSpan.appendChild(btn);

		createTiddlyElement(submitSpan, 'p');	
		var li = createTiddlyElement(submitSpan, 'li');
		createTiddlyLink(li, 'Register',  'Register');
		var li1 = createTiddlyElement(submitSpan, 'li');
		createTiddlyLink(li1, 'Forgotten Details',  'Forgotten Details');

<?php
}
?>
		}
	 },

	killLoginCookie: function() {
		var c = 'sessionToken=invalid';
		c+= "; expires=Fri, 1 Jan 1811 12:00:00 UTC; path=/";
		document.cookie = c;
		},

	logoutOnSubmit: function() {
		var loginDivRef = findRelated(this,"loginDiv","className","parentNode");
		removeChildren(loginDivRef);
		 
		document.cookie = "sessionToken=invalid;   expires=15/02/2009 00:00:00";
		//config.macros.ccLogin.refresh(loginDivRef);
		doHttp('POST', url+'msghandle.php', "logout=1");
				window.location = window.location;      
return false;
	},


	logoutCallback: function(status,params,responseText,uri,xhr) {
   displayMessage(status);
 //return true;
	},
	
	loginCheckResp: function(){

		if (lalala =='fail')
		{
		 return false; 
		}
		alert("Your Login has timed out. ");
			var but1 = document.getElementById('loginButton');
		but1.disabled= false;
		but1.setAttribute("class","button");
		
	}, 

	loginOnSubmit: function() {
		var user = document.getElementById('cctuser').value;
		var pass = document.getElementById('cctpass').value;
		var but1 = document.getElementById('loginButton');
		but1.disabled= true;
		but1.setAttribute("class","buttonDisabled");
		var params = {}; 
		loginState =='';
		params.origin = this; 
		setTimeout("config.macros.ccLogin.loginCheckResp()", 3000);
		var loginResp = doHttp('POST', url+'/msghandle.php', "cctuser=" + encodeURIComponent(user)+"&amp;cctpass="+Crypto.hexSha1Str(pass).toLowerCase(),null,null,null, config.macros.ccLogin.loginCallback,params);


	   return false;
	},

	loginCallback: function(status,params,responseText,uri,xhr) {
		var cookie;
		cookie = xhr.getResponseHeader("Set-Cookie");
	  	var cookieValues = findToken(cookie);
		config.macros.ccLogin.saveCookie(cookieValues);
		displayMessage(xhr.status);
		if(xhr.status != 401) {
			window.location.reload();
		} else {
			if (xhr.responseText != "")
				displayMessage(xhr.responseText);
			var loginDivRef = findRelated( params.origin,"loginDiv","className","parentNode");
			removeChildren(loginDivRef);
			config.macros.ccLogin.refresh(loginDivRef, 'Login Failed ');
			loginState = 'fail';
			
		}
		return true;
	},


	saveCookie: function(cookieValues) {
		// Save the session token in cookie.
		var c = 'sessionToken' + "=" + cookieValues.sessionToken;
		c+= "; expires=Fri, 1 Jan 2811 12:00:00 UTC; path=";
		document.cookie = c;
		// Save the txtUserName in the normal tiddlywiki format
	   if (cookieValues.txtUserName !=null) {
			 config.options.txtUserName = cookieValues.txtUserName;
			saveOptionCookie("txtUserName");
		}
   }
}

function restart()
{
	var tiddlers = "";
 	tiddlers = store.filterTiddlers(store.getTiddlerText("AnonDefaultTiddlers"));
	var cookieValues = findToken(document.cookie);
	if ( cookieValues.sessionToken && cookieValues.sessionToken!== 'invalid' && cookieValues.txtUserName) {
		tiddlers = store.filterTiddlers(store.getTiddlerText("DefaultTiddlers"));
	}
	story.displayTiddlers(null,tiddlers);	
	invokeParamifier(params,"onstart");
	window.scrollTo(0,0);
}

//}}}


</pre>
</div>
<div title="LoginStatus" modifier="ccTiddly" >
<pre>
&lt;&lt;ccLoginStatus&gt;&gt;
</pre>
</div>
<div title="Login" modifier="ccTiddly">
<pre>
&lt;&lt;ccLogin&gt;&gt;
</pre>
</div>
<div title="Forgotten Details" modifier="ccTiddly">
<pre>
If you've forgotten your username and / or password, please contact the administrator:

simon@osmosoft.com
</pre>
</div>


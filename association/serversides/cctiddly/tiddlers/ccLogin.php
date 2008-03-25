
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

	config.backstageTasks.push(&quot;login&quot;);
	merge(config.tasks,{
	    login: {text: &quot;login&quot;, tooltip: &quot;Login to your TiddlyWiki&quot;, content: '&lt;&lt;ccLogin&gt;&gt;'}
	});
	
	
		config.macros.saveChanges.handler=function(place,macroName,params,wikifier,paramString,tiddler){};
	
	
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
	    var cookies =cookieStash.split(&quot;\n&quot;);
	    for(var c=0; c&lt; cookies.length ; c++) {
	        var cl = cookies[c].split(&quot;;&quot;);
	        for(var e=0; e&lt;cl.length; e++) {
	            var p = cl[e].indexOf(&quot;=&quot;);
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

        var loginDiv = createTiddlyElement(place,&quot;div&quot;,null,&quot;loginDiv&quot;,null);
	        this.refresh(loginDiv);
	    },
	    
	    	   refresh: function(place, errorMsg) {
	      var loginDivRef = document.getElementById (&quot;LoginDiv&quot;);
	     removeChildren(loginDivRef);
         var wrapper = createTiddlyElement(place,&quot;div&quot;);
	        var cookieValues = findToken(document.cookie);

	        if ( cookieValues.sessionToken && cookieValues.sessionToken!== 'invalid' && cookieValues.txtUserName) {
  				createTiddlyElement(wrapper,&quot;br&quot;);
				var name = decodeURIComponent(decodeURIComponent(cookieValues.txtUserName));
				
				var frm = createTiddlyElement(n,&quot;form&quot;,null);
				frm.action = "";
				frm.method = "get";
				 //frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
				wrapper.appendChild(frm);	
              	var str = wikify("You are logged in as :  " + name , frm);
			  
				var logout = createTiddlyElement(null,&quot;input&quot;, logout, logout);
				logout.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
				logout.value = &quot;1&quot;;   
				logout.name = &quot;logout&quot;;   
				frm.appendChild(logout);	

				var btn = createTiddlyElement(null,&quot;input&quot;, null);
				btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
				btn.value = &quot;Logout&quot;;   
				frm.appendChild(btn);	

	        } else {
				var str = wikify(&quot;[[Please Login]]&quot;, wrapper);
		    }
	        
		}
}

config.macros.ccRegister = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) 
	{
		var registerDiv = createTiddlyElement(place,&quot;div&quot;,null,&quot;loginDiv&quot;,null);
        this.refresh(loginDiv);
    },	    
	refresh: function(place, errorMsg) 
	{
		  var loginDivRef = document.getElementById (&quot;LoginDiv&quot;);
	     removeChildren(loginDivRef);
        var wrapper = createTiddlyElement(place,&quot;div&quot;);

if (errorMsg == '201')
{
	displayMessage('hding');
	return false;
}
		var frm = createTiddlyElement(place,&quot;form&quot;,null,"wizard");
		frm.onsubmit = this.registerOnSubmit;
		createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Register for an Account  &quot;);
		var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
		var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
	
		createTiddlyText(step, 'username  : ');
		var username = createTiddlyElement(step,&quot;input&quot;,&quot;username&quot;, &quot;username&quot;);			
		createTiddlyElement(step, "br");
		createTiddlyText(step, 'password : ');
		var password1 = createTiddlyElement(step,&quot;input&quot;,&quot;password1&quot;, &quot;password1&quot;);
		password1.type="password";
		createTiddlyElement(step, "br");
		createTiddlyText(step, 'password confirmation : ');
		var password2 = createTiddlyElement(step,&quot;input&quot;,&quot;password2&quot;, &quot;password2&quot;);
		password2.type="password";
	
		createTiddlyElement(frm, "br");
		var btn = createTiddlyElement(frm,&quot;input&quot;,this.prompt,"button", "button");
		 btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
		 btn.value = &quot;register account &quot;

		createTiddlyElement(frm, "br");
	},
	
	registerOnSubmit: function() {
	
		if(this.username.value == '')
		{
			this.username.style.border = 'solid 1px #f00';
			displayMessage('no username entered');
			return false;
		}
		if(this.password1.value == '')
		{
			displayMessage('please enter password in the first field');
			this.password1.style.border = 'solid 1px #f00';
			displayMessage('no username entered');
			return false;
		}
		if(this.password2.value == '')
		{
			this.password2.style.border = 'solid 1px #f00';
			displayMessage('please enter second password in the first field');
			return false;
		}
		if(this.password1.value != this.password2.value )
		{			
			this.password2.style.border = 'solid 1px #f00';
			this.password1.style.border = 'solid 1px #f00';
			displayMessage('Your passwords do not match.');
			return false;
		}
		doHttp('POST', url+'handle/register.php', &quot;username=&quot; + encodeURIComponent(this.username.value)+ &quot;&amp;password=&quot;+Crypto.hexSha1Str(this.password1.value).toLowerCase(),null,null,null, config.macros.ccRegister.registerCallback,null);
		return false;
	},
	
	
	registerCallback: function(status,params,responseText,uri,xhr) {
		if(xhr.status == '201')
		{
			displayMessage("USER CREATED");
			        this.refresh(loginDiv, '201');
		}
	

	}
}
	
	
	config.macros.ccLogin = {
		
	    handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	       // var img = createTiddlyElement(place,&quot;img&quot;);
	       // img.src = 'http://www.cot.org.uk/designforliving/companies/logos/bt.jpg ';
	        var loginDiv = createTiddlyElement(place,&quot;div&quot;,null,&quot;loginDiv&quot;,null);
	        this.refresh(loginDiv);
	    },

	    refresh: function(place, errorMsg) {
	        var loginDivRef = document.getElementById (&quot;LoginDiv&quot;);
	        removeChildren(loginDivRef);
	        var wrapper = createTiddlyElement(place,&quot;div&quot;);
	        var cookieValues = findToken(document.cookie);

	        if ( cookieValues.sessionToken &amp;&amp;  cookieValues.sessionToken!== 'invalid' &amp;&amp; cookieValues.txtUserName) {
	            // user is logged in
	            var msg = createTiddlyElement(wrapper,&quot;div&quot;);
	            wikify(&quot;You are logged in as &quot; + decodeURIComponent(decodeURIComponent(cookieValues.txtUserName)), msg);
	          
	          
	          
		  		var frm = createTiddlyElement(n,&quot;form&quot;,null);
	   			frm.action = "";
	    		frm.method = "get";
	 			// TODO need to decide which method we are going to be using for login, form get, or on submit
	            frm.onsubmit = config.macros.ccLogin.logoutOnSubmit;
        		wrapper.appendChild(frm);	
        
        
	            var logout = createTiddlyElement(null,&quot;input&quot;, logout, logout);
	           logout.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
	            logout.value = &quot;1&quot;;   
	            logout.name = &quot;logout&quot;;   
	            frm.appendChild(logout);	
	    
	    
	    
	            var btn = createTiddlyElement(null,&quot;input&quot;, null);
	           btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
	            btn.value = &quot;Logout&quot;;   
	            frm.appendChild(btn);	
	            
	            
	        } else {
	            //user not logged in.
	            
	            var frm = createTiddlyElement(wrapper,&quot;form&quot;,null, "wizard");
	            frm.onsubmit = this.loginOnSubmit;
	 			           var body = createTiddlyElement(frm,&quot;h1&quot;,null,null, "");
	          
	            createTiddlyElement(frm,&quot;br&quot;);
	            createTiddlyElement(frm,&quot;br&quot;);
	            var body = createTiddlyElement(frm,&quot;div&quot;,null, "wizardBody");
	            var step = createTiddlyElement(body,&quot;div&quot;,null, "wizardStep");
				
	 //createTiddlyElement(frm,&quot;h1&quot;, null, null,  &quot;Login is Required&quot;);
	            if (errorMsg!= null)
	            {  
	                createTiddlyElement(step,&quot;span&quot;, null, null, errorMsg);
	          		createTiddlyElement(step,&quot;br&quot;);
	          	}

	        
	   
			
			var oidfrm = createTiddlyElement(step,&quot;form&quot;,null, null);
			oidfrm.method = 'get';
			oidfrm.action='includes/openid/try_auth.php';
		
		
	<?php 
	 if ($tiddlyCfg['pref']['openid_enabled'] ==1)
	{
		
		?>
		      
				createTiddlyElement(oidfrm,&quot;br&quot;);
				         createTiddlyText(oidfrm,&quot;You can get an openID from &quot;);
				
				var link = createExternalLink(oidfrm, 'http://myopenid.com');
				link.textContent=  'http://myopenid.com';

				  		createTiddlyElement(oidfrm,&quot;br&quot;);
					createTiddlyElement(oidfrm,&quot;br&quot;);
			createTiddlyText(oidfrm, 'OpenID:');
			
			var oidaction = createTiddlyElement(null,&quot;input&quot;,null);
			oidaction.setAttribute(&quot;type&quot;,&quot;hidden&quot;);
			oidaction.setAttribute(&quot;value&quot;,&quot;verify&quot;);
			oidfrm.appendChild(oidaction);
			
			var oidid = createTiddlyElement(null,&quot;input&quot;,null);
			oidid.setAttribute(&quot;type&quot;,&quot;text&quot;);
			oidid.setAttribute(&quot;name&quot;,&quot;openid_identifier&quot;);
			oidfrm.appendChild(oidid);
			
			var oidsub = createTiddlyElement(null,&quot;input&quot;,null);
			oidsub.setAttribute(&quot;type&quot;,&quot;submit&quot;);
			oidsub.setAttribute(&quot;value&quot;,&quot;Verify&quot;);
			oidfrm.appendChild(oidsub);
			
	<?php 
}else { 
	?>
	
	
        createTiddlyText(step, &quot;username/password should get you in.&quot;);	
					createTiddlyElement(step,&quot;br&quot;);
	  createTiddlyText(step,&quot;Username: &quot;);
        var txtuser = createTiddlyElement(step,&quot;input&quot;,&quot;cctuser&quot;, &quot;cctuser&quot;)
        if (cookieValues.txtUserName !=null) {
            txtuser.value =cookieValues.txtUserName ;
        }
        createTiddlyElement(step,&quot;br&quot;);
        createTiddlyText(step,&quot;Password : &quot;);
    
   var txtpass =   createTiddlyElement(null, &quot;input&quot;, &quot;cctpass&quot;, &quot;cctpass&quot;, null, {&quot;type&quot;:&quot;password&quot;});
    //  var txtpass = createTiddlyElement(step,&quot;input&quot;, &quot;cctpass&quot;,&quot;cctpass&quot;);
     txtpass.setAttribute(&quot;type&quot;,&quot;password&quot;);
	     step.appendChild(txtpass);
			createTiddlyElement(frm,&quot;br&quot;);
			var btn = createTiddlyElement(null,&quot;input&quot;,this.prompt, "button");
			btn.setAttribute(&quot;type&quot;,&quot;submit&quot;);
			btn.value = &quot;Login&quot;
			frm.appendChild(btn);
			createTiddlyText(frm, " or ");
			createTiddlyLink(frm, 'Register',  'Register');

	<?php
}
	?>
			
			createTiddlyElement(frm,&quot;br&quot;);
			createTiddlyElement(frm,&quot;br&quot;);
			}
	     },

	    killLoginCookie: function() {
	        var c = 'sessionToken=invalid';
	        c+= &quot;; expires=Fri, 1 Jan 1811 12:00:00 UTC; path=/&quot;;
	        document.cookie = c;
	        },

	    logoutOnSubmit: function() {
	        var loginDivRef = findRelated(this,&quot;loginDiv&quot;,&quot;className&quot;,&quot;parentNode&quot;);
	        removeChildren(loginDivRef);
		     
	        document.cookie = &quot;sessionToken=invalid;   expires=15/02/2009 00:00:00&quot;;
	        //config.macros.ccLogin.refresh(loginDivRef);
	        doHttp('POST', url+'msghandle.php', &quot;logout=1&quot;);
	        		window.location = window.location;      
	return false;
	    },


	    logoutCallback: function(status,params,responseText,uri,xhr) {
	   
	 //return true;
	    },

	    loginOnSubmit: function() {
	        var user = document.getElementById('cctuser').value;
	        var pass = document.getElementById('cctpass').value;
	        var params = {}; 
	        params.origin = this;
	        var loginResp = doHttp('POST', url+'/msghandle.php', &quot;cctuser=&quot; + encodeURIComponent(user)+&quot;&amp;cctpass=&quot;+encodeURIComponent(pass),null,null,null, config.macros.ccLogin.loginCallback,params);
	    
	       return false;
	    },

	    loginCallback: function(status,params,responseText,uri,xhr) {
	        if (status==true) {
	         // displayMessage('CONECTION was ok ');
	        }
	     var cookie;
	     cookie = xhr.getResponseHeader(&quot;Set-Cookie&quot;);
	   
	        var cookieValues = findToken(cookie);
	        
	        config.macros.ccLogin.saveCookie(cookieValues);
	        if(xhr.status != 401) {
				window.location = window.location;
			} else {
				if (xhr.responseText != "")
					displayMessage(xhr.responseText);
	
				var loginDivRef = findRelated( params.origin,&quot;loginDiv&quot;,&quot;className&quot;,&quot;parentNode&quot;);
		        removeChildren(loginDivRef);
				config.macros.ccLogin.refresh(loginDivRef, 'Login Failed ');
					
			}
			return true;
			 },


	       saveCookie: function(cookieValues) {
	        // Save the session token in cookie.
	        var c = 'sessionToken' + &quot;=&quot; + cookieValues.sessionToken;
	        c+= &quot;; expires=Fri, 1 Jan 2811 12:00:00 UTC; path=&quot;;
	        document.cookie = c;
	        // Save the txtUserName in the normal tiddlywiki format
	       if (cookieValues.txtUserName !=null) {
	             config.options.txtUserName = cookieValues.txtUserName;
	            saveOptionCookie(&quot;txtUserName&quot;);
	        }
	   }
	}
	//}}}

</pre>
</div>
<div title="LoginStatus" modifier="ccTiddly" >
<pre>
&lt;&lt;ccLoginStatus&gt;&gt;
</pre>
</div>
<div title="Please Login" modifier="ccTiddly">
<pre>
&lt;&lt;ccLogin&gt;&gt;
</pre>
</div>
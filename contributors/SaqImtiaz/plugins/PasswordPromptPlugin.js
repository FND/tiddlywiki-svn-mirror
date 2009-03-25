PasswordPrompt ={
	prompt : function(callback,context){
		if (!context)
			context = {};
		//var box = createTiddlyElement(document.getElementById("contentWrapper"),'div','passwordpromptBox');
		var box = document.getElementById('passwordpromptBox') || createTiddlyElement(document.body,'div','passwordpromptBox');
		box.innerHTML = store.getTiddlerText('PasswordPromptTemplate');
		box.style.position = 'absolute';		this.center(box);
		this.showCloak();
		var passwordEl = document.getElementById("passwordInputField");
		var usernameEl = document.getElementById("usernameInputField");
		if(context.username)
			usernameEl.value = context.username;
		if(context.password)
			passwordEl.value = context.password;
		if(passwordEl) {
			passwordEl.onkeyup = function(ev) {
				var e = ev || window.event;
				if(e.keyCode == 10 || e.keyCode == 13) { // Enter
					PasswordPrompt.submit(callback, context);
				}
			};
		}		
		var submitBtn = document.getElementById('passwordpromptSubmitBtn');
		submitBtn.onclick = function(){PasswordPrompt.submit(callback,context); return false;};
		var cancelBtn = document.getElementById('passwordpromptCancelBtn');
		cancelBtn.onclick = function(){PasswordPrompt.remove(); return false;};
	},	
	
	center : function(el){
		var size = this.getsize(el);
		el.style.left = (Math.round(findWindowWidth()/2) - (size.width /2) + findScrollX())+'px';
		el.style.top = (Math.round(findWindowHeight()/2) - (size.height /2) + findScrollY())+'px';
	},
	
	getsize : function (el){
		var x = {};
		x.width = el.offsetWidth || el.style.pixelWidth;
		x.height = el.offsetHeight || el.style.pixelHeight;
		return x;
	},
	
	showCloak : function(){
		var cloak = document.getElementById('backstageCloak');
		if (config.browser.isIE){
			cloak.style.height = Math.max(document.documentElement.scrollHeight,document.documentElement.offsetHeight);
			cloak.style.width = document.documentElement.scrollWidth;
		}
		cloak.style.display = "block";
	},
	
	submit : function(cb,context){
		context.username = document.getElementById('usernameInputField').value;
		context.password = document.getElementById('passwordInputField').value;
		cb(context);
		PasswordPrompt.remove();
		return false;
	},
	
	remove : function(){
		var box = document.getElementById('passwordpromptBox');
		box.parentNode.removeChild(box);
		document.getElementById('backstageCloak').style.display = "";
		return false;
	},
	
	setStyles : function(){
		setStylesheet(
		"#passwordpromptBox dd.submit {margin-left:0; font-weight: bold; margin-top:1em;}\n"+
 		"#passwordpromptBox dd.submit .button {padding:0.5em 1em; border:1px solid #ccc; margin-right:1em;}\n"+
 		"#passwordpromptBox dt.heading {margin-bottom:0.5em; font-size:1.2em;}\n"+
 		"html > body > #backstageCloak {height:100%;}"+
 		"#passwordpromptBox {border:1px solid #ccc;background-color: #eee;padding:1em 2em; z-index:9999;}",'passwordpromptStyles');
 		
	},
	
	template : "<form action=\"\" onsubmit=\"return false;\" id=\"passwordpromptForm\">\n"+
			 "    <dl>\n"+
			 "        <dt class=\"heading\">Please enter your username and password:</dt>\n"+
			 "        <dt>Username:</dt>\n"+
			 "        <dd><input type=\"text\" tabindex=\"1\" id=\"usernameInputField\" class=\"input\"/></dd>\n"+
			 "        <dt>Password:</dt>\n"+
			 "        <dd><input type=\"password\" tabindex=\"2\" class=\"input\" id=\"passwordInputField\"/></dd>\n"+
			 "        <dd class=\"submit\">\n"+
			 "            <a tabindex=\"3\" href=\"javascript:;\" class=\"button\" id=\"passwordpromptSubmitBtn\">OK</a>\n"+
			 "			  <a tabindex=\"4\" href=\"javascript:;\" class=\"button\" id=\"passwordpromptCancelBtn\">Cancel</a>\n"+
			 "        </dd>\n"+
			 "    </dl>\n"+
			 "</form>",
			 
	init : function(){
		config.shadowTiddlers.PasswordPromptTemplate = this.template;
		this.setStyles();
	}
};

PasswordPrompt.init();

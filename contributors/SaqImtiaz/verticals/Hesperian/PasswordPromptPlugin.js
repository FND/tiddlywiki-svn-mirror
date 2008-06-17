PasswordPrompt ={
	prompt : function(callback,context){
		if (!context)
			context = {};
		var box = createTiddlyElement(document.getElementById("contentWrapper"),'div','passwordpromptBox');
		box.innerHTML = store.getTiddlerText('PasswordPromptTemplate');
		box.style.position = 'absolute';
		this.center(box);
		var btn = document.getElementById('passwordpromptSubmitBtn');
		btn.onclick = function(){PasswordPrompt.submit(callback,context);};
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
	
	submit : function(cb,context){
		context.username = document.getElementById('usernameInputField').value;
		context.password = document.getElementById('passwordInputField').value;
		cb(context);
		var box = document.getElementById('passwordpromptBox');
		box.parentNode.removeChild(box);
		return false;
	},
	
	setStyles : function(){
		setStylesheet(
		"#passwordpromptBox dd.submit {margin-left:0; font-weight: bold; margin-top:1em;}\n"+
 		"#passwordpromptBox dd.submit .button {padding:0.5em 1em; border:1px solid #ccc;}\n"+
 		"#passwordpromptBox dt.heading {margin-bottom:0.5em; font-size:1.2em;}\n"+
 		"#passwordpromptBox {border:1px solid #ccc;background-color: #eee;padding:1em 2em;}",'passwordpromptStyles');
	},
	
	template : "<form action=\"\" onsubmit=\"return false;\" id=\"passwordpromptForm\">\n"+
			 "    <dl>\n"+
			 "        <dt class=\"heading\">Please enter your username and password:</dt>\n"+
			 "        <dt>Username:</dt>\n"+
			 "        <dd><input type=\"text\" tabindex=\"1\" id=\"usernameInputField\" class=\"input\"/></dd>\n"+
			 "        <dt>Password:</dt>\n"+
			 "        <dd><input type=\"password\" tabindex=\"2\" class=\"input\" id=\"passwordInputField\"/></dd>\n"+
			 "        <dd class=\"submit\">\n"+
			 "            <a tabindex=\"4\" href=\"javascript:;\" class=\"button\" id=\"passwordpromptSubmitBtn\">OK</a>\n"+
			 "        </dd>\n"+
			 "    </dl>\n"+
			 "</form>",
			 
	init : function(){
		config.shadowTiddlers.PasswordPromptTemplate = this.template;
		this.setStyles();
	}
};

PasswordPrompt.init();


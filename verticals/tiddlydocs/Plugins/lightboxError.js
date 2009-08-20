
config.extensions.ServerSideSavingPlugin.reportSuccess = function() {
}

config.extensions.ServerSideSavingPlugin.reportFailed = function(tiddler, context){
	alert('Your changes were not saved');
}

	config.macros.lightboxError = {};
	config.macros.lightboxError.hander = function(place,macroName,params,wikifier,paramString,tiddler) {	
	}

	config.macros.lightboxError.center  = function(el){
		var size = this.getsize(el);
		el.style.left = (Math.round(findWindowWidth()/2) - (size.width /2) + findScrollX())+'px';
		el.style.top = (Math.round(findWindowHeight()/2) - (size.height /2) + findScrollY())+'px';
	}

	config.macros.lightboxError.getsize = function (el){
		var x ={};
		x.width = el.offsetWidth || el.style.pixelWidth;
		x.height = el.offsetHeight || el.style.pixelHeight;
		return x;
	}

	config.macros.lightboxError.showCloak = function(){
		var cloak = document.getElementById('backstageCloak');
		if (config.browser.isIE){
			cloak.style.height = Math.max(document.documentElement.scrollHeight,document.documen`tElement.offsetHeight);
			cloak.style.width = document.documentElement.scrollWidth;
		}
		cloak.style.display = "block";
	}

	ccTiddlyAdaptor.hideError = function(){
		var box = document.getElementById('errorBox');
		box.parentNode.removeChild(box);
		document.getElementById('backstageCloak').style.display = "";
	}

	




ccTiddlyAdaptor.handleError = function(error_code){
		setStylesheet(
		"#errorBox .button{padding:0.5em 1em; border:1px solid #222; background-color:#ccc; color:black; margin-right:1em;}\n"+
		"html > body > #backstageCloak{height:100%;}"+
		"#errorBox{border:1px solid #ccc;background-color: #eee; color:#111;padding:1em 2em; z-index:9999;}",'errorBoxStyles');
		var box = document.getElementById('errorBox') || createTiddlyElement(document.body,'div','errorBox');
		var error = ccTiddlyAdaptor.errorTitleNotSaved;
		switch(error_code){
			case 401:
				error += ccTiddlyAdaptor.errorTextSessionExpired;
				break;
			case 409:
				error += "\n\n"+ccTiddlyAdaptor.errorTextConfig+"\n \n error code : "+error_code+" \n";
				break;

			default:
				error += ccTiddlyAdaptor.errorTextUnknown+"<br />"+error_code;
		}
		box.innerHTML = " <a style='float:right' href='javascript:onclick=ccTiddlyAdaptor.hideError()'>"+ccTiddlyAdaptor.errorClose+"</a><p>"+error+"</p><br/><br/>";
		createTiddlyButton(box,ccTiddlyAdaptor.buttonOpenNewWindow,null,function(e){ window.open (window.location,"mywindow");	 return false;});
		createTiddlyElement(box,"br");
		createTiddlyElement(box,"br");
		createTiddlyButton(box,ccTiddlyAdaptor.buttonHideThisMessage,null,function(){ccTiddlyAdaptor.hideError();});
		box.style.position = 'absolute';
		ccTiddlyAdaptor.center(box);
		ccTiddlyAdaptor.showCloak();
	}






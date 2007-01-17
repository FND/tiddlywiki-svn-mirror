/***
|''Name:''|PasswordOptionPlugin|
|''Description:''|Extends TiddlyWiki options with non encrypted password option|
|''Version:''|1.0.0|
|''Date:''|Jan 17, 2007|
|''Source:''|http://tiddlywiki.bidix.info/#PasswordOptionPlugin|
|''Documentation:''|not yet|
|''Author:''|BidiX (BidiX (at) bidix (dot) info)|
|''License:''|[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D ]]|
|''~CoreVersion:''|2.2.0 (Beta 3)|
|''Browser:''|http://www.tiddlywiki.com/#browsers|
***/
//{{{
version.extensions.PasswordOptionPlugin = {
	major: 1, minor: 0, revision: 0, 
	date: new Date(2007,7,0),
	source: 'http://tiddlywiki.bidix.info/#GenerateRssHijack',
	documentation: 'http://tiddlywiki.bidix.info/#PasswordOptionPlugin',
	author: 'BidiX (BidiX (at) bidix (dot) info',
	license: '[[BSD open source license|http://tiddlywiki.bidix.info/#%5B%5BBSD%20open%20source%20license%5D%5D]]',
	coreVersion: '2.2.0 (Beta 3)',
	browser: 'Firefox 1.5; InternetExplorer 6.0; Safari'	
};
config.macros.option.passwordCheckboxLabel = "Save this password on this computer";
config.macros.option.passwordInputType = "password"; // password | text
setStylesheet(".pasOptionInput {width: 11em;}\n","passwordInputTypeStyle");

merge(config.macros.option.types, {
	'pas': {
		elementType: "input",
		valueField: "value",
		eventName: "onkeyup",
		className: "pasOptionInput",
		typeValue: config.macros.option.passwordInputType,
		create: function(opt,place,params) {
			// password field
			config.macros.option.createHelper(opt,place,params,this);
			// checkbox linked with this password "save this password on this computer"
			config.macros.option.createHelper("chk"+opt,place,params,config.macros.option.types['chk']);			
			// text savePasswordCheckboxLabel
			place.appendChild(document.createTextNode(config.macros.option.passwordCheckboxLabel));
		}
	}
});

merge(config.optionHandlers['chk'], {
	export: function(name) {
		// is there an option linked with this chk ?
		var opt = name.substr(3);
		if (config.options[opt]) 
			saveOptionCookie(opt);
		return config.options[name] ? "true" : "false";
	}
});

merge(config.optionHandlers, {
	'pas': {
 		export: function(name) {
			if (config.options["chk"+name]) {
				return escape(config.options[name].toString());
			} else {
				return "";
			}
		},
		import: function(name,value) {config.options[name] = unescape(value);}
	}
});

// need to reload options to load passwordOptions
loadOptionsCookie();

//}}}
config.macros.taggedTabs={};

config.macros.taggedTabs.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var params = paramString.parseParams("taggedTabset",null,true,false,false);
	var tagged = store.getTaggedTiddlers(params[1].value,"title").reverse();
	var cookie = "taggedTabs";
	var wrapper = createTiddlyElement(null,"div",null,"tabsetWrapper taggedTabset" + cookie);
	var tabset = createTiddlyElement(wrapper,"div",null,"tabset");
	var validTab = false;
	tabset.setAttribute("cookie",cookie);
	for(var t=0; t<tagged.length; t++) {
		var label = tagged[t].title;
		if(label=='ccLogin') 
			tabLabel = config.macros.ccLogin.buttonLogin;
		else
			tabLabel = label;
		var prompt = tagged[t].title;
		var tab = createTiddlyButton(tabset,tabLabel,prompt,config.macros.tabs.onClickTab,"tab tabUnselected");
		tab.setAttribute("tab",label);
		tab.setAttribute("content",label);
		if(config.options[cookie] == label)
			validTab = true;
	}
	if(!validTab)
		config.options[cookie] = tagged[0].title;
	place.appendChild(wrapper);
	config.macros.tabs.switchTab(tabset, config.options[cookie]);
	
	setStylesheet("div.tiddler .tab {font-size:1.2em;  font-weight:bold;padding-left:2em; padding-right:2em; margin-left:0px; margin-right:1em; padding-bottom:2px}"+
	"div.tiddler .wizard { margin:0px; }"+
	" div.tabContents .wizard { margin:0px; }"+
	".tabsetWrapper .wizard h1 {display:none}"+
	".tabsetWrapper .wizard h2 {padding:0.5em}"+
	".viewer {float:right; width:90%;}"+

"div.viewer  div.tabsetWrapper{width:90%}"+
	"a.tabSelected{ filter:'alpha(opacity:60)'; }"+
	"div.tabset {padding:0px}"+
	"div.tabContents {padding:0px; background:transparent}",
	 "taggedTabs");
	
};



//}}}

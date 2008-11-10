config.macros.loginTabs={};

config.macros.loginTabs.handler=function(place,macroName,params,wikifier,paramString,tiddler,errorMsg){
	var tagged = store.getTaggedTiddlers("loginBox","title").reverse();
	if(tagged.length==1 || isLoggedIn()==1){
		wikify(tagged[0].text, place);
		return true;
	}
	var cookie = "loginTabs";
	var wrapper = createTiddlyElement(null,"div",null,"tabsetWrapper " + cookie);
	var tabset = createTiddlyElement(wrapper,"div",null,"tabset");
	var validTab = false;
	tabset.setAttribute("cookie",cookie);
	for(var t=0; t<tagged.length; t++) {
		var label = tagged[t].title;
		if(label=='ccLogin') 
			tabLabel = "Login";
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
	
	setStylesheet("div.tiddler .tab {font-size:1.2em;  font-weight:bold;padding:5px;padding-bottom:2px; padding-left:2em; padding-right:2em; margin-left:0px; margin-right:1em;}"+
	"div.tiddler .wizard { margin:0px; }"+
	" div.tabContents .wizard { margin:0px; }"+
	".viewer {float:right; width:90%;}"+
	"a.tabUnselected{ background-color:#ddd;}"+
	"a.tabSelected:hover, a.tabUnselected:hover{ color:black}"+
"div.viewer  div.tabsetWrapper{width:90%}"+
	"a.tabSelected{ filter:'alpha(opacity:60)'; background-color:white;}"+
	"div.tabset {padding:0px}"+
	"div.tabContents {padding:0px; background:transparent}",
	 "loginTabs");
	
};



//}}}

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
		var prompt = tagged[t].title;
		var tab = createTiddlyButton(tabset,label,prompt,config.macros.tabs.onClickTab,"tab tabUnselected");
		tab.setAttribute("tab",label);
		tab.setAttribute("content",label);
		if(config.options[cookie] == label)
			validTab = true;
	}
	if(!validTab)
		config.options[cookie] = tagged[0].title;
	place.appendChild(wrapper);
	config.macros.tabs.switchTab(tabset,config.options[cookie]);
	
	setStylesheet("div.tiddler .tab {font-size:1.2em; padding-bottom:0px; padding-left:5px; padding-right:5px}"+
	".viewer .wizard, body .wizard { margin:0px;}"+
	"div.tabContents {padding:0px; background:transparent}",
	 "loginTabs");
	
};



//}}}

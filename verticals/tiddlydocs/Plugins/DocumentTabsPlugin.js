/***
|''Name''|DocumentTabsPlugin|
|''Description''|Provides tabs which users can use to change the current active document to any document which already exists.|
|''Authors''|Simon McManus|
|''Version''|0.1|
|''Status''|stable|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''Requires''||
!Description

Provides tabs which users can use to change the current active document to any document which already exists.

!Usage
{{{

<<docTabs>>

}}}

!Code
***/

//{{{
	
config.macros.docTabs = {
	deleteLink:"x", 
	deleteToolTip:"Click to delete this document.",
};
config.macros.docTabs.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
		var tagged = store.getTaggedTiddlers('document').reverse();
		var cookie = "documentTabs";
		var wrapper = createTiddlyElement(null,"div",null,"docTabset tabsetWrapper taggedTabset " + cookie);
		var tabset = createTiddlyElement(wrapper,"div",null,"tabset");
		var validTab = false;
		tabset.setAttribute("cookie",cookie);
		for(var t=0; t<tagged.length; t++) {
			if(tagged[t].title == window.activeDocument){
				var tabSelected = "tab tabSelected docTabSelected";
			}else{
				var tabSelected = "tab tabUnselected docTabUnselected";
			}
			var label = tagged[t].title;
				tabLabel = label;
			var prompt = tagged[t].title;
			var tab = createTiddlyButton(tabset,tabLabel,prompt,config.macros.docTabs.onTabClick,tabSelected);
			var delButton = createTiddlyElement(tab, "a", null, 'deleteDocumentButton', config.macros.docTabs.deleteLink);
			delButton.title = config.macros.docTabs.deleteToolTip;
			createTiddlyText(tab, " "); 
			jQuery(delButton).click(function(){
				var answer = confirm("Are you sure you want to delete the document : "+this.parentNode.title);
				if (answer){
					jQuery(this.parentNode).fadeOut("slow");
					store.removeTiddler(this.parentNode.title);
					autoSaveChanges(true, this.parentNode.title);
					window.activeDocument = store.getTaggedTiddlers('document')[0].title;
				}
				return false;
			});
			tab.setAttribute("tab",label);
			if(config.options[cookie] == label)
				validTab = true;
		}
		if(!validTab)
			config.options[cookie] = tagged[0].title;
		place.appendChild(wrapper);
};

config.macros.docTabs.onTabClick = function() {
	config.macros.docTabs.switchDoc(this.title);
	refreshAll();
	
};

config.macros.docTabs.switchDoc = function (title) {
	window.activeDocument = title;
	refreshAll();
	var spec = jQuery.parseJSON(store.getTiddlerText(title));	
	if(spec.content[0] != undefined){
		story.displayTiddler(null, spec.content[0].title);
	}
}

config.shadowTiddlers["DocumentTabsPluginStyles"] = store.getTiddlerText("DocumentTabsPlugin##StyleSheet");
store.addNotification("DocumentTabsPluginStyles", refreshStyles);

//################################################################################
//# CUSTOM STYLESHEET
//################################################################################
	
/***
!StyleSheet
 .docTabSelected,  .docTabUnselected {
	padding:0.5em 1em;
	-moz-border-radius-topright :10px;
	-webkit-border-top-right-radius: 10px;
	-moz-border-radius-topleft :10px;
	-webkit-border-top-left-radius: 10px;
}
.docTabSelected {
	background:#fff;
}
a.docTabUnselected {
	color:#fff;
}

.header a:hover {
	background:#ddd;
	color:#555;
}

html body .headerShadow, html body .headerForeground{
	padding:2em 0 0 2em;
}

.docTabset {
	padding:1em;
	margin-bottom:-1.2em;
}
.taggedTabset {
	line-height:2.5em;
}

a.deleteDocumentButton {
	padding:1px 3px;
	margin-left:3px;
}

a.deleteDocumentButton:hover {
	background:[[ColorPalette::SecondaryLight]]; 
	border-color:[[ColorPalette::SecondaryMid]];
}

!(end of StyleSheet)
***/

//}}}

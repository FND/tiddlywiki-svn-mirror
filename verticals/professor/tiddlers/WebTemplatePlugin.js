/***
!WebTemplatePlugin with ViewSourcePlugin and 404TiddlerPlugin
''Version'': 0.3 (19 Jan 2006)
''Author'': Clint Checketts

!Instructions
WebPageTemplate
WebViewTemplate
WebEditTemplate

!Code
***/
//{{{
config.options.chkHttpReadOnly = true;
readOnly = (document.location.toString().substr(0,4) == "http") ? config.options.chkHttpReadOnly : false;

config.shadowTiddlers['WebPageTemplate'] = config.shadowTiddlers['PageTemplate'];
config.shadowTiddlers['WebViewTemplate'] = "<!--{{{-->\sn<div class='toolbar' macro='toolbar closeTiddler permalink +viewSource'></div>\sn<div class='title' macro='view title'></div>\sn<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date [[DD MMM YYYY]]'></span> (created <span macro='view created date [[DD MMM YYYY]]'></span>)</div>\sn<div class='tagging' macro='tagging'></div>\sn<div class='tagged' macro='tags'></div>\sn<div class='viewer' macro='view text wikified'></div>\sn<div class='tagClear'></div>\sn<!--}}}-->";
config.shadowTiddlers['WebEditTemplate'] = "<!--{{{-->\sn<div class='toolbar' macro='toolbar -cancelTiddler'></div>\sn<div class='title'><span macro='view title'></span> (source code)</div>\sn<div class='editor' macro='edit text'></div>\sn<!--}}}-->\sn";

if(readOnly){ 
 showWebView();
}

window.applyPageTemplateWebTemplate = window.applyPageTemplate;
window.applyPageTemplate = function(title){
 if(readOnly && store.tiddlerExists('WebPageTemplate')) title = 'WebPageTemplate';
 applyPageTemplateWebTemplate(title);
}

function showWebView(){
 config.tiddlerTemplates[1] = "WebViewTemplate";
 config.tiddlerTemplates[2] = "WebEditTemplate";
}

config.macros.testWebView = {}
config.macros.testWebView.handler = function(place,macroName,params)
{
 createTiddlyButton(place,"ToggleWebTemplates","Toggle the web mode",toggleWebView);
}

var toggleWebView = function(){
 readOnly = !readOnly;
 if(readOnly){
 showWebView();
 } else {
 config.tiddlerTemplates[1] = "ViewTemplate";
 config.tiddlerTemplates[2] = "EditTemplate";
 }
 store.notifyAll();
}
//}}}
/***
!View Source Plugin
***/
//{{{
var viewSourceSelectAllByDefault = true;

config.commands.viewSource = {text: "view source", tooltip: "View this tiddler's wiki markup"},
config.commands.viewSource.handler = function(event,src,title){
	clearMessage();
	story.displayTiddler(null,title,DEFAULT_EDIT_TEMPLATE);

	var theTiddler = document.getElementById("tiddler"+title);
	var tiddlerElements = theTiddler.getElementsByTagName("textarea")

	for (var i = 0; i < tiddlerElements.length; i++){
		tiddlerElements[i].setAttribute("readonly","readonly");
	}

	if (tiddlerElements.length > 0){
		tiddlerElements[0].focus();
		if (viewSourceSelectAllByDefault) tiddlerElements[0].select();
	}
	return false;
}
//}}}
/***
!404 Tiddler Plugin
***/
//{{{
config.shadowTiddlers['404 Tiddler'] = "The tiddler you were looking for doesn't exist.\sn\snTry a <<search>> for the information you were looking for.";

Story.prototype.displayTiddler404 = Story.prototype.displayTiddler;
Story.prototype.displayTiddler = function(srcElement,title,template,animate,slowly)
{
 if (readOnly && !store.tiddlerExists(title) && !store.isShadowTiddler(title)){title = '404 Tiddler'}
 this.displayTiddler404(srcElement,title,template,animate,slowly);
}

//}}}
//{{{
TiddlyWiki.prototype.removeNotification = function(title,fn) {
	for (var i=0;i<this.namedNotifications.length;i++)
		if((this.namedNotifications[i].name == title) && (this.namedNotifications[i].notify == fn))
			this.namedNotifications.splice(i,1);
}
      
TiddlyWiki.prototype.isTiddler= function (title)
        {return store.tiddlerExists(title) || store.isShadowTiddler(title)}

Story.prototype.lewcidrefreshAllTiddlers = function()
{
    var place = document.getElementById(this.container);
    var e = place.firstChild;
    if(!e) return;
    this.refreshTiddler(e.getAttribute("tiddler"),null,true);
    while((e = e.nextSibling) != null)
        this.refreshTiddler(e.getAttribute("tiddler"),null,true);
}

config.presentationPlugin ={
};

config.presentationPlugin.defaults = [
	{name: "StyleSheet", notify: refreshStyles},
	{name: "PageTemplate", notify: refreshPageTemplate}
	];

window.presentationMode='';

function applyPresentationMode (oldMode,Mode)
{
    presentationMode = Mode;
    var defaults = config.presentationPlugin.defaults;
    var oldStyleElement = document.getElementById(oldMode+"StyleSheet");
    if (oldStyleElement)
        {
        oldStyleElement.parentNode.removeChild(oldStyleElement);
        }
    for (var i=0; i<defaults.length; i++)
      {
        var def = defaults[i]["name"];
        var newMode = store.isTiddler(Mode + def)? Mode + def : def;
        store.removeNotification(oldMode + def, defaults[i]["notify"]);
        store.addNotification(newMode,defaults[i]["notify"]);
        store.notify(newMode); //just one do blanket notify instead?
      }
    story.lewcidrefreshAllTiddlers();
}

config.macros.author={};
config.macros.author.handler= function (place,macroName,params,wikifier,paramString,tiddler) {
	var e = createTiddlyElement(place,"span");
	e.setAttribute("refresh","macro");
	e.setAttribute("macroName","author");
	e.setAttribute("params",paramString);
	this.refresh(e,paramString);
}

config.macros.author.refresh = function(place,params){
    if (window.lewcideditmode== false)
        return false;
    removeChildren(place);
    var oldMode = window.presentationMode;
    var newMode = (oldMode == "Author")?"":"Author";
    var label = (oldMode == "Author")? "PM":"AM";
    var tooltip = label;
	createTiddlyButton(place,label,tooltip,function() {
		applyPresentationMode(oldMode,newMode);
	});
};

Story.prototype.chooseTemplateForTiddler_old_presentation = Story.prototype.chooseTemplateForTiddler;

Story.prototype.chooseTemplateForTiddler = function(title,template)
{
    if (!template)
        template = DEFAULT_VIEW_TEMPLATE;
    var mode = presentationMode;
    if (template == DEFAULT_VIEW_TEMPLATE)
        {
        if (store.isTiddler(mode+"ViewTemplate"))
            return mode+"ViewTemplate";
        }
    else if (template == DEFAULT_EDIT_TEMPLATE)
        {
        if (store.isTiddler(mode+"EditTemplate"))
            return mode+"EditTemplate";
        }
    return this.chooseTemplateForTiddler_old_presentation(title,template);
}

function loadScripts()
{
    var scripts = store.getTiddlerText("AuthorScripts").readBracketedList();
    for (var i=0; i<scripts.length;i++)
        {
        var script = document.createElement("script"); script.src = scripts[i];
        document.body.appendChild(script);
        document.body.removeChild(script);
        }
}

window.lewcideditmode = false;
config.paramifiers.author = {
	onstart: function(v) {
                 if (v!="true")
                     return false;
                window.lewcideditmode =  true;
                loadScripts();
                applyPresentationMode("","Author");
                if (config.options.chkSinglePageMode)
                     config.options.chkSinglePageMode = false;
                config.options.chkHttpReadOnly=false;
	            }
};
//}}}
// ---------------------------------------------------------------------------------
// Refresh mechanism
// ---------------------------------------------------------------------------------

config.refreshers = {
	link: function(e,changeList)
		{
		var title = e.getAttribute("tiddlyLink");
		refreshTiddlyLink(e,title);
		return true;
		},
	
	tiddler: function(e,changeList)
		{
		var title = e.getAttribute("tiddler");
		var template = e.getAttribute("template");
		if(changeList && changeList.find(title) != null && !story.isDirty(title))
			story.refreshTiddler(title,template,true);
		else
			refreshElements(e,changeList);
		return true;
		},

	content: function(e,changeList)
		{
		var title = e.getAttribute("tiddler");
		var force = e.getAttribute("force");
		if(force != null || changeList == null || changeList.find(title) != null)
			{
			removeChildren(e);
			wikify(store.getTiddlerText(title,title),e);
			return true;
			}
		else
			return false;
		},

	macro: function(e,changeList)
		{
		var macro = e.getAttribute("macroName");
		var params = e.getAttribute("params");
		if(macro)
			macro = config.macros[macro];
		if(macro && macro.refresh)
			macro.refresh(e,params);
		return true;
		}
};

function refreshElements(root,changeList)
{
	var nodes = root.childNodes;
	for(var c=0; c<nodes.length; c++)
		{
		var e = nodes[c],type;
		if(e.getAttribute)
			type = e.getAttribute("refresh");
		else
			type = null;
		var refresher = config.refreshers[type];
		var refreshed = false;
		if(refresher != undefined)
			refreshed = refresher(e,changeList);
		if(e.hasChildNodes() && !refreshed)
			refreshElements(e,changeList);
		}
}

function applyHtmlMacros(root,tiddler)
{
	var e = root.firstChild;
	while(e)
		{
		var nextChild = e.nextSibling;
		if(e.getAttribute)
			{
			var macro = e.getAttribute("macro");
			if(macro)
				{
				var params = "";
				var p = macro.indexOf(" ");
				if(p != -1)
					{
					params = macro.substr(p+1);
					macro = macro.substr(0,p);
					}
				invokeMacro(e,macro,params,null,tiddler);
				}
			}
		if(e.hasChildNodes())
			applyHtmlMacros(e,tiddler);
		e = nextChild;
		}
}

function refreshPageTemplate(title)
{
	var stash = createTiddlyElement(document.body,"div");
	stash.style.display = "none";
	var display = document.getElementById("tiddlerDisplay");
	var nodes,t;
	if(display)
		{
		nodes = display.childNodes;
		for(t=nodes.length-1; t>=0; t--)
			stash.appendChild(nodes[t]);
		}
	var wrapper = document.getElementById("contentWrapper");
	if(!title)
		title = "PageTemplate";
	var html = store.getRecursiveTiddlerText(title,null,10);
	wrapper.innerHTML = html;
	applyHtmlMacros(wrapper);
	refreshElements(wrapper);
	display = document.getElementById("tiddlerDisplay");
	removeChildren(display);
	if(!display)
		display = createTiddlyElement(wrapper,"div","tiddlerDisplay");
	nodes = stash.childNodes;
	for(t=nodes.length-1; t>=0; t--)
		display.appendChild(nodes[t]);
	stash.parentNode.removeChild(stash);
}

function refreshDisplay(hint)
{
	var e = document.getElementById("contentWrapper");
	if(typeof hint == "string")
		hint = [hint];
	refreshElements(e,hint);
}

function refreshPageTitle()
{
	document.title = wikifyPlain("SiteTitle") + " - " + wikifyPlain("SiteSubtitle");
}

function refreshStyles(title)
{
	setStylesheet(title == null ? "" : store.getRecursiveTiddlerText(title,"",10),title);
}

function refreshColorPalette(title)
{
	if(!startingUp)
		refreshAll();
}

function refreshAll()
{
	refreshPageTemplate();
	refreshDisplay();
	refreshStyles("StyleSheetLayout");
	refreshStyles("StyleSheetColors");
	refreshStyles("StyleSheet");
	refreshStyles("StyleSheetPrint");
}


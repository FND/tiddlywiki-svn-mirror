//{{{
$id = function(theId){ return document.getElementById(theId);};

Story.prototype.old_qe_refreshTiddler = Story.prototype.refreshTiddler;
Story.prototype.refreshTiddler = function(title,template,force,customFields,defaultText){
	var tiddlerElem = $id(this.idPrefix + title);
	if (tiddlerElem && template == 2 && store.getTiddler(title) ) {
		removeToolbars(tiddlerElem);
		var div = $id('quickedit' + title) || createTiddlyElement(null,'div','quickedit' + title, 'quickedit');
		var tiddler = store.getTiddler(title);
		_template = this.chooseTemplateForTiddler(title,template);
		tiddlerElem.appendChild(div);
		tiddlerElem[window.event?'onkeydown':'onkeypress'] = this.onTiddlerKeyPress;
		div.innerHTML = this.getTemplateForTiddler(title,_template,tiddler);
		applyHtmlMacros(div,tiddler);
	}
	else{
		tiddlerElem = this.old_qe_refreshTiddler.apply(this,arguments);
		if (tiddlerElem && ! $id(template == 2? 'quickedit' : 'quickeditviewer' + title)) {
			var div = createTiddlyElement(null,'div', template == 2? 'quickedit' : 'quickeditviewer' + title, template == 2? 'quickedit' : '');
			insertNodeBetween(tiddlerElem,div);
		}
	}
	if (template == 2)
		addClass(tiddlerElem,'openEditTiddler');
	else
		removeClass(tiddlerElem,'openEditTiddler');
	return tiddlerElem;
}

removeToolbars = function(node) {
	var toolbars = getElementsByClass('toolbar',node);
	for (var i=0; i< toolbars.length; i++){
		toolbars[i].parentNode.removeChild(toolbars[i]);
	}
}

insertNodeBetween = function (parent, node){
	while(parent.childNodes[0]){
		node.appendChild(parent.childNodes[0]);
	}
	parent.appendChild(node);
}

config.commands.cancelTiddler.handler = function(event,src,title)
{
	if(story.hasChanges(title) && !readOnly) {
		if(!confirm(this.warning.format([title])))
			return false;
	}
	story.setDirty(title,false);
	if (store.getTiddler(title) || store.isShadowTiddler(title))
		story.refreshTiddler(title,1,true);
	else
		story.closeTiddler(title);
//ensure visible if tiddler exists
	return false;
};

config.commands.editTiddler.old_qe_handler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function(event,src,title)
{
	var editor = document.getElementById("quickedit"+title);
	if (editor)
		return false;
	else
		return config.commands.editTiddler.old_qe_handler.apply(this,arguments);
};

config.commands.previewTiddler = {
	text : 'preview',
	tooltip : 'preview your changes',
	hideShadow : true
}

config.commands.previewTiddler.handler = function(event,src,title){
	if(story.hasChanges(title) || !store.fetchTiddler(title))
		story.previewTiddler(title);
	return false;
}

Story.prototype.previewTiddler = function(title)
{
	var t = store.getTiddler(title)|| new Tiddler();
	var tiddlerElem = $id(this.idPrefix + title);
	var viewer = $id("quickeditviewer" + title) || tiddlerElem.insertBefore(createTiddlyElement(null,'div','quickeditviewer'+title),tiddlerElem.firstChild);
	var b = merge((new Tiddler()),t);
	var newTitle = title;	
	if(tiddlerElem != null) {
		var fields = {};
		this.gatherSaveFields(tiddlerElem,fields);
		var extendedFields = store.tiddlerExists(newTitle) ? store.fetchTiddler(newTitle).fields : (newTitle!=title && store.tiddlerExists(title) ? store.fetchTiddler(title).fields : {});
		for(var n in fields) {
			if(!TiddlyWiki.isStandardField(n))
				extendedFields[n] = fields[n];
			else
				b[n] = fields[n]
		}
		b.fields = extendedFields;
		b.tags = b.tags? b.tags.split(' ') : [];
		removeChildren(viewer); 

		template = this.chooseTemplateForTiddler(title,DEFAULT_VIEW_TEMPLATE);
		addClass(viewer, 'qe_preview');
		viewer.innerHTML = this.getTemplateForTiddler(title,template,t);
		applyHtmlMacros(viewer,b);
		removeToolbars(viewer);
		forceReflow();
	}
};

function getElementsByClass(searchClass,node,tag) {
	var out = [];
	node = node || document;
	tag = tag || '*';
	var els = node.getElementsByTagName(tag);
	var elsLen = els.length;
	for (i = 0, j = 0; i < elsLen; i++) {
		if (hasClass(els[i],searchClass)) {
			out[j] = els[i];
			j++;
		}
	}
	return out;
};

config.shadowTiddlers["EditTemplate"] = config.shadowTiddlers["EditTemplate"].replace("+saveTiddler","previewTiddler +saveTiddler");
//}}}
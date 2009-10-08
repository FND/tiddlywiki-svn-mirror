/***
|''Name:''|TagsTreePlugin|
|''Description:''|Displays tags hierachy as a tree of tagged tiddlers.<br>Can be used to create dynamic outline navigation.|
|''Version:''|1.0.1|
|''Date:''|Jan 04,2008|
|''Source:''|http://visualtw.ouvaton.org/VisualTW.html|
|''Author:''|Pascal Collin|
|''License:''|[[BSD open source license|License]]|
|''~CoreVersion:''|2.1.0|
|''Browser:''|Firefox 2.0; InternetExplorer 6.0|
!Demo
On the plugin [[homepage|http://visualtw.ouvaton.org/VisualTW.html]] :
*Try to tag some <<newTiddler>> with a tag displayed in the menu and edit MainMenu.
*Look at some tags like [[Plugins]] or [[menu]].
!Installation
#import the plugin,
#save and reload,
#optionally, edit TagsTreeStyleSheet.
! Usage
{{{<<tagsTree>>}}} macro accepts the following //optional// parameters.
|!#|!parameter|!description|!by default|
|1|{{{root}}}|Uses {{{root}}} tag as tree root|- In a //tiddler// content or template : uses the tiddler as root tag.<br>- In the //page// content or template (by ex MainMenu) : displays all untagged tags.|
|2|{{{excludeTag}}}|Excludes all such tagged tiddlers from the tree|Uses default excludeLists tag|
|3|{{{level}}}|Expands nodes until level {{{level}}}.<br>Value {{{0}}} hides expand/collapse buttons.|Nodes are collapsed on first level|
|4|{{{depth}}}|Hierachy depth|6 levels depth (H1 to H6 header styles)|
|5|{{{sortField}}}|Alternate sort field. By example : "index".|Sorts tags and tiddlers alphabetically (on their title)|
|6|{{{labelField}}}|Alertnate label field. By example : "label".|Displays tiddler's title|

!Useful addons
*[[FieldsEditorPlugin]] : //create//, //edit//, //view// and //delete// commands in toolbar <<toolbar fields>>.
*[[TaggerPlugin]] : Provides a drop down listing current tiddler tags, and allowing toggling of tags.
!Advanced Users
You can change the global defaults for TagsTreePlugin, like default {{{level}}} value or level styles, by editing or overriding the first config.macros.tagsTree attributes below.
!Code
***/
//{{{
config.macros.tagsTree = {
	expand : "+",
	collapse : "–",
	depth : 6,
	level : 1,
	sortField : "",	
	labelField : "",
	styles : ["h1","h2","h3","h4","h5","h6"],
	trees : {}
}

config.macros.tagsTree.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var root = params[0] ? params[0] : (tiddler ? tiddler.title : null);
	var excludeTag = params[1] ? params[1] : "excludeTagsTree";
	var level = params[2] ? params[2] : config.macros.tagsTree.level;
	var depth = params[3] ? params[3] : config.macros.tagsTree.depth;
	var sortField = params[4] ? params[4] : config.macros.tagsTree.sortField;
	var labelField = params[5] ? params[5] : config.macros.tagsTree.labelField;
	var showButtons = (level>0);
	var id = config.macros.tagsTree.getId(place);
	if (config.macros.tagsTree.trees[id]==undefined) config.macros.tagsTree.trees[id]={};
	config.macros.tagsTree.createSubTree(place,id,root,excludeTag,[],level>0 ? level : 1,depth, sortField, labelField,showButtons);
}

config.macros.tagsTree.createSubTree = function(place, id, root, excludeTag, ancestors, level, depth, sortField, labelField,showButtons){
	var childNodes = root ? this.getChildNodes(root, ancestors) : this.getRootTags(excludeTag);
	var isOpen = (level>0) || (!showButtons);
	if (root && this.trees[id][root]!=undefined) isOpen = this.trees[id][root]; 
	if (root && ancestors.length) {
		var t = store.getTiddler(root);
		if (childNodes.length && depth>0) {
			var wrapper = createTiddlyElement(place , this.styles[Math.min(Math.max(ancestors.length,1),6)-1],null,"branch");
			if (showButtons) {
				b = createTiddlyButton(wrapper, isOpen ? config.macros.tagsTree.collapse : config.macros.tagsTree.expand, null, config.macros.tagsTree.onClick);
				b.setAttribute("treeId",id);
				b.setAttribute("tiddler",root);					
			}
			createTiddlyText(createTiddlyLink(wrapper, root),t&&labelField ? t.fields[labelField] ? t.fields[labelField] : root : root);
		}
		else 
			createTiddlyText(createTiddlyLink(place, root,false,"leaf"),t&&labelField ? t.fields[labelField] ? t.fields[labelField] : root : root);
	}
	if (childNodes.length && depth) {
		var d = createTiddlyElement(place,"div",null,"subtree");
		d.style.display= isOpen ? "block" : "none";
		if (sortField)
			childNodes.sort(function(a, b){
				var fa=a.fields[sortField];
				var fb=b.fields[sortField];
				return (fa==undefined && fb==undefined) ? a.title < b.title ? -1 : a.title > b.title ? 1 : 0 : (fa==undefined && fb!=undefined) ? 1 :(fa!=undefined && fb==undefined) ? -1 : fa < fb ? -1 : fa > fb ? 1 : 0;
			})
		for (var cpt=0; cpt<childNodes.length; cpt++)
			this.createSubTree(d, id, childNodes[cpt].title, excludeTag, ancestors.concat(root), level-1, depth-1, sortField, labelField, showButtons);	
	}	
}

config.macros.tagsTree.onClick = function(e){
	var id = this.getAttribute("treeId");
	var tiddler = this.getAttribute("tiddler");	
	var n = this.parentNode.nextSibling;
	var isOpen = n.style.display != "none";
	if(config.options.chkAnimate && anim && typeof Slider == "function")
		anim.startAnimating(new Slider(n,!isOpen,null,"none"));
	else
		n.style.display = isOpen ? "none" : "block";
	this.firstChild.nodeValue = isOpen ? config.macros.tagsTree.expand : config.macros.tagsTree.collapse;
	config.macros.tagsTree.trees[id][tiddler]=!isOpen;
	return false;
}

config.macros.tagsTree.getChildNodes = function(root ,ancestors){
	var childs = store.getTaggedTiddlers(root);
	var result = new Array();
	for (var cpt=0; cpt<childs.length; cpt++)
		if (childs[cpt].title!=root && ancestors.indexOf(childs[cpt].title)==-1) result.push(childs[cpt]);
	return result;
}

config.macros.tagsTree.getRootTags = function(excludeTag){
	var tags = store.getTags(excludeTag);
	tags.sort(function(a,b) {return a[0].toLowerCase() < b[0].toLowerCase() ? -1 : (a[0].toLowerCase() == b[0].toLowerCase() ? 0 : +1);});
	var result = new Array();
	for (var cpt=0; cpt<tags.length; cpt++) {
		var t = store.getTiddler(tags[cpt][0]);
		if (!t || t.tags.length==0) result.push(t ? t : {title:tags[cpt][0],fields:{}});
	}
	return result;
}

config.macros.tagsTree.getId = function(element){
	while (!element.id && element.parentNode) element=element.parentNode;
	return element.id ? element.id : "<html>";
}

config.shadowTiddlers.TagsTreeStyleSheet = "/*{{{*/\n";
config.shadowTiddlers.TagsTreeStyleSheet +=".leaf, .subtree {display:block; margin-left : 0.5em}\n";
config.shadowTiddlers.TagsTreeStyleSheet +=".subtree {margin-bottom:0.5em}\n";
config.shadowTiddlers.TagsTreeStyleSheet +="#mainMenu {text-align:left}\n";
config.shadowTiddlers.TagsTreeStyleSheet +=".branch .button {border:1px solid #DDD; color:#AAA;font-size:9px;padding:0 2px;margin-right:0.3em;vertical-align:middle;text-align:center;}\n";
config.shadowTiddlers.TagsTreeStyleSheet +="/*}}}*/";

store.addNotification("TagsTreeStyleSheet", refreshStyles); 

config.shadowTiddlers.MainMenu="<<tagsTree>>"

config.shadowTiddlers.PageTemplate = config.shadowTiddlers.PageTemplate.replace(/id='mainMenu' refresh='content' /,"id='mainMenu' refresh='content' force='true' ")

//}}}
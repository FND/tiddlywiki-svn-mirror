/***
|''Name:''|CommentPlugin|
|''Source:''| |
|''Author:''|Tim Morgan (modified by Bram Chen|
|''Desc:''|''Adds "comments" to any TiddlyWiki or adaptation.''|
| |Used in conjunction with the RecentPlugin, one can have a decent forum environment.|

''Translation sample 1:''
{{{
config.CommentPlugin.CPlingo = {
	dateFormat: "YYYY年0MM月0DD日 0hh:0mm:0ss",
	CommentInTitle: " 迴響 ",
	comments:"迴響",
	add:"回應 U+00BB.",
	edit:"編輯",
	tooltips:"發表關於此文的相關意見",
	Title: "%0 迴響 %1",
	CommenteditTemplate: {yourName: "請簽名：", nickName: "(中英文暱稱)", comments: "留言內容："}
};
}}}
''Translation sample 2:''
{{{
config.CommentPlugin = {
 CPlingo:{
	dateFormat: "DD MMM YYYY 0hh:0mm:0ss",
	CommentInTitle: " Comment ",
	comments: "comments",
	add: "New Comment Here...",
	edit: "Edit",
	tooltips:" Create a new comment tiddler associated with this tiddler",
	Title: "%0 Comment %1",
	CommenteditTemplate: {yourName: "Your Name: ", nickName: "(nick name)", comments: "Comment: "}
 };
}}}

''Revision history:''
* v0.7.0 (Nov 09, 2006)
** Minor changes, more easier to be translated (Bram)
* v0.6.0 (Nov 09, 2006)
** Runs compatibly with TW 2.1.0+ (Bram)
* v0.5.0 (Jun 15, 2006)
** Fixed bug for feature of CommentEditTemplate (bug reported by MilchFlasche, fixed by Bram)
** Fixed bug in redefined TiddlyWiki.prototype.saveTiddler (Bram)
* v0.4.0 (Jun 03, 2006) Added CommentEditTemplate (Bram)
* v0.3.0 (Jun 01, 2006) Some minor changes for readOnly mode (Bram)
* v0.2.0 (Apr 04, 2006) Fixed bug for only_on_tags (Bram)
* v0.1.0 (Mar 13, 2006) Modified by Bram Chen.
***/
// //''Code section:''
//{{{
config.CommentPlugin = {
 CPlingo:{
	dateFormat: "DD MMM YYYY 0hh:0mm:0ss",
	CommentInTitle: " Comment ",
	comments: "comments",
	add: "New Comment Here...",
	edit: "Edit",
	tooltips:" Create a new comment tiddler associated with this tiddler",
	Title: "%0 Comment %1",
	CommenteditTemplate: {yourName: "Your Name: ", nickName: "(nick name)", comments: "Comment: "}
 },
 only_on_tags: ['Public'],
 not_on_tags: ['about'],
 // "true" or "false"...
 fold_comments: true,
 default_fold: true,
 max_comment_count: 500
};

var CPlingo = config.CommentPlugin.CPlingo;
config.CommentPlugin.only_on_tags.push(CPlingo.comments);

function in_array(item, arr){
	for(var i=0;i<arr.length;i++){
		if(item==arr[i]) {return true;}
	}
};

function one_in_array(items, arr){
	for(var i=0;i<items.length;i++){
		if(in_array(items[i], arr)){return true;}
	}
	return false
};

function get_parent(tiddler){
	while(in_array(CPlingo.comments, tiddler.tags)){
		tiddler=store.fetchTiddler(tiddler.tags[0]);
	}
	return tiddler
};

function count_comments(title){
	var tagged=store.getTaggedTiddlers(title);
	var count=0;
	for(var i=0;i<tagged.length;i++){
		if(in_array(CPlingo.comments, tagged[i].tags)){
			count+=count_comments(tagged[i].title)+1;
		}
	}
	return count
};
config.shadowTiddlers.ViewTemplate += "\n<div class='comments' macro='comments'></div>";

config.shadowTiddlers.CommentEditTemplate="<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler deleteTiddler wikibar'></div><div class='title' macro='view title'></div><div class='editor' macro='edit tags' style='display:none;'></div><div class='GuestSign' >" + CPlingo.CommenteditTemplate.yourName + "<span macro='option txtUserName'></span>" + CPlingo.CommenteditTemplate.nickName + "<br />" + CPlingo.CommenteditTemplate.comments + "</div><div class='editor' macro='edit text'></div>";
config.tiddlerTemplates[3]="CommentEditTemplate";
var COMMENT_EDIT_TEMPLATE = 3;

config.shadowTiddlers.CommentPluginStyle = '\n/*{{{*/\n.commentTags ul{list-style:none; padding-left:0px;margin: 0 0 3px 0;} .commentTags li{display:inline;color:#999;} .commentTags li a.button{color:#999;} .comment{border-left:1px solid #ccc; margin-top:10px; margin-left:10px; padding:5px;} .newCommentLink{padding-top:10px} .tagging, .selected .tagging, .tiddler .tagging{display:none;} .comment a.button{padding:0px; font-size:smaller;}\n/*}}}*/';
config.shadowTiddlers.StyleSheet += config.shadowTiddlers.CommentPluginStyle;
config.macros.newCommentLink = {
	label: CPlingo.add,
	prompt: CPlingo.tooltips,
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		if(tiddler && store.tiddlerExists(tiddler.title) && !readOnly && (!window.zw || zw.loggedIn || zw.anonEdit)) {
			if(config.CommentPlugin.only_on_tags.length>0 && !one_in_array(tiddler.tags, config.CommentPlugin.only_on_tags)) return;
			if(config.CommentPlugin.not_on_tags.length>0 && one_in_array(tiddler.tags, config.CommentPlugin.not_on_tags)) return;
			var onclick = function(e) {
				var e = (e)?e:window.event;
				var theTarget = resolveTarget(e);
				var titlex=tiddler.title.split(CPlingo.CommentInTitle)[0];
				var title = (tiddler.title.indexOf(CPlingo.CommentInTitle)!=-1)? titlex : tiddler.title;
				title = CPlingo.Title.format([title,(new Date()).formatString(CPlingo.dateFormat)]);
				var comment = store.createTiddler(title);
				comment.text = '';
				comment.tags = [tiddler.title, CPlingo.comments, 'excludeLists'];
				readOnly = false;
				story.displayTiddler(theTarget, title, COMMENT_EDIT_TEMPLATE);
				readOnly = (window.location.protocol == "file:") ? false : config.options.chkHttpReadOnly;
				story.focusTiddler(title,"text");
				return false;
			}
			createTiddlyButton(place, this.label, this.prompt, onclick);
 		}
	}
};
config.macros.comments = {
	dateFormat: CPlingo.dateFormat,
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
	if(tiddler.title==CPlingo.comments) return;
	var comments = store.getTaggedTiddlers(tiddler.title, 'created');
	var count = count_comments(tiddler.title);
	if(comments.length>0 && !in_array(CPlingo.comments, tiddler.tags) && config.CommentPlugin.fold_comments) {
		var show = createTiddlyElement(place, 'p');
		show.innerHTML = '<a href="#" onclick="var e=document.getElementById(\'comments'+tiddler.title+'\');e.style.display=e.style.display==\'block\'?\'none\':\'block\';return false;">' + CPlingo.comments +'('+count+') »</a>';
	}
	var place = createTiddlyElement(place, 'div', 'comments'+tiddler.title, 'comments');
	if(comments.length>0 && !in_array(CPlingo.comments, tiddler.tags) && config.CommentPlugin.fold_comments && config.CommentPlugin.default_fold)
		place.style.display = 'none';
	else
		place.style.display = 'block';
	for(var i=0; i<comments.length; i++) {
		if(!in_array(CPlingo.comments, comments[i].tags))continue;
		var container = createTiddlyElement(place, 'div', null, 'comment');
		var title = createTiddlyElement(container, 'strong');
		var link = createTiddlyLink(title, comments[i].modifier, true);
		createTiddlyElement(title, 'span', null, null, ', '+comments[i].created.formatString(this.dateFormat));
/* -- remove editable option for security concern
		if(comments[i].modifier == config.options.txtUserName) {
			createTiddlyElement(title, 'span', null, null, ' (');
			var edit = createTiddlyLink(title, comments[i].title);
			edit.innerHTML = CPlingo.edit;
			createTiddlyElement(title, 'span', null, null, ')');
		}
*/
		wikify('\n'+comments[i].text+'\n',container);
		config.macros.comments.handler(container,null,null,null,null,comments[i]);
	}
	readOnly = false;
	config.macros.newCommentLink.handler(place,null,null,null,null,tiddler);
//	wikify('<'+'<newCommentLink>>',place);
	readOnly = (window.location.protocol == "file:") ? false : config.options.chkHttpReadOnly;
	}
};
var CPCloseTiddlers = [];
TiddlyWiki.prototype.CommentPlugin_saveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags) {
	tags=(typeof tags == "string") ? tags.readBracketedList() : tags;
	if(in_array(CPlingo.comments, tags)){
		newBody=newBody.htmlDecode(); // comment this line, for working with HTMLAreaPackage
		newBody=newBody.substr(0,config.CommentPlugin.max_comment_count);
		newBody=newBody.htmlEncode(); // comment this line, for working with HTMLAreaPackage
	}
	var t = this.CommentPlugin_saveTiddler(title,newTitle,newBody,modifier,modified,tags);
	if(in_array(CPlingo.comments, tags)) {
		var original = config.CommentPlugin.default_fold;
		config.CommentPlugin.default_fold = false;
		story.refreshTiddler(get_parent(t).title, DEFAULT_VIEW_TEMPLATE, true);
		config.CommentPlugin.default_fold = original;
		CPCloseTiddlers.push(newTitle);
		setTimeout("story.closeTiddler(CPCloseTiddlers.pop(), true)", 500);
	}
	return t;
};
Story.prototype.chooseTemplateForTiddler = function(title,template)
{
	if(!template)
		template = DEFAULT_VIEW_TEMPLATE;
	if(template == DEFAULT_VIEW_TEMPLATE
	|| template == DEFAULT_EDIT_TEMPLATE
	|| template == COMMENT_EDIT_TEMPLATE)
		template = config.tiddlerTemplates[template];
	return template;
};
//}}}
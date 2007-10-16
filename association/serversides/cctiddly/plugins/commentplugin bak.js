/***
|''Name:''|CommentPlugin|
|''Source:''| |
|''Author:''|Tim Morgan (modified by Bram Chen|
|''Desc:''|''Adds "comments" to any TiddlyWiki or adaptation.''|
| |Used in conjunction with the RecentPlugin, one can have a decent forum environment.|
''Syntax:'' {{{}}}
''Translation sample 1:'' {{{config.CommentPlugin.CPlingo:{CommentInTitle: ' 附錄 ', comments:'附錄',add:'增加附錄 »',edit:'編輯', tooltips:'新增關於此文的補充說明', Title: '%0_CommentInTitle_%1'};}}}
''Translation sample 2:'' {{{config.CommentPlugin.CPlingo:{CommentInTitle: ' Comment ', comments:'comments',add:'New Comment Here...',edit:'Edit', tooltips:'Create a new comment tiddler associated with this tiddler', Title: '%0_CommentInTitle_%1'};}}}

''Revision history:''
* v0.5.0 (Jun 15, 2006)
** Fixed bug for feature of CommentEditTemplate (bug reported by MilchFlasche, fixed by Bram)
** Fixed bug in redefined TiddlyWiki.prototype.saveTiddler (Bram)
* v0.4.0 (Jun 03, 2006) Add CommentEditTemplate (Bram)
* v0.3.0 (Jun 01, 2006) Some minor changes for readOnly mode (Bram)
* v0.2.0 (Apr 04, 2006) Fix bug for only_on_tags (Bram)
* v0.1.0 (Mar 13, 2006) Modified by Bram Chen.
***/

// //''Code section:''
//{{{
config.CommentPlugin = {
	 CPlingo:	{
					CommentInTitle: ' Comment ', 
					comments:'comments',
					add:'New Comment Here...',
					edit:'Edit',
					tooltips:'Create a new comment tiddler associated with this tiddler',
					Title: '%0_CommentInTitle_%1'
				},
	 only_on_tags: ['Public'],		//apply this tag to tiddler would allow comment
	 not_on_tags: ['about'],
	 // "true" or "false"...
	 fold_comments: true,
	 default_fold: true
};

config.CommentPlugin.only_on_tags.push(config.CommentPlugin.CPlingo.comments);

var CPlingo = config.CommentPlugin.CPlingo;
function in_array(item, arr)
{
	for(var i=0;i<arr.length;i++)
		if(item==arr[i])
			return true;
};
function one_in_array(items, arr){for(var i=0;i<items.length;i++)if(in_array(items[i], arr))return true;return false};
function get_parent(tiddler)
{
	var tmp;
	while(in_array(CPlingo.comments, tiddler.tags))
	{
		tmp=store.fetchTiddler(tiddler.tags[0]);
		if( typeof(tmp)!='undefined' )
			tiddler=tmp;
		else
			return tiddler;
	}
	return tiddler;
};
function count_comments(tiddler)
{
	var tagged=store.getTaggedTiddlers(tiddler.title);
	var count=0;
	for(var i=0;i<tagged.length;i++)
		if(in_array(CPlingo.comments, tagged[i].tags))
		{
			count++;
			count+=count_comments(tagged[i])
		}
	return count
};

config.shadowTiddlers.ViewTemplate += "\n<div class='comments' macro='comments'></div>";
config.shadowTiddlers.CommentEditTemplate="<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler deleteTiddler wikibar'></div><div class='title' macro='view title'></div><div class='editor' macro='edit tags' style='display:none;'></div><div class='GuestSign' >Your Name: <span macro='option txtUserName'></span>(NickName)<br />Comments：</div><div class='editor' macro='edit text'></div>";
config.tiddlerTemplates[3]="CommentEditTemplate";
var COMMENT_EDIT_TEMPLATE = 3;

config.shadowTiddlers.CommentPluginStyle = '\n/*{{{*/\n.commentTags ul{list-style:none; padding-left:0px;margin: 0 0 3px 0;} .commentTags li{display:inline;color:#999;} .commentTags li a.button{color:#999;} .comment{border-left:1px solid #ccc; margin-top:10px; margin-left:10px; padding:5px;} .newCommentLink{padding-top:10px} .tagging, .selected .tagging, .tiddler .tagging{display:none;} .comment a.button{padding:0px; font-size:smaller;}\n/*}}}*/';
config.shadowTiddlers.StyleSheet += config.shadowTiddlers.CommentPluginStyle;
config.macros.newCommentLink = {
 CPlingo:config.CommentPlugin.CPlingo,
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
 title = title +CPlingo.CommentInTitle+ (new Date()).formatString('YYYY0MM0DD 0hh:0mm:0ss');
// title = CPlingo.Title.format([title,(new Date()).formatString('YYYY0MM0DD 0hh:0mm:0ss')]);
 title = title.replace(/_CommentInTitle_/,CPlingo.CommentInTitle);
 var comment = store.createTiddler(title);
 comment.text = '';
 comment.tags = [tiddler.title, CPlingo.comments, 'excludeLists'];
// comment.tags=comment.tags.concat(config.CommentPlugin.only_on_tags);
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
 CPlingo:config.CommentPlugin.CPlingo,
 dateFormat: 'YYYY0MM0DD 0hh:0mm',
 handler: function(place,macroName,params,wikifier,paramString,tiddler) {
 if(tiddler.title==CPlingo.comments) return;
 var comments = store.getTaggedTiddlers(tiddler.title, 'created');
 if(comments.length>0 && !in_array(CPlingo.comments, tiddler.tags) && config.CommentPlugin.fold_comments) {
 var show = createTiddlyElement(place, 'p');
 show.innerHTML = '<a href="#" onclick="var e=document.getElementById(\'comments'+tiddler.title+'\');e.style.display=e.style.display==\'block\'?\'none\':\'block\';return false;">' + CPlingo.comments +'('+count_comments(tiddler)+') »</a>';
 }
 var place = createTiddlyElement(place, 'div', 'comments'+tiddler.title, 'comments');
 if(comments.length>0 && !in_array(CPlingo.comments, tiddler.tags) && config.CommentPlugin.fold_comments && config.CommentPlugin.default_fold)
 place.style.display = 'none';
 else
 place.style.display = 'block';
 for(var i=0; i<comments.length; i++) {
// for(var i=comments.length-1; i>0; i--) {
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
 createTiddlyElement(container, 'br');
 config.macros.tiddler.handler(container, null, [comments[i].title]);
 createTiddlyElement(container, 'br');

 config.macros.comments.handler(container,null,null,null,null,comments[i]);
 }
 readOnly = false;
 config.macros.newCommentLink.handler(place,null,null,null,null,tiddler);
 readOnly = (window.location.protocol == "file:") ? false : config.options.chkHttpReadOnly;
 }
};
var CPCloseTiddlers = [];

//save tiddler
TiddlyWiki.prototype.CommentPlugin_saveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags)
{
	tags=(typeof tags == "string") ? tags.readBracketedList() : tags;
	if(in_array(CPlingo.comments, tags))
	{
		newBody=newBody.htmlDecode();
		newBody=newBody.substr(0,200);
		newBody=newBody.htmlEncode();
	}
	var t = this.CommentPlugin_saveTiddler(title,newTitle,newBody,modifier,modified,tags);
	if(in_array(CPlingo.comments, tags))
	{
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
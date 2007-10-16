/***
|''Name:''|CommentTabPlugin.zh-Hans|
|''Source:''|[[TiddlyWiki-zh|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/locales/plugins/]]|
|''Requires:''|[[CommentPlugin]], [[CommentTabPlugin]]|
|''Note:''|CommentPlugin and CommentTabPlugin modified by BramChen is required|
***/
//{{{
if (typeof config.macros.tiddlerComments != 'undefined'){
	config.shadowTiddlers.TabTimeline = "<<tabs txtTimelineTab 文章 最近更新的文章 TabTimelineTiddlers "+ config.CommentPlugin.CPlingo.comments + " 最近的回应 TabTimelineComments>>";
	config.macros.tiddlerComments.dateFormat = 'YYYY年0MM月0DD日';
}
//}}}
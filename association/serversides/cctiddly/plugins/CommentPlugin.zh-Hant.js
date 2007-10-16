/***
|''Name:''|CommentPlugin.zh-Hant|
|''Source:''|[[TiddlyWiki-zh|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/locales/plugins/]]|
|''Requires:''|[[CommentPlugin]]|
|''Note:''|CommentPlugin 0.7.0+ modified by BramChen is required|
***/
//{{{
if (typeof config.CommentPlugin != 'undefined'){
	merge(config.CommentPlugin.CPlingo, {
		dateFormat: "YYYY年0MM月0DD日 0hh:0mm:0ss",
		CommentInTitle: " 迴響 ",
		comments:"迴響",
		add:"回應 »",
		edit:"編輯",
		tooltips:"發表關於此文的相關意見",
		Title: "%0 迴響 %1",
		CommenteditTemplate: {yourName: "請簽名：", nickName: "(中英文暱稱)", comments: "留言內容："}
	});
	CPlingo = config.CommentPlugin.CPlingo;
	merge(config.macros.newCommentLink, {
 		label: CPlingo.add,
 		prompt: CPlingo.tooltips
	});
	merge(config.macros.comments, {
 		dateFormat: CPlingo.dateFormat
	});
config.CommentPlugin.only_on_tags.push(CPlingo.comments);
config.shadowTiddlers.CommentEditTemplate="<div class='toolbar' macro='toolbar +saveTiddler -cancelTiddler deleteTiddler wikibar'></div><div class='title' macro='view title'></div><div class='editor' macro='edit tags' style='display:none;'></div><div class='GuestSign' >" + CPlingo.CommenteditTemplate.yourName + "<span macro='option txtUserName'></span>" + CPlingo.CommenteditTemplate.nickName + "<br />" + CPlingo.CommenteditTemplate.comments + "</div><div class='editor' macro='edit text'></div>";
}
//}}}
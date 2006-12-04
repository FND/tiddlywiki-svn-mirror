/***
|''Name:''|SocialtextLocaleOverrides|
|''Description:''|Text changes for Socialtext|
***/

//{{{
merge(config.views.wikified.tag,{
	labelNoTags: "No Tags",
	labelTags: "Tags"});

merge(config.commands.references,{
	text: "incoming links",
	tooltip: "Show tiddlers that link to this one",
	popupNone: "No incoming links"});
//}}}

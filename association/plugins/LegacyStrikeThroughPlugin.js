/***
|''Name''|LegacyStrikeThroughPlugin|
|''Description''|Provides support for legacy (pre-v2.1) strikethrough formatting|
|''Author''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''Version''|1.0.3|
|''Date''|2008-04-07|
|''Status''|stable|
|''Source''|http://www.tiddlywiki.com/coreplugins.html#LegacyStrikeThroughPlugin|
|''~CodeRepository:''|http://svn.tiddlywiki.org/Trunk/association/plugins/LegacyStrikeThroughPlugin/LegacyStrikeThroughPlugin.js|
|''License''|[[BSD open source license]]|
|''~CoreVersion''|2.1.0|
|''Keywords''|legacySupport|
!Code
***/
//{{{
// Ensure that the LegacyStrikeThrough Plugin is only installed once.
if(!version.extensions.LegacyStrikeThroughPlugin) {
version.extensions.LegacyStrikeThroughPlugin = {installed:true};

config.formatters.push(
{
	name: "legacyStrikeByChar",
	match: "==",
	termRegExp: /(==)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
});

} //# end of "install only once"
//}}}

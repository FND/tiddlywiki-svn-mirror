/***
|''Name:''|LegacyStrikeThroughPlugin|
|''Description:''|Support for  legacy (pre 2.1) strike through formatting|
|''Version:''|1.0.1|
|''Date:''|Jul 21, 2006|
|''Source:''|http://www.tiddlywiki.com/#LegacyStrikeThroughPlugin|
|''Author:''|MartinBudden (mjbudden (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.1.0|
|''Browser:''|Firefox 1.0.4+; Firefox 1.5; InternetExplorer 6.0|

***/

//{{{

// Ensure that the LegacyStrikeThrough Plugin is only installed once.
if(!version.extensions.LegacyStrikeThroughPlugin)
	{
	version.extensions.LegacyStrikeThroughPlugin = true;

config.formatters.push(
{
	name: "legacyStrikeByChar",
	match: "==",
	termRegExp: /(==)/mg,
	element: "strike",
	handler: config.formatterHelpers.createElementAndWikify
});

} // end of "install only once"
//}}}

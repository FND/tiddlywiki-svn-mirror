/***
|Name|SuppressEmptyTagsPlugin|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#SuppressEmptyTagsPlugin]]|
|Version|1.1|
|Author|FND|
|Contributors|[[Saq Imtiaz|http://tw.lewcid.org]], [[Eric Shulman|http://www.tiddlytools.com]]|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|config.macros.tags.handler|
|Description|suppress tagged box when tiddler is untagged|
!Changelog
!!v0.5 (2007-06-11)
* initial release
!!v1.0 (2007-06-11)
* proper overriding of core function (thanks Saq)
* changed ~CoreVersion to 2.1 (from 2.2)
!!v1.1 (2007-06-11)
* further improved hijacking method (thanks Eric)
!Code
***/
//{{{
config.macros.tags.oldHandler = config.macros.tags.handler;
config.macros.tags.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(tiddler.tags && tiddler.tags.length > 0)
		this.oldHandler.apply(this, arguments);
	else
		place.style.display = 'none';
};
//}}}
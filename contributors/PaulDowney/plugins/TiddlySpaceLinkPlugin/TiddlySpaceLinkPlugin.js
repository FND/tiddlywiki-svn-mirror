/***
|''Name:''|TiddlySpaceLinkPlugin|
|''Description:''|Formatter to reference other spaces from wikitext |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlySpaceLinkPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlySpaceLinkPlugin/ |
|''Version:''|0.1|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin provides wikitext formatters for referencing another [[space|Space]] on the same TiddlySpace server:
{{{@space}}} -- @psd -- external link to another space
{{{~@space}}} -- ~@psd -- escaped space link
{{{@[Tiddler Name]space}}} -- @[How do I link to another space?]faq -- external link to a tiddler on another space
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config createTiddlyText createExternalLink */

function createSpaceLink(place, spaceName, tiddlerTitle, text) {
	var link;
	try {
		// seems safe to expect this to have been initialised within TiddlySpace
		link = config.extensions.tiddlyweb.status.server_host.url;
	} catch (ex) {
		link = "http://tiddlyspace.com";
	}
	// assumes a http URI without user:pass@ prefix
	link = link.replace("http://", "http://" + spaceName.toLowerCase() + ".") +
		(tiddlerTitle ?  "#" + encodeURIComponent(String.encodeTiddlyLink(tiddlerTitle)) : "");
	createTiddlyText(place, "@");
	if (!text) {
		text = (tiddlerTitle ? "[" + tiddlerTitle + "]" : "") + spaceName;
	}
	var e = createExternalLink(place, link, text);
}

(function ($) {
	version.extensions.TiddlySpaceLinkPlugin = {installed: true};

	config.textPrimitives.spaceName = "[a-zA-Z][a-zA-Z0-9-]*";
	config.textPrimitives.spaceNameStrict = "[a-z][a-z0-9-]*";

	config.formatters.push({
		name: "spacenameLink",
		match: config.textPrimitives.unWikiLink + "?@" + config.textPrimitives.spaceName,
		lookaheadRegExp: new RegExp(config.textPrimitives.unWikiLink + "?@(" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			if (w.matchText.substr(0, 1) === config.textPrimitives.unWikiLink) {
				w.outputText(w.output, w.matchStart + 1, w.nextMatch);
				return;
			}
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				createSpaceLink(w.output, lookaheadMatch[1], null);
			}
		}
	},
	{
		name: "tiddlerSpacenameLink",
		match: "@\\[",
		lookaheadRegExp: new RegExp("@\\[(.*?)\\](" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				createSpaceLink(w.output, lookaheadMatch[2], lookaheadMatch[1]);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	});
}(jQuery));
//}}}

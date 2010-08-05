/***
|''Name:''|TiddlySpaceLinkPlugin|
|''Description:''|Formatter to reference other spaces from wikitext |
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com) |
|''Source:''|http://whatfettle.com/2008/07/TiddlySpaceLinkPlugin/ |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/TiddlySpaceLinkPlugin/ |
|''Version:''|0.6|
|''License:''|[[BSD License|http://www.opensource.org/licenses/bsd-license.php]] |
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.4|
!!Documentation
This plugin provides wikitext formatters for referencing another [[space|Space]] on the same TiddlySpace server, as in the following examples:
{{{@space}}} -- @psd 
{{{~@space}}} -- ~@psd 
{{{Tiddler@space}}} -- Tiddler@glossary
{{{[[Tiddler Name]]@space}}} -- [[How do I link to another space?]]@faq 
{{{[[Link text|Tiddler Name]]@space}}} -- [[about spaces|Space]]@glossary

TiddlySpace includes the [[TiddlySpaceLinkPlugin]] which provides WikiText markup for linking to other spaces on the same server. For example @glossary is a link to the {{{glossary}}} [[space|Space]] and [[Small Trusted Group]]@glossary a link to an individual tiddler in the @glossary space. Prefixing the link with a tilde escapes the link, for example {{{~@space}}}. Email addresses, for example joe.bloggs@example.com and mary@had.a.little.lamb.org should be unaffected.
!!Code
***/
//{{{
/*jslint onevar: false nomen: false plusplus: false */
/*global jQuery config createTiddlyText createExternalLink */

function createSpaceLink(place, spaceName, title, alt) {
	var link, a;
	try {
		// seems safe to expect this to have been initialised within TiddlySpace
		link = config.extensions.tiddlyweb.status.server_host.url;
	} catch (ex) {
		link = "http://tiddlyspace.com";
	}
	// assumes a http URI without user:pass@ prefix
	link = link.replace("http://", "http://" + spaceName.toLowerCase() + ".");

	if (title) {
		a = createExternalLink(place, link + "#" + encodeURIComponent(String.encodeTiddlyLink(title)), alt || title);
	} else {
		a = createExternalLink(place, link, spaceName);
	}
	jQuery(a).addClass('tiddlySpaceLink');
}

(function ($) {
	version.extensions.TiddlySpaceLinkPlugin = {installed: true};

	config.textPrimitives.spaceName = "[a-zA-Z][a-zA-Z0-9-]*";
	config.textPrimitives.spaceNameStrict = "[a-z][a-z0-9-]*";

	config.formatters.splice(0, 0, {
		name: "spacenameLink",
		match: config.textPrimitives.unWikiLink + "?" + config.textPrimitives.anyLetter + "*@" + config.textPrimitives.spaceName + ".?",
		lookaheadRegExp: new RegExp(config.textPrimitives.unWikiLink + "?(" + config.textPrimitives.anyLetter + "*)@(" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			if (w.matchText.substr(w.matchText.length-1, 1) === '.') {
				w.outputText(w.output, w.matchStart, w.nextMatch);
				return;
			}
			if (w.matchText.substr(0, 1) === config.textPrimitives.unWikiLink) {
				w.outputText(w.output, w.matchStart + 1, w.nextMatch);
				return;
			}
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				createSpaceLink(w.output, lookaheadMatch[2], lookaheadMatch[1]);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	},
	{
		name: "tiddlyLinkSpacenameLink",
		match: "\\[\\[[^\\[]*\\]\\]@",
		lookaheadRegExp: new RegExp("\\[\\[(.*?)(?:\\|(.*?))?\\]\\]@(" + config.textPrimitives.spaceName + ")", "mg"),
		handler: function (w) {
			this.lookaheadRegExp.lastIndex = w.matchStart;
			var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
			if (lookaheadMatch && lookaheadMatch.index === w.matchStart) {
				var title = lookaheadMatch[2] || lookaheadMatch[1];
				var alt = lookaheadMatch[1] || lookaheadMatch[2];
				createSpaceLink(w.output, lookaheadMatch[3], title, alt);
				w.nextMatch = this.lookaheadRegExp.lastIndex;
			}
		}
	});
}(jQuery));
//}}}

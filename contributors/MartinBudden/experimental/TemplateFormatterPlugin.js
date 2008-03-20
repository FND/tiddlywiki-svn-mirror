/***
|''Name:''|TemplateFormatterPlugin|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Description:''|Plug to demonstrate template formatter|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/experimental/TemplateFormatterPlugin.js |
|''Version:''|0.0.2|
|''Date:''|Mar 19, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.3.0|

!!Description
Provides a formatter that can be used to expand templates

!!Usage
Then include this plugin and tag it systemConfig in the normal way. Templates can include:

<!--<<macroname macroparameters>>--> : macro that is expanded into the template
<!--comment--> : comment that is included in the output
<!--@@comment@@-->> : comment that is not included in the output (can be used to document the template itself)


***/

//{{{
//# Ensure that the plugin is only installed once.
if(!version.extensions.TemplateFormatterPlugin) {
version.extensions.TemplateFormatterPlugin = {installed:true};

config.templateFormatters = [
{
	name: 'templateElement',
	match: '<!--(?:<<|@@)',
	lookaheadRegExp: /<!--<<([^>\s]+)(?:\s*)((?:[^>]|(?:>(?!>)))*)>>-->|<!--@@([^@]*)@@-->/mg,
	handler: function(w)
	{
		this.lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = this.lookaheadRegExp.exec(w.source);
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			w.nextMatch = this.lookaheadRegExp.lastIndex;
			if(lookaheadMatch[1]) {
				invokeMacro(w.output,lookaheadMatch[1],lookaheadMatch[2],w,w.tiddler);
			}
		}
	}
}
];

config.parsers.templateFormatter = new Formatter(config.templateFormatters);
config.parsers.templateFormatter.format = 'template';
config.parsers.templateFormatter.formatTag = 'TemplateFormat';
} //# end of 'install only once'
//}}}

/***
|''Name''|CoreMacroDocumentation|
|''Description''|documentation of TiddlyWiki core macros|
|''Author''|<...>|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|@@experimental@@|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|MacroDocumentationMacro|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Code
***/
//{{{
config.macros.tabs.doc = {
	desc: "creates a pane to display one of several tiddlers alternately, using a tabbed interface",
	usage: "<<tabs cookieName label1 tooltip1 tiddler1 label2 tooltip2 tiddler2 [label3 ...]>>",
	params: [
		{
			desc: "cookie name",
			optional: false
		}, {
			desc: "label for tab #1",
			optional: false
		}, {
			desc: "tooltip for tab #1",
			optional: false
		}, {
			desc: "name of tiddler #1",
			optional: false
		}, {
			desc: "label for tab #2",
			optional: true
		}, {
			desc: "tooltip for tab #2",
			optional: true
		}, {
			desc: "name of tiddler #2",
			optional: true
		}, {
			desc: "label for tab #3",
			optional: true
		}, {
			desc: "...",
			optional: true
		}
	],
	examples: [
		"<<tabs 'txtShadowTiddlers'\n\t'PageTemplate' 'page layout' [[PageTemplate]]\n\t'ViewTemplate' 'tiddler layout' [[ViewTemplate]]\n\t'StyleSheet' 'custom styling' [[StyleSheet]]\n>>"
	]
};

config.macros.timeline.doc = {
	desc: "creates a list of tiddlers sorted by date",
	usage: "<<timeline [date] [length] [format]>>",
	params: [
		{
			name: 0,
			desc: "date to sort by (\"modified\" or \"created\")",
			optional: true,
			defaultValue: "modified"
		}, {
			name: 1,
			desc: "maximum length (amount of tiddlers to show)",
			optional: true,
			defaultValue: "0 (all)"
		}, {
			name: 2,
			desc: "[[date format|http://www.tiddlywiki.org/wiki/Timestamps]] to use",
			optional: true,
			defaultValue: "default timeline date format (\"DD MMM YYYY\")"
		}
	],
	examples: [
		"<<timeline>>",
		"<<timeline 'created' '99' 'YYYY-0MM-0DD 0hh:0mm'>>"
	]
};

config.macros.today.doc = {
	desc: "displays the current date and time",
	usage: "<<today [dateFormat]>>",
	params: [
		{
			name: 0,
			desc: "[[date format|http://www.tiddlywiki.org/wiki/Timestamps]] to use",
			optional: true,
			defaultValue: "default locale format"
		}
	],
	examples: [
		"<<today>>",
		"<<today 'YYYY-0MM-0DD 0hh:0mm'>>"
	]
};

config.macros.version.doc = {
	desc: "displays the version number of the current TiddlyWiki document",
	usage: "<<version>>",
	examples: [
		"<<version>>"
	]
};
//}}}

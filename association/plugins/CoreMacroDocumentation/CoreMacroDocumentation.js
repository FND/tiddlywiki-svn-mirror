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
<<macroDoc>>
!Code
***/
//{{{
config.macros.gradient.doc = {
	desc: "generates linear gradients (constructed from HTML elements, i.e. no images required)",
	usage: "<<gradient [direction] startColor [transitionColor(s)] endColor [snap:startColor [transitionColor(s)] endColor] [>>fill]>>",
	params: [
		{
			desc: "direction ({{{vert}}} or {{{horiz}}})",
			optional: true,
			defaultValue: "{{{horiz}}}"
		}, {
			desc: "starting color",
			optional: false
		}, {
			desc: "additional colors for transition (space-separated)", // DEBUG: clarify
			optional: true
		}, {
			desc: "ending color",
			optional: false
		}, {
			named: true,
			name: "snap",
			desc: "extended gradient (space-separated list of additional colors)", // DEBUG: clarify
			optional: true
		}, {
			named: true,
			name: ">>",
			desc: "contents (can be preceded by inline-CSS)", // DEBUG: clarify
			optional: true
		}
	],
	examples: [
		"<<gradient horiz #f00 #00f >>horizontal gradient>>",
		"<<gradient vert #f00 #00f >>vertical gradient>>",
		"<<gradient vert #f00 #0f0 #00f >>transitional gradient>>",
		"<<gradient vert #f00 #00f snap:#0f0 #ff0 >>extended gradient>>",
		"<<gradient horiz #f00 #00f >>padding:0.2em;color:#fff;custom-styled contents>>"
	]
}

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
			desc: "...",
			optional: true
		}, {
			desc: "...",
			optional: true
		}, {
			desc: "...",
			optional: true
		}, {
			desc: "label for tab #//n//",
			optional: true
		}, {
			desc: "tooltip for tab #//n//",
			optional: true
		}, {
			desc: "name of tiddler #//n//",
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
			desc: "date to sort by ({{{modified}}} or {{{created}}})",
			optional: true,
			defaultValue: "{{{modified}}}"
		}, {
			desc: "maximum length (amount of tiddlers to show; {{{0}}} for unlimited)",
			optional: true,
			defaultValue: "{{{0}}}"
		}, {
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

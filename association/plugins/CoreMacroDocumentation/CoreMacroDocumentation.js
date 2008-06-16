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
config.macros.allTags.doc = {
	desc: "generates a list of all tags used in the current TiddlyWiki document",
	usage: "<<allTags [excludeTag]>>",
	params: [
		{
			desc: "exclude tags carrying the specified tag",
			optional: true
		}
	],
	examples: [
		"<<allTags>>",
		"<<allTags [[excludeLists]]>>"
	]
};

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
			name: "snap",
			desc: "extended gradient (space-separated list of additional colors)", // DEBUG: clarify
			optional: true
		}, {
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
};

config.macros.list.doc = {
	desc: "generates a list of tiddlers",
	usage: "<<list [type] [filterExpression]>>",
	params: [
		{
			desc: "type of list:<br>"
				+ "* {{{all}}}: " + config.macros.list.all.prompt + "<br>"
				+ "* {{{missing}}}: " + config.macros.list.missing.prompt + "<br>"
				+ "* {{{orphans}}}: " + config.macros.list.orphans.prompt + "<br>"
				+ "* {{{shadowed}}}: " + config.macros.list.shadowed.prompt + "<br>"
				+ "* {{{touched}}}: " + config.macros.list.touched.prompt + "<br>"
				+ "* {{{filter}}}: custom-filtered list of tiddlers (requires additional {{{filterExpression}}} parameter)", // DEBUG: page does not exist
			optional: true,
			defaultValue: "{{{all}}}"
		}, {
			desc: "[[filter expression|http://www.tiddlywiki.org/wiki/Filter_Expressions]] to match (only used for type {{{filter}}})",
			optional: true
		}
	],
	examples: [
		"<<list>>",
		"<<list 'filter' '[tag[systemConfig]]'>>" // correct?
	]
};

config.macros.slider.doc = {
	desc: "displays the contents of another tiddler (\"transclusion\")\n"
		+ "supports string substitution ({{{$1}}}-{{{$9}}} in the transcluded tiddler)",
	usage: "<<slider cookie tiddler label tooltip>>",
	params: [
		{
			desc: "cookie name for saving slider state (variable name, usually with {{{chk}}} prefix)",
			optional: true
		}, {
			desc: "name of tiddler to embed",
			optional: false
		}, {
			desc: "button label",
			optional: false
		}, {
			desc: "button tooltip",
			optional: true
		}
	],
	examples: [
		"<<slider chkTestSlider [[OptionsPanel]] 'Options' 'Open advanced options'>>"
	]
};

config.macros.newTiddler.doc = {
	desc: "generates a button to create a new tiddler",
	usage: "<<newTiddler [label:label] [prompt:tooltip] [title:title] [text:text]"
		+ "[tag:tags] [accessKey:accessKey] [focus:focus] [template:template] [fields:fields]>>",
	params: [
		{
			name: "label",
			desc: "button label",
			optional: true,
			defaultValue: "{{{" + config.macros.newTiddler.label + "}}}"
		}, {
			name: "prompt",
			desc: "button tooltip",
			optional: true,
			defaultValue: "{{{" + config.macros.newTiddler.prompt + "}}}"
		}, {
			name: "title",
			desc: "default tiddler title",
			optional: true,
			defaultValue: "{{{" + config.macros.newTiddler.title + "}}}"
		}, {
			name: "text",
			desc: "default contents",
			optional: true
		}, {
			name: "tag",
			desc: "default tag (parameter can be used repeatedly to specify multiple tags)",
			optional: true
		}, {
			name: "accessKey",
			desc: "single letter to use as access key which triggers the button",
			optional: true,
			defaultValue: "{{{" + config.macros.newTiddler.accessKey + "}}}"
		}, {
			name: "focus",
			desc: "input fields to focus by default (e.g. {{{title}}}, {{{text}}} or {{{tags}}})",
			optional: true
		}, {
			name: "template",
			desc: "template tiddler used for displaying the tiddler",
			optional: true,
			defaultValue: "{{{EditTemplate}}}"
		}, {
			name: "fields",
			desc: "custom fields to be assigned to the new tiddler (format: {{{name:value;name:value;...}}})",
			optional: true
		}
	],
	examples: [
		"<<newTiddler label:'New Tiddler' text:'Hello world.' tag:'test' "
			+ "tag:'examples' accessKey:'1' focus:'tags'>>"
	]
};

config.macros.newJournal.doc = {
	desc: "generates a button to create a journal tiddler, using the current time and date as title\n"
	+ "this macro is largely identical to the NewTiddler macro",
	usage: "<<newJournal [dateFormat] [label:label] [prompt:tooltip] [text:text]"
		+ "[tag:tags] [accessKey:accessKey] [focus:focus] [template:template] [fields:fields]>>",
	params: [
		{
			desc: "[[date format|http://www.tiddlywiki.org/wiki/Timestamps]] to use in tiddler title",
			optional: true,
			defaultValue: "{{{" + config.macros.timeline.dateFormat + "}}}"
		}, {
			name: "label",
			desc: "button label",
			optional: true,
			defaultValue: "{{{" + config.macros.newJournal.label + "}}}"
		}, {
			name: "prompt",
			desc: "button tooltip",
			optional: true,
			defaultValue: "{{{" + config.macros.newJournal.prompt + "}}}"
		}, {
			name: "text",
			desc: "default contents",
			optional: true
		}, {
			name: "tag",
			desc: "default tag (parameter can be used repeatedly to specify multiple tags)",
			optional: true
		}, {
			name: "accessKey",
			desc: "single letter to use as access key which triggers the button",
			optional: true,
			defaultValue: "{{{" + config.macros.newJournal.accessKey + "}}}"
		}, {
			name: "focus",
			desc: "input fields to focus by default (e.g. {{{title}}}, {{{text}}} or {{{tags}}})",
			optional: true
		}, {
			name: "template",
			desc: "template tiddler used for displaying the tiddler",
			optional: true,
			defaultValue: "{{{EditTemplate}}}"
		}, {
			name: "fields",
			desc: "custom fields to be assigned to the new tiddler (format: {{{name:value;name:value;...}}})",
			optional: true
		}
	],
	examples: [
		"<<newJournal 'YYYY-0MM-0DD 0hh:0mm' tag:'journal'>>"
	]
};

config.macros.list.doc = {
	desc: "generates a list of tiddlers",
	usage: "<<list [type] [filterExpression]>>",
	params: [
		{
			desc: "type of list:<br>"
				+ "* {{{all}}}: " + config.macros.list.all.prompt + "<br>"
				+ "* {{{missing}}}: " + config.macros.list.missing.prompt + "<br>"
				+ "* {{{orphans}}}: " + config.macros.list.orphans.prompt + "<br>"
				+ "* {{{shadowed}}}: " + config.macros.list.shadowed.prompt + "<br>"
				+ "* {{{touched}}}: " + config.macros.list.touched.prompt + "<br>"
				+ "* {{{filter}}}: custom-filtered list of tiddlers (requires additional {{{filterExpression}}} parameter)", // DEBUG: page does not exist
			optional: true,
			defaultValue: "{{{all}}}"
		}, {
			desc: "[[filter expression|http://www.tiddlywiki.org/wiki/Filter_Expressions]] to match (only used for type {{{filter}}})",
			optional: true
		}
	],
	examples: [
		"<<list>>",
		"<<list 'filter' '[tag[systemConfig]]'>>" // correct?
	]
};

config.macros.slider.doc = {
	desc: "displays the contents of another tiddler (\"transclusion\")\n"
		+ "supports string substitution ({{{$1}}}-{{{$9}}} in the transcluded tiddler)",
	usage: "<<slider cookie tiddler label tooltip>>",
	params: [
		{
			desc: "cookie name for saving slider state (variable name, usually with {{{chk}}} prefix)",
			optional: true
		}, {
			desc: "name of tiddler to embed",
			optional: false
		}, {
			desc: "button label",
			optional: false
		}, {
			desc: "button tooltip",
			optional: true
		}
	],
	examples: [
		"<<slider chkTestSlider [[OptionsPanel]] 'Options' 'Open advanced options'>>"
	]
};

config.macros.newTiddler.doc = {
	desc: "generates a button to create a new tiddler",
	usage: "<<newTiddler [label:label] [prompt:tooltip] [title:title] [text:text]"
		+ "[tag:tags] [accessKey:accessKey] [focus:focus] [template:template] [fields:fields]>>",
	params: [
		{
			name: "label",
			desc: "button label",
			optional: true,
			defaultValue: config.macros.newTiddler.label
		}, {
			name: "prompt",
			desc: "button tooltip",
			optional: true,
			defaultValue: config.macros.newTiddler.prompt
		}, {
			name: "title",
			desc: "default tiddler title",
			optional: true,
			defaultValue: config.macros.newTiddler.title
		}, {
			name: "text",
			desc: "default contents",
			optional: true
		}, {
			name: "tag",
			desc: "default tag (parameter can be used repeatedly to specify multiple tags)",
			optional: true
		}, {
			name: "accessKey",
			desc: "single letter to use as access key which triggers the button",
			optional: true,
			defaultValue: config.macros.newTiddler.accessKey
		}, {
			name: "focus",
			desc: "input fields to focus by default (e.g. {{{title}}}, {{{text}}} or {{{tags}}})",
			optional: true
		}, {
			name: "template",
			desc: "template tiddler used for displaying the tiddler",
			optional: true,
			defaultValue: "EditTemplate"
		}, {
			name: "fields",
			desc: "custom fields to be assigned to the new tiddler (format: {{{name:value;name:value;...}}})",
			optional: true
		}
	],
	examples: [
		"<<newTiddler label:'New Tiddler' text:'Hello world.' tag:'test' "
			+ "tag:'examples' accessKey:'1' focus:'tags'>>"
	]
};

config.macros.newJournal.doc = {
	desc: "generates a button to create a journal tiddler, using the current time and date as title\n"
	+ "this macro is largely identical to the NewTiddler macro",
	usage: "<<newJournal [dateFormat] [label:label] [prompt:tooltip] [text:text]"
		+ "[tag:tags] [accessKey:accessKey] [focus:focus] [template:template] [fields:fields]>>",
	params: [
		{
			desc: "[[date format|http://www.tiddlywiki.org/wiki/Timestamps]] to use in tiddler title",
			optional: true,
			defaultValue: config.macros.timeline.dateFormat
		}
		{
			name: "label",
			desc: "button label",
			optional: true,
			defaultValue: config.macros.newJournal.label
		}, {
			name: "prompt",
			desc: "button tooltip",
			optional: true,
			defaultValue: config.macros.newJournal.prompt
		}, {
			name: "text",
			desc: "default contents",
			optional: true
		}, {
			name: "tag",
			desc: "default tag (parameter can be used repeatedly to specify multiple tags)",
			optional: true
		}, {
			name: "accessKey",
			desc: "single letter to use as access key which triggers the button",
			optional: true,
			defaultValue: config.macros.newJournal.accessKey
		}, {
			name: "focus",
			desc: "input fields to focus by default (e.g. {{{title}}}, {{{text}}} or {{{tags}}})",
			optional: true
		}, {
			name: "template",
			desc: "template tiddler used for displaying the tiddler",
			optional: true,
			defaultValue: "EditTemplate"
		}, {
			name: "fields",
			desc: "custom fields to be assigned to the new tiddler (format: {{{name:value;name:value;...}}})",
			optional: true
		}
	],
	examples: [
		"<<newJournal 'YYYY-0MM-0DD 0hh:0mm' tag:'journal'>>"
	]
};

config.macros.tabs.doc = {
	desc: "generates a pane to display tiddlers using a tabbed interface",
	usage: "<<tabs cookie label1 tooltip1 tiddler1 label2 tooltip2 tiddler2 [label3 ... tiddler_n]>>",
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

config.macros.tiddler.doc = {
	desc: "displays the contents of another tiddler (\"transclusion\")\n"
		+ "supports string substitution ({{{$1}}}-{{{$9}}} in the transcluded tiddler)",
	usage: "<<tiddler tiddler [with: substitution1 substitution2 ... substitution9]>>",
	params: [
		{
			desc: "name of tiddler to display",
			optional: false
		}, {
			desc: "substitution string to insert instead of {{{$1}}}",
			optional: true
		}, {
			desc: "...",
			optional: true
		}, {
			desc: "substitution string to insert instead of {{{$9}}}",
			optional: true
		}
	],
	examples: [
		"<<tiddler [[ViewTemplate]]>>"
	]
};

config.macros.timeline.doc = {
	desc: "generates a list of tiddlers sorted by date",
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
			defaultValue: "{{{" + config.macros.timeline.dateFormat + "}}}"
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

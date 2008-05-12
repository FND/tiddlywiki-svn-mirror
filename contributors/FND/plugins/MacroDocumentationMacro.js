/***
|''Name''|MacroDocumentationMacro|
|''Description''|<...>|
|''Author''|<...>|
|''Contributors''|<...>|
|''Version''|<...>|
|''Date''|<...>|
|''Status''|<//unknown//; @@experimental@@; @@beta@@; //obsolete//; stable>|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''Copyright''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Requires''|<...>|
|''Overrides''|<...>|
|''Feedback''|<...>|
|''Documentation''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
!Usage
{{{
<<macroDoc>>
}}}
!!Parameters
<...>
!!Examples
<<macroDoc>>
!Configuration Options
<...>
!Revision History
!!v<#.#> (<yyyy-mm-dd>)
* <...>
!To Do
* parameter for indentation (heading level) // DEBUG: obsolete due to blockquote?
* 
* l10n support (e.g. parameters table's column headings)
!Code
***/
//{{{
config.macros.macroDoc = {};
 
config.macros.macroDoc.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	if(params[0]) {
		output += this.generateDoc(config.macros[params[0]].doc);
	} else {
		var output = "";
		for each(var macro in config.macros) {
			if(macro.doc)
				output += this.generateDoc(macro.doc);
		}
	}
	wikify(output, place);
};

config.macros.macroDoc.generateDoc = function(doc) {
	output = "<<<\n";
	output += "!Description\n" + doc.desc + "\n" // DEBUG: missing macro name!?
		+ "!Usage\n{{{\n" + doc.usage + "\n}}}\n";
	if(doc.params) {
		output += "!!Parameters\n"
			+ "|!Name/Index|!Description|!Type|!Optional|!Default Value|h\n";
		for(var i = 0; i < doc.params.length; i++) {
			var p = doc.params[i];
			if(p.named)
				output += "|" + p.name;
			else
				output += "|" + (i + 1);
			output += "|" + p.desc;
			output += "|" + p.type;
			output += "|" + p.optional;
			output += "|" + p.defaultValue
				+ "|\n";
		}
	}
	if(doc.examples) {
		// DEBUG: to do
	}
	output += "<<<\n";
	console.log(output); // DEBUG
	return output;
};

config.macros.macroDoc.doc = {
	desc: "automatically renders built-in macro documentation",
	usage: "<<macroDoc [macroName] [headingLevel]>>",
	params: [
		{
			named: false,
			desc: "macro name",
			type: "string",
			optional: true,
			defaultValue: null
		}, {
			named: false,
			desc: "heading level",
			type: "integer",
			optional: true,
			defaultValue: 0
		}
		],
	examples: [
		"<<macroDoc>>",
		"<<macroDoc 'macroDoc' '2'>>"
	]
};
//}}}

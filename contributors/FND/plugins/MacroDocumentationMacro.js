/***
|''Name''|MacroDocumentationMacro|
|''Description''|provides a macro to render built-in macro documentation|
|''Author''|FND|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Source''|<...>|
|''CodeRepository''|<...>|
|''License''|<...>|
|''CoreVersion''|<...>|
|''Keywords''|<...>|
!Description
<...>
!Notes
<...>
<<macroDoc "macroDoc">>
!Revision History
!!v0.1 (2008-05-12)
* initial proof-of-concept implementation
!To Do
* l10n support (e.g. parameters table's column headings)
!Code
***/
//{{{
config.macros.macroDoc = {};
 
config.macros.macroDoc.handler = function(place, macroName, params, wikifier, paramString, tiddler) {
	var output = "!Macro Documentation\n";
	if(params[0]) {
		output += this.generateDoc(config.macros[params[0]].doc, params[0].capitalize());
	} else {
		for(var macro in config.macros) {
			if(config.macros[macro].doc)
				output += this.generateDoc(config.macros[macro].doc, macro.capitalize());
		}
	}
	wikify(output, place);
};

config.macros.macroDoc.generateDoc = function(doc, name) {
	output = "!!" + name + "\n"
		+ "<<<\n"
		+ "!!!Description\n" + doc.desc + "\n" // DEBUG: add property/section for additional notes!?
		+ "!!!Usage\n{{{\n" + doc.usage + "\n}}}\n";
	if(doc.params) {
		output += "!!!!Parameters\n"
			+ "|!Name/Index|!Description|!Optional|!Default Value|h\n";
		for(var i = 0; i < doc.params.length; i++) {
			var p = doc.params[i];
			output += (p.named ? "|" + p.name : "|" + (i + 1))
				+ "|" + p.desc
				+ "|" + (p.optional ? "yes" : "no")
				+ "|" + (p.defaultValue || "N/A")
				+ "|\n";
		}
	}
	if(doc.examples) {
		// DEBUG: to do
	}
	output += "<<<\n"
	return output;
};

config.macros.macroDoc.doc = {
	desc: "renders built-in macro documentation",
	usage: "<<macroDoc [macroName]>>",
	params: [
		{
			named: false,
			desc: "name of the macro to document",
			optional: true,
			defaultValue: null
		}
	],
	examples: [
		"<<macroDoc 'macroDoc'>>"
	]
};

String.prototype.capitalize = function() {
	return this.replace(/^\w/, function(s) {
		return s.charAt(0).toUpperCase() + s.substr(1);
	});
};
//}}}

/***
|''Name:''|TiddlerWithParamsPlugin|
|''Version:''|1.0.1 (2006-03-22)|
|''Source:''|http://tiddlywiki.abego-software.de/#TiddlerWithParamsPlugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license]]|
!Description

The TiddlerWithParamsPlugin extends the build-in {{{<<tiddler...>>}}} macro. It replaces placeholders ($1, $2, ...) in the given tiddler by values passed with the macro. Then it inserts the (replaced) text, just like the original {{{<<tiddler...>>}}} macro.

''Syntax:'' 
|>|{{{<<}}}''tiddler '' //tiddlerName// [//className//] [''asText''] [''with:'' //arguments// ] [''prefix:'' //prefixString//] {{{>>}}}|
|//tiddlerName//|The name of the tiddler to be included. The tiddler may contain placeholders ($1, $2, ... $9) that will be replaced with the values passed with the macro|
|//className//|The (CSS) class to be used around the embedded tiddler|
|''asText''|When defined the (replaced) content of the tiddler is inserted as pure text, i.e. it is not "wikified".|
|//arguments//|up to 9 arguments may be passed to the macro, used as the values for the placeholders $1, $2, ... $9 in the referenced template|
|//prefixString//|By default the placeholders $1, $2, $3,..., $9 are used. But you may change the "prefix" before the placeholder number ("$") to some other text through the "prefix:" option. This may be necessary when you are using the $n in the tiddler you are referencing (e.g. when you are using regular expressions).|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. ~~|

!Example

The following ''//ProjectTemplate//'' tiddler defines an "Overview" page for a project, that gives access to various "sub-tiddlers" used in the project, that follow a static naming schema (e.g. all Notes for any project are stored in a tiddler called "//projectName// Notes"). $1 holds the name of the Project (e.g. "ForEachTiddler"), $2 holds the type of the published component (e.g. "Plugin", "Macro", "Function").
{{{
![[$1Project]] Overview
* [[$1$2]]
* [[ToDo|$1 ToDos]]
* [[Notes|$1 Notes]]
* [[Examples|$1Examples]]
* [[Tests|$1 Tests]]
* [[Open Bugs/CRs|$1 Open Bugs and ChangeRequests]]
}}}

This template is now used in the ''//ForEachTiddlerProject//'' tiddler:
{{{
<<tiddler ProjectTemplate with: ForEachTiddler Plugin>>
}}}

This results in the following tiddler text for the ''//ForEachTiddlerProject//'' tiddler:
{{{
![[ForEachTiddlerProject]] Overview
* [[ForEachTiddlerPlugin]]
* [[ToDo|ForEachTiddler ToDos]]
* [[Notes|ForEachTiddler Notes]]
* [[Examples|ForEachTiddlerExamples]]
* [[Tests|ForEachTiddler Tests]]
* [[Open Bugs/CRs|ForEachTiddler Open Bugs and ChangeRequests]]
}}}

!Revision history
* v1.0.0 (2006-01-20)
** initial version
* v1.0.1 (2006-03-22)
** Added 'asText' option
** Support Safari (Thanks to Elise Springer for reporting the problem)
!Code
***/
//{{{
//============================================================================
// TiddlerWithParamsPlugin
//============================================================================

// Ensure that the Plugin is only installed once.
//
if (!version.extensions.TiddlerWithParamsPlugin) {

version.extensions.TiddlerWithParamsPlugin = {
	major: 1, minor: 0, revision: 1, 
	date: new Date(2006,3,22), 
	type: 'plugin',
	source: "http://tiddlywiki.abego-software.de/#TiddlerWithParamsPlugin"
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

var indexInArray = function(array, item) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] == item) {
			return i;
		}
	}
	return -1;
}

var myEscapeRegExp = function(s)
{
	// The original escapeRegExp function does not work with Safari (2.0.3) 
	// since the $& is not implemented.
var t = s.replace(/\\/g, "\\\\");
	t = t.replace(/\^/g, "\\^");
	t = t.replace(/\$/g, "\\$");
	t = t.replace(/\*/g, "\\*");
	t = t.replace(/\+/g, "\\+");
	t = t.replace(/\?/g, "\\?");
	t = t.replace(/\(/g, "\\(");
	t = t.replace(/\)/g, "\\)");
	t = t.replace(/\=/g, "\\=");
	t = t.replace(/\!/g, "\\!");
	t = t.replace(/\|/g, "\\|");
	t = t.replace(/\,/g, "\\,");
	t = t.replace(/\{/g, "\\{");
	t = t.replace(/\}/g, "\\}");
	t = t.replace(/\[/g, "\\[");
	t = t.replace(/\]/g, "\\]");
	t = t.replace(/\./g, "\\.");

    return t;
}

// ---------------------------------------------------------------------------
// The (hijacked) tiddler Macro Handler 
// ---------------------------------------------------------------------------

config.macros.tiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	
	var className = null;
	var argsStart = -1;
	var doWikify = true;

	var iParams = 1;
	if (params[iParams] != "asText" && params[iParams] != "with:") {
		className = params[iParams++];
	}
	if (params[iParams] == "asText") {
		iParams++;
		doWikify = false;
	}
	if (params[iParams] == "with:") {
		iParams++;
		argsStart = iParams;
	}
	
	var wrapper = createTiddlyElement(place,"span",null,className ? className : null,null);
	var text = store.getTiddlerText(params[0]);
	if(text) {
		// Check for recursion
		var tiddlerName = params[0];
		var stack = config.macros.tiddler.tiddlerStack;
		if (stack.find(tiddlerName) !== null) return;

		if (argsStart >= 0) {
			// The params between the "with:" and the "prefix:" (or the end) are the arguments,
			// The param behind the "prefix:" is the prefix before the placeholder numbers.
			var argsEnd = params.length;
			var prefix = "$";
			var prefixIndex = indexInArray(params, "prefix:");
			if (prefixIndex >= argsStart) {
				argsEnd = prefixIndex;
				if (prefixIndex < (params.length-1)) {
					prefix = params[prefixIndex+1];
				}
			}
			// to avoid any "special RE chars" problems with the prefix string escape all chars.
			prefix = myEscapeRegExp(prefix);
			
			var args = params.slice(argsStart, argsEnd);
			var n = Math.min(args.length, 9);
			for (var i = 0; i < n; i++) {
				var value = args[i];
				
				var placeholderRE = new RegExp(prefix+(i+1),"mg");
				text = text.replace(placeholderRE, value);
			}
		}
		stack.push(tiddlerName);
		try {
			if (doWikify) {
				wikify(text,wrapper,null,store.getTiddler(params[0]));
			} else {
				wrapper.appendChild(document.createTextNode(text));
			}
		} finally {			
			stack.pop();
		}
	}
}
config.macros.tiddler.tiddlerStack = [];

// End of "install only once"
}

//============================================================================
// End of TiddlerWithParamsPlugin
//============================================================================
//}}}
/***
!Licence and Copyright
Copyright (c) abego Software ~GmbH, 2006 ([[www.abego-software.de|http://www.abego-software.de]])

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

Redistributions in binary form must reproduce the above copyright notice, this
list of conditions and the following disclaimer in the documentation and/or other
materials provided with the distribution.

Neither the name of abego Software nor the names of its contributors may be
used to endorse or promote products derived from this software without specific
prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN
ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH
DAMAGE.
***/

/***
|Name|InlineJavascriptPlugin|
|Source|http://www.TiddlyTools.com/#InlineJavascriptPlugin|
|Version|1.6.0|
|Author|Eric Shulman - ELS Design Studios|
|License|http://www.TiddlyTools.com/#LegalStatements <<br>>and [[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires||
|Overrides||
|Description|Insert Javascript executable code directly into your tiddler content.|

''Call directly into TW core utility routines, define new functions, calculate values, add dynamically-generated TiddlyWiki-formatted output'' into tiddler content, or perform any other programmatic actions each time the tiddler is rendered.
!!!!!Usage
<<<
When installed, this plugin adds new wiki syntax for surrounding tiddler content with {{{<script>}}} and {{{</script>}}} markers, so that it can be treated as embedded javascript and executed each time the tiddler is rendered.

''Deferred execution from an 'onClick' link''
By including a {{{label="..."}}} parameter in the initial {{{<script>}}} marker, the plugin will create a link to an 'onclick' script that will only be executed when that specific link is clicked, rather than running the script each time the tiddler is rendered.  You may also include a {{{title="..."}}} parameter to specify the 'tooltip' text that will appear whenever the mouse is moved over the onClick link text

''External script source files:''
You can also load javascript from an external source URL, by including a src="..." parameter in the initial {{{<script>}}} marker (e.g., {{{<script src="demo.js"></script>}}}).  This is particularly useful when incorporating third-party javascript libraries for use in custom extensions and plugins.  The 'foreign' javascript code remains isolated in a separate file that can be easily replaced whenever an updated library file becomes available.

''Display script source in tiddler output''
By including the keyword parameter "show", in the initial {{{<script>}}} marker, the plugin will include the script source code in the output that it displays in the tiddler.

''Defining javascript functions and libraries:''
Although the external javascript file is loaded while the tiddler content is being rendered, any functions it defines will not be available for use until //after// the rendering has been completed.  Thus, you cannot load a library and //immediately// use it's functions within the same tiddler.  However, once that tiddler has been loaded, the library functions can be freely used in any tiddler (even the one in which it was initially loaded).

To ensure that your javascript functions are always available when needed, you should load the libraries from a tiddler that will be rendered as soon as your TiddlyWiki document is opened.  For example, you could put your {{{<script src="..."></script>}}} syntax into a tiddler called LoadScripts, and then add {{{<<tiddler LoadScripts>>}}} in your MainMenu tiddler.

Since the MainMenu is always rendered immediately upon opening your document, the library will always be loaded before any other tiddlers that rely upon the functions it defines.  Loading an external javascript library does not produce any direct output in the tiddler, so these definitions should have no impact on the appearance of your MainMenu.

''Creating dynamic tiddler content''
An important difference between this implementation of embedded scripting and conventional embedded javascript techniques for web pages is the method used to produce output that is dynamically inserted into the document:
* In a typical web document, you use the document.write() function to output text sequences (often containing HTML tags) that are then rendered when the entire document is first loaded into the browser window.
* However, in a ~TiddlyWiki document, tiddlers (and other DOM elements) are created, deleted, and rendered "on-the-fly", so writing directly to the global 'document' object does not produce the results you want (i.e., replacing the embedded script within the tiddler content), and completely replaces the entire ~TiddlyWiki document in your browser window.
* To allow these scripts to work unmodified, the plugin automatically converts all occurences of document.write() so that the output is inserted into the tiddler content instead of replacing the entire ~TiddlyWiki document.

If your script does not use document.write() to create dynamically embedded content within a tiddler, your javascript can, as an alternative, explicitly return a text value that the plugin can then pass through the wikify() rendering engine to insert into the tiddler display.  For example, using {{{return "thistext"}}} will produce the same output as {{{document.write("thistext")}}}.

//Note: your script code is automatically 'wrapped' inside a function, {{{_out()}}}, so that any return value you provide can be correctly handled by the plugin and inserted into the tiddler.  To avoid unpredictable results (and possibly fatal execution errors), this function should never be redefined or called from ''within'' your script code.//

''Accessing the ~TiddlyWiki DOM''
The plugin provides one pre-defined variable, 'place', that is passed in to your javascript code so that it can have direct access to the containing DOM element into which the tiddler output is currently being rendered.

Access to this DOM element allows you to create scripts that can:
* vary their actions based upon the specific location in which they are embedded
* access 'tiddler-relative' information (use findContainingTiddler(place))
* perform direct DOM manipulations (when returning wikified text is not enough)
<<<
!!!!!Examples
<<<
an "alert" message box:
><script show>
	alert('InlineJavascriptPlugin: this is a demonstration message');
</script>
dynamic output:
><script show>
	return (new Date()).toString();
</script>
wikified dynamic output:
><script show>
	return "link to current user: [["+config.options.txtUserName+"]]";
</script>
dynamic output using 'place' to get size information for current tiddler:
><script show>
   if (!window.story) window.story=window;
   var title=story.findContainingTiddler(place).id.substr(7);
   return title+" is using "+store.getTiddlerText(title).length+" bytes";
</script>
creating an 'onclick' button/link that runs a script:
><script label="click here" title="clicking this link will show an 'alert' box" show>
   if (!window.story) window.story=window;
   alert("Hello World!\nlinktext='"+place.firstChild.data+"'\ntiddler='"+story.findContainingTiddler(place).id.substr(7)+"'");
</script>
loading a script from a source url:
>http://www.TiddlyTools.com/demo.js contains:
>>{{{function demo() { alert('this output is from demo(), defined in demo.js') } }}}
>>{{{alert('InlineJavascriptPlugin: demo.js has been loaded'); }}}
><script src="demo.js" show>
	return "loading demo.js..."
</script>
><script label="click to execute demo() function" show>
	demo()
</script>
<<<
!!!!!Installation
<<<
import (or copy/paste) the following tiddlers into your document:
''InlineJavascriptPlugin'' (tagged with <<tag systemConfig>>)
<<<
!!!!!Revision History
<<<
''2007.02.19 [1.6.0]'' added support for title="..." to specify mouseover tooltip when using an onclick (label="...") script
''2006.10.16 [1.5.2]'' add newline before closing '}' in 'function out_' wrapper.  Fixes error caused when last line of script is a comment.
''2006.06.01 [1.5.1]'' when calling wikify() on script return value, pass hightlightRegExp and tiddler params so macros that rely on these values can render properly
''2006.04.19 [1.5.0]'' added 'show' parameter to force display of javascript source code in tiddler output
''2006.01.05 [1.4.0]'' added support 'onclick' scripts.  When label="..." param is present, a button/link is created using the indicated label text, and the script is only executed when the button/link is clicked.  'place' value is set to match the clicked button/link element.
''2005.12.13 [1.3.1]'' when catching eval error in IE, e.description contains the error text, instead of e.toString().  Fixed error reporting so IE shows the correct response text.  Based on a suggestion by UdoBorkowski
''2005.11.09 [1.3.0]'' for 'inline' scripts (i.e., not scripts loaded with src="..."), automatically replace calls to 'document.write()' with 'place.innerHTML+=' so script output is directed into tiddler content.  Based on a suggestion by BradleyMeck
''2005.11.08 [1.2.0]'' handle loading of javascript from an external URL via src="..." syntax
''2005.11.08 [1.1.0]'' pass 'place' param into scripts to provide direct DOM access 
''2005.11.08 [1.0.0]'' initial release
<<<
!!!!!Credits
<<<
This feature was developed by EricShulman from [[ELS Design Studios|http:/www.elsdesign.com]]
<<<
!!!!!Code
***/
//{{{
version.extensions.inlineJavascript= {major: 1, minor: 6, revision: 0, date: new Date(2007,2,19)};

config.formatters.push( {
	name: "inlineJavascript",
	match: "\\<script",
	lookahead: "\\<script(?: src=\\\"((?:.|\\n)*?)\\\")?(?: label=\\\"((?:.|\\n)*?)\\\")?(?: title=\\\"((?:.|\\n)*?)\\\")?( show)?\\>((?:.|\\n)*?)\\</script\\>",

	handler: function(w) {
		var lookaheadRegExp = new RegExp(this.lookahead,"mg");
		lookaheadRegExp.lastIndex = w.matchStart;
		var lookaheadMatch = lookaheadRegExp.exec(w.source)
		if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {
			if (lookaheadMatch[1]) { // load a script library
				// make script tag, set src, add to body to execute, then remove for cleanup
				var script = document.createElement("script"); script.src = lookaheadMatch[1];
				document.body.appendChild(script); document.body.removeChild(script);
			}
			if (lookaheadMatch[5]) { // there is script code
				if (lookaheadMatch[4]) // show inline script code in tiddler output
					wikify("{{{\n"+lookaheadMatch[0]+"\n}}}\n",w.output);
				if (lookaheadMatch[2]) { // create a link to an 'onclick' script
					// add a link, define click handler, save code in link (pass 'place'), set link attributes
					var link=createTiddlyElement(w.output,"a",null,"tiddlyLinkExisting",lookaheadMatch[2]);
					link.onclick=function(){try{return(eval(this.code))}catch(e){alert(e.description?e.description:e.toString())}}
					link.code="function _out(place){"+lookaheadMatch[5]+"\n};_out(this);"
					link.setAttribute("title",lookaheadMatch[3]?lookaheadMatch[3]:"");
					link.setAttribute("href","javascript:;");
					link.style.cursor="pointer";
				}
				else { // run inline script code
					var code="function _out(place){"+lookaheadMatch[5]+"\n};_out(w.output);"
					code=code.replace(/document.write\(/gi,'place.innerHTML+=(');
					try { var out = eval(code); } catch(e) { out = e.description?e.description:e.toString(); }
					if (out && out.length) wikify(out,w.output,w.highlightRegExp,w.tiddler);
				}
			}
			w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
		}
	}
} )
//}}}
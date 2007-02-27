/***
|Name|Plugin: jsMath|
|Created by|BobMcElrath|
|Email|my first name at my last name dot org|
|Location|http://bob.mcelrath.org/tiddlyjsmath.html|
|Version|1.5.1|
|Requires|[[TiddlyWiki|http://www.tiddlywiki.com]] &ge; 2.0.3, [[jsMath|http://www.math.union.edu/~dpvc/jsMath/]] &ge; 3.0|
!Description
LaTeX is the world standard for specifying, typesetting, and communicating mathematics among scientists, engineers, and mathematicians.  For more information about LaTeX itself, visit the [[LaTeX Project|http://www.latex-project.org/]].  This plugin typesets math using [[jsMath|http://www.math.union.edu/~dpvc/jsMath/]], which is an implementation of the TeX math rules and typesetting in javascript, for your browser.  Notice the small button in the lower right corner which opens its control panel.
!Installation
In addition to this plugin, you must also [[install jsMath|http://www.math.union.edu/~dpvc/jsMath/download/jsMath.html]] on the same server as your TiddlyWiki html file.  If you're using TiddlyWiki without a web server, then the jsMath directory must be placed in the same location as the TiddlyWiki html file.

I also recommend modifying your StyleSheet use serif fonts that are slightly larger than normal, so that the math matches surrounding text, and \\small fonts are not unreadable (as in exponents and subscripts).
{{{
.viewer {
  line-height: 125%;
  font-family: serif;
  font-size: 12pt;
}
}}}

If you had used a previous version of [[Plugin: jsMath]], it is no longer necessary to edit the main tiddlywiki.html file to add the jsMath <script> tag.  [[Plugin: jsMath]] now uses ajax to load jsMath.
!History
* 11-Nov-05, version 1.0, Initial release
* 22-Jan-06, version 1.1, updated for ~TW2.0, tested with jsMath 3.1, editing tiddlywiki.html by hand is no longer necessary.
* 24-Jan-06, version 1.2, fixes for Safari, Konqueror
* 27-Jan-06, version 1.3, improved error handling, detect if ajax was already defined (used by ZiddlyWiki)
* 12-Jul-06, version 1.4, fixed problem with not finding image fonts
* 26-Feb-07, version 1.5, fixed problem with Mozilla "unterminated character class".
* 27-Feb-07, version 1.5.1, Runs compatibly with TW 2.1.0+, by Bram Chen
!Examples
|!Source|!Output|h
|{{{The variable $x$ is real.}}}|The variable $x$ is real.|
|{{{The variable \(y\) is complex.}}}|The variable \(y\) is complex.|
|{{{This \[\int_a^b x = \frac{1}{2}(b^2-a^2)\] is an easy integral.}}}|This \[\int_a^b x = \frac{1}{2}(b^2-a^2)\] is an easy integral.|
|{{{This $$\int_a^b \sin x = -(\cos b - \cos a)$$ is another easy integral.}}}|This $$\int_a^b \sin x = -(\cos b - \cos a)$$ is another easy integral.|
|{{{Block formatted equations may also use the 'equation' environment \begin{equation}  \int \tan x = -\ln \cos x \end{equation} }}}|Block formatted equations may also use the 'equation' environment \begin{equation}  \int \tan x = -\ln \cos x \end{equation}|
|{{{Equation arrays are also supported \begin{eqnarray} a &=& b \\ c &=& d \end{eqnarray} }}}|Equation arrays are also supported \begin{eqnarray} a &=& b \\ c &=& d \end{eqnarray} |
|{{{I spent \$7.38 on lunch.}}}|I spent \$7.38 on lunch.|
|{{{I had to insert a backslash (\\) into my document}}}|I had to insert a backslash (\\) into my document|
!Code
***/
//{{{

// AJAX code adapted from http://timmorgan.org/mini
// This is already loaded by ziddlywiki...
if(typeof(window["ajax"]) == "undefined") {
  ajax = {
      x: function(){try{return new ActiveXObject('Msxml2.XMLHTTP')}catch(e){try{return new ActiveXObject('Microsoft.XMLHTTP')}catch(e){return new XMLHttpRequest()}}},
      gets: function(url){var x=ajax.x();x.open('GET',url,false);x.send(null);return x.responseText}
  }
}

// Load jsMath
jsMath = {
  Setup: {inited: 1},          // don't run jsMath.Setup.Body() yet
  Autoload: {root: new String(document.location).replace(/[^\/]*$/,'jsMath/')}  // URL to jsMath directory, change if necessary
};
var jsMathstr;
try {
  jsMathstr = ajax.gets(jsMath.Autoload.root+"jsMath.js");
} catch(e) {
  alert("jsMath was not found: you must place the 'jsMath' directory in the same place as this file.  "
       +"The error was:\n"+e.name+": "+e.message);
  throw(e);  // abort eval
}
try {
  window.eval(jsMathstr);
} catch(e) {
  alert("jsMath failed to load.  The error was:\n"+e.name + ": " + e.message + " on line " + e.lineNumber);
}
jsMath.Setup.inited=0;  //  allow jsMath.Setup.Body() to run again

// Define wikifers for latex
config.formatterHelpers.mathFormatHelper = function(w) {
    var e = document.createElement(this.element);
    e.className = this.className;
    var endRegExp = new RegExp(this.terminator, "mg");
    endRegExp.lastIndex = w.matchStart+w.matchLength;
    var matched = endRegExp.exec(w.source);
    if(matched) {
        var txt = w.source.substr(w.matchStart+w.matchLength, 
            matched.index-w.matchStart-w.matchLength);
        if(this.keepdelim) {
          txt = w.source.substr(w.matchStart, matched.index+matched[0].length-w.matchStart);
        }
        e.appendChild(document.createTextNode(txt));
        w.output.appendChild(e);
        w.nextMatch = endRegExp.lastIndex;
    }
}

config.formatters.push({
  name: "displayMath1",
  match: "\\\$\\\$",
  terminator: "\\\$\\\$\\n?", // 2.0 compatibility
  termRegExp: "\\\$\\\$\\n?",
  element: "div",
  className: "math",
  handler: config.formatterHelpers.mathFormatHelper
});

config.formatters.push({
  name: "inlineMath1",
  match: "\\\$", 
  terminator: "\\\$", // 2.0 compatibility
  termRegExp: "\\\$",
  element: "span",
  className: "math",
  handler: config.formatterHelpers.mathFormatHelper
});

var backslashformatters = new Array(0);

backslashformatters.push({
  name: "inlineMath2",
  match: "\\\\\\\(",
  terminator: "\\\\\\\)", // 2.0 compatibility
  termRegExp: "\\\\\\\)",
  element: "span",
  className: "math",
  handler: config.formatterHelpers.mathFormatHelper
});

backslashformatters.push({
  name: "displayMath2",
  match: "\\\\\\\[",
  terminator: "\\\\\\\]\\n?", // 2.0 compatibility
  termRegExp: "\\\\\\\]\\n?",
  element: "div",
  className: "math",
  handler: config.formatterHelpers.mathFormatHelper
});

backslashformatters.push({
  name: "displayMath3",
  match: "\\\\begin\\{equation\\}",
  terminator: "\\\\end\\{equation\\}\\n?", // 2.0 compatibility
  termRegExp: "\\\\end\\{equation\\}\\n?",
  element: "div",
  className: "math",
  handler: config.formatterHelpers.mathFormatHelper
});

// These can be nested.  e.g. \begin{equation} \begin{array}{ccc} \begin{array}{ccc} ...
backslashformatters.push({
  name: "displayMath4",
  match: "\\\\begin\\{eqnarray\\}",
  terminator: "\\\\end\\{eqnarray\\}\\n?", // 2.0 compatibility
  termRegExp: "\\\\end\\{eqnarray\\}\\n?",
  element: "div",
  className: "math",
  keepdelim: true,
  handler: config.formatterHelpers.mathFormatHelper
});

// The escape must come between backslash formatters and regular ones.
// So any latex-like \commands must be added to the beginning of
// backslashformatters here.
backslashformatters.push({
    name: "escape",
    match: "\\\\.",
    handler: function(w) {
        w.output.appendChild(document.createTextNode(w.source.substr(w.matchStart+1,1)));
        w.nextMatch = w.matchStart+2;
    }
});

config.formatters=backslashformatters.concat(config.formatters);

window.wikify = function(source,output,highlightRegExp,tiddler)
{
    if(source && source != "") {
        if(version.major == 2 && version.minor > 0) {
            var wikifier = new Wikifier(source,getParser(tiddler),highlightRegExp,tiddler);
            wikifier.subWikifyUnterm(output);
        } else {
            var wikifier = new Wikifier(source,formatter,highlightRegExp,tiddler);
            wikifier.subWikify(output,null);
        }
        jsMath.ProcessBeforeShowing();
    }
}
//}}}

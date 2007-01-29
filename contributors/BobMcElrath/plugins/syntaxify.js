/***
|''Name:''|Plugin: Syntaxify|
|''Description:''|Performs syntax highlighting on CSS, JavaScript, and HTML/XML|
|''Version:''|1.2|
|''Date:''|January 27, 2007|
|''Source:''|http://bob.mcelrath.org/syntaxify.html|
|''Author:''|BobMcElrath|
|''Email:''|my first name at my last name dot org|
|''License:''|[[GPL open source license|http://www.gnu.org/licenses/gpl.html]]|
|''~CoreVersion:''|2.0.0|
!Description
This plugin will syntax highlight ("pretty-print") source code used by TiddlyWiki.  To activate CSS markup, enclose the code in the CSS code in the delimiters 
<html><code>
/&#42;{{{&#42;/<br/>
/&#42; CSS code here &#42/<br/>
/&#42;}}}&#42;/<br/>
</code></html>
To activate XML markup, enclose your HTML/XML in the delimiters
<html><code>
&lt;!--{{{--&gt;<br/>
&lt;!-- XML/HTML code here --&gt;<br/>
&lt;!--}}}--&gt;<br/>
</code></html>
And to activate JavaScript markup, enclose your code in the delimiters
<html><code>
//{{{<br/>
// JavaScript code here.<br/>
//}}}<br/>
</code></html>

In addition, all of the above languages can be syntaxified by using the custom class formatter
<html><code>
{{foo{<br/>
    code for language "foo" here<br/>
}}}<br/>
</code></html>
where {{{foo}}} is the name of the language: {{{css}}}, {{{javascript}}}, or {{{xml}}}.  This plugin can be extended with new languages by creating a data structure like those below (in {{{syntaxify.languages}}} and then calling {{{syntaxify.addLanguages}}}.
!History
* 1.2 Release
** Now syntaxifies in-line style code (thanks [[Conal Elliott|http://conal.net]]).
** Fix multi-line comments in CSS.
** Consolidate customClassesHelper and monospacedByLineHelper which had lots of duplicated code.
** Fix autoLinkWikiWords bug when using custom classes and the tag formatter.
** Fix compatability problems between 2.1 and 2.0 (termRegExp vs. terminator)
* 1.1 Release
** Rewrite things to make it easier to add new languages.
** Override customClasses to syntaxify when the class corresponds to a known language.
** TiddlyWiki 2.1 beta compatibility
* 1.0.2 Release
** Don't use {{{class}}} as a variable name, dummy.
* 1.0.1 Release
** Simplified stylesheet and removed line numbering.
** Fixed highlighting when <html><code>&#42;/</code></html> appeared at the beginning of a line.
** Fixed blank lines not being shown if {{{list-style-type: none}}} was turned on.
** Small speedups
* 1.0.0 Initial Release
!Code
***/
//{{{
version.extensions.Syntaxify = { major: 1, minor: 2, revision: 0, date: new Date("2007","01","27"),
	source: "http://bob.mcelrath.org/syntaxify.html"
};

var syntaxify = {};

syntaxify.regexpSpace = new RegExp(" ", "mg");
syntaxify.regexpTab = new RegExp("\t", "mg");
syntaxify.regexpAmp = new RegExp("&","mg");
syntaxify.regexpLessThan = new RegExp("<","mg");
syntaxify.regexpGreaterThan = new RegExp(">","mg");
syntaxify.regexpQuote = new RegExp("\"","mg");
syntaxify.regexpDoubleQuotedString = new RegExp("\"(?:\\\\.|[^\\\\\"])*?\"", "mg");
syntaxify.regexpSingleQuotedString = new RegExp("'(?:\\\\.|[^\\\\'])*?'", "mg");
syntaxify.regexpCSingleLineComment = new RegExp('//.*$', "g");
syntaxify.regexpCMultiLineComment 
    = new RegExp('/\\*(?:(?:.|(?:\\r)?\\n)(?!\\*/))*(?:.|(?:\\r)?\\n)?\\*/',"mg");
String.prototype.htmlListMono = function() {
    return(this.replace(syntaxify.regexpAmp,"&amp;")
               .replace(syntaxify.regexpLessThan,"&lt;")
               .replace(syntaxify.regexpGreaterThan,"&gt;")
               .replace(syntaxify.regexpQuote,"&quot;")
               .replace(syntaxify.regexpSpace,"&nbsp;")
               .replace(syntaxify.regexpTab,"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"));
}

syntaxify.handleSpanClass = function(w) {
    var match, lastPos=0;
    if(this.lookahead) {
        var lookaheadRegExp = new RegExp(this.lookahead,"mg");  
        lookaheadRegExp.lastIndex = w.matchStart;  
        var lookaheadMatch = lookaheadRegExp.exec(w.source);  
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {  
            createTiddlyText(w.output, lookaheadMatch[1]);
            var e = createTiddlyElement(w.output, "span", null, this.name);
            e.innerHTML = this.hasSpaces?lookaheadMatch[2].htmlListMono():lookaheadMatch[2];
        }
    } else {
        while((match = regexpNewLine.exec(w.matchText)) != null) {  // multi-line
            var alt = "";
            var e = createTiddlyElement(w.output, "span", null, this.name);
            e.innerHTML = this.hasSpaces?w.matchText.substr(lastPos,match.index-lastPos).htmlListMono()
                            :w.matchText.substr(lastPos,match.index-lastPos);
            if(w.output.className != "alt") alt = "alt";
            w.output = createTiddlyElement(w.output.parentNode, "li", null, alt);
            lastPos = match.index;
        } 
        var e = createTiddlyElement(w.output, "span", null, this.name);
        e.innerHTML = this.hasSpaces?w.matchText.substr(lastPos, w.matchText.length-lastPos).htmlListMono()
                        :w.matchText.substr(lastPos, w.matchText.length-lastPos)
    }
}

/* This is a shadow tiddler.  Do not edit it here.  Instead, open the tiddler StyleSheetSyntaxify 
 * and edit it instead.  (go to the toolbar on the right and select "More"->"Shadowed") */
config.shadowTiddlers.StyleSheetSyntaxify = "/*{{{*/\n"
+".viewer .syntaxify {\n"
+"         font-family: monospace;\n"
+"}\n"
+".viewer div.syntaxify {\n"
+"         background-color: #ffc;\n"
+"         border: 1px solid #fe8;\n"
+"         padding: 0.5em;\n"
+"         margin: 0 0 1em 0.5em;\n"
+"         font-size: 1.2em;\n"
+"         overflow: auto;\n"
+"}\n\n"
+".syntaxify ol {\n"
+"        margin: 0;\n"
+"        padding: 1px;\n"
+"        color: #2B91AF;\n"
+"}\n\n"
+".syntaxify ol li {\n"
+"       background-color: #ffc;\n"
+"       color: black;\n"
+"       list-style-type: none;\n"
+"/* An alternate style to enable line numbering -- remove the line above and uncomment below if desired */\n"
+"/*\n"
+"       list-style-type: 1;\n"
+"       border-left: 3px solid #fe8;\n"
+"       margin-left: 3.5em;\n"
+"*/\n"
+"}\n\n"
+"/* To disable alternating lines having a different colors, comment out the following line. */\n"
+".syntaxify ol li.alt { background-color: #ffe; }\n\n"
+".syntaxify ol li span { color: black; }\n"
+".syntaxify .singleLineComments { color: green; }\n"
+".syntaxify .multiLineComments { color: green; }\n"
+".syntaxify .multiLineComments1 { color: red; }\n"
+".syntaxify .tag { font-weight: bold; color: blue; }\n"
+".syntaxify .tagname { font-weight: bold; color: black; }\n"
+".syntaxify .attribute { color: rgb(127,0,85); }\n"
+".syntaxify .value { color: rgb(42,0,255); }\n"
+".syntaxify .keywords { color: #006699; }\n"
+".syntaxify .keywords1 { color: red; }\n"
+".syntaxify .delimiters { color: maroon; }\n"
+".syntaxify .delimiters1 { color: olive; }\n"
+".syntaxify .literals { color: maroon; }\n"
+".syntaxify .literals1 { color: blue; }\n"
+".syntaxify .literals2 { color: blue; }\n"
+".syntaxify .literals3 { color: #129; }\n"
+".syntaxify .identifiers { font-weight: bold; color: blue; }\n"
+".syntaxify .identifiers1 { font-weight: bold; color: black; }\n"
+"/*}}}*/";

store.addNotification("StyleSheetSyntaxify",refreshStyles);
config.shadowTiddlers.ViewTemplate = "<!--{{{-->\n"+config.shadowTiddlers.ViewTemplate+"\n<!--}}}-->";
config.shadowTiddlers.EditTemplate = "<!--{{{-->\n"+config.shadowTiddlers.EditTemplate+"\n<!--}}}-->";
config.shadowTiddlers.PageTemplate = "<!--{{{-->\n"+config.shadowTiddlers.PageTemplate+"\n<!--}}}-->";
config.shadowTiddlers.StyleSheetPrint = "/*{{{*/\n"+config.shadowTiddlers.StyleSheetPrint+"\n/*}}}*/";

syntaxify.commonFormatters = [
{   name: "spaces",
    match: "[ \\t]+",
    handler: function(w) {
        w.output.innerHTML += w.matchText.htmlListMono();
    }
},{ name: "newline",
    match: "\\n",
    handler: function(w) {
        var alt = ""
        if(w.output.className != "alt") alt = "alt";
        if(!w.output.hasChildNodes()) w.output.innerHTML = "&nbsp;";
        w.output = createTiddlyElement(w.output.parentNode, "li", null, alt);
    }
}];

syntaxify.xmlTagFormatters = syntaxify.commonFormatters;
syntaxify.xmlTagFormatters = syntaxify.xmlTagFormatters.concat([
{   name: "tagname",
    match: '<[/\\?]?\\s*(?:[\\w-\\.]+)',
    lookahead: '(<[/\\?]?\\s*)([\\w-\\.]+)',
    handler: syntaxify.handleSpanClass
},{
    name: "attribute-value",
    match: '[\\w-\.]+(?:\\s*=\\s*"[^"]*?"|\'[^\']*?\'|\\w+)?',
    lookahead: '([\\w-\.]+)(?:(\\s*=\\s*)("[^"]*?"|\'[^\']*?\'|\\w+))?',
    handler: function(w) {
        var lookaheadRegExp = new RegExp(this.lookahead,"mg");  
        lookaheadRegExp.lastIndex = w.matchStart;  
        var lookaheadMatch = lookaheadRegExp.exec(w.source);  
        if(lookaheadMatch && lookaheadMatch.index == w.matchStart) {  
            var e = createTiddlyElement(w.output, "span", null, "attribute");
            e.innerHTML = lookaheadMatch[1];
            if(lookaheadMatch[2]) {
                var e = createTiddlyElement(w.output, "span");
                e.innerHTML = lookaheadMatch[2].htmlListMono();
                e = createTiddlyElement(w.output, "span", null, "value");
                e.innerHTML = lookaheadMatch[3].htmlListMono();
            }
        }
        w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;  
    }
}]);


// A rather huge data structure to store languages.  Add to it!
syntaxify.languages = {
javascript: {
    singleLineComments: [[syntaxify.regexpCSingleLineComment.source]],
    multiLineComments: [[syntaxify.regexpCMultiLineComment.source]],
    keywords: [['abstract', 'boolean', 'break', 'byte', 'case', 'catch', 'char',
        'class', 'const', 'continue', 'debugger', 'default', 'delete', 'do',
        'double', 'else', 'enum', 'export', 'extends', 'false', 'final',
        'finally', 'float', 'for', 'function', 'goto', 'if', 'implements',
        'import', 'in', 'instanceof', 'int', 'interface', 'long', 'native',
        'new', 'null', 'package', 'private', 'protected', 'public', 'return',
        'short', 'static', 'super', 'switch', 'synchronized', 'this', 'throw',
        'throws', 'transient', 'true', 'try', 'typeof', 'var', 'void',
        'volatile', 'while', 'with']
    ],
    literals: [
        [syntaxify.regexpSingleQuotedString.source],
        [syntaxify.regexpDoubleQuotedString.source],
        ["\\b\\d+(?:\\.\\d+(?:[eE][\\+-]\\d+)?)?\\b"] // Numbers
    ],
    delimiters: [["[\\{\\}]"],["[\\(\\)]"],["[\\[\\]]"]]
}, 
css: {
    multiLineComments: [[syntaxify.regexpCMultiLineComment.source]],
    keywords: [
        // Keywords appearing on the LHS of expressions
        ['ascent', 'azimuth', 'background-attachment', 'background-color',
        'background-image', 'background-position',  'background-repeat',
        'background', 'baseline', 'bbox', 'border-collapse', 'border-color',
        'border-spacing', 'border-style', 'border-top',  'border-right',
        'border-bottom', 'border-left', 'border-top-color',
        'border-right-color', 'border-bottom-color', 'border-left-color',
        'border-top-style', 'border-right-style', 'border-bottom-style',
        'border-left-style', 'border-top-width', 'border-right-width',
        'border-bottom-width', 'border-left-width', 'border-width', 'border',
        'bottom', 'cap-height', 'caption-side', 'centerline', 'clear', 'clip',
        'color',  'content', 'counter-increment', 'counter-reset', 'cue-after',
        'cue-before', 'cue', 'cursor', 'definition-src', 'descent',
        'direction', 'display', 'elevation', 'empty-cells', 'float',
        'font-size-adjust', 'font-family', 'font-size', 'font-stretch',
        'font-style', 'font-variant', 'font-weight', 'font',  'height', 'left',
        'letter-spacing', 'line-height', 'list-style-image',
        'list-style-position', 'list-style-type', 'list-style', 'margin-top',
        'margin-right', 'margin-bottom', 'margin-left', 'margin',
        'marker-offset', 'marks', 'mathline', 'max-height', 'max-width',
        'min-height', 'min-width', 'orphans',  'outline-color',
        'outline-style', 'outline-width', 'outline', 'overflow', 'padding-top',
        'padding-right', 'padding-bottom', 'padding-left', 'padding', 'page',
        'page-break-after', 'page-break-before', 'page-break-inside', 'pause',
        'pause-after', 'pause-before', 'pitch', 'pitch-range', 'play-during',
        'position', 'quotes', 'richness', 'right', 'size', 'slope', 'src',
        'speak-header', 'speak-numeral', 'speak-punctuation', 'speak',
        'speech-rate', 'stemh', 'stemv', 'stress', 'table-layout',
        'text-align', 'text-decoration', 'text-indent', 'text-shadow',
        'text-transform', 'unicode-bidi', 'unicode-range', 'units-per-em',
        'vertical-align', 'visibility', 'voice-family', 'volume',
        'white-space', 'widows', 'width', 'widths', 'word-spacing', 'x-height',
        'z-index'],
        // Treat !important as a different kind of keyword
        ["important"]
    ],
    literals: [
        // Literals appearing on the RHS of expressions
        ['above', 'absolute', 'all', 'always', 'aqua', 'armenian', 'attr',
        'aural', 'auto', 'avoid', 'baseline', 'behind', 'below',
        'bidi-override', 'black', 'blink', 'block', 'blue', 'bold', 'bolder',
        'both', 'bottom', 'braille', 'capitalize', 'caption', 'center',
        'center-left', 'center-right', 'circle', 'close-quote', 'code',
        'collapse', 'compact', 'condensed', 'continuous', 'counter',
        'counters', 'crop', 'cross', 'crosshair', 'cursive', 'dashed',
        'decimal', 'decimal-leading-zero', 'default', 'digits', 'disc',
        'dotted', 'double', 'embed', 'embossed', 'e-resize', 'expanded',
        'extra-condensed', 'extra-expanded', 'fantasy', 'far-left',
        'far-right', 'fast', 'faster', 'fixed', 'format', 'fuchsia', 'gray',
        'green', 'groove', 'handheld', 'hebrew', 'help', 'hidden', 'hide',
        'high', 'higher', 'icon', 'inline-table', 'inline', 'inset', 'inside',
        'invert', 'italic', 'justify', 'landscape', 'large', 'larger',
        'left-side', 'left', 'leftwards', 'level', 'lighter', 'lime',
        'line-through', 'list-item', 'local', 'loud', 'lower-alpha',
        'lowercase', 'lower-greek', 'lower-latin', 'lower-roman', 'lower',
        'low', 'ltr', 'marker', 'maroon', 'medium', 'message-box', 'middle',
        'mix', 'move', 'narrower', 'navy', 'ne-resize', 'no-close-quote',
        'none', 'no-open-quote', 'no-repeat', 'normal', 'nowrap', 'n-resize',
        'nw-resize', 'oblique', 'olive', 'once', 'open-quote', 'outset',
        'outside', 'overline', 'pointer', 'portrait', 'pre', 'print',
        'projection', 'purple', 'red', 'relative', 'repeat', 'repeat-x',
        'repeat-y', 'ridge', 'right', 'right-side', 'rightwards', 'rtl',
        'run-in', 'screen', 'scroll', 'semi-condensed', 'semi-expanded',
        'separate', 'se-resize', 'show', 'silent', 'silver', 'slower', 'slow',
        'small', 'small-caps', 'small-caption', 'smaller', 'soft', 'solid',
        'speech', 'spell-out', 'square', 's-resize', 'static', 'status-bar',
        'sub', 'super', 'sw-resize', 'table-caption', 'table-cell',
        'table-column', 'table-column-group', 'table-footer-group',
        'table-header-group', 'table-row', 'table-row-group', 'teal',
        'text-bottom', 'text-top', 'thick', 'thin', 'top', 'transparent',
        'tty', 'tv', 'ultra-condensed', 'ultra-expanded', 'underline',
        'upper-alpha', 'uppercase', 'upper-latin', 'upper-roman', 'url',
        'visible', 'wait', 'white', 'wider', 'w-resize', 'x-fast', 'x-high',
        'x-large', 'x-loud', 'x-low', 'x-slow', 'x-small', 'x-soft',
        'xx-large', 'xx-small', 'yellow'],
        // Font literals
        ['[mM]ono(?:space)?', '[tT]ahoma', '[vV]erdana', '[aA]rial',
        '[hH]elvetica', '[sS]ans(?:-serif)?', '[sS]erif', '[Cc]ourier'],
        // Measurement literals
        ["\\b\\d+(?:\\.\\d+)?(?:em|pt|px|cm|in|pc|mm)\\b"],
        // Color literals
        ['(?:\\#[a-fA-F0-9]{6}\\b|\\#[a-fA-F0-9]{3}\\b|rgb\\(\\s*\\d+\\s*,\\s*\\d+\\s*,\\s*\\d+\\s*\\))']
    ],
    identifiers: [["\\.[a-zA-Z_]\\w*"],["\\#[a-zA-Z_]\\w*"]],
    delimiters: [["[\\{\\}]"]]
}, 
xml: {
    multiLineComments: [
        ["<[^!>]*!--\\s*(?:(?:.|(?:\\r)?\\n)(?!--))*?(?:(?:.|(?:\\r)?\\n)(?=--))?\\s*--[^>]*?>"],
        ['<\\!\\[[\\w\\s]*?\\[(?:(?:.|(?:\\r)?\\n)(?!\\]\\]>))*?(?:(?:.|(?:\\r)?\\n)(?=\\]\\]>))?\\]\\]>']
    ],
    customFormatters: [{
        name: "tag",
        match: "<[/\\?]?[^>]*?>",
        handler: function(w) {
            var formatter = new Formatter(syntaxify.xmlTagFormatters);
            var wikifier = new Wikifier(w.matchText, formatter, w.highlightRegExp, w.tiddler);
            wikifier.subWikify(w.output, null);
        }
    }]
}};

config.formatterHelpers.customClassesHelper = function(w) {
    var lookaheadRegExp = (typeof(this.lookaheadRegExp) == "undefined")?(new RegExp(this.lookahead,"mg")):this.lookaheadRegExp;
    lookaheadRegExp.lastIndex = w.matchStart;
    var lookaheadMatch = lookaheadRegExp.exec(w.source);
    var language = (typeof(this.language) == "undefined")?lookaheadMatch[1]:this.language;
    if(lookaheadMatch && lookaheadMatch.index == w.matchStart)
    {
        var isByLine = (typeof(this.byLine) == "undefined")?(lookaheadMatch[2] == "\n"):this.byLine;
        var p = createTiddlyElement(w.output,isByLine ? "div" : "span",null,language);
        w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;
        if(typeof(syntaxify.formatters[language]) != "undefined") {
            var d = createTiddlyElement(w.output,isByLine?"div":"span",
				        null,"syntaxify "+language);
            var formatter = new Formatter(syntaxify.formatters[language]);
            if(typeof(this.termRegExp) == "undefined") {
                var text = lookaheadMatch[1];  
            } else {
                this.termRegExp.lastIndex = w.nextMatch;
                var terminatorMatch = this.termRegExp.exec(w.source);
                var text = w.source.substr(w.nextMatch, terminatorMatch.index-w.nextMatch);
            }
            if(config.browser.isIE) text = text.replace(/\n/g,"\r");  
            if (isByLine) {
                var l = createTiddlyElement(d,"ol");
                var li = createTiddlyElement(l,"li");
                var wikifier = new Wikifier(text, formatter, w.highlightRegExp, w.tiddler);
                wikifier.subWikify(li, null);
                if(!l.childNodes[l.childNodes.length-1].hasChildNodes())
                    l.removeChild(l.childNodes[l.childNodes.length-1]);
            } else {
	      var wikifier = new Wikifier(text,formatter,w.highlightRegExp,w.tiddler);
	      wikifier.subWikify(d, null);
            }
            if(typeof(this.termRegExp) != "undefined")
                w.nextMatch = terminatorMatch.index + terminatorMatch[0].length;
            else
                w.nextMatch = lookaheadMatch.index + lookaheadMatch[0].length;  
        } else {
            if(isByLine)
                var e = createTiddlyElement(w.output,"code",null,null,text);  
            else
                var e = createTiddlyElement(w.output,"pre",null,null,text);  
        }
    }
}

syntaxify.formatters = {};

syntaxify.addLanguages = function(languages) {
    for(lang in languages) {
        syntaxify.formatters[lang] = new Array();
        for(var i=0;i<syntaxify.commonFormatters.length;i++)
            syntaxify.formatters[lang].push(syntaxify.commonFormatters[i]);
        var addSpanClass = function(rule, spaces, wordbreak) {
            if(typeof(languages[lang][rule]) != "undefined") {
                for(var j=0;j<languages[lang][rule].length;j++) {
                    syntaxify.formatters[lang].push({
                        name: rule+((j==0)?"":j),
                        match: wordbreak?("(?:\\b"+languages[lang][rule][j].join("\\b|\\b")+"\\b)")
                                        :("(?:"+languages[lang][rule][j].join("|")+")"),
                        hasSpaces: spaces,
                        handler: syntaxify.handleSpanClass
                    });
                }
            }
        };
        addSpanClass("singleLineComments", true, false);
        addSpanClass("multiLineComments", true, false);
        addSpanClass("keywords", false, true);
        addSpanClass("literals", true, false);
        addSpanClass("delimiters", false, false);
        addSpanClass("identifiers", false, false);
        if(typeof(languages[lang].customFormatters) != "undefined") 
            syntaxify.formatters[lang] = syntaxify.formatters[lang].concat(languages[lang].customFormatters);
    }
}

syntaxify.addLanguages(syntaxify.languages);

// Override the several built-in TiddlyWiki language-specific <pre> formatters
for(var i=0;i<config.formatters.length;i++) {  
  if(config.formatters[i].name == "monospacedByLineForPlugin") {  
    config.formatters[i].language = "javascript";
    config.formatters[i].byLine = true;
    config.formatters[i].handler = config.formatterHelpers.customClassesHelper;  
  }  
  if(config.formatters[i].name == "monospacedByLineForCSS") {  
    config.formatters[i].language = "css";
    config.formatters[i].byLine = true;
    config.formatters[i].handler = config.formatterHelpers.customClassesHelper;  
  }  
  if(config.formatters[i].name == "monospacedByLineForTemplate") {  
    config.formatters[i].language = "xml";
    config.formatters[i].byLine = true;
    config.formatters[i].handler = config.formatterHelpers.customClassesHelper;  
  }  
  if(config.formatters[i].name == "customClasses") {
    config.formatters[i].handler = config.formatterHelpers.customClassesHelper;  
    if(typeof(config.formatters[i].termRegExp) == "undefined")
        config.formatters[i].termRegExp = new RegExp(config.formatters[i].terminator, "mg");
  }
}

// make syntaxify reliably accessible from dependent plugins even under IE.
config.macros.syntaxify = syntaxify;
//}}}

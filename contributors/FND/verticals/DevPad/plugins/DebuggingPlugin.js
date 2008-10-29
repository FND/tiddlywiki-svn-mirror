/***
|Name|DebuggingPlugin|
|Source|[[FND's DevPad|http://devpad.tiddlyspot.com/#DebuggingPlugin]]|
|Version|0.5|
|Author|FND|
|License|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|~CoreVersion|2.1|
|Type|plugin|
|Requires|N/A|
|Overrides|N/A|
|Description|provides a simple framework for debugging|
!Usage
* {{{showDebugBuffer(string)}}}
* {{{print_r(array, indentationPrefix)}}}
!Changelog
!!v0.5 (2007-05-29)
* initial release
!To Do
* use tiddler instead of a "raw" element
!Code
***/
//{{{
/* Styles (can be customized in the StyleSheetDEBUG shadow tiddler) */

config.shadowTiddlers.StyleSheetDEBUG = "/*{{{*/\n"
	+ "#DebugBuffer {\n\tmargin: 10em 1em 1em;\n\tpadding: 4px;\n\tborder: 1px solid #AAA;\n\tfont-size: 1.2em;\n\tbackground-color: #F8F8F8;\n}\n"
	+ "/*}}}*/";
store.addNotification("StyleSheetDEBUG", refreshStyles);

/* Functions */

// create pane for debugging outputs
function createDebugBuffer(text) {
	// initialize DEBUG buffer
	text = "******************\n"
	+ "** DEBUG BUFFER **\n"
	+ "******************\n\n"
	+ text;
	// create output element
	createTiddlyElement(document.body, "pre", "DebugBuffer", null, text);
}

// print_r() for JavaScript (http://www.phpbuilder.com/board/showthread.php?t=10294264)
function print_r(input, _indent) {
    if(typeof(_indent) == 'string') {
        var indent = _indent + '    ';
        var paren_indent = _indent + '  ';
    } else {
        var indent = '    ';
        var paren_indent = '';
    }
    switch(typeof(input)) {
        case 'boolean':
            var output = (input ? 'true' : 'false') + "\n";
            break;
        case 'object':
            if ( input===null ) {
                var output = "null\n";
                break;
            }
            var output = ((input.reverse) ? 'Array' : 'Object') + " (\n";
            for(var i in input) {
                output += indent + "[" + i + "] => " + print_r(input[i], indent);
            }
            output += paren_indent + ")\n";
            break;
        case 'number':
        case 'string':
        default:
            var output = "" + input  + "\n";
    }
    return output;
}
//}}}
/***
|''Name:''|DataTiddlerPlugin|
|''Version:''|1.0.6 (2006-08-26)|
|''Source:''|http://tiddlywiki.abego-software.de/#DataTiddlerPlugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license]]|
|''TiddlyWiki:''|1.2.38+, 2.0|
|''Browser:''|Firefox 1.0.4+; InternetExplorer 6.0|
!Description
Enhance your tiddlers with structured data (such as strings, booleans, numbers, or even arrays and compound objects) that can be easily accessed and modified through named fields (in JavaScript code).

Such tiddler data can be used in various applications. E.g. you may create tables that collect data from various tiddlers. 

''//Example: "Table with all December Expenses"//''
{{{
<<forEachTiddler
    where
        'tiddler.tags.contains("expense") && tiddler.data("month") == "Dec"'
    write
        '"|[["+tiddler.title+"]]|"+tiddler.data("descr")+"| "+tiddler.data("amount")+"|\sn"'
>>
}}}
//(This assumes that expenses are stored in tiddlers tagged with "expense".)//
<<forEachTiddler
    where
        'tiddler.tags.contains("expense") && tiddler.data("month") == "Dec"'
    write
        '"|[["+tiddler.title+"]]|"+tiddler.data("descr")+"| "+tiddler.data("amount")+"|\sn"'
>>
For other examples see DataTiddlerExamples.




''Access and Modify Tiddler Data''

You can "attach" data to every tiddler by assigning a JavaScript value (such as a string, boolean, number, or even arrays and compound objects) to named fields. 

These values can be accessed and modified through the following Tiddler methods:
|!Method|!Example|!Description|
|{{{data(field)}}}|{{{t.data("age")}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined {{{undefined}}} is returned.|
|{{{data(field,defaultValue)}}}|{{{t.data("isVIP",false)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined the defaultValue is returned.|
|{{{data()}}}|{{{t.data()}}}|Returns the data object of the tiddler, with a property for every field. The properties of the returned data object may only be read and not be modified. To modify the data use DataTiddler.setData(...) or the corresponding Tiddler method.|
|{{{setData(field,value)}}}|{{{t.setData("age",42)}}}|Sets the value of the given data field of the tiddler to the value. When the value is {{{undefined}}} the field is removed.|
|{{{setData(field,value,defaultValue)}}}|{{{t.setData("isVIP",flag,false)}}}|Sets the value of the given data field of the tiddler to the value. When the value is equal to the defaultValue no value is set (and the field is removed).|

Alternatively you may use the following functions to access and modify the data. In this case the tiddler argument is either a tiddler or the name of a tiddler.
|!Method|!Description|
|{{{DataTiddler.getData(tiddler,field)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined {{{undefined}}} is returned.|
|{{{DataTiddler.getData(tiddler,field,defaultValue)}}}|Returns the value of the given data field of the tiddler. When no such field is defined or its value is undefined the defaultValue is returned.|
|{{{DataTiddler.getDataObject(tiddler)}}}|Returns the data object of the tiddler, with a property for every field. The properties of the returned data object may only be read and not be modified. To modify the data use DataTiddler.setData(...) or the corresponding Tiddler method.|
|{{{DataTiddler.setData(tiddler,field,value)}}}|Sets the value of the given data field of the tiddler to the value. When the value is {{{undefined}}} the field is removed.|
|{{{DataTiddler.setData(tiddler,field,value,defaultValue)}}}|Sets the value of the given data field of the tiddler to the value. When the value is equal to the defaultValue no value is set (and the field is removed).|
//(For details on the various functions see the detailed comments in the source code.)//


''Data Representation in a Tiddler''

The data of a tiddler is stored as plain text in the tiddler's content/text, inside a "data" section that is framed by a {{{<data>...</data>}}} block. Inside the data section the information is stored in the [[JSON format|http://www.crockford.com/JSON/index.html]]. 

//''Data Section Example:''//
{{{
<data>{"isVIP":true,"user":"John Brown","age":34}</data>
}}}

The data section is not displayed when viewing the tiddler (see also "The showData Macro").

Beside the data section a tiddler may have all kind of other content.

Typically you will not access the data section text directly but use the methods given above. Nevertheless you may retrieve the text of the data section's content through the {{{DataTiddler.getDataText(tiddler)}}} function.


''Saving Changes''

The "setData" methods respect the "ForceMinorUpdate" and "AutoSave" configuration values. I.e. when "ForceMinorUpdate" is true changing a value using setData will not affect the "modifier" and "modified" attributes. With "AutoSave" set to true every setData will directly save the changes after a setData.


''Notifications''

No notifications are sent when a tiddler's data value is changed through the "setData" methods. 

''Escape Data Section''
In case that you want to use the text {{{<data>}}} or {{{</data>}}} in a tiddler text you must prefix the text with a tilde ('~'). Otherwise it may be wrongly considered as the data section. The tiddler text {{{~<data>}}} is displayed as {{{<data>}}}.


''The showData Macro''

By default the data of a tiddler (that is stored in the {{{<data>...</data>}}} section of the tiddler) is not displayed. If you want to display this data you may used the {{{<<showData ...>>}}} macro:

''Syntax:'' 
|>|{{{<<}}}''showData '' [''JSON''] [//tiddlerName//] {{{>>}}}|
|''JSON''|By default the data is rendered as a table with a "Name" and "Value" column. When defining ''JSON'' the data is rendered in JSON format|
|//tiddlerName//|Defines the tiddler holding the data to be displayed. When no tiddler is given the tiddler containing the showData macro is used. When the tiddler name contains spaces you must quote the name (or use the {{{[[...]]}}} syntax.)|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. 'or' means that exactly one of the two alternatives must exist.~~|


!Revision history
* v1.0.6 (2006-08-26) 
** Removed misleading comment
* v1.0.5 (2006-02-27) (Internal Release Only)
** Internal
*** Make "JSLint" conform
* v1.0.4 (2006-02-05)
** Bugfix: showData fails in TiddlyWiki 2.0
* v1.0.3 (2006-01-06)
** Support TiddlyWiki 2.0
* v1.0.2 (2005-12-22)
** Enhancements:
*** Handle texts "<data>" or "</data>" more robust when used in a tiddler text or as a field value.
*** Improved (JSON) error messages.
** Bugs fixed: 
*** References are not updated when using the DataTiddler.
*** Changes to compound objects are not always saved.
*** "~</data>" is not rendered correctly (expected "</data>")
* v1.0.1 (2005-12-13)
** Features: 
*** The showData macro supports an optional "tiddlername" argument to specify the tiddler containing the data to be displayed
** Bugs fixed: 
*** A script immediately following a data section is deleted when the data is changed. (Thanks to GeoffS for reporting.)
* v1.0.0 (2005-12-12)
** initial version

!Code
***/
//{{{
//============================================================================
//============================================================================
//                           DataTiddlerPlugin
//============================================================================
//============================================================================

// Ensure that the DataTiddler Plugin is only installed once.
//
if (!version.extensions.DataTiddlerPlugin) {



version.extensions.DataTiddlerPlugin = {
    major: 1, minor: 0, revision: 6,
    date: new Date(2006, 7, 26), 
    type: 'plugin',
    source: "http://tiddlywiki.abego-software.de/#DataTiddlerPlugin"
};

// For backward compatibility with v1.2.x
//
if (!window.story) window.story=window; 
if (!TiddlyWiki.prototype.getTiddler) {
	TiddlyWiki.prototype.getTiddler = function(title) { 
		var t = this.tiddlers[title]; 
		return (t !== undefined && t instanceof Tiddler) ? t : null; 
	};
}

//============================================================================
// DataTiddler Class
//============================================================================

// ---------------------------------------------------------------------------
// Configurations and constants 
// ---------------------------------------------------------------------------

function DataTiddler() {
}

DataTiddler = {
    // Function to stringify a JavaScript value, producing the text for the data section content.
    // (Must match the implementation of DataTiddler.parse.)
    //
    stringify : null,
    

    // Function to parse the text for the data section content, producing a JavaScript value.
    // (Must match the implementation of DataTiddler.stringify.)
    //
    parse : null
};

// Ensure access for IE
window.DataTiddler = DataTiddler;

// ---------------------------------------------------------------------------
// Data Accessor and Mutator
// ---------------------------------------------------------------------------


// Returns the value of the given data field of the tiddler.
// When no such field is defined or its value is undefined
// the defaultValue is returned.
// 
// @param tiddler either a tiddler name or a tiddler
//
DataTiddler.getData = function(tiddler, field, defaultValue) {
    var t = (typeof tiddler == "string") ? store.getTiddler(tiddler) : tiddler;
    if (!(t instanceof Tiddler)) {
        throw "Tiddler expected. Got "+tiddler;
    }

    return DataTiddler.getTiddlerDataValue(t, field, defaultValue);
};


// Sets the value of the given data field of the tiddler to
// the value. When the value is equal to the defaultValue
// no value is set (and the field is removed)
//
// Changing data of a tiddler will not trigger notifications.
// 
// @param tiddler either a tiddler name or a tiddler
//
DataTiddler.setData = function(tiddler, field, value, defaultValue) {
    var t = (typeof tiddler == "string") ? store.getTiddler(tiddler) : tiddler;
    if (!(t instanceof Tiddler)) {
        throw "Tiddler expected. Got "+tiddler+ "("+t+")";
    }

    DataTiddler.setTiddlerDataValue(t, field, value, defaultValue);
};


// Returns the data object of the tiddler, with a property for every field.
//
// The properties of the returned data object may only be read and
// not be modified. To modify the data use DataTiddler.setData(...) 
// or the corresponding Tiddler method.
//
// If no data section is defined a new (empty) object is returned.
//
// @param tiddler either a tiddler name or a Tiddler
//
DataTiddler.getDataObject = function(tiddler) {
    var t = (typeof tiddler == "string") ? store.getTiddler(tiddler) : tiddler;
    if (!(t instanceof Tiddler)) {
        throw "Tiddler expected. Got "+tiddler;
    }

    return DataTiddler.getTiddlerDataObject(t);
};

// Returns the text of the content of the data section of the tiddler.
//
// When no data section is defined for the tiddler null is returned 
//
// @param tiddler either a tiddler name or a Tiddler
// @return [may be null]
//
DataTiddler.getDataText = function(tiddler) {
    var t = (typeof tiddler == "string") ? store.getTiddler(tiddler) : tiddler;
    if (!(t instanceof Tiddler)) {
        throw "Tiddler expected. Got "+tiddler;
    }

    return DataTiddler.readDataSectionText(t);
};


// ---------------------------------------------------------------------------
// Internal helper methods (must not be used by code from outside this plugin)
// ---------------------------------------------------------------------------

// Internal.
//
// The original JSONError is not very user friendly, 
// especially it does not define a toString() method
// Therefore we extend it here.
//
DataTiddler.extendJSONError = function(ex) {
	if (ex.name == 'JSONError') {
        ex.toString = function() {
			return ex.name + ": "+ex.message+" ("+ex.text+")";
		};
	}
	return ex;
};

// Internal.
//
// @param t a Tiddler
//
DataTiddler.getTiddlerDataObject = function(t) {
    if (t.dataObject === undefined) {
        var data = DataTiddler.readData(t);
        t.dataObject = (data) ? data : {};
    }
    
    return t.dataObject;
};


// Internal.
//
// @param tiddler a Tiddler
//
DataTiddler.getTiddlerDataValue = function(tiddler, field, defaultValue) {
    var value = DataTiddler.getTiddlerDataObject(tiddler)[field];
    return (value === undefined) ? defaultValue : value;
};


// Internal.
//
// @param tiddler a Tiddler
//
DataTiddler.setTiddlerDataValue = function(tiddler, field, value, defaultValue) {
    var data = DataTiddler.getTiddlerDataObject(tiddler);
    var oldValue = data[field];
	
    if (value == defaultValue) {
        if (oldValue !== undefined) {
            delete data[field];
            DataTiddler.save(tiddler);
        }
        return;
    }
    data[field] = value;
    DataTiddler.save(tiddler);
};

// Internal.
//
// Reads the data section from the tiddler's content and returns its text
// (as a String).
//
// Returns null when no data is defined.
//
// @param tiddler a Tiddler
// @return [may be null]
//
DataTiddler.readDataSectionText = function(tiddler) {
    var matches = DataTiddler.getDataTiddlerMatches(tiddler);
    if (matches === null || !matches[2]) {
        return null;
    }
    return matches[2];
};

// Internal.
//
// Reads the data section from the tiddler's content and returns it
// (as an internalized object).
//
// Returns null when no data is defined.
//
// @param tiddler a Tiddler
// @return [may be null]
//
DataTiddler.readData = function(tiddler) {
    var text = DataTiddler.readDataSectionText(tiddler);
	try {
	    return text ? DataTiddler.parse(text) : null;
	} catch(ex) {
		throw DataTiddler.extendJSONError(ex);
	}
};

// Internal.
// 
// Returns the serialized text of the data of the given tiddler, as it
// should be stored in the data section.
//
// @param tiddler a Tiddler
//
DataTiddler.getDataTextOfTiddler = function(tiddler) {
    var data = DataTiddler.getTiddlerDataObject(tiddler);
    return DataTiddler.stringify(data);
};


// Internal.
// 
DataTiddler.indexOfNonEscapedText = function(s, subString, startIndex) {
	var index = s.indexOf(subString, startIndex);
	while ((index > 0) && (s[index-1] == '~')) { 
		index = s.indexOf(subString, index+1);
	}
	return index;
};

// Internal.
//
DataTiddler.getDataSectionInfo = function(text) {
	// Special care must be taken to handle "<data>" and "</data>" texts inside
	// a data section. 
	// Also take care not to use an escaped <data> (i.e. "~<data>") as the start 
	// of a data section. (Same for </data>)

    // NOTE: we are explicitly searching for a data section that contains a JSON
    // string, i.e. framed with braces. This way we are little bit more robust in
    // case the tiddler contains unescaped texts "<data>" or "</data>". This must
    // be changed when using a different stringifier.

	var startTagText = "<data>{";
	var endTagText = "}</data>";

	var startPos = 0;

	// Find the first not escaped "<data>".
	var startDataTagIndex = DataTiddler.indexOfNonEscapedText(text, startTagText, 0);
	if (startDataTagIndex < 0) {
		return null;
	}

	// Find the *last* not escaped "</data>".
	var endDataTagIndex = text.indexOf(endTagText, startDataTagIndex);
	if (endDataTagIndex < 0) {
		return null;
	}
	var nextEndDataTagIndex;
	while ((nextEndDataTagIndex = text.indexOf(endTagText, endDataTagIndex+1)) >= 0) {
		endDataTagIndex = nextEndDataTagIndex;
	}

	return {
		prefixEnd: startDataTagIndex, 
		dataStart: startDataTagIndex+(startTagText.length)-1, 
		dataEnd: endDataTagIndex, 
		suffixStart: endDataTagIndex+(endTagText.length)
	};
};

// Internal.
// 
// Returns the "matches" of a content of a DataTiddler on the
// "data" regular expression. Return null when no data is defined
// in the tiddler content.
//
// Group 1: text before data section (prefix)
// Group 2: content of data section
// Group 3: text behind data section (suffix)
//
// @param tiddler a Tiddler
// @return [may be null] null when the tiddler contains no data section, otherwise see above.
//
DataTiddler.getDataTiddlerMatches = function(tiddler) {
	var text = tiddler.text;
	var info = DataTiddler.getDataSectionInfo(text);
	if (!info) {
		return null;
	}

	var prefix = text.substr(0,info.prefixEnd);
	var data = text.substr(info.dataStart, info.dataEnd-info.dataStart+1);
	var suffix = text.substr(info.suffixStart);
	
	return [text, prefix, data, suffix];
};


// Internal.
//
// Saves the data in a <data> block of the given tiddler (as a minor change). 
//
// The "chkAutoSave" and "chkForceMinorUpdate" options are respected. 
// I.e. the TiddlyWiki *file* is only saved when AutoSave is on.
//
// Notifications are not send. 
//
// This method should only be called when the data really has changed. 
//
// @param tiddler
//             the tiddler to be saved.
//
DataTiddler.save = function(tiddler) {

    var matches = DataTiddler.getDataTiddlerMatches(tiddler);

    var prefix;
    var suffix;
    if (matches === null) {
        prefix = tiddler.text;
        suffix = "";
    } else {
        prefix = matches[1];
        suffix = matches[3];
    }

    var dataText = DataTiddler.getDataTextOfTiddler(tiddler);
    var newText = 
            (dataText !== null) 
                ? prefix + "<data>" + dataText + "</data>" + suffix
                : prefix + suffix;
    if (newText != tiddler.text) {
        // make the change in the tiddlers text
        
        // ... see DataTiddler.MyTiddlerChangedFunction
        tiddler.isDataTiddlerChange = true;
        
        // ... do the action change
        tiddler.set(
                tiddler.title,
                newText,
                config.options.txtUserName, 
                config.options.chkForceMinorUpdate? undefined : new Date(),
                tiddler.tags);

        // ... see DataTiddler.MyTiddlerChangedFunction
        delete tiddler.isDataTiddlerChange;

        // Mark the store as dirty.
        store.dirty = true;
 
        // AutoSave if option is selected
        if(config.options.chkAutoSave) {
           saveChanges();
        }
    }
};

// Internal.
//
DataTiddler.MyTiddlerChangedFunction = function() {
    // Remove the data object from the tiddler when the tiddler is changed
    // by code other than DataTiddler code. 
    //
    // This is necessary since the data object is just a "cached version" 
    // of the data defined in the data section of the tiddler and the 
    // "external" change may have changed the content of the data section.
    // Thus we are not sure if the data object reflects the data section 
    // contents. 
    // 
    // By deleting the data object we ensure that the data object is 
    // reconstructed the next time it is needed, with the data defined by
    // the data section in the tiddler's text.
    
    // To indicate that a change is a "DataTiddler change" a temporary
    // property "isDataTiddlerChange" is added to the tiddler.
    if (this.dataObject && !this.isDataTiddlerChange) {
        delete this.dataObject;
    }
    
    // call the original code.
	DataTiddler.originalTiddlerChangedFunction.apply(this, arguments);
};


//============================================================================
// Formatters
//============================================================================

// This formatter ensures that "~<data>" is rendered as "<data>". This is used to 
// escape the "<data>" of a data section, just in case someone really wants to use
// "<data>" as a text in a tiddler and not start a data section.
//
// Same for </data>.
//
config.formatters.push( {
    name: "data-escape",
    match: "~<\s\s/?data>",

    handler: function(w) {
            w.outputText(w.output,w.matchStart + 1,w.nextMatch);
    }
} );


// This formatter ensures that <data>...</data> sections are not rendered.
//
config.formatters.push( {
    name: "data",
    match: "<data>",

    handler: function(w) {
		var info = DataTiddler.getDataSectionInfo(w.source);
		if (info && info.prefixEnd == w.matchStart) {
            w.nextMatch = info.suffixStart;
		} else {
			w.outputText(w.output,w.matchStart,w.nextMatch);
		}
    }
} );


//============================================================================
// Tiddler Class Extension
//============================================================================

// "Hijack" the changed method ---------------------------------------------------

DataTiddler.originalTiddlerChangedFunction = Tiddler.prototype.changed;
Tiddler.prototype.changed = DataTiddler.MyTiddlerChangedFunction;

// Define accessor methods -------------------------------------------------------

// Returns the value of the given data field of the tiddler. When no such field 
// is defined or its value is undefined the defaultValue is returned.
//
// When field is undefined (or null) the data object is returned. (See 
// DataTiddler.getDataObject.)
//
// @param field [may be null, undefined]
// @param defaultValue [may be null, undefined]
// @return [may be null, undefined]
//
Tiddler.prototype.data = function(field, defaultValue) {
    return (field) 
         ? DataTiddler.getTiddlerDataValue(this, field, defaultValue)
         : DataTiddler.getTiddlerDataObject(this);
};

// Sets the value of the given data field of the tiddler to the value. When the 
// value is equal to the defaultValue no value is set (and the field is removed).
//
// @param value [may be null, undefined]
// @param defaultValue [may be null, undefined]
//
Tiddler.prototype.setData = function(field, value, defaultValue) {
    DataTiddler.setTiddlerDataValue(this, field, value, defaultValue);
};


//============================================================================
// showData Macro
//============================================================================

config.macros.showData = {
     // Standard Properties
     label: "showData",
     prompt: "Display the values stored in the data section of the tiddler"
};

config.macros.showData.handler = function(place,macroName,params) {
    // --- Parsing ------------------------------------------

    var i = 0; // index running over the params
    // Parse the optional "JSON"
    var showInJSONFormat = false;
    if ((i < params.length) && params[i] == "JSON") {
        i++;
        showInJSONFormat = true;
    }
    
    var tiddlerName = story.findContainingTiddler(place).id.substr(7);
    if (i < params.length) {
        tiddlerName = params[i];
        i++;
    }

    // --- Processing ------------------------------------------
    try {
        if (showInJSONFormat) {
            this.renderDataInJSONFormat(place, tiddlerName);
        } else {
            this.renderDataAsTable(place, tiddlerName);
        }
    } catch (e) {
        this.createErrorElement(place, e);
    }
};

config.macros.showData.renderDataInJSONFormat = function(place,tiddlerName) {
    var text = DataTiddler.getDataText(tiddlerName);
    if (text) {
        createTiddlyElement(place,"pre",null,null,text);
    }
};

config.macros.showData.renderDataAsTable = function(place,tiddlerName) {
    var text = "|!Name|!Value|\sn";
    var data = DataTiddler.getDataObject(tiddlerName);
    if (data) {
        for (var i in data) {
            var value = data[i];
            text += "|"+i+"|"+DataTiddler.stringify(value)+"|\sn";
        }
    }
    
    wikify(text, place);
};


// Internal.
//
// Creates an element that holds an error message
// 
config.macros.showData.createErrorElement = function(place, exception) {
    var message = (exception.description) ? exception.description : exception.toString();
    return createTiddlyElement(place,"span",null,"showDataError","<<showData ...>>: "+message);
};

// ---------------------------------------------------------------------------
// Stylesheet Extensions (may be overridden by local StyleSheet)
// ---------------------------------------------------------------------------
//
setStylesheet(
    ".showDataError{color: #ffffff;background-color: #880000;}",
    "showData");


} // of "install only once"
// Used Globals (for JSLint) ==============

// ... TiddlyWiki Core
/*global 	createTiddlyElement, saveChanges, store, story, wikify */
// ... DataTiddler
/*global 	DataTiddler */
// ... JSON
/*global 	JSON */
			

/***
!JSON Code, used to serialize the data
***/
/*
Copyright (c) 2005 JSON.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The Software shall be used for Good, not Evil.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/*
    The global object JSON contains two methods.

    JSON.stringify(value) takes a JavaScript value and produces a JSON text.
    The value must not be cyclical.

    JSON.parse(text) takes a JSON text and produces a JavaScript value. It will
    throw a 'JSONError' exception if there is an error.
*/
var JSON = {
    copyright: '(c)2005 JSON.org',
    license: 'http://www.crockford.com/JSON/license.html',
/*
    Stringify a JavaScript value, producing a JSON text.
*/
    stringify: function (v) {
        var a = [];

/*
    Emit a string.
*/
        function e(s) {
            a[a.length] = s;
        }

/*
    Convert a value.
*/
        function g(x) {
            var c, i, l, v;

            switch (typeof x) {
            case 'object':
                if (x) {
                    if (x instanceof Array) {
                        e('[');
                        l = a.length;
                        for (i = 0; i < x.length; i += 1) {
                            v = x[i];
                            if (typeof v != 'undefined' &&
                                    typeof v != 'function') {
                                if (l < a.length) {
                                    e(',');
                                }
                                g(v);
                            }
                        }
                        e(']');
                        return;
                    } else if (typeof x.toString != 'undefined') {
                        e('{');
                        l = a.length;
                        for (i in x) {
                            v = x[i];
                            if (x.hasOwnProperty(i) &&
                                    typeof v != 'undefined' &&
                                    typeof v != 'function') {
                                if (l < a.length) {
                                    e(',');
                                }
                                g(i);
                                e(':');
                                g(v);
                            }
                        }
                        return e('}');
                    }
                }
                e('null');
                return;
            case 'number':
                e(isFinite(x) ? +x : 'null');
                return;
            case 'string':
                l = x.length;
                e('"');
                for (i = 0; i < l; i += 1) {
                    c = x.charAt(i);
                    if (c >= ' ') {
                        if (c == '\s\s' || c == '"') {
                            e('\s\s');
                        }
                        e(c);
                    } else {
                        switch (c) {
                            case '\sb':
                                e('\s\sb');
                                break;
                            case '\sf':
                                e('\s\sf');
                                break;
                            case '\sn':
                                e('\s\sn');
                                break;
                            case '\sr':
                                e('\s\sr');
                                break;
                            case '\st':
                                e('\s\st');
                                break;
                            default:
                                c = c.charCodeAt();
                                e('\s\su00' + Math.floor(c / 16).toString(16) +
                                    (c % 16).toString(16));
                        }
                    }
                }
                e('"');
                return;
            case 'boolean':
                e(String(x));
                return;
            default:
                e('null');
                return;
            }
        }
        g(v);
        return a.join('');
    },
/*
    Parse a JSON text, producing a JavaScript value.
*/
    parse: function (text) {
        var p = /^\ss*(([,:{}\s[\s]])|"(\s\s.|[^\sx00-\sx1f"\s\s])*"|-?\sd+(\s.\sd*)?([eE][+-]?\sd+)?|true|false|null)\ss*/,
            token,
            operator;

        function error(m, t) {
            throw {
                name: 'JSONError',
                message: m,
                text: t || operator || token
            };
        }

        function next(b) {
            if (b && b != operator) {
                error("Expected '" + b + "'");
            }
            if (text) {
                var t = p.exec(text);
                if (t) {
                    if (t[2]) {
                        token = null;
                        operator = t[2];
                    } else {
                        operator = null;
                        try {
                            token = eval(t[1]);
                        } catch (e) {
                            error("Bad token", t[1]);
                        }
                    }
                    text = text.substring(t[0].length);
                } else {
                    error("Unrecognized token", text);
                }
            } else {
                token = operator = undefined;
            }
        }


        function val() {
            var k, o;
            switch (operator) {
            case '{':
                next('{');
                o = {};
                if (operator != '}') {
                    for (;;) {
                        if (operator || typeof token != 'string') {
                            error("Missing key");
                        }
                        k = token;
                        next();
                        next(':');
                        o[k] = val();
                        if (operator != ',') {
                            break;
                        }
                        next(',');
                    }
                }
                next('}');
                return o;
            case '[':
                next('[');
                o = [];
                if (operator != ']') {
                    for (;;) {
                        o.push(val());
                        if (operator != ',') {
                            break;
                        }
                        next(',');
                    }
                }
                next(']');
                return o;
            default:
                if (operator !== null) {
                    error("Missing value");
                }
                k = token;
                next();
                return k;
            }
        }
        next();
        return val();
    }
};

/***
!Setup the data serialization
***/

DataTiddler.format = "JSON";
DataTiddler.stringify = JSON.stringify;
DataTiddler.parse = JSON.parse;

//}}}


/***
<<checkForDataTiddlerPlugin>>
|''Name:''|FormTiddlerPlugin|
|''Version:''|1.0.5 (2006-02-24)|
|''Source:''|http://tiddlywiki.abego-software.de/#FormTiddlerPlugin|
|''Author:''|UdoBorkowski (ub [at] abego-software [dot] de)|
|''Licence:''|[[BSD open source license]]|
|''Macros:''|formTiddler, checkForDataTiddlerPlugin, newTiddlerWithForm|
|''Requires:''|DataTiddlerPlugin|
|''TiddlyWiki:''|1.2.38+, 2.0|
|''Browser:''|Firefox 1.0.4+; InternetExplorer 6.0|
!Description
Use form-based tiddlers to enter your tiddler data using text fields, listboxes, checkboxes etc. (All standard HTML Form input elements supported).

''Syntax:'' 
|>|{{{<<}}}''formTiddler'' //tiddlerName//{{{>>}}}|
|//tiddlerName//|The name of the FormTemplate tiddler to be used to edit the data of the tiddler containing the macro.|

|>|{{{<<}}}''newTiddlerWithForm'' //formTemplateName// //buttonLabel// [//titleExpression// [''askUser'']] {{{>>}}}|
|//formTemplateName//|The name of the tiddler that defines the form the new tiddler should use.|
|//buttonLabel//|The label of the button|
|//titleExpression//|A (quoted) JavaScript String expression that defines the title (/name) of the new tiddler.|
|''askUser''|Typically the user is not asked for the title when a title is specified (and not yet used). When ''askUser'' is given the user will be asked in any case. This may be used when the calculated title is just a suggestion that must be confirmed by the user|
|>|~~Syntax formatting: Keywords in ''bold'', optional parts in [...]. 'or' means that exactly one of the two alternatives must exist.~~|

For details and how to use the macros see the [[introduction|FormTiddler Introduction]] and the [[examples|FormTiddler Examples]].

!Revision history
* v1.0.5 (2006-02-24)
** Removed "debugger;" instruction
* v1.0.4 (2006-02-07)
** Bug: On IE no data is written to data section when field values changed (thanks to KenGirard for reporting)
* v1.0.3 (2006-02-05)
** Bug: {{{"No form template specified in <<formTiddler>>"}}} when using formTiddler macro on InternetExplorer (thanks to KenGirard for reporting)
* v1.0.2 (2006-01-06)
** Support TiddlyWiki 2.0
* v1.0.1 (2005-12-22)
** Features: 
*** Support InternetExplorer
*** Added newTiddlerWithForm Macro
* v1.0.0 (2005-12-14)
** initial version

!Code
***/
//{{{

//============================================================================
//============================================================================
// FormTiddlerPlugin
//============================================================================
//============================================================================


version.extensions.FormTiddlerPlugin = {
 major: 1, minor: 0, revision: 5,
 date: new Date(2006, 2, 24), 
 type: 'plugin',
 source: "http://tiddlywiki.abego-software.de/#FormTiddlerPlugin"
};

// For backward compatibility with v1.2.x
//
if (!window.story) window.story=window; 
if (!TiddlyWiki.prototype.getTiddler) TiddlyWiki.prototype.getTiddler = function(title) { return t = this.tiddlers[title]; return (t != undefined && t instanceof Tiddler) ? t : null; } 

//============================================================================
// formTiddler Macro
//============================================================================

// -------------------------------------------------------------------------------
// Configurations and constants 
// -------------------------------------------------------------------------------

config.macros.formTiddler = {
 // Standard Properties
 label: "formTiddler",
 version: {major: 1, minor: 0, revision: 4, date: new Date(2006, 2, 7)},
 prompt: "Edit tiddler data using forms",

 // Define the "setters" that set the values of INPUT elements of a given type
 // (must match the corresponding "getter")
 setter: { 
 button: function(e, value) {/*contains no data */ },
 checkbox: function(e, value) {e.checked = value;},
 file: function(e, value) {try {e.value = value;} catch(e) {/* ignore, possibly security error*/}},
 hidden: function(e, value) {e.value = value;},
 password: function(e, value) {e.value = value;},
 radio: function(e, value) {e.checked = (e.value == value);},
 reset: function(e, value) {/*contains no data */ },
 "select-one": function(e, value) {config.macros.formTiddler.setSelectOneValue(e,value);},
 "select-multiple": function(e, value) {config.macros.formTiddler.setSelectMultipleValue(e,value);},
 submit: function(e, value) {/*contains no data */},
 text: function(e, value) {e.value = value;},
 textarea: function(e, value) {e.value = value;}
 },

 // Define the "getters" that return the value of INPUT elements of a given type
 // Return undefined to not store any data.
 getter: { 
 button: function(e, value) {return undefined;},
 checkbox: function(e, value) {return e.checked;},
 file: function(e, value) {return e.value;},
 hidden: function(e, value) {return e.value;},
 password: function(e, value) {return e.value;},
 radio: function(e, value) {return e.checked ? e.value : undefined;},
 reset: function(e, value) {return undefined;},
 "select-one": function(e, value) {return config.macros.formTiddler.getSelectOneValue(e);},
 "select-multiple": function(e, value) {return config.macros.formTiddler.getSelectMultipleValue(e);},
 submit: function(e, value) {return undefined;},
 text: function(e, value) {return e.value;},
 textarea: function(e, value) {return e.value;}
 }
};


// -------------------------------------------------------------------------------
// The formTiddler Macro Handler 
// -------------------------------------------------------------------------------

config.macros.formTiddler.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
 if (!config.macros.formTiddler.checkForExtensions(place, macroName)) {
 return;
 }
 
 // --- Parsing ------------------------------------------

 var i = 0; // index running over the params

 // get the name of the form template tiddler
 var formTemplateName = undefined;
 if (i < params.length) {
 formTemplateName = params[i];
 i++;
 }

 if (!formTemplateName) {
 config.macros.formTiddler.createErrorElement(place, "No form template specified in <<" + macroName + ">>.");
 return;
 }


 // --- Processing ------------------------------------------

 // Get the form template text. 
 // (This contains the INPUT elements for the form.)
 var formTemplateTiddler = store.getTiddler(formTemplateName);
 if (!formTemplateTiddler) {
 config.macros.formTiddler.createErrorElement(place, "Form template '" + formTemplateName + "' not found.");
 return;
 }
 var templateText = formTemplateTiddler.text;
 if(!templateText) {
 // Shortcut: when template text is empty we do nothing.
 return;
 }

 // Get the name of the tiddler containing this "formTiddler" macro
 // (i.e. the tiddler, that will be edited and that contains the data)
 var tiddlerName = config.macros.formTiddler.getContainingTiddlerName(place);

 // Append a "form" element. 
 var formName = "form"+formTemplateName+"__"+tiddlerName;
 var e = document.createElement("form");
 e.setAttribute("name", formName);
 place.appendChild(e);

 // "Embed" the elements defined by the templateText (i.e. the INPUT elements) 
 // into the "form" element we just created
 wikify(templateText, e);

 // Initialize the INPUT elements.
 config.macros.formTiddler.initValuesAndHandlersInFormElements(formName, DataTiddler.getDataObject(tiddlerName));
}


// -------------------------------------------------------------------------------
// Form Data Access 
// -------------------------------------------------------------------------------

// Internal.
//
// Initialize the INPUT elements of the form with the values of their "matching"
// data fields in the tiddler. Also setup the onChange handler to ensure that
// changes in the INPUT elements are stored in the tiddler's data.
//
config.macros.formTiddler.initValuesAndHandlersInFormElements = function(formName, data) {
 // config.macros.formTiddler.trace("initValuesAndHandlersInFormElements(formName="+formName+", data="+data+")");

 // find the form
 var form = config.macros.formTiddler.findForm(formName);
 if (!form) {
 return;
 }

 try {
 var elems = form.elements;
 for (var i = 0; i < elems.length; i++) {
 var c = elems[i];
 
 var setter = config.macros.formTiddler.setter[c.type];
 if (setter) {
 var value = data[c.name];
 if (value != null) {
 setter(c, value);
 }
 c.onchange = onFormTiddlerChange;
 } else {
 config.macros.formTiddler.displayFormTiddlerError("No setter defined for INPUT element of type '"+c.type+"'. (Element '"+c.name+"' in form '"+formName+"')");
 }
 }
 } catch(e) {
 config.macros.formTiddler.displayFormTiddlerError("Error when updating elements with new formData. "+e);
 }
}


// Internal.
//
// @return [may be null]
//
config.macros.formTiddler.findForm = function(formName) {
 // We must manually iterate through the document's forms, since
 // IE does not support the "document[formName]" approach

 var forms = window.document.forms;
 for (var i = 0; i < forms.length; i++) {
 var form = forms[i];
 if (form.name == formName) {
 return form;
 }
 }

 return null;
}


// Internal.
//
config.macros.formTiddler.setSelectOneValue = function(element,value) {
 var n = element.options.length;
 for (var i = 0; i < n; i++) {
 element.options[i].selected = element.options[i].value == value;
 }
}

// Internal.
//
config.macros.formTiddler.setSelectMultipleValue = function(element,value) {
 var values = {};
 for (var i = 0; i < value.length; i++) {
 values[value[i]] = true;
 }
 
 var n = element.length;
 for (var i = 0; i < n; i++) {
 element.options[i].selected = !(!values[element.options[i].value]);
 }
}

// Internal.
//
config.macros.formTiddler.getSelectOneValue = function(element) {
 var i = element.selectedIndex;
 return (i >= 0) ? element.options[i].value : null;
}

// Internal.
//
config.macros.formTiddler.getSelectMultipleValue = function(element) {
 var values = [];
 var n = element.length;
 for (var i = 0; i < n; i++) {
 if (element.options[i].selected) {
 values.push(element.options[i].value);
 }
 }
 return values;
}



// -------------------------------------------------------------------------------
// Helpers 
// -------------------------------------------------------------------------------

// Internal.
//
config.macros.formTiddler.checkForExtensions = function(place,macroName) {
 if (!version.extensions.DataTiddlerPlugin) {
 config.macros.formTiddler.createErrorElement(place, "<<" + macroName + ">> requires the DataTiddlerPlugin. (You can get it from http://tiddlywiki.abego-software.de/#DataTiddlerPlugin)");
 return false;
 }
 return true;
}

// Internal.
//
// Displays a trace message in the "TiddlyWiki" message pane.
// (used for debugging)
//
config.macros.formTiddler.trace = function(s) {
 displayMessage("Trace: "+s);
}

// Internal.
//
// Display some error message in the "TiddlyWiki" message pane.
//
config.macros.formTiddler.displayFormTiddlerError = function(s) {
 alert("FormTiddlerPlugin Error: "+s);
}

// Internal.
//
// Creates an element that holds an error message
// 
config.macros.formTiddler.createErrorElement = function(place, message) {
 return createTiddlyElement(place,"span",null,"formTiddlerError",message);
}

// Internal.
//
// Returns the name of the tiddler containing the given element.
// 
config.macros.formTiddler.getContainingTiddlerName = function(element) {
 return story.findContainingTiddler(element).id.substr(7);
}

// -------------------------------------------------------------------------------
// Event Handlers 
// -------------------------------------------------------------------------------

// This function must be called by the INPUT elements whenever their
// data changes. Typically this is done through an "onChange" handler.
//
function onFormTiddlerChange (e) {
 // config.macros.formTiddler.trace("onFormTiddlerChange "+e);

 if (!e) var e = window.event;

 var target = resolveTarget(e);
 var tiddlerName = config.macros.formTiddler.getContainingTiddlerName(target);
 var getter = config.macros.formTiddler.getter[target.type];
 if (getter) {
 var value = getter(target);
 DataTiddler.setData(tiddlerName, target.name, value);
 } else {
 config.macros.formTiddler.displayFormTiddlerError("No getter defined for INPUT element of type '"+target.type+"'. (Element '"+target.name+"' used in tiddler '"+tiddlerName+"')");
 }
}

// ensure that the function can be used in HTML event handler
window.onFormTiddlerChange = onFormTiddlerChange;


// -------------------------------------------------------------------------------
// Stylesheet Extensions (may be overridden by local StyleSheet)
// -------------------------------------------------------------------------------

setStylesheet(
 ".formTiddlerError{color: #ffffff;background-color: #880000;}",
 "formTiddler");


//============================================================================
// checkForDataTiddlerPlugin Macro
//============================================================================

config.macros.checkForDataTiddlerPlugin = {
 // Standard Properties
 label: "checkForDataTiddlerPlugin",
 version: {major: 1, minor: 0, revision: 0, date: new Date(2005, 12, 14)},
 prompt: "Check if the DataTiddlerPlugin exists"
}

config.macros.checkForDataTiddlerPlugin.handler = function(place,macroName,params) {
 config.macros.formTiddler.checkForExtensions(place, config.macros.formTiddler.label);
}



//============================================================================
// newTiddlerWithForm Macro
//============================================================================

config.macros.newTiddlerWithForm = {
 // Standard Properties
 label: "newTiddlerWithForm",
 version: {major: 1, minor: 0, revision: 1, date: new Date(2006, 1, 6)},
 prompt: "Creates a new Tiddler with a <<formTiddler ...>> macro"
}

config.macros.newTiddlerWithForm.handler = function(place,macroName,params) {
 // --- Parsing ------------------------------------------

 var i = 0; // index running over the params

 // get the name of the form template tiddler
 var formTemplateName = undefined;
 if (i < params.length) {
 formTemplateName = params[i];
 i++;
 }

 if (!formTemplateName) {
 config.macros.formTiddler.createErrorElement(place, "No form template specified in <<" + macroName + ">>.");
 return;
 }

 // get the button label
 var buttonLabel = undefined;
 if (i < params.length) {
 buttonLabel = params[i];
 i++;
 }

 if (!buttonLabel) {
 config.macros.formTiddler.createErrorElement(place, "No button label specified in <<" + macroName + ">>.");
 return;
 }

 // get the (optional) tiddlerName script and "askUser"
 var tiddlerNameScript = undefined;
 var askUser = false;
 if (i < params.length) {
 tiddlerNameScript = params[i];
 i++;

 if (i < params.length && params[i] == "askUser") {
 askUser = true;
 i++;
 }
 }

 // --- Processing ------------------------------------------

 if(!readOnly) {
 var onClick = function() {
 var tiddlerName;
 if (tiddlerNameScript) {
 try {
 tiddlerName = eval(tiddlerNameScript);
 } catch (ex) {
 }
 }
 if (!tiddlerName || askUser) {
 tiddlerName = prompt("Please specify a tiddler name.", askUser ? tiddlerName : "");
 }
 while (tiddlerName && store.getTiddler(tiddlerName)) {
 tiddlerName = prompt("A tiddler named '"+tiddlerName+"' already exists.\sn\sn"+"Please specify a tiddler name.", tiddlerName);
 }

 // tiddlerName is either null (user canceled) or a name that is not yet in the store.
 if (tiddlerName) {
 var body = "<<formTiddler [["+formTemplateName+"]]>>";
 var tags = [];
 store.saveTiddler(tiddlerName,tiddlerName,body,config.options.txtUserName,new Date(),tags);
 story.displayTiddler(null,tiddlerName,1);
 }
 }

 createTiddlyButton(place,buttonLabel,buttonLabel,onClick);
 }
}

//}}}


/***
!Licence and Copyright
Copyright (c) abego Software ~GmbH, 2005 ([[www.abego-software.de|http://www.abego-software.de]])

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

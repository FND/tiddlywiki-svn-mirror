/***
| Name:|NewTiddlerWithFieldsMacro|
| Created by:|BJ Backitis|
| Location:|http://tampageekland.tiddlyspot.com#NewTiddlerWithFieldsMacro|
| Version:|0.1.0 (16 Nov 2006)|
| Requires:|~TW2.1.x|
!Description
This is a clone of the NewTiddler core macro that allows for adding custom fields and values. Any param "name: value" pair where the name is not a 
recognized param (title, text, label, prompt, accessKey, template, focus, and tag) will be treated as a custom field name and value. 
!Usage
Use like the existing {{{<<newTiddler>>}}} macro, but any unknown param "name: value" pairs will be treated as a custom field name and value.
Be sure to have the custom field defined in your view and/or edit templates so you can see them (if you wish)!

Example:
{{{<<newTiddlerWithFields label:'New Example' tag: special customTiddler tiddlertype: Example>>}}}

try it here:
<<newTiddlerWithFields label:'New Example' tag: special customTiddler tiddlertype: Example>>

* v0.1.0 -- BJ Backitis, 16 Nov 2006 (Original, based on a suggestion from Simon Baird)
!To Do
* {{{<<newJournalWithFields>>}}}???

!Code
***/


config.macros.newTiddlerWithFields = {
 text: "new Tiddler",
 prompt: "Create a new tiddler with custom fields",
 title: "new Tiddler"
} 
 
config.macros.newTiddlerWithFields.fixedParams = ["title", "tag", "label", "text", "prompt", "accessKey", "focus", "template", "anon"];

config.macros.newTiddlerWithFields.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
 if(!readOnly) {
 params = paramString.parseParams("anon",null,true,false,false);
 var title = params[1] && params[1].name == "anon" ? params[1].value : this.title;
 title = getParam(params,"title",title);
 this.createNewTiddlerWithFieldsButton(place,title,params,this.label,this.prompt,this.accessKey,"title",false);
 }
}

config.macros.newTiddlerWithFields.createNewTiddlerWithFieldsButton = function(place,title,params,label,prompt,accessKey,newFocus,isJournal) {
 var tags = [];
 var custFields = [];
 var custValues = [];
 for(var t=1; t<params.length; t++) {
 if (!this.fixedParams.contains(params[t].name)) {
 custFields.push(params[t].name);
 custValues.push(params[t].value);
 }
 else if((params[t].name == "anon" && t != 1) || (params[t].name == "tag"))
 tags.push(params[t].value);
 }
 label = getParam(params,"label",label);
 prompt = getParam(params,"prompt",prompt);
 accessKey = getParam(params,"accessKey",accessKey);
 newFocus = getParam(params,"focus",newFocus);
 var btn = createTiddlyButton(place,label,prompt,this.onClickNewTiddlerWithFields,null,null,accessKey);
 btn.setAttribute("newTitle",title);
 btn.setAttribute("isJournal",isJournal);
 btn.setAttribute("params",tags.join("|"));
 btn.setAttribute("custFields",custFields.join("|"));
 btn.setAttribute("custValues",custValues.join("|"));
 btn.setAttribute("newFocus",newFocus);
 btn.setAttribute("newTemplate",getParam(params,"template",DEFAULT_EDIT_TEMPLATE));
 var text = getParam(params,"text");
 if(text !== undefined) 
 btn.setAttribute("newText",text);
 return btn;
}


config.macros.newTiddlerWithFields.onClickNewTiddlerWithFields = function() {
 var title = this.getAttribute("newTitle");
 if(this.getAttribute("isJournal")) {
 var now = new Date();
 title = now.formatString(title.trim());
 }
 var params = this.getAttribute("params").split("|");
 var custFields = this.getAttribute("custFields").split("|");
 var custValues = this.getAttribute("custValues").split("|");
 var focus = this.getAttribute("newFocus");
 var template = this.getAttribute("newTemplate");
 story.displayTiddler(null,title,template);
 var text = this.getAttribute("newText");
 if (typeof text == "string")
 story.getTiddlerField(title,"text").value = text.format([title]);
 for (var t=0;t<params.length;t++)
 story.setTiddlerTag(title,params[t],+1);
 for (var i=0;i<custFields.length;i++) 
 story.setTiddlerField(title,custValues[i],+1,custFields[i]);
 story.focusTiddler(title,focus);
 return false;
}




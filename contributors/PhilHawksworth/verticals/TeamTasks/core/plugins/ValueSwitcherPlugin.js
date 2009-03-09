/***
|''Name:''|ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extended field |
|''Version:''|0.2|
|''Date:''|25 Sept, 2007|
|''Source:''|http://www.hawksworx.com/playground/TeamTasks/#ValueTogglerPlugin|
|''Author:''|PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.3|
***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.ValueSwitcher) 
{
	version.extensions.ValueSwitcher = {installed:true};
	config.macros.ValueSwitcher = {

		fieldPrefix: "tt_",

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var taskTiddler = story.findContainingTiddler(place);
			if(!(taskTiddler && taskTiddler != 'undefined')) {
				return;
			}
			var params = paramString.parseParams("anon",null,true,false,false);
			var control = getParam(params,"type",null);
			var id = taskTiddler.id;
			var title = id.substr(7);
			var tiddler = store.getTiddler(title);

      var field = getParam(params,"field", null);

			// build a drop down control
			if (control == 'dropdown') {
        config.macros.ValueSwitcher.makeDropdown(place, field, params, title, tiddler);
			} else if (control == 'freetext' || control == 'textarea') {
        config.macros.ValueSwitcher.makeText
          (place, params, title, tiddler, control=='textarea');
			} else {
        displayMessage("Control type '" + control + "' unknown");
      }

		},

    makeDropdown: function(place, field, params, title, tiddler) {
      var valueSrc = getParam(params,"valuesSource", null);
      if(!valueSrc) {
        displayMessage("No definition tiddler defined for a TeamTasks dropdown.");
        return;
      }

      if (!field) { // revert to older convention of using name of values source
        field = config.macros.ValueSwitcher.fieldPrefix +
                    valueSrc.toLowerCase().substr(0,valueSrc.length-11);
      }

      var values = this.getDefValues(valueSrc);
      var selected = field + '::' + store.getValue(tiddler,field);
      var options = [];
      options.push({'caption': 'Please select', 'name': null});
      for (var i=0; i < values.length; i++) {
        options.push({'caption': values[i], 'name': field + '::' + values[i]});				
      }
      createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);
    },

    makeText: function(place, params, title, tiddler, isTextArea) {
      var field = getParam(params,"field", null);
      if(!field) {
        displayMessage("No field defined for a TeamTasks free text box.");
        return;
      }	
      var ttField = config.macros.ValueSwitcher.fieldPrefix + field;
      // var ttname = fieldPrefix + tiddler
      var text = store.getValue(tiddler,ttField);
      if(!text) text = "";	
      var control;
      if (isTextArea) {
        control = createTiddlyElement(place,"textarea",null,null,null,{rows: 4, cols: 40, ttname:ttField});
        control.innerHTML = text;
     } else {
        control = createTiddlyElement(place,"input",null,null,null,{"value":text, "type":"text", "ttname":ttField});
        var autoCompleteParam = (getParam(params,"autoComplete"));
        if (autoCompleteParam && autoCompleteParam.trim().length) {
          // NOTE matchContains doesn't seem to work, not sure why
          var autoCompleteOptions = (autoCompleteParam=="anywhere" ? {matchContains:true} : {});
          jQuery(control).autocompleteArray
            (config.macros.ValueSwitcher.findAllFreeTextValues(ttField), autoCompleteOptions);
        }
 
      }
      control.onblur = config.macros.ValueSwitcher.changeFreetext;
    },

    // this happens each time the list is shown - we could improve performance
    // by maintaining a cached version of the list
    findAllFreeTextValues: function(ttField) {
      var valuesHash = {}, allValues = [];
      var tasks = store.getTaggedTiddlers("task");
      for (var i=0; i<tasks.length; i++) {
        var value = tasks[i].fields[ttField];
        if (value && value.trim().length) valuesHash[value] = true;
      }
      for (var value in valuesHash) { allValues.push(value); }
      return allValues;
    },

		//Get definition values for populating UI from definition tiddlers.
		getDefValues: function(src) {
			var text = store.getTiddlerText(src).split('\n');
			var output = [];
			for(var t=0; t<text.length; t++) {
				//support calling the old TaskViewBuilder macro to list the tasks here too.
				var blob = wikifyStatic(text[t],null,tiddler,null);				
				var linktitle = /tiddlylink="[^"]*"/mg;
				var titles = blob.match(linktitle);
				if(titles) {
					for(var n=0; n<titles.length; n++) {
						output.push(titles[n].replace(/tiddlylink="([^"]*)"/,'$1'));
					}
				}
				else {
					output.push(text[t]);
				}
			}
			return (output);	
		},

		// Ensure that changes to a dropdown field are stored as an extended field.
		setDropDownMetaData: function(ev) {
			var e = ev ? ev : window.event;
			var taskTiddler = story.findContainingTiddler(this);
			if(taskTiddler && taskTiddler != undefined) {
				var title = taskTiddler.getAttribute('tiddler');
				var tiddler =  store.getTiddler(title);
				var option = this[this.selectedIndex].value.split('::');
				var extField = option[0];
				var extFieldVal = option[1];
				store.setValue(tiddler,extField,extFieldVal);
				story.saveTiddler(title);
			}
		},


		// Ensure that changes to a free text field are stored as an extended field.
		changeFreetext: function(ev) {
      console.log("changeFreetext", this);
			var e = ev ? ev : window.event;
			var ttField = this.getAttribute('ttname');
			var value = this.value;
      console.log("ttfield", ttField, "val", value);
			if(ttField) {
				var t = story.findContainingTiddler(this);
				var title = t.getAttribute('tiddler');
				var tiddler =  store.getTiddler(title);
				store.setValue(tiddler,ttField,value);
				story.saveTiddler(title);
			}
			return false;
		}
	};
}
//}}}

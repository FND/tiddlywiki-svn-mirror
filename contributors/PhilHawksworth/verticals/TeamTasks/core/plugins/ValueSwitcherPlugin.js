/***
|''Name:''|ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
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

		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var fieldPrefix = "tt_";
			var taskTiddler = story.findContainingTiddler(place);
			if(!(taskTiddler && taskTiddler != 'undefined')) {
				return;
			}
			var params = paramString.parseParams("anon",null,true,false,false);
			var ctrlType = getParam(params,"type",null);
			var id = taskTiddler.id;
			var title = id.substr(7);
			var tiddler = store.getTiddler(title);

			// build a drop down control
			if(ctrlType == 'dropdown') {
				var valueSrc = getParam(params,"valuesSource", null);
				if(!valueSrc) {
					displayMessage("No definition tiddler defined for a TeamTasks dropdown.");
					return;
				}
				var fieldName = fieldPrefix + valueSrc.toLowerCase().substr(0,valueSrc.length-11);
				var selected = fieldName + '::' + store.getValue(tiddler,fieldName);
				var values = this.getDefValues(valueSrc);
				var options = [];
				options.push({'caption': 'Please select', 'name': null});
				for (var i=0; i < values.length; i++) {
					options.push({'caption': values[i], 'name': fieldName + '::' + values[i]});				
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);
			}
			// Build a free text box.
			else if(ctrlType == 'freetext') {
				var metaDataName = getParam(params,"metaDataName", null);
				if(!metaDataName) {
					displayMessage("No metaDataName defined for a TeamTasks free text box.");
					return;
				}	
				var fieldName = fieldPrefix + metaDataName.toLowerCase();
				var text = store.getValue(tiddler,fieldName);
				if(text == undefined) text = "";	
				var i = createTiddlyElement(place,"input",null,null,null,{"value":text, "type":"input", "ttname":fieldName});
				i.onblur = config.macros.ValueSwitcher.changeFreetext;
			}

			/*
				TODO: Build in deadline support
			*/
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
			var e = ev ? ev : window.event;
			var ttField = this.getAttribute('ttname');
			var value = this.value;
			if(ttField) {
				var t = story.findContainingTiddler(this);
				var title = t.getAttribute('tiddler');
				var tiddler =  store.getTiddler(title);
				store.setValue(tiddler,ttField,value);
				story.saveTiddler(tiddler);
			}
			return false;
		}
	};
}
//}}}
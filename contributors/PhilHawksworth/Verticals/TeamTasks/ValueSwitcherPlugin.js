/***
|''Name:''|ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
|''Version:''|0.1|
|''Date:''|25 Sept, 2007|
|''Source:''|http://www.hawksworx.com/playground/TeamTasks/#ValueTogglerPlugin|
|''Author:''|PhilHawksworth (phawksworth (at) gmail (dot) com)|
|''License:''|[[BSD open source license]]|
|''CoreVersion:''|2.2|
***/

//{{{
// Ensure that this Plugin is only installed once.
if(!version.extensions.ValueSwitcher) 
{
	version.extensions.ValueSwitcher = {installed:true};
	config.macros.ValueSwitcher = {
	
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		
			var taskTiddler = story.findContainingTiddler(place);
			if(!(taskTiddler && taskTiddler != 'undefined')) {
				return;
			}
			
			var ctrlType = params[0];
			var valueSrc = params[1];
			var id = taskTiddler.id;
			var title = id.substr(7);
			var tiddler = store.getTiddler(title);
			
			// build a drop down control
			if(ctrlType == 'dropdown') {
				var selected = valueSrc + '_' + store.getValue(tiddler,valueSrc);
				var values = this.getDefValues(valueSrc);
				var options = [];
				options.push({'caption': 'Please select', 'name': null});
				for (var i=0; i < values.length; i++) {
					options.push({'caption': values[i], 'name': valueSrc + '_' + values[i]});
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);	
			}
			//build a date control
			else if(ctrlType == 'date'){
				//TODO: Build in deadline support
			}
		},
		
		getDefValues: function(src) {
			var text = store.getTiddlerText(src);
			return (text.split('\n'));	
		},
		
		setDropDownMetaData: function(e) {
			var taskTiddler = story.findContainingTiddler(this);
			if(taskTiddler && taskTiddler != 'undefined') {
				var id = taskTiddler.id;
				var title = id.substr(7);
				var tiddler =  store.getTiddler(title);
				var option = this[this.selectedIndex].value.split('_');
				var extField = option[0];
				var extFieldVal = option[1];
				store.setValue(tiddler,extField,extFieldVal);
				story.saveTiddler(title);
			}
		}
	};
}
//}}}
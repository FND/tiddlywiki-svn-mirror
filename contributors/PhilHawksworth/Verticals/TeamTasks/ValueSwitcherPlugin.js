/***
|''Name:''|ValueSwitcherPlugin|
|''Description:''|Gather values from a definition tiddler, and present the user with a UI for setting a value from those available options as an extende field |
|''Version:''|0.0.2|
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
				for (var i=0; i < values.length; i++) {
					options.push({'caption': values[i], 'name': valueSrc + '_' + values[i]});
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);	
			}
			//build a date control
			else if(ctrlType == 'date'){
				
				var dd = 31;
				var mm = 12;
				var yyyy = 5;
				
				var options = [];
				var selected = valueSrc + 'dd_' + store.getValue(tiddler,valueSrc);
				for (var i=1; i <= dd.length; i++) {
					options.push({'caption': i, 'name': i});
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);	
				
				var options = [];
				selected = valueSrc + 'mm_' + store.getValue(tiddler,valueSrc);
				for (var i=1; i <= mm.length; i++) {
					options.push({'caption': i, 'name': i});
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);
				
				var options = [];
				selected = valueSrc + 'yyyy_' + store.getValue(tiddler,valueSrc);
				for (var i=2007; i <= yyyy.length; i++) {
					options.push({'caption': i, 'name': i});
				}
				createTiddlyDropDown(place,this.setDropDownMetaData,options,selected);
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
			}
		}
	};
}
//}}}
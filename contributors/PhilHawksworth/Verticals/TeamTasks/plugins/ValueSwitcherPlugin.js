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
				displayMessage('This control should be used from within a tiddler');
			}
			var id = taskTiddler.id;
			var title = id.substr(7);
			var tiddler = store.getTiddler(title);
			var src = params[0];
			var selected = src+ '_' +store.getValue(tiddler,src);
			var values = this.getDefValues(src);
			var options = [];
			for (var i=0; i < values.length; i++) {
				options.push({'caption': values[i], 'name': src + '_' + values[i]});
			}
			createTiddlyDropDown(place,this.setTaskMetaData,options,selected);
		},
		
		getDefValues: function(src) {
			var text = store.getTiddlerText(src);
			return (text.split('\n'));	
		},
		
		setTaskMetaData: function(e) {
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
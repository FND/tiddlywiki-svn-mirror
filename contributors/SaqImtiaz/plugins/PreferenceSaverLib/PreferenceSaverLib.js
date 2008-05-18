/***
|''Name:''|PreferenceSaverLib|
|''Description:''|Support library for saving configuration options for plugins.|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#PreferenceSaverLib|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.1.3|
***/
// /%
//!BEGIN-PLUGIN-CODE
function PreferenceSaver (plugin)
{
	this.container = tiddler;
}

PreferenceSaver.prototype.get = function(title,userprefs)
{
	var field = store.getValue(this.container,"pref."+title);
	field = (field == undefined )? userprefs[title]["defaults"] : field;
	switch(userprefs[title]["type"]){
		case "array":
			field = field.split(",");
			break;
		case "int":
			field = parseInt(field);
			break;
		case "bool":
			field = (field == "true")? true : false;
			break;
	}
	return field;
};

PreferenceSaver.prototype.set = function(title,val,prefmap){
	prefmap[title] = val;
	store.setValue(this.container,"pref."+title,val);
};

PreferenceSaver.prototype.loadAllPrefs = function(plugin){
	prefs = {};
	for (var n in plugin["userprefs"]){
		prefs[n] = this.get(n,plugin["userprefs"]);
	}
	return prefs;
};

SetupPrefs = function(plugin){
	plugin._saver = new PreferenceSaver(plugin);
	plugin.prefs = plugin._saver.loadAllPrefs(plugin);
};

config.macros.prefs={
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var plugin = eval(params[0]);
		var table = '';
		table += "|>|!~%0|\n".format([store.getTiddlerSlice(plugin._saver.container.title,"Name") + " Preferences"]);
		for (var n in plugin.userprefs){
			table+= "|%0| %1 |\n".format([plugin.userprefs[n]["guiLabel"],"<<_pref {{"+params[0]+"}} "+n+">>"]);
		}
		wikify(table,place);
	}
};

config.macros._pref={
	handler : function(place,macroName,params,wikifier,paramString,tiddler){
		var plugin = params[0];
		var pref = params[1];
		this["create"+plugin.userprefs[pref]["gui"]](place,plugin,pref);
	},
	
	createinput : function(place,plugin,prefName){
		var elem = createTiddlyElement(place,"input");
		elem.value = plugin.prefs[prefName];
		elem.onchange = function(e){
			plugin._saver.set(prefName,this.value,plugin.prefs);
		};
	},

	createcheckbox : function(place,plugin,prefName){
		var cb = createTiddlyCheckbox(place,null,plugin.prefs[prefName], function (e){
			plugin._saver.set(prefName,this.checked,plugin.prefs);
			});
	},
	
	createselect : function(place,plugin,prefName){
		var choices = [];
		var selects = plugin.userprefs[prefName]["selectOptions"];
		for(var i=0; i<selects.length; i++){
			choices.push({name:selects[i], caption:selects[i]});
		}
		createTiddlyDropDown(place,function(e){
			plugin._saver.set(prefName,this.value,plugin.prefs);
			},choices,plugin.prefs[prefName]);
	}	
};
//!END-PLUGIN-CODE
// %/
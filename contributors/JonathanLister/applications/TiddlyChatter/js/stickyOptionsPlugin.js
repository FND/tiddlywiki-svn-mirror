/***
|''Name:''|StickyOptionsPlugin|
|''Description:''||
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Source:''|http://tw.lewcid.org/#StickyOptionsPlugin|
|''Code Repository:''|http://tw.lewcid.org/svn/plugins|
|''Version:''|2.0 pre-release|
|''Date:''||
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2|
!!Usage:
* Sticky options are saved in the file rather than in cookies. 
* To make an option sticky, check the 'sticky' checkbox for it in AdvancedOptions
* To force all options to be sticky, check the 'Options always sticky' checkbox at the bottom of the AdvancedOptions screen.
* Please remember that the file needs to be saved after each option is saved, for the setting to be remembered.
* Enable the 'autosave' option below, to trigger an autosave when an option is saved

Trigger autosave when an option is saved: <<option chkStickyOptionsAutoSave>>

***/
// /%
//!BEGIN-PLUGIN-CODE
if(config.options.chkStickyOptionsAutoSave == undefined)
	config.options.chkStickyOptionsAutoSave = false;
	
config.optionsDesc.chkStickyOptionsAutoSave = "Trigger autosave when an option is saved";

StickyOptions = {
	container : tiddler,
	
	alwaysSticky : !! store.getValue(this.container,"stickyoptions.alwayssticky"),
	
	toggleAlwaysSticky : function(stat){
		this.alwaysSticky = stat;
		store.setValue(this.container,"stickyoptions.alwayssticky",stat? stat : undefined);
		if(stat)
			this.saveAllOptions();
	},
	
	toggleOption : function(optName,toggle,stat,nosave){
		if(this.isOption(optName)){
			var optVal = toggle ? (stat? config.options[optName]:undefined):config.options[optName];
			if(toggle)
				this.updateDir(optName,stat);
			store.setValue(this.container,"sticky."+optName.toLowerCase(),optVal);
			if(!nosave && config.options.chkStickyOptionsAutoSave)
				autoSaveChanges();
		}	
	},
	
	saveAllOptions : function(){
		store.suspendNotifications();
		for(var n in config.options){
			this.toggleOption(n,true,true,true);
		}
		store.resumeNotifications;
		store.notify(this.container.title,true);
		if (config.options.chkStickyOptionsAutoSave)
			autoSaveChanges();
	},

	updateDir : function(optName,stat){
		this.options.setItem(optName,stat? +1 : -1);
		store.setValue(this.container,"stickyoptions.dir",this.options);
	},
	
	getOption : function(optName){
		return store.getValue(this.container,"sticky."+optName.toLowerCase());
	},
	
	isOption : function(optName){
		var optType = optName.substr(0,3);
		return (config.optionHandlers[optType] && config.optionHandlers[optType].get);
	},
	
	isSticky : function(optName){
		return this.options.contains(optName);
	},
	
	loadAllOptions : function(){
		if(safeMode)
			return;
		var savedOpts = store.getValue(this.container,"stickyoptions.dir");
		this.options = savedOpts? savedOpts.split(",") : [];
		for (var i=0; i<this.options.length; i++){
			var optType = this.options[i].substr(0,3);
			if(config.optionHandlers[optType] && config.optionHandlers[optType].set)
				config.optionHandlers[optType].set(this.options[i],this.getOption(this.options[i]));
		}
	},
	
	oldSaveOptionCookie : window.saveOptionCookie
};

StickyOptions.loadAllOptions();

saveOptionCookie = function(name){
	if (StickyOptions.alwaysSticky || StickyOptions.isSticky(name)){
		StickyOptions.toggleOption(name,StickyOptions.alwaysSticky ? true:false ,true);
	}
	else{
		StickyOptions.oldSaveOptionCookie(name);
	}
};

config.macros.options.step1Title += " unless they are sticky. Sticky options are saved in this file.";
config.macros.options.old_step1Html = config.macros.options.step1Html;
config.macros.options.updateStep1Html = function(){
	this.step1Html = this.old_step1Html + "<br><input type='checkbox' " + (StickyOptions.alwaysSticky? "checked":"") + " onclick='config.macros.options.toggleAlwaysSticky(this);'>Options always sticky</input>";
};
config.macros.options.listViewTemplate.columns.splice(1,0,{name: 'Sticky', field: 'name', title: "Sticky", type: 'StickyOption'});

config.macros.options.old_handler = config.macros.options.handler;
config.macros.options.handler = function(place,macroName,params,wikifier,paramString,tiddler){
	this.updateStep1Html();
	this.old_handler.apply(this,arguments);
};

config.macros.options.toggleAlwaysSticky = function(e)
{
	StickyOptions.toggleAlwaysSticky(e.checked);
	var wizard = new Wizard(e);
	var listWrapper = wizard.getValue("listWrapper");
	var chkUnknown = wizard.getElement("chkUnknown").checked;
	removeChildren(listWrapper);
	config.macros.options.refreshOptions(listWrapper,chkUnknown);
	return false;
};

ListView.columnTypes.StickyOption = {
	createHeader: ListView.columnTypes.String.createHeader,
	createItem: function(place,listObject,field,columnTemplate,col,row)
		{
			var opt = listObject[field];
			var e = createTiddlyCheckbox(place,null,StickyOptions.isSticky(opt),this.onChange);
			e.disabled = StickyOptions.alwaysSticky;
			e.name = opt;
		},
		
	onChange : function(e){
		StickyOptions.toggleOption(this.name,true,this.checked);
	}
};
//!END-PLUGIN-CODE
// %/
Tiddler.prototype.wikispaces_oldIsReadOnly = Tiddler.prototype.isReadOnly;

Tiddler.prototype.isReadOnly = function()
{
	if (this.fields['server.locked'])
		return true;
//	else if (!store.getTiddler(this.title) && !store.isShadowTiddler(this.title))
//		return true;
	else if (this.tags.containsAny(['systemConfig','systemConfigDisable','systemServer','excludeLists','excludeSearch']))
		return true;
	else
		return this.wikispaces_oldIsReadOnly();
};

config.commands.editTiddler.hideReadOnly = true;
config.commands.editTiddler.hideShadow = true;

setStylesheet("#backstageButton #backstageShow {position:absolute;top:-30em;right:0;}","hideBackStageStyles");

setStylesheet("#mysidebar #sidebarOptions .bigbutton .button {padding:0.2em 0.3em; font-size:120%; font-weight:bold; border:1px solid #000; display:block; background-color:#0044BB; color:#fff; margin-bottom:0.2em;} #mysidebar #sidebarOptions .bigbutton br {display:none;}","savebuttonStyles");

config.options.chkPrefillNotes = true;
merge(config.defaultCustomFields,{'wikiformat':'wikispaces'});
//config.macros.importAndSync.label = "update notebook";
config.options.chkQuicksyncOnStartup = true;

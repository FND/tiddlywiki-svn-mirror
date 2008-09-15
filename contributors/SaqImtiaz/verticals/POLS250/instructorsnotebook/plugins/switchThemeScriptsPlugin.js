Story.prototype.old_scriptSupport_switchTheme = Story.prototype.switchTheme;
Story.prototype.switchTheme = function(theme){
	this.old_scriptSupport_switchTheme.apply(this,arguments);
	var scripts = theme + "Scripts";
	if(store.tiddlerExists(scripts) || store.isShadowTiddler(scripts))
		window.eval(store.getRecursiveTiddlerText(scripts));
}

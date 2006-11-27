// ---------------------------------------------------------------------------------
// Backstage
// ---------------------------------------------------------------------------------

var backstage = {
	backstage: null,
	cloak: null,
	tabs: null,
	panel: null,
	currTabName: null,
	currTabElem: null,

	init: function() {
		this.cloak = document.getElementById("backstageCloak");
		this.backstage = document.getElementById("backstage");
		this.tabs = document.getElementById("backstageTabs");
		this.panel = document.getElementById("backstagePanel");
		this.backstage.onmouseover = function(e) {
			backstage.tabs.style.visibility = "visible";
		};
		this.backstage.onmouseout = function(e) {
			backstage.tabs.style.visibility = "hidden";
		};
		this.cloak.onmousedown = function(e) {
			backstage.switchTab(null,null);
		};
		for(var t=0; t<config.backstageTasks.length; t++) {
			var taskName = config.backstageTasks[t];
			var task = config.tasks[taskName];
			var btn = createTiddlyButton(this.tabs,task.text,task.tooltip,this.onClickTab,"backstageTab");
			btn.setAttribute("task",taskName);
			}
		this.switchTab(null,null);
	},

	onClickTab: function(e) {
		backstage.switchTab(this,this.getAttribute("task"));
	},

	// Switch to a given tab, or none if null is passed
	switchTab: function(tabElem,tabName) {
		if(backstage.currTabElem) {
			removeClass(this.currTabElem,"backstageSelTab");
			}
		if(tabElem && tabName) {
			backstage.preparePanel();
			addClass(tabElem,"backstageSelTab");
			var task = config.tasks[tabName];
			wikify(task.content,backstage.panel,null,null)
			backstage.showPanel();
		} else if(backstage.currTabElem) {
			backstage.hidePanel();
		}
		backstage.currTabName = tabName;
		backstage.currTabElem = tabElem;
	},

	preparePanel: function() {
		backstage.cloak.style.height = document.documentElement.scrollHeight + "px";
		backstage.cloak.style.display = "block";
		removeChildren(backstage.panel);
		return backstage.panel;
	},
	
	showPanel: function() {
		if(anim && config.options.chkAnimate)
			anim.startAnimating(new Slider(backstage.panel,true,false,"none"),new Scroller(backstage.panel,false));
		else
			backstage.panel.style.display = "block";
		return this.panel;
	},
	
	hidePanel: function() {
		if(anim && config.options.chkAnimate)
			anim.startAnimating(new Slider(backstage.panel,false,false,"none"));
		else
			backstage.panel.style.display = "none";
		backstage.cloak.style.display = "none";
	}
};

config.backstage = {
}

config.backstageTasks = ["tidy","sync","importTask","copy","plugins"];

config.tasks = {
		tidy: {text: "Tidy up", tooltip: "Make bulk changes across groups of tiddlers"},
		sync: {text: "Sync", tooltip: "Synchronise changes with other TiddlyWiki files and servers"},
		importTask: {text: "Import", tooltip: "Import tiddlers and plugins from other TiddlyWiki files and servers", content: "<<importTiddlers>>"},
		copy: {text: "Copy", tooltip: "Copy tiddlers to other TiddlyWiki files and servers"},
		plugins: {text: "Plugins", tooltip: "Manage installed plugins", content: "<<plugins>>"}
};

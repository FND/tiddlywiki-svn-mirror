config.macros.MainMenuPlugin = {};
config.macros.MainMenuPlugin.handler = function(place,macroName,params)
{
	

		var btn = createTiddlyElement(place, "a", null, "button");
		btn.onclick = function() {
			story.displayTiddler(null, "My Recent Activity", "lifestreamTheme##recentViewTemplate");
		};
		var img = createTiddlyElement(btn, "img");
		img.style.width = "20px";
		img.style.height="20px";
		img.style.position="relative";
		img.style.top="0.5em";
		img.src = "plugins/lifestream/files/images/recent.png";
		createTiddlyText(btn, " My Recent Activity");
		btn.setAttribute("href","javascript:;");
		
		
		
		
		var btn = createTiddlyElement(place, "a", null, "button");
		btn.onclick = function() {
			story.displayTiddler(null, "Notes");
		};
		var img = createTiddlyElement(btn, "img");
		img.style.width = "20px";
		img.style.height="20px";
		img.style.position="relative";
		img.style.top="0.5em";
		img.src = "plugins/lifestream/files/images/note.png";
		createTiddlyText(btn, " Notes");
		btn.setAttribute("href","javascript:;");
		
		
		
		
		var btn = createTiddlyElement(place, "a", null, "button");
		btn.onclick = function() {
			story.displayTiddler(null, "About", "lifestreamTheme##aboutViewTemplate");
		};
		var img = createTiddlyElement(btn, "img");
		img.style.width = "20px";
		img.style.height="20px";
		img.style.position="relative";
		img.style.top="0.5em";
		img.src = "plugins/lifestream/files/images/about.png";
		createTiddlyText(btn, " About");
		btn.setAttribute("href","javascript:;");
}


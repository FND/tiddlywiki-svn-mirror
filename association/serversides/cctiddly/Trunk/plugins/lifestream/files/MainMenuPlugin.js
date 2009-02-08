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
		img.src = "http://www.iconarchive.com/icons/studiomx/leomx/Web-256x256.png";
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
		img.src = "http://www.iconspedia.com/uploads/578075880.png";
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
		img.src = "http://icons-search.com/img/vistaicons/vista_alarm_icons.zip/PNG-Question-Shield.png-256x256.png";
		createTiddlyText(btn, " About");
		btn.setAttribute("href","javascript:;");
}


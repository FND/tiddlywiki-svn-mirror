
config.macros.foo = {
	handler: function(place,macroName,params,wikifier,paramString,tiddler) {
		var dp = (new DatePicker()).create();
		dp.style.position = 'absolute'
		dp.style.top = 10;
		dp.style.left = 10;
		place.appendChild(dp);
	}
}


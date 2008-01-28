config.macros.getEarthCalendar = {};

config.macros.getEarthCalendar.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	// for () {
		var month = params[0];
		var day = params[1];
		var year = params[2];
		var context = {params:params, place:place};
		loadRemoteFile("http://www.earthcalendar.net/_php/lookup.php?mode=date&m="+month+"&d="+day+"&y="+year,config.macros.getEarthCalendar.process,context);
	// }
	};
config.macros.getEarthCalendar.process = function(status,context,responseText,url,xhr) {
		if(!status) {
			displayMessage("GET failed for: "+url);
			return;
		}
		var e = document.createElement("div");
		e.innerHTML = responseText;
		console.log(xhr);
		var root = e.getElementsByTagName("blockquote")[0];
		var data_table = root.getElementsByTagName("table")[2];		
		var data_table_rows = data_table.getElementsByTagName("tr");
		var data_string = "";
		for(var i=0; i<data_table_rows.length; i++) {
			var cells = data_table_rows[i].getElementsByTagName("td");
			var countries = cells[1].innerHTML.replace(/<br>/ig,",");
			countries = countries.replace(/<[^>]*?>/mg,"");
			countries = countries.replace(/\n/g,",");
			countries = countries.htmlDecode();
			console.log(countries);
			data_string += "| "+context.params[0]+"/"+context.params[1]+" | ";
			data_string += cells[0].textContent+" | "+countries+" |\n";
		}
		wikify(data_string,context.place);
		// Note to self: fix the countries field on dabbleDB to accept a comma-separated list of countries)
		// If this can't be done, fix the macro to create one line entry for each country
		// Note to self: write another macro to combine the tables produced here into one (although it looks like dabbleDB doesn't need this)
};

config.macros.getEarthCalendarForYear = {};

config.macros.getEarthCalendarForYear.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var year = params[0];
	// note: doesn't do leap years
	for(var i=1; i<=5; i++) {
		var d = Date.resolveNumericDay(i,year);
		var month = d.getMonth()+1;
		var day = d.getDate();
		var p = [month,day,year];
		config.macros.getEarthCalendar.handler(place,macroName,p,wikifier,paramString,tiddler);
	}
};

Date.resolveNumericDay = function(day,year) {
	// add the number of seconds that have elapsed up to the day in question
	d = new Date("Jan 1, "+year);
	d.setTime(d.getTime()+86400000*(day-1));
	return d;
};
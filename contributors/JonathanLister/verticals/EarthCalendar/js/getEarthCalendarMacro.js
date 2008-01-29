config.macros.getEarthCalendar = {};

config.macros.getEarthCalendar.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var month = params[0];
	var day = params[1];
	var year = params[2];
	var context = {params:params, place:place};
	loadRemoteFile("http://www.earthcalendar.net/_php/lookup.php?mode=date&m="+month+"&d="+day+"&y="+year,config.macros.getEarthCalendar.process,context);
};
config.macros.getEarthCalendar.process = function(status,context,responseText,url,xhr) {
		if(!status) {
			displayMessage("GET failed for: "+url);
			return;
		}
		var e = document.createElement("div");
		e.innerHTML = responseText;
		var root = e.getElementsByTagName("blockquote")[0];
		var data_table = root.getElementsByTagName("table")[2];		
		var data_table_rows = data_table.getElementsByTagName("tr");
		var data_string = "";
		for(var i=0; i<data_table_rows.length; i++) {
			var cells = data_table_rows[i].getElementsByTagName("td");
			var countries = cells[1].innerHTML.replace(/<br>/ig,",");
			countries = countries.replace(/<[^>]*?>/mg,"");
			countries = countries.replace(/\n/mg,",").replace(/,- /mg,"");
			countries = countries.htmlDecode();
			if(countries[countries.length-1]==",")
				countries = countries.substr(0,countries.length-1);
			var c = countries.split(",");
			for(var j=0; j<c.length; j++) {
				data_string += "| "+context.params[0]+"/"+context.params[1]+" | ";
				data_string += cells[0].textContent+" | "+c[j]+" |\n";
			}
		}
		wikify(data_string,context.place);
		if (EarthCalendarDayCount%10===0)
			clearMessage();
		displayMessage(++EarthCalendarDayCount);
		// Note to self: there is still some messed up data from the website caused by linebreaks. I think I need to not break the line if the first character of the next line is a space
};

config.macros.getEarthCalendarForYear = {};

var EarthCalendarDayCount = 0;

config.macros.getEarthCalendarForYear.handler = function(place,macroName,params,wikifier,paramString,tiddler) {
	var year = params[0];
	var no_of_days = params[0]%4===0 ? 366 : 365;
	// note: doesn't do leap years
	for(var i=1; i<=no_of_days; i++) {
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
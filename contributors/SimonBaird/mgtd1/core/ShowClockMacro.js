/***
!Example Usage
<<eg
| Local|<<showClock\>\>|
| Queensland|<<showClock +10\>\>|
| England (DST)|<<showClock +1\>\>|
| California (DST)|<<showClock -7\>\>|
>>
***/
//{{{
version.extensions.ShowClockMacro = { major: 0, minor: 0, revision: 1, date: new Date(2006,7,12),
	source: "http://tiddlyspot.com/timezones/#ShowClockMacro"
};

config.macros.showClock = {

	defaultClass: 'clock',
	tickDelay: 1000, 
	format: "0DD MMM, YYYY 0hh:0mm:0ss",

	styles: 
		".clock {\n"+
		"  padding:0 0.5em;\n"+
		"}\n" +
		".clock .dow    { color:#000; }\n" +
		".clock .time   { color:#000; }\n" +
		".clock .offset { color:#999; }\n" +
		"",

	count: 0,

	handler: function (place,macroName,params,wikifier,paramString,tiddler) {
		var offset = params[0] || '';
		var useClass = params[1] || this.defaultClass;
		var c = this.count++;
		var clockElement = createTiddlyElement(place, "span", "clock" + c, useClass);
		clockElement.setAttribute("offset",offset);
		this.refreshDisplay(c);
		this.waitForTick(c);
	},

	waitForTick: function(c) {
		setTimeout("config.macros.showClock.tick(" + c + ")", this.tickDelay);
	},

	tick: function(c) {
		if (this.stillHere(c)) {
			this.refreshDisplay(c)
			this.waitForTick(c);
		}
	},

	getClock: function(c) {
		return document.getElementById("clock" + c);
	},

	stillHere: function(c) {
		return this.getClock(c) != null;
	},

	refreshDisplay: function(c) {
		var clock = this.getClock(c);
		var offset = clock.getAttribute("offset")
		var now = new Date();
		//var label = "local";
		var label = "";
		if (offset && offset != '') {
			var offsetInt = parseInt(offset);
			now.setHours(now.getHours() + (now.getTimezoneOffset() / 60) + offsetInt);
			label = "GMT " + (offsetInt == 0 ? "" : offsetInt > 0 ? "+"+offsetInt : offsetInt);
		}
		clock.innerHTML =
			'<span class="dow">' + now.formatString("DDD").substr(0,3) + ' </span>' +
			'<span class="time">' + now.formatString(this.format) + '</span>' + 
			'<span class="offset"> ' + label + '</span>'
	}

};

setStylesheet(config.macros.showClock.styles,"showClockStyles");

//}}}

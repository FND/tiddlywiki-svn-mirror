/*
 * Javascript Humane Dates
 * Copyright (c) 2008 Dean Landolt (deanlandolt.com)
 * Re-write by Zach Leatherman (zachleat.com)
 * 
 * Adopted from the John Resig's pretty.js
 * at http://ejohn.org/blog/javascript-pretty-date
 * and henrah's proposed modification 
 * at http://ejohn.org/blog/javascript-pretty-date/#comment-297458
 * 
 * Licensed under the MIT license.
 */

function humane_date(date_str){
	var time_formats = [
		[60, 'Just Now'],
		[90, '1 Minute'], // 60*1.5
		[3600, 'Minutes', 60], // 60*60, 60
		[5400, '1 Hour'], // 60*60*1.5
		[86400, 'Hours', 3600], // 60*60*24, 60*60
		[129600, '1 Day'], // 60*60*24*1.5
		[604800, 'Days', 86400], // 60*60*24*7, 60*60*24
		[907200, '1 Week'], // 60*60*24*7*1.5
		[2628000, 'Weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
		[3942000, '1 Month'], // 60*60*24*(365/12)*1.5
		[31536000, 'Months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
		[47304000, '1 Year'], // 60*60*24*365*1.5
		[3153600000, 'Years', 31536000], // 60*60*24*365*100, 60*60*24*365
		[4730400000, '1 Century'], // 60*60*24*365*100*1.5
	];

	var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," "),
		dt = new Date,
		seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
		token = ' Ago',
		i = 0,
		format;

	if (seconds < 0) {
		seconds = Math.abs(seconds);
		token = '';
	}

	while (format = time_formats[i++]) {
		if (seconds < format[0]) {
			if (format.length == 2) {
				return format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
			} else {
				return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
			}
		}
	}

	// overflow for centuries
	if(seconds > 4730400000)
		return Math.round(seconds / 4730400000) + ' Centuries' + token;

	return date_str;
};

if(typeof jQuery != 'undefined') {
	jQuery.fn.humane_dates = function(){
		return this.each(function(){
			var date = humane_date(this.title);
			if(date && jQuery(this).text() != date) // don't modify the dom if we don't have to
				jQuery(this).text(date);
		});
	};
}


config.macros.lifeStream = {};
config.macros.lifeStream.handler = function(place,macroName,params)
{
	config.macros.lifeStream.display(place, params);
};

config.macros.lifeStream.display = function (place, params)
{
	var tag = params[0];
	if(!tag) {
		throw "Provide a tag as a parameter to include tiddlers with that tag";
	}
	removeChildren(place);
	setStylesheet(".tiddler .button, .tiddler .button:hover {background-repeat:no-repeat;  margin:1px; float:none}"+
	".tiddler .button:hover,.tiddler .button	 {background-repeat:no-repeat; float:none;  }"+
	".textSpace {padding-top:1px}"+
	".tiddler .button, .tiddler .button:hover {padding:5px; margin:5px}"+
	".noFloat {float:none; background-color:red;}"+
	".stream { display: block; padding:1px; margin:1px ; max-width:500px;  min-height:20px; }"+
	".imgClass {float:left; display:block;padding-right:10px}");
	var tiddlers = store.reverseLookup("tags","excludeLists",false,"modified");
	var last = params[1] ? tiddlers.length-Math.min(tiddlers.length,parseInt(params[1])) : 0;
	var div = createTiddlyElement(place, "div");
	var lastDay ="";
	var today = new Date;
	var yesterday = new Date();
	yesterday.setDate(yesterday.getDate()-1);
	for(var t=tiddlers.length-1; t>=last; t--) {
		if(tiddlers[t].isTagged("tweets")) {
			if(typeof(tiddlers[t]['modified'])!='undefined'){
				var theDay = tiddlers[t]['modified'].convertToLocalYYYYMMDDHHMM().substr(0,8);
				if(theDay != lastDay) {
					if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==today.formatString("DD/MM/YYYY"))
						createTiddlyElement(place, "h3", null, null,  "Today");
					else if(tiddlers[t]['modified'].formatString("DD/MM/YYYY")==yesterday.formatString("DD/MM/YYYY"))
						createTiddlyElement(place, "h3", null, null,  "Yesterday");
					else
						createTiddlyElement(place, "h3", null, null, tiddlers[t]['modified'].formatString("DD/MM/YYYY"));
					lastDay = theDay;
				}		
			}
			var img = createTiddlyElement(null, "img", null, "imgClass");
			//img.src = tiddlers[t].fields['user_img'];
			img.src= "http://www.bioneural.net/wp-content/themes/k2bn/styles/bioneural/twitter.png";
			img.width = "16";
			img.height = "16";
			var slider = config.macros.slider.createSlider(place, "", "");
			addClass(slider,"slider");
			var sliderButton = findRelated(slider,"button","className","previousSibling");
			sliderButton.appendChild(img);
		
			var div = createTiddlyElement(sliderButton, "div", null, "textSpace");
			div.innerHTML =  tiddlers[t].text;
			addClass(sliderButton,"stream twitterStream");
			createTiddlyElement(sliderButton, "div", null, "noFloat");
			// this should choose some relevant fields - these are undefined for the tweets
			wikify(tiddlers[t].fields['url']+"\n\r"+tiddlers[t].fields.prettyDate,slider);
		}
	}
};
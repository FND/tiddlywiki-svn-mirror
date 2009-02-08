
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
	var context = {};
	context.callback = function() {
		config.macros.lifeStream.display(place, params);
	};
	context.host = "http://twitter.com/statuses/user_timeline/simonmcmanus";

	var twitter = new twitterAdaptor();
	twitter.openHost();
	twitter.getWorkspaceList(context);
	
	var flickr = new flickrAdaptor();
	flickr.openHost();
	context.host = "http://api.flickr.com/services/feeds/photos_public.gne?ids=22127230@N08";
	flickr.getWorkspaceList(context);
	
	var delicious = new deliciousAdaptor();
	delicious.openHost();
	context.host = "http://feeds.delicious.com/v2/json/simonmcmanus";
	delicious.getWorkspaceList(context);
	
	var wordpress = new wordpressAdaptor();
	wordpress.openHost();
	context.host = "http://simonmcmanus.wordpress.com";
	wordpress.getWorkspaceList(context);
	
	var trac = new tracAdaptor();
	trac.openHost();
	context.host = "http://trac.tiddlywiki.org/timeline?format=rss";
	trac.getWorkspaceList(context);
	createTiddlyElement(place, "h4", null, null, "loading...");
};

config.macros.lifeStream.display = function (place, params)
{
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
	lastDay ="";
	var today = new Date;
	var yesterday= new Date()
	yesterday.setDate(yesterday.getDate()-1);
	for(var t=tiddlers.length-1; t>=last; t--) {
		if(tiddlers[t].isTagged("note") ||["flickr", "twitter", "wordpress", "delicious", "trac"].contains(tiddlers[t].fields["original_server.type"])) {
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
	}
		switch(tiddlers[t].fields['original_server.type']){
			case "wordpress" :
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://bhc3.files.wordpress.com/2008/05/wordpress-icon-128.png";
				img.width = "20";
				img.height = "20";
				img.style.border ="0px";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream wordpressStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
			//	wikify("'''"+tiddlers[t].text+"'''\n\r"+tiddlers[t].fields["url"],slider);	
				wikify(tiddlers[t].fields["url"]+"\n\r"+tiddlers[t].fields.prettyDate,slider);	
			break;
			case "trac":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://mousebender.files.wordpress.com/2007/07/trac_logo.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				addClass(sliderButton,"stream tracStream");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				wikify(tiddlers[t].fields["url"]+"\n\r"+tiddlers[t].fields.prettyDate,slider);		
				
			break;
			case "flickr":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = tiddlers[t].text;
				img.width = "20";
				img.height = "20";
				
				var slider = config.macros.slider.createSlider(place, "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);		
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				addClass(sliderButton,"stream flickrStream");
				wikify("[img["+tiddlers[t].text+"]]\n\r"+tiddlers[t].fields['link']+"\n\r"+tiddlers[t].fields.prettyDate,slider);
				createTiddlyElement(sliderButton, "div", null, "noFloat");
			break;
			case "twitter":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				//img.src = tiddlers[t].fields['user_img'];
				img.src= "http://graphical.ilyfe.net/wp-content/themes/Graphicalicious/images/twitter-icon.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				
				var div = createTiddlyElement(sliderButton, "div", null, "textSpace");
				div.innerHTML =  tiddlers[t].text;
				addClass(sliderButton,"stream twitterStream");
				createTiddlyElement(sliderButton, "div", null, "noFloat");
				wikify(tiddlers[t].fields['url']+"\n\r"+tiddlers[t].fields.prettyDate,slider);
			break;
			case "delicious":
				var img = createTiddlyElement(null, "img", null, "imgClass");
				img.src = "http://www.iconspedia.com/uploads/927159536.png";
				img.width = "20";
				img.height = "20";
				var slider = config.macros.slider.createSlider(place, "", "");
				addClass(slider,"slider");
				var sliderButton = findRelated(slider,"button","className","previousSibling");
				sliderButton.appendChild(img);
				createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
				addClass(sliderButton,"stream deliciousStream");
				wikify(tiddlers[t].text+"\n\r"+tiddlers[t].fields.prettyDate,slider);
			break;
			default:
				if(tiddlers[t].isTagged("note")){
					var img = createTiddlyElement(null, "img", null, "imgClass");
					img.src = "http://www.iconspedia.com/uploads/578075880.png";
					img.width = "20";
					img.height = "20";
					var slider = config.macros.slider.createSlider(place, "", "");
					addClass(slider,"slider");
					var sliderButton = findRelated(slider,"button","className","previousSibling");
					sliderButton.appendChild(img);
					createTiddlyElement(sliderButton, "div", null, "textSpace", tiddlers[t].title);
					addClass(sliderButton,"stream deliciousStream");
					wikify(tiddlers[t].text+"\n\r"+humane_date(tiddlers[t].modified),slider);
			}
		}
		
	}
};

/***
|''Name:''|SimileTimelinePlugin|
|''Description:''|Plugin to support [[Simile Timelines|http://simile.mit.edu/SimileTimeline/]]|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SimileTimelinePlugin.js|
|''Version:''|0.0.1|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2|
***/

/*{{{*/
Timeline.loadTiddlers = function(data,f)
{
	f(data);
};

Timeline.GregorianDateLabeller.labelIntervalFunctions["en"] = function(date,intervalUnit)
{
	if(intervalUnit==Timeline.DateTime.WEEK) {
		var date2 = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
		var text = "" + date2.getWeek();
		return { text: text, emphasized: false };
	} else {
		return this.defaultLabelInterval(date,intervalUnit);
	}
};

Timeline.DefaultEventSource.prototype.loadTiddlers = function(data)
{
	var tag = data.tag;
	var url = data.url ? data.url : "dummy";
//#displayMessage('loadTiddlers:'+tag);
    var base = this._getBaseURL(url);
    var added = false;  
    var wikiURL = null;
    var wikiSection = null;

    var dateTimeFormat = null;
    var parseDateTimeFunction = this._events.getUnit().getParser(dateTimeFormat);
   
	var sortField = 'title';
	var tagged = store.getTaggedTiddlers(tag,sortField);
//#displayMessage('length:'+tagged.length);
	for(var i=0; i<tagged.length; i++) {
		var event = config.macros.SimileTimeline.getEvent(tagged[i].title);
        var evt = new Timeline.DefaultEventSource.Event(
			parseDateTimeFunction(event.start),
			parseDateTimeFunction(event.end),
			parseDateTimeFunction(event.latestStart),
			parseDateTimeFunction(event.earliestEnd),
            event.isDuration || false,
            event.title,
            event.description,
            this._resolveRelativeURL(event.image,base),
            this._resolveRelativeURL(event.link,base),
            this._resolveRelativeURL(event.icon,base),
            event.color,
            event.textColor);
        evt._obj = event;
        evt.getProperty = function(name) {
            return this._obj[name];
        };
        evt.setWikiInfo(wikiURL,wikiSection);

        this._events.add(evt);
        added = true;
    }
   
    if (added) {
        this._fire('onAddMany',[]);
    }
};

config.macros.SimileTimeline = {};

// to allow loading from tiddlers with differently named fields
config.macros.SimileTimeline.eventFields = {
	start:'start',latestStart:'latestStart',end:'end',earliestEnd:'earliestEnd',
	isDuration:'isDuration',title:'title',description:'description',image:'image',link:'link',
	icon:'icon',color:'color',textColor:'textColor'
	};

config.macros.SimileTimeline.getEvent = function(title)
{
//#displayMessage('getEvent:'+title);
	var t = title;
	var f = config.macros.SimileTimeline.eventFields;
//#displayMessage('f:'+f.start);
	var ev = {};

	ev.start = store.getTiddlerSlice(t,f.start);
	ev.latestStart = store.getTiddlerSlice(t,f.latestStart);
	ev.end = store.getTiddlerSlice(t,f.end);
	ev.earliestEnd = store.getTiddlerSlice(t,f.earliestEnd);
	ev.isDuration = store.getTiddlerSlice(t,f.isDuration);
	ev.title = store.getTiddlerSlice(t,f.title);
	ev.description = store.getTiddlerSlice(t,f.description);
	ev.image = store.getTiddlerSlice(t,f.image);
	ev.link = store.getTiddlerSlice(t,f.link);
	ev.icon = store.getTiddlerSlice(t,f.icon);
	ev.color = store.getTiddlerSlice(t,f.color);
	ev.textColor = store.getTiddlerSlice(t,f.textColor);
//#displayMessage('t:'+ev.title+' s:'+ev.start+' e:'+ev.end);
	return ev;
};


config.macros.SimileTimeline.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var spec = params[0];
	var eventSource = new Timeline.DefaultEventSource();
    var theme = Timeline.ClassicTheme.create();
	var bwidth = store.getTiddlerSlice(spec,'BubbleWidth');
	var bheight = store.getTiddlerSlice(spec,'BubbleHeight');
    theme.event.bubble.width = bwidth ? bwidth : 320;
    theme.event.bubble.height = bheight ? bheight : 220;

	var bandInfos = [];
	var bandParams = config.macros.SimileTimeline.getBandParams(spec,'0',eventSource,theme);
	var bi = Timeline.createBandInfo(bandParams);
	bandInfos.push(bi);

	var timeline = createTiddlyElement(place,'div',null,'simileTimeline');// simileTimeline css class
	var theight = store.getTiddlerSlice(spec,'timelineHeight');
	timeline.style['height'] = theight ? theight + 'px' : '150px';
	var tborder = store.getTiddlerSlice(spec,'timelineBorder');
	if(tborder)
		timeline.style['border'] = tborder + 'px';
	config.macros.SimileTimeline.timeline = Timeline.create(timeline,bandInfos);
	var data = {};
	data.tag = store.getTiddlerSlice(spec,'timelineTag');
	//#	displayMessage("handler tag:"+data.tag);
	Timeline.loadTiddlers(data, function(data,url) { eventSource.loadTiddlers(data,url); });
};

config.macros.SimileTimeline.getBandParams = function(title,n,eventSource,theme)
{
	var t = title;
	var width = store.getTiddlerSlice(t,'width'+n);
//#displayMessage("width:"+width);
	if(!width)
		return null;
	var bp = {};
	bp.width = width;
	if(eventSource)
		bp.eventSource = eventSource;
	if(theme)
		bp.theme = theme;
	var intervalUnit = store.getTiddlerSlice(t,'intervalUnit'+n);
	switch(intervalUnit) {
	case 'MILLISECOND':
		bp.intervalUnit = 0;
		break;
	case 'SECOND':
		bp.intervalUnit = 1;
		break;
	case 'MINUTE':
		bp.intervalUnit = 2;
		break;
	case 'HOUR':
		bp.intervalUnit = 3;
		break;
	case 'DAY':
		bp.intervalUnit = 4;
		break;
	case 'WEEK':
		bp.intervalUnit = 5;
		break;
	case 'MONTH':
		bp.intervalUnit = 6;
		break;
	case 'YEAR':
		bp.intervalUnit = 7;
		break;
	case 'DECADE':
		bp.intervalUnit = Timeline.DateTime.DECADE;
		break;
	case 'CENTURY':
		bp.intervalUnit = 9;
		break;
	case 'MILLENNIUM':
		bp.intervalUnit = 10;
		break;
	case 'EPOCH':
		bp.intervalUnit = -1;
		break;
	case 'ERA':
		bp.intervalUnit = -2;
		break;
	}
//#displayMessage('bp.intervalUnit:'+bp.intervalUnit);
	bp.intervalPixels = store.getTiddlerSlice(t,'intervalPixels'+n);
//#displayMessage('bp.intervalPixels:'+bp.intervalPixels);
	bp.date = store.getTiddlerSlice(t,'date'+n);
	if(bp.date)
	    bp.date = Timeline.DateTime.parseGregorianDateTime(bp.date);
	//bp.trackHeight = store.getTiddlerSlice(t,'trackHeight'+n);
	//bp.trackGap = store.getTiddlerSlice(t,'trackGap'+n);
	//bp.showEventText = store.getTiddlerSlice(t,'showEventText'+n);
	return bp;
};
/*
from http://simile.mit.edu/repository/timeline/trunk/src/webapp/api/scripts/util/date-time.js
Timeline.DateTime.MILLISECOND    = 0;
Timeline.DateTime.SECOND         = 1;
Timeline.DateTime.MINUTE         = 2;
Timeline.DateTime.HOUR           = 3;
Timeline.DateTime.DAY            = 4;
Timeline.DateTime.WEEK           = 5;
Timeline.DateTime.MONTH          = 6;
Timeline.DateTime.YEAR           = 7;
Timeline.DateTime.DECADE         = 8;
Timeline.DateTime.CENTURY        = 9;
Timeline.DateTime.MILLENNIUM     = 10;

Timeline.DateTime.EPOCH          = -1;
Timeline.DateTime.ERA            = -2;
*/

/*}}}*/

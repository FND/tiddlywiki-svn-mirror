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
Timeline.loadTiddlers = function(url,f,tag)
{
/*    var fError = function(statusText,status,xmlhttp) {
        alert("Failed to load tiddlers from " + url + "\n" + statusText);
    };
    var fDone = function(xmlhttp) {
        f(xmlhttp.responseText,url,tag);
    };
    Timeline.XmlHttp.get(url,fError,fDone);
*/
	f(null,url,tag);
};

Timeline.DefaultEventSource.prototype.loadTiddlers = function(data,url,tag)
{
//#displayMessage('loadTiddlers:'+tag);
//#tag = 'CubismTimeline';
//#displayMessage('loadTiddlers2:'+tag);
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
            this._resolveRelativeURL(event.image, base),
            this._resolveRelativeURL(event.link, base),
            this._resolveRelativeURL(event.icon, base),
            event.color,
            event.textColor);
        evt._obj = event;
        evt.getProperty = function(name) {
            return this._obj[name];
        };
        evt.setWikiInfo(wikiURL, wikiSection);

        this._events.add(evt);
        added = true;
    }
   
    if (added) {
        this._fire('onAddMany', []);
    }
};

config.macros.SimileTimeline = {};

config.macros.SimileTimeline.getEvent = function(title)
{
//#displayMessage('getEvent:'+title);
	var t = title;
	var ev = {};
	ev.start = store.getTiddlerSlice(t,'start');
	ev.latestStart = store.getTiddlerSlice(t,'latestStart');
	ev.end = store.getTiddlerSlice(t,'end');
	ev.earliestEnd = store.getTiddlerSlice(t,'earliestEnd');
	ev.isDuration = store.getTiddlerSlice(t,'isDuration');
	ev.title = store.getTiddlerSlice(t,'title');
	ev.description = store.getTiddlerSlice(t,'description');
	ev.image = store.getTiddlerSlice(t,'image');
	ev.link = store.getTiddlerSlice(t,'link');
	ev.icon = store.getTiddlerSlice(t,'icon');
	ev.color = store.getTiddlerSlice(t,'color');
	ev.textColor = store.getTiddlerSlice(t,'textColor');
//#displayMessage('t:'+ev.title+' s:'+ev.start+' e:'+ev.end);
	return ev;
};


config.macros.SimileTimeline.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var title = params[0];
	var eventSource = new Timeline.DefaultEventSource();
  /*var bandInfos = [
    Timeline.createBandInfo({
           eventSource:    eventSource,
        date:           'Jun 28 2006 00:00:00 GMT',
	     width:          '70%', 
        intervalUnit:   Timeline.DateTime.MONTH, 
        intervalPixels: 100
    }),
    Timeline.createBandInfo({
           eventSource:    eventSource,
        date:           'Jun 28 2006 00:00:00 GMT',
        showEventText:  false,
        trackHeight:    0.5,
        trackGap:       0.2,
        width:          '30%', 
        intervalUnit:   Timeline.DateTime.YEAR, 
        intervalPixels: 200
    })
  ];
	bandInfos[1].syncWith = 0;
	bandInfos[1].highlight = true;
*/
    var theme = Timeline.ClassicTheme.create();
    theme.event.bubble.width = 320;
    theme.event.bubble.height = 220;

    var d = Timeline.DateTime.parseGregorianDateTime('1920');

	var bandInfos = [];

	var bandParams = {};
//#bandParams.width = '100%';
	bandParams = config.macros.SimileTimeline.getBandParams(title,'1',eventSource,theme);
	var bi = Timeline.createBandInfo(bandParams);

	bandInfos.push(bi);
	var timeline = createTiddlyElement(place,'div',null,'simileTimeline');// simileTimeline css class
	timeline.style['height'] = '150px';
	timeline.style['border'] = '1px';

	config.macros.SimileTimeline.tl = Timeline.create(timeline,bandInfos);
//#displayMessage('title:'+title);
	var tag = store.getTiddlerSlice(title,'SimileTimelineTag');
//#	displayMessage('tag:'+tag);
	Timeline.loadTiddlers('cubism.js', function(data,url,tag) { eventSource.loadTiddlers(data,url,tag); },tag);
	//Timeline.loadJSON('cubism.js', function(data, url) { eventSource.loadJSON(data, url); });
	//Timeline.loadXML('example1.xml', function(xml, url) { eventSource.loadXML(xml, url); });
 };


config.macros.SimileTimeline.getBandParams = function(title,n,eventSource,theme)
{
//#displayMessage('getBandParams:'+title);
	var t = title;
	var bp = {};
	if(eventSource)
		bp.eventSource = eventSource;
	if(theme)
		bp.theme = theme;
	bp.width = store.getTiddlerSlice(t,'width'+n);
displayMessage('bp.width:'+bp.width);
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

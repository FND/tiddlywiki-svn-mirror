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
// Ensure that the SimileTimelinePlugin is only installed once.
if(!version.extensions.SimileTimelinePlugin) {
version.extensions.SimileTimelineBundlePlugin = {installed:true};

Timeline.loadTiddlers = function(data,fn)
{
	fn(data);
};

Timeline.GregorianDateLabeller.labelIntervalFunctions["en"] = function(date,intervalUnit)
{
	if(intervalUnit==Timeline.DateTime.WEEK) {
		var date2 = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
		var text = '' + date2.getWeek();
		return {text:text,emphasized:false};
	} else {
		return this.defaultLabelInterval(date,intervalUnit);
	}
};

Timeline.DefaultEventSource.prototype.loadTiddlers = function(data)
{
//#displayMessage('loadTiddlers:'+data.tag);
	var tag = data.tag;
	var url = data.url ? data.url : "dummy";
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
	if(bwidth)
		theme.event.bubble.width = bwidth;
	var bheight = store.getTiddlerSlice(spec,'BubbleHeight');
	if(bheight)
		theme.event.bubble.height = bheight;

	var defaultDate = Timeline.DateTime.parseGregorianDateTime('2000')
	var bandInfos = [];
	var bandParams = config.macros.SimileTimeline.getBandParams(spec,'0',eventSource,theme,defaultDate);
	defaultDate = bandParams.date;
	var bi = bandParams.zones ? Timeline.createHotZoneBandInfo(bandParams) : Timeline.createBandInfo(bandParams);
	bandInfos.push(bi);
	
	var i = 1;
	bandParams = config.macros.SimileTimeline.getBandParams(spec,'1',eventSource,theme,defaultDate);
	while(bandParams) {
		bi = bandParams.zones ? Timeline.createHotZoneBandInfo(bandParams) : Timeline.createBandInfo(bandParams);
		bandInfos.push(bi);
		bandInfos[i].syncWith = 0;
		bandInfos[i].highlight = true;
		i++;
		bandParams = config.macros.SimileTimeline.getBandParams(spec,String(i),eventSource,theme,defaultDate);
	}
	var timeline = createTiddlyElement(place,'div',null,'simileTimeline');// simileTimeline css class
	var tHeight = store.getTiddlerSlice(spec,'timelineHeight');
	timeline.style['height'] = tHeight ? tHeight + 'px' : '150px';
	var tBorder = store.getTiddlerSlice(spec,'timelineBorder');
	if(tBorder)
		timeline.style['border'] = tBorder + 'px';
	config.macros.SimileTimeline.timeline = Timeline.create(timeline,bandInfos);
	var data = {};
	data.tag = store.getTiddlerSlice(spec,'eventSourceTag0');
//#displayMessage("handler tag:"+data.tag);
	if(data.tag)
		Timeline.loadTiddlers(data, function(data,url) { eventSource.loadTiddlers(data,url); });
};

config.macros.SimileTimeline.getBandParams = function(title,n,eventSource,theme,defaultDate)
{
	var t = title;
	var width = store.getTiddlerSlice(t,'width'+n);
//#displayMessage("width"+n+":"+width);
	if(!width)
		return null;
	var bp = {};
	bp.width = width;
	if(eventSource && store.getTiddlerSlice(title,'eventSourceTag'+n))
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
	default:
		bp.intervalUnit = 7;
		break;
	}
	var intervalPixels = store.getTiddlerSlice(t,'intervalPixels'+n);
	bp.intervalPixels = eval(intervalPixels);
	var date = store.getTiddlerSlice(t,'date'+n);
	bp.date = date ? Timeline.DateTime.parseGregorianDateTime(date) : defaultDate;
	var showEventText = store.getTiddlerSlice(t,'showEventText'+n);
	bp.showEventText = showEventText ? eval(showEventText) : true;
	var trackHeight = store.getTiddlerSlice(t,'trackHeight'+n);
	if(trackHeight)
		bp.trackHeight = eval(trackHeight);
	var trackGap = store.getTiddlerSlice(t,'trackGap'+n);
	if(trackGap)
		bp.trackGap = eval(trackGap);
	return bp;
};
} // end of 'install only once'
/*}}}*/

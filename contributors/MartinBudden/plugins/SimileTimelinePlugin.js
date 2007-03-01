/***
|''Name:''|SimileTimelinePlugin|
|''Description:''|Plugin to support [[Simile Timelines|http://simile.mit.edu/SimileTimeline/]]|
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Subversion:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SimileTimelinePlugin.js|
|''Version:''|0.0.2|
|''Date:''|Feb 25, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.2|
***/

/*{{{*/
// Ensure that the SimileTimelinePlugin is only installed once.
if(!version.extensions.SimileTimelinePlugin) {
version.extensions.SimileTimelineBundlePlugin = {installed:true};

Timeline.GregorianDateLabeller.prototype.labelPrecise = function(date)
{
	var dt = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
	var template = "YYYY mmm 0DD";
	return dt.formatString(template);
	//return dt.toUTCString();
};

Timeline.GregorianDateLabeller.labelIntervalWeek = function(date)
{
	var dt = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
	var text = '' + dt.getWeek();
	return {text:text,emphasized:false};
}

Timeline.GregorianDateLabeller.labelIntervalFunctions['en'] = function(date,intervalUnit)
{
	if(intervalUnit==Timeline.DateTime.WEEK) {
		var dt = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
		var text = '' + dt.getWeek();
		return {text:text,emphasized:false};
	} else {
		return this.defaultLabelInterval(date,intervalUnit);
	}
};
/*
Timeline.DefaultEventSource.Event.prototype.fillInfoBubble = function(elmt,theme,labeller)
{
	var doc = elmt.ownerDocument;

	var title = this.getText();
	var link = this.getLink();
	var image = this.getImage();

	if (image != null) {
		var img = doc.createElement("img");
		img.src = image;
		
		theme.event.bubble.imageStyler(img);
		elmt.appendChild(img);
	}

	var divTitle = doc.createElement("div");
	var textTitle = doc.createTextNode(title);
	if (link != null) {
		var a = doc.createElement("a");
		a.href = link;
		a.appendChild(textTitle);
		divTitle.appendChild(a);
	} else {
		divTitle.appendChild(textTitle);
	}
	theme.event.bubble.titleStyler(divTitle);
	elmt.appendChild(divTitle);

	var divBody = doc.createElement("div");
	this.fillDescription(divBody);
	theme.event.bubble.bodyStyler(divBody);
	elmt.appendChild(divBody);

	var divTime = doc.createElement("div");
	this.fillTime(divTime, labeller);
	theme.event.bubble.timeStyler(divTime);
	elmt.appendChild(divTime);

	var divWiki = doc.createElement("div");
	this.fillWikiInfo(divWiki);
	theme.event.bubble.wikiStyler(divWiki);
	elmt.appendChild(divWiki);
};
*/
Timeline.loadTiddlers = function(data,fn)
{
	fn(data);
};

Timeline.DefaultEventSource.prototype.loadTiddlers = function(data)
{
//#displayMessage('loadTiddlers:'+data.tag);
	if(data.type && data.type=='tiddlerFields') {
		var include = false;
		var tag = 'excludeLists';
	} else {
		include = true;
		tag = data.tag;
	}
	var url = data.url ? data.url : "dummy";
	var base = this._getBaseURL(url);
	// wikiURL and wikiSection used for the "Discuss" button.
	var wikiURL = data.wikiURL;
	var wikiSection = data.wikiSection;

	var dateTimeFormat = null;
	var parseDateTimeFunction = this._events.getUnit().getParser(dateTimeFormat);

	var added = false;  
	var tiddlers = store.reverseLookup('tags',tag,include);
//#displayMessage('length:'+tiddlers.length);
	for(var i=0; i<tiddlers.length; i++) {
		//var event = config.macros.SimileTimeline.getEvent(tiddlers[i].title);
		var event = tiddlers[i].getSimileTimelineEvent(data.type);
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

Tiddler.prototype.getSimileTimelineEvent = function(type,eventFields)
{
//#displayMessage('getEvent:'+this.title);
	var t = this.title;
	var f = eventFields ? eventFields : config.macros.SimileTimeline.eventFields;
	var ev = {};
	if(type && type=='tiddlerFields') {
		ev.start = this.created;
		//ev.end = this.modified;
		ev.end = null;
		ev.title = this.title;
		ev.description = this.text;
		ev.latestStart = null;
		ev.earliestEnd = null;
		ev.isDuration = false;
		ev.image = null;
		ev.link = null;
		//ev.link = 'index.html#' + encodeURIComponent(String.encodeTiddlyLink(this.title));
//displayMessage("link:"+ev.link);
		ev.icon = null;
		ev.color = null;
		ev.textColor = null;
	} else {
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
	}
//#displayMessage('t:'+ev.title+' s:'+ev.start+' e:'+ev.end);
	return ev;
};

config.macros.SimileTimeline = {};

// to allow loading from tiddlers with differently named fields
config.macros.SimileTimeline.eventFields = {
	start:'start',latestStart:'latestStart',end:'end',earliestEnd:'earliestEnd',
	isDuration:'isDuration',title:'title',description:'description',image:'image',link:'link',
	icon:'icon',color:'color',textColor:'textColor'
	};

config.macros.SimileTimeline.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	var spec = params[0];
	var eventSource = new Timeline.DefaultEventSource();
	var theme = Timeline.ClassicTheme.create();

	var bWidth = store.getTiddlerSlice(spec,'bubbleWidth');
	if(bWidth)
		theme.event.bubble.width = bWidth;
	var bHeight = store.getTiddlerSlice(spec,'bubbleHeight');
	if(bHeight)
		theme.event.bubble.height = bHeight;

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
	data.type = store.getTiddlerSlice(spec,'eventSourceType0');
	data.tag = store.getTiddlerSlice(spec,'eventSourceTag0');
//#displayMessage("data.type:"+data.type);
//#displayMessage("handler tag:"+data.tag);
	if(data.type||data.tag)
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
	if(eventSource)// && store.getTiddlerSlice(title,'eventSourceTag'+n))
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
		bp.intervalUnit = 8;
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

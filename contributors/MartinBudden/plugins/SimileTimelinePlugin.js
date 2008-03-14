/***
|''Name:''|SimileTimelinePlugin|
|''Description:''|Plugin to support Simile Timelines, see http://simile.mit.edu/SimileTimeline/ |
|''Author:''|Martin Budden ( mjbudden [at] gmail [dot] com)|
|''Source:''|http://www.martinswiki.com/#SimileTimelineBundlePlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SimileTimelinePlugin.js |
|''Version:''|0.1.6|
|''Date:''|Mar 4, 2007|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]] |
|''~CoreVersion:''|2.2|

Note that to use this pluing you also need:

1) to install SimileTimelineBundlePlugin (see http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/plugins/SimileTimelineBundlePlugin.js )
2) to include [[SimileTimelineStyleBundle]] in your StyleSheet tiddler (see http://svn.tiddlywiki.org/Trunk/contributors/MartinBudden/styles/SimileTimelineStyleBundle.css.js )

!!Todo
* fix bubble height and width
* etherpainters
* allow multiple painters per timeline
* multiple event sources per band
* multiple clocks
* JSON
* XML

***/

/*{{{*/
// Ensure that the SimileTimelinePlugin is only installed once.
if(!version.extensions.SimileTimelinePlugin) {
version.extensions.SimileTimelinePlugin = {installed:true};

if(version.major < 2 || (version.major == 2 && version.minor < 2))
	{alertAndThrow('SimileTimelineBundlePlugin requires TiddlyWiki 2.2 or newer.');}

config.macros.SimileTimeline = {};

config.macros.SimileTimeline.closeTiddler = Story.prototype.closeTiddler;
Story.prototype.closeTiddler = function(title,animate,slowly)
{
	config.macros.SimileTimeline.closeTiddler.apply(this,arguments);
	if(config.macros.SimileTimeline.tickTitle && config.macros.SimileTimeline.tickTitle==title) {
		config.macros.SimileTimeline.clearTick();
	}
};

// used for date string in bubble
Timeline.urlPrefix = 'http://martinswiki.com/timeline/'; //!! kludge for now

Timeline.GregorianDateLabeller.prototype.labelPrecise = function(date)
{
	var dt = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
	var template = "mmm DD, YYYY";
	return dt.formatString(template);
	//return dt.toUTCString();
};

Timeline.GregorianDateLabeller.labelIntervalWeek = function(date)
{
	var dt = Timeline.DateTime.removeTimeZoneOffset(date,this._timeZone);
	var text = '' + dt.getWeek();
	return {text:text,emphasized:false};
};

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

	var image = this.getImage();
	if(image) {
		var img = doc.createElement("img");
		img.src = image;
		
		theme.event.bubble.imageStyler(img);
		elmt.appendChild(img);
	}

	var divTitle = doc.createElement("div");
	var title = this.getText();
	var textTitle = doc.createTextNode(title);
	var link = this.getLink();
	if(link) {
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
	this.fillTime(divTime,labeller);
	theme.event.bubble.timeStyler(divTime);
	elmt.appendChild(divTime);

	var divWiki = doc.createElement("div");
	this.fillWikiInfo(divWiki);
	theme.event.bubble.wikiStyler(divWiki);
	elmt.appendChild(divWiki);
};
*/

Timeline.loadTiddlerJSON = function(title,fn)
{
	var tiddler = store.fetchTiddler(title);
	try {
		var uri = '';
		var j = eval('(' + tiddler.text + ')');
		fn(j,uri);
	} catch(ex) {
		console.log(ex);
		return exceptionText(ex);
	}
};

Timeline.loadTiddlers = function(data,fn)
{
	fn(data);
};

Timeline.DefaultEventSource.prototype.loadTiddlers = function(data)
{
//#displayMessage('loadTiddlers:'+data.params);
	var include = true;
	var tag = data.params;
	if(data.type && data.type=='tiddlerFields') {
		if(!tag) {
			tag = 'excludeLists';
			include = false;
		}
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
			this._resolveRelativeURL(event.link,''),
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
/*
Timeline.loadXML = function(url, f) {
	var fError = function(statusText, status, xmlhttp) {
		alert("Failed to load data xml from " + url + "\n" + statusText);
	};
	var fDone = function(xmlhttp) {
		var xml = xmlhttp.responseXML;
		if (!xml.documentElement && xmlhttp.responseStream) {
			xml.load(xmlhttp.responseStream);
		}
		f(xml,url);
	};
	SimileAjax.XmlHttp.get(url, fError, fDone);
};
*/
Timeline.loadXMLRemote = function(uri,f) {
	var callback = function(status,context,responseText,uri,xhr) {
		if(status) {
			var xml = xhr.responseXML;
			if(window.Components && window.netscape && window.netscape.security && document.location.protocol.indexOf("http") == -1)
				window.netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
			if (!xml.documentElement && xhr.responseStream) {
				xml.load(xhr.responseStream);
			}
			try {
				f(xml,uri);
			} catch(ex) {
				console.log(ex);
				return exceptionText(ex);
			}
		} else {
			alert("Failed to load data xml from " + uri + "\n" + xhr.statusText);
		}
	};
	loadRemoteFile(uri,callback)
};

/*
Timeline.loadJSON = function(url, f) {
	var fError = function(statusText, status, xmlhttp) {
		alert("Failed to load json data from " + url + "\n" + statusText);
	};
	var fDone = function(xmlhttp) {
		f(eval('(' + xmlhttp.responseText + ')'), url);
	};
	SimileAjax.XmlHttp.get(url, fError, fDone);
};
*/

Timeline.loadJSONRemote = function(uri,f) {
	var callback = function(status,context,responseText,uri,xhr) {
		if(status) {
			var json = responseText;
			var data = eval('(' + json + ')');
			try {
				f(data,uri);
			} catch(ex) {
				console.log(ex);
				return exceptionText(ex);
			}
		} else {
			alert("Failed to load data xml from " + uri + "\n" + xhr.statusText);
		}
	};
	loadRemoteFile(uri,callback)
};

Timeline.loadJSONFile = function(filePath,f) {
	var json = loadFile(filePath);
	try {
		var data = eval('(' + json + ')');
		f(data, filePath);
	} catch(ex) {
		console.log(ex);
		return exceptionText(ex);
	}
};

Tiddler.prototype.getSimileTimelineEvent = function(type,eventFields)
{
//#displayMessage('getEvent:'+this.title);
	var t = this.title;
	var f = eventFields ? eventFields : config.macros.SimileTimeline.eventFields;
	var ev = {};
	if(type && type=='tiddlerFields') {
		//# get the event from the tiddler's fields
		ev.start = this.modified;
		ev.title = t;
		ev.description = this.text ? this.text : '';
		ev.link = this.fields.link;
		if(!ev.link)
			ev.link = 'javascript:story.displayTiddler(null,"' + t + '")';
		//#ev.link = 'index.html#' + encodeURIComponent(String.encodeTiddlyLink(this.title));
//#displayMessage("link:"+ev.link);
	} else {
		//# get the event from the slices specified by the eventFields
		ev.start = store.getTiddlerSlice(t,f.start);
		ev.latestStart = store.getTiddlerSlice(t,f.latestStart);
		ev.end = store.getTiddlerSlice(t,f.end);
		ev.earliestEnd = store.getTiddlerSlice(t,f.earliestEnd);
		ev.isDuration = store.getTiddlerSlice(t,f.isDuration);
		ev.title = store.getTiddlerSlice(t,f.title);
		ev.description = store.getTiddlerSlice(t,f.description);
		if(!ev.description)
			ev.description = '';
		ev.image = store.getTiddlerSlice(t,f.image);
		ev.link = store.getTiddlerSlice(t,f.link);
		if(!ev.link)
			ev.link = 'javascript:story.displayTiddler(null,"' + t + '")';
		ev.icon = store.getTiddlerSlice(t,f.icon);
		ev.color = store.getTiddlerSlice(t,f.color);
		ev.textColor = store.getTiddlerSlice(t,f.textColor);
	}
//#displayMessage('t:'+ev.title+' s:'+ev.start+' e:'+ev.end);
	return ev;
};

// to allow loading from tiddlers with differently named fields
config.macros.SimileTimeline.eventFields = {
	start:'start',latestStart:'latestStart',end:'end',earliestEnd:'earliestEnd',
	isDuration:'isDuration',title:'title',description:'description',image:'image',link:'link',
	icon:'icon',color:'color',textColor:'textColor'
	};

config.macros.SimileTimeline.handler = function(place,macroName,params,wikifier,paramString,tiddler)
{
	this.clearTick();
	var spec = params[0];
	var eventSource = new Timeline.DefaultEventSource();
	var theme = Timeline.ClassicTheme.create();

	var bWidth = store.getTiddlerSlice(spec,'bubbleWidth');
	if(bWidth)
		theme.event.bubble.width = bWidth;
	var bHeight = store.getTiddlerSlice(spec,'bubbleHeight');
	if(bHeight)
		theme.event.bubble.height = bHeight;

	//#var defaultDate = Timeline.DateTime.parseGregorianDateTime('2000');
	var defaultDate = new Date();
	var eventSources = [];
	var ev = {};
	var bandInfos = [];
	var i = 0;
	var bandParams = config.macros.SimileTimeline.getBandParams(spec,'0',defaultDate);
	while(bandParams) {
		if(bandParams.ev.type && bandParams.ev.type != 'none') {
			bandParams.bp.eventSource = eventSource;
			ev = bandParams.ev;
			if(bandParams.ev.type != 'timer') {
				ev.source = eventSource;
			}
			if(eventSources.length==0)// !!!for now only deal with one eventSource
				eventSources.push(ev);
		}
		bandParams.theme = theme;
		defaultDate = bandParams.bp.date;
		bi = bandParams.bp.zones ? Timeline.createHotZoneBandInfo(bandParams.bp) : Timeline.createBandInfo(bandParams.bp);
		bandInfos.push(bi);
		if(bandParams.ep) {
			var ep = bandParams.ep;
//#displayMessage("ep:"+ep.etherPainter+" ep.sd:"+ep.startDate+" ep.m:"+ep.multiple);
			try {
				bandInfos[i].etherPainter = new Timeline[ep.etherPainter]({startDate:ep.startDate,multiple:ep.multiple,theme:theme});
			} catch(ex) {
			}
		}
		if(bandParams.dec) {
			var dec = bandParams.dec;
//#displayMessage("dec:"+dec.decorator+" dec.sd:"+dec.startDate+" dec.ed:"+dec.endDate);
			try {
				bandInfos[i].decorators = [new Timeline[dec.decorator]({
					startDate:dec.startDate,
					endDate:dec.endDate,
					startLabel:'',//dec.startLabel,
					endLabel:'',//dec.endLabel,
					color:dec.color,
					opacity:dec.opacity,
					theme:theme})];
			} catch(ex) {
			}
		}
		if(i>0) {
			bandInfos[i].syncWith = 0;
			bandInfos[i].highlight = bandParams.highlight;
		}
		i++;
		bandParams = config.macros.SimileTimeline.getBandParams(spec,String(i),defaultDate);
	}
	var timelineElem = createTiddlyElement(place,'div',null,'simileTimeline');// simileTimeline css class
	var tHeight = store.getTiddlerSlice(spec,'timelineHeight');
	timelineElem.style['height'] = tHeight ? tHeight + 'px' : '150px';
	var tBorder = store.getTiddlerSlice(spec,'timelineBorder');
	if(tBorder)
		timelineElem.style['border'] = tBorder + 'px';
	config.macros.SimileTimeline.timeline = Timeline.create(timelineElem,bandInfos);
	var data = {};
	for(i=0;i<eventSources.length;i++) {
		ev = eventSources[i];
		if(ev.type=='timer') {
			config.macros.SimileTimeline.tickTitle = tiddler.title;//!!! temporary kludge, only support one timer
			config.macros.SimileTimeline.timerId = setTimeout('config.macros.SimileTimeline.tick()',1000);
		}
		data.type = ev.type;
		data.params = ev.params;
		if(ev.source) {
			switch(data.type) {
			case 'XML':
		  		//#Timeline.loadXML("example1.xml", function(xml,url) { ev.source.loadXML(xml,url); });
  				Timeline.loadXMLRemote(data.params,function(xml,url) { if(ev.source) ev.source.loadXML(xml,url); });
				break;
			case 'tiddlerJSON':
		  		Timeline.loadTiddlerJSON(data.params,function(data,url) { if(ev.source) ev.source.loadJSON(data,url); });
				break;
			case 'JSON':
		  		Timeline.loadJSONRemote(data.params,function(data,url) { if(ev.source) ev.source.loadJSON(data,url); });
				break;
			default:
				if(data.type||data.params) {
					Timeline.loadTiddlers(data,function(data,url) { if(ev.source) ev.source.loadTiddlers(data,url); });
				}
				break;
			}
		}
	}
	eventSource.addMany([]);
};

config.macros.SimileTimeline.tick = function()
{
//#displayMessage("tick");
	config.macros.SimileTimeline.timeline.getBand(0).setCenterVisibleDate(new Date());
	if(config.macros.SimileTimeline.timerId)
		config.macros.SimileTimeline.timerId = setTimeout('config.macros.SimileTimeline.tick()',1000);
};

config.macros.SimileTimeline.clearTick = function()
{
//#displayMessage("clearTick");
	if(config.macros.SimileTimeline.timerId)
		clearTimeout(config.macros.SimileTimeline.timerId);
	config.macros.SimileTimeline.timerId = null;
};

config.macros.SimileTimeline.getBandParams = function(title,n,defaultDate)
{
	var t = title;
	var pfx = 'band' + String(n) + '.';
	var width = store.getTiddlerSlice(t,pfx+'width');
//#displayMessage("width"+":"+width);
	if(!width)
		return null;
	var bp = {};
	bp.width = width;
	var intervalUnit = store.getTiddlerSlice(t,pfx+'intervalUnit');
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
	var intervalPixels = store.getTiddlerSlice(t,pfx+'intervalPixels');
	bp.intervalPixels = eval(intervalPixels);
	var date = store.getTiddlerSlice(t,pfx+'date');
	bp.date = date ? Timeline.DateTime.parseGregorianDateTime(date) : defaultDate;
	var showEventText = store.getTiddlerSlice(t,pfx+'showEventText');
	bp.showEventText = showEventText ? eval(showEventText) : true;
	var trackHeight = store.getTiddlerSlice(t,pfx+'trackHeight');
	if(trackHeight)
		bp.trackHeight = eval(trackHeight);
	var trackGap = store.getTiddlerSlice(t,pfx+'trackGap');
	if(trackGap)
		bp.trackGap = eval(trackGap);
	var ret = {};
	var ev = {};
	ev.type = store.getTiddlerSlice(t,pfx+'eventSourceType');
//#displayMessage("eventSourceType"+":"+ev.type);
	ev.params = store.getTiddlerSlice(t,pfx+'eventSourceParams');
//#displayMessage("eventSourceParams"+":"+ev.params);
	var etherPainter = store.getTiddlerSlice(t,pfx+'etherPainter');
	if(etherPainter) {
		var ep = {};
		ep.etherPainter = etherPainter;
		ep.startDate = store.getTiddlerSlice(t,pfx+'etherPainter.startDate');
		ep.multiple = store.getTiddlerSlice(t,pfx+'etherPainter.multiple');
		ret.ep = ep;
	}
	var decorator = store.getTiddlerSlice(t,'decorator');
	if(decorator) {
		var dec = {};
		var pdc = pfx + 'decorator0.';
		dec.decorator = decorator;
		dec.startDate = store.getTiddlerSlice(t,pdc+'startDate');
		dec.endDate = store.getTiddlerSlice(t,pdc+'endDate');
		dec.startLabel = store.getTiddlerSlice(t,pdc+'startLabel');
		dec.endLabel = store.getTiddlerSlice(t,pdc+'endLabel');
		dec.color = store.getTiddlerSlice(t,pdc+'color');
		dec.opacity = store.getTiddlerSlice(t,pdc+'opacity');
		ret.dec = dec;
	}
	var highlight = store.getTiddlerSlice(t,pfx+'highlight');
	ret.highlight = highlight ? eval(highlight) : false;
	ret.ev = ev;
	ret.bp = bp;
	return ret;
};
} // end of 'install only once'
/*}}}*/

/***
!Metadata:
|''Name:''|TiddlyCalendar|
|''Description:''|Tiddlers Calendar and Date picker|
|''Version:''|1.0.0|
|''Date:''|Nov 21, 2007|
|''Source:''|http://sourceforge.net/project/showfiles.php?group_id=150646|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License]]|
|''~CoreVersion:''|2.2.3|
|''Browser:''|Firefox 1.5+; InternetExplorer 6.0|
|''Optional''|DatePlugin|
!Usage:
{{{<<tCalendar [year [month [count]]]>>}}}
{{{<<tCalendar [last [n] | next [n] {year(s) | month(s)}]>>}}}
eg,
{{{<<tCalendar>>}}},
{{{<<tCalendar 2007 10 3>>}}},
{{{<<tCalendar thisyear>>}}},
{{{<<tCalendar last year>>}}},
{{{<<tCalendar next 4 months>>}}}
{{{<<tCalendar lastModified>>}}}
!Revision History:
|''Version''|''Date''|''Note''|
|1.0.1|Dec 20, 2007|Added parameter 'lastModified' control for showing the month calendar including the last modified tiddler|
|1.0.0|Nov 21, 2007|Initial release|
!Code section:
***/
//{{{
version.extensions.tCalendar = {major: 1, minor: 0, revision: 0, date: new Date("Nov 21, 200")};

//# Calendar object
function Calendar()
{
	this.styles = Calendar.styles;

	this.callback = {
		fn: null,
		fnEnable: false,
		option: null,
		params: {date:null, title:null, celldate:null, cellClass:null, dateFmt:null}
	};
	return this;
};

Calendar.locale = 'en';
Calendar[Calendar.locale] = {
	dates: {
		days: ["Su", "M", "Tu", "W", "Th", "F", "Sa"],
		yearFmt: "YYYY",
		monthFmt: "mmm YYYY",
		dateFmt: "MMM DD, YYYY",
		longHolidayFmt: "0DD/0MM/YYYY",
		shortHolidayFmt: "0DD/0MM",
		startOfWeek: 0, /* 0,1*/
		weekends: [true, false, false, false, false, false, true], /* Default: 0 (Sun) and 6 (Sa) are true*/
		holidays: [] /* using short (or long) holidayFmt*/
	}
};

Calendar.styles = '/*{{{*/'
		+ '\ntable.calendarWrapper {border-collapse:collapse; border:2px solid #c6dbff;}'
		+ '\n.calendarWrapper td {border-collapse:collapse; border:1px solid #c6dbff; text-align:center;margin:0; padding:0 0.05em;}'
/*		+ '\ntable.calendar {border-collapse:separate; border:1px solid #c6dbff;}'*/
		+ '\ntable.calendar {border-collapse:collapse; border:0;}'
		+ '\n.calendar tbody, .calendar th, .calendar td, .calendar tr {border:0; text-align:center; font-size:1em; padding:0 0.1em;}'
		+ '\n.calendar th {color:#000; background-color:#c6dbff;}'
		+ '\n#sidebarOptions .calendar td {font-size:0.96em; margin:0; padding:0;}'
		+ '\n#sidebarTabs .calendar td, #mainMenu .calendar td  {padding:0 0.25em;}'
		+ '.calendar .naviBar select {border:0;}'
		+ '\n.calendar .today a {padding:0; border:1px solid blue;}'
		+ '\n.calendar .weekend {background-color:#deeeff;}'
		+ '\n.calendar .hasChanged {font-family:bold; background-color:#fe8; color:darkblue;}'
		+ '\n.calendar .holiday {font-weight:bold; font-size:1.06em; color:red;}'
		+ '\n.datePopup {background:#efffff;}'
		+ '\n.datePopup .isCreated {color:#df6300;}'
		+ '\n.datePopup .isExcluded {filter:alpha(opacity=60); -moz-opacity:0.6; opacity:0.6;}'
/*		+ '.viewer .calendarOptios {display:block;}'*/
		+ '\n/*}}}*/';

Calendar.prototype.getLocale = function()
{
	var locale = config.options.txtLocale ? config.options.txtLocale : Calendar.locale;
	return Calendar[locale] ? locale : 'en';
};

Calendar.prototype.show = function(place, year, month, count)
{
	this.locale=this.getLocale();
	var y, m = new Date().getMonth()+1, c = 1;
	c = isNaN(count) ? (isNaN(year) && isNaN(month) ? c : (!isNaN(year) && isNaN(month) ? 12 : c)) : parseInt(count);
	m = isNaN(month) ? (isNaN(year) ? m : (isNaN(month) ? 1 : parseInt(month))) : parseInt(month);
	y = isNaN(year) ? new Date().getFullYear() : parseInt(year);

	this.dateFmt = (this.callback.params.dateFmt) ? this.callback.params.dateFmt : Calendar[this.locale].dates.dateFmt;

	for (var i=0; i<c; i++){
		var firstDate = new Date(y,m-1+i,1);
		if ((m+i)%12 == 1 || i==0){
			var wrapper = createTiddlyElement(place,'table',null,'calendarWrapper');
			var tbody = createTiddlyElement(wrapper,'tbody');
			if (c > 1 && m==1 && c%12==0){
				this.naviBar(wrapper,tbody,firstDate,true);
			}
		}
		if (i%3 == 0)
			var tr = createTiddlyElement(tbody,'tr',null,'monthRow');
		var td = createTiddlyElement(tr,'td');
		td.vAlign = "top";

		this.selectMonth(td, firstDate);
	}
	if (c>3)
		Calendar.dummyDateCell(tr,(3-c%3)%3,2);
};

Calendar.prototype.selectMonth = function(place, firstDate)
{
	var year = firstDate.getFullYear();

	var calElm = createTiddlyElement(place,'table',null,'calendar');
	var monElm = createTiddlyElement(calElm,'tbody');

	this.naviBar(place,monElm,firstDate);

	if (store.isDirty() || !Calendar.tiddlers)
		Calendar.hashTiddlers(firstDate);

	this.showMonth(monElm, firstDate);
};

Calendar.prototype.naviBar = function(place,monElm,firstDate,isYearView)
{
	var cal = this;
	var monthHeader = createTiddlyElement(createTiddlyElement(monElm,'tr'),'td',null, 'naviBar', null, {colSpan:7});

	var _selectMonthHandler = function(s,date,isYearView){
		if (isYearView){
			cal.show(s.parentNode,date.getFullYear(),1,12);
			removeNode(s);
		} else {
			cal.selectMonth(s, date,cal.dateFmt);
			removeNode(s.firstChild);
		}
	};

	var onchange = function(ev){
		var e = ev ? ev : window.event;
		var date=null;
		for (var i=0, options=this.options; i<this.options.length; i++){
			if (options[i].selected)
				date = new Date(options[i].value);
		}
		_selectMonthHandler.call(this,place,date,isYearView);
		return false;
	};

	var year = firstDate.getFullYear();
	var n = 3;
	var y = isYearView ? year - n : year;
	var m = isYearView ? 0 : new Date(firstDate).getMonth()- n;
	var c = null;
	var options = [];
	var fmt = isYearView ? Calendar[this.locale].dates.yearFmt : Calendar[this.locale].dates.monthFmt;
	for (var i=0; i<n*2+1; i++){
		c= isYearView ? new Date(y+i,1,1) : new Date(y,m+i,1); 
		options.push({caption: c.formatString(fmt), name: c});
	}

	var sel=createTiddlyDropDown(monthHeader,onchange,options,n);
	sel.selectedIndex = n;
};

Calendar.prototype.showMonth = function(monElm, firstDate)
{
	var year = new Date(firstDate).getFullYear();
	var month = new Date(firstDate).getMonth()+1; 
	var lastDate = new Date(year,month,0).getDate();
	var nextFirstDay = new Date(year,month,1).getDay();

	var offset = (7 + firstDate.getDay() - Calendar[this.locale].dates.startOfWeek)%7;
	var	dayHearder = createTiddlyElement(monElm,'tr');
	for (var i=0, ii=0, text=null; i<7; i++){
		ii = (Calendar[this.locale].dates.startOfWeek + i)%7;
		text = Calendar[this.locale].dates.days[ii];
//#		createTiddlyElement(theParent,theElement,theID,theClass,theText,attribs)
		createTiddlyElement(dayHearder,'th',null,null,text); 
	}

	var d=1, dayRow=null, celldate=null, isWeekend = false;
	while (d<=lastDate){
		dayRow = createTiddlyElement(monElm,'tr');

		if (offset > 0)
			Calendar.dummyDateCell(dayRow,offset,6);

		for (var i=offset; i<7 && d <= lastDate; i++, d++){
			celldate = new Date(year, month-1, d);
			isWeekend = Calendar[this.locale].dates.weekends[(i + Calendar[this.locale].dates.startOfWeek)%7];
			this.showDate(dayRow, d, celldate, isWeekend);
		}

		offset=0;
	}
	var n = 7 - (7 + nextFirstDay - Calendar[this.locale].dates.startOfWeek)%7;
	if (n < 7)
		Calendar.dummyDateCell(dayRow,n,6);
};

Calendar.prototype.showDate = function(dayRow, date, celldate, isWeekend)
{
	var now = new Date();
	var dateFmt = this.dateFmt;
	var today = now.formatString(dateFmt);
	var cellClass = 'dateCell';
	var title = celldate.formatString(dateFmt);
	var day = celldate.getDay();
	var isToday = today == title;
	var isHoliday = this.isHoliday(celldate);

	if (isToday)
		cellClass += ' today';
	if (isWeekend)
		cellClass += ' weekend';
	if (isHoliday) 
		cellClass += ' holiday';

	var dateCell=createTiddlyElement(dayRow,'td',null,cellClass);

	var ymd = celldate.convertToLocalYYYYMMDDHHMM().substr(0,8);
	var callback = this.callback;
	var option = callback.option;
	if (!option){
		if (Calendar.tiddlers[ymd]){
			cellClass += ' hasChanged';
			option = 'popup';
		} else {
			option = 'displayTiddler';
		}
	}

	var params = callback.params;
	merge (params,{date:date, title:title, celldate:celldate, cellClass:cellClass, dateFmt:dateFmt});
	if (callback.fn instanceof Function && callback.fnEnable){
		callback.fn(dateCell, params);
	} else
		Calendar.optionHandler(dateCell, option, params, celldate);
};

Calendar.prototype.isHoliday = function(date) 
{
	return Calendar[this.locale].dates.holidays.containsAny([
		date.formatString(Calendar[this.locale].dates.longHolidayFmt),
		date.formatString(Calendar[this.locale].dates.shortHolidayFmt)]);
};

Calendar.dummyDateCell = function (srcElm,n,max)
{
	for (var i=0; i< n && i<max; i++)
		createTiddlyElement(srcElm,'td');
};

Calendar.hashTiddlers = function(date)
{
	if (date)
		var ymd = date.convertToLocalYYYYMMDDHHMM().substr(0,8);
	var isChanged = false;
	var tiddlers = {};

	store.forEachTiddler(function(title, tiddler){
		var modified = tiddler.modified.convertToLocalYYYYMMDDHHMM().substr(0,8);
		var created = tiddler.created.convertToLocalYYYYMMDDHHMM().substr(0,8);

//		if (modified.substr(0,6) == ymd.substr(0,6)){
//			var dd = modified.substr(6,2);
			var extraCellClass = '';
			extraCellClass += (tiddler.modified == tiddler.created) ? ' isCreated' : '';
			extraCellClass += tiddler.isTagged("excludeLists") ? ' isExcluded' : '';
			if (!tiddlers[modified])
				tiddlers[modified]=[];
			tiddlers[modified].push({title:tiddler.title, modified:tiddler.modified, ymd:modified, extraCellClass:extraCellClass});
//		}
	});

	this.tiddlers = tiddlers;
};

Calendar.optionHandler = function(srcElm,option,params,celldate)
{
	var fn = Calendar.optionType[option];
	var action = function(ev) {
		var e = ev ? ev : window.event;
			var fn = Calendar.optionType[option];
		if (fn instanceof Function)
			fn.call(this,e,srcElm,params);
		return false;
	};
//#	createTiddlyButton(parent,text,tooltip,action,className,id,accessKey,attribs);
	createTiddlyButton(srcElm, params.date, params.title, action, params.cellClass, null,null,params);
};

Calendar.optionType = {
	displayTiddler: function(e) {
		story.displayTiddler(null,this.title)
	},
	popup: function(e,daetCell) {
		var celldate = new Date(this.getAttribute('celldate'));
		Calendar.onClickDatePopup(e,daetCell,this.title,celldate);
	},
	pickDate: function(e) {
		Calendar.pickDate.call(this,e);
	}
};

Calendar.onClickDatePopup = function (ev,detaCell,title,celldate)
{
	var e = ev ? ev : window.event;
	if (store.isDirty())
		Calendar.hashTiddlers(celldate);

	var ymd = celldate.convertToLocalYYYYMMDDHHMM().substr(0,8);
	var tiddlers = Calendar.tiddlers[ymd];
	var popup = Popup.create(detaCell,null,'datePopup popup');
	createTiddlyElement(popup,'br');
	this.optionHandler(popup, "displayTiddler", {title:title, date:title});

	if (tiddlers){
		createTiddlyElement(popup,'hr');
		for (var i=0; i<tiddlers.length; i++)
			this.optionHandler(createTiddlyElement(popup,"li"), "displayTiddler",{date:tiddlers[i].title, title:tiddlers[i].title, cellClass:tiddlers[i].extraCellClass});
	}
	Popup.show();
	e.cancelBubble = true;
	if(e.stopPropagation) e.stopPropagation();
	return false;
};

Calendar.pickDate = function(ev)
{
	var e = ev ? ev : window.event;
	var inputId = this.getAttribute('inputId');
	if (inputId){
		var input = document.getElementById(inputId);
		if (input)
			input.value = this.title;
	}
	return false;
};
//}}}
/***
!Initialize Calendar
***/
//{{{
config.shadowTiddlers.CalendarStyle = Calendar.styles;
config.notifyTiddlers.pushUnique({name: 'CalendarStyle', notify: refreshStyles});
var calendar = new Calendar(); /* Create global Calendar object */
var datepicker = new Calendar(); /*Create global Date picker */
//}}}
/***
!Macros
***/
//{{{

config.macros.tCalendar = {
	init: function(){
		var fnEnable = config.options.chkCalendarCallback == undefined ? false : config.options.chkCalendarCallback;
		calendar.callback = {
			fn: this.showDate,
			fnEnable: (window.showDate instanceof Function && fnEnable),
			option: null,
			params: {date: null, dateFmt:null, celldate:null}
		};
	}
};

config.macros.tCalendar.handler = function(place,macroName,params)
{
	this.init();
	var mode = params[2] ? params[2] : (params[1] ? params[1] : params[0]);
	var modeType = params[0];
	var modeCount = isNaN(params[1]) ? 1 : parseInt(params[1]);

	var now = new Date();
	var y = now.getFullYear();
	var m = now.getMonth()+1;
	var c = isNaN(params[1]) ? 1 : parseInt(params[1]);
	switch (mode) {
		case 'month':
		case 'months':
			m = modeType == 'last' ? m - c : m + 1;
			break;
		case 'thisyear':
			m = 1;
			c = 12;
			break;
		case 'year':
		case 'years':
			y = modeType == 'last' ? y - c : y + 1;
			m = 1;
			c = 12 * c;
			break;
		case 'lastModified':
			var lastModified = this.getlastModified();
			y = lastModified.getFullYear();
			m = lastModified.getMonth()+1;
			c = 1;
			break;
		default:
			y = params[0];
			m = params[1];
			c = params[2];
	}
	calendar.show(place,y,m,c);
};

config.macros.tCalendar.showDate = function(dateCell,params)
{
	var isWeekend = (params.cellClass.indexOf('weekend') != -1);
//# For co-working with showDate() of DatePlugin
//#	showDate(place,date,mode,format,linkformat,autostyle,weekend)
	window.showDate(dateCell, params.celldate,'popup','DD',params.dateFmt,true,isWeekend);
};

config.macros.tCalendar.getlastModified = function()
{
	var tiddlers = store.reverseLookup("tags","excludeLists",false,'modified');
	return tiddlers[tiddlers.length-1].modified;
};

config.macros.datePicker = {
	onClick: function(ev) {
		var e = ev ? ev : window.event;
		var inputId = this.getAttribute("inputId");
		var dateFmt = this.getAttribute("dateFmt");
		dateFmt = dateFmt == 'null' ? null : dateFmt; /* For Opera */
		datepicker.callback = {
			fn: null,
			fnEnable: false,
			option: 'pickDate',
			params: {inputId:inputId, dateFmt:dateFmt}
		};

		var popup = Popup.create(this);
		datepicker.show(popup);
		Popup.show();

		e.cancelBubble = true;
		if(e.stopPropagation) e.stopPropagation();
		return false;
	}
};

config.macros.datePicker.handler = function(place,macroName,params)
{
	if (!params) return;
	var id = params[0];
	var dateFmt = params[1] ? params[1] : null;
	var pickParams = {inputId:id, dateFmt:dateFmt};

	var inputElm = createTiddlyElement(place,'input',id);
	var btn = createTiddlyButton(place, '?', 'Date Picker', this.onClick,'datepicker',null,null,pickParams);
};
//}}}

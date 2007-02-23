/***
|''Name:''|CalendarPlugin|
|''Source:''|http://www.TiddlyTools.com/#CalendarPlugin|
|''Author:''|SteveRumsby|
|''License:''|unknown|
|''~CoreVersion:''|2.0.10|

// // updated by Jeremy Sheeley to add cacheing for reminders
// // see http://www.geocities.com/allredfaq/reminderMacros.html
// // ''Changes by ELS 2006.08.23:''
// // added handling for weeknumbers (code supplied by Martin Budden.  see "wn**" comment marks)
// // ''Changes by ELS 2005.10.30:''
// // config.macros.calendar.handler()
// // ^^use "tbody" element for IE compatibility^^
// // ^^IE returns 2005 for current year, FF returns 105... fix year adjustment accordingly^^
// // createCalendarDays()
// // ^^use showDate() function (if defined) to render autostyled date with linked popup^^
// // calendar stylesheet definition
// // ^^use .calendar class-specific selectors, add text centering and margin settings^^


!!!!!Configuration:
<<option chkDisplayWeekNumbers>> Display week numbers //(note: Monday will be used as the start of the week)//
|''First day of week:''|<<option txtCalFirstDay>>|(Monday = 0, Sunday = 6)|
|''First day of weekend:''|<<option txtCalStartOfWeekend>>|(Monday = 0, Sunday = 6)|

!!!!!Syntax:
|{{{<<calendar>>}}}|Produce a full-year calendar for the current year|
|{{{<<calendar year>>}}}|Produce a full-year calendar for the given year|
|{{{<<calendar year month>>}}}|Produce a one-month calendar for the given month and year|
|{{{<<calendar thismonth>>}}}|Produce a one-month calendar for the current month|
|{{{<<calendar lastmonth>>}}}|Produce a one-month calendar for last month|
|{{{<<calendar nextmonth>>}}}|Produce a one-month calendar for next month|

***/
// //Modify this section to change the text displayed for the month and day names, to a different language for example. You can also change the format of the tiddler names linked to from each date, and the colours used.

//{{{
config.macros.calendar = {};

config.macros.calendar.monthnames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
config.macros.calendar.daynames = ["M", "T", "W", "T", "F", "S", "S"];

config.macros.calendar.weekendbg = "#c0c0c0";
config.macros.calendar.monthbg = "#e0e0e0";
config.macros.calendar.holidaybg = "#ffc0c0";

//}}}
// //''Code section:''
// (you should not need to alter anything below here)//
//{{{
if(config.options.txtCalFirstDay == undefined)
  config.options.txtCalFirstDay = 0;
if(config.options.txtCalStartOfWeekend == undefined)
  config.options.txtCalStartOfWeekend = 5;
if(config.options.chkDisplayWeekNumbers == undefined)//wn**
  config.options.chkDisplayWeekNumbers = false;
if(config.options.chkDisplayWeekNumbers)
  config.options.txtCalFirstDay = 0;

config.macros.calendar.tiddlerformat = "0DD/0MM/YYYY";  // This used to be changeable - for now, it isn't// <<smiley :-(>> 

version.extensions.calendar = { major: 0, minor: 6, revision: 0, date: new Date(2006, 1, 22)};
config.macros.calendar.monthdays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

config.macros.calendar.holidays = [ ]; // Not sure this is required anymore - use reminders instead
//}}}

// //Is the given date a holiday?
//{{{
function calendarIsHoliday(date)
{
 var longHoliday = date.formatString("0DD/0MM/YYYY");
 var shortHoliday = date.formatString("0DD/0MM");

 for(var i = 0; i < config.macros.calendar.holidays.length; i++) {
   if(config.macros.calendar.holidays[i] == longHoliday || config.macros.calendar.holidays[i] == shortHoliday) {
     return true;
   }
 }
 return false;
}
//}}}

// //The main entry point - the macro handler.
// //Decide what sort of calendar we are creating (month or year, and which month or year)
// // Create the main calendar container and pass that to sub-ordinate functions to create the structure.
// ELS 2005.10.30: added creation and use of "tbody" for IE compatibility and fixup for year >1900//
// ELS 2005.10.30: fix year calculation for IE's getYear() function (which returns '2005' instead of '105')//
// ELS 2006.05.29: add journalDateFmt handling//
//{{{
config.macros.calendar.handler = function(place,macroName,params)
{
   var calendar = createTiddlyElement(place, "table", null, "calendar", null);
   var tbody = createTiddlyElement(calendar, "tbody", null, null, null);
   var today = new Date();
   var year = today.getYear();
   if (year<1900) year+=1900;
 
   // get format for journal link by reading from SideBarOptions (ELS 5/29/06 - based on suggestion by Martin Budden)
   var text = store.getTiddlerText("SideBarOptions");
   this.journalDateFmt = "DD-MMM-YYYY";
   var re = new RegExp("<<(?:newJournal)([^>]*)>>","mg"); var fm = re.exec(text);
   if (fm && fm[1]!=null) { var pa=fm[1].readMacroParams(); if (pa[0]) this.journalDateFmt = pa[0]; }

   if (params[0] == "thismonth")
  {
      cacheReminders(new Date(year, today.getMonth(), 1, 0, 0), 31);
      createCalendarOneMonth(tbody, year, today.getMonth());
  } 
  else if (params[0] == "lastmonth") {
      var month = today.getMonth()-1; if (month==-1) { month=11; year--; }
      cacheReminders(new Date(year, month, 1, 0, 0), 31);
      createCalendarOneMonth(tbody, year, month);
   }
   else if (params[0] == "nextmonth") {
      var month = today.getMonth()+1; if (month>11) { month=0; year++; }
      cacheReminders(new Date(year, month, 1, 0, 0), 31);
      createCalendarOneMonth(tbody, year, month);
   }
   else {
      if (params[0]) year = params[0];
      if(params[1])
      {
         cacheReminders(new Date(year, params[1]-1, 1, 0, 0), 31);
         createCalendarOneMonth(tbody, year, params[1]-1);
      }
      else
      {
         cacheReminders(new Date(year, 0, 1, 0, 0), 366);
         createCalendarYear(tbody, year);
      }
   }
  window.reminderCacheForCalendar = null;
}
//}}}
//{{{
//This global variable is used to store reminders that have been cached
//while the calendar is being rendered.  It will be renulled after the calendar is fully rendered.
window.reminderCacheForCalendar = null;
//}}}
//{{{
function cacheReminders(date, leadtime)
{
  if (window.findTiddlersWithReminders == null)
    return;
  window.reminderCacheForCalendar = {};
  var leadtimeHash = [];
  leadtimeHash [0] = 0;
  leadtimeHash [1] = leadtime;
  var t = findTiddlersWithReminders(date, leadtimeHash, null, 1);
  for(var i = 0; i < t.length; i++) {
    //just tag it in the cache, so that when we're drawing days, we can bold this one.
     window.reminderCacheForCalendar[t[i]["matchedDate"]] = "reminder:" + t[i]["params"]["title"]; 
  }
}
//}}}
//{{{
function createCalendarOneMonth(calendar, year, mon)
{
  var row = createTiddlyElement(calendar, "tr", null, null, null);
  createCalendarMonthHeader(calendar, row, config.macros.calendar.monthnames[mon] + " " + year, true, year, mon);
  row = createTiddlyElement(calendar, "tr", null, null, null);
  createCalendarDayHeader(row, 1);
  createCalendarDayRowsSingle(calendar, year, mon);
}
//}}}

//{{{
function createCalendarMonth(calendar, year, mon)
{
  var row = createTiddlyElement(calendar, "tr", null, null, null);
  createCalendarMonthHeader(calendar, row, config.macros.calendar.monthnames[mon] + " " + year, false, year, mon);
  row = createTiddlyElement(calendar, "tr", null, null, null);
  createCalendarDayHeader(row, 1);
  createCalendarDayRowsSingle(calendar, year, mon);
}
//}}}

//{{{
function createCalendarYear(calendar, year)
{
  var row;
  row = createTiddlyElement(calendar, "tr", null, null, null);
  var back = createTiddlyElement(row, "td", null, null, null);
  var backHandler = function() {
      removeChildren(calendar);
      createCalendarYear(calendar, year-1);
    };
  createTiddlyButton(back, "<", "Previous year", backHandler);
  back.align = "center";

  var yearHeader = createTiddlyElement(row, "td", null, "calendarYear", year);
  yearHeader.align = "center";
  //yearHeader.setAttribute("colSpan", 19);
  yearHeader.setAttribute("colSpan",config.options.chkDisplayWeekNumbers?22:19);//wn**

  var fwd = createTiddlyElement(row, "td", null, null, null);
  var fwdHandler = function() {
    removeChildren(calendar);
    createCalendarYear(calendar, year+1);
  };
  createTiddlyButton(fwd, ">", "Next year", fwdHandler);
  fwd.align = "center";

  createCalendarMonthRow(calendar, year, 0);
  createCalendarMonthRow(calendar, year, 3);
  createCalendarMonthRow(calendar, year, 6);
  createCalendarMonthRow(calendar, year, 9);
}
//}}}

//{{{
function createCalendarMonthRow(cal, year, mon)
{
  var row = createTiddlyElement(cal, "tr", null, null, null);
  createCalendarMonthHeader(cal, row, config.macros.calendar.monthnames[mon], false, year, mon);
  createCalendarMonthHeader(cal, row, config.macros.calendar.monthnames[mon+1], false, year, mon);
  createCalendarMonthHeader(cal, row, config.macros.calendar.monthnames[mon+2], false, year, mon);
  row = createTiddlyElement(cal, "tr", null, null, null);
  createCalendarDayHeader(row, 3);
  createCalendarDayRows(cal, year, mon);
}
//}}}

//{{{
function createCalendarMonthHeader(cal, row, name, nav, year, mon)
{
  var month;
  if(nav) {
    var back = createTiddlyElement(row, "td", null, null, null);
    back.align = "center";
    back.style.background = config.macros.calendar.monthbg;

/*
    back.setAttribute("colSpan", 2);

    var backYearHandler = function() {
      var newyear = year-1;
      removeChildren(cal);
      cacheReminders(new Date(newyear, mon , 1, 0, 0), 31);
      createCalendarOneMonth(cal, newyear, mon);
    };
    createTiddlyButton(back, "<<", "Previous year", backYearHandler);
*/
    var backMonHandler = function() {
      var newyear = year;
      var newmon = mon-1;
      if(newmon == -1) { newmon = 11; newyear = newyear-1;}
      removeChildren(cal);
      cacheReminders(new Date(newyear, newmon , 1, 0, 0), 31);
      createCalendarOneMonth(cal, newyear, newmon);
    };
    createTiddlyButton(back, "<", "Previous month", backMonHandler);


    month = createTiddlyElement(row, "td", null, "calendarMonthname", name)
//    month.setAttribute("colSpan", 3);
//    month.setAttribute("colSpan", 5);
    month.setAttribute("colSpan", config.options.chkDisplayWeekNumbers?6:5);//wn**

    var fwd = createTiddlyElement(row, "td", null, null, null);
    fwd.align = "center";
    fwd.style.background = config.macros.calendar.monthbg; 

//    fwd.setAttribute("colSpan", 2);
    var fwdMonHandler = function() {
      var newyear = year;
      var newmon = mon+1;
      if(newmon == 12) { newmon = 0; newyear = newyear+1;}
      removeChildren(cal);
      cacheReminders(new Date(newyear, newmon , 1, 0, 0), 31);
      createCalendarOneMonth(cal, newyear, newmon);
    };
    createTiddlyButton(fwd, ">", "Next month", fwdMonHandler);
/*
    var fwdYear = createTiddlyElement(row, "td", null, null, null);
    var fwdYearHandler = function() {
      var newyear = year+1;
      removeChildren(cal);
      cacheReminders(new Date(newyear, mon , 1, 0, 0), 31);
      createCalendarOneMonth(cal, newyear, mon);
    };
    createTiddlyButton(fwd, ">>", "Next year", fwdYearHandler);
*/
  } else {
    month = createTiddlyElement(row, "td", null, "calendarMonthname", name)
    //month.setAttribute("colSpan", 7);
    month.setAttribute("colSpan",config.options.chkDisplayWeekNumbers?8:7);//wn**
  }
  month.align = "center";
  month.style.background = config.macros.calendar.monthbg;
}
//}}}

//{{{
function createCalendarDayHeader(row, num)
{
  var cell;
  for(var i = 0; i < num; i++) {
    if (config.options.chkDisplayWeekNumbers) createTiddlyElement(row, "td");//wn**
    for(var j = 0; j < 7; j++) {
      var d = j + (config.options.txtCalFirstDay - 0);
      if(d > 6) d = d - 7;
      cell = createTiddlyElement(row, "td", null, null, config.macros.calendar.daynames[d]);
      if(d == (config.options.txtCalStartOfWeekend-0) || d == (config.options.txtCalStartOfWeekend-0+1))
        cell.style.background = config.macros.calendar.weekendbg;
    }
  }
}
//}}}

//{{{
function createCalendarDays(row, col, first, max, year, mon)
{
  var i;
  if (config.options.chkDisplayWeekNumbers){
    if (first<=max) {
      var ww = new Date(year,mon,first);
      createTiddlyElement(row, "td", null, null, "w"+ww.getWeek());//wn**
    }
    else createTiddlyElement(row, "td", null, null, null);//wn**
  }
  for(i = 0; i < col; i++) {
    createTiddlyElement(row, "td", null, null, null);
  }
  var day = first;
  for(i = col; i < 7; i++) {
    var d = i + (config.options.txtCalFirstDay - 0);
    if(d > 6) d = d - 7;
    var daycell = createTiddlyElement(row, "td", null, null, null);
    var isaWeekend = ((d == (config.options.txtCalStartOfWeekend-0) || d == (config.options.txtCalStartOfWeekend-0+1))? true:false);

    if(day > 0 && day <= max) {
      var celldate = new Date(year, mon, day);
      // ELS 2005.10.30: use <<date>> macro's showDate() function to create popup
      if (window.showDate) {
        showDate(daycell,celldate,"popup","DD",config.macros.calendar.journalDateFmt,true, isaWeekend); // ELS 5/29/06 - use journalDateFmt 
      } else {
        if(isaWeekend) daycell.style.background = config.macros.calendar.weekendbg;
        var title = celldate.formatString(config.macros.calendar.tiddlerformat);
        if(calendarIsHoliday(celldate)) {
          daycell.style.background = config.macros.calendar.holidaybg;
        }
        if(window.findTiddlersWithReminders == null) {
          var link = createTiddlyLink(daycell, title, false);
          link.appendChild(document.createTextNode(day));
        } else {
          var button = createTiddlyButton(daycell, day, title, onClickCalendarDate);
        }
      }
    }
    day++;
  }
}
//}}}

// //We've clicked on a day in a calendar - create a suitable pop-up of options.
// //The pop-up should contain:
// // * a link to create a new entry for that date
// // * a link to create a new reminder for that date
// // * an <hr>
// // * the list of reminders for that date
//{{{
function onClickCalendarDate(e)
{
  var button = this;
  var date = button.getAttribute("title");
  var dat = new Date(date.substr(6,4), date.substr(3,2)-1, date.substr(0, 2));

  date = dat.formatString(config.macros.calendar.tiddlerformat);
  var popup = createTiddlerPopup(this);
  popup.appendChild(document.createTextNode(date));
  var newReminder = function() {
    var t = store.getTiddlers(date);
    displayTiddler(null, date, 2, null, null, false, false);
    if(t) {
      document.getElementById("editorBody" + date).value += "\n<<reminder day:" + dat.getDate() +
                                                                                         " month:" + (dat.getMonth()+1) +
                                                                                         " year:" + (dat.getYear()+1900) + " title: >>";
    } else {
      document.getElementById("editorBody" + date).value = "<<reminder day:" + dat.getDate() +
                                                                                       " month:" + (dat.getMonth()+1) +
                                                                                       " year:" + (dat.getYear()+1900) + " title: >>";
    }
  };
  var link = createTiddlyButton(popup, "New reminder", null, newReminder); 
  popup.appendChild(document.createElement("hr"));

  var t = findTiddlersWithReminders(dat, [0,14], null, 1);
  for(var i = 0; i < t.length; i++) {
    link = createTiddlyLink(popup, t[i].tiddler, false);
    link.appendChild(document.createTextNode(t[i].tiddler));
  }
}
//}}}

//{{{
function calendarMaxDays(year, mon)
{
 var max = config.macros.calendar.monthdays[mon];
 if(mon == 1 && (year % 4) == 0 && ((year % 100) != 0 || (year % 400) == 0)) {
 max++;
 }
 return max;
}
//}}}

//{{{
function createCalendarDayRows(cal, year, mon)
{
 var row = createTiddlyElement(cal, "tr", null, null, null);

 var first1 = (new Date(year, mon, 1)).getDay() -1 - (config.options.txtCalFirstDay-0);
 if(first1 < 0) first1 = first1 + 7;
 var day1 = -first1 + 1;
 var first2 = (new Date(year, mon+1, 1)).getDay() -1 - (config.options.txtCalFirstDay-0);
 if(first2 < 0) first2 = first2 + 7;
 var day2 = -first2 + 1;
 var first3 = (new Date(year, mon+2, 1)).getDay() -1 - (config.options.txtCalFirstDay-0);
 if(first3 < 0) first3 = first3 + 7;
 var day3 = -first3 + 1;

 var max1 = calendarMaxDays(year, mon);
 var max2 = calendarMaxDays(year, mon+1);
 var max3 = calendarMaxDays(year, mon+2);

 while(day1 <= max1 || day2 <= max2 || day3 <= max3) {
 row = createTiddlyElement(cal, "tr", null, null, null);
 createCalendarDays(row, 0, day1, max1, year, mon); day1 += 7;
 createCalendarDays(row, 0, day2, max2, year, mon+1); day2 += 7;
 createCalendarDays(row, 0, day3, max3, year, mon+2); day3 += 7;
 }
}
//}}}

//{{{
function createCalendarDayRowsSingle(cal, year, mon)
{
 var row = createTiddlyElement(cal, "tr", null, null, null);

 var first1 = (new Date(year, mon, 1)).getDay() -1 - (config.options.txtCalFirstDay-0);
 if(first1 < 0) first1 = first1+ 7;
 var day1 = -first1 + 1;
 var max1 = calendarMaxDays(year, mon);

 while(day1 <= max1) {
 row = createTiddlyElement(cal, "tr", null, null, null);
 createCalendarDays(row, 0, day1, max1, year, mon); day1 += 7;
 }
}
//}}}

// //ELS 2005.10.30: added styles
//{{{
setStylesheet(".calendar, .calendar table, .calendar th, .calendar tr, .calendar td { text-align:center; } .calendar, .calendar a { margin:0px !important; padding:0px !important; }", "calendarStyles");
//}}}


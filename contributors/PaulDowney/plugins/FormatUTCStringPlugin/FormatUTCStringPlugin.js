/***
|''Name:''|FormatUTCStringPlugin|
|''Description:''|UTC version of core formatString|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/FormatUTCStringPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

***/

//{{{

// Substitute UTC date components into a string
// might be neater to parse the timezone from the formatString, e.g. "0hh:0mm UTC"
Date.prototype.formatUTCString = function(template)
{
        var t = template.replace(/0hh12/g,String.zeroPad(this.getUTCHours12(),2));
        t = t.replace(/hh12/g,this.getUTCHours12());
        t = t.replace(/0hh/g,String.zeroPad(this.getUTCHours(),2));
        t = t.replace(/hh/g,this.getUTCHours());
        t = t.replace(/mmm/g,config.messages.dates.shortMonths[this.getUTCMonth()]);
        t = t.replace(/0mm/g,String.zeroPad(this.getUTCMinutes(),2));
        t = t.replace(/mm/g,this.getUTCMinutes());
        t = t.replace(/0ss/g,String.zeroPad(this.getUTCSeconds(),2));
        t = t.replace(/ss/g,this.getUTCSeconds());
        t = t.replace(/[ap]m/g,this.getUTCAmPm().toLowerCase());
        t = t.replace(/[AP]M/g,this.getUTCAmPm().toUpperCase());
        t = t.replace(/wYYYY/g,this.getUTCYearForWeekNo());
        t = t.replace(/wYY/g,String.zeroPad(this.getUTCYearForWeekNo()-2000,2));
        t = t.replace(/YYYY/g,this.getUTCFullYear());
        t = t.replace(/YY/g,String.zeroPad(this.getUTCFullYear()-2000,2));
        t = t.replace(/MMM/g,config.messages.dates.months[this.getUTCMonth()]);
        t = t.replace(/0MM/g,String.zeroPad(this.getUTCMonth()+1,2));
        t = t.replace(/MM/g,this.getUTCMonth()+1);
        t = t.replace(/0WW/g,String.zeroPad(this.getUTCWeek(),2));
        t = t.replace(/WW/g,this.getUTCWeek());
        t = t.replace(/DDD/g,config.messages.dates.days[this.getUTCDay()]);
        t = t.replace(/ddd/g,config.messages.dates.shortDays[this.getUTCDay()]);
        t = t.replace(/0DD/g,String.zeroPad(this.getUTCDate(),2));
        t = t.replace(/DDth/g,this.getUTCDate()+this.dayUTCSuffix());
        t = t.replace(/DD/g,this.getUTCDate());
        var tz = this.getTimezoneOffset();
        var atz = Math.abs(tz);
        t = t.replace(/TZD/g,(tz < 0 ? '+' : '-') + String.zeroPad(Math.floor(atz / 60),2) + ':' + String.zeroPad(atz % 60,2));
        t = t.replace(/\\/g,"");
        return t;
};

Date.prototype.getUTCWeek = function()
{
        var dt = new Date(this.getTime());
        var d = dt.getDay();
        if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
        dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week to calculate weekNo
        var n = Math.floor((dt.getTime()-new Date(dt.getFullYear(),0,1)+3600000)/86400000);
        return Math.floor(n/7)+1;
};

Date.prototype.getUTCYearForWeekNo = function()
{
        var dt = new Date(this.getTime());
        var d = dt.getUTCDay();
        if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
        dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week
        return dt.getUTCFullYear();
};

Date.prototype.getUTCHours12 = function()
{
        var h = this.getUTCHours();
        return h > 12 ? h-12 : ( h > 0 ? h : 12 );
};

Date.prototype.getUTCAmPm = function()
{
        return this.getUTCHours() >= 12 ? config.messages.dates.pm : config.messages.dates.am;
};

Date.prototype.dayUTCSuffix = function()
{
        return config.messages.dates.daySuffixes[this.getUTCDate()-1];
};

//}}}

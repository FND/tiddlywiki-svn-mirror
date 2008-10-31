// Substitute date components into a string
Date.prototype.formatString = function(template)
{
	var zeroPad = function(n,d) {
		var s = n.toString();
		if(s.length < d)
			s = "0000".substr(0,d-s.length) + s;
		return s;
	};
	var h = this.getHours();
	var h12 = h > 12 ? h-12 : ( h > 0 ? h : 12 );
	var amPm = h >= 12 ? jw.locale.dates.pm : jw.locale.dates.am;

	var t = template.replace(/0hh12/g,zeroPad(h12,2));
	t = t.replace(/hh12/g,h12);
	t = t.replace(/0hh/g,zeroPad(h,2));
	t = t.replace(/hh/g,h);
	t = t.replace(/0mm/g,zeroPad(this.getMinutes(),2));
	t = t.replace(/mm/g,this.getMinutes());
	t = t.replace(/0ss/g,zeroPad(this.getSeconds(),2));
	t = t.replace(/ss/g,this.getSeconds());
	t = t.replace(/[ap]m/g,amPm.toLowerCase());
	t = t.replace(/[AP]M/g,amPm.toUpperCase());
	t = t.replace(/wYYYY/g,this.getYearForWeekNo());
	t = t.replace(/wYY/g,zeroPad(this.getYearForWeekNo()-2000,2));
	t = t.replace(/YYYY/g,this.getFullYear());
	t = t.replace(/YY/g,zeroPad(this.getFullYear()-2000,2));
	t = t.replace(/MMMM/g,jw.locale.dates.months[this.getMonth()]);
	t = t.replace(/MMM/g,jw.locale.dates.shortMonths[this.getMonth()]);
	t = t.replace(/0MM/g,zeroPad(this.getMonth()+1,2));
	t = t.replace(/MM/g,this.getMonth()+1);
	t = t.replace(/0WW/g,zeroPad(this.getWeek(),2));
	t = t.replace(/WW/g,this.getWeek());
	t = t.replace(/DDDD/g,jw.locale.dates.days[this.getDay()]);
	t = t.replace(/DDD/g,jw.locale.dates.shortDays[this.getDay()]);
	t = t.replace(/0DD/g,zeroPad(this.getDate(),2));
	t = t.replace(/DDth/g,this.getDate()+jw.locale.dates.daySuffixes[this.getDate()-1]);
	t = t.replace(/DD/g,this.getDate());
	var tz = this.getTimezoneOffset();
	var atz = Math.abs(tz);
	t = t.replace(/TZD/g,(tz < 0 ? '+' : '-') + zeroPad(Math.floor(atz / 60),2) + ':' + zeroPad(atz % 60,2));
	t = t.replace(/\\/g,"");
	return t;
};

Date.prototype.getWeek = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
	dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week to calculate weekNo
	var n = Math.floor((dt.getTime()-new Date(dt.getFullYear(),0,1)+3600000)/86400000);
	return Math.floor(n/7)+1;
};

Date.prototype.getYearForWeekNo = function()
{
	var dt = new Date(this.getTime());
	var d = dt.getDay();
	if(d==0) d=7;// JavaScript Sun=0, ISO Sun=7
	dt.setTime(dt.getTime()+(4-d)*86400000);// shift day to Thurs of same week
	return dt.getFullYear();
};


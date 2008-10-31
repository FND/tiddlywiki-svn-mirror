// Substitute date components into a string

// ISO 8601 date format is YYYY-MM-DDThh:mm:ss
// Smaller units can be ommitted if zero or not required
// This equates to a format string of 'YYYY-0MM-0DDThh:mm:ss'

Date.prototype.toIso8601 = function()
{
	return this.formatString('YYYY-0MM-0DDThh:mm');
};

Date.fromIso8601 = function(d)
// Static method to create a date from a ISO 860 format string
// ISO 8601 date format is YYYY-MM-DDThh:mm:ss
// hh,mm and ss are optional and will be set to zero if not specified
{
	var hh = d.substr(11,2) || '0';
	var mm = d.substr(14,2) || '0';
	var ss = d.substr(17,2) || '0';
	return new Date(Date.UTC(parseInt(d.substr(0,4),10),
			parseInt(d.substr(5,2),10)-1,
			parseInt(d.substr(8,2),10),
			parseInt(hh,10),
			parseInt(mm,10),
			parseInt(ss,10),0));
};

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


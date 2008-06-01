/***
|''Name:''|YYYYMMDDHHMMSSMMMPlugin|
|''Description:''|Supply possibly missing convertFromYYYYMMDDHHMMSSMMM Date function|
|''Author:''|PaulDowney (psd (at) osmosoft (dot) com)|
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/contributors/PaulDowney/plugins/YYYYMMDDHHMMSSMMMPlugin.js |
|''Version:''|0.1|
|''License:''|[[BSD open source license]]|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''~CoreVersion:''|2.2|

***/

//{{{
	// Static method to create a date from a UTC YYYYMMDDHHMMSSMMM format string
	Date.convertFromYYYYMMDDHHMMSSMMM = function(d)
	{
		d = d?d.replace(/[^0-9]/g, ""):""; 
		return new Date(Date.UTC(parseInt(d.substr(0,4),10),
				parseInt(d.substr(4,2),10)-1,
				parseInt(d.substr(6,2),10),
				parseInt(d.substr(8,2)||"00",10),
				parseInt(d.substr(10,2)||"00",10),
				parseInt(d.substr(12,2)||"00",10),
				parseInt(d.substr(14,3)||"000",10)));
	};

	// Fix existing core function
	Date.convertFromYYYYMMDDHHMM = function(d)
	{
		d = d?d.replace(/[^0-9]/g, ""):""; 
		return Date.convertFromYYYYMMDDHHMMSSMMM(d.substr(0,12));
	};

	// Convert a date to UTC YYYYMMDD.HHMMSSMMM string format
	Date.prototype.convertToYYYYMMDDHHMMSSMMM = function()
	{
		return this.getUTCFullYear() + String.zeroPad(this.getUTCMonth()+1,2) + String.zeroPad(this.getUTCDate(),2) + "." + String.zeroPad(this.getUTCHours(),2) + String.zeroPad(this.getUTCMinutes(),2) + String.zeroPad(this.getUTCSeconds(),2) + String.zeroPad(this.getUTCMilliseconds(),3);
	};

//}}}

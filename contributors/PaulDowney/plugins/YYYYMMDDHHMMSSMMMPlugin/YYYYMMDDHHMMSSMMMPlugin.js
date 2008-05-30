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
if (!Date.convertFromYYYYMMDDHHMMSSMMM){
	// Static method to create a date from a UTC YYYYMMDDHHMMSSMMM format string
	Date.convertFromYYYYMMDDHHMMSSMMM = function(d)
	{
		d = d.replace(/[^0-9]/, ""); 
		var hh = d.substr(8,2) || "00";
		var mm = d.substr(10,2) || "00";
		var ss = d.substr(12,2) || "00";
		var mmm = d.substr(12,2) || "000";
		return new Date(Date.UTC(parseInt(d.substr(0,4),10),
				parseInt(d.substr(4,2),10)-1,
				parseInt(d.substr(6,2),10),
				parseInt(hh,10),
				parseInt(mm,10),
				parseInt(ss,10),
				parseInt(mmm,10)));
	};

} 
//}}}

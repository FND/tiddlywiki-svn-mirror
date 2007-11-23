/***
|''Name:''|WebDavLib|
|''Description:''|WebDav utility functions|
|''Author:''|Saq Imtiaz ( lewcid@gmail.com )|
|''Version:''|0.1|
|''Date:''|23/11/2007|
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion:''|2.2.3|

***/
// /%
//!BEGIN-PLUGIN-CODE
if (!DAV){
DAV = {
	run : function(type,u,data,cb,params,headers){
		var callback = function(status,params,responseText,url,xhr) {
			url = url.indexOf("nocache=") < 0 ? url : url.substring(0,url.indexOf("nocache=")-1);
			if(params.length){
				params.shift().apply(this,[status,params,responseText,url,xhr]);
			}
		};	
		params = params||[];
		params.unshift(cb);		
		var r = doHttp.apply(this,[type,u,data,null,null,null,callback,params,headers]);
		if (typeof r == "string")
			alert(r);
		return r;
	},
	
	get : function(url,cb,params){
		return DAV.run("GET",url,null,cb,params,null);
	},

	put : function(url,cb,params,data) {
		return DAV.run("PUT",url,data,cb,params,null);
	},

	move : function(url,cb,params,destination) {
		return DAV.run("MOVE",url,null,cb,params,{"Destination":destination,"Overwrite":"T"});
	}, 

	copy : function(url,cb,params,destination) {
		return DAV.run("COPY",url,null,cb,params,{"Destination":destination,"Overwrite":"T","Depth":0});
	},
	
	propfind : function(url,cb,params,prop,depth){	// !!!
		var xml = '<?xml version="1.0" encoding="UTF-8" ?>' +
			'<D:propfind xmlns:D="DAV:">' +
			'<D:prop>'+
			'<D:'+prop+'/>'+
			'</D:prop>'+
			'</D:propfind>';
		return DAV.run("PROPFIND",url,xml,cb,params,{"Content-type":"text/xml","Depth":depth?depth:0});
	},
	
	makeDir : function(url,cb,params){
		return DAV.run("MKCOL",url,null,cb,params,null);
	},

	options : function(url,cb,params){
		return DAV.run("OPTIONS",url,null,cb,params,null);
	},
	
	safeput : function(url,cb,params,data){
		firstcb = function(status,p,responseText,u,xhr){
			if(status)
				DAV.move(u,cb,p,u.replace("-davsavingtemp",""));
			else
				cb.apply(firstcb,arguments);
		};
		return DAV.put(url+"-davsavingtemp",firstcb,params,data);
	}	
};
}
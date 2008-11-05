/***
|''Name''|HTTPThrottlingPlugin|
|''Description''|limit the amount of simultaneous XMLHttpRequests|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@beta@@|
|''Source''|http://devpad.tiddlyspot.com/#HTTPThrottlingPlugin|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''CoreVersion''|2.4.1|
!Revision History
!!v0.1 (2008-11-05)
* initial release
!To Do
* use queuing instead of polling
!Code
***/
//{{{
if(!version.extensions.HTTPThrottlingPlugin) { //# ensure that the plugin is only installed once
version.extensions.HTTPThrottlingPlugin = { installed: true };

if(!config.extensions) { config.extensions = {}; }

config.extensions.HTTPThrottlingPlugin = {
	XHRCount: 0,
	throttleAmount: 5,
	throttleDelay: 1000,

	init: function() {
		// hijack httpReq to throttle simultaneous XHRs
		var httpReq_orig = httpReq;
		httpReq = function(type, url, callback, params, headers, data, contentType, username, password, allowCache) {
			var context = config.extensions.HTTPThrottlingPlugin;
			if(context.XHRCount >= context.throttleAmount) {
				var defer = function() {
					return httpReq(type, url, callback, params, headers, data, contentType, username, password, allowCache);
				};
				setTimeout(defer, context.throttleDelay);
			} else {
				context.XHRCount++;
				var callbackWrapper = function(status, params, responseText, url, x) {
					context.XHRCount--;
					return callback(status, params, responseText, url, x);
				};
				var args = [type, url, callbackWrapper, params, headers, data, contentType, username, password, allowCache];
				return httpReq_orig.apply(this, args);
			}
		};
	}
};

config.extensions.HTTPThrottlingPlugin.init();

} //# end of "install only once"
//}}}

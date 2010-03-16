/*
Copyright (c) 2010, Ribbit / BT Group PLC
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

Redistributions of source code must retain the above copyright notice, 
this list of conditions and the following disclaimer.
Redistributions in binary form must reproduce the above copyright notice, this 
list of conditions and the following disclaimer in the documentation and/or other 
materials provided with the distribution.

Neither the name of BT Group PLC, Ribbit Corporation, nor the names of its contributors 
may be used to endorse or promote products derived from this software without specific prior 
written permission

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES 
OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT 
SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, 
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT 
OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) 
HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR 
TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, 
 EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/**
 *
 * Ribbit is a first class object added to Javascript
 *
 * Whenever you want to use the Ribbit Library, you should start with<pre>Ribbit.init("consumerKey");</pre>
 * 
 * @class All your interactions with Ribbit will be through the Ribbit object
 */
var Ribbit = {};
/**
 * The URL of the Ribbit server
 * 
 * 
 * @public
 */
Ribbit.endpoint = 'https://rest.ribbit.com/rest/1.0/';
/**
 * Determines whether to use JSONP to make requests to the Ribbit Server. Using XmlHttpRequest is only available when the host web application is running off a file uri
 * 
 * 
 * @public
 */
Ribbit.useJsonp = window.location.toString().substr(0, 4) === "http";
//Ribbit.useJsonp = true;
/**
 * An array that holds functions for marshalling JSONP callbacks  
 * @private
 */
Ribbit.jsonpCallbacks = [];
/**
 * A function called when JSONP scripts are injected 
 * @private
 */
Ribbit.marshalJsonpCallback = function(callbackId, responseStatus, responseText, responseLocation) {
	var c = parseInt(callbackId, 10);
	var f = Ribbit.jsonpCallbacks[c];
	var d = document.getElementById(f.id);
	var e = document.getElementsByTagName('head')[0];
	e.removeChild(d);
	f.callback(responseStatus, Ribbit.Util.html_entity_decode(responseText === null ? "" : responseText), responseLocation);
	Ribbit.jsonpCallbacks[c] = null;
};
/**
 * Sets whether calls to the Ribbit Platform are synchronous or asynchronous. Synchronous calls require the host web application to run from a file uri.
 * 
 * If this value is set to true, most calls will require a callback function to specified, that will be invoked, and returned a value,
 * 
 * @public
 */
Ribbit.asynchronous = true;
/**
 * Whether there is a currently logged in user
 * 
 * @public
 */
Ribbit.isLoggedIn = false;
/**
 * The globally unique id of the currently logged on user
 * 
 * @public
 */
Ribbit.userId = null;
/**
 * The name the current user logged on with
 * 
 * @public
 */
Ribbit.username = null;
/**
 * A developer application id
 * 
 * @public
 */
Ribbit.applicationId = null;
/**
 * The domain in which a developer application runs 
 * 
 * @public
 */
Ribbit.domain = "";
/**
 * The OAuth consumer token you got for your application from http://developer.ribbit.com
 * @private
 */
Ribbit.consumerToken = null;
/**
 * The OAuth consumer secret you got for your application from http://developer.ribbit.com
 * This should NOT be used for 2 legged Authentication, when an application runs in the browser over http
 * @private
 */
Ribbit.consumerSecret = null;
/**
 * An OAuth access token provided when the user logged on
 * @private
 */
Ribbit.accessToken = null;
/**
 * An OAuth access secret provided when the user logged 
 * @private
 */
Ribbit.accessSecret = '';
Ribbit.accessTokenExpired = function() {
	return;
};
Ribbit.accessTokenAllocatedTime = null;
Ribbit.accessTokenLastUsedTime = null;
Ribbit.accessTokenIdleExpiry = 59 * 60 * 1000;
Ribbit.accessTokenExpiry = (23 * 60 * 60 * 1000) + Ribbit.accessTokenIdleExpiry;
Ribbit.checkStoredSession = function() {
	var c = Ribbit.readCookie();
	if (c.accessToken) {
		Ribbit.accessToken = c.accessToken;
		Ribbit.startSessionCheckTimer();
	}
	if (c.accessSecret) {
		Ribbit.accessSecret = c.accessSecret;
	}
	if (c.accessTokenAllocatedTime) {
		Ribbit.accessTokenAllocatedTime = c.accessTokenAllocatedTime;
	}
	if (c.accessTokenLastUsedTime) {
		Ribbit.accessTokenLastUsedTime = c.accessTokenLastUsedTime;
	}
	if (c.requestToken) {
		Ribbit.requestToken = c.requestToken;
	}
	if (c.requestSecret) {
		Ribbit.requestSecret = c.requestSecret;
	}
	if (c.requestCallback && Ribbit.asynchronous) {
		Ribbit.requestCallback = c.requestCallback;
	}
	if (c.applicationId) {
		Ribbit.applicationId = c.applicationId;
	}
	if (c.domain) {
		Ribbit.domain = c.domain;
	}
	if (c.userId) {
		Ribbit.userId = c.userId;
	}
	if (c.username) {
		Ribbit.username = c.username;
	}
	Ribbit.isLoggedIn = Ribbit.userId !== null;
	if (c.endpoint) {
		Ribbit.endpoint = c.endpoint;
	}
	if (c.consumerToken) {
		Ribbit.consumerToken = c.consumerToken;
	}
	if (c.consumerSecret) {
		Ribbit.consumerSecret = c.consumerSecret;
	}
	if (c.asynchronous) {
		Ribbit.asynchronous = c.asynchronous;
	}
};
Ribbit.saveCookie = function() {
	var v = {
		accessToken: Ribbit.accessToken,
		accessTokenAllocatedTime: Ribbit.accessTokenAllocatedTime,
		accessTokenLastUsedTime: Ribbit.accessTokenLastUsedTime,
		accessSecret: Ribbit.accessSecret,
		requestToken: Ribbit.requestToken,
		requestSecret: Ribbit.requestSecret,
		requestCallback: Ribbit.requestCallback,
		domain: Ribbit.domain,
		applicationId: Ribbit.applicationId,
		userId: Ribbit.userId,
		username: Ribbit.username,
		endpoint: Ribbit.endpoint,
		consumerToken: Ribbit.consumerToken,
		consumerSecret: Ribbit.consumerSecret,
		asynchronous: Ribbit.asynchronous
	};
	Ribbit.sessionStorage(Ribbit.cookie + "=" + Ribbit.Util.JSON.stringify(v) + "; path=/");
};
Ribbit.sessionStorage = function(v) {
	try {
		if (window && window.sessionStorage) {
			if (Ribbit.Util.isSet(v)) {
				sessionStorage.ribbitSession = v;
			} else if (!Ribbit.Util.isSet(sessionStorage.ribbitSession)) {
				sessionStorage.ribbitSession = "";
			}
			return sessionStorage.ribbitSession;
		} else if (window && window.localStorage) {
			if (Ribbit.Util.isSet(v)) {
				localStorage.ribbitSession = v;
			} else if (!Ribbit.Util.isSet(localStorage.ribbitSession)) {
				localStorage.ribbitSession = "";
			}
			return localStorage.ribbitSession;
		}
	}
	catch(e) {}
	if (Ribbit.Util.isSet(v)) {
		document.cookie = v;
	}
	return document.cookie;
};
Ribbit.readCookie = function() {
	var n = Ribbit.cookie + "=";
	var cks = [];
	cks = Ribbit.sessionStorage().toString().split(";");
	var v = '{}';
	for (var i = 0; i < cks.length; i++) {
		var ck = cks[i];
		while (ck.charAt(0) === " ") {
			ck = ck.substring(1, ck.length);
		}
		if (ck.indexOf(n) === 0) {
			v = ck.substring(n.length, ck.length);
		}
	}
	return Ribbit.Util.JSON.parse(v);
};
/**
 * Use the init function to initialize the Ribbit object. 
 *
 * Normally for a Javascript application you will only supply a token, which requires the application to be configured for two legged authentication.
 * 
 * @param token string: The consumer token you got for your application from http://developer.ribbit.com (required)
 * @param appId string: The application id you got for your application from http://developer.ribbit.com (optional)
 * @param domain string: The domain to which your application belongs, also found at http://developer.ribbit.com (option)
 * @param secret string: The consumer secret you got for your application from http://developer.ribbit.com (not required for 2 Legged Authentication)
 * @param synchronous bool: True if you are using Javascript in a synchronous manner (only from a file URI, defaults to false)
 * @return void
 * @function
 * 
 */
Ribbit.init = function(token, appId, domain, secret, synchronous) {
	if (synchronous && Ribbit.useJsonp) {
		throw new Ribbit.RibbitException("You can only use the Ribbit Javascript library synchronously when running off a file URI");
	}
	if (!document.getElementsByTagName('head')[0]) {
		throw new Ribbit.RibbitException("The Ribbit Javascript library requires your document to have a <head> element");
	}
	Ribbit.consumerToken = token;
	Ribbit.applicationId = appId;
	Ribbit.domain = domain;
	Ribbit.consumerSecret = secret;
	Ribbit.asynchronous = !synchronous;
	Ribbit.saveCookie();
};
/**
 * Initialize the Ribbit object with Consumer Key and Secret to use 3 Legged OAuth.
 * 
 * @param token string: The consumer token you got for your application in the Ribbit Mobile domain from http://developer.ribbit.com (required)
 * @param secret string: The consumer secret you got for your application in the Ribbit Mobile domain from http://developer.ribbit.com (required)
 * @param synchronous bool: True if you are using Javascript in a synchronous manner (only from a file URI, defaults to false)
 * @return void
 * @function
 * 
 */
Ribbit.init3Legged = function(token, secret, synchronous) {
	Ribbit.init(token, null, null, secret, synchronous);
};
/**
 * Use this function to explicitly set access tokens 
 * 
 * @public
 * @function
 * @param userId string: The user id.
 * @param userName string: The user login value
 * @param accessToken string: A valid access token
 * @param accessSecret string: A valid access secret
 * @return void
 */
Ribbit.setUser = function(userId, userName, accessToken, accessSecret) {
	Ribbit.userId = userId;
	Ribbit.username = userName;
	Ribbit.accessToken = accessToken;
	Ribbit.accessSecret = accessSecret;
};
/**
 * Get details about the currently logged on user
 *
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @public
 * @function
 * @return object: an object containing details about the User, or null if there is no user
 */
Ribbit.getUser = function(callback) {
	if (Ribbit.isLoggedIn) {
		return Ribbit.Users().getUser(callback, Ribbit.userId);
	} else {
		if (Ribbit.asynchronous && (callback !== undefined)) {
			callback(null);
		} else {
			return null;
		}
	}
};
/**
 * The exec function allows you to make calls by supplying an object describing the request
 *
 * An object must be supplied that contains a resource, a method, an object which contains parameters, and a callback function.
 *
 * For example:
 * <pre>
 * Ribbit.exec({
 *		resource:"Users",
 *		method:"getUser",
 *		params:{
 *			userId="1234******"
 *			},
 *		callback: function(val){
 *			if ( ! val.hasError ){
 *				alert("Hello" + val.firstName);
 *			}
 *		});		
 * </pre>
 * 
 * @param requestObject object: An object that describes the request to be performed, containing a resource, method, an object of params, and a callback function(required)
 * @return mixed the result of the operation. 
 * @function
 * 
 */
Ribbit.exec = function(requestObject) {
	if (!requestObject.params || typeof requestObject.params !== "object") {
		requestObject.params = {};
	}
	for (var r in Ribbit) {
		if (typeof Ribbit[r] === "function" && requestObject.resource === r) {
			var res = Ribbit[r]();
			if (res[requestObject.method]) {
				methodToExecute = res[requestObject.method];
				ps = requestObject.params;
				for (var parameter in ps) {
					if (typeof ps[parameter] === "object") {
						switch (parameter) {
						case "record":
							if (typeof ps[parameter] !== "Ribbit.CallRecordRequest") {
								var file = ps[parameter].file !== null ? ps[parameter].file : false;
								var append = ps[parameter].append !== null ? ps[parameter].append : false;
								var stoptones = ps[parameter].stoptones !== null ? ps[parameter].stoptones : null;
								var duration = ps[parameter].duration !== null ? ps[parameter].duration : null;
								var flush = ps[parameter].flush !== null ? ps[parameter].flush : null;
								requestObject.params[parameter] = new Ribbit.CallRecordRequest(file, append, flush, duration, stoptones);
							}
							break;
						case "play":
							if (typeof ps[parameter] !== "Ribbit.CallPlayRequest") {
								var media = [];
								for (var i = 0; i < ps[parameter].media.length; i++) {
									var mediaItem = ps[parameter].media[i];
									var type = mediaItem.type !== null ? mediaItem.type : null;
									var value = mediaItem.value !== null ? mediaItem.value : null;
									var offset = mediaItem.offset !== null ? mediaItem.offset : null;
									duration = mediaItem.duration !== null ? mediaItem.duration : null;
									media.push(new Ribbit.CallPlayMedia(type, value, offset, duration));
								}
								var transactionId = ps[parameter].transactionId !== null ? ps[parameter].transactionId : null;
								flush = ps[parameter].flush !== null ? ps[parameter].flush : null;
								stoptones = ps[parameter].stoptones !== null ? ps[parameter].stoptones : null;
								requestObject.params[parameter] = new Ribbit.CallPlayRequest(media, transactionId, stoptones, flush);
							}
							break;
						case "requestDtmf":
							if (typeof ps[parameter] !== "Ribbit.CallLegDtmfRequest") {
								var maxDigits = ps[parameter].maxDigits !== null ? ps[parameter].maxDigits : null;
								var maxInterval = ps[parameter].maxInterval !== null ? ps[parameter].maxInterval : null;
								var timeOut = ps[parameter].timeOut !== null ? ps[parameter].timeOut : null;
								stoptones = ps[parameter].stoptones !== null ? ps[parameter].stoptones : null;
								flush = ps[parameter].flush !== null ? ps[parameter].flush : null;
								requestObject.params[parameter] = new Ribbit.CallLegDtmfRequest(flush, maxDigits, stoptones, timeOut, maxInterval);
							}
							break;
						default:
							break;
						}
					}
				}
				requestObject.params.callback = requestObject.callback;
				return methodToExecute(requestObject.params);
			}
		}
	}
	throw new Ribbit.InvalidArgumentException("cannot find '" + requestObject.resource + "." + requestObject.method + "'");
};
Ribbit.getActiveUserId = function() {
	var s = Ribbit.userId;
	var h = Ribbit.customHeaders();
	for (var i = 0; i < h.length; i++) {
		if (h[i][0] === "X-BT-Ribbit-SP-UserId") {
			s = h[i][1];
			break;
		}
	}
	return s;
};
/**
 * This method is provided to enable you to inspect messages that get sent. Overwrite it with a new function to do whatever you feel
 *
 * Use this as follows
 * <pre>
 *	Ribbit.log = function(data){
 *		console.log(data); // dump the log into a console
 *	}
 * </pre>
 * @public
 * @function
 */
Ribbit.log = function(data) {};
Ribbit.respond = function(callback, response) {
	if (Ribbit.asynchronous) {
		if (callback) {
			callback(response);
		}
	} else {
		return response;
	}
};
Ribbit.checkParameterErrors = function(callback, exceptions) {
	var e = new Ribbit.InvalidArgumentException(exceptions.toString());
	return Ribbit.respond(callback, e);
};
/**
 * Gets a new instance of RibbitSignedRequest
 * 
 * @return RibbitSignedRequest 
 * @private
 * @function
 * 
 */
Ribbit.signedRequest = function() {
	if (Ribbit.consumerToken !== null) {
		return new Ribbit.RibbitSignedRequest();
	} else {
		throw new Ribbit.TokenRequiredException();
	}
};
/**
 * Create a URL that may be streamed by a media player, by appending an OAuth header in the query string.
 * 
 * @function
 * @public
 * @param file A filename, used in conjuction with a folder and domain; Or, a relative (eg "media/domain/folder/filename") or full URI 
 * @param folder The folder that the file is in (do not populate if using relative or full URIs)
 * @param file The domain (do not populate if using relative or full URIs), will default from initialization domain value
 * @return A Full URI that can be passed to a Media player
 */
Ribbit.getStreamableUrl = function(file, folder, domain) {
	var uri;
	if (!Ribbit.Util.isValidString(file)) {
		throw new RibbitException("At least file must be specified");
	}
	file = Ribbit.Util.trim(file);
	if (!Ribbit.Util.isValidString(folder)) {
		if (file.indexOf(Ribbit.endpoint) === 0) {
			uri = file.substr(Ribbit.endpoint.length, file.length - Ribbit.endpoint.length);
		} else if (file.indexOf("media") === 0) {
			uri = file;
		} else if (file.indexOf("media") === 1) {
			uri = file.substr(1, file.length - 1);
		}
	} else {
		if (!Ribbit.Util.isValidString(domain)) {
			domain = Ribbit.domain;
		}
		if (!Ribbit.Util.isValidStringIfDefined(domain)) {
			throw new RibbitException("If a folder is specified, domain must be too");
		}
		domain = Ribbit.Util.trim(domain);
		folder = Ribbit.Util.trim(folder);
		domain = domain.indexOf("/") === 0 ? domain.substr(1, domain.length - 1) : domain;
		domain = domain.indexOf("/") === domain.length - 1 ? domain.substr(0, domain.length - 1) : domain;
		folder = folder.indexOf("/") === 0 ? folder.substr(1, folder.length - 1) : folder;
		folder = folder.indexOf("/") === folder.length - 1 ? folder.substr(0, folder.length - 1) : folder;
		file = file.indexOf("/") === 0 ? file.substr(1, file.length - 1) : file;
		file = file.indexOf("/") === file.length - 1 ? file.substr(0, file.length - 1) : file;
		uri = "media" + "/" + domain + "/" + folder + "/" + file;
	}
	return Ribbit.signedRequest().createStreamableUrl(uri);
};
/**
 *
 An Application represents web or desktop clients that can use Ribbit APIs, and which expose Ribbit services to end Users. 
 * Developers can only access certain details of applications that they have created, such as secret keys, using the Developer Portal. 
 * Applications are primarily used to define security credentials for consumer keys and secret keys as required to sign messages to the service. 
 * Applications can also be configured to receive event notifications via HTTP posts from the Ribbit platform to an application specific URL.
 */
/**
 * Provides access to theApplications Resource - normally accessed through Ribbit.Applications()
 *
 * @class Provides access to the Applications Resource
 */
Ribbit.Application = function() {
	return this;
};
/**
 * Filter Applications by Application Id
 */
Ribbit.Application.FILTER_BY_APPLICATION_ID = "id";
/**
 * Filter Applications by Domain
 */
Ribbit.Application.FILTER_BY_DOMAIN = "domain.name";
/**
 * Get application details
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param domain string: The domain to which the Application belongs (optional)
 * @param applicationId string: Globally unique Application identifier. (optional)
 * @return object: an object containing details about the ApplicationResource, or a RibbitException
 */
Ribbit.Application.prototype.getApplication = function(callback, domain, applicationId) {
	function getApplicationCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		domain = a.domain;
		applicationId = a.applicationId;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(applicationId)) {
		exceptions.push("When defined, applicationId must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var applicationIdValue = Ribbit.Util.isSet(applicationId) ? applicationId : Ribbit.applicationId;
	var getApplicationMethodCallback = Ribbit.asynchronous ? getApplicationCallback : null;
	var uri = "apps/" + domainValue + ":" + applicationIdValue;
	var getApplicationResponse = Ribbit.signedRequest().doGet(uri, getApplicationMethodCallback);
	if (!Ribbit.asynchronous) {
		return getApplicationCallback(getApplicationResponse);
	}
};
/**
 * Retrieves details of applications in the same domain as the current application
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Application.prototype.getApplications = function(callback, startIndex, count, filterBy, filterValue) {
	function getApplicationsCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getApplicationsMethodCallback = Ribbit.asynchronous ? getApplicationsCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "apps" + q;
	var getApplicationsResponse = Ribbit.signedRequest().doGet(uri, getApplicationsMethodCallback);
	if (!Ribbit.asynchronous) {
		return getApplicationsCallback(getApplicationsResponse);
	}
};
/**
 * Changes the URL used for event callbacks, can also toggle whether the application supports two legged (desktop) authentication
 * This method is not available through 2 legged authentication, where no consumer secret is used
 * 2 legged authentication is recommended for Browser based apps
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param notificationUrl string: The URL where event notifications are sent.  (optional)
 * @param allow2legged boolean: Whether this Application can use two legged (desktop) authentication (optional)
 * @param domain string: The domain to which the Application belongs (optional)
 * @param applicationId string: Globally unique Application identifier. (optional)
 * @return object: an object containing details about the ApplicationResource, or a RibbitException
 */
Ribbit.Application.prototype.updateApplication = function(callback, notificationUrl, allow2legged, domain, applicationId) {
	function updateApplicationCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		notificationUrl = a.notificationUrl;
		allow2legged = a.allow2legged;
		domain = a.domain;
		applicationId = a.applicationId;
		callback = a.callback;
	}
	var exceptions = [];
	if (Ribbit.consumerSecret === null || Ribbit.consumerSecret === "") {
		exceptions.push("updateApplication is not available in two legged authentication mode");
	}
	if (!Ribbit.Util.isSet(notificationUrl) && !Ribbit.Util.isSet(allow2legged) && !Ribbit.Util.isSet(domain) && !Ribbit.Util.isSet(applicationId)) {
		exceptions.push("At least one parameter must be supplied");
	}
	if (!Ribbit.Util.isValidStringIfDefined(notificationUrl)) {
		exceptions.push("When defined, notificationUrl must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(allow2legged)) {
		exceptions.push("When defined, allow2legged must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(applicationId)) {
		exceptions.push("When defined, applicationId must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var applicationIdValue = Ribbit.Util.isSet(applicationId) ? applicationId : Ribbit.applicationId;
	var params = {};
	if (Ribbit.Util.isSet(notificationUrl)) {
		params.notificationUrl = notificationUrl;
	}
	if (Ribbit.Util.isSet(allow2legged)) {
		params.allow2legged = allow2legged;
	}
	var updateApplicationMethodCallback = Ribbit.asynchronous ? updateApplicationCallback : null;
	var uri = "apps/" + domainValue + ":" + applicationIdValue;
	var updateApplicationResponse = Ribbit.signedRequest().doPut(uri, params, updateApplicationMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateApplicationCallback(updateApplicationResponse);
	}
};
/**
 *
 Calls are telephony events between Devices from the point of view of a given User. Calls are initiated by a POST to a User's Call collection, with parameters to represent the source and destination numbers. 
 * Note: Phone numbers must have 'tel:' before the phone number.
 */
/**
 * Provides access to theCalls Resource - normally accessed through Ribbit.Calls()
 *
 * @class Provides access to the Calls Resource
 */
Ribbit.Call = function() {
	return this;
};
/**
 * Use the classic British Text To Speech voice
 */
Ribbit.Call.ANNOUNCE_EN_UK_CLASSIC = "en_UK/classic";
/**
 * Use the classic American Text To Speech voice
 */
Ribbit.Call.ANNOUNCE_EN_US_CLASSIC = "en_US/classic";
/**
 * Filter Calls by Application Id
 */
Ribbit.Call.FILTER_BY_APPLICATION_ID = "application.id";
/**
 * Filter Calls by Domain
 */
Ribbit.Call.FILTER_BY_DOMAIN = "application.domain.name";
/**
 * Filter Calls by User Id
 */
Ribbit.Call.FILTER_BY_USER_ID = "user.guid";
/**
 * Say a set of numbers
 */
Ribbit.Call.MEDIA_TYPE_DIGITS = "digits";
/**
 * Say a length of time
 */
Ribbit.Call.MEDIA_TYPE_DURATION = "duration";
/**
 * Play a media file in format /media/domain/folder/file (.mp3 or .wav)
 */
Ribbit.Call.MEDIA_TYPE_FILE = "file";
/**
 * Say a money amount
 */
Ribbit.Call.MEDIA_TYPE_MONEY = "money";
/**
 * Say a month
 */
Ribbit.Call.MEDIA_TYPE_MONTH = "month";
/**
 * Say a number
 */
Ribbit.Call.MEDIA_TYPE_NUMBER = "number";
/**
 * Say a ranking
 */
Ribbit.Call.MEDIA_TYPE_RANK = "rank";
/**
 * 
 */
Ribbit.Call.MEDIA_TYPE_SPELL = "string";
/**
 * Say a time
 */
Ribbit.Call.MEDIA_TYPE_TIME = "time";
/**
 * Say a week day
 */
Ribbit.Call.MEDIA_TYPE_WEEKDAY = "weekday";
/**
 * Say a year
 */
Ribbit.Call.MEDIA_TYPE_YEAR = "year";
/**
 * The call leg is answered
 */
Ribbit.Call.STATUS_ANSWERED = "ANSWERED";
/**
 * The call leg is connecting
 */
Ribbit.Call.STATUS_CONNECTING = "CONNECTING";
/**
 * The call leg is in error
 */
Ribbit.Call.STATUS_ERROR = "ERROR";
/**
 * The call leg failed to connect
 */
Ribbit.Call.STATUS_FAILURE = "FAILURE";
/**
 * The call leg has hungup
 */
Ribbit.Call.STATUS_HUNGUP = "HUNGUP";
/**
 * The call leg is started
 */
Ribbit.Call.STATUS_STARTED = "STARTED";
/**
 * The call leg has been transferred to another call
 */
Ribbit.Call.STATUS_TRANSFERRED = "TRANSFERRED";
/**
 * The call leg is transferring to another call
 */
Ribbit.Call.STATUS_TRANSFERRING = "TRANSFERRING";
/**
 * Calls may be made to one or more Devices. To connect Calls to PSTN numbers on the production platform, credit must be available in the User's Account to cover the cost of connecting for at least one minute.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param legs string: Device IDs which participate in this call (SIP: or TEL: only) (required)
 * @param callerid string: The number which will be presented when devices are called (optional)
 * @param mode string: The mode of a call or leg describes it's state.  Options are: hold, mute, hangup, talk (optional)
 * @param announce string: The Text to Speech culture to use, available from constants in this class (optional)
 * @return A call identifier, or a RibbitException
 */
Ribbit.Call.prototype.createCall = function(callback, legs, callerid, mode, announce) {
	function createCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		legs = a.legs;
		callerid = a.callerid;
		mode = a.mode;
		announce = a.announce;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isNonEmptyArray(legs)) {
		exceptions.push("legs is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(callerid)) {
		exceptions.push("When defined, callerid must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(mode)) {
		exceptions.push("When defined, mode must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(announce)) {
		exceptions.push("When defined, announce must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.legs = legs;
	if (Ribbit.Util.isSet(callerid)) {
		params.callerid = callerid;
	}
	if (Ribbit.Util.isSet(mode)) {
		params.mode = mode;
	}
	if (Ribbit.Util.isSet(announce)) {
		params.announce = announce;
	}
	var createCallMethodCallback = Ribbit.asynchronous ? createCallCallback : null;
	var uri = "calls/" + userId;
	var createCallResponse = Ribbit.signedRequest().doPost(uri, params, createCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return createCallCallback(createCallResponse);
	}
};
/**
 * Calls may be made between any two Devices. To connect Calls to PSTN numbers on the production platform, credit must be available in the User's Account to cover the cost of connecting for at least one minute.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param source string: Device ID (or alias) from which the Call is made (SIP: or TEL: only) (required)
 * @param dest string: Device IDs to which this Call is made (SIP: or TEL: only) (required)
 * @return A call identifier, or a RibbitException
 */
Ribbit.Call.prototype.createThirdPartyCall = function(callback, source, dest) {
	function createThirdPartyCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		source = a.source;
		dest = a.dest;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(source)) {
		exceptions.push("source is required");
	}
	if (!Ribbit.Util.isNonEmptyArray(dest)) {
		exceptions.push("dest is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.source = source;
	params.dest = dest;
	var createThirdPartyCallMethodCallback = Ribbit.asynchronous ? createThirdPartyCallCallback : null;
	var uri = "calls/" + userId;
	var createThirdPartyCallResponse = Ribbit.signedRequest().doPost(uri, params, createThirdPartyCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return createThirdPartyCallCallback(createThirdPartyCallResponse);
	}
};
/**
 * Once a Call is made the details may be retrieved to show the current status of each Leg. Only the Call owner is able to query the Call details.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @return object: an object containing details about the CallResource, or a RibbitException
 */
Ribbit.Call.prototype.getCall = function(callback, callId) {
	function getCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (Ribbit.Util.isSet(callId)) {
		callId = "" + callId;
	}
	if (!Ribbit.Util.isValidString(callId)) {
		exceptions.push("callId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getCallMethodCallback = Ribbit.asynchronous ? getCallCallback : null;
	var uri = "calls/" + userId + "/" + callId;
	var getCallResponse = Ribbit.signedRequest().doGet(uri, getCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return getCallCallback(getCallResponse);
	}
};
/**
 * The Call history can be retrieved by making a GET on the Call resource.  The result is a collection of Calls.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Call.prototype.getCalls = function(callback, startIndex, count, filterBy, filterValue) {
	function getCallsCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getCallsMethodCallback = Ribbit.asynchronous ? getCallsCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "calls/" + userId + q;
	var getCallsResponse = Ribbit.signedRequest().doGet(uri, getCallsMethodCallback);
	if (!Ribbit.asynchronous) {
		return getCallsCallback(getCallsResponse);
	}
};
/**
 * Transfers a call leg from one call to another. The leg must be answered, and the destination call must be active 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param sourceCallId string: The call id from which the leg should be transferred (required)
 * @param sourceLegId string: The source call leg identifier (required)
 * @param destinationCallId string: The call id to which the leg should be transferred (required)
 * @return boolean: true if the method succeeds, or a RibbitException
 */
Ribbit.Call.prototype.transferLeg = function(callback, sourceCallId, sourceLegId, destinationCallId) {
	function transferLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		sourceCallId = a.sourceCallId;
		sourceLegId = a.sourceLegId;
		destinationCallId = a.destinationCallId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (Ribbit.Util.isSet(sourceCallId)) {
		sourceCallId = "" + sourceCallId;
	}
	if (!Ribbit.Util.isValidString(sourceCallId)) {
		exceptions.push("sourceCallId is required");
	}
	if (!Ribbit.Util.isValidString(sourceLegId)) {
		exceptions.push("sourceLegId is required");
	}
	if (Ribbit.Util.isSet(destinationCallId)) {
		destinationCallId = "" + destinationCallId;
	}
	if (!Ribbit.Util.isValidString(destinationCallId)) {
		exceptions.push("destinationCallId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var transferLegMethodCallback = Ribbit.asynchronous ? transferLegCallback : null;
	var transferLegResponse = Ribbit.Calls().updateCall(transferLegMethodCallback, destinationCallId, sourceCallId + "/" + sourceLegId, null, null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return transferLegCallback(transferLegResponse);
	}
};
/**
 * Updates a call to change the mode of all legs, start and stop call recording, or play media to all the legs. The call must contain at least one active leg.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param id string: Unique numeric Call identifier (optional)
 * @param mode string: The mode of a call or leg describes it's state.  Options are: hold, mute, hangup, talk (optional)
 * @param active boolean: Whether the call is active (optional)
 * @param record CallRecordRequest: An object containing details of the recording request (optional)
 * @param recording boolean: True if recording is active. Set to false to stop recording (optional)
 * @param announce string: The Text to Speech culture to use, available from constants in this class (optional)
 * @param play CallPlayRequest: An object containing details of the recording request (optional)
 * @param playing boolean: True if media is playing. Set to false to stop playing (optional)
 * @return boolean: true if the method succeeds, or a RibbitException
 */
Ribbit.Call.prototype.updateCall = function(callback, callId, id, mode, active, record, recording, announce, play, playing) {
	function updateCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		id = a.id;
		mode = a.mode;
		active = a.active;
		record = a.record;
		recording = a.recording;
		announce = a.announce;
		play = a.play;
		playing = a.playing;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (Ribbit.Util.isSet(callId)) {
		callId = "" + callId;
	}
	if (!Ribbit.Util.isValidString(callId)) {
		exceptions.push("callId is required");
	}
	if (Ribbit.Util.isSet(id)) {
		id = "" + id;
	}
	if (!Ribbit.Util.isValidStringIfDefined(id)) {
		exceptions.push("When defined, id must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(mode)) {
		exceptions.push("When defined, mode must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(active)) {
		exceptions.push("When defined, active must be boolean");
	}
	if (Ribbit.Util.isSet(record)) {
		if (! (record instanceof Ribbit.CallRecordRequest)) {
			exceptions.push("record must be an instance of Ribbit.CallRecordRequest");
		} else {
			if (record.getValidationMessage() !== "") {
				exceptions.push(record.getValidationMessage());
			}
		}
	}
	if (!Ribbit.Util.isBoolIfDefined(recording)) {
		exceptions.push("When defined, recording must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(announce)) {
		exceptions.push("When defined, announce must be a string of one or more characters");
	}
	if (Ribbit.Util.isSet(play)) {
		if (! (play instanceof Ribbit.CallPlayRequest)) {
			exceptions.push("play must be an instance of Ribbit.CallPlayRequest");
		} else {
			if (play.getValidationMessage() !== "") {
				exceptions.push(play.getValidationMessage());
			}
		}
	}
	if (!Ribbit.Util.isBoolIfDefined(playing)) {
		exceptions.push("When defined, playing must be boolean");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	if (Ribbit.Util.isSet(id)) {
		params.id = id;
	}
	if (Ribbit.Util.isSet(mode)) {
		params.mode = mode;
	}
	if (Ribbit.Util.isSet(active)) {
		params.active = active;
	}
	if (Ribbit.Util.isSet(record)) {
		params.record = record.toObject();
	}
	if (Ribbit.Util.isSet(recording)) {
		params.recording = recording;
	}
	if (Ribbit.Util.isSet(announce)) {
		params.announce = announce;
	}
	if (Ribbit.Util.isSet(play)) {
		params.play = play.toObject();
	}
	if (Ribbit.Util.isSet(playing)) {
		params.playing = playing;
	}
	var updateCallMethodCallback = Ribbit.asynchronous ? updateCallCallback : null;
	var uri = "calls/" + userId + "/" + callId;
	var updateCallResponse = Ribbit.signedRequest().doPut(uri, params, updateCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateCallCallback(updateCallResponse);
	}
};
/**
 * Mute all active legs on a call. At least one leg must be active.
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.muteCall = function(callback, callId) {
	function muteCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var muteCallMethodCallback = Ribbit.asynchronous ? muteCallCallback : null;
	var muteCallResponse = Ribbit.Calls().updateCall(muteCallMethodCallback, callId, null, "mute", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return muteCallCallback(muteCallResponse);
	}
};
/**
 * Take all active and muted legs on a call off mute. At least one leg must be active
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.unmuteCall = function(callback, callId) {
	function unmuteCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var unmuteCallMethodCallback = Ribbit.asynchronous ? unmuteCallCallback : null;
	var unmuteCallResponse = Ribbit.Calls().updateCall(unmuteCallMethodCallback, callId, null, "talk", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return unmuteCallCallback(unmuteCallResponse);
	}
};
/**
 * Puts all active legs on a call on hold. At least one leg must be active
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.holdCall = function(callback, callId) {
	function holdCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var holdCallMethodCallback = Ribbit.asynchronous ? holdCallCallback : null;
	var holdCallResponse = Ribbit.Calls().updateCall(holdCallMethodCallback, callId, null, "hold", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return holdCallCallback(holdCallResponse);
	}
};
/**
 * Takes all active and held legs on a call off hold. At least one leg must be active
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.unholdCall = function(callback, callId) {
	function unholdCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var unholdCallMethodCallback = Ribbit.asynchronous ? unholdCallCallback : null;
	var unholdCallResponse = Ribbit.Calls().updateCall(unholdCallMethodCallback, callId, null, "talk", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return unholdCallCallback(unholdCallResponse);
	}
};
/**
 * Terminates the call
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.hangupCall = function(callback, callId) {
	function hangupCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var hangupCallMethodCallback = Ribbit.asynchronous ? hangupCallCallback : null;
	var hangupCallResponse = Ribbit.Calls().updateCall(hangupCallMethodCallback, callId, null, null, false, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return hangupCallCallback(hangupCallResponse);
	}
};
/**
 * Start recording a call. At least one leg must be active.
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param record CallRecordRequest: An object containing details of the recording request (optional)
 */
Ribbit.Call.prototype.recordCall = function(callback, callId, record) {
	function recordCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		record = a.record;
		callback = a.callback;
	}
	var recordCallMethodCallback = Ribbit.asynchronous ? recordCallCallback : null;
	var recordCallResponse = Ribbit.Calls().updateCall(recordCallMethodCallback, callId, null, null, null, record, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return recordCallCallback(recordCallResponse);
	}
};
/**
 * Stop recording a call
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.stopRecordingCall = function(callback, callId) {
	function stopRecordingCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var stopRecordingCallMethodCallback = Ribbit.asynchronous ? stopRecordingCallCallback : null;
	var stopRecordingCallResponse = Ribbit.Calls().updateCall(stopRecordingCallMethodCallback, callId, null, null, null, null, false, null, null, null);
	if (!Ribbit.asynchronous) {
		return stopRecordingCallCallback(stopRecordingCallResponse);
	}
};
/**
 * Play files and/or Text To Speech elements to a call. At least one leg must be active
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param announce string: The Text to Speech culture to use, available from constants in this class (optional)
 * @param play CallPlayRequest: An object containing details of the recording request (optional)
 */
Ribbit.Call.prototype.playMediaToCall = function(callback, callId, announce, play) {
	function playMediaToCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		announce = a.announce;
		play = a.play;
		callback = a.callback;
	}
	var playMediaToCallMethodCallback = Ribbit.asynchronous ? playMediaToCallCallback : null;
	var playMediaToCallResponse = Ribbit.Calls().updateCall(playMediaToCallMethodCallback, callId, null, null, null, null, null, announce, play, null);
	if (!Ribbit.asynchronous) {
		return playMediaToCallCallback(playMediaToCallResponse);
	}
};
/**
 * Stop playing files and/or Text To speech elements to a call
 * This method is asynchronous. Subscribe to the event updateCallComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 */
Ribbit.Call.prototype.stopPlayingMediaToCall = function(callback, callId) {
	function stopPlayingMediaToCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		callback = a.callback;
	}
	var stopPlayingMediaToCallMethodCallback = Ribbit.asynchronous ? stopPlayingMediaToCallCallback : null;
	var stopPlayingMediaToCallResponse = Ribbit.Calls().updateCall(stopPlayingMediaToCallMethodCallback, callId, null, null, null, null, null, null, null, false);
	if (!Ribbit.asynchronous) {
		return stopPlayingMediaToCallCallback(stopPlayingMediaToCallResponse);
	}
};
/**
 * Updates the mode of a call leg, records it, or plays media to it, or requests DTMF (keypad) input. The leg must be active to respond to update requests
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 * @param mode string: The mode of a call or leg describes it's state.  Options are: hold, mute, hangup, talk (optional)
 * @param requestDtmf CallLegDtmfRequest: An object containing details of a request to collect DTMF input from a call leg (optional)
 * @param record CallRecordRequest: An object containing details of the recording request (optional)
 * @param recording boolean: True if recording is active. Set to false to stop recording (optional)
 * @param announce string: The Text to Speech culture to use, available from constants in this class (optional)
 * @param play CallPlayRequest: An object containing details of the recording request (optional)
 * @param playing boolean: True if media is playing. Set to false to stop playing (optional)
 * @return boolean: true if the method succeeds, or a RibbitException
 */
Ribbit.Call.prototype.updateCallLeg = function(callback, callId, legId, mode, requestDtmf, record, recording, announce, play, playing) {
	function updateCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		mode = a.mode;
		requestDtmf = a.requestDtmf;
		record = a.record;
		recording = a.recording;
		announce = a.announce;
		play = a.play;
		playing = a.playing;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (Ribbit.Util.isSet(callId)) {
		callId = "" + callId;
	}
	if (!Ribbit.Util.isValidString(callId)) {
		exceptions.push("callId is required");
	}
	if (!Ribbit.Util.isValidString(legId)) {
		exceptions.push("legId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(mode)) {
		exceptions.push("When defined, mode must be a string of one or more characters");
	}
	if (Ribbit.Util.isSet(requestDtmf)) {
		if (! (requestDtmf instanceof Ribbit.CallLegDtmfRequest)) {
			exceptions.push("requestDtmf must be an instance of Ribbit.CallLegDtmfRequest");
		} else {
			if (requestDtmf.getValidationMessage() !== "") {
				exceptions.push(requestDtmf.getValidationMessage());
			}
		}
	}
	if (Ribbit.Util.isSet(record)) {
		if (! (record instanceof Ribbit.CallRecordRequest)) {
			exceptions.push("record must be an instance of Ribbit.CallRecordRequest");
		} else {
			if (record.getValidationMessage() !== "") {
				exceptions.push(record.getValidationMessage());
			}
		}
	}
	if (!Ribbit.Util.isBoolIfDefined(recording)) {
		exceptions.push("When defined, recording must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(announce)) {
		exceptions.push("When defined, announce must be a string of one or more characters");
	}
	if (Ribbit.Util.isSet(play)) {
		if (! (play instanceof Ribbit.CallPlayRequest)) {
			exceptions.push("play must be an instance of Ribbit.CallPlayRequest");
		} else {
			if (play.getValidationMessage() !== "") {
				exceptions.push(play.getValidationMessage());
			}
		}
	}
	if (!Ribbit.Util.isBoolIfDefined(playing)) {
		exceptions.push("When defined, playing must be boolean");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	if (Ribbit.Util.isSet(mode)) {
		params.mode = mode;
	}
	if (Ribbit.Util.isSet(requestDtmf)) {
		params.requestDtmf = requestDtmf.toObject();
	}
	if (Ribbit.Util.isSet(record)) {
		params.record = record.toObject();
	}
	if (Ribbit.Util.isSet(recording)) {
		params.recording = recording;
	}
	if (Ribbit.Util.isSet(announce)) {
		params.announce = announce;
	}
	if (Ribbit.Util.isSet(play)) {
		params.play = play.toObject();
	}
	if (Ribbit.Util.isSet(playing)) {
		params.playing = playing;
	}
	var updateCallLegMethodCallback = Ribbit.asynchronous ? updateCallLegCallback : null;
	var uri = "calls/" + userId + "/" + callId + "/" + legId;
	var updateCallLegResponse = Ribbit.signedRequest().doPut(uri, params, updateCallLegMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateCallLegCallback(updateCallLegResponse);
	}
};
/**
 * Mutes a call leg. The leg must be active.
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.muteLeg = function(callback, callId, legId) {
	function muteLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var muteLegMethodCallback = Ribbit.asynchronous ? muteLegCallback : null;
	var muteLegResponse = Ribbit.Calls().updateCallLeg(muteLegMethodCallback, callId, legId, "mute", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return muteLegCallback(muteLegResponse);
	}
};
/**
 * Takes a call leg off mute. The leg must be active
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.unmuteLeg = function(callback, callId, legId) {
	function unmuteLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var unmuteLegMethodCallback = Ribbit.asynchronous ? unmuteLegCallback : null;
	var unmuteLegResponse = Ribbit.Calls().updateCallLeg(unmuteLegMethodCallback, callId, legId, "talk", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return unmuteLegCallback(unmuteLegResponse);
	}
};
/**
 * Puts a call leg on hold. The leg must be active
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.holdLeg = function(callback, callId, legId) {
	function holdLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var holdLegMethodCallback = Ribbit.asynchronous ? holdLegCallback : null;
	var holdLegResponse = Ribbit.Calls().updateCallLeg(holdLegMethodCallback, callId, legId, "hold", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return holdLegCallback(holdLegResponse);
	}
};
/**
 * Takes a call leg off hold. The leg must be active
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.unholdLeg = function(callback, callId, legId) {
	function unholdLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var unholdLegMethodCallback = Ribbit.asynchronous ? unholdLegCallback : null;
	var unholdLegResponse = Ribbit.Calls().updateCallLeg(unholdLegMethodCallback, callId, legId, "talk", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return unholdLegCallback(unholdLegResponse);
	}
};
/**
 * Removes a leg from a call
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.hangupLeg = function(callback, callId, legId) {
	function hangupLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var hangupLegMethodCallback = Ribbit.asynchronous ? hangupLegCallback : null;
	var hangupLegResponse = Ribbit.Calls().updateCallLeg(hangupLegMethodCallback, callId, legId, "hangup", null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return hangupLegCallback(hangupLegResponse);
	}
};
/**
 * Start recording a call leg. The leg must be active
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 * @param record CallRecordRequest: An object containing details of the recording request (optional)
 */
Ribbit.Call.prototype.recordCallLeg = function(callback, callId, legId, record) {
	function recordCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		record = a.record;
		callback = a.callback;
	}
	var recordCallLegMethodCallback = Ribbit.asynchronous ? recordCallLegCallback : null;
	var recordCallLegResponse = Ribbit.Calls().updateCallLeg(recordCallLegMethodCallback, callId, legId, null, null, record, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return recordCallLegCallback(recordCallLegResponse);
	}
};
/**
 * Stop recording a call leg
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.stopRecordingCallLeg = function(callback, callId, legId) {
	function stopRecordingCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var stopRecordingCallLegMethodCallback = Ribbit.asynchronous ? stopRecordingCallLegCallback : null;
	var stopRecordingCallLegResponse = Ribbit.Calls().updateCallLeg(stopRecordingCallLegMethodCallback, callId, legId, null, null, null, false, null, null, null);
	if (!Ribbit.asynchronous) {
		return stopRecordingCallLegCallback(stopRecordingCallLegResponse);
	}
};
/**
 * Play files and/or Text To Speech elements to a call leg. The leg must be active
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 * @param announce string: The Text to Speech culture to use, available from constants in this class (optional)
 * @param play CallPlayRequest: An object containing details of the recording request (optional)
 */
Ribbit.Call.prototype.playMediaToCallLeg = function(callback, callId, legId, announce, play) {
	function playMediaToCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		announce = a.announce;
		play = a.play;
		callback = a.callback;
	}
	var playMediaToCallLegMethodCallback = Ribbit.asynchronous ? playMediaToCallLegCallback : null;
	var playMediaToCallLegResponse = Ribbit.Calls().updateCallLeg(playMediaToCallLegMethodCallback, callId, legId, null, null, null, null, announce, play, null);
	if (!Ribbit.asynchronous) {
		return playMediaToCallLegCallback(playMediaToCallLegResponse);
	}
};
/**
 * Stop playing files and/or Text To speech elements to a call leg
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 */
Ribbit.Call.prototype.stopPlayingMediaToCallLeg = function(callback, callId, legId) {
	function stopPlayingMediaToCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		callback = a.callback;
	}
	var stopPlayingMediaToCallLegMethodCallback = Ribbit.asynchronous ? stopPlayingMediaToCallLegCallback : null;
	var stopPlayingMediaToCallLegResponse = Ribbit.Calls().updateCallLeg(stopPlayingMediaToCallLegMethodCallback, callId, legId, null, null, null, null, null, null, false);
	if (!Ribbit.asynchronous) {
		return stopPlayingMediaToCallLegCallback(stopPlayingMediaToCallLegResponse);
	}
};
/**
 * Request DTMF digits collected from a call leg. The leg should be active before DTMF is requested
 * This method is asynchronous. Subscribe to the event updateCallLegComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: Unique numeric Call identifier (required)
 * @param legId string: The call leg identifier (required)
 * @param requestDtmf CallLegDtmfRequest: An object containing details of a request to collect DTMF input from a call leg (optional)
 */
Ribbit.Call.prototype.requestDtmfFromCallLeg = function(callback, callId, legId, requestDtmf) {
	function requestDtmfFromCallLegCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		legId = a.legId;
		requestDtmf = a.requestDtmf;
		callback = a.callback;
	}
	var requestDtmfFromCallLegMethodCallback = Ribbit.asynchronous ? requestDtmfFromCallLegCallback : null;
	var requestDtmfFromCallLegResponse = Ribbit.Calls().updateCallLeg(requestDtmfFromCallLegMethodCallback, callId, legId, null, requestDtmf, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return requestDtmfFromCallLegCallback(requestDtmfFromCallLegResponse);
	}
};
/**
 *
 A Device represents different addresses through which a User may be contacted.
 * 			Devices are represented where possible as Uniform Resource Identifiers (URI) where the type is determined by the URI scheme. 
 * 			Examples include: mailto:, tel:, SIP:, Skype:, MSN:, and ribbit:
 */
/**
 * Provides access to theDevices Resource - normally accessed through Ribbit.Devices()
 *
 * @class Provides access to the Devices Resource
 */
Ribbit.Device = function() {
	return this;
};
/**
 * 
 */
Ribbit.Device.LOCALE_GBR = "GBR";
/**
 * 
 */
Ribbit.Device.LOCALE_USA = "USA";
/**
 * Allocates a specified Inbound Number to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param number string:  (required)
 * @return An inboundNumber identifier, or a RibbitException
 */
Ribbit.Device.prototype.allocateInboundNumber = function(callback, number) {
	function allocateInboundNumberCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		number = a.number;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(number)) {
		exceptions.push("number is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var allocateInboundNumberMethodCallback = Ribbit.asynchronous ? allocateInboundNumberCallback : null;
	var allocateInboundNumberResponse = Ribbit.Devices().createDevice(allocateInboundNumberMethodCallback, "@purpose/tel:" + number, "Purpose number", null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return allocateInboundNumberCallback(allocateInboundNumberResponse);
	}
};
/**
 * Registers a new device to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @param name string: Name to refer to this Device (required)
 * @param label string: A label for the Device (optional)
 * @param callme boolean: This Device can be used as an inbound 'CallMe' number (optional)
 * @param notifyvm boolean: Send notifications to this Device on new voicemails (optional)
 * @param callbackreachme boolean: This Device can be used as 'reach me' number (optional)
 * @param mailtext boolean: Include transcribed message content in notifications if available (optional)
 * @param shared boolean: This Device is shared by other people (optional)
 * @param notifymissedcall boolean: Send notifications to this device on missed calls (optional)
 * @param showcalled boolean: Show the callerID of the person called in the notification (optional)
 * @param answersecurity boolean:  (optional)
 * @param notifytranscription boolean: send notifications to this Device on new transcriptions (optional)
 * @param attachmessage boolean: Send voicemail file as an attachment to email notifications (optional)
 * @param usewave boolean: Send voicemail files in WAV format rather than MP3 (optional)
 * @param key string: Security access code to enable this device (optional)
 * @param ringstatus boolean: Ring this Device when an inbound call arrives (optional)
 * @param verifyBy string: Populate with 'ccfTest' to request a conditional call forwarding verification test (optional)
 * @param autoAnswer boolean: Automatically answer this inbound device (optional)
 * @param allowCCF boolean: Allow conditional call forwarding for this device (optional)
 * @return A device identifier, or a RibbitException
 */
Ribbit.Device.prototype.createDevice = function(callback, id, name, label, callme, notifyvm, callbackreachme, mailtext, shared, notifymissedcall, showcalled, answersecurity, notifytranscription, attachmessage, usewave, key, ringstatus, verifyBy, autoAnswer, allowCCF) {
	function createDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		name = a.name;
		label = a.label;
		callme = a.callme;
		notifyvm = a.notifyvm;
		callbackreachme = a.callbackreachme;
		mailtext = a.mailtext;
		shared = a.shared;
		notifymissedcall = a.notifymissedcall;
		showcalled = a.showcalled;
		answersecurity = a.answersecurity;
		notifytranscription = a.notifytranscription;
		attachmessage = a.attachmessage;
		usewave = a.usewave;
		key = a.key;
		ringstatus = a.ringstatus;
		verifyBy = a.verifyBy;
		autoAnswer = a.autoAnswer;
		allowCCF = a.allowCCF;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(id)) {
		exceptions.push("id is required");
	}
	if (!Ribbit.Util.isValidString(name)) {
		exceptions.push("name is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(label)) {
		exceptions.push("When defined, label must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(callme)) {
		exceptions.push("When defined, callme must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifyvm)) {
		exceptions.push("When defined, notifyvm must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(callbackreachme)) {
		exceptions.push("When defined, callbackreachme must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(mailtext)) {
		exceptions.push("When defined, mailtext must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(shared)) {
		exceptions.push("When defined, shared must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifymissedcall)) {
		exceptions.push("When defined, notifymissedcall must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(showcalled)) {
		exceptions.push("When defined, showcalled must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(answersecurity)) {
		exceptions.push("When defined, answersecurity must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifytranscription)) {
		exceptions.push("When defined, notifytranscription must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(attachmessage)) {
		exceptions.push("When defined, attachmessage must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(usewave)) {
		exceptions.push("When defined, usewave must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(key)) {
		exceptions.push("When defined, key must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(ringstatus)) {
		exceptions.push("When defined, ringstatus must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(verifyBy)) {
		exceptions.push("When defined, verifyBy must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(autoAnswer)) {
		exceptions.push("When defined, autoAnswer must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(allowCCF)) {
		exceptions.push("When defined, allowCCF must be boolean");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.id = id;
	params.name = name;
	if (Ribbit.Util.isSet(label)) {
		params.label = label;
	}
	if (Ribbit.Util.isSet(callme)) {
		params.callme = callme;
	}
	if (Ribbit.Util.isSet(notifyvm)) {
		params.notifyvm = notifyvm;
	}
	if (Ribbit.Util.isSet(callbackreachme)) {
		params.callbackreachme = callbackreachme;
	}
	if (Ribbit.Util.isSet(mailtext)) {
		params.mailtext = mailtext;
	}
	if (Ribbit.Util.isSet(shared)) {
		params.shared = shared;
	}
	if (Ribbit.Util.isSet(notifymissedcall)) {
		params.notifymissedcall = notifymissedcall;
	}
	if (Ribbit.Util.isSet(showcalled)) {
		params.showcalled = showcalled;
	}
	if (Ribbit.Util.isSet(answersecurity)) {
		params.answersecurity = answersecurity;
	}
	if (Ribbit.Util.isSet(notifytranscription)) {
		params.notifytranscription = notifytranscription;
	}
	if (Ribbit.Util.isSet(attachmessage)) {
		params.attachmessage = attachmessage;
	}
	if (Ribbit.Util.isSet(usewave)) {
		params.usewave = usewave;
	}
	if (Ribbit.Util.isSet(key)) {
		params.key = key;
	}
	if (Ribbit.Util.isSet(ringstatus)) {
		params.ringstatus = ringstatus;
	}
	if (Ribbit.Util.isSet(verifyBy)) {
		params.verifyBy = verifyBy;
	}
	if (Ribbit.Util.isSet(autoAnswer)) {
		params.autoAnswer = autoAnswer;
	}
	if (Ribbit.Util.isSet(allowCCF)) {
		params.allowCCF = allowCCF;
	}
	var createDeviceMethodCallback = Ribbit.asynchronous ? createDeviceCallback : null;
	var uri = "devices/" + userId;
	var createDeviceResponse = Ribbit.signedRequest().doPost(uri, params, createDeviceMethodCallback);
	if (!Ribbit.asynchronous) {
		return createDeviceCallback(createDeviceResponse);
	}
};
/**
 * Registers a new inbound device to the current User
 * This method is asynchronous. Subscribe to the event createDeviceComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @param name string: Name to refer to this Device (required)
 */
Ribbit.Device.prototype.createInboundDevice = function(callback, id, name) {
	function createInboundDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		name = a.name;
		callback = a.callback;
	}
	var createInboundDeviceMethodCallback = Ribbit.asynchronous ? createInboundDeviceCallback : null;
	var createInboundDeviceResponse = Ribbit.Devices().createDevice(createInboundDeviceMethodCallback, id, name, null, true, null, null, null, null, null, null, null, null, null, null, null, true, null, null, null);
	if (!Ribbit.asynchronous) {
		return createInboundDeviceCallback(createInboundDeviceResponse);
	}
};
/**
 * Registers a new outbound device to the current User
 * This method is asynchronous. Subscribe to the event createDeviceComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @param name string: Name to refer to this Device (required)
 */
Ribbit.Device.prototype.createOutboundDevice = function(callback, id, name) {
	function createOutboundDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		name = a.name;
		callback = a.callback;
	}
	var createOutboundDeviceMethodCallback = Ribbit.asynchronous ? createOutboundDeviceCallback : null;
	var createOutboundDeviceResponse = Ribbit.Devices().createDevice(createOutboundDeviceMethodCallback, id, name, null, null, null, true, null, null, null, null, null, null, null, null, null, true, null, null, null);
	if (!Ribbit.asynchronous) {
		return createOutboundDeviceCallback(createOutboundDeviceResponse);
	}
};
/**
 * Registers a new Inbound Number for the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param locale string: A country code. Currently 'GBR' and 'USA' are supported, defaults to 'USA' (required)
 * @param name string: Name to refer to this Device (required)
 * @return An inboundNumber identifier, or a RibbitException
 */
Ribbit.Device.prototype.createInboundNumber = function(callback, locale, name) {
	function createInboundNumberCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		locale = a.locale;
		name = a.name;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(locale)) {
		exceptions.push("locale is required");
	}
	if (!Ribbit.Util.isValidString(name)) {
		exceptions.push("name is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var createInboundNumberMethodCallback = Ribbit.asynchronous ? createInboundNumberCallback : null;
	var createInboundNumberResponse = Ribbit.Devices().createDevice(createInboundNumberMethodCallback, "@purpose/" + locale, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return createInboundNumberCallback(createInboundNumberResponse);
	}
};
/**
 * Registers a new Inbound SMS Number for the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param locale string: A country code. Currently 'GBR' and 'USA' are supported, defaults to 'USA' (required)
 * @param name string: Name to refer to this Device (required)
 * @return A  identifier, or a RibbitException
 */
Ribbit.Device.prototype.createInboundSmsNumber = function(callback, locale, name) {
	function createInboundSmsNumberCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		locale = a.locale;
		name = a.name;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(locale)) {
		exceptions.push("locale is required");
	}
	if (!Ribbit.Util.isValidString(name)) {
		exceptions.push("name is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var createInboundSmsNumberMethodCallback = Ribbit.asynchronous ? createInboundSmsNumberCallback : null;
	var createInboundSmsNumberResponse = Ribbit.Devices().createDevice(createInboundSmsNumberMethodCallback, "@sms/" + locale, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
	if (!Ribbit.asynchronous) {
		return createInboundSmsNumberCallback(createInboundSmsNumberResponse);
	}
};
/**
 * Registers a new mail device to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param emailAddress string: Email Address that will be prefixed by "mailto:" to form the Device Identifier (required)
 * @param name string: Name to refer to this Device (required)
 * @return A  identifier, or a RibbitException
 */
Ribbit.Device.prototype.createMailDevice = function(callback, emailAddress, name) {
	function createMailDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		emailAddress = a.emailAddress;
		name = a.name;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(emailAddress)) {
		exceptions.push("emailAddress is required");
	}
	if (!Ribbit.Util.isValidString(name)) {
		exceptions.push("name is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var createMailDeviceMethodCallback = Ribbit.asynchronous ? createMailDeviceCallback : null;
	var createMailDeviceResponse = Ribbit.Devices().createDevice(createMailDeviceMethodCallback, "mailto:" + emailAddress, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "mailCheck", null, null);
	if (!Ribbit.asynchronous) {
		return createMailDeviceCallback(createMailDeviceResponse);
	}
};
/**
 * Finds a selection of available Inbound Numbers based on a search string and specified Locale.  These numbers can then be allocated to the current User by using  {@link allocateInboundNumber}.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param searchFilter string: A pattern to search for in available Inbound Numbers (required)
 * @param locale string: A country code. Currently 'GBR' and 'USA' are supported, defaults to 'USA' (required)
 * @param maxResults int: The maximum number of results to return when getting a list of available Inbound Numbers (required)
 * @return array: an array, each entry of which contains an object of details about the InboundNumber, or a RibbitException
 */
Ribbit.Device.prototype.findAvailableInboundNumberSelectionForLocale = function(callback, searchFilter, locale, maxResults) {
	function findAvailableInboundNumberSelectionForLocaleCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		searchFilter = a.searchFilter;
		locale = a.locale;
		maxResults = a.maxResults;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (Ribbit.Util.isSet(searchFilter)) {
		searchFilter = "" + searchFilter;
	}
	if (!Ribbit.Util.isValidString(searchFilter)) {
		exceptions.push("searchFilter is required");
	}
	if (!Ribbit.Util.isValidString(locale)) {
		exceptions.push("locale is required");
	}
	if (!Ribbit.Util.isPositiveInteger(maxResults)) {
		exceptions.push("maxResults is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var findAvailableInboundNumberSelectionForLocaleMethodCallback = Ribbit.asynchronous ? findAvailableInboundNumberSelectionForLocaleCallback : null;
	var uri = "devices/@purpose?maxResults=" + maxResults + "&filterBy=status,location,id&filterOp=all&filterValue=available," + locale + "," + searchFilter;
	var findAvailableInboundNumberSelectionForLocaleResponse = Ribbit.signedRequest().doGet(uri, findAvailableInboundNumberSelectionForLocaleMethodCallback);
	if (!Ribbit.asynchronous) {
		return findAvailableInboundNumberSelectionForLocaleCallback(findAvailableInboundNumberSelectionForLocaleResponse);
	}
};
/**
 * Gets a selection of available Inbound Numbers.  These numbers can then be allocated to the current User by using  {@link allocateInboundNumber}.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param maxResults int: The maximum number of results to return when getting a list of available Inbound Numbers (required)
 * @return array: an array, each entry of which contains an object of details about the InboundNumber, or a RibbitException
 */
Ribbit.Device.prototype.getAvailableInboundNumberSelection = function(callback, maxResults) {
	function getAvailableInboundNumberSelectionCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		maxResults = a.maxResults;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isPositiveInteger(maxResults)) {
		exceptions.push("maxResults is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getAvailableInboundNumberSelectionMethodCallback = Ribbit.asynchronous ? getAvailableInboundNumberSelectionCallback : null;
	var uri = "devices/@purpose?maxResults=" + maxResults + "&filterBy=status&filterValue=available";
	var getAvailableInboundNumberSelectionResponse = Ribbit.signedRequest().doGet(uri, getAvailableInboundNumberSelectionMethodCallback);
	if (!Ribbit.asynchronous) {
		return getAvailableInboundNumberSelectionCallback(getAvailableInboundNumberSelectionResponse);
	}
};
/**
 * Gets a selection of available Inbound Numbers for the specified Locale.  These numbers can then be allocated to the current User by using  {@link allocateInboundNumber}.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param locale string: A country code. Currently 'GBR' and 'USA' are supported, defaults to 'USA' (required)
 * @param maxResults int: The maximum number of results to return when getting a list of available Inbound Numbers (required)
 * @return array: an array, each entry of which contains an object of details about the InboundNumber, or a RibbitException
 */
Ribbit.Device.prototype.getAvailableInboundNumberSelectionForLocale = function(callback, locale, maxResults) {
	function getAvailableInboundNumberSelectionForLocaleCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		locale = a.locale;
		maxResults = a.maxResults;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(locale)) {
		exceptions.push("locale is required");
	}
	if (!Ribbit.Util.isPositiveInteger(maxResults)) {
		exceptions.push("maxResults is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getAvailableInboundNumberSelectionForLocaleMethodCallback = Ribbit.asynchronous ? getAvailableInboundNumberSelectionForLocaleCallback : null;
	var uri = "devices/@purpose?maxResults=" + maxResults + "&filterBy=status,location&filterOp=all&filterValue=available," + locale;
	var getAvailableInboundNumberSelectionForLocaleResponse = Ribbit.signedRequest().doGet(uri, getAvailableInboundNumberSelectionForLocaleMethodCallback);
	if (!Ribbit.asynchronous) {
		return getAvailableInboundNumberSelectionForLocaleCallback(getAvailableInboundNumberSelectionForLocaleResponse);
	}
};
/**
 * Gets details about the Device
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @return object: an object containing details about the DeviceResource, or a RibbitException
 */
Ribbit.Device.prototype.getDevice = function(callback, deviceId) {
	function getDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		deviceId = a.deviceId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(deviceId)) {
		exceptions.push("deviceId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getDeviceMethodCallback = Ribbit.asynchronous ? getDeviceCallback : null;
	var uri = "devices/" + userId + "/" + deviceId;
	var getDeviceResponse = Ribbit.signedRequest().doGet(uri, getDeviceMethodCallback);
	if (!Ribbit.asynchronous) {
		return getDeviceCallback(getDeviceResponse);
	}
};
/**
 * Get a collection of Devices belonging to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @return array: an array, each entry of which contains an object of details about the DeviceResource, or a RibbitException
 */
Ribbit.Device.prototype.getDevices = function(callback) {
	function getDevicesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var getDevicesMethodCallback = Ribbit.asynchronous ? getDevicesCallback : null;
	var uri = "devices/" + userId;
	var getDevicesResponse = Ribbit.signedRequest().doGet(uri, getDevicesMethodCallback);
	if (!Ribbit.asynchronous) {
		return getDevicesCallback(getDevicesResponse);
	}
};
/**
 * Deregisters a Device belonging to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @return true if the device is successfully removed, or a RibbitException
 */
Ribbit.Device.prototype.removeDevice = function(callback, deviceId) {
	function removeDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		deviceId = a.deviceId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(deviceId)) {
		exceptions.push("deviceId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var removeDeviceMethodCallback = Ribbit.asynchronous ? removeDeviceCallback : null;
	var uri = "devices/" + userId + "/" + deviceId;
	var removeDeviceResponse = Ribbit.signedRequest().doDelete(uri, removeDeviceMethodCallback);
	if (!Ribbit.asynchronous) {
		return removeDeviceCallback(removeDeviceResponse);
	}
};
/**
 * Updates details about a Device, and flags which control how it interacts with the Ribbit Platform
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @param name string: Name to refer to this Device (optional)
 * @param label string: A label for the Device (optional)
 * @param callme boolean: This Device can be used as an inbound 'CallMe' number (optional)
 * @param notifyvm boolean: Send notifications to this Device on new voicemails (optional)
 * @param callbackreachme boolean: This Device can be used as 'reach me' number (optional)
 * @param mailtext boolean: Include transcribed message content in notifications if available (optional)
 * @param shared boolean: This Device is shared by other people (optional)
 * @param notifymissedcall boolean: Send notifications to this device on missed calls (optional)
 * @param showcalled boolean: Show the callerID of the person called in the notification (optional)
 * @param answersecurity boolean:  (optional)
 * @param notifytranscription boolean: send notifications to this Device on new transcriptions (optional)
 * @param attachmessage boolean: Send voicemail file as an attachment to email notifications (optional)
 * @param usewave boolean: Send voicemail files in WAV format rather than MP3 (optional)
 * @param key string: Security access code to enable this device (optional)
 * @param ringstatus boolean: Ring this Device when an inbound call arrives (optional)
 * @param verifyBy string: Populate with 'ccfTest' to request a conditional call forwarding verification test (optional)
 * @param autoAnswer boolean: Automatically answer this inbound device (optional)
 * @param allowCCF boolean: Allow conditional call forwarding for this device (optional)
 * @return object: an object containing details about the DeviceResource, or a RibbitException
 */
Ribbit.Device.prototype.updateDevice = function(callback, deviceId, name, label, callme, notifyvm, callbackreachme, mailtext, shared, notifymissedcall, showcalled, answersecurity, notifytranscription, attachmessage, usewave, key, ringstatus, verifyBy, autoAnswer, allowCCF) {
	function updateDeviceCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		deviceId = a.deviceId;
		name = a.name;
		label = a.label;
		callme = a.callme;
		notifyvm = a.notifyvm;
		callbackreachme = a.callbackreachme;
		mailtext = a.mailtext;
		shared = a.shared;
		notifymissedcall = a.notifymissedcall;
		showcalled = a.showcalled;
		answersecurity = a.answersecurity;
		notifytranscription = a.notifytranscription;
		attachmessage = a.attachmessage;
		usewave = a.usewave;
		key = a.key;
		ringstatus = a.ringstatus;
		verifyBy = a.verifyBy;
		autoAnswer = a.autoAnswer;
		allowCCF = a.allowCCF;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(deviceId)) {
		exceptions.push("deviceId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(name)) {
		exceptions.push("When defined, name must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(label)) {
		exceptions.push("When defined, label must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(callme)) {
		exceptions.push("When defined, callme must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifyvm)) {
		exceptions.push("When defined, notifyvm must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(callbackreachme)) {
		exceptions.push("When defined, callbackreachme must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(mailtext)) {
		exceptions.push("When defined, mailtext must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(shared)) {
		exceptions.push("When defined, shared must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifymissedcall)) {
		exceptions.push("When defined, notifymissedcall must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(showcalled)) {
		exceptions.push("When defined, showcalled must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(answersecurity)) {
		exceptions.push("When defined, answersecurity must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(notifytranscription)) {
		exceptions.push("When defined, notifytranscription must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(attachmessage)) {
		exceptions.push("When defined, attachmessage must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(usewave)) {
		exceptions.push("When defined, usewave must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(key)) {
		exceptions.push("When defined, key must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(ringstatus)) {
		exceptions.push("When defined, ringstatus must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(verifyBy)) {
		exceptions.push("When defined, verifyBy must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(autoAnswer)) {
		exceptions.push("When defined, autoAnswer must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(allowCCF)) {
		exceptions.push("When defined, allowCCF must be boolean");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	if (Ribbit.Util.isSet(name)) {
		params.name = name;
	}
	if (Ribbit.Util.isSet(label)) {
		params.label = label;
	}
	if (Ribbit.Util.isSet(callme)) {
		params.callme = callme;
	}
	if (Ribbit.Util.isSet(notifyvm)) {
		params.notifyvm = notifyvm;
	}
	if (Ribbit.Util.isSet(callbackreachme)) {
		params.callbackreachme = callbackreachme;
	}
	if (Ribbit.Util.isSet(mailtext)) {
		params.mailtext = mailtext;
	}
	if (Ribbit.Util.isSet(shared)) {
		params.shared = shared;
	}
	if (Ribbit.Util.isSet(notifymissedcall)) {
		params.notifymissedcall = notifymissedcall;
	}
	if (Ribbit.Util.isSet(showcalled)) {
		params.showcalled = showcalled;
	}
	if (Ribbit.Util.isSet(answersecurity)) {
		params.answersecurity = answersecurity;
	}
	if (Ribbit.Util.isSet(notifytranscription)) {
		params.notifytranscription = notifytranscription;
	}
	if (Ribbit.Util.isSet(attachmessage)) {
		params.attachmessage = attachmessage;
	}
	if (Ribbit.Util.isSet(usewave)) {
		params.usewave = usewave;
	}
	if (Ribbit.Util.isSet(key)) {
		params.key = key;
	}
	if (Ribbit.Util.isSet(ringstatus)) {
		params.ringstatus = ringstatus;
	}
	if (Ribbit.Util.isSet(verifyBy)) {
		params.verifyBy = verifyBy;
	}
	if (Ribbit.Util.isSet(autoAnswer)) {
		params.autoAnswer = autoAnswer;
	}
	if (Ribbit.Util.isSet(allowCCF)) {
		params.allowCCF = allowCCF;
	}
	var updateDeviceMethodCallback = Ribbit.asynchronous ? updateDeviceCallback : null;
	var uri = "devices/" + userId + "/" + deviceId;
	var updateDeviceResponse = Ribbit.signedRequest().doPut(uri, params, updateDeviceMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateDeviceCallback(updateDeviceResponse);
	}
};
/**
 * Request a conditional call forwarding verification test
 * This method is asynchronous. Subscribe to the event updateDeviceComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 */
Ribbit.Device.prototype.requestConditionalCallForwardingTest = function(callback, deviceId) {
	function requestConditionalCallForwardingTestCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		deviceId = a.deviceId;
		callback = a.callback;
	}
	var requestConditionalCallForwardingTestMethodCallback = Ribbit.asynchronous ? requestConditionalCallForwardingTestCallback : null;
	var requestConditionalCallForwardingTestResponse = Ribbit.Devices().updateDevice(requestConditionalCallForwardingTestMethodCallback, deviceId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "ccfTest", null, null);
	if (!Ribbit.asynchronous) {
		return requestConditionalCallForwardingTestCallback(requestConditionalCallForwardingTestResponse);
	}
};
/**
 * Configures a purpose number to be automatically answered by REST
 * This method is asynchronous. Subscribe to the event updateDeviceComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
 * @param autoAnswer boolean: Automatically answer this inbound device (optional)
 * @param allowCCF boolean: Allow conditional call forwarding for this device (optional)
 */
Ribbit.Device.prototype.setAutoAnswer = function(callback, deviceId, autoAnswer, allowCCF) {
	function setAutoAnswerCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		deviceId = a.deviceId;
		autoAnswer = a.autoAnswer;
		allowCCF = a.allowCCF;
		callback = a.callback;
	}
	var setAutoAnswerMethodCallback = Ribbit.asynchronous ? setAutoAnswerCallback : null;
	var setAutoAnswerResponse = Ribbit.Devices().updateDevice(setAutoAnswerMethodCallback, deviceId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, autoAnswer, allowCCF);
	if (!Ribbit.asynchronous) {
		return setAutoAnswerCallback(setAutoAnswerResponse);
	}
};
/**
 *
 A Domain defines a name space for developers for any applications and users that they create. 
 * Any user within a domain is able to login using any application within the same domain. 
 * Domains are created automatically for developers using the Developer Portal when applications are created. 
 * When new users are created these users are created in the same domain as the application used to create them. 
 * Users are only able to GET details of the domain that they are in.
 */
/**
 * Provides access to theDomains Resource - normally accessed through Ribbit.Domains()
 *
 * @class Provides access to the Domains Resource
 */
Ribbit.Domain = function() {
	return this;
};
/**
 * Gets a Domain
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param name string: A Domain Name (optional)
 * @return object: an object containing details about the DomainResource, or a RibbitException
 */
Ribbit.Domain.prototype.getDomain = function(callback, name) {
	function getDomainCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		name = a.name;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidStringIfDefined(name)) {
		exceptions.push("When defined, name must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var nameValue = Ribbit.Util.isSet(name) ? name : Ribbit.domain;
	var getDomainMethodCallback = Ribbit.asynchronous ? getDomainCallback : null;
	var uri = "domains/" + nameValue;
	var getDomainResponse = Ribbit.signedRequest().doGet(uri, getDomainMethodCallback);
	if (!Ribbit.asynchronous) {
		return getDomainCallback(getDomainResponse);
	}
};
/**
 *
 A labels is a tag for another resource.
 */
/**
 * Provides access to theLabels Resource - normally accessed through Ribbit.Labels()
 *
 * @class Provides access to the Labels Resource
 */
Ribbit.Label = function() {
	return this;
};
/**
 * Gets a collection of Labels
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Label.prototype.getLabels = function(callback, startIndex, count, filterBy, filterValue) {
	function getLabelsCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getLabelsMethodCallback = Ribbit.asynchronous ? getLabelsCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "labels/" + userId + q;
	var getLabelsResponse = Ribbit.signedRequest().doGet(uri, getLabelsMethodCallback);
	if (!Ribbit.asynchronous) {
		return getLabelsCallback(getLabelsResponse);
	}
};
/**
 *
 The Media resource represents audio, video, or text files that may be stored and retrieved from shared folders on the Ribbit virtual file system for use in audio or video applications. 
 * This service is currently employed by the default voicemail application for Ribbit which deposits audio files in a virtual folder corresponding to the call ID within the media space.
 */
/**
 * Provides access to theMedia Resource - normally accessed through Ribbit.Media()
 *
 * @class Provides access to the Media Resource
 */
Ribbit.MediaFiles = function() {
	return this;
};
/**
 * Filter Media Files by File Name
 */
Ribbit.MediaFiles.FILTER_BY_FILENAME = "name";
/**
 * Creates a new virtual folder
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string: An identifier for this access control list entry (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return A folder identifier, or a RibbitException
 */
Ribbit.MediaFiles.prototype.createFolder = function(callback, id, domain) {
	function createFolderCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(id)) {
		exceptions.push("id is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var params = {};
	params.id = id;
	var createFolderMethodCallback = Ribbit.asynchronous ? createFolderCallback : null;
	var uri = "media/" + domainValue;
	var createFolderResponse = Ribbit.signedRequest().doPost(uri, params, createFolderMethodCallback);
	if (!Ribbit.asynchronous) {
		return createFolderCallback(createFolderResponse);
	}
};
/**
 * Gets the access control list for a file
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param file string: The name of a file within a folder on the server (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return object: an object containing details about the AccessControlListResource, or a RibbitException
 */
Ribbit.MediaFiles.prototype.getFileAcl = function(callback, folder, file, domain) {
	function getFileAclCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		file = a.file;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidString(file)) {
		exceptions.push("file is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var getFileAclMethodCallback = Ribbit.asynchronous ? getFileAclCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/" + file + "/acl";
	var getFileAclResponse = Ribbit.signedRequest().doGet(uri, getFileAclMethodCallback);
	if (!Ribbit.asynchronous) {
		return getFileAclCallback(getFileAclResponse);
	}
};
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.MediaFiles.prototype.getFilesInFolder = function(callback, folder, domain, startIndex, count, filterBy, filterValue) {
	function getFilesInFolderCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		domain = a.domain;
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var getFilesInFolderMethodCallback = Ribbit.asynchronous ? getFilesInFolderCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "media/" + domainValue + "/" + folder + q;
	var getFilesInFolderResponse = Ribbit.signedRequest().doGet(uri, getFilesInFolderMethodCallback);
	if (!Ribbit.asynchronous) {
		return getFilesInFolderCallback(getFilesInFolderResponse);
	}
};
/**
 * Get the access control list for a folder
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return object: an object containing details about the AccessControlListResource, or a RibbitException
 */
Ribbit.MediaFiles.prototype.getFolderAcl = function(callback, folder, domain) {
	function getFolderAclCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var getFolderAclMethodCallback = Ribbit.asynchronous ? getFolderAclCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/acl";
	var getFolderAclResponse = Ribbit.signedRequest().doGet(uri, getFolderAclMethodCallback);
	if (!Ribbit.asynchronous) {
		return getFolderAclCallback(getFolderAclResponse);
	}
};
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param file string: The name of a file within a folder on the server (required)
 * @param serviceId string:  (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return object: an object containing details about the xs:string, or a RibbitException
 */
Ribbit.MediaFiles.prototype.getTranscriptionForFile = function(callback, folder, file, serviceId, domain) {
	function getTranscriptionForFileCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		file = a.file;
		serviceId = a.serviceId;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidString(file)) {
		exceptions.push("file is required");
	}
	if (!Ribbit.Util.isValidString(serviceId)) {
		exceptions.push("serviceId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var getTranscriptionForFileMethodCallback = Ribbit.asynchronous ? getTranscriptionForFileCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/" + file + "." + serviceId + ".txt";
	var getTranscriptionForFileResponse = Ribbit.signedRequest().doGet(uri, getTranscriptionForFileMethodCallback);
	if (!Ribbit.asynchronous) {
		return getTranscriptionForFileCallback(getTranscriptionForFileResponse);
	}
};
/**
 * Creates a temporary URL that can be used for streaming files associated with a call
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: A numeric call identifier (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return , or a RibbitException
 */
Ribbit.MediaFiles.prototype.getUrlForMediaForCall = function(callback, callId, domain) {
	function getUrlForMediaForCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		domain = a.domain;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(callId)) {
		exceptions.push("callId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var getUrlForMediaForCallMethodCallback = Ribbit.asynchronous ? getUrlForMediaForCallCallback : null;
	var uri = "media/" + domainValue + "/call:" + callId + "/" + callId + ".mp3";
	var getUrlForMediaForCallResponse = Ribbit.signedRequest().doGetStreamableUrl(uri, getUrlForMediaForCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return getUrlForMediaForCallCallback(getUrlForMediaForCallResponse);
	}
};
/**
 * Removes all files associated with a call
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callId string: A numeric call identifier (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return true if the medi is successfully removed, or a RibbitException
 */
Ribbit.MediaFiles.prototype.removeAllMediaForCall = function(callback, callId, domain) {
	function removeAllMediaForCallCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callId = a.callId;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(callId)) {
		exceptions.push("callId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var removeAllMediaForCallMethodCallback = Ribbit.asynchronous ? removeAllMediaForCallCallback : null;
	var uri = "media/" + domainValue + "/call:" + callId;
	var removeAllMediaForCallResponse = Ribbit.signedRequest().doDelete(uri, removeAllMediaForCallMethodCallback);
	if (!Ribbit.asynchronous) {
		return removeAllMediaForCallCallback(removeAllMediaForCallResponse);
	}
};
/**
 * Removes a file
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param file string: The name of a file within a folder on the server (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return true if the medi is successfully removed, or a RibbitException
 */
Ribbit.MediaFiles.prototype.removeFile = function(callback, folder, file, domain) {
	function removeFileCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		file = a.file;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidString(file)) {
		exceptions.push("file is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var removeFileMethodCallback = Ribbit.asynchronous ? removeFileCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/" + file;
	var removeFileResponse = Ribbit.signedRequest().doDelete(uri, removeFileMethodCallback);
	if (!Ribbit.asynchronous) {
		return removeFileCallback(removeFileResponse);
	}
};
/**
 * Removes a folder, and all it's contents
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param domain string: A domain name, normally the current users (optional)
 * @return true if the medi is successfully removed, or a RibbitException
 */
Ribbit.MediaFiles.prototype.removeFolder = function(callback, folder, domain) {
	function removeFolderCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var removeFolderMethodCallback = Ribbit.asynchronous ? removeFolderCallback : null;
	var uri = "media/" + domainValue + "/" + folder;
	var removeFolderResponse = Ribbit.signedRequest().doDelete(uri, removeFolderMethodCallback);
	if (!Ribbit.asynchronous) {
		return removeFolderCallback(removeFolderResponse);
	}
};
/**
 * Updates the access control list for a file
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param file string: The name of a file within a folder on the server (required)
 * @param readUsers string: An array of User GUIDS who have permission to read the resource (optional)
 * @param writeUsers string: An array of Users GUIDS who have permission to write to the resource (optional)
 * @param readApps string: An array of Application GUIDS who have permission to read the resource (optional)
 * @param writeApps string: An array of Application GUIDS who have permission to write to the resource (optional)
 * @param domain string: A domain name, normally the current users (optional)
 * @return object: an object containing details about the AccessControlListResource, or a RibbitException
 */
Ribbit.MediaFiles.prototype.updateFileAcl = function(callback, folder, file, readUsers, writeUsers, readApps, writeApps, domain) {
	function updateFileAclCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		file = a.file;
		readUsers = a.readUsers;
		writeUsers = a.writeUsers;
		readApps = a.readApps;
		writeApps = a.writeApps;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isValidString(file)) {
		exceptions.push("file is required");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(readUsers)) {
		exceptions.push("When defined, readUsers must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeUsers)) {
		exceptions.push("When defined, writeUsers must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(readApps)) {
		exceptions.push("When defined, readApps must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeApps)) {
		exceptions.push("When defined, writeApps must be an array of at least one item");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var params = {};
	if (Ribbit.Util.isSet(readUsers)) {
		params.readUsers = readUsers;
	}
	if (Ribbit.Util.isSet(writeUsers)) {
		params.writeUsers = writeUsers;
	}
	if (Ribbit.Util.isSet(readApps)) {
		params.readApps = readApps;
	}
	if (Ribbit.Util.isSet(writeApps)) {
		params.writeApps = writeApps;
	}
	var updateFileAclMethodCallback = Ribbit.asynchronous ? updateFileAclCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/" + file + "/acl";
	var updateFileAclResponse = Ribbit.signedRequest().doPut(uri, params, updateFileAclMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateFileAclCallback(updateFileAclResponse);
	}
};
/**
 * Updates the access control list for a folder
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param folder string: The name of a folder within the domain on the server (required)
 * @param readUsers string: An array of User GUIDS who have permission to read the resource (optional)
 * @param writeUsers string: An array of Users GUIDS who have permission to write to the resource (optional)
 * @param readApps string: An array of Application GUIDS who have permission to read the resource (optional)
 * @param writeApps string: An array of Application GUIDS who have permission to write to the resource (optional)
 * @param domain string: A domain name, normally the current users (optional)
 * @return object: an object containing details about the AccessControlListResource, or a RibbitException
 */
Ribbit.MediaFiles.prototype.updateFolderAcl = function(callback, folder, readUsers, writeUsers, readApps, writeApps, domain) {
	function updateFolderAclCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		folder = a.folder;
		readUsers = a.readUsers;
		writeUsers = a.writeUsers;
		readApps = a.readApps;
		writeApps = a.writeApps;
		domain = a.domain;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(readUsers)) {
		exceptions.push("When defined, readUsers must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeUsers)) {
		exceptions.push("When defined, writeUsers must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(readApps)) {
		exceptions.push("When defined, readApps must be an array of at least one item");
	}
	if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeApps)) {
		exceptions.push("When defined, writeApps must be an array of at least one item");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain;
	var params = {};
	if (Ribbit.Util.isSet(readUsers)) {
		params.readUsers = readUsers;
	}
	if (Ribbit.Util.isSet(writeUsers)) {
		params.writeUsers = writeUsers;
	}
	if (Ribbit.Util.isSet(readApps)) {
		params.readApps = readApps;
	}
	if (Ribbit.Util.isSet(writeApps)) {
		params.writeApps = writeApps;
	}
	var updateFolderAclMethodCallback = Ribbit.asynchronous ? updateFolderAclCallback : null;
	var uri = "media/" + domainValue + "/" + folder + "/acl";
	var updateFolderAclResponse = Ribbit.signedRequest().doPut(uri, params, updateFolderAclMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateFolderAclCallback(updateFolderAclResponse);
	}
};
/**
 *
 Messages resources represent text, voicemail, SMS, and other forms of media that may be exchanged and saved by Users
 */
/**
 * Provides access to theMessages Resource - normally accessed through Ribbit.Messages()
 *
 * @class Provides access to the Messages Resource
 */
Ribbit.Message = function() {
	return this;
};
/**
 * Filter Messages by Destination
 */
Ribbit.Message.FILTER_BY_DESTINATION = "destination";
/**
 * Filter Messages by Folder
 */
Ribbit.Message.FILTER_BY_FOLDER = "folder";
/**
 * Filter Messages by Media Location
 */
Ribbit.Message.FILTER_BY_MEDIA_LOCATION = "mediaLocation";
/**
 * Filter Messages by Type
 */
Ribbit.Message.FILTER_BY_MESSAGE_TYPE = "messageType";
/**
 * Filter Messages by Notes
 */
Ribbit.Message.FILTER_BY_NOTES = "notes";
/**
 * Filter Messages by Sender
 */
Ribbit.Message.FILTER_BY_SENDER = "sender";
/**
 * Filter Messages by Status
 */
Ribbit.Message.FILTER_BY_STATUS = "messageStatus";
/**
 * Filter Messages by Tags
 */
Ribbit.Message.FILTER_BY_TAGS = "tags";
/**
 * Filter Messages by Title
 */
Ribbit.Message.FILTER_BY_TITLE = "title";
/**
 * Filter Messages by Transcription Status
 */
Ribbit.Message.FILTER_BY_TRANSCRIPTION_STATUS = "transcriptionStatus";
/**
 * Filter Messages by User Id
 */
Ribbit.Message.FILTER_BY_USER_ID = "uid";
/**
 * Use with FILTER_BY_STATUS to get deleted Messages
 */
Ribbit.Message.STATUS_DELETED = "DELETED";
/**
 * The message has been delivered
 */
Ribbit.Message.STATUS_DELIVERED = "DELIVERED";
/**
 * Use with FILTER_BY_STATUS to get failed Messages
 */
Ribbit.Message.STATUS_FAILED = "FAILED";
/**
 * Use with FILTER_BY_STATUS to get Messages in an 'initial' state
 */
Ribbit.Message.STATUS_INITIAL = "INITIAL";
/**
 * Use with FILTER_BY_STATUS to get new Messages
 */
Ribbit.Message.STATUS_NEW_MESSAGES = "NEW";
/**
 * Use with FILTER_BY_STATUS to get read Messages
 */
Ribbit.Message.STATUS_READ = "READ";
/**
 * Use with FILTER_BY_STATUS to get received Messages
 */
Ribbit.Message.STATUS_RECEIVED = "RECEIVED";
/**
 * Use with FILTER_BY_STATUS to get Messages that have been sent
 */
Ribbit.Message.STATUS_SENT = "SENT";
/**
 * Use with FILTER_BY_STATUS to get Messages in an unknown state
 */
Ribbit.Message.STATUS_UNKNOWN = "UNKNOWN";
/**
 * Use with FILTER_BY_STATUS to get urgent Messages
 */
Ribbit.Message.STATUS_URGENT = "URGENT";
/**
 * Use with FILTER_BY_TRANSCRIPTION_STATUS to get Messages where no Transcriptions are available
 */
Ribbit.Message.TRANSCRIPTION_STATUS_FAILED = "notAvailable";
/**
 * Use with FILTER_BY_TRANSCRIPTION_STATUS to get Messages where Transcriptions are pending
 */
Ribbit.Message.TRANSCRIPTION_STATUS_PENDING = "pending";
/**
 * Use with FILTER_BY_TRANSCRIPTION_STATUS to get Messages which have been transcribed
 */
Ribbit.Message.TRANSCRIPTION_STATUS_TRANSCRIBED = "transcribed";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get broadcast voicemail Messages
 */
Ribbit.Message.TYPE_BROADCAST_VOICEMAIL = "BroadcastVoiceMail";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get email Messages
 */
Ribbit.Message.TYPE_EMAIL = "email";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get inbound audio Messages
 */
Ribbit.Message.TYPE_INBOUND_AUDIO_MESSAGE = "InboundAudioMessage";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get inbound sms Messages
 */
Ribbit.Message.TYPE_INBOUND_SMS = "InboundSms";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get outbound audio Messages
 */
Ribbit.Message.TYPE_OUTBOUND_AUDIO_MESSAGE = "OutboundAudioMessage";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get outbound sms Messages
 */
Ribbit.Message.TYPE_OUTBOUND_SMS = "OutboundSms";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get sms Messages
 */
Ribbit.Message.TYPE_SMS = "sms";
/**
 * Use with FILTER_BY_MESSAGE_TYPE to get voicemail Messages
 */
Ribbit.Message.TYPE_VOICEMAIL = "Voicemail";
/**
 * To send an SMS the recipients in the array must be formatted tel:xxnnnnnn where xx is a country code and nnnnnn is their phone number.<br/>When sending a SMS the sender must also be a tel:xxnnnnn uri, and a telephone number registered to the current User on the Ribbit Platform, either an allocated inbound (purpose) number or a cell phone. <br/>The body will be the content that gets displayed on the phone. <br/>The title is sometimes referred to as the message id, and some cellular devices and carriers make this available.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param recipients string: A list of details about the recipients of the Message (required)
 * @param body string: The body of the Message (required)
 * @param sender string: The device ID that sent the Message (optional)
 * @param title string: The title of the Message (optional)
 * @return A message identifier, or a RibbitException
 */
Ribbit.Message.prototype.createMessage = function(callback, recipients, body, sender, title) {
	function createMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		recipients = a.recipients;
		body = a.body;
		sender = a.sender;
		title = a.title;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isNonEmptyArray(recipients)) {
		exceptions.push("recipients is required");
	}
	if (!Ribbit.Util.isValidString(body)) {
		exceptions.push("body is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(sender)) {
		exceptions.push("When defined, sender must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(title)) {
		exceptions.push("When defined, title must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.recipients = recipients;
	params.body = body;
	if (Ribbit.Util.isSet(sender)) {
		params.sender = sender;
	}
	if (Ribbit.Util.isSet(title)) {
		params.title = title;
	}
	var createMessageMethodCallback = Ribbit.asynchronous ? createMessageCallback : null;
	var uri = "messages/" + userId + "/outbox";
	var createMessageResponse = Ribbit.signedRequest().doPost(uri, params, createMessageMethodCallback);
	if (!Ribbit.asynchronous) {
		return createMessageCallback(createMessageResponse);
	}
};
/**
 * Gets details of a message in a folder
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (required)
 * @return object: an object containing details about the MessageResource, or a RibbitException
 */
Ribbit.Message.prototype.getMessage = function(callback, messageId, folder) {
	function getMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(messageId)) {
		exceptions.push("messageId is required");
	}
	if (!Ribbit.Util.isValidString(folder)) {
		exceptions.push("folder is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getMessageMethodCallback = Ribbit.asynchronous ? getMessageCallback : null;
	var uri = "messages/" + userId + "/" + folder + "/" + messageId;
	var getMessageResponse = Ribbit.signedRequest().doGet(uri, getMessageMethodCallback);
	if (!Ribbit.asynchronous) {
		return getMessageCallback(getMessageResponse);
	}
};
/**
 * Gets details of a message sent by the current User
 * This method is asynchronous. Subscribe to the event getMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 */
Ribbit.Message.prototype.getSentMessage = function(callback, messageId) {
	function getSentMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		callback = a.callback;
	}
	var getSentMessageMethodCallback = Ribbit.asynchronous ? getSentMessageCallback : null;
	var getSentMessageResponse = Ribbit.Messages().getMessage(getSentMessageMethodCallback, messageId, "sent");
	if (!Ribbit.asynchronous) {
		return getSentMessageCallback(getSentMessageResponse);
	}
};
/**
 * Gets details of a sent message
 * This method is asynchronous. Subscribe to the event getMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 */
Ribbit.Message.prototype.getReceivedMessage = function(callback, messageId) {
	function getReceivedMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		callback = a.callback;
	}
	var getReceivedMessageMethodCallback = Ribbit.asynchronous ? getReceivedMessageCallback : null;
	var getReceivedMessageResponse = Ribbit.Messages().getMessage(getReceivedMessageMethodCallback, messageId, "inbox");
	if (!Ribbit.asynchronous) {
		return getReceivedMessageCallback(getReceivedMessageResponse);
	}
};
/**
 * Gets a collection of details of messages associated with the current User. This method supports pagination and filtering, both separately and in combination
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Message.prototype.getMessages = function(callback, startIndex, count, filterBy, filterValue) {
	function getMessagesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getMessagesMethodCallback = Ribbit.asynchronous ? getMessagesCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "messages/" + userId + q;
	var getMessagesResponse = Ribbit.signedRequest().doGet(uri, getMessagesMethodCallback);
	if (!Ribbit.asynchronous) {
		return getMessagesCallback(getMessagesResponse);
	}
};
/**
 * Get a list of messages filtered by status. Values are 'delivered', 'received' and 'failed'
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param status string: The value which represents the delivery status, to this recipient, of the Message (required)
 * @return array: an array, each entry of which contains an object of details about the MessageResource, or a RibbitException
 */
Ribbit.Message.prototype.getMessagesFilteredByStatus = function(callback, status) {
	function getMessagesFilteredByStatusCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		status = a.status;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(status)) {
		exceptions.push("status is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getMessagesFilteredByStatusMethodCallback = Ribbit.asynchronous ? getMessagesFilteredByStatusCallback : null;
	var getMessagesFilteredByStatusResponse = Ribbit.Messages().getMessages(getMessagesFilteredByStatusMethodCallback, null, null, "messageStatus", status);
	if (!Ribbit.asynchronous) {
		return getMessagesFilteredByStatusCallback(getMessagesFilteredByStatusResponse);
	}
};
/**
 * Get a list of messages filtered by a tag
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param tag string:  (required)
 * @return array: an array, each entry of which contains an object of details about the MessageResource, or a RibbitException
 */
Ribbit.Message.prototype.getMessagesFilteredByTag = function(callback, tag) {
	function getMessagesFilteredByTagCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		tag = a.tag;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(tag)) {
		exceptions.push("tag is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getMessagesFilteredByTagMethodCallback = Ribbit.asynchronous ? getMessagesFilteredByTagCallback : null;
	var getMessagesFilteredByTagResponse = Ribbit.Messages().getMessages(getMessagesFilteredByTagMethodCallback, null, null, "tags", tag);
	if (!Ribbit.asynchronous) {
		return getMessagesFilteredByTagCallback(getMessagesFilteredByTagResponse);
	}
};
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @return array: an array, each entry of which contains an object of details about the MessageResource, or a RibbitException
 */
Ribbit.Message.prototype.getNewMessages = function(callback) {
	function getNewMessagesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var getNewMessagesMethodCallback = Ribbit.asynchronous ? getNewMessagesCallback : null;
	var getNewMessagesResponse = Ribbit.Messages().getMessages(getNewMessagesMethodCallback, null, null, "messageStatus", "new");
	if (!Ribbit.asynchronous) {
		return getNewMessagesCallback(getNewMessagesResponse);
	}
};
/**
 * Gets a collection of details of messages received by the current User. This method supports pagination
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Message.prototype.getReceivedMessages = function(callback, startIndex, count) {
	function getReceivedMessagesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getReceivedMessagesMethodCallback = Ribbit.asynchronous ? getReceivedMessagesCallback : null;
	var q = Ribbit.Util.createPagingQueryString(startIndex, count);
	var uri = "messages/" + userId + "/inbox" + q;
	var getReceivedMessagesResponse = Ribbit.signedRequest().doGet(uri, getReceivedMessagesMethodCallback);
	if (!Ribbit.asynchronous) {
		return getReceivedMessagesCallback(getReceivedMessagesResponse);
	}
};
/**
 * Gets a collection of details of messages sent by the current User. This method supports pagination
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.Message.prototype.getSentMessages = function(callback, startIndex, count) {
	function getSentMessagesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getSentMessagesMethodCallback = Ribbit.asynchronous ? getSentMessagesCallback : null;
	var q = Ribbit.Util.createPagingQueryString(startIndex, count);
	var uri = "messages/" + userId + "/sent" + q;
	var getSentMessagesResponse = Ribbit.signedRequest().doGet(uri, getSentMessagesMethodCallback);
	if (!Ribbit.asynchronous) {
		return getSentMessagesCallback(getSentMessagesResponse);
	}
};
/**
 * Update a message. Move it to a folder or flag it
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 * @param newMessage boolean: Whether the message is flagged as 'new' (optional)
 * @param urgent boolean: Whether the message is flagged as 'urgent' (optional)
 * @param newFolder string: A folder that contains messages (optional)
 * @return object: an object containing details about the MessageResource, or a RibbitException
 */
Ribbit.Message.prototype.updateMessage = function(callback, messageId, folder, newMessage, urgent, newFolder) {
	function updateMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		newMessage = a.newMessage;
		urgent = a.urgent;
		newFolder = a.newFolder;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(messageId)) {
		exceptions.push("messageId is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(folder)) {
		exceptions.push("When defined, folder must be a string of one or more characters");
	}
	if (!Ribbit.Util.isBoolIfDefined(newMessage)) {
		exceptions.push("When defined, newMessage must be boolean");
	}
	if (!Ribbit.Util.isBoolIfDefined(urgent)) {
		exceptions.push("When defined, urgent must be boolean");
	}
	if (!Ribbit.Util.isValidStringIfDefined(newFolder)) {
		exceptions.push("When defined, newFolder must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	if (Ribbit.Util.isSet(newMessage)) {
		params["new"] = newMessage;
	}
	if (Ribbit.Util.isSet(urgent)) {
		params.urgent = urgent;
	}
	if (Ribbit.Util.isSet(newFolder)) {
		params.folder = newFolder;
	}
	var updateMessageMethodCallback = Ribbit.asynchronous ? updateMessageCallback : null;
	var uri = "messages/" + userId + "/" + folder + "/" + messageId;
	var updateMessageResponse = Ribbit.signedRequest().doPut(uri, params, updateMessageMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateMessageCallback(updateMessageResponse);
	}
};
/**
 * Flag a message as 'urgent'
 * This method is asynchronous. Subscribe to the event updateMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 */
Ribbit.Message.prototype.markMessageUrgent = function(callback, messageId, folder) {
	function markMessageUrgentCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	var markMessageUrgentMethodCallback = Ribbit.asynchronous ? markMessageUrgentCallback : null;
	var markMessageUrgentResponse = Ribbit.Messages().updateMessage(markMessageUrgentMethodCallback, messageId, folder, null, true, null);
	if (!Ribbit.asynchronous) {
		return markMessageUrgentCallback(markMessageUrgentResponse);
	}
};
/**
 * 
 * This method is asynchronous. Subscribe to the event updateMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 */
Ribbit.Message.prototype.markMessageNotUrgent = function(callback, messageId, folder) {
	function markMessageNotUrgentCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	var markMessageNotUrgentMethodCallback = Ribbit.asynchronous ? markMessageNotUrgentCallback : null;
	var markMessageNotUrgentResponse = Ribbit.Messages().updateMessage(markMessageNotUrgentMethodCallback, messageId, folder, null, false, null);
	if (!Ribbit.asynchronous) {
		return markMessageNotUrgentCallback(markMessageNotUrgentResponse);
	}
};
/**
 * Flag a message as 'new'
 * This method is asynchronous. Subscribe to the event updateMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 */
Ribbit.Message.prototype.markMessageNew = function(callback, messageId, folder) {
	function markMessageNewCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	var markMessageNewMethodCallback = Ribbit.asynchronous ? markMessageNewCallback : null;
	var markMessageNewResponse = Ribbit.Messages().updateMessage(markMessageNewMethodCallback, messageId, folder, true, null, null);
	if (!Ribbit.asynchronous) {
		return markMessageNewCallback(markMessageNewResponse);
	}
};
/**
 * 
 * This method is asynchronous. Subscribe to the event updateMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 */
Ribbit.Message.prototype.markMessageRead = function(callback, messageId, folder) {
	function markMessageReadCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	var markMessageReadMethodCallback = Ribbit.asynchronous ? markMessageReadCallback : null;
	var markMessageReadResponse = Ribbit.Messages().updateMessage(markMessageReadMethodCallback, messageId, folder, false, null, null);
	if (!Ribbit.asynchronous) {
		return markMessageReadCallback(markMessageReadResponse);
	}
};
/**
 * 
 * This method is asynchronous. Subscribe to the event updateMessageComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param messageId string: A message identifier (required)
 * @param folder string: A folder that contains messages (optional)
 */
Ribbit.Message.prototype.deleteMessage = function(callback, messageId, folder) {
	function deleteMessageCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		messageId = a.messageId;
		folder = a.folder;
		callback = a.callback;
	}
	var deleteMessageMethodCallback = Ribbit.asynchronous ? deleteMessageCallback : null;
	var deleteMessageResponse = Ribbit.Messages().updateMessage(deleteMessageMethodCallback, messageId, folder, null, null, "deleted");
	if (!Ribbit.asynchronous) {
		return deleteMessageCallback(deleteMessageResponse);
	}
};
/**
 * Constructor for Ribbit.CallLegDtmfRequest
 * 
 * @param flush boolean: Set this to true to disregard any keypresses prior to audio being played
 * @param maxDigits int: The maximum number of key presses to collect
 * @param stoptones string: Stop recording when a keypad digit, or digits, are pressed
 * @param timeOut int: The number of milliseconds after which the service should stop collecting digits
 * @param maxInterval int: The maximum length of time (in milliseconds) to wait between keypresses without stopping digit collection
 */
Ribbit.CallLegDtmfRequest = function(flush, maxDigits, stoptones, timeOut, maxInterval) {
	/**
	 * Set this to true to disregard any keypresses prior to audio being played
	 */
	this.flush = (flush !== undefined) ? flush : null;
	/**
	 * The maximum number of key presses to collect
	 */
	this.maxDigits = (maxDigits !== undefined) ? maxDigits : null;
	/**
	 * Stop recording when a keypad digit, or digits, are pressed
	 */
	this.stoptones = (stoptones !== undefined) ? stoptones : null;
	/**
	 * The number of milliseconds after which the service should stop collecting digits
	 */
	this.timeOut = (timeOut !== undefined) ? timeOut : null;
	/**
	 * The maximum length of time (in milliseconds) to wait between keypresses without stopping digit collection
	 */
	this.maxInterval = (maxInterval !== undefined) ? maxInterval : null;
	/**
	 * Gets the validation error messages for this object.
	 */
	this.getValidationMessage = function() {
		var exceptions = [];
		if (!Ribbit.Util.isBool(this.flush)) {
			exceptions.push("flush is required");
		}
		if (!Ribbit.Util.isPositiveInteger(this.maxDigits)) {
			exceptions.push("maxDigits is required");
		}
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)) {
			exceptions.push("When defined, stoptones must be a string of one or more characters");
		}
		if (!Ribbit.Util.isPositiveInteger(this.timeOut)) {
			exceptions.push("timeOut is required");
		}
		if (!Ribbit.Util.isPositiveInteger(this.maxInterval)) {
			exceptions.push("maxInterval is required");
		}
		return exceptions.join(",");
	};
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function() {
		var v = {};
		if (Ribbit.Util.isSet(this.flush)) {
			v.flush = this.flush;
		}
		if (Ribbit.Util.isSet(this.maxDigits)) {
			v.maxDigits = this.maxDigits;
		}
		if (Ribbit.Util.isSet(this.stoptones)) {
			v.stopTones = this.stoptones;
		}
		if (Ribbit.Util.isSet(this.timeOut)) {
			v.timeOut = this.timeOut;
		}
		if (Ribbit.Util.isSet(this.maxInterval)) {
			v.maxInterval = this.maxInterval;
		}
		return v;
	};
};
/**
 * Constructor for Ribbit.CallPlayMedia
 * 
 * @param type string: The type of media to play, available in constants. For example, use "file" to play a file, or "string" to say an arbitrary string
 * @param value string: Either a URI to a file already saved on the Ribbit Platform, or a value to be said by the Text To Speech Engine
 * @param offset int: The position in the file to start playing. Usually 0
 * @param duration int: The length of the file to play. Set to -1 to play the entire file
 */
Ribbit.CallPlayMedia = function(type, value, offset, duration) {
	/**
	 * The type of media to play, available in constants. For example, use "file" to play a file, or "string" to say an arbitrary string
	 */
	this.type = (type !== undefined) ? type : null;
	/**
	 * Either a URI to a file already saved on the Ribbit Platform, or a value to be said by the Text To Speech Engine
	 */
	this.value = (value !== undefined) ? value : null;
	/**
	 * The position in the file to start playing. Usually 0
	 */
	this.offset = (offset !== undefined) ? offset : null;
	/**
	 * The length of the file to play. Set to -1 to play the entire file
	 */
	this.duration = (duration !== undefined) ? duration : null;
	/**
	 * Gets the validation error messages for this object.
	 */
	this.getValidationMessage = function() {
		var exceptions = [];
		if (!Ribbit.Util.isValidString(this.type)) {
			exceptions.push("type is required");
		}
		if (!Ribbit.Util.isValidString(this.value)) {
			exceptions.push("value is required");
		}
		if (!Ribbit.Util.isNumber(this.offset)) {
			exceptions.push("offset is required");
		}
		if (!Ribbit.Util.isNumber(this.duration)) {
			exceptions.push("duration is required");
		}
		return exceptions.join(",");
	};
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function() {
		var v = {};
		if (Ribbit.Util.isSet(this.type)) {
			v.type = this.type;
		}
		if (Ribbit.Util.isSet(this.value)) {
			v.value = this.value;
		}
		if (Ribbit.Util.isSet(this.offset)) {
			v.offset = this.offset;
		}
		if (Ribbit.Util.isSet(this.duration)) {
			v.duration = this.duration;
		}
		return v;
	};
};
/**
 * Constructor for Ribbit.CallPlayRequest
 * 
 * @param media CallPlayMedia: A collection of files and/or Text To Speech elements
 * @param transactionId string: A transaction identifier
 * @param stoptones string: Stop playing media when a keypad digit, or digits, are pressed
 * @param flush boolean: Set this to true to disregard any keypresses prior to audio being played
 */
Ribbit.CallPlayRequest = function(media, transactionId, stoptones, flush) {
	/**
	 * A collection of files and/or Text To Speech elements
	 */
	this.media = (media !== undefined) ? media : null;
	/**
	 * A transaction identifier
	 */
	this.transactionId = (transactionId !== undefined) ? transactionId : null;
	/**
	 * Stop playing media when a keypad digit, or digits, are pressed
	 */
	this.stoptones = (stoptones !== undefined) ? stoptones : null;
	/**
	 * Set this to true to disregard any keypresses prior to audio being played
	 */
	this.flush = (flush !== undefined) ? flush : null;
	/**
	 * Gets the validation error messages for this object.
	 */
	this.getValidationMessage = function() {
		var exceptions = [];
		if (!Ribbit.Util.isNonEmptyArray(this.media)) {
			exceptions.push("media must be an array containing instances of Ribbit.CallPlayMedia");
		} else {
			for (var i = 0; i < this.media.length; i++) {
				if (! (this.media[i] instanceof Ribbit.CallPlayMedia)) {
					exceptions.push("media contains objects that are not instances of Ribbit.CallPlayMedia");
					break;
				}
			}
		}
		if (exceptions.length === 0) {
			for (i = 0; i < this.media.length; i++) {
				if (this.media[i].getValidationMessage() !== "") {
					exceptions.push(this.media[i].getValidationMessage());
				}
			}
		}
		if (!Ribbit.Util.isValidStringIfDefined(this.transactionId)) {
			exceptions.push("When defined, transactionId must be a string of one or more characters");
		}
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)) {
			exceptions.push("When defined, stoptones must be a string of one or more characters");
		}
		if (!Ribbit.Util.isBool(this.flush)) {
			exceptions.push("flush is required");
		}
		return exceptions.join(",");
	};
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function() {
		var v = {};
		if (Ribbit.Util.isSet(this.media)) {
			var arr = [];
			for (var i = 0; i < this.media.length; i++) {
				arr.push(this.media[i].toObject());
			}
			v.media = arr;
		}
		if (Ribbit.Util.isSet(this.transactionId)) {
			v.transactionId = this.transactionId;
		}
		if (Ribbit.Util.isSet(this.stoptones)) {
			v.stoptones = this.stoptones;
		}
		if (Ribbit.Util.isSet(this.flush)) {
			v.flush = this.flush;
		}
		return v;
	};
};
/**
 * Constructor for Ribbit.CallRecordRequest
 * 
 * @param file string: The file to record to, a relative URI such as media/domain/myfolder/recording.mp3
 * @param append boolean: Set to true to append the recording to an existing file
 * @param flush boolean: Set this to true to disregard any keypresses prior to audio being played
 * @param duration int: The length of the recording to make, in seconds
 * @param stoptones string: Stop recording when a keypad digit, or digits, are pressed
 */
Ribbit.CallRecordRequest = function(file, append, flush, duration, stoptones) {
	/**
	 * The file to record to, a relative URI such as media/domain/myfolder/recording.mp3
	 */
	this.file = (file !== undefined) ? file : null;
	/**
	 * Set to true to append the recording to an existing file
	 */
	this.append = (append !== undefined) ? append : null;
	/**
	 * Set this to true to disregard any keypresses prior to audio being played
	 */
	this.flush = (flush !== undefined) ? flush : null;
	/**
	 * The length of the recording to make, in seconds
	 */
	this.duration = (duration !== undefined) ? duration : null;
	/**
	 * Stop recording when a keypad digit, or digits, are pressed
	 */
	this.stoptones = (stoptones !== undefined) ? stoptones : null;
	/**
	 * Gets the validation error messages for this object.
	 */
	this.getValidationMessage = function() {
		var exceptions = [];
		if (!Ribbit.Util.isValidString(this.file)) {
			exceptions.push("file is required");
		}
		if (!Ribbit.Util.isBoolIfDefined(this.append)) {
			exceptions.push("When defined, append must be boolean");
		}
		if (!Ribbit.Util.isBool(this.flush)) {
			exceptions.push("flush is required");
		}
		if (!Ribbit.Util.isPositiveIntegerIfDefined(this.duration)) {
			exceptions.push("When defined, duration must be a positive integer");
		}
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)) {
			exceptions.push("When defined, stoptones must be a string of one or more characters");
		}
		return exceptions.join(",");
	};
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function() {
		var v = {};
		if (Ribbit.Util.isSet(this.file)) {
			v.file = this.file;
		}
		if (Ribbit.Util.isSet(this.append)) {
			v.append = this.append;
		}
		if (Ribbit.Util.isSet(this.flush)) {
			v.flush = this.flush;
		}
		if (Ribbit.Util.isSet(this.duration)) {
			v.duration = this.duration;
		}
		if (Ribbit.Util.isSet(this.stoptones)) {
			v.stoptones = this.stoptones;
		}
		return v;
	};
};
/**
 * This function allows you to impersonate other users. You must be logged in as an admin user AND use your application secret key. 
 * Be very careful when using your application secret key in client side scripts
 */
Ribbit.setImpersonatedUserId = function(userId) {
	if (Ribbit.Util.isValidString(userId)) {
		Ribbit.customHeaders = function() {
			return [["X-BT-Ribbit-SP-UserId", userId]];
		};
	} else {
		Ribbit.clearImpersonatedUserId();
	}
};
/**
 * This function unsets the impersonation header used in requests 
 */
Ribbit.clearImpersonatedUserId = function() {
	Ribbit.customHeaders = function() {
		return [];
	};
};
/**
 * Allows an array of custom headers to be injected into the request.  
 *
 * @private
 * @function
 */
Ribbit.customHeaders = function() {
	return [];
};
/**
 *  The user agent string passed in each request
 */
Ribbit.userAgent = "ribbit_javascript_library_1.6.1";
/**
 *  The Ribbit library stores its configuration in a session cookie. This variable is the name of that cookie.
 */
Ribbit.cookie = "ribbit_config";
/**
 * Provides access to the Applications resource
 * 
 * @return Ribbit.Application
 * @link Ribbit.Application
 * @public
 * @function
 * 
 */
Ribbit.Applications = function() {
	return new Ribbit.Application();
};
/**
 * Provides access to the Calls resource
 * 
 * @return Ribbit.Call
 * @link Ribbit.Call
 * @public
 * @function
 * 
 */
Ribbit.Calls = function() {
	return new Ribbit.Call();
};
/**
 * Provides access to the Devices resource
 * 
 * @return Ribbit.Device
 * @link Ribbit.Device
 * @public
 * @function
 * 
 */
Ribbit.Devices = function() {
	return new Ribbit.Device();
};
/**
 * Provides access to the Domains resource
 * 
 * @return Ribbit.Domain
 * @link Ribbit.Domain
 * @public
 * @function
 * 
 */
Ribbit.Domains = function() {
	return new Ribbit.Domain();
};
/**
 * Provides access to the Labels resource
 * 
 * @return Ribbit.Label
 * @link Ribbit.Label
 * @public
 * @function
 * 
 */
Ribbit.Labels = function() {
	return new Ribbit.Label();
};
/**
 * Provides access to the Media resource
 * 
 * @return Ribbit.MediaFiles
 * @link Ribbit.MediaFiles
 * @public
 * @function
 * 
 */
Ribbit.Media = function() {
	return new Ribbit.MediaFiles();
};
/**
 * Provides access to the Messages resource
 * 
 * @return Ribbit.Message
 * @link Ribbit.Message
 * @public
 * @function
 * 
 */
Ribbit.Messages = function() {
	return new Ribbit.Message();
};
/**
 * Provides access to the Services resource
 * 
 * @return Ribbit.Service
 * @link Ribbit.Service
 * @public
 * @function
 * 
 */
Ribbit.Services = function() {
	return new Ribbit.Service();
};
/**
 * Provides access to the Tokens resource
 * 
 * @return Ribbit.Token
 * @link Ribbit.Token
 * @public
 * @function
 * 
 */
Ribbit.Tokens = function() {
	return new Ribbit.Token();
};
/**
 * Provides access to the Users resource
 * 
 * @return Ribbit.User
 * @link Ribbit.User
 * @public
 * @function
 * 
 */
Ribbit.Users = function() {
	return new Ribbit.User();
};
/**
 * @class Base class for RibbitExceptions.
 */
Ribbit.RibbitException = function(errorMessage, httpStatus, uri) {
	this.message = errorMessage;
	this.status = httpStatus;
	this.uri = uri;
	this.hasError = true;
};
/**
 * @class Returned when an attempt is made to access a method that requires an authenticated user (access token and access secret), and there is none.
 */
Ribbit.AuthenticatedUserRequiredException = function() {
	return new Ribbit.RibbitException("An authenticated user is required with this request", "");
};
/**
 * @class Returned when an attempt to make a signed request is made without a consumer token.
 */
Ribbit.TokenRequiredException = function() {
	return new Ribbit.RibbitException("You must initialize Ribbit with a consumer token", "");
};
/**
 * @class Returned when one or more of the provided arguments is invalid or missing.
 */
Ribbit.InvalidArgumentException = function(message) {
	return new Ribbit.RibbitException(message, "");
};
/**
 * @class Returned when one or more of the provided arguments is invalid or missing.
 */
Ribbit.AccessTokenExpiredException = function(message) {
	return new Ribbit.RibbitException("The logged in user session has expired. Please log in again", "");
};
Ribbit.JsonpRequest = function(method, uri, headers, body, signedRequest) {
	this.u = uri;
	this.q = null;
	this.callback = function(responseStatus, responseText, responseLocation) {
		signedRequest.callback({
			responseText: responseText,
			responseStatus: parseInt(responseStatus, 10),
			responseLocation: responseLocation
		});
	};
	this.id = "ribbit_jsonp_" + Ribbit.jsonpCallbacks.length;
	Ribbit.jsonpCallbacks.push({
		callback: this.callback,
		id: this.id
	});
	this.q = uri.indexOf("?") > 1 ? "&" : "?";
	this.q += "h=" + escape(Ribbit.Util.stringifyHeaders(headers));
	if (method !== "GET") {
		this.q += "&m=" + method;
	}
	if (Ribbit.Util.isValidString(body)) {
		this.q += "&b=" + escape(body);
	}
	if (signedRequest !== null) {
		this.q += "&c=" + (Ribbit.jsonpCallbacks.length - 1).toString();
	}
	this.q += "&w=JS";
	return this;
};
Ribbit.JsonpRequest.prototype.execute = function() {
	var script = document.createElement('script');
	script.type = "text/javascript";
	script.src = this.u + this.q;
	script.id = this.id;
	document.getElementsByTagName('head')[0].appendChild(script);
	Ribbit.accessTokenLastUsedTime = new Date().getTime();
};
Ribbit.RibbitSignedRequest = function() {
	this._oAuthRequest = null;
	return this;
};
Ribbit.RibbitSignedRequest.prototype.PUT = 'PUT';
Ribbit.RibbitSignedRequest.prototype.DELETE = 'DELETE';
Ribbit.RibbitSignedRequest.prototype.POST = 'POST';
Ribbit.RibbitSignedRequest.prototype.GET = 'GET';
Ribbit.RibbitSignedRequest.prototype.makeUri = function(uri) {
	var out;
	if (uri.substring(0, 4) === "http") {
		out = uri;
	} else {
		out = Ribbit.endpoint + Ribbit.Util.checkEndPointForSlash() + uri;
	}
	if (out.indexOf("?") > 0) {
		var uriBits = out.split("?");
		uriBits[1] = uriBits[1].replace("@", "%40", "g").replace(",", "%2C", "g");
		out = uriBits[0] + "?" + uriBits[1];
	}
	return out;
};
Ribbit.RibbitSignedRequest.prototype.doGet = function(uri, callback) {
	this._callback = callback;
	this._uri = uri;
	return this.send(this.GET, null);
};
Ribbit.RibbitSignedRequest.prototype.createStreamableUrl = function(uri) {
	uri = this.makeUri(uri);
	this._uri = uri;
	var headers = this.createHeaders(this.GET, null, null, null, Ribbit.Util.stringEndsWith(this._uri, ".mp3") ? "audio/mpeg" : "*");
	return uri + "?h=" + escape(Ribbit.Util.stringifyHeaders(headers));
};
Ribbit.RibbitSignedRequest.prototype.doGetStreamableUrl = function(uri, callback) {
	return Ribbit.respond(callback, this.createStreamableUrl(uri));
};
Ribbit.RibbitSignedRequest.prototype.doPost = function(uri, vars, callback, x_auth_username, x_auth_password) {
	this._callback = callback;
	this._uri = uri;
	if (vars) {
		vars = Ribbit.Util.JSON.stringify(vars);
	}
	return this.send(this.POST, vars, x_auth_username, x_auth_password);
};
Ribbit.RibbitSignedRequest.prototype.doPut = function(uri, vars, callback) {
	this._callback = callback;
	this._uri = uri;
	if (vars) {
		vars = Ribbit.Util.JSON.stringify(vars);
	}
	return this.send(this.PUT, vars);
};
Ribbit.RibbitSignedRequest.prototype.doDelete = function(uri, callback) {
	this._callback = callback;
	this._uri = uri;
	return this.send(this.DELETE, null);
};
Ribbit.RibbitSignedRequest.prototype.doCustom = function(method, uri, body, callback) {
	this._callback = callback;
	this._uri = uri;
	return this.send(method, body);
};
Ribbit.RibbitSignedRequest.prototype.callback = function(resp) {
	Ribbit.log({
		direction: "response",
		uri: this._uri,
		responseStatus: resp.responseStatus,
		responseLocation: resp.responseLocation,
		responseText: resp.responseText
	});
	if (resp.responseStatus === 201) {
		return Ribbit.respond(this._callback, resp.responseLocation);
	} else if (resp.responseStatus === 202) {
		return Ribbit.respond(this._callback, true);
	} else if (resp.responseStatus.toString().substr(0, 1) == '2') {
		return Ribbit.respond(this._callback, resp.responseText);
	} else {
		return Ribbit.respond(this._callback, new Ribbit.RibbitException(resp.responseText, resp.responseStatus, this._uri));
	}
};
Ribbit.RibbitSignedRequest.prototype.signForOAuth = function(clearText) {
	var consumerSecret = Ribbit.Util.isValidString(Ribbit.consumerSecret) ? Ribbit.consumerSecret : "";
	var accessSecret = Ribbit.Util.isValidString(Ribbit.accessSecret) ? Ribbit.accessSecret : "";
	return Ribbit.Util.sha1.b64_hmac_sha1(consumerSecret + '&' + accessSecret, clearText);
};
Ribbit.RibbitSignedRequest.prototype.createAuthHeader = function(method, body, x_auth_username, x_auth_password) {
	if (body !== null) {
		var bodySignature = this.signForOAuth(body);
	}
	var nonce = Ribbit.Util.uuid();
	var ts = new Date().getTime();
	var qps = (this._uri.indexOf("?") > 0) ? this._uri.substr(this._uri.indexOf("?") + 1, this._uri.length - this._uri.indexOf("?") - 1) : false;
	var p = {};
	p.oauth_consumer_key = Ribbit.consumerToken;
	p.oauth_nonce = nonce;
	p.oauth_signature_method = 'HMAC-SHA1';
	p.oauth_timestamp = ts;
	if (Ribbit.accessToken !== null) {
		p.oauth_token = Ribbit.accessToken;
	}
	if (x_auth_password) {
		p.x_auth_password = x_auth_password;
	}
	if (x_auth_username) {
		p.x_auth_username = x_auth_username;
	}
	if (bodySignature) {
		p.xoauth_body_signature = bodySignature;
		p.xoauth_body_signature_method = 'HMAC-SHA1';
	}
	if (qps) {
		qps = qps.split('&');
		for (var i = 0; i < qps.length; i++) {
			var ps = qps[i].split('=');
			p[ps[0]] = ps[1];
		}
	}
	var a = [];
	for (var k in p) {
		if (k) {
			a.push(k);
		}
	}
	a = a.sort();
	var q = '';
	for (i = 0; i < a.length; i++) {
		q += ((i > 0) ? '&' : '') + a[i] + '=' + p[a[i]];
	}
	var stringToSign = method + '&' + encodeURIComponent(Ribbit.Util.normalizeUri(this._uri)) + '&' + encodeURIComponent(q);
	var stringSignature = this.signForOAuth(stringToSign);
	return 'OAuth realm="' + encodeURIComponent('http://oauth.ribbit.com') + '"' + ',oauth_consumer_key="' + Ribbit.consumerToken + '"' + ',oauth_signature_method="HMAC-SHA1"' + ',oauth_timestamp="' + ts + '"' + ',oauth_nonce="' + nonce + '"' + ',oauth_signature="' + encodeURIComponent(stringSignature) + '"' + ((Ribbit.accessToken !== null) ? ',oauth_token="' + Ribbit.accessToken + '"' : '') + ((x_auth_password) ? ',x_auth_password="' + x_auth_password + '"' : '') + ((x_auth_username) ? ',x_auth_username="' + x_auth_username + '"' : '') + ((bodySignature) ? ',xoauth_body_signature_method="HMAC-SHA1",xoauth_body_signature="' + encodeURIComponent(bodySignature) + '"' : '');
};
Ribbit.RibbitSignedRequest.prototype.createHeaders = function(method, body, x_auth_username, x_auth_password, acceptType) {
	var h = [];
	h.push(['Host', Ribbit.Util.parseUri(this._uri).host]);
	h.push(['User-Agent', Ribbit.userAgent]);
	if (body !== null && x_auth_username === undefined) {
		h.push(['Content-type', 'application/json']);
	}
	h.push(['Accept', acceptType]);
	h.push(['Authorization', this.createAuthHeader(method, body, x_auth_username, x_auth_password)]);
	var ch = Ribbit.customHeaders();
	for (var i = 0; i < ch.length; i++) {
		if (ch[i]) {
			h.push(ch[i]);
		}
	}
	return h;
};
Ribbit.RibbitSignedRequest.prototype.send = function(method, body, x_auth_username, x_auth_password) {
	if (!Ribbit.asynchronous && Ribbit.useJsonp) {
		return Ribbit.respond(this._callback, new Ribbit.RibbitException("You can only use the Ribbit Javascript library synchronously when running off a file URI"));
	}
	if (!Ribbit.checkAccessTokenExpiry()) {
		return Ribbit.respond(this._callback, new Ribbit.AccessTokenExpiredException());
	}
	this._uri = this.makeUri(this._uri);
	var accept = "application/json";
	if (Ribbit.Util.stringEndsWith(this._uri, ".mp3")) {
		accept = "audio/mpeg";
	} else if (Ribbit.Util.stringEndsWith(this._uri, ".wav")) {
		accept = "*";
	} else if (Ribbit.Util.stringEndsWith(this._uri, ".txt")) {
		accept = "application/octet-stream";
	}
	var headers = this.createHeaders(method, body, x_auth_username, x_auth_password, accept);
	Ribbit.log({
		direction: "request",
		uri: this._uri,
		headers: headers,
		method: method,
		body: body
	});
	if (Ribbit.useJsonp) {
		this._oAuthRequest = new Ribbit.JsonpRequest(method, this._uri, headers, body, this);
		this._oAuthRequest.execute();
	} else {
		this._oAuthRequest = new Ribbit.WebRequest(method, this._uri, headers, body, Ribbit.asynchronous ? this : null);
		var resp = this._oAuthRequest.execute();
		if (!Ribbit.asynchronous) {
			return this.callback(resp);
		}
	}
};
Ribbit.requestToken = "";
Ribbit.requestSecret = "";
Ribbit.requestCallback = "";
/**
 * Call this method to authenticate a user on the Ribbit Mobile domain. 
 * 
 * You must have called Ribbit.init using a consumer key and secret key for your application, and that must be a guest on the Ribbit Mobile domain
 * Calling this will start a three legged oAuth process. The user will be directed to
 * the Ribbit For Mobile sign in page, and returned to this page when they have either approved or denied
 * access for your application to use their account.
 * 
 * You may specify a callback function by name, that will be invoked when control is returned to your page.
 * When control is returned to your application, please check the value of Ribbit.isLoggedIn, which will be true if the user approved 
 * your authentication request, otherwise it will be false
 * Normally you would call this with just the callbackFunctionName parameter - in this case the user will simply be redirected back to the current page.
 * 
 * @param callbackFunctionName string: The name of a function to be called when the page reloads - note that this must be the name of a function, and not a pointer - as the page redirects function pointers will be lost when the page reloads.
 * @param callbackUrl string: A url to redirect to. If this is "." or "" then the current page will be used.
 * @param redirect boolean: Normally defaults to true, determines if the user should be automatically redirected away from the page.
 * @public
 * @function
 */
Ribbit.getAuthenticatedUser = function(callbackFunctionName, callbackUrl, redirect) {
	Ribbit.Logoff();
	if (Ribbit.asynchronous && Ribbit.Util.isSet(callbackFunctionName) && !Ribbit.Util.isValidString(callbackFunctionName)) {
		throw new Ribbit.InvalidArgumentException("callbackFunctionName must be the name of a function, not a function pointer, and it must be supplied");
	} else if (!Ribbit.asynchronous && callbackFunctionName !== undefined) {
		throw new Ribbit.InvalidArgumentException("Do not supply a callback function when in asynchronous mode");
	}
	if (Ribbit.asynchronous && (callbackUrl === undefined || callbackUrl === "")) {
		callbackUrl = ".";
	}
	if (redirect === undefined) {
		redirect = window.location.toString().substr(0, 4) === "http" && callbackUrl.length > 0;
	}
	if (window.location.toString().substr(0, 4) !== "http" && redirect) {
		throw new Ribbit.InvalidArgumentException("Redirects are only allowed when running from an http uri");
	}
	Ribbit.requestCallback = callbackFunctionName;
	var cb = function(val) {
		if (!val.status) {
			var redirectUrl = Ribbit.parseRequestToken(val, callbackUrl);
			if (redirect) {
				window.location = redirectUrl;
			} else {
				if (!Ribbit.asynchronous) {
					return redirectUrl;
				} else if (Ribbit.Util.isFunction(callbackFunctionName)) {
					callbackFunctionName(redirectUrl);
				} else if (Ribbit.Util.isValidString(callbackFunctionName)) {
					Ribbit.doCallbackEval(callbackFunctionName, redirectUrl);
				}
			}
		} else {
			if (!Ribbit.asynchronous) {
				if (Ribbit.Util.isFunction(callbackFunctionName)) {
					callbackFunctionName(val);
				} else if (Ribbit.Util.isValidString(callbackFunctionName)) {
					Ribbit.doCallbackEval(callbackFunctionName, val);
				}
			}
		}
	};
	if (!Ribbit.asynchronous) {
		return cb(Ribbit.signedRequest().doPost("request_token", null));
	} else {
		Ribbit.signedRequest().doPost("request_token", null, cb);
	}
};
/**
 * Parses the request token returned from the Ribbit REST server at the start of the 3 legged authentication process. 
 * @private
 * @function
 */
Ribbit.parseRequestToken = function(val, callbackUrl) {
	var bits = val.split('&');
	Ribbit.requestToken = bits[0].split('=')[1];
	Ribbit.requestSecret = bits[1].split('=')[1];
	Ribbit.accessToken = Ribbit.requestToken;
	Ribbit.accessSecret = Ribbit.requestSecret;
	Ribbit.accessTokenAllocatedTime = new Date().getTime();
	Ribbit.accessTokenIdleTime = new Date().getTime();
	if (Ribbit.Util.isValidString(callbackUrl)) {
		callbackUrl = Ribbit.Util.redirectUrlBuilder(callbackUrl);
		callbackUrl = (Ribbit.Util.isValidString(callbackUrl) ? "&oauth_callback=" : "") + callbackUrl;
	} else {
		callbackUrl = "";
	}
	Ribbit.saveCookie();
	return Ribbit.endpoint + Ribbit.Util.checkEndPointForSlash() + "oauth/display_token.html?oauth_token=" + Ribbit.requestToken + callbackUrl;
};
/**
 * Call this method to create a url that a user should navigate to in order to allow your application to use their account on the Ribbit Mobile domain.
 * 
 * You must have called Ribbit.init3Legged using a consumer key and secret key for your application, and that must be a guest on the Ribbit Mobile domain
 * 
 * You may specify a callback function by name, that will be invoked when control is returned to your page.
 * When control is returned to your application, please check the value of Ribbit.isLoggedIn, which will be true if the user approved 
 * your authentication request, otherwise it will be false
 * Normally you would call this with just the callbackFunctionName parameter - in this case the user will simply be redirected back to the current page.
 * 
 * @param callback string: A function to send the created url to
 * @param callbackUrl string: A url to redirect to. If this is "." or "" then the current page will be used.
 * @public
 * @function
 */
Ribbit.createUserAuthenticationUrl = function(callback, callbackUrl) {
	var cb = function(val) {
		if (!val.status) {
			var redirectUrl = Ribbit.parseRequestToken(val, callbackUrl);
			if (!Ribbit.asynchronous) {
				return redirectUrl;
			} else if (Ribbit.Util.isSet(callback)) {
				callback(redirectUrl);
			}
		} else {
			if (!Ribbit.asynchronous) {
				return val;
			} else if (Ribbit.Util.isSet(callback)) {
				callback(val);
			}
		}
	};
	if (!Ribbit.asynchronous) {
		return cb(Ribbit.signedRequest().doPost("request_token", null));
	} else {
		Ribbit.signedRequest().doPost("request_token", null, cb);
	}
};
/**
 * Call this method to get a URL to which a user should be sent to approve your application. This method will not automatically redirect.
 * 
 * You must have called Ribbit.init using a secret key and consumer key for your application, and that must be a guest on the Ribbit Mobile domain
 * Calling this will start a three legged oAuth process. 
 * You may specify a callback function by name, that will be invoked when control is returned to your page. 
 * 
 * @param callbackFunctionName string: The name of a function to be called when the page reloads - note that this must be the name of a function, and not a pointer - as the page redirects function pointers will be lost when the page reloads.
 * @param callbackUrl string: A url to redirect to. If this is "." or "" then the current page will be used.
 * @public
 * @function
 */
Ribbit.getUserAuthenticationUrl = function(callbackFunctionName, callbackUrl) {
	return Ribbit.getAuthenticatedUser(callbackFunctionName, callbackUrl, false);
};
/**
 * @private
 * @function
 */
Ribbit.onWindowLoad = function() {
	if (Ribbit.asynchronous && !Ribbit.isLoggedIn && Ribbit.Util.isValidString(Ribbit.requestToken)) {
		var u = Ribbit.Util.parseUri(window.location.href);
		var q = u.query.split("&");
		for (var i = 0; i < q.length; i++) {
			var nvp = q[i].split("=");
			if (nvp[0] === "oauth_approval" && nvp[1] === "approved") {
				Ribbit.exchangeRequestToken();
			} else if (nvp[0] === "oauth_approval") {
				var cb = Ribbit.requestCallback;
				Ribbit.requestToken = "";
				Ribbit.requestSecret = "";
				Ribbit.requestCallback = "";
				Ribbit.accessToken = "";
				Ribbit.accessSecret = "";
				Ribbit.saveCookie();
				Ribbit.doCallbackEval(cb, false);
				if (Ribbit.Util.isValidString(cb)) {}
			}
		}
	}
};
/**
 * After a user has approved your application, you can call this function to finish the process and start the user session
 * 
 * Don't call this without having first called getUserAuthenticationUrl.
 * 
 * @param callback:function A function to be called when the exchange of request tokens for access tokens has completed.
 * @public
 * @function
 */
Ribbit.checkAuthenticatedUser = function(callback) {
	return Ribbit.exchangeRequestToken(callback);
};
/**
 * This method is called automatically when the user has approved access to your application.
 *
 * @private
 * @function
 */
Ribbit.exchangeRequestToken = function(callback) {
	var cb = function(val) {
		var c = "";
		if (!val.hasError) {
			Ribbit.requestToken = "";
			Ribbit.requestSecret = "";
			var bits = val.split('&');
			Ribbit.accessToken = bits[0].split('=')[1];
			Ribbit.accessSecret = bits[1].split('=')[1];
			Ribbit.accessTokenAllocatedTime = new Date().getTime();
			Ribbit.accessTokenLastUsedTime = new Date().getTime();
			Ribbit.userId = bits[2].split('=')[1];
			var u = unescape(bits[3].split('=')[1]);
			Ribbit.domain = u.split(':')[0];
			Ribbit.username = u.split(':')[1];
			Ribbit.isLoggedIn = true;
			val = true;
			Ribbit.startSessionCheckTimer();
		}
		if (Ribbit.Util.isValidString(Ribbit.requestCallback)) {
			c = Ribbit.requestCallback;
			Ribbit.requestCallback = "";
		}
		Ribbit.saveCookie();
		if (Ribbit.asynchronous && callback) {
			callback(val);
		} else if (!Ribbit.asynchronous) {
			return val;
		} else if (Ribbit.Util.isValidString(c)) {
			Ribbit.doCallbackEval(c, val);
		}
	};
	if (!Ribbit.asynchronous) {
		try {
			var result = cb(Ribbit.signedRequest().doPost("access_token", null));
		}
		catch(ex) {
			result = false;
		}
		if (callback) {
			callback(result);
		} else {
			return result;
		}
	} else {
		Ribbit.signedRequest().doPost("access_token", null, cb);
	}
};
/**
 * Use this function to login a user on your own application domain. We do not recommend using this method unless the end user himself
 * will lose out by giving away the user name and password. We strongly urge you NOT to hard code login and password values into your web application
 *
 * @public
 * @function
 */
Ribbit.login = function(callback, login, password) {
	function loginCallback(val) {
		if (val.status && val.status >= 400) {
			return Ribbit.respond(callback, val);
		} else {
			var bits = val.split('&');
			Ribbit.accessToken = bits[0].split('=')[1];
			Ribbit.accessSecret = bits[1].split('=')[1];
			Ribbit.accessTokenAllocatedTime = new Date().getTime();
			Ribbit.accessTokenLastUsedTime = new Date().getTime();
			Ribbit.userId = bits[2].split('=')[1];
			Ribbit.username = login;
			Ribbit.saveCookie();
			Ribbit.isLoggedIn = true;
			Ribbit.startSessionCheckTimer();
			return Ribbit.respond(callback, true);
		}
	}
	Ribbit.Logoff();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(login)) {
		exceptions.push("A login is required");
	}
	if (!Ribbit.Util.isValidString(password)) {
		exceptions.push("A password is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var loginMethodCallback = Ribbit.asynchronous ? loginCallback : null;
	var loginResponse = Ribbit.signedRequest().doPost("login", '', loginMethodCallback, login, password);
	if (!Ribbit.asynchronous) {
		return loginCallback(loginResponse);
	}
};
/**
 * Use this function to login a user on your own application domain. We do not recommend using this method unless the end user himself
 * will lose out by giving away the user name and password. We strongly urge you NOT to hard code login and password values into your web application
 *
 * @public
 * @function
 */
Ribbit.Login = function(callback, login, password) {
	if (callback === null) {
		return Ribbit.login(callback, login, password);
	} else {
		Ribbit.login(callback, login, password);
	}
};
/**
 * Use this function to logoff a user. This works regardless of how the user was authenticated
 *
 * @public
 * @function
 */
Ribbit.logoff = function() {
	Ribbit.accessToken = null;
	Ribbit.accessSecret = '';
	Ribbit.requestToken = null;
	Ribbit.requestSecret = null;
	Ribbit.userId = null;
	Ribbit.username = null;
	Ribbit.saveCookie();
	Ribbit.isLoggedIn = false;
};
Ribbit.Logoff = function() {
	Ribbit.logoff();
};
Ribbit.checkAccessTokenExpiry = function() {
	if (!Ribbit.Util.isValidString(Ribbit.accessToken)) {
		return true;
	}
	var now = new Date().getTime();
	if (now > Ribbit.accessTokenIdleExpiry + Ribbit.accessTokenLastUsedTime || now > Ribbit.accessTokenAllocatedTime + Ribbit.accessTokenExpiry) {
		return false;
	}
	return true;
};
Ribbit.sessionCheckTimer = null;
Ribbit.startSessionCheckTimer = function() {
	if (Ribbit.sessionCheckTimer) {
		clearInterval(Ribbit.sessionCheckTimer);
	}
	Ribbit.sessionCheckTimer = setInterval(function() {
		if (!Ribbit.checkAccessTokenExpiry()) {
			Ribbit.accessTokenExpired();
			clearInterval(Ribbit.sessionCheckTimer);
		}
	},
	10000);
};
Ribbit.getAuthenticatedUserInPopup = function(callback, name, windowOptions) {
	var win = null;
	//works around internet explorer 8 showing dialogs for cross ssl requests and blocking win.close
	//will result in a beep every 5 seconds after approval until the user clears dialogs.
	var closeWin = function() {
		(function() {
			try {
				if (!win.closed) {
					win.close();
				}
			} catch(e) {}
		})();
		if (win !== null && !win.closed) {
			setTimeout(closeWin, 5000);
		}
	};
	var gotUrlCallback = function(result) {
		if (result.hasError) {
			callback(new Ribbit.RibbitException("Cannot get request token, check application credentials.", 0));
		} else {
			var timeOutPoint = new Date().getTime() + 300000;
			var pollApproved = function() {
				var w = true;
				setTimeout(function() {
					if (w && (win === null || typeof(win) === "undefined")) {
						callback(new Ribbit.RibbitException("Could not open a new window. Pop ups may be blocked.", 0));
					} else {
						var closed = false;
						try {
							closed = win.closed;
						} catch(e) {}
						w = false;
						var cb = function(val) {
							if (!val.hasError) {
								closeWin();
								callback(true);
							} else if (new Date().getTime() > timeOutPoint) {
								closeWin();
								callback(new Ribbit.RibbitException("Timed out.", 0));
							} else if (closed) {
								callback(new Ribbit.RibbitException("User closed window without authenticating.", 0));
							} else {
								pollApproved();
							}
						};
						Ribbit.checkAuthenticatedUser(cb);
					}
				},
				4000);
			};
			name = name === undefined ? "RibbitLogin" : name;
			windowOptions = windowOptions === undefined ? "width=1024,height=800,toolbar:no" : windowOptions;
			win = window.open(result, name, windowOptions);
			pollApproved();
		}
	};
	Ribbit.createUserAuthenticationUrl(gotUrlCallback);
};
Ribbit.Util = {};
/*
Method: Math.uuid.js
Version: 1.3
Change History:
  v1.0 - first release
  v1.1 - less code and 2x performance boost (by minimizing calls to Math.random())
  v1.2 - Add support for generating non-standard uuids of arbitrary length
  v1.3 - Fixed IE7 bug (can't use []'s to access string chars.  Thanks, Brian R.)
  v1.4 - Changed method to be "Math.uuid". Added support for radix argument.  Use module pattern for better encapsulation.

Latest version:   http://www.broofa.com/Tools/Math.uuid.js
Information:      http://www.broofa.com/blog/?p=151
Contact:          robert@broofa.com
----
Copyright (c) 2008, Robert Kieffer
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
    * Neither the name of Robert Kieffer nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
Ribbit.Util.uuid = function() {
	// Private array of chars to use
	var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	return function(len, radix) {
		var chars = CHARS,
			uuid = [],
			rnd = Math.random;
		radix = radix || chars.length;
		if (len) {
			// Compact form
			for (var i = 0; i < len; i++) {
				uuid[i] = chars[0 | rnd() * radix];
			}
		} else {
			// rfc4122, version 4 form
			var r;
			// rfc4122 requires these characters
			uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
			uuid[14] = '4';
			// Fill in random data.  At i==19 set the high bits of clock sequence as
			// per rfc4122, sec. 4.1.5
			for (i = 0; i < 36; i++) {
				if (!uuid[i]) {
					r = 0 | rnd() * 16;
					uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
				}
			}
		}
		return uuid.join('');
	};
}();
Ribbit.Util.parseUri = function(uri) {
	var o = {};
	o.protocol = "";
	o.host = "";
	o.port = "";
	o.directory = "";
	o.file = "";
	o.query = "";
	o.fragment = "";
	o.toString = function() {
		return o.protocol + "://" + o.host + (Ribbit.Util.isValidString(o.port) && o.port !== "80" && o.protocol === "http" ? ":" + o.port : Ribbit.Util.isValidString(o.port) && o.port !== "443" && o.protocol === "https" ? ":" + o.port : "") + o.directory + o.file + (Ribbit.Util.isValidString(o.query) ? "?" + o.query : "");
	};
	var s = uri.split("#");
	if (s.length === 2) {
		o.query = s[1];
	}
	s = s[0];
	s = s.split("?");
	if (s.length === 2) {
		o.query = s[1];
	}
	s = s[0];
	var t = s.split("/");
	//fixes cases where duff input comes in 
	if (t.length < 3) {
		return o;
	}
	//get the protocol
	o.protocol = t[0].substring(0, t[0].length - 1);
	//get the host and port
	s = t[2].split(":");
	o.host = s[0].toLowerCase();
	if (s.length === 2) {
		o.port = s[1];
	}
	//get the file
	o.file = "/" + t[t.length - 1];
	//walk the rest
	for (var i = 3; i < t.length - 1; i++) {
		o.directory = o.directory + "/" + t[i];
	}
	return o;
};
Ribbit.Util.normalizeUri = function(uri) {
	var u = Ribbit.Util.parseUri(uri);
	return u.protocol + '://' + u.host + ((u.port === '') ? '' : ((u.protocol == 'https' && u.port !== '443') ? ':' + u.port : (u.protocol == 'http' && u.port !== '80') ? ':' + u.port : '')) + u.directory + u.file;
};
Ribbit.Util.isArray = function(v) {
	return Ribbit.Util.isSet(v) && v.constructor.toString().indexOf("Array") > 0;
};
Ribbit.Util.isArrayIfDefined = function(v) {
	return v === undefined || v === null || v === Ribbit.Util.isArray(v);
};
Ribbit.Util.isNonEmptyArray = function(v) {
	return Ribbit.Util.isArray(v) && v.length > 0;
};
Ribbit.Util.isNonEmptyArrayIfDefined = function(v) {
	return Ribbit.Util.isArrayIfDefined(v) || Ribbit.Util.isNonEmptyArray(v);
};
Ribbit.Util.makeOrderedArray = function(v) {
	if (v === "null" || v === {}) {
		v = [];
	}
	var r;
	if (Ribbit.Util.isArray(v)) {
		r = v;
	} else {
		r = [];
		var b = false;
		for (k in v) {
			if (k) {
				b = true;
				break;
			}
		}
		if (b) {
			r.push(v);
		}
	}
	return r;
};
Ribbit.Util.isEmptyObject = function(o) {
	var i;
	var b = true;
	if (typeof o === 'object') {
		for (i in o) {
			if (o[i] !== undefined && typeof o[i] !== 'function') {
				b = false;
			}
		}
	}
	return b;
};
Ribbit.Util.getInboundNumberFromId = function(id) {
	var i = id.lastIndexOf(":");
	var fullPhoneNumber = id.substring(i + 1);
	return fullPhoneNumber.replace("+", "");
};
Ribbit.Util.getIdFromUri = function(uri) {
	var i = uri.lastIndexOf("/");
	return uri.substr(i + 1, uri.length - i);
};
Ribbit.Util.isSet = function(v) {
	return v !== undefined && v !== null;
};
Ribbit.Util.isString = function(v) {
	return typeof(v) == "string";
};
Ribbit.Util.isNumber = function(v) {
	return typeof v === 'number' && isFinite(v);
};
Ribbit.Util.isFunction = function(v) {
	return v !== null && typeof(v) == 'function';
};
Ribbit.Util.isValidString = function(v) {
	return Ribbit.Util.isString(v) && v.length > 0;
};
Ribbit.Util.isValidStringIfDefined = function(v) {
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isValidString(v);
};
Ribbit.Util.isBool = function(v) {
	return typeof(v) == "boolean";
};
Ribbit.Util.isBoolIfDefined = function(v) {
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isBool(v);
};
Ribbit.Util.isValidDate = function(v) {
	return Ribbit.Util.isSet(v) && !isNaN(new Date(v).getFullYear());
};
Ribbit.Util.isValidDateIfDefined = function(v) {
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isValidDate(v);
};
Ribbit.Util.stringEndsWith = function(haystack, needle) {
	var i = haystack.length - needle.length;
	if (i < 0) {
		return false;
	}
	return (haystack.lastIndexOf(needle, i) == i);
};
Ribbit.Util.trim = function(str) {
	return Ribbit.Util.ltrim(Ribbit.Util.rtrim(str));
};
Ribbit.Util.ltrim = function(str) {
	return str.replace(new RegExp("^[\\s]+", "g"), "");
};
Ribbit.Util.rtrim = function(str) {
	return str.replace(new RegExp("[\\s]+$", "g"), "");
};
Ribbit.Util.toRequestDate = function(dt) {
	if (!Ribbit.Util.isValidDate(dt)) {
		dt = new Date(dt);
	}
	var y = dt.getFullYear().toString();
	var m = (dt.getUTCMonth() + 1).toString();
	if (m.length === 1) {
		m = "0" + m;
	}
	var d = dt.getUTCDate().toString();
	if (d.length === 1) {
		d = "0" + d;
	}
	var h = dt.getUTCHours().toString();
	if (h.length === 1) {
		h = "0" + h;
	}
	var n = dt.getUTCMinutes().toString();
	if (n.length === 1) {
		n = "0" + n;
	}
	var s = dt.getUTCSeconds().toString();
	if (s.length === 1) {
		s = "0" + s;
	}
	return y + "-" + m + "-" + d + "T" + h + ":" + n + ":" + s;
};
Ribbit.Util.toXmlDate = function(dt) {
	var requestDate = Ribbit.Util.toRequestDate(dt);
	return requestDate + "Z";
};
Ribbit.Util.fromXmlDate = function(dt) {
	var y = dt.substr(0, 4) - 0;
	var m = dt.substr(5, 2) - 1;
	var d = dt.substr(8, 2) - 0;
	var h = dt.substr(11, 2) - 0;
	var n = dt.substr(14, 2) - 0;
	var s = dt.substr(17, 2) - 0;
	return new Date(y, m, d, h, n, s);
};
Ribbit.Util.isPositiveInteger = function(v) {
	return Ribbit.Util.isSet(v) && (Math.floor(Math.abs((v - 0))).toString() === v.toString());
};
Ribbit.Util.isPositiveIntegerIfDefined = function(v) {
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isPositiveInteger(v);
};
Ribbit.Util.checkPagingParameters = function(startIndex, count) {
	var exceptions = [];
	if (Ribbit.Util.isSet(startIndex) && !Ribbit.Util.isSet(count)) {
		exceptions.push("If startIndex is specified, count must be specified too");
	}
	if (Ribbit.Util.isSet(count) && !Ribbit.Util.isSet(startIndex)) {
		exceptions.push("If count is specified, startIndex must be specified too");
	}
	if (Ribbit.Util.isSet(startIndex) && Ribbit.Util.isSet(count)) {
		if (!Ribbit.Util.isPositiveInteger(startIndex)) {
			exceptions.push("startIndex must be a positive integer");
		}
		if (!Ribbit.Util.isPositiveInteger(count)) {
			exceptions.push("count must be a positive integer");
		}
	}
	return exceptions;
};
Ribbit.Util.checkFilterParameters = function(filterBy, filterValue) {
	//fix for the case where a boolean filterValue passed in (messages/new in Kermit as an example)
	if (Ribbit.Util.isBool(filterValue)) {
		filterValue = filterValue ? "true" : "false";
	}
	var exceptions = [];
	if (Ribbit.Util.isSet(filterBy) && !Ribbit.Util.isSet(filterValue)) {
		exceptions.push("If filterBy is specified, filterValue must be specified too");
	}
	if (Ribbit.Util.isSet(filterValue) && !Ribbit.Util.isSet(filterBy)) {
		exceptions.push("If filterValue is specified, filterBy must be specified too");
	}
	if (Ribbit.Util.isSet(filterBy) && Ribbit.Util.isSet(filterValue)) {
		if (!Ribbit.Util.isValidStringIfDefined(filterBy)) {
			exceptions.push("When defined, filterBy must be a valid filtering property of the resource");
		}
		if (!Ribbit.Util.isValidStringIfDefined(filterValue)) {
			exceptions.push("When defined, filterValue must be a string of one or more characters");
		}
	}
	return exceptions;
};
Ribbit.Util.createPagingQueryString = function(startIndex, count) {
	return Ribbit.Util.isSet(count) ? "?" + Ribbit.Util.createPagingInnerString(startIndex, count) : "";
};
Ribbit.Util.createPagingInnerString = function(startIndex, count) {
	return "startIndex=" + startIndex + "&count=" + count;
};
Ribbit.Util.createFilteringQueryString = function(filterBy, filterValue) {
	return Ribbit.Util.isSet(filterBy) ? "?" + Ribbit.Util.createFilteringInnerString(filterBy, filterValue) : "";
};
Ribbit.Util.createFilteringInnerString = function(filterBy, filterValue) {
	return "filterBy=" + filterBy + "&filterValue=" + filterValue;
};
Ribbit.Util.createQueryString = function(startIndex, count, filterBy, filterValue) {
	var result = Ribbit.Util.createPagingQueryString(startIndex, count);
	if (result.length > 0 && Ribbit.Util.isSet(filterBy)) {
		result = result + "&" + Ribbit.Util.createFilteringInnerString(filterBy, filterValue);
	} else if (Ribbit.Util.isSet(filterBy)) {
		result = Ribbit.Util.createFilteringQueryString(filterBy, filterValue);
	}
	return result;
};
/*
 * Ribbit.Util.html_entity_decode and Ribbit.Util.get_html_translation_table
 *  
 * More info at: http://phpjs.org
 * 
 * This is version: 2.36
 * php.js is copyright 2009 Kevin van Zonneveld.
 * 
 * Portions copyright Kevin van Zonneveld (http://kevin.vanzonneveld.net),
 * Brett Zamir, Onno Marsman, Michael White (http://getsprink.com), Waldo
 * Malqui Silva, Paulo Ricardo F. Santos, Jack, Philip Peterson, Jonas Raoni
 * Soares Silva (http://www.jsfromhell.com), Legaev Andrey, Ates Goral
 * (http://magnetiq.com), Martijn Wieringa, Nate, Enrique Gonzalez, Philippe
 * Baumann, Webtoolkit.info (http://www.webtoolkit.info/), Carlos R. L.
 * Rodrigues (http://www.jsfromhell.com), Jani Hartikainen, Ash Searle
 * (http://hexmen.com/blog/), Alex, Johnny Mast (http://www.phpvrouwen.nl),
 * marrtins, d3x, GeekFG (http://geekfg.blogspot.com), Erkekjetter, Andrea
 * Giammarchi (http://webreflection.blogspot.com), David, mdsjack
 * (http://www.mdsjack.bo.it), Public Domain (http://www.json.org/json2.js),
 * Arpad Ray (mailto:arpad@php.net), Caio Ariede (http://caioariede.com),
 * Karol Kowalski, Tyler Akins (http://rumkin.com), Steven Levithan
 * (http://blog.stevenlevithan.com), Sakimori, AJ, Mirek Slugen, Alfonso
 * Jimenez (http://www.alfonsojimenez.com), Marc Palau, Thunder.m, Steve
 * Hilder, gorthaur, Pellentesque Malesuada, Aman Gupta, Paul, J A R, Marc
 * Jansen, David James, Hyam Singer (http://www.impact-computing.com/),
 * madipta, Douglas Crockford (http://javascript.crockford.com), john
 * (http://www.jd-tech.net), ger, Marco, noname, kenneth, T. Wild, Steve Clay,html
 * class_exists, Francesco, David Randall, LH, Lincoln Ramsay, djmix,
 * Linuxworld, Thiago Mata (http://thiagomata.blog.com), Sanjoy Roy, Bayron
 * Guevara, Felix Geisendoerfer (http://www.debuggable.com/felix), Subhasis
 * Deb, 0m3r, duncan, Gilbert, Jon Hohle, Pyerre, Bryan Elliott, Ozh, XoraX
 * (http://www.xorax.info), Der Simon (http://innerdom.sourceforge.net/), echo
 * is bad, Tim Wiel, Brad Touesnard, sankai, marc andreu, T0bsn, MeEtc
 * (http://yass.meetcweb.com), Peter-Paul Koch
 * (http://www.quirksmode.org/js/beat.html), Slawomir Kaniecki, nobbler, Pul,
 * Luke Godfrey, Eric Nagel, rezna, Martin Pool, Kirk Strobeck, Mick@el, Blues
 * (http://tech.bluesmoon.info/), Anton Ongson, Blues at
 * http://hacks.bluesmoon.info/strftime/strftime.js, Andreas, YUI Library:
 * http://developer.yahoo.com/yui/docs/YAHOO.util.DateLocale.html, Christian
 * Doebler, Simon Willison (http://simonwillison.net), Gabriel Paderni,
 * penutbutterjelly, Pierre-Luc Paour, Kristof Coomans (SCK-CEN Belgian
 * Nucleair Research Centre), hitwork, Norman "zEh" Fuchs, sowberry, Yves
 * Sucaet, Nick Callen, ejsanders, johnrembo, dptr1988, Pedro Tainha
 * (http://www.pedrotainha.com), Valentina De Rosa, Saulo Vallory, T.Wild,
 * metjay, DxGx, Alexander Ermolaev
 * (http://snippets.dzone.com/user/AlexanderErmolaev), ChaosNo1, Garagoth,
 * Andrej Pavlovic, Manish, Cord, Matt Bradley, Robin, Josh Fraser
 * (http://onlineaspect.com/2007/06/08/auto-detect-a-time-zone-with-javascript/),
 * FremyCompany, taith, Victor, stensi, Arno, Nathan, Mateusz "loonquawl"
 * Zalega, ReverseSyntax, Jalal Berrami, Francois, Scott Cariss, Breaking Par
 * Consulting Inc
 * (http://www.breakingpar.com/bkp/home.nsf/0/87256B280015193F87256CFB006C45F7),
 * Tod Gentille, Luke Smith (http://lucassmith.name), Rival, Cagri Ekin,
 * booeyOH, Dino, Leslie Hoare, Ben Bryan, Diogo Resende, Howard Yeend,
 * gabriel paderni, FGFEmperor, baris ozdil, Yannoo, jakes, Allan Jensen
 * (http://www.winternet.no), Benjamin Lupton, Atli Þór
 * 
 * Dual licensed under the MIT (MIT-LICENSE.txt)
 * and GPL (GPL-LICENSE.txt) licenses.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL KEVIN VAN ZONNEVELD BE LIABLE FOR ANY CLAIM, DAMAGES
 * OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
Ribbit.Util.html_entity_decode = function(s, quote_style) {
	var histogram = {},
		symbol = '',
		tmp_str = '',
		entity = '';
	tmp_str = s.toString();
	tmp_str = tmp_str.replace("&quot;", "\\\"", "g").replace("\n", "", "g");
	if (false === (histogram = Ribbit.Util.get_html_translation_table('HTML_ENTITIES', quote_style))) {
		return false;
	}
	// &amp; must be the last character when decoding!
	delete histogram['&'];
	histogram['&'] = '&amp;';
	for (symbol in histogram) {
		if (symbol) {
			entity = histogram[symbol];
			tmp_str = tmp_str.split(entity).join(symbol);
		}
	}
	return tmp_str;
};
Ribbit.Util.get_html_translation_table = function(table, quote_style) {
	var e = {},
		histogram = {},
		decimal = 0,
		symbol = '';
	var constMappingTable = {},
		constMappingQuoteStyle = {};
	var useTable = {},
		useQuoteStyle = {};
	useTable = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
	useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
	// Translate arguments
	constMappingTable[0] = 'HTML_SPECIALCHARS';
	constMappingTable[1] = 'HTML_ENTITIES';
	constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
	constMappingQuoteStyle[2] = 'ENT_COMPAT';
	constMappingQuoteStyle[3] = 'ENT_QUOTES';
	// Map numbers to strings for compatibilty with PHP constants
	if (!isNaN(useTable)) {
		useTable = constMappingTable[useTable];
	}
	if (!isNaN(useQuoteStyle)) {
		useQuoteStyle = constMappingQuoteStyle[useQuoteStyle];
	}
	if (useTable == 'HTML_SPECIALCHARS') {
		// ascii decimals for better compatibility
		e['38'] = '&amp;';
		if (useQuoteStyle != 'ENT_NOQUOTES') {
			e['34'] = '&quot;';
		}
		if (useQuoteStyle == 'ENT_QUOTES') {
			e['39'] = '&#039;';
		}
		e['60'] = '&lt;';
		e['62'] = '&gt;';
	} else if (useTable == 'HTML_ENTITIES') {
		// ascii decimals for better compatibility
		e['38'] = '&amp;';
		if (useQuoteStyle != 'ENT_NOQUOTES') {
			e['34'] = '&quot;';
		}
		if (useQuoteStyle == 'ENT_QUOTES') {
			e['39'] = '&#039;';
		}
		e['60'] = '&lt;';
		e['62'] = '&gt;';
		e['160'] = '&nbsp;';
		e['161'] = '&iexcl;';
		e['162'] = '&cent;';
		e['163'] = '&pound;';
		e['164'] = '&curren;';
		e['165'] = '&yen;';
		e['166'] = '&brvbar;';
		e['167'] = '&sect;';
		e['168'] = '&uml;';
		e['169'] = '&copy;';
		e['170'] = '&ordf;';
		e['171'] = '&laquo;';
		e['172'] = '&not;';
		e['173'] = '&shy;';
		e['174'] = '&reg;';
		e['175'] = '&macr;';
		e['176'] = '&deg;';
		e['177'] = '&plusmn;';
		e['178'] = '&sup2;';
		e['179'] = '&sup3;';
		e['180'] = '&acute;';
		e['181'] = '&micro;';
		e['182'] = '&para;';
		e['183'] = '&middot;';
		e['184'] = '&cedil;';
		e['185'] = '&sup1;';
		e['186'] = '&ordm;';
		e['187'] = '&raquo;';
		e['188'] = '&frac14;';
		e['189'] = '&frac12;';
		e['190'] = '&frac34;';
		e['191'] = '&iquest;';
		e['192'] = '&Agrave;';
		e['193'] = '&Aacute;';
		e['194'] = '&Acirc;';
		e['195'] = '&Atilde;';
		e['196'] = '&Auml;';
		e['197'] = '&Aring;';
		e['198'] = '&AElig;';
		e['199'] = '&Ccedil;';
		e['200'] = '&Egrave;';
		e['201'] = '&Eacute;';
		e['202'] = '&Ecirc;';
		e['203'] = '&Euml;';
		e['204'] = '&Igrave;';
		e['205'] = '&Iacute;';
		e['206'] = '&Icirc;';
		e['207'] = '&Iuml;';
		e['208'] = '&ETH;';
		e['209'] = '&Ntilde;';
		e['210'] = '&Ograve;';
		e['211'] = '&Oacute;';
		e['212'] = '&Ocirc;';
		e['213'] = '&Otilde;';
		e['214'] = '&Ouml;';
		e['215'] = '&times;';
		e['216'] = '&Oslash;';
		e['217'] = '&Ugrave;';
		e['218'] = '&Uacute;';
		e['219'] = '&Ucirc;';
		e['220'] = '&Uuml;';
		e['221'] = '&Yacute;';
		e['222'] = '&THORN;';
		e['223'] = '&szlig;';
		e['224'] = '&agrave;';
		e['225'] = '&aacute;';
		e['226'] = '&acirc;';
		e['227'] = '&atilde;';
		e['228'] = '&auml;';
		e['229'] = '&aring;';
		e['230'] = '&aelig;';
		e['231'] = '&ccedil;';
		e['232'] = '&egrave;';
		e['233'] = '&eacute;';
		e['234'] = '&ecirc;';
		e['235'] = '&euml;';
		e['236'] = '&igrave;';
		e['237'] = '&iacute;';
		e['238'] = '&icirc;';
		e['239'] = '&iuml;';
		e['240'] = '&eth;';
		e['241'] = '&ntilde;';
		e['242'] = '&ograve;';
		e['243'] = '&oacute;';
		e['244'] = '&ocirc;';
		e['245'] = '&otilde;';
		e['246'] = '&ouml;';
		e['247'] = '&divide;';
		e['248'] = '&oslash;';
		e['249'] = '&ugrave;';
		e['250'] = '&uacute;';
		e['251'] = '&ucirc;';
		e['252'] = '&uuml;';
		e['253'] = '&yacute;';
		e['254'] = '&thorn;';
		e['255'] = '&yuml;';
	} else {
		throw new Error("Table: " + useTable + ' not supported');
	}
	// ascii decimals to real symbols
	for (d in e) {
		if (d) {
			symbol = String.fromCharCode(d);
			histogram[symbol] = e[d];
		}
	}
	return histogram;
};
Ribbit.Util.stringifyHeaders = function(headers) {
	var h = '';
	//create pipe delimeted string of all the headers
	for (var p = 0; p < headers.length; p++) {
		h += ((p > 0) ? "|" : "") + headers[p][0] + '=' + headers[p][1];
	}
	return h;
};
Ribbit.Util.checkEndPointForSlash = function() {
	return ((Ribbit.endpoint.substr(Ribbit.endpoint.length - 1, 1) === "/") ? "" : "/");
};
Ribbit.Util.redirectUrlBuilder = function(url) {
	if (url === "." || url === "") {
		url = window.location.href.split("#")[0];
	}
	if (url.substring(0, 1, 1) === "?") {
		var url1 = window.location.href.split("#")[0];
		url = url1.split("?")[0] + url;
	}
	var u = Ribbit.Util.parseUri(url);
	if (Ribbit.Util.isValidString(u.query)) {
		var nvps = u.query.split("&");
		u.query = "";
		for (var i = 0; i < nvps.length; i++) {
			var q = nvps[i].split("=");
			if (q[0] !== "oauth_approval") {
				u.query += (u.query.length > 0 ? "&" : "") + nvps[i];
			}
		}
	}
	return u.toString();
};
Ribbit.WebRequest = function(method, uri, headers, body, signedRequest) {
	this.u = uri;
	this.b = body;
	this.m = method;
	this.sr = signedRequest;
	this.xhr = this.getRequest(method, uri);
	for (var p = 0; p < headers.length; p++) {
		this.xhr.setRequestHeader(headers[p][0], headers[p][1]);
	}
};
Ribbit.WebRequest.prototype.getRequest = function(method, uri) {
	var r;
	if (navigator.appName.indexOf("Microsoft") > -1) {
		try {
			r = new ActiveXObject("Microsoft.XMLHTTP");
		} catch(ie_ex) {
			throw new Ribbit.NoXhrException(ie_ex);
		}
	} else {
		r = new XMLHttpRequest();
	}
	if (navigator.appName.indexOf("Microsoft") < 0) {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
	}
	r.open(method, uri, Ribbit.asynchronous);
	return r;
};
Ribbit.WebRequest.prototype.processResponse = function() {
	return {
		responseText: this.xhr.responseText,
		responseStatus: this.xhr.status,
		responseLocation: (this.xhr.status == 201 || this.xhr.status == 202) ? this.xhr.getResponseHeader("LOCATION") : ""
	};
};
Ribbit.WebRequest.prototype.execute = function() {
	if (Ribbit.asynchronous) {
		var iv = setInterval(function(wr) {
			return function() {
				if (wr.xhr.readyState == 4) {
					clearInterval(iv);
					wr.sr.callback(wr.processResponse());
				}
			};
		}(this), 50);
	}
	this.xhr.send(this.b);
	Ribbit.accessTokenLastUsedTime = new Date().getTime();
	if (!Ribbit.asynchronous) {
		return this.processResponse();
	}
};
/**
 *
 
 */
/**
 * Provides access to theServices Resource - normally accessed through Ribbit.Services()
 *
 * @class Provides access to the Services Resource
 */
Ribbit.Service = function() {
	return this;
};
/**
 * 
 */
Ribbit.Service.SERVICE_TYPE_TRANSCRIPTION = "Transcription";
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @return array: an array, each entry of which contains an object of details about the ServiceResource, or a RibbitException
 */
Ribbit.Service.prototype.getServices = function(callback) {
	function getServicesCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var getServicesMethodCallback = Ribbit.asynchronous ? getServicesCallback : null;
	var uri = "services/" + userId;
	var getServicesResponse = Ribbit.signedRequest().doGet(uri, getServicesMethodCallback);
	if (!Ribbit.asynchronous) {
		return getServicesCallback(getServicesResponse);
	}
};
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string:  (required)
 * @param folders string:  (required)
 * @return object: an object containing details about the ServiceResource, or a RibbitException
 */
Ribbit.Service.prototype.setServiceFolders = function(callback, id, folders) {
	function setServiceFoldersCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		folders = a.folders;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(id)) {
		exceptions.push("id is required");
	}
	if (!Ribbit.Util.isArray(folders)) {
		exceptions.push("folders is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.folders = folders;
	var setServiceFoldersMethodCallback = Ribbit.asynchronous ? setServiceFoldersCallback : null;
	var uri = "services/" + userId + "/" + id;
	var setServiceFoldersResponse = Ribbit.signedRequest().doPut(uri, params, setServiceFoldersMethodCallback);
	if (!Ribbit.asynchronous) {
		return setServiceFoldersCallback(setServiceFoldersResponse);
	}
};
/**
 * 
 * This method is asynchronous. Subscribe to the event setServiceFoldersComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string:  (required)
 */
Ribbit.Service.prototype.clearServiceFolders = function(callback, id) {
	function clearServiceFoldersCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		callback = a.callback;
	}
	var clearServiceFoldersMethodCallback = Ribbit.asynchronous ? clearServiceFoldersCallback : null;
	var clearServiceFoldersResponse = Ribbit.Services().setServiceFolders(clearServiceFoldersMethodCallback, id, []);
	if (!Ribbit.asynchronous) {
		return clearServiceFoldersCallback(clearServiceFoldersResponse);
	}
};
/**
 * 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param id string:  (required)
 * @return object: an object containing details about the ServiceResource, or a RibbitException
 */
Ribbit.Service.prototype.setVoicemailTranscriptionProvider = function(callback, id) {
	function setVoicemailTranscriptionProviderCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		id = a.id;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(id)) {
		exceptions.push("id is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.voicemail = true;
	var setVoicemailTranscriptionProviderMethodCallback = Ribbit.asynchronous ? setVoicemailTranscriptionProviderCallback : null;
	var uri = "services/" + userId + "/" + id;
	var setVoicemailTranscriptionProviderResponse = Ribbit.signedRequest().doPut(uri, params, setVoicemailTranscriptionProviderMethodCallback);
	if (!Ribbit.asynchronous) {
		return setVoicemailTranscriptionProviderCallback(setVoicemailTranscriptionProviderResponse);
	}
};
/**
 *
 A Token is a resource that allows authentication of a User.
 * Token-based authentication allows you to build Applications and deploy them for multiple Users. An unlimited number of Users are able to interact in guest mode with Token-authenticated Ribbit applications.
 */
/**
 * Provides access to theTokens Resource - normally accessed through Ribbit.Tokens()
 *
 * @class Provides access to the Tokens Resource
 */
Ribbit.Token = function() {
	return this;
};
/**
 * Create a new Token. It is possible to specify the number of concurrent callers, and limit the token to operate only between certain dates.
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param type string: The type of token ('uphone' for YouPhone Tokens) (required)
 * @param callee string: A Device URI that represents the number or address called (eg tel:xxnnnnnnnn) (required)
 * @param caller string: A Device URI that represents the number or address used as caller ID (eg tel:xxnnnnnnnn) (required)
 * @param description string: A textual description of the Token (required)
 * @param startDate Date: The date before which the Token is invalid (optional)
 * @param endDate Date: The date after which the token is invalid (optional)
 * @param maxConcurrent int: The maximum number of concurrent connections using this token (optional)
 * @return A token identifier, or a RibbitException
 */
Ribbit.Token.prototype.createToken = function(callback, type, callee, caller, description, startDate, endDate, maxConcurrent) {
	function createTokenCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		type = a.type;
		callee = a.callee;
		caller = a.caller;
		description = a.description;
		startDate = a.startDate;
		endDate = a.endDate;
		maxConcurrent = a.maxConcurrent;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(type)) {
		exceptions.push("type is required");
	}
	if (!Ribbit.Util.isValidString(callee)) {
		exceptions.push("callee is required");
	}
	if (!Ribbit.Util.isValidString(caller)) {
		exceptions.push("caller is required");
	}
	if (!Ribbit.Util.isValidString(description)) {
		exceptions.push("description is required");
	}
	if (!Ribbit.Util.isValidDateIfDefined(startDate)) {
		exceptions.push("startDate is not a valid date");
	}
	if (!Ribbit.Util.isValidDateIfDefined(endDate)) {
		exceptions.push("endDate is not a valid date");
	}
	if (!Ribbit.Util.isPositiveIntegerIfDefined(maxConcurrent)) {
		exceptions.push("When defined, maxConcurrent must be a positive integer");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.type = type;
	params.callee = callee;
	params.caller = caller;
	params.description = description;
	if (Ribbit.Util.isSet(startDate)) {
		params.startDate = Ribbit.Util.toXmlDate(startDate);
	}
	if (Ribbit.Util.isSet(endDate)) {
		params.endDate = Ribbit.Util.toXmlDate(endDate);
	}
	if (Ribbit.Util.isSet(maxConcurrent)) {
		params.maxConcurrent = maxConcurrent;
	}
	var createTokenMethodCallback = Ribbit.asynchronous ? createTokenCallback : null;
	var uri = "tokens";
	var createTokenResponse = Ribbit.signedRequest().doPost(uri, params, createTokenMethodCallback);
	if (!Ribbit.asynchronous) {
		return createTokenCallback(createTokenResponse);
	}
};
/**
 * Creates a new YouPhone Token
 * This method is asynchronous. Subscribe to the event createTokenComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param callee string: A Device URI that represents the number or address called (eg tel:xxnnnnnnnn) (required)
 * @param caller string: A Device URI that represents the number or address used as caller ID (eg tel:xxnnnnnnnn) (required)
 * @param description string: A textual description of the Token (required)
 * @param startDate Date: The date before which the Token is invalid (optional)
 * @param endDate Date: The date after which the token is invalid (optional)
 * @param maxConcurrent int: The maximum number of concurrent connections using this token (optional)
 */
Ribbit.Token.prototype.createYouPhoneToken = function(callback, callee, caller, description, startDate, endDate, maxConcurrent) {
	function createYouPhoneTokenCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callee = a.callee;
		caller = a.caller;
		description = a.description;
		startDate = a.startDate;
		endDate = a.endDate;
		maxConcurrent = a.maxConcurrent;
		callback = a.callback;
	}
	var createYouPhoneTokenMethodCallback = Ribbit.asynchronous ? createYouPhoneTokenCallback : null;
	var createYouPhoneTokenResponse = Ribbit.Tokens().createToken(createYouPhoneTokenMethodCallback, "uphone", callee, caller, description, startDate, endDate, maxConcurrent);
	if (!Ribbit.asynchronous) {
		return createYouPhoneTokenCallback(createYouPhoneTokenResponse);
	}
};
/**
 * Retrieve the details of a Token that belongs to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param tokenId string: A Token identifier (required)
 * @return object: an object containing details about the TokenResource, or a RibbitException
 */
Ribbit.Token.prototype.getToken = function(callback, tokenId) {
	function getTokenCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		tokenId = a.tokenId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(tokenId)) {
		exceptions.push("tokenId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getTokenMethodCallback = Ribbit.asynchronous ? getTokenCallback : null;
	var uri = "tokens/" + userId + "/" + tokenId;
	var getTokenResponse = Ribbit.signedRequest().doGet(uri, getTokenMethodCallback);
	if (!Ribbit.asynchronous) {
		return getTokenCallback(getTokenResponse);
	}
};
/**
 * Retrieve a list of details about Tokens that belong to the current User. This method supports pagination
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @return array: an array, each entry of which contains an object of details about the TokenResource, or a RibbitException
 */
Ribbit.Token.prototype.getTokens = function(callback) {
	function getTokensCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (val === 'null') {
				ret = [];
			} else {
				ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var getTokensMethodCallback = Ribbit.asynchronous ? getTokensCallback : null;
	var uri = "tokens/" + userId;
	var getTokensResponse = Ribbit.signedRequest().doGet(uri, getTokensMethodCallback);
	if (!Ribbit.asynchronous) {
		return getTokensCallback(getTokensResponse);
	}
};
/**
 * Remove a Token that belongs to the current User
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param tokenId string: A Token identifier (required)
 * @return true if the token is successfully removed, or a RibbitException
 */
Ribbit.Token.prototype.removeToken = function(callback, tokenId) {
	function removeTokenCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = true;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		tokenId = a.tokenId;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isValidString(tokenId)) {
		exceptions.push("tokenId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var removeTokenMethodCallback = Ribbit.asynchronous ? removeTokenCallback : null;
	var uri = "tokens/" + userId + "/" + tokenId;
	var removeTokenResponse = Ribbit.signedRequest().doDelete(uri, removeTokenMethodCallback);
	if (!Ribbit.asynchronous) {
		return removeTokenCallback(removeTokenResponse);
	}
};
/**
 *
 A User represents registered end-users of Ribbit applications, and are defined by a unique ID and login. 
 * The unique ID, assigned to newly created User resources, also serves as the identifier for containers of other User-centric resources including Calls, Messages, and Devices.
 */
/**
 * Provides access to theUsers Resource - normally accessed through Ribbit.Users()
 *
 * @class Provides access to the Users Resource
 */
Ribbit.User = function() {
	return this;
};
/**
 * Filter Users by Active Profile
 */
Ribbit.User.FILTER_BY_ACTIVE_PROFILE = "activeProfile";
/**
 * Filter Users by Creator's User Id
 */
Ribbit.User.FILTER_BY_CREATED_BY = "createdBy";
/**
 * Filter Users by Creation date
 */
Ribbit.User.FILTER_BY_CREATED_ON = "createdOn";
/**
 * Filter Users by Dialing Plan
 */
Ribbit.User.FILTER_BY_DIALING_PLAN = "dialingPlan";
/**
 * Filter Users by Domain
 */
Ribbit.User.FILTER_BY_DOMAIN = "domain.name";
/**
 * Filter Users by First Name
 */
Ribbit.User.FILTER_BY_FIRST_NAME = "firstName";
/**
 * Filter Users by Last Name
 */
Ribbit.User.FILTER_BY_LAST_NAME = "lastName";
/**
 * Filter Users by Last Used date
 */
Ribbit.User.FILTER_BY_LAST_USED = "lastUsed";
/**
 * Filter Users by Login
 */
Ribbit.User.FILTER_BY_LOGIN = "login";
/**
 * Filter Users by Password Status
 */
Ribbit.User.FILTER_BY_PASSWORD_STATUS = "pwdStatus";
/**
 * Filter Users by User Id
 */
Ribbit.User.FILTER_BY_USER_ID = "guid";
/**
 * Create a new user
 * This method is not available through 2 legged authentication, where no consumer secret is used
 * 2 legged authentication is recommended for Browser based apps
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param login string: User login (e.g. foo@bar.com), unique within a domain (required)
 * @param password string: A Password for the User. (required)
 * @param firstName string: Non-unique name to refer to User. (optional)
 * @param lastName string: Non-unique name to refer to User. (optional)
 * @param accountId Long: The billing account ID used by this user, this must refer to a valid account in order for the user to conduct billable activity such as making calls, requesting purpose numbers etc. The account ID may be updated for a given user if and only if the authorized user making the request is the owner of the billing account or else the account ID is the same as the billing account ID used by the developer that "owns" the application making the request. (optional)
 * @param domain string: The Domain to which the User belongs. (optional)
 * @return An user identifier, or a RibbitException
 */
Ribbit.User.prototype.createUser = function(callback, login, password, firstName, lastName, accountId, domain) {
	function createUserCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.getIdFromUri(val);
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		login = a.login;
		password = a.password;
		firstName = a.firstName;
		lastName = a.lastName;
		accountId = a.accountId;
		domain = a.domain;
		callback = a.callback;
	}
	var exceptions = [];
	if (Ribbit.consumerSecret === null || Ribbit.consumerSecret === "") {
		exceptions.push("createUser is not available in two legged authentication mode");
	}
	if (!Ribbit.Util.isValidString(login)) {
		exceptions.push("login is required");
	}
	if (!Ribbit.Util.isValidString(password)) {
		exceptions.push("password is required");
	}
	if (!Ribbit.Util.isValidStringIfDefined(firstName)) {
		exceptions.push("When defined, firstName must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(lastName)) {
		exceptions.push("When defined, lastName must be a string of one or more characters");
	}
	if (!Ribbit.Util.isPositiveIntegerIfDefined(accountId)) {
		exceptions.push("When defined, accountId must be a positive integer");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.login = login;
	params.password = password;
	if (Ribbit.Util.isSet(firstName)) {
		params.firstName = firstName;
	}
	if (Ribbit.Util.isSet(lastName)) {
		params.lastName = lastName;
	}
	if (Ribbit.Util.isSet(accountId)) {
		params.accountId = accountId;
	}
	if (Ribbit.Util.isSet(domain)) {
		params.domain = domain;
	}
	var createUserMethodCallback = Ribbit.asynchronous ? createUserCallback : null;
	var uri = "users";
	var createUserResponse = Ribbit.signedRequest().doPost(uri, params, createUserMethodCallback);
	if (!Ribbit.asynchronous) {
		return createUserCallback(createUserResponse);
	}
};
/**
 * Get User details
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param userId string: Globally unique User identifier (GUID) (required)
 * @return object: an object containing details about the UserResource, or a RibbitException
 */
Ribbit.User.prototype.getUser = function(callback, userId) {
	function getUserCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		userId = a.userId;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(userId)) {
		exceptions.push("userId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getUserMethodCallback = Ribbit.asynchronous ? getUserCallback : null;
	var uri = "users/" + userId;
	var getUserResponse = Ribbit.signedRequest().doGet(uri, getUserMethodCallback);
	if (!Ribbit.asynchronous) {
		return getUserCallback(getUserResponse);
	}
};
/**
 * Get Users in the current domain
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param startIndex int: the first result to return when requesting a paged list (optional)
 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
 * @param filterBy string: an key to an index with which to filter results (optional)
 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
 * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
 */
Ribbit.User.prototype.getUsers = function(callback, startIndex, count, filterBy, filterValue) {
	function getUsersCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			if (Ribbit.Util.isSet(startIndex)) {
				ret = Ribbit.Util.JSON.parse(val);
				if (ret.startIndex === undefined) {
					ret.startIndex = 0;
					ret.itemsPerPage = 0;
					ret.totalResults = 0;
				}
			} else {
				if (val === 'null') {
					ret = [];
				} else {
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
				}
			}
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		startIndex = a.startIndex;
		count = a.count;
		filterBy = a.filterBy;
		filterValue = a.filterValue;
		callback = a.callback;
	}
	var exceptions = [];
	var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
	if (pagingParamError.length > 0) {
		exceptions.push(pagingParamError);
	}
	var filterParamError = Ribbit.Util.checkFilterParameters(filterBy, filterValue);
	if (filterParamError.length > 0) {
		exceptions.push(filterParamError);
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getUsersMethodCallback = Ribbit.asynchronous ? getUsersCallback : null;
	var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
	var uri = "users" + q;
	var getUsersResponse = Ribbit.signedRequest().doGet(uri, getUsersMethodCallback);
	if (!Ribbit.asynchronous) {
		return getUsersCallback(getUsersResponse);
	}
};
/**
 * Gets an array of User details, filtered by the supplied login parameter
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param login string: User login (e.g. foo@bar.com), unique within a domain (required)
 * @return array: an array, each entry of which contains an object of details about the UserResource, or a RibbitException
 */
Ribbit.User.prototype.getUsersFilteredByLogin = function(callback, login) {
	function getUsersFilteredByLoginCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		login = a.login;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(login)) {
		exceptions.push("login is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var getUsersFilteredByLoginMethodCallback = Ribbit.asynchronous ? getUsersFilteredByLoginCallback : null;
	var getUsersFilteredByLoginResponse = Ribbit.Users().getUsers(getUsersFilteredByLoginMethodCallback, null, null, "login", login);
	if (!Ribbit.asynchronous) {
		return getUsersFilteredByLoginCallback(getUsersFilteredByLoginResponse);
	}
};
/**
 * Requests a password reset for a user. This method is not compatible with 2 legged authentication, where a secret key is NOT supplied
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param userId string: Globally unique User identifier (GUID) (required)
 * @return object: an object containing details about the UserResource, or a RibbitException
 */
Ribbit.User.prototype.requestPasswordReset = function(callback, userId) {
	function requestPasswordResetCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		userId = a.userId;
		callback = a.callback;
	}
	var exceptions = [];
	if (!Ribbit.Util.isValidString(userId)) {
		exceptions.push("userId is required");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	params.pwdStatus = "reset";
	var requestPasswordResetMethodCallback = Ribbit.asynchronous ? requestPasswordResetCallback : null;
	var uri = "users/" + userId;
	var requestPasswordResetResponse = Ribbit.signedRequest().doPut(uri, params, requestPasswordResetMethodCallback);
	if (!Ribbit.asynchronous) {
		return requestPasswordResetCallback(requestPasswordResetResponse);
	}
};
/**
 * Update a users details, for example, change their billing account or reset their password
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param login string: User login (e.g. foo@bar.com), unique within a domain (optional)
 * @param password string: A Password for the User. (optional)
 * @param firstName string: Non-unique name to refer to User. (optional)
 * @param lastName string: Non-unique name to refer to User. (optional)
 * @param pwdStatus string: Set to 'reset' to have a new password sent to the User's email. (optional)
 * @param accountId Long: The billing account ID used by this user, this must refer to a valid account in order for the user to conduct billable activity such as making calls, requesting purpose numbers etc. The account ID may be updated for a given user if and only if the authorized user making the request is the owner of the billing account or else the account ID is the same as the billing account ID used by the developer that "owns" the application making the request. (optional)
 * @param domain string: The Domain to which the User belongs. (optional)
 * @param locale string: The locale assigned to the user. (optional)
 * @return object: an object containing details about the UserResource, or a RibbitException
 */
Ribbit.User.prototype.updateUser = function(callback, login, password, firstName, lastName, pwdStatus, accountId, domain, locale) {
	function updateUserCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		login = a.login;
		password = a.password;
		firstName = a.firstName;
		lastName = a.lastName;
		pwdStatus = a.pwdStatus;
		accountId = a.accountId;
		domain = a.domain;
		locale = a.locale;
		callback = a.callback;
	}
	if (Ribbit.getActiveUserId() === null) {
		return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException());
	}
	var userId = Ribbit.getActiveUserId();
	var exceptions = [];
	if (!Ribbit.Util.isSet(login) && !Ribbit.Util.isSet(password) && !Ribbit.Util.isSet(firstName) && !Ribbit.Util.isSet(lastName) && !Ribbit.Util.isSet(pwdStatus) && !Ribbit.Util.isSet(accountId) && !Ribbit.Util.isSet(domain) && !Ribbit.Util.isSet(locale)) {
		exceptions.push("At least one parameter must be supplied");
	}
	if (!Ribbit.Util.isValidStringIfDefined(login)) {
		exceptions.push("When defined, login must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(password)) {
		exceptions.push("When defined, password must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(firstName)) {
		exceptions.push("When defined, firstName must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(lastName)) {
		exceptions.push("When defined, lastName must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(pwdStatus)) {
		exceptions.push("When defined, pwdStatus must be a string of one or more characters");
	}
	if (!Ribbit.Util.isPositiveIntegerIfDefined(accountId)) {
		exceptions.push("When defined, accountId must be a positive integer");
	}
	if (!Ribbit.Util.isValidStringIfDefined(domain)) {
		exceptions.push("When defined, domain must be a string of one or more characters");
	}
	if (!Ribbit.Util.isValidStringIfDefined(locale)) {
		exceptions.push("When defined, locale must be a string of one or more characters");
	}
	if (exceptions.length > 0) {
		return Ribbit.checkParameterErrors(callback, exceptions);
	}
	var params = {};
	if (Ribbit.Util.isSet(login)) {
		params.login = login;
	}
	if (Ribbit.Util.isSet(password)) {
		params.password = password;
	}
	if (Ribbit.Util.isSet(firstName)) {
		params.firstName = firstName;
	}
	if (Ribbit.Util.isSet(lastName)) {
		params.lastName = lastName;
	}
	if (Ribbit.Util.isSet(pwdStatus)) {
		params.pwdStatus = pwdStatus;
	}
	if (Ribbit.Util.isSet(accountId)) {
		params.accountId = accountId;
	}
	if (Ribbit.Util.isSet(domain)) {
		params.domain = domain;
	}
	if (Ribbit.Util.isSet(locale)) {
		params.locale = locale;
	}
	var updateUserMethodCallback = Ribbit.asynchronous ? updateUserCallback : null;
	var uri = "users/" + userId;
	var updateUserResponse = Ribbit.signedRequest().doPut(uri, params, updateUserMethodCallback);
	if (!Ribbit.asynchronous) {
		return updateUserCallback(updateUserResponse);
	}
};
/**
 * Update the locale assigned to the user
 * This method is asynchronous. Subscribe to the event updateUserComplete for the response.
 
 * When the request is successful, RibbitEventArgs.Success will be true, and RibbitEventArgs.Data will be a null value
 * When the request is unsuccessful, RibbitEventArgs.Success will be false, RibbitEventArgs.Data will be null and RibbitEventArgs.Exception will contain failure information
 
 *
 * @public
 * @function
 *  
 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
 * @param locale string: The locale assigned to the user. (optional)
 */
Ribbit.User.prototype.setLocale = function(callback, locale) {
	function setLocaleCallback(val) {
		var ret = null;
		if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)) {
			ret = val;
		} else {
			ret = Ribbit.Util.isString(val) ? Ribbit.Util.JSON.parse(val).entry : val;
		}
		return Ribbit.respond(callback, ret);
	}
	if (typeof arguments[0] === "object" && arguments[0] !== null) {
		var a = arguments[0];
		locale = a.locale;
		callback = a.callback;
	}
	var setLocaleMethodCallback = Ribbit.asynchronous ? setLocaleCallback : null;
	var setLocaleResponse = Ribbit.Users().updateUser(setLocaleMethodCallback, null, null, null, null, null, null, null, locale);
	if (!Ribbit.asynchronous) {
		return setLocaleCallback(setLocaleResponse);
	}
};
/*jslint evil: true */
/*global JSON */
/*members "", "\b", "\t", "\n", "\f", "\r", "\"", Ribbit.Util.JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toRibbitJSON, toString, valueOf
*/
if (!Ribbit.Util.JSON) {
	Ribbit.Util.JSON = {};
}(function() {
	function f(n) {
		// Format integers to have at least two digits.
		return n < 10 ? '0' + n : n;
	}
	if (typeof Date.prototype.toRibbitJSON !== 'function') {
		Date.prototype.toRibbitJSON = function(key) {
			return this.getUTCFullYear() + '-' + f(this.getUTCMonth() + 1) + '-' + f(this.getUTCDate()) + 'T' + f(this.getUTCHours()) + ':' + f(this.getUTCMinutes()) + ':' + f(this.getUTCSeconds()) + 'Z';
		};
		String.prototype.toRibbitJSON = Number.prototype.toRibbitJSON = Boolean.prototype.toRibbitJSON = function(key) {
			return this.valueOf();
		};
	}
	var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
		gap, indent, meta = { // table of character substitutions
		'\b': '\\b',
		'\t': '\\t',
		'\n': '\\n',
		'\f': '\\f',
		'\r': '\\r',
		'"': '\\"',
		'\\': '\\\\'
	},
		rep;
	function quote(string) {
		// If the string contains no control characters, no quote characters, and no
		// backslash characters, then we can safely slap some quotes around it.
		// Otherwise we must also replace the offending characters with safe escape
		// sequences.
		escapable.lastIndex = 0;
		return escapable.test(string) ? '"' + string.replace(escapable, function(a) {
			var c = meta[a];
			return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
		}) + '"' : '"' + string + '"';
	}
	function str(key, holder) {
		// Produce a string from holder[key].
		var i, // The loop counter.
		k, // The member key.
		v, // The member value.
		length, mind = gap,
			partial, value = holder[key];
		// If the value has a toRibbitJSON method, call it to obtain a replacement value.
		if (value && typeof value === 'object' && typeof value.toRibbitJSON === 'function') {
			value = value.toRibbitJSON(key);
		}
		// If we were called with a replacer function, then call the replacer to
		// obtain a replacement value.
		if (typeof rep === 'function') {
			value = rep.call(holder, key, value);
		}
		// What happens next depends on the value's type.
		switch (typeof value) {
		case 'string':
			return quote(value);
		case 'number':
			// JSON numbers must be finite. Encode non-finite numbers as null.
			return isFinite(value) ? String(value) : 'null';
		case 'boolean':
		case 'null':
			// If the value is a boolean or null, convert it to a string. Note:
			// typeof null does not produce 'null'. The case is included here in
			// the remote chance that this gets fixed someday.
			return String(value);
			// If the type is 'object', we might be dealing with an object or an array or
			// null.
		case 'object':
			// Due to a specification blunder in ECMAScript, typeof null is 'object',
			// so watch out for that case.
			if (!value) {
				return 'null';
			}
			// Make an array to hold the partial results of stringifying this object value.
			gap += indent;
			partial = [];
			// Is the value an array?
			if (Object.prototype.toString.apply(value) === '[object Array]') {
				// The value is an array. Stringify every element. Use null as a placeholder
				// for non-JSON values.
				length = value.length;
				for (i = 0; i < length; i += 1) {
					partial[i] = str(i, value) || 'null';
				}
				// Join all of the elements together, separated with commas, and wrap them in
				// brackets.
				v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
				gap = mind;
				return v;
			}
			// If the replacer is an array, use it to select the members to be stringified.
			if (rep && typeof rep === 'object') {
				length = rep.length;
				for (i = 0; i < length; i += 1) {
					k = rep[i];
					if (typeof k === 'string') {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			} else {
				// Otherwise, iterate through all of the keys in the object.
				for (k in value) {
					if (Object.hasOwnProperty.call(value, k)) {
						v = str(k, value);
						if (v) {
							partial.push(quote(k) + (gap ? ': ' : ':') + v);
						}
					}
				}
			}
			// Join all of the member texts together, separated with commas,
			// and wrap them in braces.
			v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
			gap = mind;
			return v;
		}
	}
	// If the JSON object does not yet have a stringify method, give it one.
	if (typeof Ribbit.Util.JSON.stringify !== 'function') {
		Ribbit.Util.JSON.stringify = function(value, replacer, space) {
			// The stringify method takes a value and an optional replacer, and an optional
			// space parameter, and returns a JSON text. The replacer can be a function
			// that can replace values, or an array of strings that will select the keys.
			// A default replacer method can be provided. Use of the space parameter can
			// produce text that is more easily readable.
			var i;
			gap = '';
			indent = '';
			// If the space parameter is a number, make an indent string containing that
			// many spaces.
			if (typeof space === 'number') {
				for (i = 0; i < space; i += 1) {
					indent += ' ';
				}
				// If the space parameter is a string, it will be used as the indent string.
			} else if (typeof space === 'string') {
				indent = space;
			}
			// If there is a replacer, it must be a function or an array.
			// Otherwise, throw an error.
			rep = replacer;
			if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
				throw new Error('Ribbit.Util.JSON.stringify');
			}
			// Make a fake root object containing our value under the key of ''.
			// Return the result of stringifying the value.
			return str('', {
				'': value
			});
		};
	}
	// If the JSON object does not yet have a parse method, give it one.
	if (typeof Ribbit.Util.JSON.parse !== 'function') {
		Ribbit.Util.JSON.parse = function(text, reviver) {
			// The parse method takes a text and an optional reviver function, and returns
			// a JavaScript value if the text is a valid JSON text.
			var j;
			function walk(holder, key) {
				// The walk method is used to recursively walk the resulting structure so
				// that modifications can be made.
				var k, v, value = holder[key];
				if (value && typeof value === 'object') {
					for (k in value) {
						if (Object.hasOwnProperty.call(value, k)) {
							v = walk(value, k);
							if (v !== undefined) {
								value[k] = v;
							} else {
								delete value[k];
							}
						}
					}
				}
				return reviver.call(holder, key, value);
			}
			// Parsing happens in four stages. In the first stage, we replace certain
			// Unicode characters with escape sequences. JavaScript handles many characters
			// incorrectly, either silently deleting them, or treating them as line endings.
			cx.lastIndex = 0;
			if (cx.test(text)) {
				text = text.replace(cx, function(a) {
					return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
				});
			}
			// In the second stage, we run the text against regular expressions that look
			// for non-JSON patterns. We are especially concerned with '()' and 'new'
			// because they can cause invocation, and '=' because it can cause mutation.
			// But just to be safe, we want to reject all unexpected forms.
			// We split the second stage into 4 regexp operations in order to work around
			// crippling inefficiencies in IE's and Safari's regexp engines. First we
			// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
			// replace all simple value tokens with ']' characters. Third, we delete all
			// open brackets that follow a colon or comma or that begin the text. Finally,
			// we look to see that the remaining characters are only whitespace or ']' or
			// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
			if (/^[\],:{}\s]*$/.
			test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
			replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
			replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {
				// In the third stage we use the eval function to compile the text into a
				// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
				// in JavaScript: it can begin a block or an object literal. We wrap the text
				// in parens to eliminate the ambiguity.
				j = eval('(' + text + ')');
				// In the optional fourth stage, we recursively walk the new structure, passing
				// each name/value pair to a reviver function for possible transformation.
				return typeof reviver === 'function' ? walk({
					'': j
				},
				'') : j;
			}
			// If the text is not JSON parseable, then a SyntaxError is thrown.
			throw new SyntaxError('Ribbit.Util.JSON.parse');
		};
	}
})();
if (!Ribbit.Util.sha1) {
	Ribbit.Util.sha1 = {};
}(function() {
	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 *
	 * Modified by BT/Ribbit March 2009
	 *
	 */
	// hex output format. 0 - lowercase; 1 - uppercase
	var hexcase = 0;
	// base-64 pad character. "=" for strict RFC compliance  
	var b64pad = "=";
	// bits per input character. 8 - ASCII; 16 - Unicode 
	var chrsz = 8;
	/*
	 * Convert an array of big-endian words to a base-64 string
	 */

	function binb2b64(binarray) {
		var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
		var str = "";
		for (var i = 0; i < binarray.length * 4; i += 3) {
			var triplet = (((binarray[i >> 2] >> 8 * (3 - i % 4)) & 0xFF) << 16) | (((binarray[i + 1 >> 2] >> 8 * (3 - (i + 1) % 4)) & 0xFF) << 8) | ((binarray[i + 2 >> 2] >> 8 * (3 - (i + 2) % 4)) & 0xFF);
			for (var j = 0; j < 4; j++) {
				if (i * 8 + j * 6 > binarray.length * 32) {
					str += b64pad;
				} else {
					str += tab.charAt((triplet >> 6 * (3 - j)) & 0x3F);
				}
			}
		}
		return str;
	}
	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */

	function sha1_ft(t, b, c, d) {
		if (t < 20) {
			return (b & c) | ((~b) & d);
		}
		if (t < 40) {
			return b ^ c ^ d;
		}
		if (t < 60) {
			return (b & c) | (b & d) | (c & d);
		}
		return b ^ c ^ d;
	}
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */

	function safe_add(x, y) {
		var lsw = (x & 0xFFFF) + (y & 0xFFFF);
		var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
		return (msw << 16) | (lsw & 0xFFFF);
	}
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */

	function rol(num, cnt) {
		return (num << cnt) | (num >>> (32 - cnt));
	}
	/*
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 */

	function str2binb(str) {
		var bin = [];
		var mask = (1 << chrsz) - 1;
		for (var i = 0; i < str.length * chrsz; i += chrsz) {
			bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i % 32);
		}
		return bin;
	}
	/*
	 * Determine the appropriate additive constant for the current iteration
	 */

	function sha1_kt(t) {
		return (t < 20) ? 1518500249 : (t < 40) ? 1859775393 : (t < 60) ? -1894007588 : -899497514;
	}
	function core_sha1(x, len) {
		/* append padding */
		x[len >> 5] |= 0x80 << (24 - len % 32);
		x[((len + 64 >> 9) << 4) + 15] = len;
		var w = [];
		var a = 1732584193;
		var b = -271733879;
		var c = -1732584194;
		var d = 271733878;
		var e = -1009589776;
		for (var i = 0; i < x.length; i += 16) {
			var olda = a;
			var oldb = b;
			var oldc = c;
			var oldd = d;
			var olde = e;
			for (var j = 0; j < 80; j++) {
				if (j < 16) {
					w[j] = x[i + j];
				} else {
					w[j] = rol(w[j - 3] ^ w[j - 8] ^ w[j - 14] ^ w[j - 16], 1);
				}
				var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)), safe_add(safe_add(e, w[j]), sha1_kt(j)));
				e = d;
				d = c;
				c = rol(b, 30);
				b = a;
				a = t;
			}
			a = safe_add(a, olda);
			b = safe_add(b, oldb);
			c = safe_add(c, oldc);
			d = safe_add(d, oldd);
			e = safe_add(e, olde);
		}
		return [a, b, c, d, e];
	}
	/*
	 * Calculate the HMAC-SHA1 of a key and some data
	 */

	function core_hmac_sha1(key, data) {
		var bkey = str2binb(key);
		if (bkey.length > 16) {
			bkey = core_sha1(bkey, key.length * chrsz);
		}
		var ipad = [],
			opad = [];
		for (var i = 0; i < 16; i++) {
			ipad[i] = bkey[i] ^ 0x36363636;
			opad[i] = bkey[i] ^ 0x5C5C5C5C;
		}
		var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
		return core_sha1(opad.concat(hash), 512 + 160);
	}
	Ribbit.Util.sha1.b64_hmac_sha1 = function(key, data) {
		return binb2b64(core_hmac_sha1(key, data));
	};
})(); //scripts that execute when the library is loaded into the DOM
//load cookie
Ribbit.checkStoredSession();
/*jslint evil: true */
Ribbit.doCallbackEval = function(fn, b) {
	var es = fn + "(" + (Ribbit.Util.isValidString(b) ? ("\"" + b + "\"") : (b ? "true" : "false")) + ");";
	eval(es);
};
var onLoad = Ribbit.Util.isValidString(Ribbit.requestToken);
if (onLoad && !Ribbit.Util.isValidString(Ribbit.requestCallback)) {
	onLoad = false;
	Ribbit.onWindowLoad();
}
/*
 * This code attaches the Ribbit.onWindowLoad event, which is used by the oauth callback procedure to fire off the callback function 
 * It is expected not to work on Internet Explorer for Mac.
 */
/* for Internet Explorer */
/*@cc_on @*/
/*@if (@_win32)
	if (onLoad){
		document.write("<script id=__ie_onload defer src=javascript:void(0)><\/script>");
		var script = document.getElementById("__ie_onload");
		script.onreadystatechange = function() {
			if (this.readyState == "complete") {
				Ribbit.onWindowLoad(); 
			}
		};
	}
@end @*/
/* for Mozilla/Opera9 */
if (document.addEventListener && onLoad) {
	document.addEventListener("DOMContentLoaded", Ribbit.onWindowLoad, false);
}
/* for Safari/Chrome*/
else if (/WebKit/i.test(navigator.userAgent) && onLoad) { // sniff
	var _timer = setInterval(function() {
		if (/loaded|complete/.test(document.readyState)) {
			Ribbit.onWindowLoad(); // call the onload handler
		}
	},
	10);
}

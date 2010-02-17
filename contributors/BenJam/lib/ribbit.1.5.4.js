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
Ribbit.useJsonp = window.location.toString().substr(0,4)==="http";
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
Ribbit.marshalJsonpCallback = function(callbackId, responseStatus, responseText, responseLocation){
	var c = parseInt(callbackId,10);
	var f = Ribbit.jsonpCallbacks[c];
	f(responseStatus, Ribbit.Util.html_entity_decode(responseText === null ? "" :responseText), responseLocation);
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
*/Ribbit.applicationId = null;
/**
* The domain in which a developer application runs 
* 
* @public
*/Ribbit.domain = null;

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

Ribbit.checkStoredSession = function(){
	var c = Ribbit.readCookie();
	
	if (c.accessToken) {Ribbit.accessToken = c.accessToken;}
	if (c.accessSecret){Ribbit.accessSecret = c.accessSecret;}
	if (c.requestToken){Ribbit.accessToken = c.requestToken;}
	if (c.requestSecret){Ribbit.accessSecret = c.requestSecret;}
	if (c.userId){Ribbit.userId = c.userId;}
	if (c.username){Ribbit.username = c.username;}
	Ribbit.isLoggedIn = Ribbit.userId !== null;
	
	if (c.endpoint){Ribbit.endpoint = c.endpoint;}
	if (c.consumerToken){Ribbit.consumerToken = c.consumerToken;}
	if (c.consumerSecret){Ribbit.consumerSecret = c.consumerSecret;}
	if (c.asynchronous){Ribbit.asynchronous= c.asynchronous;}
};

Ribbit.saveCookie = function(){
	var v= {
		
		accessToken:Ribbit.accessToken,
		accessSecret:Ribbit.accessSecret,
		requestToken:Ribbit.requestToken,
		requestSecret:Ribbit.requestSecret,
		userId:Ribbit.userId,
		username:Ribbit.username,
		
		endpoint:Ribbit.endpoint,
		consumerToken:Ribbit.consumerToken,
		consumerSecret:Ribbit.consumerSecret,
		asynchronous:Ribbit.asynchronous
		};
	document.cookie = "ribbit_config="+Ribbit.Util.JSON.stringify(v)+"; path=/";
};
Ribbit.readCookie = function(){
	var n = "ribbit_config=";
	var cks = document.cookie.split(';');
	var v = '{}';
	for(var i=0;i < cks.length;i++) {
		var ck = cks[i];
		while (ck.charAt(0)===" ") {
			ck = ck.substring(1,ck.length);
		}
		if (ck.indexOf(n) === 0) {
			v = ck.substring(n.length,ck.length);
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
 * @param synchronous bool: The consumer secret you got for your application from http://developer.ribbit.com (optional - defaults to false)
 * @return void
 * @function
 * 
 */
Ribbit.init = function (token, appId, domain, secret, synchronous){
	if (synchronous && Ribbit.useJsonp){
		throw new Ribbit.RibbitException("You can only use the Ribbit Javascript library synchronously when running off a file URI");
	}
	if(!document.getElementsByTagName('head')[0] ){
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
Ribbit.getUser = function(callback){
	if (Ribbit.isLoggedIn){
		return Ribbit.Users().getUser(callback, Ribbit.userId);
	}
	else{
		if (Ribbit.asynchronous && (callback !== undefined)){
			callback(null);
		}
		else{
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
Ribbit.exec=function(requestObject){
	if ( !requestObject.params || typeof requestObject.params !=="object") {
    	requestObject.params = {};
    }
	for (var r in Ribbit)
    {
		if (typeof Ribbit[r] === "function" && requestObject.resource === r){
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
										var type = mediaItem.type !== null ?  mediaItem.type : null;
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
	throw new Ribbit.InvalidArgumentException("cannot find '" + requestObject.resource +"." +requestObject.method + "'");
};

/**
* Allows an array of custom headers to be injected into the request.  
*
* @private
* @function
*/
Ribbit.customHeaders =function(){
	
			return [];
		
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
*
*
* @public
* @function
*/
Ribbit.log = function(data){};

Ribbit.respond = function(callback, response){
	if (Ribbit.asynchronous) {if (callback) {callback(response);}}
	else {return response;}
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
Ribbit.signedRequest = function (){
	if (Ribbit.consumerToken !== null){
		return new Ribbit.RibbitSignedRequest(); 
	}
	else{
		throw new Ribbit.TokenRequiredException();
	}
};

/**
 * Used when sending a 'GET' request to the Ribbit Server, and saving the response to a file.
 * 
 * @function
 * @public
 * @param file A filename, used in conjuction with a folder and domain; Or, a relative (eg "media/domain/folder/filename") or full URI 
 * @param folder The folder that the file is in (do not populate if using relative or full URIs)
 * @param file The domain (do not populate if using relative or full URIs), will default from initialization domain value
 * @return A Full URI that can be passed to a Media player
 */
Ribbit.getStreamableUrl = function(file, folder, domain){
    var uri;
    if (!Ribbit.Util.isValidString(file)){
    	throw new RibbitException("At least file must be specified");
    }
    file = Ribbit.Util.trim(file);
    if (!Ribbit.Util.isValidString(folder)) {
    	if (file.indexOf(Ribbit.endpoint) === 0)
    	{
        	uri = file.substr(Ribbit.endpoint.length, file.length-Ribbit.endpoint.length);
    	}
    	else if (file.indexOf("media") === 0) {
    		uri = file;
    	}
    	else if (file.indexOf("media") === 1) {
    		uri = file.substr(1, file.length-1);
    	}
    }
    else
    {
    	if (!Ribbit.Util.isValidString(domain))
    	{
    		domain = Ribbit.domain;
    	}
    	if (!Ribbit.Util.isValidStringIfDefined(domain)){
    		throw new RibbitException("If a folder is specified, domain must be too");
    	}
    	domain = Ribbit.Util.trim(domain);
    	folder = Ribbit.Util.trim(folder);
    	domain = domain.indexOf("/") === 0 ? domain.substr(1, domain.length-1) : domain;
	    domain = domain.indexOf("/") === domain.length-1 ? domain.substr(0, domain.length-1) : domain;
	    folder = folder.indexOf("/") === 0 ? folder.substr(1, folder.length-1) : folder;
	    folder = folder.indexOf("/") === folder.length-1 ? folder.substr(0, folder.length-1) : folder;
	    file = file.indexOf("/") === 0 ? file.substr(1, file.length-1) : file;
	    file = file.indexOf("/") === file.length-1 ? file.substr(0, file.length-1) : file;
    	uri = "media" + "/" + domain + "/" + folder + "/" + file;
    }
    return Ribbit.signedRequest().createStreamableUrl(uri);
};



	/**
 	 * Provides access to the Applications resource
 	 * 
 	 * @return Ribbit.Application
 	 * @link Ribbit.Application
 	 * @public
 	 * @function
 	 * 
 	 */
	Ribbit.Applications = function(){
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
	Ribbit.Calls = function(){
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
	Ribbit.Devices = function(){
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
	Ribbit.Domains = function(){
		return new Ribbit.Domain();
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
	Ribbit.Media = function(){
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
	Ribbit.Messages = function(){
		return new Ribbit.Message();
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
	Ribbit.Tokens = function(){
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
	Ribbit.Users = function(){
		return new Ribbit.User();
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
		Ribbit.Application = function(){

		
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
         * @return object: an object containing details about the Application, or a RibbitException
		 */
	this.getApplication = function(callback, domain, applicationId) {
		
		function getApplicationCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			domain = a.domain;
			applicationId = a.applicationId;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(applicationId)){ exceptions.push("When defined, applicationId must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			var applicationIdValue = Ribbit.Util.isSet(applicationId) ? applicationId : Ribbit.applicationId ;
	
			
		var getApplicationMethodCallback = Ribbit.asynchronous ? getApplicationCallback : null;
			
		var uri = "apps/" + domainValue + ":" + applicationIdValue;
	
		var getApplicationResponse = Ribbit.signedRequest().doGet(uri, getApplicationMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getApplicationCallback(getApplicationResponse); }
		
		
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
	this.getApplications = function(callback, startIndex, count, filterBy, filterValue) {
		
		function getApplicationsCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getApplicationsMethodCallback = Ribbit.asynchronous ? getApplicationsCallback : null;
			
		
			var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
			var uri = "apps" + q;
	
		var getApplicationsResponse = Ribbit.signedRequest().doGet(uri, getApplicationsMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getApplicationsCallback(getApplicationsResponse); }
		
		
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
         * @return object: an object containing details about the Application, or a RibbitException
		 */
	this.updateApplication = function(callback, notificationUrl, allow2legged, domain, applicationId) {
		
		function updateApplicationCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			notificationUrl = a.notificationUrl;
			allow2legged = a.allow2legged;
			domain = a.domain;
			applicationId = a.applicationId;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (Ribbit.consumerSecret === null || Ribbit.consumerSecret === ""){ exceptions.push("updateApplication is not available in two legged authentication mode");}
		
			if (
		!Ribbit.Util.isSet(notificationUrl) &&
		!Ribbit.Util.isSet(allow2legged) &&
		!Ribbit.Util.isSet(domain) &&
		!Ribbit.Util.isSet(applicationId)) {exceptions.push("At least one parameter must be supplied"); }
		
		if (!Ribbit.Util.isValidStringIfDefined(notificationUrl)){ exceptions.push("When defined, notificationUrl must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(allow2legged)){ exceptions.push("When defined, allow2legged must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(applicationId)){ exceptions.push("When defined, applicationId must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			var applicationIdValue = Ribbit.Util.isSet(applicationId) ? applicationId : Ribbit.applicationId ;
	
		var params = {};
	
			if (Ribbit.Util.isSet(notificationUrl)) { params.notificationUrl = notificationUrl;
	 } 
	
			if (Ribbit.Util.isSet(allow2legged)) { params.allow2legged = allow2legged;
	 } 
	
			
		var updateApplicationMethodCallback = Ribbit.asynchronous ? updateApplicationCallback : null;
			
		var uri = "apps/" + domainValue + ":" + applicationIdValue;
	
		var updateApplicationResponse = Ribbit.signedRequest().doPut(uri, params, updateApplicationMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateApplicationCallback(updateApplicationResponse); }
		
		
	};
	
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
		Ribbit.Call = function(){

		
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
	this.createCall = function(callback, legs, callerid, mode, announce) {
		
		function createCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			legs = a.legs;
			callerid = a.callerid;
			mode = a.mode;
			announce = a.announce;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isNonEmptyArray(legs)){ exceptions.push("legs is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(callerid)){ exceptions.push("When defined, callerid must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(mode)){ exceptions.push("When defined, mode must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(announce)){ exceptions.push("When defined, announce must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.legs = legs;
	
			if (Ribbit.Util.isSet(callerid)) { params.callerid = callerid;
	 } 
	
			if (Ribbit.Util.isSet(mode)) { params.mode = mode;
	 } 
	
			if (Ribbit.Util.isSet(announce)) { params.announce = announce;
	 } 
	
			
		var createCallMethodCallback = Ribbit.asynchronous ? createCallCallback : null;
			
		var uri = "calls/" + userId;
	
		var createCallResponse = Ribbit.signedRequest().doPost(uri, params, createCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createCallCallback(createCallResponse); }
		
		
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
	this.createThirdPartyCall = function(callback, source, dest) {
		
		function createThirdPartyCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			source = a.source;
			dest = a.dest;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(source)){ exceptions.push("source is required"); }
		if (!Ribbit.Util.isNonEmptyArray(dest)){ exceptions.push("dest is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.source = source;
	params.dest = dest;
	
			
		var createThirdPartyCallMethodCallback = Ribbit.asynchronous ? createThirdPartyCallCallback : null;
			
		var uri = "calls/" + userId;
	
		var createThirdPartyCallResponse = Ribbit.signedRequest().doPost(uri, params, createThirdPartyCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createThirdPartyCallCallback(createThirdPartyCallResponse); }
		
		
	};
	
		/**
		 * Once a Call is made the details may be retrieved to show the current status of each Leg. Only the Call owner is able to query the Call details.
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param callId string: Unique numeric Call identifier (required)
         * @return object: an object containing details about the Call, or a RibbitException
		 */
	this.getCall = function(callback, callId) {
		
		function getCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(callId)){ exceptions.push("callId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getCallMethodCallback = Ribbit.asynchronous ? getCallCallback : null;
			
		var uri = "calls/" + userId + "/" + callId;
	
		var getCallResponse = Ribbit.signedRequest().doGet(uri, getCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getCallCallback(getCallResponse); }
		
		
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
	this.getCalls = function(callback, startIndex, count, filterBy, filterValue) {
		
		function getCallsCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getCallsMethodCallback = Ribbit.asynchronous ? getCallsCallback : null;
			
		
			var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
			var uri = "calls/" + userId + q;
	
		var getCallsResponse = Ribbit.signedRequest().doGet(uri, getCallsMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getCallsCallback(getCallsResponse); }
		
		
	};
	
		/**
		 * Transfers a call leg from one call to another
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
	this.transferLeg = function(callback, sourceCallId, sourceLegId, destinationCallId) {
		
		function transferLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			sourceCallId = a.sourceCallId;
			sourceLegId = a.sourceLegId;
			destinationCallId = a.destinationCallId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(sourceCallId)){ exceptions.push("sourceCallId is required"); }
		if (!Ribbit.Util.isValidString(sourceLegId)){ exceptions.push("sourceLegId is required"); }
		if (!Ribbit.Util.isValidString(destinationCallId)){ exceptions.push("destinationCallId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var transferLegMethodCallback = Ribbit.asynchronous ? transferLegCallback : null;
			
		var transferLegResponse  =  Ribbit.Calls().updateCall(transferLegMethodCallback, destinationCallId, sourceCallId + "/" + sourceLegId, null, null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return transferLegCallback(transferLegResponse); }
		
		
	};
	
		/**
		 * Updates a call to change the mode of all legs, start and stop call recording, or play media to all the legs
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
	this.updateCall = function(callback, callId, id, mode, active, record, recording, announce, play, playing) {
		
		function updateCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(callId)){ exceptions.push("callId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(id)){ exceptions.push("When defined, id must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(mode)){ exceptions.push("When defined, mode must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(active)){ exceptions.push("When defined, active must be boolean"); }
	if (Ribbit.Util.isSet(record)){
		if (!(record instanceof Ribbit.CallRecordRequest)){exceptions.push("record must be an instance of Ribbit.CallRecordRequest");}
		else{
			if (record.getValidationMessage() !==""){exceptions.push(record.getValidationMessage());}
		}
	}
		if (!Ribbit.Util.isBoolIfDefined(recording)){ exceptions.push("When defined, recording must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(announce)){ exceptions.push("When defined, announce must be a string of one or more characters"); }
	if (Ribbit.Util.isSet(play)){
		if (!(play instanceof Ribbit.CallPlayRequest)){exceptions.push("play must be an instance of Ribbit.CallPlayRequest");}
		else{
			if (play.getValidationMessage() !==""){exceptions.push(play.getValidationMessage());}
		}
	}
		if (!Ribbit.Util.isBoolIfDefined(playing)){ exceptions.push("When defined, playing must be boolean"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	
			if (Ribbit.Util.isSet(id)) { params.id = id;
	 } 
	
			if (Ribbit.Util.isSet(mode)) { params.mode = mode;
	 } 
	
			if (Ribbit.Util.isSet(active)) { params.active = active;
	 } 
	
			if (Ribbit.Util.isSet(record)) { params.record = record.toObject();
	 } 
	
			if (Ribbit.Util.isSet(recording)) { params.recording = recording;
	 } 
	
			if (Ribbit.Util.isSet(announce)) { params.announce = announce;
	 } 
	
			if (Ribbit.Util.isSet(play)) { params.play = play.toObject();
	 } 
	
			if (Ribbit.Util.isSet(playing)) { params.playing = playing;
	 } 
	
			
		var updateCallMethodCallback = Ribbit.asynchronous ? updateCallCallback : null;
			
		var uri = "calls/" + userId + "/" + callId;
	
		var updateCallResponse = Ribbit.signedRequest().doPut(uri, params, updateCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateCallCallback(updateCallResponse); }
		
		
	};
	
		/**
		 * Mute all legs on a call
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
		
	this.muteCall = function(callback, callId) {
		
		function muteCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var muteCallMethodCallback = Ribbit.asynchronous ? muteCallCallback : null;
			
		var muteCallResponse  =  Ribbit.Calls().updateCall(muteCallMethodCallback, callId, null, "mute", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return muteCallCallback(muteCallResponse); }
		
		
	};
	
		/**
		 * Take all muted legs on a call off mute
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
		
	this.unmuteCall = function(callback, callId) {
		
		function unmuteCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var unmuteCallMethodCallback = Ribbit.asynchronous ? unmuteCallCallback : null;
			
		var unmuteCallResponse  =  Ribbit.Calls().updateCall(unmuteCallMethodCallback, callId, null, "talk", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return unmuteCallCallback(unmuteCallResponse); }
		
		
	};
	
		/**
		 * Puts all legs on a call on hold
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
		
	this.holdCall = function(callback, callId) {
		
		function holdCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var holdCallMethodCallback = Ribbit.asynchronous ? holdCallCallback : null;
			
		var holdCallResponse  =  Ribbit.Calls().updateCall(holdCallMethodCallback, callId, null, "hold", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return holdCallCallback(holdCallResponse); }
		
		
	};
	
		/**
		 * Takes all held legs on a call off hold
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
		
	this.unholdCall = function(callback, callId) {
		
		function unholdCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var unholdCallMethodCallback = Ribbit.asynchronous ? unholdCallCallback : null;
			
		var unholdCallResponse  =  Ribbit.Calls().updateCall(unholdCallMethodCallback, callId, null, "talk", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return unholdCallCallback(unholdCallResponse); }
		
		
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
		
	this.hangupCall = function(callback, callId) {
		
		function hangupCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var hangupCallMethodCallback = Ribbit.asynchronous ? hangupCallCallback : null;
			
		var hangupCallResponse  =  Ribbit.Calls().updateCall(hangupCallMethodCallback, callId, null, null, false, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return hangupCallCallback(hangupCallResponse); }
		
		
	};
	
		/**
		 * Start recording a call
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
		
	this.recordCall = function(callback, callId, record) {
		
		function recordCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			record = a.record;
			callback = a.callback;
		}
	
			
		var recordCallMethodCallback = Ribbit.asynchronous ? recordCallCallback : null;
			
		var recordCallResponse  =  Ribbit.Calls().updateCall(recordCallMethodCallback, callId, null, null, null, record, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return recordCallCallback(recordCallResponse); }
		
		
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
		
	this.stopRecordingCall = function(callback, callId) {
		
		function stopRecordingCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var stopRecordingCallMethodCallback = Ribbit.asynchronous ? stopRecordingCallCallback : null;
			
		var stopRecordingCallResponse  =  Ribbit.Calls().updateCall(stopRecordingCallMethodCallback, callId, null, null, null, null, false, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return stopRecordingCallCallback(stopRecordingCallResponse); }
		
		
	};
	
		/**
		 * Play files and/or Text To Speech elements to a call
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
		
	this.playMediaToCall = function(callback, callId, announce, play) {
		
		function playMediaToCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			announce = a.announce;
			play = a.play;
			callback = a.callback;
		}
	
			
		var playMediaToCallMethodCallback = Ribbit.asynchronous ? playMediaToCallCallback : null;
			
		var playMediaToCallResponse  =  Ribbit.Calls().updateCall(playMediaToCallMethodCallback, callId, null, null, null, null, null, announce, play, null);
	
		
		if (!Ribbit.asynchronous) { return playMediaToCallCallback(playMediaToCallResponse); }
		
		
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
		
	this.stopPlayingMediaToCall = function(callback, callId) {
		
		function stopPlayingMediaToCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			callback = a.callback;
		}
	
			
		var stopPlayingMediaToCallMethodCallback = Ribbit.asynchronous ? stopPlayingMediaToCallCallback : null;
			
		var stopPlayingMediaToCallResponse  =  Ribbit.Calls().updateCall(stopPlayingMediaToCallMethodCallback, callId, null, null, null, null, null, null, null, false);
	
		
		if (!Ribbit.asynchronous) { return stopPlayingMediaToCallCallback(stopPlayingMediaToCallResponse); }
		
		
	};
	
		/**
		 * Updates the mode of a call leg, records it, or plays media to it, or requests DTMF (keypad) input
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
	this.updateCallLeg = function(callback, callId, legId, mode, requestDtmf, record, recording, announce, play, playing) {
		
		function updateCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(callId)){ exceptions.push("callId is required"); }
		if (!Ribbit.Util.isValidString(legId)){ exceptions.push("legId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(mode)){ exceptions.push("When defined, mode must be a string of one or more characters"); }
	if (Ribbit.Util.isSet(requestDtmf)){
		if (!(requestDtmf instanceof Ribbit.CallLegDtmfRequest)){exceptions.push("requestDtmf must be an instance of Ribbit.CallLegDtmfRequest");}
		else{
			if (requestDtmf.getValidationMessage() !==""){exceptions.push(requestDtmf.getValidationMessage());}
		}
	}
	if (Ribbit.Util.isSet(record)){
		if (!(record instanceof Ribbit.CallRecordRequest)){exceptions.push("record must be an instance of Ribbit.CallRecordRequest");}
		else{
			if (record.getValidationMessage() !==""){exceptions.push(record.getValidationMessage());}
		}
	}
		if (!Ribbit.Util.isBoolIfDefined(recording)){ exceptions.push("When defined, recording must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(announce)){ exceptions.push("When defined, announce must be a string of one or more characters"); }
	if (Ribbit.Util.isSet(play)){
		if (!(play instanceof Ribbit.CallPlayRequest)){exceptions.push("play must be an instance of Ribbit.CallPlayRequest");}
		else{
			if (play.getValidationMessage() !==""){exceptions.push(play.getValidationMessage());}
		}
	}
		if (!Ribbit.Util.isBoolIfDefined(playing)){ exceptions.push("When defined, playing must be boolean"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	
			if (Ribbit.Util.isSet(mode)) { params.mode = mode;
	 } 
	
			if (Ribbit.Util.isSet(requestDtmf)) { params.requestDtmf = requestDtmf.toObject();
	 } 
	
			if (Ribbit.Util.isSet(record)) { params.record = record.toObject();
	 } 
	
			if (Ribbit.Util.isSet(recording)) { params.recording = recording;
	 } 
	
			if (Ribbit.Util.isSet(announce)) { params.announce = announce;
	 } 
	
			if (Ribbit.Util.isSet(play)) { params.play = play.toObject();
	 } 
	
			if (Ribbit.Util.isSet(playing)) { params.playing = playing;
	 } 
	
			
		var updateCallLegMethodCallback = Ribbit.asynchronous ? updateCallLegCallback : null;
			
		var uri = "calls/" + userId + "/" + callId + "/" + legId;
	
		var updateCallLegResponse = Ribbit.signedRequest().doPut(uri, params, updateCallLegMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateCallLegCallback(updateCallLegResponse); }
		
		
	};
	
		/**
		 * Mutes a call leg
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
		
	this.muteLeg = function(callback, callId, legId) {
		
		function muteLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var muteLegMethodCallback = Ribbit.asynchronous ? muteLegCallback : null;
			
		var muteLegResponse  =  Ribbit.Calls().updateCallLeg(muteLegMethodCallback, callId, legId, "mute", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return muteLegCallback(muteLegResponse); }
		
		
	};
	
		/**
		 * Takes a call leg off mute
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
		
	this.unmuteLeg = function(callback, callId, legId) {
		
		function unmuteLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var unmuteLegMethodCallback = Ribbit.asynchronous ? unmuteLegCallback : null;
			
		var unmuteLegResponse  =  Ribbit.Calls().updateCallLeg(unmuteLegMethodCallback, callId, legId, "talk", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return unmuteLegCallback(unmuteLegResponse); }
		
		
	};
	
		/**
		 * Puts a call leg on hold
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
		
	this.holdLeg = function(callback, callId, legId) {
		
		function holdLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var holdLegMethodCallback = Ribbit.asynchronous ? holdLegCallback : null;
			
		var holdLegResponse  =  Ribbit.Calls().updateCallLeg(holdLegMethodCallback, callId, legId, "hold", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return holdLegCallback(holdLegResponse); }
		
		
	};
	
		/**
		 * Takes a call leg off hold
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
		
	this.unholdLeg = function(callback, callId, legId) {
		
		function unholdLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var unholdLegMethodCallback = Ribbit.asynchronous ? unholdLegCallback : null;
			
		var unholdLegResponse  =  Ribbit.Calls().updateCallLeg(unholdLegMethodCallback, callId, legId, "talk", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return unholdLegCallback(unholdLegResponse); }
		
		
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
		
	this.hangupLeg = function(callback, callId, legId) {
		
		function hangupLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var hangupLegMethodCallback = Ribbit.asynchronous ? hangupLegCallback : null;
			
		var hangupLegResponse  =  Ribbit.Calls().updateCallLeg(hangupLegMethodCallback, callId, legId, "hangup", null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return hangupLegCallback(hangupLegResponse); }
		
		
	};
	
		/**
		 * Start recording a call leg
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
		
	this.recordCallLeg = function(callback, callId, legId, record) {
		
		function recordCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			record = a.record;
			callback = a.callback;
		}
	
			
		var recordCallLegMethodCallback = Ribbit.asynchronous ? recordCallLegCallback : null;
			
		var recordCallLegResponse  =  Ribbit.Calls().updateCallLeg(recordCallLegMethodCallback, callId, legId, null, null, record, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return recordCallLegCallback(recordCallLegResponse); }
		
		
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
		
	this.stopRecordingCallLeg = function(callback, callId, legId) {
		
		function stopRecordingCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var stopRecordingCallLegMethodCallback = Ribbit.asynchronous ? stopRecordingCallLegCallback : null;
			
		var stopRecordingCallLegResponse  =  Ribbit.Calls().updateCallLeg(stopRecordingCallLegMethodCallback, callId, legId, null, null, null, false, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return stopRecordingCallLegCallback(stopRecordingCallLegResponse); }
		
		
	};
	
		/**
		 * Play files and/or Text To Speech elements to a call leg
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
		
	this.playMediaToCallLeg = function(callback, callId, legId, announce, play) {
		
		function playMediaToCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			announce = a.announce;
			play = a.play;
			callback = a.callback;
		}
	
			
		var playMediaToCallLegMethodCallback = Ribbit.asynchronous ? playMediaToCallLegCallback : null;
			
		var playMediaToCallLegResponse  =  Ribbit.Calls().updateCallLeg(playMediaToCallLegMethodCallback, callId, legId, null, null, null, null, announce, play, null);
	
		
		if (!Ribbit.asynchronous) { return playMediaToCallLegCallback(playMediaToCallLegResponse); }
		
		
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
		
	this.stopPlayingMediaToCallLeg = function(callback, callId, legId) {
		
		function stopPlayingMediaToCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			callback = a.callback;
		}
	
			
		var stopPlayingMediaToCallLegMethodCallback = Ribbit.asynchronous ? stopPlayingMediaToCallLegCallback : null;
			
		var stopPlayingMediaToCallLegResponse  =  Ribbit.Calls().updateCallLeg(stopPlayingMediaToCallLegMethodCallback, callId, legId, null, null, null, null, null, null, false);
	
		
		if (!Ribbit.asynchronous) { return stopPlayingMediaToCallLegCallback(stopPlayingMediaToCallLegResponse); }
		
		
	};
	
		/**
		 * Request DTMF digits collected from a call leg
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
		
	this.requestDtmfFromCallLeg = function(callback, callId, legId, requestDtmf) {
		
		function requestDtmfFromCallLegCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			legId = a.legId;
			requestDtmf = a.requestDtmf;
			callback = a.callback;
		}
	
			
		var requestDtmfFromCallLegMethodCallback = Ribbit.asynchronous ? requestDtmfFromCallLegCallback : null;
			
		var requestDtmfFromCallLegResponse  =  Ribbit.Calls().updateCallLeg(requestDtmfFromCallLegMethodCallback, callId, legId, null, requestDtmf, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return requestDtmfFromCallLegCallback(requestDtmfFromCallLegResponse); }
		
		
	};
	
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
		Ribbit.Device = function(){

		
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
	this.createDevice = function(callback, id, name, label, callme, notifyvm, callbackreachme, mailtext, shared, notifymissedcall, showcalled, answersecurity, notifytranscription, attachmessage, usewave, key, ringstatus, verifyBy, autoAnswer, allowCCF) {
		
		function createDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(id)){ exceptions.push("id is required"); }
		if (!Ribbit.Util.isValidString(name)){ exceptions.push("name is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(label)){ exceptions.push("When defined, label must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(callme)){ exceptions.push("When defined, callme must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifyvm)){ exceptions.push("When defined, notifyvm must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(callbackreachme)){ exceptions.push("When defined, callbackreachme must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(mailtext)){ exceptions.push("When defined, mailtext must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(shared)){ exceptions.push("When defined, shared must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifymissedcall)){ exceptions.push("When defined, notifymissedcall must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(showcalled)){ exceptions.push("When defined, showcalled must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(answersecurity)){ exceptions.push("When defined, answersecurity must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifytranscription)){ exceptions.push("When defined, notifytranscription must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(attachmessage)){ exceptions.push("When defined, attachmessage must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(usewave)){ exceptions.push("When defined, usewave must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(key)){ exceptions.push("When defined, key must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(ringstatus)){ exceptions.push("When defined, ringstatus must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(verifyBy)){ exceptions.push("When defined, verifyBy must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(autoAnswer)){ exceptions.push("When defined, autoAnswer must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(allowCCF)){ exceptions.push("When defined, allowCCF must be boolean"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.id = id;
	params.name = name;
	
			if (Ribbit.Util.isSet(label)) { params.label = label;
	 } 
	
			if (Ribbit.Util.isSet(callme)) { params.callme = callme;
	 } 
	
			if (Ribbit.Util.isSet(notifyvm)) { params.notifyvm = notifyvm;
	 } 
	
			if (Ribbit.Util.isSet(callbackreachme)) { params.callbackreachme = callbackreachme;
	 } 
	
			if (Ribbit.Util.isSet(mailtext)) { params.mailtext = mailtext;
	 } 
	
			if (Ribbit.Util.isSet(shared)) { params.shared = shared;
	 } 
	
			if (Ribbit.Util.isSet(notifymissedcall)) { params.notifymissedcall = notifymissedcall;
	 } 
	
			if (Ribbit.Util.isSet(showcalled)) { params.showcalled = showcalled;
	 } 
	
			if (Ribbit.Util.isSet(answersecurity)) { params.answersecurity = answersecurity;
	 } 
	
			if (Ribbit.Util.isSet(notifytranscription)) { params.notifytranscription = notifytranscription;
	 } 
	
			if (Ribbit.Util.isSet(attachmessage)) { params.attachmessage = attachmessage;
	 } 
	
			if (Ribbit.Util.isSet(usewave)) { params.usewave = usewave;
	 } 
	
			if (Ribbit.Util.isSet(key)) { params.key = key;
	 } 
	
			if (Ribbit.Util.isSet(ringstatus)) { params.ringstatus = ringstatus;
	 } 
	
			if (Ribbit.Util.isSet(verifyBy)) { params.verifyBy = verifyBy;
	 } 
	
			if (Ribbit.Util.isSet(autoAnswer)) { params.autoAnswer = autoAnswer;
	 } 
	
			if (Ribbit.Util.isSet(allowCCF)) { params.allowCCF = allowCCF;
	 } 
	
			
		var createDeviceMethodCallback = Ribbit.asynchronous ? createDeviceCallback : null;
			
		var uri = "devices/" + userId;
	
		var createDeviceResponse = Ribbit.signedRequest().doPost(uri, params, createDeviceMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createDeviceCallback(createDeviceResponse); }
		
		
	};
	
		/**
		 * 
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
		 * @param callme boolean: This Device can be used as an inbound 'CallMe' number (optional)
		 * @param ringstatus boolean: Ring this Device when an inbound call arrives (optional)
		 */
		
	this.createInboundDevice = function(callback, id, name, callme, ringstatus) {
		
		function createInboundDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			id = a.id;
			name = a.name;
			callme = a.callme;
			ringstatus = a.ringstatus;
			callback = a.callback;
		}
	
			
		var createInboundDeviceMethodCallback = Ribbit.asynchronous ? createInboundDeviceCallback : null;
			
		var createInboundDeviceResponse  =  Ribbit.Devices().createDevice(createInboundDeviceMethodCallback, id, name, null, true, null, null, null, null, null, null, null, null, null, null, null, true, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return createInboundDeviceCallback(createInboundDeviceResponse); }
		
		
	};
	
		/**
		 * 
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
		 * @param callbackreachme boolean: This Device can be used as 'reach me' number (optional)
		 * @param ringstatus boolean: Ring this Device when an inbound call arrives (optional)
		 */
		
	this.createOutboundDevice = function(callback, id, name, callbackreachme, ringstatus) {
		
		function createOutboundDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			id = a.id;
			name = a.name;
			callbackreachme = a.callbackreachme;
			ringstatus = a.ringstatus;
			callback = a.callback;
		}
	
			
		var createOutboundDeviceMethodCallback = Ribbit.asynchronous ? createOutboundDeviceCallback : null;
			
		var createOutboundDeviceResponse  =  Ribbit.Devices().createDevice(createOutboundDeviceMethodCallback, id, name, null, null, null, true, null, null, null, null, null, null, null, null, null, true, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return createOutboundDeviceCallback(createOutboundDeviceResponse); }
		
		
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
	this.createInboundNumber = function(callback, locale, name) {
		
		function createInboundNumberCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			locale = a.locale;
			name = a.name;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(locale)){ exceptions.push("locale is required"); }
		if (!Ribbit.Util.isValidString(name)){ exceptions.push("name is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var createInboundNumberMethodCallback = Ribbit.asynchronous ? createInboundNumberCallback : null;
			
		var createInboundNumberResponse  =  Ribbit.Devices().createDevice(createInboundNumberMethodCallback, "@purpose/" + locale, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return createInboundNumberCallback(createInboundNumberResponse); }
		
		
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
	this.createInboundSmsNumber = function(callback, locale, name) {
		
		function createInboundSmsNumberCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			locale = a.locale;
			name = a.name;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(locale)){ exceptions.push("locale is required"); }
		if (!Ribbit.Util.isValidString(name)){ exceptions.push("name is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var createInboundSmsNumberMethodCallback = Ribbit.asynchronous ? createInboundSmsNumberCallback : null;
			
		var createInboundSmsNumberResponse  =  Ribbit.Devices().createDevice(createInboundSmsNumberMethodCallback, "@sms/" + locale, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
	
		
		if (!Ribbit.asynchronous) { return createInboundSmsNumberCallback(createInboundSmsNumberResponse); }
		
		
	};
	
		/**
		 * 
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param emailAddress string:  (required)
		 * @param name string: Name to refer to this Device (required)
         * @return A  identifier, or a RibbitException
		 */
	this.createMailDevice = function(callback, emailAddress, name) {
		
		function createMailDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			emailAddress = a.emailAddress;
			name = a.name;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(emailAddress)){ exceptions.push("emailAddress is required"); }
		if (!Ribbit.Util.isValidString(name)){ exceptions.push("name is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var createMailDeviceMethodCallback = Ribbit.asynchronous ? createMailDeviceCallback : null;
			
		var createMailDeviceResponse  =  Ribbit.Devices().createDevice(createMailDeviceMethodCallback, null, name, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "mailCheck", null, null);
	
		
		if (!Ribbit.asynchronous) { return createMailDeviceCallback(createMailDeviceResponse); }
		
		
	};
	
		/**
		 * Gets details about the Device
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param deviceId string: Unique Device identifier prefixed by schema to reflect device type (e.g. mailto:foo@bar.com) (required)
         * @return object: an object containing details about the Device, or a RibbitException
		 */
	this.getDevice = function(callback, deviceId) {
		
		function getDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			deviceId = a.deviceId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(deviceId)){ exceptions.push("deviceId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getDeviceMethodCallback = Ribbit.asynchronous ? getDeviceCallback : null;
			
		var uri = "devices/" + userId + "/" + deviceId;
	
		var getDeviceResponse = Ribbit.signedRequest().doGet(uri, getDeviceMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getDeviceCallback(getDeviceResponse); }
		
		
	};
	
		/**
		 * Get a collection of Devices belonging to the current User
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
         * @return array: an array, each entry of which contains an object of details about the Device, or a RibbitException
		 */
	this.getDevices = function(callback) {
		
		function getDevicesCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
			
		var getDevicesMethodCallback = Ribbit.asynchronous ? getDevicesCallback : null;
			
		var uri = "devices/" + userId;
	
		var getDevicesResponse = Ribbit.signedRequest().doGet(uri, getDevicesMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getDevicesCallback(getDevicesResponse); }
		
		
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
	this.removeDevice = function(callback, deviceId) {
		
		function removeDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			deviceId = a.deviceId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(deviceId)){ exceptions.push("deviceId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var removeDeviceMethodCallback = Ribbit.asynchronous ? removeDeviceCallback : null;
			
		var uri = "devices/" + userId + "/" + deviceId;
	
		var removeDeviceResponse = Ribbit.signedRequest().doDelete(uri, removeDeviceMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return removeDeviceCallback(removeDeviceResponse); }
		
		
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
         * @return object: an object containing details about the Device, or a RibbitException
		 */
	this.updateDevice = function(callback, deviceId, name, label, callme, notifyvm, callbackreachme, mailtext, shared, notifymissedcall, showcalled, answersecurity, notifytranscription, attachmessage, usewave, key, ringstatus, verifyBy, autoAnswer, allowCCF) {
		
		function updateDeviceCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(deviceId)){ exceptions.push("deviceId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(name)){ exceptions.push("When defined, name must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(label)){ exceptions.push("When defined, label must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(callme)){ exceptions.push("When defined, callme must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifyvm)){ exceptions.push("When defined, notifyvm must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(callbackreachme)){ exceptions.push("When defined, callbackreachme must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(mailtext)){ exceptions.push("When defined, mailtext must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(shared)){ exceptions.push("When defined, shared must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifymissedcall)){ exceptions.push("When defined, notifymissedcall must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(showcalled)){ exceptions.push("When defined, showcalled must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(answersecurity)){ exceptions.push("When defined, answersecurity must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(notifytranscription)){ exceptions.push("When defined, notifytranscription must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(attachmessage)){ exceptions.push("When defined, attachmessage must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(usewave)){ exceptions.push("When defined, usewave must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(key)){ exceptions.push("When defined, key must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(ringstatus)){ exceptions.push("When defined, ringstatus must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(verifyBy)){ exceptions.push("When defined, verifyBy must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(autoAnswer)){ exceptions.push("When defined, autoAnswer must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(allowCCF)){ exceptions.push("When defined, allowCCF must be boolean"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	
			if (Ribbit.Util.isSet(name)) { params.name = name;
	 } 
	
			if (Ribbit.Util.isSet(label)) { params.label = label;
	 } 
	
			if (Ribbit.Util.isSet(callme)) { params.callme = callme;
	 } 
	
			if (Ribbit.Util.isSet(notifyvm)) { params.notifyvm = notifyvm;
	 } 
	
			if (Ribbit.Util.isSet(callbackreachme)) { params.callbackreachme = callbackreachme;
	 } 
	
			if (Ribbit.Util.isSet(mailtext)) { params.mailtext = mailtext;
	 } 
	
			if (Ribbit.Util.isSet(shared)) { params.shared = shared;
	 } 
	
			if (Ribbit.Util.isSet(notifymissedcall)) { params.notifymissedcall = notifymissedcall;
	 } 
	
			if (Ribbit.Util.isSet(showcalled)) { params.showcalled = showcalled;
	 } 
	
			if (Ribbit.Util.isSet(answersecurity)) { params.answersecurity = answersecurity;
	 } 
	
			if (Ribbit.Util.isSet(notifytranscription)) { params.notifytranscription = notifytranscription;
	 } 
	
			if (Ribbit.Util.isSet(attachmessage)) { params.attachmessage = attachmessage;
	 } 
	
			if (Ribbit.Util.isSet(usewave)) { params.usewave = usewave;
	 } 
	
			if (Ribbit.Util.isSet(key)) { params.key = key;
	 } 
	
			if (Ribbit.Util.isSet(ringstatus)) { params.ringstatus = ringstatus;
	 } 
	
			if (Ribbit.Util.isSet(verifyBy)) { params.verifyBy = verifyBy;
	 } 
	
			if (Ribbit.Util.isSet(autoAnswer)) { params.autoAnswer = autoAnswer;
	 } 
	
			if (Ribbit.Util.isSet(allowCCF)) { params.allowCCF = allowCCF;
	 } 
	
			
		var updateDeviceMethodCallback = Ribbit.asynchronous ? updateDeviceCallback : null;
			
		var uri = "devices/" + userId + "/" + deviceId;
	
		var updateDeviceResponse = Ribbit.signedRequest().doPut(uri, params, updateDeviceMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateDeviceCallback(updateDeviceResponse); }
		
		
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
		
	this.requestConditionalCallForwardingTest = function(callback, deviceId) {
		
		function requestConditionalCallForwardingTestCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			deviceId = a.deviceId;
			callback = a.callback;
		}
	
			
		var requestConditionalCallForwardingTestMethodCallback = Ribbit.asynchronous ? requestConditionalCallForwardingTestCallback : null;
			
		var requestConditionalCallForwardingTestResponse  =  Ribbit.Devices().updateDevice(requestConditionalCallForwardingTestMethodCallback, deviceId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, "ccfTest", null, null);
	
		
		if (!Ribbit.asynchronous) { return requestConditionalCallForwardingTestCallback(requestConditionalCallForwardingTestResponse); }
		
		
	};
	
		/**
		 * 
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
		
	this.setAutoAnswer = function(callback, deviceId, autoAnswer, allowCCF) {
		
		function setAutoAnswerCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			deviceId = a.deviceId;
			autoAnswer = a.autoAnswer;
			allowCCF = a.allowCCF;
			callback = a.callback;
		}
	
			
		var setAutoAnswerMethodCallback = Ribbit.asynchronous ? setAutoAnswerCallback : null;
			
		var setAutoAnswerResponse  =  Ribbit.Devices().updateDevice(setAutoAnswerMethodCallback, deviceId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, autoAnswer, allowCCF);
	
		
		if (!Ribbit.asynchronous) { return setAutoAnswerCallback(setAutoAnswerResponse); }
		
		
	};
	
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
		Ribbit.Domain = function(){

		
		/**
		 * Gets a Domain
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param name string: A Domain Name (optional)
         * @return object: an object containing details about the Domain, or a RibbitException
		 */
	this.getDomain = function(callback, name) {
		
		function getDomainCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			name = a.name;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidStringIfDefined(name)){ exceptions.push("When defined, name must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var nameValue = Ribbit.Util.isSet(name) ? name : Ribbit.domain ;
	
			
		var getDomainMethodCallback = Ribbit.asynchronous ? getDomainCallback : null;
			
		var uri = "domains/" + nameValue;
	
		var getDomainResponse = Ribbit.signedRequest().doGet(uri, getDomainMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getDomainCallback(getDomainResponse); }
		
		
	};
	
		/**
		 * Gets a collection of Domains
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param filterBy string: an key to an index with which to filter results (optional)
		 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
         * @return array: an array, each entry of which contains an object of details about the Domain, or a RibbitException
		 */
	this.getDomains = function(callback, filterBy, filterValue) {
		
		function getDomainsCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		var exceptions = [];
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getDomainsMethodCallback = Ribbit.asynchronous ? getDomainsCallback : null;
			
		
			var q = Ribbit.Util.createFilteringQueryString(filterBy, filterValue);
			var uri = "domains" + q;
	
		var getDomainsResponse = Ribbit.signedRequest().doGet(uri, getDomainsMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getDomainsCallback(getDomainsResponse); }
		
		
	};
	
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
		Ribbit.MediaFiles = function(){

		
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
	this.createFolder = function(callback, id, domain) {
		
		function createFolderCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			id = a.id;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(id)){ exceptions.push("id is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
		var params = {};
	params.id = id;
	
			
		var createFolderMethodCallback = Ribbit.asynchronous ? createFolderCallback : null;
			
		var uri = "media/" + domainValue;
	
		var createFolderResponse = Ribbit.signedRequest().doPost(uri, params, createFolderMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createFolderCallback(createFolderResponse); }
		
		
	};
	
		/**
		 * 
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param file string: The name of a file (required)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return object: an object containing details about the xs:string, or a RibbitException
		 */
	this.getFile = function(callback, folder, file, domain) {
		
		function getFileCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			file = a.file;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidString(file)){ exceptions.push("file is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var getFileMethodCallback = Ribbit.asynchronous ? getFileCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/" + file;
	
		var getFileResponse = Ribbit.signedRequest().doGet(uri, getFileMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getFileCallback(getFileResponse); }
		
		
	};
	
		/**
		 * Gets the access control list for a file
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param file string: The name of a file (required)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return object: an object containing details about the AccessControlList, or a RibbitException
		 */
	this.getFileAcl = function(callback, folder, file, domain) {
		
		function getFileAclCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			file = a.file;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidString(file)){ exceptions.push("file is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var getFileAclMethodCallback = Ribbit.asynchronous ? getFileAclCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/" + file + "/acl";
	
		var getFileAclResponse = Ribbit.signedRequest().doGet(uri, getFileAclMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getFileAclCallback(getFileAclResponse); }
		
		
	};
	
		/**
		 * Gets the contents of a folder
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param domain string: A domain name, normally the current users (optional)
		 * @param startIndex int: the first result to return when requesting a paged list (optional)
		 * @param count int: the number of results to return when requesting a paged list (required if a start index is supplied)
		 * @param filterBy string: an key to an index with which to filter results (optional)
		 * @param filterValue string: the value to search within the filter for (required if a filter is supplied)
         * @return object|array: if paging is specified an object is returned that includes paging details, and an array accessed through the 'entry' property. If paging is not specified just an array is returned, or a RibbitException
		 */
	this.getFolder = function(callback, folder, domain, startIndex, count, filterBy, filterValue) {
		
		function getFolderCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			domain = a.domain;
			startIndex = a.startIndex;
			count = a.count;
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var getFolderMethodCallback = Ribbit.asynchronous ? getFolderCallback : null;
			
		
			var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
			var uri = "media/" + domainValue + "/" + folder + q;
	
		var getFolderResponse = Ribbit.signedRequest().doGet(uri, getFolderMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getFolderCallback(getFolderResponse); }
		
		
	};
	
		/**
		 * Get the access control list for a folder
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return object: an object containing details about the AccessControlList, or a RibbitException
		 */
	this.getFolderAcl = function(callback, folder, domain) {
		
		function getFolderAclCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var getFolderAclMethodCallback = Ribbit.asynchronous ? getFolderAclCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/acl";
	
		var getFolderAclResponse = Ribbit.signedRequest().doGet(uri, getFolderAclMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getFolderAclCallback(getFolderAclResponse); }
		
		
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
	this.getUrlForMediaForCall = function(callback, callId, domain) {
		
		function getUrlForMediaForCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			domain = a.domain;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(callId)){ exceptions.push("callId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var getUrlForMediaForCallMethodCallback = Ribbit.asynchronous ? getUrlForMediaForCallCallback : null;
			
		var uri = "media/" + domainValue + "/call:" + callId + "/" + callId + ".mp3";
	
		var getUrlForMediaForCallResponse = Ribbit.signedRequest().doGetStreamableUrl(uri, getUrlForMediaForCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getUrlForMediaForCallCallback(getUrlForMediaForCallResponse); }
		
		
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
	this.removeAllMediaForCall = function(callback, callId, domain) {
		
		function removeAllMediaForCallCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callId = a.callId;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(callId)){ exceptions.push("callId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var removeAllMediaForCallMethodCallback = Ribbit.asynchronous ? removeAllMediaForCallCallback : null;
			
		var uri = "media/" + domainValue + "/call:" + callId;
	
		var removeAllMediaForCallResponse = Ribbit.signedRequest().doDelete(uri, removeAllMediaForCallMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return removeAllMediaForCallCallback(removeAllMediaForCallResponse); }
		
		
	};
	
		/**
		 * Removes a file
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param file string: The name of a file (required)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return true if the medi is successfully removed, or a RibbitException
		 */
	this.removeFile = function(callback, folder, file, domain) {
		
		function removeFileCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			file = a.file;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidString(file)){ exceptions.push("file is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var removeFileMethodCallback = Ribbit.asynchronous ? removeFileCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/" + file;
	
		var removeFileResponse = Ribbit.signedRequest().doDelete(uri, removeFileMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return removeFileCallback(removeFileResponse); }
		
		
	};
	
		/**
		 * Removes a folder, and all it's contents
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return true if the medi is successfully removed, or a RibbitException
		 */
	this.removeFolder = function(callback, folder, domain) {
		
		function removeFolderCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
			
		var removeFolderMethodCallback = Ribbit.asynchronous ? removeFolderCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder;
	
		var removeFolderResponse = Ribbit.signedRequest().doDelete(uri, removeFolderMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return removeFolderCallback(removeFolderResponse); }
		
		
	};
	
		/**
		 * Updates the access control list for a file
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param file string: The name of a file (required)
		 * @param readUsers string: An array of User GUIDS who have permission to read the resource (optional)
		 * @param writeUsers string: An array of Users GUIDS who have permission to write to the resource (optional)
		 * @param readApps string: An array of Application GUIDS who have permission to read the resource (optional)
		 * @param writeApps string: An array of Application GUIDS who have permission to write to the resource (optional)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return object: an object containing details about the AccessControlList, or a RibbitException
		 */
	this.updateFileAcl = function(callback, folder, file, readUsers, writeUsers, readApps, writeApps, domain) {
		
		function updateFileAclCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isValidString(file)){ exceptions.push("file is required"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(readUsers)){ exceptions.push("When defined, readUsers must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeUsers)){ exceptions.push("When defined, writeUsers must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(readApps)){ exceptions.push("When defined, readApps must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeApps)){ exceptions.push("When defined, writeApps must be an array of at least one item"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
		var params = {};
	
			if (Ribbit.Util.isSet(readUsers)) { params.readUsers = readUsers;
	 } 
	
			if (Ribbit.Util.isSet(writeUsers)) { params.writeUsers = writeUsers;
	 } 
	
			if (Ribbit.Util.isSet(readApps)) { params.readApps = readApps;
	 } 
	
			if (Ribbit.Util.isSet(writeApps)) { params.writeApps = writeApps;
	 } 
	
			
		var updateFileAclMethodCallback = Ribbit.asynchronous ? updateFileAclCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/" + file + "/acl";
	
		var updateFileAclResponse = Ribbit.signedRequest().doPut(uri, params, updateFileAclMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateFileAclCallback(updateFileAclResponse); }
		
		
	};
	
		/**
		 * Updates the access control list for a folder
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param folder string: The name of a folder (required)
		 * @param readUsers string: An array of User GUIDS who have permission to read the resource (optional)
		 * @param writeUsers string: An array of Users GUIDS who have permission to write to the resource (optional)
		 * @param readApps string: An array of Application GUIDS who have permission to read the resource (optional)
		 * @param writeApps string: An array of Application GUIDS who have permission to write to the resource (optional)
		 * @param domain string: A domain name, normally the current users (optional)
         * @return object: an object containing details about the AccessControlList, or a RibbitException
		 */
	this.updateFolderAcl = function(callback, folder, readUsers, writeUsers, readApps, writeApps, domain) {
		
		function updateFolderAclCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			folder = a.folder;
			readUsers = a.readUsers;
			writeUsers = a.writeUsers;
			readApps = a.readApps;
			writeApps = a.writeApps;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(readUsers)){ exceptions.push("When defined, readUsers must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeUsers)){ exceptions.push("When defined, writeUsers must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(readApps)){ exceptions.push("When defined, readApps must be an array of at least one item"); }
		if (!Ribbit.Util.isNonEmptyArrayIfDefined(writeApps)){ exceptions.push("When defined, writeApps must be an array of at least one item"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			var domainValue = Ribbit.Util.isSet(domain) ? domain : Ribbit.domain ;
	
		var params = {};
	
			if (Ribbit.Util.isSet(readUsers)) { params.readUsers = readUsers;
	 } 
	
			if (Ribbit.Util.isSet(writeUsers)) { params.writeUsers = writeUsers;
	 } 
	
			if (Ribbit.Util.isSet(readApps)) { params.readApps = readApps;
	 } 
	
			if (Ribbit.Util.isSet(writeApps)) { params.writeApps = writeApps;
	 } 
	
			
		var updateFolderAclMethodCallback = Ribbit.asynchronous ? updateFolderAclCallback : null;
			
		var uri = "media/" + domainValue + "/" + folder + "/acl";
	
		var updateFolderAclResponse = Ribbit.signedRequest().doPut(uri, params, updateFolderAclMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateFolderAclCallback(updateFolderAclResponse); }
		
		
	};
	
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
		Ribbit.Message = function(){

		
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
		Ribbit.Message.STATUS_DELETED = "deleted";
	
		/**
		 * Use with FILTER_BY_STATUS to get delivered Messages
		 */
		Ribbit.Message.STATUS_DELIVERED = "delivered";
	
		/**
		 * Use with FILTER_BY_STATUS to get failed Messages
		 */
		Ribbit.Message.STATUS_FAILED = "failed";
	
		/**
		 * Use with FILTER_BY_STATUS to get new Messages
		 */
		Ribbit.Message.STATUS_NEW_MESSAGES = "new";
	
		/**
		 * Use with FILTER_BY_STATUS to get read Messages
		 */
		Ribbit.Message.STATUS_READ = "read";
	
		/**
		 * Use with FILTER_BY_STATUS to get received Messages
		 */
		Ribbit.Message.STATUS_RECEIVED = "received";
	
		/**
		 * Use with FILTER_BY_STATUS to get urgent Messages
		 */
		Ribbit.Message.STATUS_URGENT = "urgent";
	
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
		 * Use with FILTER_BY_MESSAGE_TYPE to get email Messages
		 */
		Ribbit.Message.TYPE_EMAIL = "email";
	
		/**
		 * Use with FILTER_BY_MESSAGE_TYPE to get sms Messages
		 */
		Ribbit.Message.TYPE_SMS = "sms";
	
		/**
		 * Use with FILTER_BY_MESSAGE_TYPE to get voicemail Messages
		 */
		Ribbit.Message.TYPE_VOICEMAIL = "voicemail";
	
		/**
		 * To send an SMS the recipients in the array must be formatted tel:xxnnnnnn where xx is a country code and nnnnnn is their phone number.<br/>When sending a SMS the sender must also be a tel:xxnnnnn uri, and a telephone number registered to the current User on the Ribbit Platform, either an allocated inbound (purpose) number or a cell phone. <br/>The body will be the content that gets displayed on the phone. <br/>The title is sometimes referred to as the message id, and some cellular devices and carriers make this available.
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param recipients string: A list of details about the recipients of the Message (required)
		 * @param body string: The body of the Message (optional)
		 * @param sender string: The device ID that sent the Message (optional)
		 * @param title string: The title of the Message (optional)
         * @return A message identifier, or a RibbitException
		 */
	this.createMessage = function(callback, recipients, body, sender, title) {
		
		function createMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			recipients = a.recipients;
			body = a.body;
			sender = a.sender;
			title = a.title;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isNonEmptyArray(recipients)){ exceptions.push("recipients is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(body)){ exceptions.push("When defined, body must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(sender)){ exceptions.push("When defined, sender must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(title)){ exceptions.push("When defined, title must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.recipients = recipients;
	
			if (Ribbit.Util.isSet(body)) { params.body = body;
	 } 
	
			if (Ribbit.Util.isSet(sender)) { params.sender = sender;
	 } 
	
			if (Ribbit.Util.isSet(title)) { params.title = title;
	 } 
	
			
		var createMessageMethodCallback = Ribbit.asynchronous ? createMessageCallback : null;
			
		var uri = "messages/" + userId + "/outbox";
	
		var createMessageResponse = Ribbit.signedRequest().doPost(uri, params, createMessageMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createMessageCallback(createMessageResponse); }
		
		
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
         * @return object: an object containing details about the Message, or a RibbitException
		 */
	this.getMessage = function(callback, messageId, folder) {
		
		function getMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(messageId)){ exceptions.push("messageId is required"); }
		if (!Ribbit.Util.isValidString(folder)){ exceptions.push("folder is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getMessageMethodCallback = Ribbit.asynchronous ? getMessageCallback : null;
			
		var uri = "messages/" + userId + "/" + folder + "/" + messageId;
	
		var getMessageResponse = Ribbit.signedRequest().doGet(uri, getMessageMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getMessageCallback(getMessageResponse); }
		
		
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
		
	this.getSentMessage = function(callback, messageId) {
		
		function getSentMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			callback = a.callback;
		}
	
			
		var getSentMessageMethodCallback = Ribbit.asynchronous ? getSentMessageCallback : null;
			
		var getSentMessageResponse  =  Ribbit.Messages().getMessage(getSentMessageMethodCallback, messageId, "sent");
	
		
		if (!Ribbit.asynchronous) { return getSentMessageCallback(getSentMessageResponse); }
		
		
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
		
	this.getReceivedMessage = function(callback, messageId) {
		
		function getReceivedMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			callback = a.callback;
		}
	
			
		var getReceivedMessageMethodCallback = Ribbit.asynchronous ? getReceivedMessageCallback : null;
			
		var getReceivedMessageResponse  =  Ribbit.Messages().getMessage(getReceivedMessageMethodCallback, messageId, "inbox");
	
		
		if (!Ribbit.asynchronous) { return getReceivedMessageCallback(getReceivedMessageResponse); }
		
		
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
	this.getMessages = function(callback, startIndex, count, filterBy, filterValue) {
		
		function getMessagesCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getMessagesMethodCallback = Ribbit.asynchronous ? getMessagesCallback : null;
			
		
			var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
			var uri = "messages/" + userId + q;
	
		var getMessagesResponse = Ribbit.signedRequest().doGet(uri, getMessagesMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getMessagesCallback(getMessagesResponse); }
		
		
	};
	
		/**
		 * Get a list of messages filtered by status. Values are 'delivered', 'received' and 'failed'
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param status string: The value which represents the delivery status, to this recipient, of the Message (required)
         * @return array: an array, each entry of which contains an object of details about the Message, or a RibbitException
		 */
	this.getMessagesFilteredByStatus = function(callback, status) {
		
		function getMessagesFilteredByStatusCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			status = a.status;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(status)){ exceptions.push("status is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getMessagesFilteredByStatusMethodCallback = Ribbit.asynchronous ? getMessagesFilteredByStatusCallback : null;
			
		var getMessagesFilteredByStatusResponse  =  Ribbit.Messages().getMessages(getMessagesFilteredByStatusMethodCallback, null,null,"messageStatus",status);
	
		
		if (!Ribbit.asynchronous) { return getMessagesFilteredByStatusCallback(getMessagesFilteredByStatusResponse); }
		
		
	};
	
		/**
		 * Get a list of messages filtered by a tag
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param tag string:  (required)
         * @return array: an array, each entry of which contains an object of details about the Message, or a RibbitException
		 */
	this.getMessagesFilteredByTag = function(callback, tag) {
		
		function getMessagesFilteredByTagCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			tag = a.tag;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(tag)){ exceptions.push("tag is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getMessagesFilteredByTagMethodCallback = Ribbit.asynchronous ? getMessagesFilteredByTagCallback : null;
			
		var getMessagesFilteredByTagResponse  =  Ribbit.Messages().getMessages(getMessagesFilteredByTagMethodCallback, null,null,"tags",tag);
	
		
		if (!Ribbit.asynchronous) { return getMessagesFilteredByTagCallback(getMessagesFilteredByTagResponse); }
		
		
	};
	
		/**
		 * 
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
         * @return array: an array, each entry of which contains an object of details about the Message, or a RibbitException
		 */
	this.getNewMessages = function(callback) {
		
		function getNewMessagesCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
			
		var getNewMessagesMethodCallback = Ribbit.asynchronous ? getNewMessagesCallback : null;
			
		var getNewMessagesResponse  =  Ribbit.Messages().getMessages(getNewMessagesMethodCallback, null,null,"messageStatus","new");
	
		
		if (!Ribbit.asynchronous) { return getNewMessagesCallback(getNewMessagesResponse); }
		
		
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
	this.getReceivedMessages = function(callback, startIndex, count) {
		
		function getReceivedMessagesCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getReceivedMessagesMethodCallback = Ribbit.asynchronous ? getReceivedMessagesCallback : null;
			
		
			var q = Ribbit.Util.createPagingQueryString(startIndex, count);
			var uri = "messages/" + userId + "/inbox" + q;
	
		var getReceivedMessagesResponse = Ribbit.signedRequest().doGet(uri, getReceivedMessagesMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getReceivedMessagesCallback(getReceivedMessagesResponse); }
		
		
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
	this.getSentMessages = function(callback, startIndex, count) {
		
		function getSentMessagesCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getSentMessagesMethodCallback = Ribbit.asynchronous ? getSentMessagesCallback : null;
			
		
			var q = Ribbit.Util.createPagingQueryString(startIndex, count);
			var uri = "messages/" + userId + "/sent" + q;
	
		var getSentMessagesResponse = Ribbit.signedRequest().doGet(uri, getSentMessagesMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getSentMessagesCallback(getSentMessagesResponse); }
		
		
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
         * @return object: an object containing details about the Message, or a RibbitException
		 */
	this.updateMessage = function(callback, messageId, folder, newMessage, urgent, newFolder) {
		
		function updateMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			newMessage = a.newMessage;
			urgent = a.urgent;
			newFolder = a.newFolder;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(messageId)){ exceptions.push("messageId is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(folder)){ exceptions.push("When defined, folder must be a string of one or more characters"); }
		if (!Ribbit.Util.isBoolIfDefined(newMessage)){ exceptions.push("When defined, newMessage must be boolean"); }
		if (!Ribbit.Util.isBoolIfDefined(urgent)){ exceptions.push("When defined, urgent must be boolean"); }
		if (!Ribbit.Util.isValidStringIfDefined(newFolder)){ exceptions.push("When defined, newFolder must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	
			if (Ribbit.Util.isSet(newMessage)) { params["new"] = newMessage;
	 } 
	
			if (Ribbit.Util.isSet(urgent)) { params.urgent = urgent;
	 } 
	
			if (Ribbit.Util.isSet(newFolder)) { params.folder = newFolder;
	 } 
	
			
		var updateMessageMethodCallback = Ribbit.asynchronous ? updateMessageCallback : null;
			
		var uri = "messages/" + userId + "/" + folder + "/" + messageId;
	
		var updateMessageResponse = Ribbit.signedRequest().doPut(uri, params, updateMessageMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateMessageCallback(updateMessageResponse); }
		
		
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
		
	this.markMessageUrgent = function(callback, messageId, folder) {
		
		function markMessageUrgentCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
			
		var markMessageUrgentMethodCallback = Ribbit.asynchronous ? markMessageUrgentCallback : null;
			
		var markMessageUrgentResponse  =  Ribbit.Messages().updateMessage(markMessageUrgentMethodCallback, messageId, folder, null, true, null);
	
		
		if (!Ribbit.asynchronous) { return markMessageUrgentCallback(markMessageUrgentResponse); }
		
		
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
		
	this.markMessageNotUrgent = function(callback, messageId, folder) {
		
		function markMessageNotUrgentCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
			
		var markMessageNotUrgentMethodCallback = Ribbit.asynchronous ? markMessageNotUrgentCallback : null;
			
		var markMessageNotUrgentResponse  =  Ribbit.Messages().updateMessage(markMessageNotUrgentMethodCallback, messageId, folder, null, false, null);
	
		
		if (!Ribbit.asynchronous) { return markMessageNotUrgentCallback(markMessageNotUrgentResponse); }
		
		
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
		
	this.markMessageNew = function(callback, messageId, folder) {
		
		function markMessageNewCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
			
		var markMessageNewMethodCallback = Ribbit.asynchronous ? markMessageNewCallback : null;
			
		var markMessageNewResponse  =  Ribbit.Messages().updateMessage(markMessageNewMethodCallback, messageId, folder, true, null, null);
	
		
		if (!Ribbit.asynchronous) { return markMessageNewCallback(markMessageNewResponse); }
		
		
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
		
	this.markMessageRead = function(callback, messageId, folder) {
		
		function markMessageReadCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
			
		var markMessageReadMethodCallback = Ribbit.asynchronous ? markMessageReadCallback : null;
			
		var markMessageReadResponse  =  Ribbit.Messages().updateMessage(markMessageReadMethodCallback, messageId, folder, false, null, null);
	
		
		if (!Ribbit.asynchronous) { return markMessageReadCallback(markMessageReadResponse); }
		
		
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
		
	this.deleteMessage = function(callback, messageId, folder) {
		
		function deleteMessageCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			messageId = a.messageId;
			folder = a.folder;
			callback = a.callback;
		}
	
			
		var deleteMessageMethodCallback = Ribbit.asynchronous ? deleteMessageCallback : null;
			
		var deleteMessageResponse  =  Ribbit.Messages().updateMessage(deleteMessageMethodCallback, messageId, folder, null, null, "deleted");
	
		
		if (!Ribbit.asynchronous) { return deleteMessageCallback(deleteMessageResponse); }
		
		
	};
	
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
Ribbit.CallLegDtmfRequest = function(flush, maxDigits, stoptones, timeOut, maxInterval){
	
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
	this.getValidationMessage = function(){
		var exceptions = [];
		if (!Ribbit.Util.isBool(this.flush)){ exceptions.push("flush is required"); }
		if (!Ribbit.Util.isPositiveInteger(this.maxDigits)){ exceptions.push("maxDigits is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)){ exceptions.push("When defined, stoptones must be a string of one or more characters"); }
		if (!Ribbit.Util.isPositiveInteger(this.timeOut)){ exceptions.push("timeOut is required"); }
		if (!Ribbit.Util.isPositiveInteger(this.maxInterval)){ exceptions.push("maxInterval is required"); }
		return exceptions.join(",");
	};
	
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function(){
		var v = {};
		if (Ribbit.Util.isSet(this.flush)){
			v.flush = this.flush; 
		}

		if (Ribbit.Util.isSet(this.maxDigits)){
			v.maxDigits = this.maxDigits; 
		}

		if (Ribbit.Util.isSet(this.stoptones)){
			v.stopTones = this.stoptones; 
		}

		if (Ribbit.Util.isSet(this.timeOut)){
			v.timeOut = this.timeOut; 
		}

		if (Ribbit.Util.isSet(this.maxInterval)){
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
Ribbit.CallPlayMedia = function(type, value, offset, duration){
	
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
	this.getValidationMessage = function(){
		var exceptions = [];
		if (!Ribbit.Util.isValidString(this.type)){ exceptions.push("type is required"); }
		if (!Ribbit.Util.isValidString(this.value)){ exceptions.push("value is required"); }
		if (!Ribbit.Util.isNumber(this.offset)){ exceptions.push("offset is required"); }
		if (!Ribbit.Util.isNumber(this.duration)){ exceptions.push("duration is required"); }
		return exceptions.join(",");
	};
	
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function(){
		var v = {};
		if (Ribbit.Util.isSet(this.type)){
			v.type = this.type; 
		}

		if (Ribbit.Util.isSet(this.value)){
			v.value = this.value; 
		}

		if (Ribbit.Util.isSet(this.offset)){
			v.offset = this.offset; 
		}

		if (Ribbit.Util.isSet(this.duration)){
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
Ribbit.CallPlayRequest = function(media, transactionId, stoptones, flush){
	
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
	this.getValidationMessage = function(){
		var exceptions = [];
		if (!Ribbit.Util.isNonEmptyArray(this.media)){exceptions.push("media must be an array containing instances of Ribbit.CallPlayMedia");}
		else{
			for (var i=0;i<this.media.length; i++){
				if (!(this.media[i] instanceof Ribbit.CallPlayMedia)){exceptions.push("media contains objects that are not instances of Ribbit.CallPlayMedia");break;}
			}
		}
		if (exceptions.length===0){
			for (i=0;i<this.media.length; i++){
				if (this.media[i].getValidationMessage() !==""){exceptions.push(this.media[i].getValidationMessage());}
			}
		}
		if (!Ribbit.Util.isValidStringIfDefined(this.transactionId)){ exceptions.push("When defined, transactionId must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)){ exceptions.push("When defined, stoptones must be a string of one or more characters"); }
		if (!Ribbit.Util.isBool(this.flush)){ exceptions.push("flush is required"); }
		return exceptions.join(",");
	};
	
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function(){
		var v = {};
		if (Ribbit.Util.isSet(this.media)){
			var arr = [];
			for (var i = 0; i<this.media.length; i++){
				arr.push(this.media[i].toObject());
			}
			v.media = arr; 
		}

		if (Ribbit.Util.isSet(this.transactionId)){
			v.transactionId = this.transactionId; 
		}

		if (Ribbit.Util.isSet(this.stoptones)){
			v.stoptones = this.stoptones; 
		}

		if (Ribbit.Util.isSet(this.flush)){
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
Ribbit.CallRecordRequest = function(file, append, flush, duration, stoptones){
	
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
	this.getValidationMessage = function(){
		var exceptions = [];
		if (!Ribbit.Util.isValidString(this.file)){ exceptions.push("file is required"); }
		if (!Ribbit.Util.isBoolIfDefined(this.append)){ exceptions.push("When defined, append must be boolean"); }
		if (!Ribbit.Util.isBool(this.flush)){ exceptions.push("flush is required"); }
		if (!Ribbit.Util.isPositiveIntegerIfDefined(this.duration)){ exceptions.push("When defined, duration must be a positive integer"); }
		if (!Ribbit.Util.isValidStringIfDefined(this.stoptones)){ exceptions.push("When defined, stoptones must be a string of one or more characters"); }
		return exceptions.join(",");
	};
	
	/**
	 * Creates an object suitable for sending to the Ribbit service.
	 */
	this.toObject = function(){
		var v = {};
		if (Ribbit.Util.isSet(this.file)){
			v.file = this.file; 
		}

		if (Ribbit.Util.isSet(this.append)){
			v.append = this.append; 
		}

		if (Ribbit.Util.isSet(this.flush)){
			v.flush = this.flush; 
		}

		if (Ribbit.Util.isSet(this.duration)){
			v.duration = this.duration; 
		}

		if (Ribbit.Util.isSet(this.stoptones)){
			v.stoptones = this.stoptones; 
		}

		return v;
		
	};
};
/**
 * @class Base class for RibbitExceptions.
 */
Ribbit.RibbitException = function(errorMessage,httpStatus){
	this.message = errorMessage;
	this.status = httpStatus;
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
};Ribbit.JsonpRequest = function (method, uri, headers, body, callback){
	
	var u = uri;
	var q;
	var rwr = this;
	
	rwr.callback = function (responseStatus, responseText, responseLocation){
		
		rwr.responseText = responseText;
		rwr.responseStatus = parseInt(responseStatus,10);
		rwr.responseLocation = responseLocation;
		callback();
	};	
	
	this.execute  = function(){
		var script = document.createElement('script');
		script.type = "text/javascript";
		script.src =  rwr.u + rwr.q;
		document.getElementsByTagName('head')[0].appendChild(script);
	};
	
	
	rwr.u=uri;
	Ribbit.jsonpCallbacks.push(rwr.callback);
	
	rwr.q= uri.indexOf("?") > 1 ? "&" :"?";
	rwr.q += "h=" + escape(Ribbit.Util.stringifyHeaders(headers));
	if (method !== "GET"){
		rwr.q += "&m="+ method;
	}
	if (Ribbit.Util.isValidString(body)){
		rwr.q += "&b="+ escape(body);
	}
	if (callback !==null){
		rwr.q += "&c="+(Ribbit.jsonpCallbacks.length-1).toString();
	}
	rwr.q += "&w=JS";
	
	
	 
};

Ribbit.RibbitSignedRequest = function(){
	
	this.PUT = 'PUT';
	this.DELETE = 'DELETE';
	this.POST = 'POST';
	this.GET = 'GET';
	var _http_status;
	var _callback;
	var _uri;
	var _oAuthRequest;
	
	this.makeUri = function(uri){
		var out;
		if (uri.substring(0,4)==="http"){
			out = uri;
		}
		else{
			out = Ribbit.endpoint + Ribbit.Util.checkEndPointForSlash() + uri;
		}
		return out;
	};
	
	this.doGet = function(uri, callback) {
		rsr._callback = callback;
		rsr._uri = uri;
		return rsr.send(rsr.GET,null);
	};
	this.createStreamableUrl = function (uri){
		uri = rsr.makeUri(uri);
		rsr._uri = uri;
		var headers = rsr.createHeaders(rsr.GET, null, null, null, Ribbit.Util.stringEndsWith(rsr._uri,".mp3") ? "audio/mpeg" : "*");
		return uri+ "?h=" + escape(Ribbit.Util.stringifyHeaders(headers));
	};
	this.doGetStreamableUrl = function(uri, callback) {
		return Ribbit.respond(callback, this.createStreamableUrl(uri));
	};
	this.doPost = function (uri, vars, callback, x_auth_username, x_auth_password){
		rsr._callback = callback;
		rsr._uri = uri;
		if (vars) { vars = Ribbit.Util.JSON.stringify(vars); }
		return rsr.send (rsr.POST, vars, x_auth_username, x_auth_password);
	};
	this.doPut = function (uri, vars, callback){
		rsr._callback = callback;
		rsr._uri = uri;
		if (vars) { vars = Ribbit.Util.JSON.stringify(vars); }
		return rsr.send (rsr.PUT, vars);
	};
	this.doDelete = function (uri, callback){
		rsr._callback = callback;
		rsr._uri = uri;
		return rsr.send (rsr.DELETE, null);
	};
	this.doCustom = function (method, uri, body, callback){
		rsr._callback = callback;
		rsr._uri = uri;
		return rsr.send (method, body);
	};
	this.callback = function (){
		Ribbit.log({direction:"response",uri:rsr._uri, responseStatus:rsr._oAuthRequest.responseStatus, responseLocation:rsr._oAuthRequest.responseLocation, responseText:rsr._oAuthRequest.responseText});
		if (rsr._oAuthRequest.responseStatus === 201 ) {
			return Ribbit.respond(rsr._callback, rsr._oAuthRequest.responseLocation);
		}
		else if (rsr._oAuthRequest.responseStatus === 202) {
			return Ribbit.respond(rsr._callback, true);
		}
		else if (rsr._oAuthRequest.responseStatus.toString().substr(0,1) == '2'){
			return Ribbit.respond(rsr._callback, rsr._oAuthRequest.responseText);
		}
		else {
			var error_message = "";
			if (rsr._oAuthRequest.responseStatus === 400 || rsr._oAuthRequest.responseStatus === 404 || rsr._oAuthRequest.responseStatus === 409 ){
				error_message = Ribbit.Util.isValidString(rsr._oAuthRequest.responseText) ? rsr._oAuthRequest.responseText : rsr.translateStatus(rsr._oAuthRequest.responseStatus);
			}
			else{
				error_message = rsr.translateStatus(rsr._oAuthRequest.responseStatus);
			}
			var e = new Ribbit.RibbitException(error_message, rsr._oAuthRequest.responseStatus);
			return Ribbit.respond(rsr._callback, e);
		}
	};

	this.signForOAuth = function(clearText){
		var consumerSecret = Ribbit.Util.isValidString (Ribbit.consumerSecret) ? Ribbit.consumerSecret : "";
		var accessSecret = Ribbit.Util.isValidString (Ribbit.accessSecret) ? Ribbit.accessSecret : "";
		return Ribbit.Util.sha1.b64_hmac_sha1( consumerSecret + '&' + accessSecret, clearText);
	};
	
	this.createAuthHeader = function(method, body, x_auth_username, x_auth_password){
		if (body !== null) { var bodySignature  =  rsr.signForOAuth(body); }
		
		var nonce = Ribbit.Util.uuid() ;
		var ts = new Date().getTime();
		var qps = (rsr._uri.indexOf("?") > 0 )? rsr._uri.substr(rsr._uri.indexOf("?") + 1, rsr._uri.length - rsr._uri.indexOf("?") -1) : false;
		var p = {};
		p.oauth_consumer_key  = Ribbit.consumerToken;
		p.oauth_nonce = nonce;
		p.oauth_signature_method = 'HMAC-SHA1';
		p.oauth_timestamp = ts;
		if (Ribbit.accessToken !== null ) {p.oauth_token = Ribbit.accessToken;}
		if (x_auth_password) {p.x_auth_password = x_auth_password;}
		if (x_auth_username) {p.x_auth_username = x_auth_username;}
		if (bodySignature) {
			p.xoauth_body_signature = bodySignature;
			p.xoauth_body_signature_method = 'HMAC-SHA1';
		}
		if (qps){
			qps = qps.split('&');
			for (var i = 0; i<qps.length; i++){
				var ps  = qps[i].split('=');
				p[ps[0]] = ps[1];
			}
		}
		var a = [];
		for (var k in p){if (k){a.push(k);}}
		a = a.sort();
		var q = '';
		for (i = 0; i<a.length; i++){q += ((i>0) ? '&' :'') + a[i] + '=' + p[a[i]];}
		
		var stringToSign = method +'&' + encodeURIComponent(Ribbit.Util.normalizeUri(rsr._uri)) + '&' + encodeURIComponent(q);
		var stringSignature = rsr.signForOAuth(stringToSign);
		
		return 'OAuth realm="' + encodeURIComponent('http://oauth.ribbit.com')+'"' +
				',oauth_consumer_key="' + Ribbit.consumerToken +'"' +
				',oauth_signature_method="HMAC-SHA1"' +
				',oauth_timestamp="'+ ts + '"' +
				',oauth_nonce="' + nonce +'"' + 
				',oauth_signature="' + encodeURIComponent(stringSignature) + '"' +
				((Ribbit.accessToken !== null ) ? ',oauth_token="' + Ribbit.accessToken + '"' :'') + 
				((x_auth_password) ? ',x_auth_password="' + x_auth_password + '"' :'') + 
				((x_auth_username) ? ',x_auth_username="' + x_auth_username + '"' :'') + 
				((bodySignature) ? ',xoauth_body_signature_method="HMAC-SHA1",xoauth_body_signature="' + encodeURIComponent(bodySignature) +'"' : '');
		
	};
	
	this.createHeaders = function(method, body, x_auth_username, x_auth_password, acceptType){
		var headers = Ribbit.customHeaders();
		if (body !== null && x_auth_username === undefined) { headers.push(['Content-type', 'application/json']); }
		headers.push(['Accept', acceptType]);
		headers.push(['Authorization',rsr.createAuthHeader(method, body, x_auth_username, x_auth_password)]);
		headers.push(['User-Agent','ribbit_javascript_library_1.5.4']);
		
		return headers;
	};
	
	this.send = function(method, body, x_auth_username, x_auth_password) {
		if (!Ribbit.asynchronous && Ribbit.useJsonp){
			throw new RibbitException("You can only use the Ribbit Javascript library synchronously when running off a file URI");
		}
		rsr._uri = rsr.makeUri(rsr._uri); 
		var accept="application/json";
		if (Ribbit.Util.stringEndsWith(rsr._uri,".mp3")){
			accept="audio/mpeg";
		}
		else if (Ribbit.Util.stringEndsWith(rsr._uri,".wav")){
			accept="*";
		}
		
		var headers = rsr.createHeaders(method, body, x_auth_username, x_auth_password, accept);
		Ribbit.log({direction:"request",uri:rsr._uri, headers:headers, method:method, body:body });
		if (Ribbit.useJsonp){
			rsr._oAuthRequest = new Ribbit.JsonpRequest(method, rsr._uri, headers, body, rsr.callback);
			rsr._oAuthRequest.execute();
		}
		else{
			var webRequestCallback = Ribbit.asynchronous ? rsr.callback : null;
			rsr._oAuthRequest = new Ribbit.WebRequest(method, rsr._uri, headers, body, webRequestCallback);
			rsr._oAuthRequest.execute();
			if (!Ribbit.asynchronous) { return rsr.callback(); }
		}
	};

	this.translateStatus =  function(httpStatus) {
		var error_string = null;
		
		if (httpStatus >= 500) {
			error_string = "An unexpected error has occured";
		}
		else {
			switch (httpStatus){
				case 400:
					error_string = "The request was malformed";
					break;
				case 401:
					error_string = "The request was not authorized";
					break;
				case 402:
					error_string = "The account has insufficient credit";
					break;
				case 403:
					error_string = "The request was forbidden";
					break;
				case 404:
					error_string = "The requested resource was not found";
					break;
				case 406:
					error_string = "The request was not acceptable";
					break;
				case 407:
					error_string = "Proxy credentials must be specified or were incorrect";
					break;
				case 408:
					error_string = "The request timed out";
					break;
				case 409:
					error_string = rsr._uri + " already exists";
					break;
			}
		}
		return error_string;
	};
	var rsr = this;
};Ribbit.requestToken = "";
Ribbit.requestSecret = "";

/**
* Call this method to authenticate a user on the Ribbit for Mobild domain
* Calling this will start a three legged oAuth process. The user will be directed to
* the Ribbit For Mobile sign in page, and returned to this page when they have either approved or denied
* access for your application to use their account.
* 
* When control is returned to your application, please check the value of Ribbit.isLoggedIn, which will be true if the user approved 
* your authentication request, otherwise it will be false
*
* @public
* @function
*/
Ribbit.getAuthenticatedUser = function(){
	Ribbit.Logoff();
	var cb = function(val){
		var bits = val.split('&');
		Ribbit.requestToken  =bits[0].split('=')[1];
		Ribbit.requestSecret = bits[1].split('=')[1];
		var myPage = window.location.href.split("#")[0];
		Ribbit.saveCookie();	
		myPage = Ribbit.endpoint + Ribbit.Util.checkEndPointForSlash()  + "oauth/display_token.html?oauth_token=" + Ribbit.requestToken +"&oauth_callback="+myPage;
        window.location = myPage;
	};
	Ribbit.signedRequest().doPost("request_token" ,null, cb);
};

/**
* This method is called when the user has approved access to your application.
*
* @private
* @function
*/
Ribbit.exchangeRequestToken = function(){

	var cb = function(val){
		Ribbit.requestToken = "";
		Ribbit.requestSecret = "";
		var bits = val.split('&');
		Ribbit.accessToken  =bits[0].split('=')[1];
		Ribbit.accessSecret = bits[1].split('=')[1];
		Ribbit.userId = bits[2].split('=')[1];
		var u = unescape(bits[3].split('=')[1]);
		Ribbit.domain = u.split(':')[0];
		Ribbit.username = u.split(':')[1];
		Ribbit.isLoggedIn = true;
	};
	Ribbit.signedRequest().doPost("access_token" ,null, cb);
};

/**
* Use this function to login a user on your own application domain. We do not recommend using this method unless the end user himself
* will lose out by giving away the user name and password. We strongly urge you NOT to hard code login and password values into your web application
*
* @public
* @function
*/
Ribbit.login = function (callback, login, password){
	
	function loginCallback(val){
		
		if (val.status && val.status >= 400) {
			return Ribbit.respond(callback, val);
		}
		else {
			var bits = val.split('&');
			Ribbit.accessToken  =bits[0].split('=')[1];
			Ribbit.accessSecret = bits[1].split('=')[1];
			Ribbit.userId = bits[2].split('=')[1];
			Ribbit.username = login;
			Ribbit.saveCookie();
			Ribbit.isLoggedIn = true;
			return Ribbit.respond(callback, true);
		}
	}
	
	Ribbit.Logoff();
	
	var exceptions = [];
	if (!Ribbit.Util.isValidString(login)) { exceptions.push("A login is required"); }
	if (!Ribbit.Util.isValidString(password)) { exceptions.push("A password is required"); }
	if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
	var loginMethodCallback = Ribbit.asynchronous ? loginCallback : null;
	var loginResponse = Ribbit.signedRequest().doPost("login", '', loginMethodCallback, login, password);
	if (!Ribbit.asynchronous) { return loginCallback(loginResponse); }
};

/**
* Use this function to login a user on your own application domain. We do not recommend using this method unless the end user himself
* will lose out by giving away the user name and password. We strongly urge you NOT to hard code login and password values into your web application
*
* @public
* @function
*/
Ribbit.Login = function (callback, login, password){
	if (callback === null)
	{
		return Ribbit.login(callback, login, password);
	}
	else
	{
		Ribbit.login(callback, login, password);
	}
};

/**
* Use this function to logoff a user. This works regardless of how the user was authenticated
*
* @public
* @function
*/
Ribbit.logoff = function(){
	Ribbit.accessToken = null;
	Ribbit.accessSecret = '';
	Ribbit.userId = null;
	Ribbit.username = null;
	Ribbit.saveCookie();
	Ribbit.isLoggedIn = false;
};
Ribbit.Logoff = function(){
	Ribbit.logoff();
};

Ribbit.Util ={};
	
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

  return function (len, radix) {
    var chars = CHARS, uuid = [], rnd = Math.random;
    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (var i = 0; i < len; i++) {uuid[i] = chars[0 | rnd()*radix];}
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
          r = 0 | rnd()*16;
          uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
        }
      }
    }

    return uuid.join('');
  };
}();




Ribbit.Util.parseUri  = function(uri) {
	var o = {};
	o.protocol = "";
	o.host ="";
	o.port = "";
	o.directory ="";
	o.file = "";
	o.query = "";
	
	//first dig out the query
	var s = uri.split("?");
	if (s.length ===2 ){
		o.query = s[1];
	}
	s = s[0];
	
	var t = s.split("/");
	
	//fixes cases where duff input comes in 
	if (t.length<3){ return o;}
	
	//get the protocol
	o.protocol = t[0].substring(0,t[0].length-1);
	
	//get the host and port
	s = t[2].split(":");
	o.host = s[0].toLowerCase();

	if (s.length === 2){
		o.port = s[1];
	}
	
	//get the file
	o.file = "/"+t[t.length-1];
	
	//walk the rest
	for (var i=3;i<t.length-1;i++){
		o.directory = o.directory + "/" + t[i];
	}
	return o;	                       
};


Ribbit.Util.normalizeUri = function(uri){
	var u = Ribbit.Util.parseUri(uri);
	return u.protocol + '://' + u.host +
			( (u.port === '') ? '' :
					( (u.protocol == 'https' && u.port !== '443' ) ? ':' + u.port :
							(u.protocol == 'http' && u.port !== '80' ) ? ':' + u.port :'')) +
			 u.directory + u.file; 
};

Ribbit.Util.isArray = function(v){
	return Ribbit.Util.isSet(v) && v.constructor.toString().indexOf("Array") > 0;
};

Ribbit.Util.isArrayWhenDefined = function(v){
	return v === undefined || v === null || v === Ribbit.Util.isArray(v);
};

Ribbit.Util.isNonEmptyArray = function(v){
	return Ribbit.Util.isArray(v) && v.length > 0;
};

Ribbit.Util.isNonEmptyArrayIfDefined = function(v){
	return Ribbit.Util.isArrayWhenDefined(v) || Ribbit.Util.isNonEmptyArray(v);
};

Ribbit.Util.makeOrderedArray = function(v){
	if (v === "null" || v === {}) {v = [];}
	var r;
	if (Ribbit.Util.isArray(v)){	
		r = v;
	}
	else {
		r = [];
		var b = false;
		for (k in v){
			if (k){
				b = true;
				break;
			}
		}
		if (b) {r.push(v);}
	}
	return r;
};

Ribbit.Util.isEmptyObject  = function(o) {
    var i;
    var b = true;
    if (typeof o === 'object') {
        for (i in o) {
            if (o[i] !== undefined && typeof o[i]  !== 'function') {
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
	return uri.substr(i+1, uri.length - i); 
};

Ribbit.Util.isSet = function(v) {
	return v !== undefined && v !== null;
};

Ribbit.Util.isString = function(v){
	return typeof(v) == "string";
};

Ribbit.Util.isNumber = function(v){
	return typeof v === 'number' && isFinite(v);
};

Ribbit.Util.isValidString = function(v) {
	return Ribbit.Util.isString(v) && v.length > 0;
};

Ribbit.Util.isValidStringIfDefined = function(v) {
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isValidString(v);
};

Ribbit.Util.isBool = function(v){
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

Ribbit.Util.stringEndsWith = function(haystack, needle){
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

Ribbit.Util.toRequestDate = function(dt){
	if (!Ribbit.Util.isValidDate(dt)){ dt = new Date(dt);}
	var y = dt.getFullYear().toString();
	var m = (dt.getUTCMonth()+1).toString();if (m.length === 1) {m = "0"+m;}
	var d = dt.getUTCDate().toString();if (d.length === 1) {d = "0"+d;}
	var h = dt.getUTCHours().toString();if (h.length === 1) {h = "0"+h;}
	var n = dt.getUTCMinutes().toString();if (n.length === 1) {n = "0"+n;}
	var s = dt.getUTCSeconds().toString();if (s.length === 1) {s = "0"+s;}
	return y + "-" + m + "-" + d +"T" + h+ ":" +n +":" +s;
};

Ribbit.Util.toXmlDate = function(dt){
	var requestDate = Ribbit.Util.toRequestDate(dt);
	return requestDate + "Z";
};

Ribbit.Util.fromXmlDate = function(dt){
	var y = dt.substr(0,4)-0;
	var m = dt.substr(5,2)-1;
	var d = dt.substr(8,2)-0;
	var h = dt.substr(11,2)-0;
	var n = dt.substr(14,2)-0;
	var s = dt.substr(17,2)-0;
	return new Date(y,m,d,h,n,s);
};

Ribbit.Util.isPositiveInteger = function(v){
	return Ribbit.Util.isSet(v) && (Math.floor(Math.abs((v-0))).toString() === v.toString());
};

Ribbit.Util.isPositiveIntegerIfDefined = function(v){
	return !Ribbit.Util.isSet(v) || Ribbit.Util.isPositiveInteger(v);
};

Ribbit.Util.checkPagingParameters = function(startIndex, count){
	var exceptions = [];
	if (Ribbit.Util.isSet(startIndex) && !Ribbit.Util.isSet(count)) { exceptions.push("If startIndex is specified, count must be specified too");}
	if (Ribbit.Util.isSet(count) && !Ribbit.Util.isSet(startIndex)) { exceptions.push("If count is specified, startIndex must be specified too");}
	
	if (Ribbit.Util.isSet(startIndex) && Ribbit.Util.isSet(count)){
		if (!Ribbit.Util.isPositiveInteger(startIndex)) { exceptions.push("startIndex must be a positive integer"); }
		if (!Ribbit.Util.isPositiveInteger(count)) { exceptions.push("count must be a positive integer"); }
	}
	return exceptions;
};

Ribbit.Util.checkFilterParameters = function(filterBy, filterValue){
	//fix for the case where a boolean filterValue passed in (messages/new in Kermit as an example)
	if (Ribbit.Util.isBool(filterValue)){ filterValue = filterValue ? "true" : "false";}
	
	var exceptions = [];
	if (Ribbit.Util.isSet(filterBy) && !Ribbit.Util.isSet(filterValue)) { exceptions.push("If filterBy is specified, filterValue must be specified too");}
	if (Ribbit.Util.isSet(filterValue) && !Ribbit.Util.isSet(filterBy)) { exceptions.push("If filterValue is specified, filterBy must be specified too");}
	
	if (Ribbit.Util.isSet(filterBy) && Ribbit.Util.isSet(filterValue)){
		if (!Ribbit.Util.isValidStringIfDefined(filterBy)) { exceptions.push("When defined, filterBy must be a valid filtering property of the resource"); }
		if (!Ribbit.Util.isValidStringIfDefined(filterValue)) { exceptions.push("When defined, filterValue must be a string of one or more characters"); }
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
	
Ribbit.Util.createQueryString = function(startIndex, count, filterBy, filterValue){
	var result = Ribbit.Util.createPagingQueryString(startIndex, count);
	if (result.length > 0 && Ribbit.Util.isSet(filterBy)) {
		result = result + "&" + Ribbit.Util.createFilteringInnerString(filterBy, filterValue);
	}
	else if (Ribbit.Util.isSet(filterBy)) {
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

Ribbit.Util.html_entity_decode = function(s,quote_style){
	    var histogram = {}, symbol = '', tmp_str = '', entity = '';
	    tmp_str = s.toString();
		tmp_str = tmp_str.replace("&quot;","\\\"","g").replace("\n","","g");
	    if (false === (histogram = Ribbit.Util.get_html_translation_table('HTML_ENTITIES', quote_style))) {
	        return false;
	    }

	    // &amp; must be the last character when decoding!
	    delete histogram['&'];
	    histogram['&'] = '&amp;';

	    for (symbol in histogram) {
	    	if (symbol){
	    		entity = histogram[symbol];
	    		tmp_str = tmp_str.split(entity).join(symbol);
	    	}
	    }
	    
	    return tmp_str;
};

Ribbit.Util.get_html_translation_table = function(table, quote_style) {
    
    var e = {}, histogram = {}, decimal = 0, symbol = '';
    var constMappingTable = {}, constMappingQuoteStyle = {};
    var useTable = {}, useQuoteStyle = {};
    
    useTable      = (table ? table.toUpperCase() : 'HTML_SPECIALCHARS');
    useQuoteStyle = (quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT');
    
    // Translate arguments
    constMappingTable[0]      = 'HTML_SPECIALCHARS';
    constMappingTable[1]      = 'HTML_ENTITIES';
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
	    e['38']  = '&amp;';
        if (useQuoteStyle != 'ENT_NOQUOTES') {
            e['34'] = '&quot;';
        }
        if (useQuoteStyle == 'ENT_QUOTES') {
            e['39'] = '&#039;';
        }
	    e['60']  = '&lt;';
	    e['62']  = '&gt;';
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
        throw new Error("Table: "+useTable+' not supported');
    }
    
    // ascii decimals to real symbols
    for (d in e) {
    	if (d){
    		symbol = String.fromCharCode(d);
    		histogram[symbol] = e[d];
    	}
    }
    
    return histogram;
};

Ribbit.Util.stringifyHeaders = function (headers){
	var h = '';
	//create pipe delimeted string of all the headers
	for (var p = 0; p < headers.length; p++) {
		h +=  ((p>0) ? "|" : "" )+ headers[p][0] + '=' + headers[p][1];
	}
	return h;
};

Ribbit.Util.checkEndPointForSlash = function(){
	return ((Ribbit.endpoint.substr(Ribbit.endpoint.length - 1, 1) ==="/") ? ""  : "/");
};Ribbit.WebRequest = function(method, uri, headers, body, callback) {
	
	
	this.getRequest = function(method, uri){
		var r;
		if (navigator.appName.indexOf("Microsoft") > -1 ) {
			try{
				r=new ActiveXObject("Microsoft.XMLHTTP");
			}catch(ie_ex){
				throw new Ribbit.NoXhrException(ie_ex);
			}
		}
		else{
			r=new XMLHttpRequest();
		}
		if (navigator.appName.indexOf("Microsoft") < 0 ) {
			netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");
		}
		r.open(method,uri, Ribbit.asynchronous);
		return r;
	};
	this.execute = function(){
		if (Ribbit.asynchronous) { rwr.xhr.onreadystatechange = rwr.onXHRStateChange; }
		rwr.xhr.send(rwr.b);
		if (!Ribbit.asynchronous) { rwr.processResponse(); }
	};
	
	this.processResponse = function() {
		rwr.responseText = rwr.xhr.responseText;
		rwr.responseStatus = rwr.xhr.status;
		rwr.responseLocation = (rwr.xhr.status==201 || rwr.xhr.status==202) ? rwr.xhr.getResponseHeader("LOCATION"):"";
	};
	
	this.onXHRStateChange = function() {
		if (rwr.xhr.readyState == 4) {
			rwr.processResponse();
			rwr.c();
		}
	};
	
	headers.push(['Host',Ribbit.Util.parseUri(uri).host]);
	headers.push(['User-Agent','ribbit_javascript_library_1.5.4']);
	
	var rwr = this;
	rwr.u = uri;
	rwr.b = body;
	rwr.m = method;
	rwr.c = callback;
	rwr.xhr = rwr.getRequest(rwr.m, rwr.u);
	for (var p = 0; p < headers.length; p++) {
		rwr.xhr.setRequestHeader(headers[p][0], headers[p][1]);
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
		Ribbit.Token = function(){

		
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
	this.createToken = function(callback, type, callee, caller, description, startDate, endDate, maxConcurrent) {
		
		function createTokenCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(type)){ exceptions.push("type is required"); }
		if (!Ribbit.Util.isValidString(callee)){ exceptions.push("callee is required"); }
		if (!Ribbit.Util.isValidString(caller)){ exceptions.push("caller is required"); }
		if (!Ribbit.Util.isValidString(description)){ exceptions.push("description is required"); }
		if (!Ribbit.Util.isValidDateIfDefined(startDate)){ exceptions.push("startDate is not a valid date"); }
		if (!Ribbit.Util.isValidDateIfDefined(endDate)){ exceptions.push("endDate is not a valid date"); }
		if (!Ribbit.Util.isPositiveIntegerIfDefined(maxConcurrent)){ exceptions.push("When defined, maxConcurrent must be a positive integer"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.type = type;
	params.callee = callee;
	params.caller = caller;
	params.description = description;
	
			if (Ribbit.Util.isSet(startDate)) { params.startDate = Ribbit.Util.toXmlDate(startDate);
	 } 
	
			if (Ribbit.Util.isSet(endDate)) { params.endDate = Ribbit.Util.toXmlDate(endDate);
	 } 
	
			if (Ribbit.Util.isSet(maxConcurrent)) { params.maxConcurrent = maxConcurrent;
	 } 
	
			
		var createTokenMethodCallback = Ribbit.asynchronous ? createTokenCallback : null;
			
		var uri = "tokens";
	
		var createTokenResponse = Ribbit.signedRequest().doPost(uri, params, createTokenMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createTokenCallback(createTokenResponse); }
		
		
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
		
	this.createYouPhoneToken = function(callback, callee, caller, description, startDate, endDate, maxConcurrent) {
		
		function createYouPhoneTokenCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
			
		var createYouPhoneTokenResponse  =  Ribbit.Tokens().createToken(createYouPhoneTokenMethodCallback, "uphone", callee, caller, description, startDate, endDate, maxConcurrent);
	
		
		if (!Ribbit.asynchronous) { return createYouPhoneTokenCallback(createYouPhoneTokenResponse); }
		
		
	};
	
		/**
		 * Retrieve the details of a Token that belongs to the current User
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param tokenId string: A Token identifier (required)
         * @return object: an object containing details about the Token, or a RibbitException
		 */
	this.getToken = function(callback, tokenId) {
		
		function getTokenCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			tokenId = a.tokenId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(tokenId)){ exceptions.push("tokenId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getTokenMethodCallback = Ribbit.asynchronous ? getTokenCallback : null;
			
		var uri = "tokens/" + userId + "/" + tokenId;
	
		var getTokenResponse = Ribbit.signedRequest().doGet(uri, getTokenMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getTokenCallback(getTokenResponse); }
		
		
	};
	
		/**
		 * Retrieve a list of details about Tokens that belong to the current User. This method supports pagination
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
         * @return array: an array, each entry of which contains an object of details about the Token, or a RibbitException
		 */
	this.getTokens = function(callback) {
		
		function getTokensCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
			
		var getTokensMethodCallback = Ribbit.asynchronous ? getTokensCallback : null;
			
		var uri = "tokens/" + userId;
	
		var getTokensResponse = Ribbit.signedRequest().doGet(uri, getTokensMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getTokensCallback(getTokensResponse); }
		
		
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
	this.removeToken = function(callback, tokenId) {
		
		function removeTokenCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = true;
	
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			tokenId = a.tokenId;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(tokenId)){ exceptions.push("tokenId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var removeTokenMethodCallback = Ribbit.asynchronous ? removeTokenCallback : null;
			
		var uri = "tokens/" + userId + "/" + tokenId;
	
		var removeTokenResponse = Ribbit.signedRequest().doDelete(uri, removeTokenMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return removeTokenCallback(removeTokenResponse); }
		
		
	};
	
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
		Ribbit.User = function(){

		
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
	this.createUser = function(callback, login, password, firstName, lastName, accountId, domain) {
		
		function createUserCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				ret = Ribbit.Util.getIdFromUri(val);
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
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
		
		if (Ribbit.consumerSecret === null || Ribbit.consumerSecret === ""){ exceptions.push("createUser is not available in two legged authentication mode");}
		
		if (!Ribbit.Util.isValidString(login)){ exceptions.push("login is required"); }
		if (!Ribbit.Util.isValidString(password)){ exceptions.push("password is required"); }
		if (!Ribbit.Util.isValidStringIfDefined(firstName)){ exceptions.push("When defined, firstName must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(lastName)){ exceptions.push("When defined, lastName must be a string of one or more characters"); }
		if (!Ribbit.Util.isPositiveIntegerIfDefined(accountId)){ exceptions.push("When defined, accountId must be a positive integer"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.login = login;
	params.password = password;
	
			if (Ribbit.Util.isSet(firstName)) { params.firstName = firstName;
	 } 
	
			if (Ribbit.Util.isSet(lastName)) { params.lastName = lastName;
	 } 
	
			if (Ribbit.Util.isSet(accountId)) { params.accountId = accountId;
	 } 
	
			if (Ribbit.Util.isSet(domain)) { params.domain = domain;
	 } 
	
			
		var createUserMethodCallback = Ribbit.asynchronous ? createUserCallback : null;
			
		var uri = "users";
	
		var createUserResponse = Ribbit.signedRequest().doPost(uri, params, createUserMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return createUserCallback(createUserResponse); }
		
		
	};
	
		/**
		 * Get User details
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param userId string: Globally unique User identifier (GUID) (required)
         * @return object: an object containing details about the User, or a RibbitException
		 */
	this.getUser = function(callback, userId) {
		
		function getUserCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			userId = a.userId;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(userId)){ exceptions.push("userId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getUserMethodCallback = Ribbit.asynchronous ? getUserCallback : null;
			
		var uri = "users/" + userId;
	
		var getUserResponse = Ribbit.signedRequest().doGet(uri, getUserMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getUserCallback(getUserResponse); }
		
		
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
	this.getUsers = function(callback, startIndex, count, filterBy, filterValue) {
		
		function getUsersCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
				if (Ribbit.Util.isSet(startIndex)) {
					ret = Ribbit.Util.JSON.parse(val);
					if (ret.startIndex === undefined){
						ret.startIndex = 0;
						ret.itemsPerPage = 0;
						ret.totalResults = 0;
					}
				}
				else{
					
			if (val === 'null') {
					ret = []; 
				}
				else{
					ret = Ribbit.Util.makeOrderedArray(Ribbit.Util.JSON.parse(val).entry);
			}
				
				}
			
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			startIndex = a.startIndex;
			count = a.count;
			
			filterBy = a.filterBy;
			filterValue = a.filterValue;
			
			callback = a.callback;
		}
	
		var exceptions = [];
		
		var pagingParamError = Ribbit.Util.checkPagingParameters(startIndex, count);
		if (pagingParamError.length > 0) { exceptions.push(pagingParamError); }
		
		var filterParamError = Ribbit.Util.checkFilterParameters (filterBy, filterValue);
		if (filterParamError.length > 0) { exceptions.push(filterParamError); }
		
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getUsersMethodCallback = Ribbit.asynchronous ? getUsersCallback : null;
			
		
			var q = Ribbit.Util.createQueryString(startIndex, count, filterBy, filterValue);
			var uri = "users" + q;
	
		var getUsersResponse = Ribbit.signedRequest().doGet(uri, getUsersMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return getUsersCallback(getUsersResponse); }
		
		
	};
	
		/**
		 * Gets an array of User details, filtered by the supplied login parameter
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param login string: User login (e.g. foo@bar.com), unique within a domain (required)
         * @return array: an array, each entry of which contains an object of details about the User, or a RibbitException
		 */
	this.getUsersFilteredByLogin = function(callback, login) {
		
		function getUsersFilteredByLoginCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				 ret = val;
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			login = a.login;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(login)){ exceptions.push("login is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
			
		var getUsersFilteredByLoginMethodCallback = Ribbit.asynchronous ? getUsersFilteredByLoginCallback : null;
			
		var getUsersFilteredByLoginResponse  =  Ribbit.Users().getUsers(getUsersFilteredByLoginMethodCallback, null,null,"login",login);
	
		
		if (!Ribbit.asynchronous) { return getUsersFilteredByLoginCallback(getUsersFilteredByLoginResponse); }
		
		
	};
	
		/**
		 * Requests a password reset for a user. This method is not compatible with 2 legged authentication, where a secret key is NOT supplied
		 *
		 * @public
		 * @function
		 *  
		 * @param callback function: A method that takes a single argument, which will be invoked when the call to the Ribbit server completes
		 * @param userId string: Globally unique User identifier (GUID) (required)
         * @return object: an object containing details about the User, or a RibbitException
		 */
	this.requestPasswordReset = function(callback, userId) {
		
		function requestPasswordResetCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			userId = a.userId;
			callback = a.callback;
		}
	
		var exceptions = [];
		
		if (!Ribbit.Util.isValidString(userId)){ exceptions.push("userId is required"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	params.pwdStatus = "reset";
	
			
		var requestPasswordResetMethodCallback = Ribbit.asynchronous ? requestPasswordResetCallback : null;
			
		var uri = "users/" + userId;
	
		var requestPasswordResetResponse = Ribbit.signedRequest().doPut(uri, params, requestPasswordResetMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return requestPasswordResetCallback(requestPasswordResetResponse); }
		
		
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
         * @return object: an object containing details about the User, or a RibbitException
		 */
	this.updateUser = function(callback, login, password, firstName, lastName, pwdStatus, accountId, domain) {
		
		function updateUserCallback(val){
			var ret = null;
			if ((val.status && val.status >= 400) || (val.hasError && val.hasError === true)){
				ret = val;
			}
			else {
				
			ret = Ribbit.Util.isString(val)? Ribbit.Util.JSON.parse(val).entry : val;
				
			}
			return Ribbit.respond(callback, ret);
		}
		
		if (typeof arguments[0] === "object" && arguments[0] !== null){
			var a = arguments[0];
			
			login = a.login;
			password = a.password;
			firstName = a.firstName;
			lastName = a.lastName;
			pwdStatus = a.pwdStatus;
			accountId = a.accountId;
			domain = a.domain;
			callback = a.callback;
		}
	
		if (Ribbit.userId === null) { return Ribbit.respond(callback, new Ribbit.AuthenticatedUserRequiredException()); }
		var userId = Ribbit.userId;
		
		var exceptions = [];
		
			if (
		!Ribbit.Util.isSet(login) &&
		!Ribbit.Util.isSet(password) &&
		!Ribbit.Util.isSet(firstName) &&
		!Ribbit.Util.isSet(lastName) &&
		!Ribbit.Util.isSet(pwdStatus) &&
		!Ribbit.Util.isSet(accountId) &&
		!Ribbit.Util.isSet(domain)) {exceptions.push("At least one parameter must be supplied"); }
		
		if (!Ribbit.Util.isValidStringIfDefined(login)){ exceptions.push("When defined, login must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(password)){ exceptions.push("When defined, password must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(firstName)){ exceptions.push("When defined, firstName must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(lastName)){ exceptions.push("When defined, lastName must be a string of one or more characters"); }
		if (!Ribbit.Util.isValidStringIfDefined(pwdStatus)){ exceptions.push("When defined, pwdStatus must be a string of one or more characters"); }
		if (!Ribbit.Util.isPositiveIntegerIfDefined(accountId)){ exceptions.push("When defined, accountId must be a positive integer"); }
		if (!Ribbit.Util.isValidStringIfDefined(domain)){ exceptions.push("When defined, domain must be a string of one or more characters"); }
		if (exceptions.length > 0) { return Ribbit.checkParameterErrors(callback, exceptions); }
	
		var params = {};
	
			if (Ribbit.Util.isSet(login)) { params.login = login;
	 } 
	
			if (Ribbit.Util.isSet(password)) { params.password = password;
	 } 
	
			if (Ribbit.Util.isSet(firstName)) { params.firstName = firstName;
	 } 
	
			if (Ribbit.Util.isSet(lastName)) { params.lastName = lastName;
	 } 
	
			if (Ribbit.Util.isSet(pwdStatus)) { params.pwdStatus = pwdStatus;
	 } 
	
			if (Ribbit.Util.isSet(accountId)) { params.accountId = accountId;
	 } 
	
			if (Ribbit.Util.isSet(domain)) { params.domain = domain;
	 } 
	
			
		var updateUserMethodCallback = Ribbit.asynchronous ? updateUserCallback : null;
			
		var uri = "users/" + userId;
	
		var updateUserResponse = Ribbit.signedRequest().doPut(uri, params, updateUserMethodCallback);
	
		
		if (!Ribbit.asynchronous) { return updateUserCallback(updateUserResponse); }
		
		
	};
	
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
}
(function () {

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toRibbitJSON !== 'function') {

        Date.prototype.toRibbitJSON = function (key) {

            return this.getUTCFullYear()   + '-' +
                 f(this.getUTCMonth() + 1) + '-' +
                 f(this.getUTCDate())      + 'T' +
                 f(this.getUTCHours())     + ':' +
                 f(this.getUTCMinutes())   + ':' +
                 f(this.getUTCSeconds())   + 'Z';
        };

        String.prototype.toRibbitJSON =
        Number.prototype.toRibbitJSON =
        Boolean.prototype.toRibbitJSON = function (key) {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c :
                    '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toRibbitJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toRibbitJSON === 'function') {
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

                v = partial.length === 0 ? '[]' :
                    gap ? '[\n' + gap +
                            partial.join(',\n' + gap) + '\n' +
                                mind + ']' :
                          '[' + partial.join(',') + ']';
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

            v = partial.length === 0 ? '{}' :
                gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                        mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof Ribbit.Util.JSON.stringify !== 'function') {
    	Ribbit.Util.JSON.stringify = function (value, replacer, space) {

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
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                     typeof replacer.length !== 'number')) {
                throw new Error('Ribbit.Util.JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof Ribbit.Util.JSON.parse !== 'function') {
    	Ribbit.Util.JSON.parse = function (text, reviver) {

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
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
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

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('Ribbit.Util.JSON.parse');
        };
    }
})();
if (!Ribbit.Util.sha1 ) {
	Ribbit.Util.sha1  = {};
}
(function (){
	
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
	var b64pad  = "="; 
	// bits per input character. 8 - ASCII; 16 - Unicode 
	var chrsz   = 8;  
	
	
	/*
	 * Convert an array of big-endian words to a base-64 string
	 */
	function binb2b64(binarray){
	  var tab = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	  var str = "";
	  for(var i = 0; i < binarray.length * 4; i += 3){
	    var triplet = (((binarray[i   >> 2] >> 8 * (3 -  i   %4)) & 0xFF) << 16) | (((binarray[i+1 >> 2] >> 8 * (3 - (i+1)%4)) & 0xFF) << 8 ) | ((binarray[i+2 >> 2] >> 8 * (3 - (i+2)%4)) & 0xFF);
	    for(var j = 0; j < 4; j++){
	      if(i * 8 + j * 6 > binarray.length * 32){ str += b64pad;}
	      else {str += tab.charAt((triplet >> 6*(3-j)) & 0x3F);}
	    }
	  }
	  return str;
	}
	
	/*
	 * Perform the appropriate triplet combination function for the current
	 * iteration
	 */
	function sha1_ft(t, b, c, d){
	  if(t < 20) { return (b & c) | ((~b) & d);}
	  if(t < 40) { return b ^ c ^ d;}
	  if(t < 60) { return (b & c) | (b & d) | (c & d);}
	  return b ^ c ^ d;
	}
	/*
	 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
	 * to work around bugs in some JS interpreters.
	 */
	function safe_add(x, y){
	  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
	  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
	  return (msw << 16) | (lsw & 0xFFFF);
	}
	
	/*
	 * Bitwise rotate a 32-bit number to the left.
	 */
	function rol(num, cnt){return (num << cnt) | (num >>> (32 - cnt));}
	
	/*
	 * Convert an 8-bit or 16-bit string to an array of big-endian words
	 * In 8-bit function, characters >255 have their hi-byte silently ignored.
	 */
	function str2binb(str){
	  var bin = [];
	  var mask = (1 << chrsz) - 1;
	  for(var i = 0; i < str.length * chrsz; i += chrsz){
	    bin[i>>5] |= (str.charCodeAt(i / chrsz) & mask) << (32 - chrsz - i%32);
	  }
	  return bin;
	}
	/*
	 * Determine the appropriate additive constant for the current iteration
	 */
	function sha1_kt(t){
	  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
	         (t < 60) ? -1894007588 : -899497514;
	}
	
	function core_sha1(x, len){
	  /* append padding */
	  x[len >> 5] |= 0x80 << (24 - len % 32);
	  x[((len + 64 >> 9) << 4) + 15] = len;
	
	  var w = [];
	  var a =  1732584193;
	  var b = -271733879;
	  var c = -1732584194;
	  var d =  271733878;
	  var e = -1009589776;
	
	  for(var i = 0; i < x.length; i += 16)
	  {
	    var olda = a;
	    var oldb = b;
	    var oldc = c;
	    var oldd = d;
	    var olde = e;
	
	    for(var j = 0; j < 80; j++)
	    {
	      if(j < 16){ w[j] = x[i + j];}
	      else {w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);}
	      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
	                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
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
	function core_hmac_sha1(key, data){
	  var bkey = str2binb(key);
	  if(bkey.length > 16) {bkey = core_sha1(bkey, key.length * chrsz);}
	
	  var ipad =[], opad = [];
	  for(var i = 0; i < 16; i++){
	    ipad[i] = bkey[i] ^ 0x36363636;
	    opad[i] = bkey[i] ^ 0x5C5C5C5C;
	  }
	
	  var hash = core_sha1(ipad.concat(str2binb(data)), 512 + data.length * chrsz);
	  return core_sha1(opad.concat(hash), 512 + 160);
	}
	
	
	Ribbit.Util.sha1.b64_hmac_sha1 = function (key, data){ return binb2b64(core_hmac_sha1(key, data));};
})();Ribbit.checkStoredSession();
if (!Ribbit.isLoggedIn){
	var u = Ribbit.Util.parseUri(window.location.href);
	var q = u.query.split("&");
	for (var i =0; i< q.length; i++){
		var nvp = q[i].split("=");
		if (nvp[0] === "oauth_approval" && nvp[1] === "approved"){
			Ribbit.exchangeRequestToken();
		}
	}
}
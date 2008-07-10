describe('WebDavPlugin', {
	     before_each : function() {
		 store = new TiddlyWiki();
	     },
	     'Q test' : function() {
		 var dav = new DavSaver();
		 var QTest = false;
		 var fn1 = function(){dav.runQ();};
		 var fn2 = function(){ QTest = true;};
		 dav.Q.push(fn1);
		 dav.Q.push(fn2);
		 dav.runQ();
		 value_of(QTest).should_be(true);
	     },
	     'bad request test' : function() {
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     return 'bad request';
		 };
		 alert = function(){};
		 var z = DAV.run();
		 value_of(z).should_be('bad request');
	     },
	     'save test' : function() {
		 config.options.chkSaveBackups = true;
		 config.options.txtBackupFolder = 'backupfolder';
		 config.options.chkGenerateAnRssFeed = true;
		 config.options.chkSaveEmptyTemplate = true;
		 var dav = new DavSaver();
		 dav.isDavEnabled = dav.checkRace = dav.getOriginal = dav.makeBackupDir = dav.saveBackup = dav.saveMain = dav.saveRss = dav.saveEmpty = function(){dav.runQ();};
		 dav.save();
		 value_of(config.DavSaver.saver).should_be(null);
	     },
	     'getOriginal test' : function() {
		 convertUriToUTF8 = function(){return 'http://dav.lewcid.org/?query';};
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.getOriginal();
		 value_of(dav.original).should_be(document.body.parentNode.innerHTML);
	     },
	     'getOriginal invalid file test' : function() {
		 convertUriToUTF8 = function(){return 'http://dav.lewcid.org/#hash';};
		 var dav = new DavSaver();
		 var invalidFile = false;
		 alert = function(){invalidFile = true;};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,'some random string, file does not exist',url,null);
		 };
		 dav.getOriginal();
		 value_of(invalidFile).should_be(true);
	     },
	     'getOriginal error test' : function() {
		 var getOriginalError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 //dav.throwError = function(){getOriginalError = true;};
		 alert = function(){getOriginalError = true;};
		 dav.getOriginal();
		 value_of(getOriginalError).should_be(true);
	     },
	     'makeBackUpDir test' : function() {
		 var makeBackupDirFlag = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.runQ = function(){makeBackupDirFlag = true;};
		 dav.makeBackupDir();
		 value_of(makeBackupDirFlag).should_be(true);
	     },

	     'makeBackUpDir error test' : function() {
		 var makeBackUpError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){makeBackUpError = true;};
		 dav.makeBackupDir();
		 value_of(makeBackUpError).should_be(true);
	     },

	     'saveBackup test' : function() {
		 var saveBackupFlag = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.runQ = function(){saveBackupFlag = true;};
		 dav.saveBackup();
		 value_of(saveBackupFlag).should_be(true);
	     },

	     'saveBackup error test' : function() {
		 var saveBackupError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){saveBackupError = true;};
		 dav.saveBackup();
		 value_of(saveBackupError).should_be(true);
	     },

	     'saveEmpty test' : function() {
		 var saveEmptyFlag = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return new Date();};};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.runQ = function(){saveEmptyFlag = true;};
		 dav.getOriginal();
		 dav.saveEmpty();
		 value_of(saveEmptyFlag).should_be(true);
	     },


	     'saveEmpty altUrl test' : function() {
		 var saveEmptyFlag = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return new Date();};};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.runQ = function(){saveEmptyFlag = true;};
		 dav.getOriginal();
		 dav.originalPath = 'lewcid.html';
		 dav.saveEmpty();
		 value_of(saveEmptyFlag).should_be(true);
	     },

	     'saveEmpty error test' : function() {
		 var saveEmptyError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){saveEmptyError = true;};
		 dav.getOriginal();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.saveEmpty();
		 value_of(saveEmptyError).should_be(true);
	     },

	     'saveRss test' : function() {
		 var saveRssFlag = false;
		 var dav = new DavSaver();
		 generateRss = function(){return 'rss feed sample';};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.runQ = function(){saveRssFlag = true;};
		 dav.getOriginal();
		 dav.saveRss();
		 value_of(saveRssFlag).should_be(true);
	     },

	     'saveRss error test' : function() {
		 var saveRssError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){saveRssError = true;};
		 dav.saveRss();
		 value_of(saveRssError).should_be(true);
	     },

	     'isDavEnabled test' : function() {
		 var davEnabledFlag = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return true;};};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.runQ = function(){davEnabledFlag = true;};
		 dav.isDavEnabled();
		 value_of(davEnabledFlag).should_be(true);
	     },

	     'isDavEnabled error test' : function() {
		 var davEnabledError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){davEnabledError = true;};
		 dav.isDavEnabled();
		 value_of(davEnabledError).should_be(true);
	     },

	     'checkRace test' : function() {
		 var checkRaceFlag = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return true;};};
		 var xml = '<lp1:getlastmodified>Fri, 15 Nov 2007 16:31:01 GMT</lp1:getlastmodified>';
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,xml,url,(new req()));
		 };
		 dav.runQ = function(){checkRaceFlag = true;};
		 dav.checkRace();
		 value_of(checkRaceFlag).should_be(true);
	     },

	     'checkRace conflict overwrite test' : function() {
		 var checkRaceFlag = false;
		 var raceOverwrite = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return true;};};
		 var xml = '<lp1:getlastmodified>Fri, 15 Nov 2008 16:31:01 GMT</lp1:getlastmodified>';
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,xml,url,(new req()));
		 };
		 confirm = function(x){if(x==config.DavSaver.messages.overwriteNewerPrompt){raceOverwrite = true;return true;}return false;};
		 dav.runQ = function(){checkRaceFlag = true;};
		 dav.checkRace();
		 value_of(raceOverwrite).should_be(true);
	     },

	     'checkRace conflict no overwrite test' : function() {
		 var checkRaceFlag = false;
		 var noraceOverwrite = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return true;};};
		 var xml = '<lp1:getlastmodified>Fri, 15 Nov 2008 16:31:01 GMT</lp1:getlastmodified>';
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,xml,url,(new req()));
		 };
		 confirm = function(x){return false;};
		 dav.throwError = function(y){if(y=='raceconflict')noraceOverwrite = true;};
		 dav.checkRace();
		 value_of(noraceOverwrite).should_be(true);
	     },

	     'checkRace error test' : function() {
		 var checkRaceError = false;
		 var dav = new DavSaver();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,null);
		 };
		 dav.throwError = function(){checkRaceError = true;};
		 dav.checkRace();
		 value_of(checkRaceError).should_be(true);
	     },


	     'saveMain test' : function() {
		 var saveMainFlag = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return new Date();};};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.runQ = function(){saveMainFlag = true;};
		 dav.getOriginal();
		 dav.saveMain();
		 value_of(saveMainFlag).should_be(true);
	     },

	     'saveMain error test' : function() {
		 var saveMainError = false;
		 var dav = new DavSaver();
		 req = function(){this.getResponseHeader = function(v){return new Date();};};
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(true,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.throwError = function(){saveMainError = true;};
		 dav.getOriginal();
		 window.doHttp = function(type,url,data,contentType,username,password,callback,params,headers){
		     callback(false,params,document.body.parentNode.innerHTML,url,(new req()));
		 };
		 dav.saveMain();
		 value_of(saveMainError).should_be(true);
	     },


	     'save test not dirty' : function() {
		 var noSave = true;
		 clearMessage = function(){noSave = false;};
		 store.isDirty = function(){return false;};
		 var dav = new DavSaver();
		 dav.save(true);
		 value_of(noSave).should_be(true);
	     },

	     'saveChanges http file test' : function() {
		 var httpSaveTriggered = false;
		 String.prototype.oldToString = String.prototype.toString;
		 String.prototype.toString = function(){
		     return 'http:';
		 };
		 DavSaver.prototype.save = function(){httpSaveTriggered = true;};
		 window.saveChanges();
		 value_of(httpSaveTriggered).should_be(true);
		 String.prototype.toString = String.prototype.oldToString;
	     },

	     'saveChanges local file test' : function() {
		 var localSaveTriggered = false;
		 String.prototype.oldToString = String.prototype.toString;
		 String.prototype.toString = function(){
		     return 'file:';
		 };
		 DavSaver.prototype.save = function(){localSaveTriggered = false;};
		 config.DavSaver.orig_saveChanges = function(){localSaveTriggered = true;};
		 window.saveChanges();
		 value_of(localSaveTriggered).should_be(true);
		 String.prototype.toString = String.prototype.oldToString;
	     }
	 });

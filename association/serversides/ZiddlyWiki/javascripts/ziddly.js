<dtml-call "REQUEST.RESPONSE.setHeader('Content-Type', 'text/javascript')">

// Place to store my junk
if(typeof zw == "undefined") var zw = {};
zw.main = main;
config.options.checkUnsavedChanges = false;
config.options.confirmExit = false;
zw.ieurl = (navigator.appVersion.indexOf('MSIE') > -1) ? 'ie=1&' : '';
zw.editingTiddlers = {};
zw.dirty = false;  // flag for when ZW was unable to save something

main = function() {
  config.options.chkHttpReadOnly = (zw.loggedIn || zw.anonEdit) ? false : true;
  zw.main();
};

zw.get_url = function(with_hash) {
  var p = location.pathname;
  if(p.substring(p.length-1) == '/') p = p.substring(0,p.length-1);
  var url = location.protocol + '//' + location.host + p;
  if(with_hash) url += '%23' + permaviewHash();
  return url
};

config.messages.loginToEdit = 'You must be logged in to make changes.  Viewing source instead.';
config.messages.errorDeleting = 'An error has occurred. Review your Zope error log for details.';
config.messages.errorSaving = 'An error has occurred. Review your Zope error log for details. If you navigate away from this page now, you will lose your changes.';
config.messages.protectedTiddler = 'You are not allowed to edit here. Click OK to view the source.';
config.messages.lockedTiddler = 'This tiddler is currently being edited by %s. Please try again in a few minutes.';
config.messages.lockedTiddlerYou = 'This tiddler is currently locked by you. Would you like to edit anyway?';
config.messages.viewRevisionTooltip = 'View this revision.';
config.messages.exportLinkLabel = 'export to file';
config.messages.exportLinkPrompt = 'Export to a TiddlyWiki file';
config.messages.importLinkLabel = 'import from file';
config.messages.importLinkPrompt = 'Import from a TiddlyWiki file';
config.messages.unsavedChangesWarning = 'Something has gone wrong and ZiddlyWiki was unable to save all changes to the server.\nIf you navigate away from this page, those changes will be lost.\nPress OK to save a backup to a local file.';

config.views.wikified.toolbarRevisions = {text: "revisions", tooltip: "View another revision of this tiddler", popupNone: "No revisions"};

config.shadowTiddlers.SiteTitle = "My ZiddlyWiki";
config.shadowTiddlers.SiteSubtitle = "a reusable non-linear personal/public/collaborative web notebook";
config.shadowTiddlers.GettingStarted = 
	 "To get started with this blank ZiddlyWiki, you'll need to modify the following tiddlers:\n"
	+"* SiteTitle & SiteSubtitle: The title and subtitle of the site, as shown above\n"
	+"* MainMenu: The menu (usually on the left)\n"
	+"* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the ZiddlyWiki is opened\n";
config.shadowTiddlers.PageTemplate = 
	 "<!--{{{-->\n"
	+"<div class='header' macro='gradient vert #18f #04b'>\n"
	+"<div class='headerShadow'>\n"
	+"<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n"
	+"<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n"
	+"</div>\n"
	+"<div class='headerForeground'>\n"
	+"<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n"
	+"<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n"
	+"</div>\n"
	+"</div>\n"
	+"<div id='mainMenu' refresh='content' tiddler='MainMenu'></div>\n"
	+"<div id='sidebar'>\n"
	+"<div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'></div>\n"
	+"<div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'></div>\n"
	+"<div id='ZiddlyFormats' refresh='content' tiddler='ZiddlyFormats'></div>\n"
	+"<div id='ZiddlyPowered' refresh='content' tiddler='ZiddlyPowered'></div>\n"
	+"</div>\n"
	+"<div id='displayArea'>\n"
	+"<div id='messageArea'></div>\n"
	+"<div id='tiddlerDisplay'></div>\n"
	+"</div>\n";
	+"<!--}}}-->";
config.shadowTiddlers.ViewTemplate = 
	 "<!--{{{-->\n"
	+"<div class='toolbar' macro='toolbar -closeTiddler closeOthers +editTiddler permalink references revisions jump'></div>\n"
	+"<div class='title' macro='view title'></div>\n"
	+"<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date [[DD MMM YYYY]]'></span> (created <span macro='view created date [[DD MMM YYYY]]'></span>)</div>\n"
	+"<div class='tagging' macro='tagging'></div>\n"
	+"<div class='tagged' macro='tags'></div>\n"
	+"<div class='viewer' macro='view text wikified'></div>\n"
	+"<div class='tagClear'></div>\n"
	+"<!--}}}-->";
config.shadowTiddlers.SideBarOptions = "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal 'DD MMM YYYY'>><<slider chkSliderOptionsPanel OptionsPanel 'options »' 'Open options panel'>><<exportLink>><<importLink>><<login>>";
config.shadowTiddlers.OptionsPanel = 
	 "<<option chkRegExpSearch>> ~RegExp Search\n"
	+"<<option chkCaseSensitiveSearch>> Case sensitive search\n"
	+"<<option chkAnimate>> Enable animations\n"
	+"<<option chkOpenInNewWindow>> Open links in new window\n"
	+"<<option chkToggleLinks>> Links close open tiddlers\n"
	+"<<option chkConfirmDelete>> Confirm before deleting\n"
	+"<<option chkForceMinorUpdate>> Preserve date/time on edit\n"
	+"<<option chkInsertTabs>> Insert tab characters\n"
	+"<<option txtMaxEditRows>> Maximum editor rows\n";
if(version.major == 2 && version.minor == 1)
    config.shadowTiddlers.OptionsPanel += '----\nPluginManager\n';
config.shadowTiddlers.ZiddlyFormats = "Formats: [[XML|?format=xml]] | [[YAML|?format=yaml]]";
config.shadowTiddlers.ZiddlyPowered = "Powered by [[ZiddlyWiki|http://ziddlywiki.com]]";
config.shadowTiddlers.StyleSheetColors += 
    '\n/*{{{*/#ZiddlyFormats,#ZiddlyPowered,#ZiddlyFormats a,#ZiddlyPowered a{color:#fff}/*}}}*/';
config.shadowTiddlers.StyleSheetLayout += 
         '\n/*{{{*/'
	+'#sidebarOptions .sliderPanel .txtOptionInput {\n'
	+'	width: 2em;\n'
	+'	font-family: mono;\n'
        +'      font-size: 1em;\n'
	+'}\n'
	+'#ZiddlyFormats, #ZiddlyPowered { margin:5px }\n'
        +'/*}}}*/';

config.protectedTiddlers = ['DefaultTiddlers', 'MainMenu', 'SiteTitle', 
	'SiteSubtitle', 'StyleSheet'];

config.replaceBodyCharacters = [
  [/‘/g, "'"],
  [/’/g, "'"],
  [/“/g, '"'],
  [/”/g, '"'],
  [/…/g, '...'],
  [/–/g, ' -- ']
];

config.macros.login = {
  label: 'login',
  prompt: 'Log into the system',
  sizeTextbox: 15,
  handler: function(place) {
    if(zw.loggedIn) {
      var link = createTiddlyLink(place, zw.username, true);
      link.innerHTML = zw.username + ' (logged in)';
    } else {
      // FIXME Only make login form if cookie-based login are enabled.
      var form = document.createElement("form");
      form.action = "?action=login";
      var u = createTiddlyElement(form, "input", "zw_username");
      u.value = "YourName";
      u.onclick = this.clearInput;
      u.size = this.sizeTextbox;
      u.onkeypress = this.enterSubmit;
      u.name = "__ac_name";
      var p = createTiddlyElement(form, "input", "zw_password");
      p.value = "password";
      p.size = this.sizeTextbox;
      p.onclick = this.clearInput;
      p.onkeypress = this.enterSubmit;
      p.name = "__ac_password";
      place.appendChild(form);
      createTiddlyButton(place,this.label,this.prompt,this.doLogin);
    }
  },
  clearInput: function(e) {
      var u = document.getElementById("zw_username");
      var p = document.getElementById("zw_password");
      if((e.target == u || e.target == p) && p.type != "password") { 
	  u.value = ''; 
	  p.value=''; 
	  p.type = "password";
      }
  },
  enterSubmit: function(e) {
      if(e.keyCode == 13 || e.keyCode == 10) config.macros.login.doLogin(e);
  },
  doLogin: function(e) {
      displayMessage('Logging in...');
      var u = document.getElementById("zw_username");
      var p = document.getElementById("zw_password");
      ajax.post(zw.get_url().replace("http://","http://"+u.value+":"+p.value+"@")
          ,config.macros.login.doneLogin,
          "action=login&__ac_name="+u.value+"&__ac_password="+p.value);
  },
  doneLogin: function(str,status,statusText) {
      if(status == 200) window.eval(str);   // We may get either a 401 Unauthorized
      readOnly = !zw.loggedIn;              // or status.js which indicates we are 
      if(!zw.loggedIn) {                    // still not logged in.
	  alert("Authentication failed.  Did you type your username and password correctly?");
          clearMessage();
          return false;
      }
      refreshDisplay("SideBarOptions");
      story.refresh(); // FIXME change to story.refreshAllTiddlers() once synced with trunk.
      clearMessage();
      // Check for new tiddlers
      var numtofetch = 0;
      for(var t in zw.tiddlerList) if(!store.fetchTiddler(t)) numtofetch++;
      var fetched = 0;
      var updateTimeline = "";
      for(var t in zw.tiddlerList) {
          if(!store.fetchTiddler(t)) {
              if(++fetched == numtofetch) 
                  updateTimeline = "updatetimeline=1&";
              ajax.get('?action=get&id=' + encodeURIComponent(t)
              + "&" + updateTimeline + zw.no_cache(), 
              config.macros.login.addTiddler)
          }
      }
      return true;
  },
  addTiddler: function(str) {
      if(str.indexOf('\n') > -1) {
        var parts = str.split('\n');
        var tiddler = new Tiddler();
        var title = parts[0];
        var oldtitle = parts[1];
        var oldtiddler = store.fetchTiddler(title);
        tiddler.set(title, Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
            Date.convertFromYYYYMMDDHHMM(parts[4]), parts[6], 
            Date.convertFromYYYYMMDDHHMM(parts[5]));
        tiddler.setValue('revisionkey', parts[8]);
        store.addTiddler(tiddler);
        story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
        if(parts[7] == 'update timeline') {
            refreshPageTemplate();  // Just redraw everything.
            store.notify('TabTimeline', true)
        }
      } else if(str != '-') {
        alert(str); // error message
        zw.dirty = true;
      }
  }
};

config.macros.logout = {
  label: 'logout',
  prompt: 'Log out of the system',
  handler: function(place) { 
      if(zw.loggedIn) 
          createTiddlyButton(place,this.label,this.prompt, function(){
              setTimeout("location.replace('?action=logout&' + zw.ieurl + 'redirect_to=' + zw.get_url(true))", 10)
          }) 
  }
};

config.macros.ziddlyversion = {
  handler: function(place) {
    createTiddlyElement(place,"span",null,null,version.major + "." 
        + version.minor + "." + version.revision 
        + (version.beta ? "(b" + version.beta + ")" : "") + "." 
        + version.extensions.ZiddlyWiki);
  }
};

config.macros.exportLink = {
  label: config.messages.exportLinkLabel,
  prompt: config.messages.exportLinkPrompt,
  handler: function(place) { 
      createTiddlyButton(place,this.label,this.prompt,function(){
          location.href='?action=export';return false;
      }) 
  }
};

config.macros.importLink = {
  label: config.messages.importLinkLabel,
  prompt: config.messages.importLinkPrompt,
  handler: function(place) {
    if(zw.loggedIn || zw.anonEdit) {
      createTiddlyButton(place,this.label,this.prompt,function(){
          displayTiddler(null, "ImportTiddlers");
      });
    }
  }
};

TiddlyWiki.prototype.zw_removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title) {
  displayMessage("Deleting '"+title+"' on server...");
  var callback = function(r){
    clearMessage();
    if(r!='success') {
        alert(config.messages.errorDeleting);
        zw.dirty = true;
    }
  };
  ajax.post(zw.get_url(), callback, 'action=delete&id=' + encodeURIComponent(title) + '&' + zw.no_cache());
  return this.zw_removeTiddler(title);
};

TiddlyWiki.prototype.zw_saveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags) {
  displayMessage("Saving '"+title+"'...");
  newBody = replaceBodyCharacters(newBody);
  var callback = function(r){
    var parts = r.split('\n');
    var tiddler = store.fetchTiddler(parts[1]);
    store.setValue(tiddler,'revisionkey', parts[8]);
    if(!tiddler) {
        alert("ZiddlyWiki error: The tiddler '"+parts[1]+"' that I just tried to save\n"
        +"doesn't exist after the save!");
        zw.dirty = true;
    } else if(parts[2] != tiddler.escapeLineBreaks().htmlEncode()) {
        alert("ZiddlyWiki error: Saved tiddler '"+parts[1]+"' is not the same as what was just saved."
            +"\n-------------------before---------------------\n"+parts[2]
            +"\n-------------------after----------------------\n"+tiddler.escapeLineBreaks().htmlEncode()
        );
        zw.dirty = true;
    }
  };
// FIXME by using async ajax here, a reload timeout may come between the save
// and the callback's return, which causes the tiddler to be double-rendered.
  var tiddler = this.zw_saveTiddler(title,newTitle,newBody,modifier,modified,tags);
  ajax.post(zw.get_url(), callback, 'action=save&id=' + encodeURIComponent(title) + '&title=' 
        + encodeURIComponent(newTitle) + '&body=' + encodeURIComponent(newBody) + '&tags=' 
        + encodeURIComponent(tags) + '&modified=' 
        + encodeURIComponent((modified||store.fetchTiddler(title).modified).convertToYYYYMMDDHHMM()) 
        + '&' + zw.no_cache());
  clearMessage();
  return tiddler;
};

function replaceBodyCharacters(body) {
  var chars = config.replaceBodyCharacters;
  for(var i=0; i<chars.length; i++) {
    body = body.replace(chars[i][0], chars[i][1]);
  }
  return body;
};

zw.no_cache = function() {return new String((new Date()).getTime())};

config.commands.revisions = {
  text: config.views.wikified.toolbarRevisions.text,
  tooltip: config.views.wikified.toolbarRevisions.tooltip,
  popupNone: config.views.wikified.toolbarRevisions.popupNone,
  hideShadow: true,
  handler: function(event,src,title) {
    var popup = Popup.create(src);
    Popup.show(popup,false);
    var callback = function(r) {
      if(popup) {
        if(r == '-') {
          createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),
            config.views.wikified.toolbarRevisions.popupNone);
        } else {
          var revs = r.split('\n');
          for(var i=0; i<revs.length; i++) {
            var parts = revs[i].split(' ');
            if(parts.length>1) {
              var modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
              var key = parts[1];
              var modifier = parts[2];
              var button = createTiddlyButton(createTiddlyElement(popup,"li"), modified.toLocaleString() +" "+ modifier, 
                    config.messages.viewRevisionTooltip, 
                    function(){
                        displayTiddlerRevision(this.getAttribute('tiddlerTitle'), 
                        this.getAttribute('revisionkey'), this); 
                        return false;
                    }, 'tiddlyLinkExisting tiddlyLink');
              button.setAttribute('tiddlerTitle', title);
              button.setAttribute('revisionkey', key);
              var t = store.fetchTiddler(title);
              if(!t) alert("Attempt to find revisions for non-existant tiddler '"+title+"'!");
              if(t && (store.getValue(t, 'revisionkey') == key))
                button.className = 'revisionCurrent';
            }
          }
        }
      }
    };
    ajax.get('?action=get_revisions&id=' + encodeURIComponent(title) + '&' + zw.no_cache(), callback);
    event.cancelBubble = true;
    if (event.stopPropagation) event.stopPropagation();
    return true;
  }
}

function displayTiddlerRevision(title, revision, src, updateTimeline) {
  var tiddler = store.fetchTiddler(title);
// We already have the latest version
  if(tiddler && store.getValue(tiddler, 'revisionkey') == revision) return;
  displayMessage("Loading revision information for '"+title+"'...");
  revision = revision ? '&revision=' + revision : '';
  updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
  ajax.get('?action=get&id=' + encodeURIComponent(title) + revision 
      + updateTimeline + '&' + zw.no_cache(), displayTiddlerRevisionCallback)
};

function displayTiddlerRevisionCallback(encoded) {
  if(encoded.indexOf('\n') > -1) {
    var parts = encoded.split('\n');
    var tiddler = new Tiddler();
    var title = parts[0];
    var oldtitle = parts[1];
    var oldtiddler = store.fetchTiddler(title);
    if(oldtiddler.modified != parts[4]) {
        var tmpstr = " (Historical revision " + parts[8];
        if(title != oldtitle) {
            tmpstr += " renamed from " + oldtitle;
        }
        tmpstr += ")";
        store.setValue(tiddler, "revisioninfo", tmpstr);
    }
    tiddler.set(title, Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
        Date.convertFromYYYYMMDDHHMM(parts[4]), parts[6], 
        Date.convertFromYYYYMMDDHHMM(parts[5]));
    store.setValue(tiddler, 'revisionkey', parts[8]);
    store.addTiddler(tiddler);
    if(tiddler.tags.contains('deleted')) store.deleteTiddler(title);
    story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
    if(parts[7] == 'update timeline')
      store.notify('TabTimeline', true)
  } else if(encoded != '-') {
    alert(encoded); // error message
  }
  clearMessage();
};

function permaviewHash() {
  var tiddlerDisplay = document.getElementById("tiddlerDisplay");
  var links = [];
  for(var t=0; t<tiddlerDisplay.childNodes.length; t++) {
    var tiddlerName = tiddlerDisplay.childNodes[t].id.substr(7);
    links.push(String.encodeTiddlyLink(tiddlerName));
  }
  return encodeURIComponent(links.join(" "));
}

zw.ask_to_login = function() {
  if(confirm(config.messages.loginToEdit)) {
    setTimeout("location.replace('?action=login&' + zw.ieurl + 'redirect_to=' + zw.get_url(true));", 10);
    return true;
  } else {
    return false;
  }
};

Tiddler.prototype.isReadOnly = function() {
  if(zw.isAdmin) return false;
  if(zw.loggedIn && this.modifier == zw.username) return false;
  return isProtectedTiddler(this.title) || !(zw.anonEdit || zw.loggedIn);
};

// Add the protected tag to tiddlers in config.protectedTiddlers
Tiddler.prototype.zw_set = Tiddler.prototype.set;
Tiddler.prototype.set = function(title,text,modifier,modified,tags,created) {
    if(!tags) tags = [];
    if(typeof tags == "string") tags = tags.readBracketedList();
    if(!store.tiddlerExists(title) && store.isShadowTiddler(title)) {
        for(var i=0;i<config.protectedTiddlers.length;i++) {
            if(config.protectedTiddlers[i] == title) {
                tags.push('protected');
                break;
            }
        }
    }
    return this.zw_set(title, text, modifier, modified, tags, created);
}

config.commands.editTiddler.zw_handler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function(event,src,title) {
  if(readOnly) {
    this.zw_handler(event,src,title);
  } else {
    displayMessage("Loading '"+title+"'...");
    var obj = this;
    var callback = function(r) {
      clearMessage();
      if(r == '-') { // doesn't exist (might be a shadow tiddler)
        zw.editingTiddlers[title] = true;
        obj.zw_handler(event,src,title);
      } else if(r.match(/^locked/)) {
        r = r.replace(/^locked\n/, '');
        var parts = r.split('\n');
        var tiddler = store.fetchTiddler(title);
        // We're editing a deleted tiddler, or one that was added by someone else
        // since we loaded our TiddlyWiki store.
        if(!tiddler) { 
          tiddler = new Tiddler();
        }
        if(store.getValue(tiddler, 'revisionkey') != parts[8]) {
          var tags = parts[6].readBracketedList();
          if(tags.indexOf('deleted') != -1) { // Remove the deleted tag on edit
              alert("This tiddler was deleted on the server.  Editing the old deleted version.");
              tags.splice(tags.indexOf('deleted'),1);
              tiddler.deletedOnServer = true;
          }
          tiddler.set(parts[1], Tiddler.unescapeLineBreaks(parts[2].htmlDecode()), parts[3], 
                      Date.convertFromYYYYMMDDHHMM(parts[4]), tags, 
                      Date.convertFromYYYYMMDDHHMM(parts[5]));
          store.setValue('revisionkey', parts[8]);
        }
        if(!store.fetchTiddler(title))
          store.addTiddler(tiddler);
        zw.editingTiddlers[title] = true;
        obj.zw_handler(event,src,title);
      } else if(r.match(/^already locked by/)) {
        var lock_user = r.replace('already locked by ', '');
        if(lock_user == zw.username) {
          if(confirm(config.messages.lockedTiddlerYou)) {
            zw.editingTiddlers[title] = true;
            obj.zw_handler(event,src,title);
          }
        } else {
          alert(config.messages.lockedTiddler.replace(/%s/g, lock_user));
        }
      } else {
        // Lock failed, we must not be logged in, or something changed underneath us.
	zw.loggedIn = false;
	zw.isAdmin = false;
	readOnly = true;
	refreshDisplay("SideBarOptions");
	story.refresh();
	alert(config.messages.loginToEdit);
	config.commands.editTiddler.zw_handler(event,src,title);
      }
    };
    ajax.post(zw.get_url(), callback, 'action=lock&id=' + title + '&' + zw.no_cache());
  }
  return false;
};

config.commands.saveTiddler.zw_handler = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title) {
  if(zw.isAdmin 
      || (zw.loggedIn || zw.anonEdit) && !isProtectedTiddler(title)
      || (isProtectedTiddler(title) && zw.loggedIn && this.modifier == zw.username)) {
    zw.editingTiddlers[title] = false;
    return this.zw_handler(event,src,title);
  } else {
    config.commands.cancelTiddler.zw_handler(null,null,title);
  }
  return false;
};

config.commands.deleteTiddler.zw_handler = config.commands.deleteTiddler.handler;
config.commands.deleteTiddler.handler = function(event,src,title) {
  if(zw.isAdmin 
      || (zw.loggedIn || zw.anonEdit) && !isProtectedTiddler(title)
      || (isProtectedTiddler(title) && zw.loggedIn && this.modifier == zw.username)) {
    zw.editingTiddlers[title] = false;
    return this.zw_handler(event,src,title);
  } else {
    config.commands.cancelTiddler.zw_handler(null,null,title);
  }
  return false;
};

config.commands.cancelTiddler.zw_handler = config.commands.cancelTiddler.handler;
config.commands.cancelTiddler.handler = function(event,src,title) {
  if(!config.options.chkHttpReadOnly) {
      if(zw.editingTiddlers[title])
          ajax.post(zw.get_url(), function(r){}, 'action=unlock&id=' + title + '&' + zw.no_cache());
      zw.editingTiddlers[title] = false;
      var tiddler = store.fetchTiddler(title);
      if(tiddler && tiddler.deletedOnServer)
          store.removeTiddler(title);
  }
  return this.zw_handler(event,src,title);
};

function isProtectedTiddler(title) {
  var tiddler = store.fetchTiddler(title);
  if(!tiddler) {  // Must be a shadow
    for(var i=0;i<config.protectedTiddlers.length;i++) {
      if(config.protectedTiddlers[i] == title) return true;
    }
  }
  if(tiddler && tiddler.tags) {
    for(var i=0;i<tiddler.tags.length;i++) {
      if(tiddler.tags[i] == 'protected') return true;
    }
  }
  return false;
};

zw.refresh_count = 0;
zw.refresh_tiddlers = function() {
  zw.refresh_count++;
  if(zw.refresh_count > 30) { // thirty minutes
    clearInterval(zw.refresh_interval_id);
  } else {
    ajax.get(zw.get_url() + '?action=refresh&latest=' + zw.latestTiddler, zw.refresh_tiddlers_callback);
  }
};

// If there are unsaved changes, force the user to confirm before exitting
function confirmExit()
{
        hadConfirmExit = true;
        if(zw.dirty) return config.messages.confirmExit;
}

// Give the user a chance to save changes before exitting
function checkUnsavedChanges()
{
        if(zw.dirty && window.hadConfirmExit === false)
                {
                if(confirm(config.messages.unsavedChangesWarning))
                        saveChanges();
                }
}

// Receives a list of updated tiddler [timestamp, [title, modified, revisionKey], ...]
// If TW supports higher resolution modification stamps (currently: 1 minute) we can use
// that as an identifier instead of revisionKey
zw.refresh_tiddlers_callback = function(tiddlers) {
  if(tiddlers == '') return;
  tiddlers = tiddlers.split('\n\n');
  zw.latestTiddler = parseInt(tiddlers[0]);
  for(var i=1; i<tiddlers.length; i++) {
    var l = tiddlers[i].split('\n'); // [title, modified, revisionKey]
    if(!zw.editingTiddlers[l[0]])  // FIXME if it's being edited and we just found out someone else modified it, we should issue a warning.
      displayTiddlerRevision(l[0], l[2], null, true);
  }
};

zw.refresh_interval_id = setInterval('zw.refresh_tiddlers()', 60000); // refresh every minute


<dtml-call "REQUEST.RESPONSE.setHeader('Content-Type', 'text/javascript')">

zw_main = main;
main = function() {
  config.options.chkHttpReadOnly = (zw.loggedIn || zw.anonEdit) ? false : true;
  zw_main();
};

zw.get_url = function(with_hash) {
  var p = location.pathname;
  if(p.substring(p.length-1) != '/') p += '/';
  var url = location.protocol + '//' + location.host + p;
  if(with_hash) url += '%23' + permaviewHash();
  return url
};

checkUnsavedChanges = false;
confirmExit = false;

config.messages.loginToEdit = 'You must be logged in to make changes. Click OK to log in now. Click Cancel to view the source.';
config.messages.errorDeleting = 'An error has occurred. Review your Zope error log for details.';
config.messages.errorSaving = 'An error has occurred. Review your Zope error log for details. If you navigate away from this page now, you will lose your changes.';
config.messages.noChangesMade = 'No changes were made, so nothing was saved.';
config.messages.protectedTiddler = 'You are not allowed to edit here. Click OK to view the source.';
config.messages.lockedTiddler = 'This tiddler is currently being edited by %s. Please try again in a few minutes.';
config.messages.lockedTiddlerYou = 'This tiddler is currently locked by you. Would you like to edit anyway?';
config.messages.viewRevisionTooltip = 'View this revision.';
config.messages.exportLinkLabel = 'save to file';
config.messages.exportLinkPrompt = 'Export to a TiddlyWiki file';
config.messages.importLinkLabel = 'update from file';
config.messages.importLinkPrompt = 'Import a TiddlyWiki file';

config.views.wikified.toolbarRevisions = {text: "revisions", tooltip: "View another revision of this tiddler", popupNone: "No revisions"};

config.shadowTiddlers.SiteTitle = "My ZiddlyWiki";
config.shadowTiddlers.SiteSubtitle = "a reusable non-linear personal/public/collaborative web notebook";
config.shadowTiddlers.GettingStarted = "To get started with this blank ZiddlyWiki, you'll need to modify the following tiddlers:\n* SiteTitle & SiteSubtitle: The title and subtitle of the site, as shown above\n* MainMenu: The menu (usually on the left)\n* DefaultTiddlers: Contains the names of the tiddlers that you want to appear when the ZiddlyWiki is opened\n";
config.shadowTiddlers.PageTemplate = "<div class='header' macro='gradient vert #18f #04b'>\n<div class='headerShadow'>\n<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n</div>\n<div class='headerForeground'>\n<span class='siteTitle' refresh='content' tiddler='SiteTitle'></span>&nbsp;\n<span class='siteSubtitle' refresh='content' tiddler='SiteSubtitle'></span>\n</div>\n</div>\n<div id='mainMenu' refresh='content' tiddler='MainMenu'></div>\n<div id='sidebar'>\n<div id='sidebarOptions' refresh='content' tiddler='SideBarOptions'></div>\n<div id='sidebarTabs' refresh='content' force='true' tiddler='SideBarTabs'></div>\n<div id='ZiddlyFormats' refresh='content' tiddler='ZiddlyFormats'></div>\n<div id='ZiddlyPowered' refresh='content' tiddler='ZiddlyPowered'></div>\n</div>\n<div id='displayArea'>\n<div id='messageArea'></div>\n<div id='tiddlerDisplay'></div>\n</div>";
config.shadowTiddlers.ViewTemplate = "<div class='toolbar' macro='toolbar -closeTiddler closeOthers +editTiddler permalink references revisions jump'></div>\n<div class='title' macro='view title'></div>\n<div class='subtitle'><span macro='view modifier link'></span>, <span macro='view modified date [[DD MMM YYYY]]'></span> (created <span macro='view created date [[DD MMM YYYY]]'></span>)</div>\n<div class='tagging' macro='tagging'></div>\n<div class='tagged' macro='tags'></div>\n<div class='viewer' macro='view text wikified'></div>\n<div class='tagClear'></div>";
config.shadowTiddlers.SideBarOptions = "<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal 'DD MMM YYYY'>><<slider chkSliderOptionsPanel OptionsPanel 'options' 'Change advanced options'>><<exportLink>><<importLink>><<login>>";
config.shadowTiddlers.OptionsPanel = "These InterfaceOptions are saved in your browser\n\n<<option chkRegExpSearch>> RegExpSearch\n<<option chkCaseSensitiveSearch>> CaseSensitiveSearch\n<<option chkAnimate>> EnableAnimations\n\nSee AdvancedOptions";
config.shadowTiddlers.AdvancedOptions = "<<option chkOpenInNewWindow>> OpenLinksInNewWindow\n<<option chkToggleLinks>> Clicking on links to tiddlers that are already open causes them to close\n^^(override with Control or other modifier key)^^\n<<option chkForceMinorUpdate>> Treat edits as MinorChanges by preserving date and time\n^^(override with Shift key when clicking 'done' or by pressing Ctrl-Shift-Enter^^\n<<option chkConfirmDelete>> ConfirmBeforeDeleting";
config.shadowTiddlers.ZiddlyFormats = "Formats: [[XML|?format=xml]] | [[YAML|?format=yaml]]";
config.shadowTiddlers.ZiddlyPowered = "Powered by [[ZiddlyWiki|http://ziddlywiki.com]]";
config.shadowTiddlers.StyleSheetColors += '#ZiddlyFormats,#ZiddlyPowered,#ZiddlyFormats a,#ZiddlyPowered a{color:#fff}';
config.shadowTiddlers.StyleSheetLayout += '#ZiddlyFormats,#ZiddlyPowered{margin:5px}';
config.shadowTiddlers.ImportTiddlyWiki = 'Select a TiddlyWiki file to import...\n\n<html><form action="' + zw.get_url() + '" enctype="multipart/form-data" method="post" onsubmit="return confirm(\'Are you sure you want to import this file?\')"><input type="hidden" name="action" value="import"/><input type="hidden" name="redirect_to" value="' + zw.get_url() + '"/><input type="file" name="file"/><br/><input type="checkbox" id="keep_newest" name="keep_newest" value="yes" checked="checked"/><label for="keep_newest">Only import newer content</label><br/><input type="checkbox" id="delete_missing" name="delete_missing" value="yes"/><label for="delete_missing">Delete missing content</label><br/><input type="submit" value="Import"/></form></html>';

config.protectedTiddlers = ['DefaultTiddlers', 'MainMenu', 'SiteTitle', 'SiteSubtitle', 'StyleSheet'];

config.replaceBodyCharacters = [
  [/‘/g, "'"],
  [/’/g, "'"],
  [/“/g, '"'],
  [/”/g, '"'],
  [/…/g, '...'],
  [/–/g, ' -- ']
];

config.options.txtUserName = zw.username;

config.macros.login = {
  label: 'login',
  prompt: 'Log into the system',
  handler: function(place) {
    if(zw.loggedIn) {
      var link = createTiddlyLink(place, zw.username, true);
      link.innerHTML = zw.username + ' (logged in)';
    } else {
      createTiddlyButton(place,this.label,this.prompt,function(){setTimeout("location.replace('?action=login&' + ieurl + 'redirect_to=' + zw.get_url(true))", 10)});
    }
  }
};

config.macros.logout = {
  label: 'logout',
  prompt: 'Log out of the system',
  handler: function(place) { if(zw.loggedIn) createTiddlyButton(place,this.label,this.prompt,function(){setTimeout("location.replace('?action=logout&' + ieurl + 'redirect_to=' + zw.get_url(true))", 10)}) }
};

ie = navigator.appVersion.indexOf('MSIE') > -1;
ieurl = ie ? 'ie=1&' : '';

config.macros.ziddlyversion = {
  handler: function(place) {
    createTiddlyElement(place,"span",null,null,version.major + "." + version.minor + "." + version.revision + (version.beta ? "(b" + version.beta + ")" : "") + "." + version.extensions.ZiddlyWiki);
  }
};

config.macros.exportLink = {
  label: config.messages.exportLinkLabel,
  prompt: config.messages.exportLinkPrompt,
  handler: function(place) { createTiddlyButton(place,this.label,this.prompt,function(){location.href='?action=export';return false;}) }
};

config.macros.importLink = {
  label: config.messages.importLinkLabel,
  prompt: config.messages.importLinkPrompt,
  handler: function(place) {
    if(zw.loggedIn) {
      var link = createTiddlyLink(place,'ImportTiddlyWiki',false);
      link.innerHTML = this.label;
      link.className = 'button';
      link.title = this.prompt;
    }
  }
};

zw.status = function(message) {
  if(!zw.status_elm) { // create the "status" element
    zw.status_elm = document.createElement('div');
    zw.status_elm.id = 'statusMessage';
    zw.status_elm.style.display = 'none';
    document.body.appendChild(zw.status_elm);
  }
  if(message) {
    zw.status_elm.innerHTML = message;
    zw.status_elm.style.display = 'block';
  } else {
    setTimeout("zw.status_elm.style.display = 'none'", 100);
  }
};

TiddlyWiki.prototype.zw_removeTiddler = TiddlyWiki.prototype.removeTiddler;
TiddlyWiki.prototype.removeTiddler = function(title) {
  zw.status('deleting...');
  var callback = function(r){
    zw.status(false);
    if(r!='success') alert(config.messages.errorDeleting);
  };
  ajax.post(zw.get_url(), callback, 'action=delete&id=' + encodeURIComponent(title) + '&' + zw.no_cache());
  return this.zw_removeTiddler(title);
};

TiddlyWiki.prototype.zw_saveTiddler = TiddlyWiki.prototype.saveTiddler;
TiddlyWiki.prototype.saveTiddler = function(title,newTitle,newBody,modifier,modified,tags) {
  newBody = replaceBodyCharacters(newBody);
  zw.status('saving...');
  var callback = function(r){
    zw.status(false);
    if(r == 'no changes') displayMessage(config.messages.noChangesMade);
    else if(r != 'success') alert(config.messages.errorSaving);
  };
  ajax.post(zw.get_url(), callback, 'action=save&id=' + encodeURIComponent(title) + '&title=' + encodeURIComponent(newTitle) + '&body=' + encodeURIComponent(newBody) + '&tags=' + encodeURIComponent(tags) + '&modified=' + encodeURIComponent((modified||store.fetchTiddler(title).modified).convertToYYYYMMDDHHMM()) + '&' + zw.no_cache());
  return this.zw_saveTiddler(title,newTitle,newBody,modifier,modified,tags);
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
  handler: function(event,src,title) {
    var popup = Popup.create(src);
    Popup.show(popup,false);
    var callback = function(r) {
      if(popup) {
        if(r == '-') {
          createTiddlyText(createTiddlyElement(popup,"li",null,"disabled"),config.views.wikified.toolbarRevisions.popupNone);
        } else {
          var revs = r.split('\n');
          for(var i=0; i<revs.length; i++) {
            var parts = revs[i].split(' ');
            if(parts.length>1) {
              var modified = Date.convertFromYYYYMMDDHHMM(parts[0]);
              var key = parts[1];
              var button = createTiddlyButton(createTiddlyElement(popup,"li"), modified.toLocaleString(), config.messages.viewRevisionTooltip, function(){displayTiddlerRevision(this.getAttribute('tiddlerTitle'), this.getAttribute('revisionKey'), this); return false;}, 'tiddlyLinkExisting tiddlyLink');
              button.setAttribute('tiddlerTitle', title);
              button.setAttribute('revisionKey', key);
              var t = store.fetchTiddler(title);
              if(t.revisionKey == key || (!t.revisionKey && i==0))
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

currentTiddlerRevisions = [];
function displayTiddlerRevision(title, revision, src, updateTimeline) {
  zw.status('loading...');
  currentTiddlerRevisions[title] = revision;
  revision = revision ? '&revision=' + revision : '';
  updateTimeline = updateTimeline ? '&updatetimeline=1' : '';
  ajax.get('?action=get&id=' + encodeURIComponent(title) + revision + updateTimeline + '&' + zw.no_cache(), displayTiddlerRevisionCallback)
};

function displayTiddlerRevisionCallback(encoded) {
  if(encoded.indexOf('\n') > -1) {
    var parts = encoded.split('\n');
    var tiddler = new Tiddler();
    var title = parts[0];
    tiddler.set(title, Tiddler.unescapeLineBreaks(parts[1].replace(/&quot;/g,'"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g,'&')), parts[2], Date.convertFromYYYYMMDDHHMM(parts[3]), parts[5], Date.convertFromYYYYMMDDHHMM(parts[4]));
    tiddler.revisionKey = currentTiddlerRevisions[title];
    store.addTiddler(tiddler);
    story.refreshTiddler(title, DEFAULT_VIEW_TEMPLATE, true);
    if(parts[6] == 'update timeline')
      store.notify('TabTimeline', true)
  } else if(encoded != '-') {
    alert(encoded); // error message
  }
  zw.status(false);
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
    setTimeout("location.replace('?action=login&' + ieurl + 'redirect_to=' + zw.get_url(true));", 10);
    return true;
  } else {
    return false;
  }
};

Tiddler.prototype.isReadOnly = function() {
  return isProtectedTiddler(this.title) || (!zw.anonEdit && !zw.loggedIn);
};

editingTiddlers = {};
config.commands.editTiddler.zw_handler = config.commands.editTiddler.handler;
config.commands.editTiddler.handler = function(event,src,title) {
  if(readOnly) {
    this.zw_handler(event,src,title);
  } else {
    zw.status('loading...');
    var obj = this;
    var callback = function(r) {
      zw.status(false);
      if(r == '-') { // doesn't exist (might be a shadow tiddler)
        editingTiddlers[title] = true;
        obj.zw_handler(event,src,title);
      } else if(r.match(/^locked/)) {
        r = r.replace(/^locked\n/, '');
        if(!store.fetchTiddler(title).revisionKey) {
          var parts = r.split('\n');
          var tiddler = new Tiddler();
          tiddler.set(parts[0], Tiddler.unescapeLineBreaks(parts[1].replace(/&quot;/g, '"').replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g,'&')), parts[2], Date.convertFromYYYYMMDDHHMM(parts[3]), parts[5], Date.convertFromYYYYMMDDHHMM(parts[4]));
          store.addTiddler(tiddler);
        }
        editingTiddlers[title] = true;
        obj.zw_handler(event,src,title);
      } else if(r.match(/^already locked by/)) {
        var lock_user = r.replace('already locked by ', '');
        if(lock_user == zw.username) {
          if(confirm(config.messages.lockedTiddlerYou)) {
            editingTiddlers[title] = true;
            obj.zw_handler(event,src,title);
          }
        } else {
          alert(config.messages.lockedTiddler.replace(/%s/g, lock_user));
        }
      } else {
        alert(r);
      }
    };
    ajax.post(zw.get_url(), callback, 'action=lock&id=' + title + '&' + zw.no_cache());
    return false;
  }
};

config.commands.saveTiddler.zw_handler = config.commands.saveTiddler.handler;
config.commands.saveTiddler.handler = function(event,src,title) {
  if((zw.loggedIn || zw.anonEdit) && !isProtectedTiddler(title)) {
    editingTiddlers[title] = false;
    return this.zw_handler(event,src,title);
  } else {
    config.commands.cancelTiddler.zw_handler(null,null,title);
  }
};

config.commands.deleteTiddler.zw_handler = config.commands.deleteTiddler.handler;
config.commands.deleteTiddler.handler = function(event,src,title) {
  if((zw.loggedIn || zw.anonEdit) && !isProtectedTiddler(title)) {
    editingTiddlers[title] = false;
    return this.zw_handler(event,src,title);
  } else {
    config.commands.cancelTiddler.zw_handler(null,null,title);
  }
};

config.commands.cancelTiddler.zw_handler = config.commands.cancelTiddler.handler;
config.commands.cancelTiddler.handler = function(event,src,title) {
  if(!config.options.chkHttpReadOnly) {
      editingTiddlers[title] = false;
      ajax.post(zw.get_url(), function(r){}, 'action=unlock&id=' + title + '&' + zw.no_cache());
  }
  return this.zw_handler(event,src,title);
};

function isProtectedTiddler(title) {
  var tiddler = store.fetchTiddler(title);
  if(zw.isAdmin || !tiddler || !tiddler.modifier || tiddler.modifier == zw.username) return false;
  for(var i=0;i<config.protectedTiddlers.length;i++) {
    if(config.protectedTiddlers[i] == title) return true;
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

zw.refresh_tiddlers_callback = function(tiddlers) {
  if(tiddlers == '') return;
  tiddlers = tiddlers.split('\n');
  zw.latestTiddler = parseInt(tiddlers[0]);
  for(var i=1; i<tiddlers.length; i++) {
    if(!editingTiddlers[tiddlers[i]])
      displayTiddlerRevision(tiddlers[i], null, null, true);
  }
};

zw.refresh_interval_id = setInterval('zw.refresh_tiddlers()', 60000); // refresh every minute

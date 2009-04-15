/***
|''Name:''|Integration tests for importMediaWikiWizard|
|''Description:''|Integration tests for importMediaWikiWizard|
|''Author:''|Nicolas Rusconi (nicolas.rusconi (at) globant (dot) com)|
|''Version:''|1.0.0|
|''Date:''|Feb 13, 2009|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
|''Type''|plugin|
***/
/*{{{*/
ImportMediaWikiTest = {};
ImportMediaWikiTest.prototype = {};
ImportMediaWikiTest.prototype.typeHost = function(host)
{
	var macro = config.macros.importMediaWiki;
	var hostInput = this.getElementByName(macro.hostInputName);
	hostInput.value = host;
};

ImportMediaWikiTest.prototype.clickNext = function()
{
	this.getElementByClass('wizardFooter').childNodes[2].onclick();
};

ImportMediaWikiTest.prototype.clickImportMoreTiddlers = function()
{
	document.getElementById(config.macros.importMediaWiki.importeMoreTiddlersButtonId).onclick();
};
	
ImportMediaWikiTest.prototype.assertMessage = function (message)
{
	var container = document.getElementById('wizardMessageBar');
	TestStep.prototype.assertEquals(message, container.lastChild.nodeValue);
};

ImportMediaWikiTest.prototype.clickDone = function()
{
	this.getElementByClass('wizardFooter').childNodes[0].onclick();
};

ImportMediaWikiTest.prototype.assertWizardNotPresent = function ()
{
	var a = this.getElementByClassNotUnique('wizardFooter');
	try {
		this.assertEmpty(a);
	} catch (ex) {
		throw 'Assertion failed, Wizard is still present';
	}
};

ImportMediaWikiTest.prototype.assertTiddlersExists = function(tiddlers)
{
	for (var i=0; i<tiddlers.length; i++) {
		try {
			this.assertTrue(store.tiddlerExists(tiddlers[i]));
		} catch (ex) {
			throw 'Assertion failed, tiddler ' + tiddlers[i] + ' does not exist.';
		}
	};
};

ImportMediaWikiTest.prototype.assertTiddlersDontExists = function(tiddlers)
{
	for (var i=0; i<tiddlers.length; i++) {
		try {
			this.assertTrue(!store.tiddlerExists(tiddlers[i]));
		} catch (ex) {
			throw 'Assertion failed, tiddler ' + tiddlers[i] + ' exist.';
		}
	};
};

ImportMediaWikiTest.prototype.assertImportedTiddlersFields = function(tiddlers, serverHost)
{
	for (var i=0; i<tiddlers.length; i++) {
		var tiddler = store.getTiddler(tiddlers[i]);
		this.assertEquals(serverHost, tiddler.fields['server.host']);
		this.assertEquals('mediawiki', tiddler.fields['wikiformat']);
		this.assertTrue(tiddler.fields['server.page.revision'] != null);
		this.assertTrue(tiddler.fields['server.page.timestamp'] != null);
	};
};

ImportMediaWikiTest.prototype.assertImportedTiddlersNotSynced = function(tiddlers)
{
	for (var i=0; i<tiddlers.length; i++) {
		var tiddler = store.getTiddler(tiddlers[i]);
		this.assertNull(tiddler.fields['server.host']);
		this.assertEquals('mediawiki', tiddler.fields['wikiformat']);
		this.assertNull(tiddler.fields['server.page.revision']);
		this.assertNull(tiddler.fields['server.page.timestamp']);
	};
};

ImportMediaWikiTest.prototype.assertImportedTiddlersMessage = function(tiddlers)
{
	var message = document.getElementById(
		config.macros.importMediaWiki.importedTiddlersMessageId).firstChild;
	try {
		this.assertEquals('Imported tiddlers:', message.childNodes[0].nodeValue);
		for (var i=0; i<tiddlers.length; i++) {
			var a = message.childNodes[3 + (i * 2)];
			this.assertEquals(tiddlers[i], message.childNodes[3 + (i * 2)].innerHTML);
		};
	} catch (ex) {
		throw 'Imported tiddlers message is not correct ' + ex.toString();
	}
};

ImportMediaWikiTest.prototype.getSelectedWorkspace = function()
{
	try {
		var workspaceSelector = this.getElementByName('selWorkspace');
		return workspaceSelector.value;
	} catch (ex) {
		throw 'Unable to get selected workspace ' + ex.toString();
	}
};

ImportMediaWikiTest.prototype.getCheckboxForPage = function(page)
{
	var elements = this.getElementByClassAndType('chkOptionInput', 'input');
	for (var i=0; i<elements.length; i++) {
		var rowname = elements[i].attributes['rowName'];
		if (elements[i].rowName == page || (rowname && rowname.value == page)) {
				return elements[i];
		}
	};
	return null;
};

ImportMediaWikiTest.prototype.assertDefaultCustomFields = function(host)
{
	this.assertEquals(host, config.defaultCustomFields['server.host']);
	this.assertEquals('mediawiki', config.defaultCustomFields.wikiformat);
}

ImportMediaWikiTest.prototype.buildNamespacesResponseText = function(namespaces)
{
	var namespacesDefinition = '';
	for (var i=0; i<namespaces.length; i++) {
		var id = namespaces[i]['id'];
		var title = namespaces[i]['title'];
		namespacesDefinition += ',"' + id+ '":{"id":' + id + ',"*":"' + title +'","canonical":"' + title + '"}';
	};
	return '{"query":{"namespaces":{' + namespacesDefinition.substring(1) + '}}}';
};

ImportMediaWikiTest.prototype.expectNamespaceQuery = function(host, namespaces)
{
	var response = this.buildNamespacesResponseText(namespaces);
	this.expectGetReq(response, host + this.namespaceQuery);
}

ImportMediaWikiTest.prototype.buildPagesResponseText = function(pages)
{
	if (pages && pages.length > 0) {
		var defaultPage = {pageid:1,ns:0,touched:"2009-02-26T14:15:30Z",lastrevid:40,counter:50,length:100};
		var pagesDefinition = '';
		for (var i=0; i<pages.length; i++) {
			var page = pages[i];
			merge(page , defaultPage, true);
			pagesDefinition += ',"' + page.pageid + '":{"pageid":' + page.pageid + 
				',"ns":' + page.ns + ',"title":"' + page.title + '","touched":"' + page.touched + 
				'","lastrevid":' + page.lastrevid + ',"counter":' + page.counter + ',"length":' + page.length + '}';
		}
		return '{"query":{"pages":{' + pagesDefinition.substring(1) + '}}}';
	} else {
		return '[]';
	}
};

ImportMediaWikiTest.prototype.expectPagesQuery = function(host, pages, namespace){
	var namespaceParam = '';
	if (namespace) {
		namespaceParam = 'gapnamespace=' + namespace.id + '&';
	}
	var response = this.buildPagesResponseText(pages);
	this.expectGetReq(response, host + this.pagesQuery.format([namespaceParam]));
}

ImportMediaWikiTest.prototype.buildPagesContentResponseText = function(pages)
{
	var defaultPage = {pageid:1,ns:0,revid: 40,user: "test user",anon: "",	timestamp: "2009-02-26T14:15:30Z"};
	var pagesDefinition = '';
	for (var i=0; i<pages.length; i++) {
		var page = pages[i];
		merge(page , defaultPage, true);
		pagesDefinition += ',"' + page.pageid + '":{"pageid":' + page.pageid + ',"ns":' + page.ns + ',"title":"' + page.title + 
			'","revisions":[{"revid":' + page.revid + ',"user":"' + page.user + '","anon":"' + page.anon +
			'","timestamp":"' + page.timestamp + '","*":"' + page.content + '"}]}';
	};
	
	var normalized = '{"normalized":[{"from":"' + pages[0].title + '","to":"' + pages[pages.length - 1].title  + '"}]';
	return '{"query":' + normalized + ',"pages":{' + pagesDefinition.substring(1) + '}}}';
};

ImportMediaWikiTest.prototype.expectPagesContentQuery = function(host, contents)
{
	var response = this.buildPagesContentResponseText(contents);
	var titles = this.getNormalizedTitles(contents);
	this.expectGetReq(response, host + this.pagesContentQuery.format([titles]));
};

ImportMediaWikiTest.prototype.expectTemplatesQuery = function(host, pages, templates, otro)
{
	var response = this.buildPagesResponseText(templates);
	var titles = this.getNormalizedTitles(pages);
	this.expectGetReq(response, host + this.templatesQuery.format([titles]));
};

ImportMediaWikiTest.prototype.getNormalizedTitles = function (pages) {
	var titles = '';
	for (var i=0; i<pages.length; i++) {
		titles = '|' + config.adaptors.mediawiki.normalizedTitle(pages[i].title);
	};
	return titles.substring(1);
};

ImportMediaWikiTest.prototype.namespaceQuery =    'api.php?format=json&action=query&meta=siteinfo&siprop=namespaces';
ImportMediaWikiTest.prototype.pagesQuery =        'api.php?format=json&action=query&generator=allpages&gapfilterredir=nonredirects&gapfrom=0&prop=info&%0gaplimit=500';
ImportMediaWikiTest.prototype.pagesContentQuery = 'api.php?format=json&action=query&prop=revisions&titles=%0&rvprop=content|timestamp|user|ids';
ImportMediaWikiTest.prototype.templatesQuery =    'api.php?format=json&action=query&generator=templates&titles=%0&prop=info';
merge(TestStep.prototype, ImportMediaWikiTest.prototype);

var singlePageTestDef = {
	name: "Test Import Single Page",
	step1: function() {
		// first try to get the host
		var host = 'http://glb0659.globant.com/';
		this.expectGetReq('',host + this.namespaceQuery);
		//second try, now works
		host += 'mediawiki/';
		this.expectNamespaceQuery(host, [{id:0, title:""},{id:10, title:"Template"}]);
		//page definitions
		var mainPage = {pageid:1,ns:0,title:"Main Page", content: '<big>wiki page content.<\/big>{{Footer}}'};
		var templateFooter = {pageid:4,ns:10,title:"Template:Footer",content: "Thanks, Wiki Template! {{{1}}}"};
		//get pages
		this.expectPagesQuery(host, [mainPage]);
		//get main page content
		this.expectPagesContentQuery(host, [mainPage]);
		//get templates used in main page
		this.expectTemplatesQuery(host, [mainPage], [templateFooter]);
		//get template content
		this.expectPagesContentQuery(host, [templateFooter]);
	},
	step1Delay : 0,
	step2: function() {
		this.typeHost("http://glb0659.globant.com/mediawiki/index.php/Main_Page");
		this.clickNext();
	},
	step2Delay : 600,
	step3:function() {
		this.assertMessage("All tiddlers imported");
		this.clickDone();
	},
	step3Delay: 10,
	step4:function() {
		this.assertWizardNotPresent();
		var host = "http://glb0659.globant.com/mediawiki";
		var importedTiddlers = ["Main Page", "Template:Footer"];
		this.assertImportedTiddlersMessage(importedTiddlers);
		this.assertImportedTiddlersFields(importedTiddlers, host.substr(7));
		importedTiddlers.push(host);
		this.assertTiddlersExists(importedTiddlers);
		this.assertDefaultCustomFields(host);
	},
	step4Delay: 0,
	step5: function() {
		TestRunner.assertTiddlyWikiSaved(false);
	}
};
TestRunner.add(singlePageTestDef);

var singlePageTestWithTrailingSpacesInURLDef = Test.createTemplateFrom(singlePageTestDef,
	"Test Import Single Page with trailing spaces in URL");
singlePageTestWithTrailingSpacesInURLDef.step2 = function() {
	this.typeHost(" http://glb0659.globant.com/mediawiki/index.php/Main_Page ");
	this.clickNext();
};

TestRunner.add(singlePageTestWithTrailingSpacesInURLDef);

var singlePageTestWithAutosaveDef = Test.createFromTemplateWithAutosave(
	singlePageTestDef,5,"Test Import Single Page with AutoSave.");
TestRunner.add(singlePageTestWithAutosaveDef);

var singlePageTestWithNoDefaultWorkspaceDef = {
	name: "Test import single page with no default workspace.",
	step1: function() {
		// first try to get the host
		var host = 'http://glb0659.globant.com/';
		var templateNamespace = {id:10, title:"Template"};
		this.expectNamespaceQuery(host, [templateNamespace]);
		//page definition
		var templateFooter = {pageid:4,ns:10,title:"Template:Footer",content: "Thanks, Wiki Template! {{{1}}}"};
		//get pages
		this.expectPagesQuery(host, [templateFooter], templateNamespace);
		//get main page content
		this.expectPagesContentQuery(host, [templateFooter]);
		//get templates used in main page
		this.expectTemplatesQuery(host, [templateFooter], []);
	},
	step1Delay : 0,
	step2: function() {
		this.typeHost("http://glb0659.globant.com/index.php/Template:Footer");
		this.clickNext();
	},
	step2Delay : 600,
	step3:function() {
		this.assertMessage("All tiddlers imported");
		this.clickDone();
	},
	step3Delay: 10,
	step4:function() {
		this.assertWizardNotPresent();
		var host = "glb0659.globant.com";
		var page = "Template:Footer";
		this.assertTiddlersExists([page, "Template on http://" + host]);
		this.assertImportedTiddlersMessage([page]);
		this.assertImportedTiddlersFields([page], host);
	},
	step4Delay: 1,
	step5: function() {
		TestRunner.assertTiddlyWikiSaved(false);
	}
};

TestRunner.add(singlePageTestWithNoDefaultWorkspaceDef);

var manualSelectionTestDef = {
	name: "Test import single page with manual selection.",
	step1: function() {
		// first try to get the host
		var host = 'http://glb0659.globant.com/';
		this.expectGetReq('',host + this.namespaceQuery);
		//second try, now works
		host += 'mediawiki/';
		this.expectNamespaceQuery(host, [{id:0, title:""},{id:10, title:"Template"}]);
		//page definitions
		var mainPage = {pageid:1,ns:0,title:"Main Page", content: '<big>wiki page content.<\/big>{{Footer}}'};
		var templateFooter = {pageid:4,ns:10,title:"Template:Footer",content: "Thanks, Wiki Template! {{{1}}}"};
		//get pages
		this.expectPagesQuery(host, [mainPage]);
		//get main page content
		this.expectPagesContentQuery(host, [mainPage]);
		//get templates used in main page
		this.expectTemplatesQuery(host, [mainPage], [templateFooter]);
		//get template content
		this.expectPagesContentQuery(host, [templateFooter]);
	},
	step1Delay: 0,
	step2: function() {
		this.typeHost("http://glb0659.globant.com/mediawiki/");
		this.clickNext();
	},
	step2Delay : 600,
	step3:function(a) {
		this.assertEquals("", this.getSelectedWorkspace());
		var checkForMainPage = this.getCheckboxForPage("Main Page");
		checkForMainPage.checked = true;
		this.clickNext();
	},
	step3Delay : 10,
	step4:function() {
		this.assertMessage("All tiddlers imported");
		this.clickDone();
	},
	step4Delay : 100,
	step5:function() {
		this.assertWizardNotPresent();
		var importedTiddlers = ["Main Page", "Template:Footer"];
		this.assertTiddlersExists(importedTiddlers);
		var host = "glb0659.globant.com/mediawiki";
		this.assertTiddlersExists(["http://" + host]);
		this.assertImportedTiddlersMessage(importedTiddlers);
		this.assertImportedTiddlersFields(importedTiddlers, host);
	},
	step5Delay:0,
	step6: function() {
		TestRunner.assertTiddlyWikiSaved(false);
	}
};
TestRunner.add(manualSelectionTestDef);

var singlePageTestWithExistentMediaWikiFeedDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test save server tiddler don't appears when there is a mediaWikiFeed tiddler already");
singlePageTestWithExistentMediaWikiFeedDef.addAfterStep(function() {
	var macro = config.macros.importMediaWiki;
	var host = "http://mediaWikiFeed";
	macro.saveServerTiddlerWithDetails(host, 'mediawiki', host, '', 'feed', [macro.mediaWikiFeedTag])
},1);
singlePageTestWithExistentMediaWikiFeedDef.addAfterStep(function() {
	var elements = document.getElementsByName(config.macros.importMediaWiki.chkSaveName);
	this.assertTrue(elements.length == 0,"the save server tiddler checkbox is appearing when a mediaWikiFeed already exist");
},4);
singlePageTestWithExistentMediaWikiFeedDef.step5 = function() {
		this.assertWizardNotPresent();
		var importedTiddlers = ["Main Page", "Template:Footer"];
		this.assertTiddlersExists(importedTiddlers);
		var host = "glb0659.globant.com/mediawiki";
		this.assertTiddlersDontExists(["http://" + host]);
		this.assertImportedTiddlersMessage(importedTiddlers);
		this.assertImportedTiddlersFields(importedTiddlers, host);
	},
TestRunner.add(singlePageTestWithExistentMediaWikiFeedDef);

var singlePageTestWithWrongDirTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test Import Single Page with manual selection and wrong directory in the url");
singlePageTestWithWrongDirTestDef.step2 = function() {
	this.typeHost("http://glb0659.globant.com/mediawiki/folder/");
	this.clickNext();
};
TestRunner.add(singlePageTestWithWrongDirTestDef);

var singlePageTestWithWrongDirTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test Import Single Page with manual selection and missing / at the end of the url.");
singlePageTestWithWrongDirTestDef.step2 = function() {
	this.typeHost("http://glb0659.globant.com/mediawiki");
	this.clickNext();
};
TestRunner.add(singlePageTestWithWrongDirTestDef);

var manualSelectionWithNoProtocolAndSlatAtTheEndOfURLTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test Import Single Page with manual selection with missing protocol and / at the end of the url.");
manualSelectionWithNoProtocolAndSlatAtTheEndOfURLTestDef.step2 = function() {
	this.typeHost("glb0659.globant.com/mediawiki");
	this.clickNext();
};
TestRunner.add(manualSelectionWithNoProtocolAndSlatAtTheEndOfURLTestDef);

var manualSelectionWithAutoSaveTestDef = Test.createFromTemplateWithAutosave(
	manualSelectionTestDef,6,"Test import single page with manual selection and auto save.");
TestRunner.add(manualSelectionWithAutoSaveTestDef);

var singlePageTestWithPreselectedWorkspaceTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test Import Single Page with preselected workspace.");
	
singlePageTestWithPreselectedWorkspaceTestDef.addAfterStep(function() {
	var templateFooter = {pageid:4,ns:10,title:"Template:Footer",content: "Thanks, Wiki Template! {{{1}}}"};
	this.expectPagesQuery('http://glb0659.globant.com/mediawiki/', [templateFooter], {id:10, title:"Template"});
},1);

singlePageTestWithPreselectedWorkspaceTestDef.step1 = function() {
		var host = 'http://glb0659.globant.com/';
		var templateWorkspace = {id:10, title:"Template"};
		this.expectNamespaceQuery(host, [{id:0, title:""},templateWorkspace]);
		//page definitions
		var templateFooter = {pageid:4,ns:10,title:"Template:Footer",content: "Thanks, Wiki Template! {{{1}}}"};
		//get pages
		this.expectPagesQuery(host, [templateFooter], templateWorkspace);
		this.expectPagesQuery(host, [templateFooter], templateWorkspace);
		//get main page content
		this.expectPagesContentQuery(host, [templateFooter]);
		//get templates used in main page
		this.expectTemplatesQuery(host, [templateFooter], []);
		//get template content
	},
singlePageTestWithPreselectedWorkspaceTestDef.step2 = function() {
	this.typeHost("http://glb0659.globant.com/Template:invalidPage");
	this.clickNext();
};
singlePageTestWithPreselectedWorkspaceTestDef.step2Delay = 200;
singlePageTestWithPreselectedWorkspaceTestDef.step3 = function() {
	this.assertEquals("Template", this.getSelectedWorkspace());
	var checkForPage = this.getCheckboxForPage("Template:Footer");
	checkForPage.checked = true;
	this.clickNext();
};
singlePageTestWithPreselectedWorkspaceTestDef.step5 = function() {
	this.assertWizardNotPresent();
	var page = ["Template:Footer"];
	var host = "glb0659.globant.com";
	this.assertTiddlersExists(page);
	this.assertTiddlersDontExists(["http://" + host]);
	this.assertImportedTiddlersMessage(page);
	this.assertImportedTiddlersFields([page], host);
};
TestRunner.add(singlePageTestWithPreselectedWorkspaceTestDef);

var manualSelectionWithNoServerTiddlerTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test import single page with manual selection and not saving server details in a tiddler.");
manualSelectionWithNoServerTiddlerTestDef.addBeforeStep(
	function() {this.getElementByName("chkSave").checked = false;}, 4);

manualSelectionWithNoServerTiddlerTestDef.step5 = function() {
	this.assertWizardNotPresent();
	var page = "Main Page";
	var template = "Template:Footer";
	var host = "glb0659.globant.com/mediawiki";
	this.assertTiddlersExists([page,template]);
	this.assertTiddlersDontExists(["http://" + host]);
	this.assertImportedTiddlersMessage([page, template]);
	this.assertImportedTiddlersFields([page, template], host);
};

TestRunner.add(manualSelectionWithNoServerTiddlerTestDef);
	
var manualSelectionWithNoServerTiddlerAndAutoSaveTestDef = Test.createFromTemplateWithAutosave(
	manualSelectionWithNoServerTiddlerTestDef,6,
	"Test import single page with manual selection and not saving server details in a tiddler and autosaving.");
TestRunner.add(manualSelectionWithNoServerTiddlerAndAutoSaveTestDef);

var manualSelectionWithNoSyncTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test import single page with manual selection and not keeping sync of imported tiddlers.");
manualSelectionWithNoSyncTestDef.addBeforeStep(
	function(){this.getElementByName("chkSync").checked = false;}, 3);
manualSelectionWithNoSyncTestDef.step5 = function() {
	this.assertWizardNotPresent();
	var page = ["Main Page","Template:Footer"];
	this.assertTiddlersExists(page);
	this.assertImportedTiddlersMessage(page);
	this.assertImportedTiddlersNotSynced(page);
};
TestRunner.add(manualSelectionWithNoSyncTestDef);

var manualSelectionWithServerTiddlerAndAutoSaveTestDef = Test.createFromTemplateWithAutosave(
	manualSelectionWithNoSyncTestDef,6,
	"Test import single page with manual selection and not keeping sync of imported tiddlers and autosaving.");
TestRunner.add(manualSelectionWithServerTiddlerAndAutoSaveTestDef);

var manualSelectionWithNoSyncAnsServerDetailsTestDef = Test.createTemplateFrom(manualSelectionWithNoSyncTestDef,
	"Test import single page with manual selection and not keeping sync of imported tiddlers and not saving server details in a tiddler.");
manualSelectionWithNoSyncAnsServerDetailsTestDef.addBeforeStep(
	function() {this.getElementByName("chkSave").checked = false;}, 4);
manualSelectionWithNoSyncAnsServerDetailsTestDef.step5 = function() {
	this.assertWizardNotPresent();
	var page = "Main Page";
	var template = "Template:Footer";
	var host = "glb0659.globant.com/mediawiki";
	this.assertTiddlersExists([page, template]);
	this.assertTiddlersDontExists(["http://" + host]);
	this.assertImportedTiddlersMessage([page, template]);
	this.assertImportedTiddlersNotSynced([page, template]);
};
TestRunner.add(manualSelectionWithNoSyncAnsServerDetailsTestDef);

var manualSelectionWithNoSyncAnsServerDetailsAndAutoSaveTestDef = Test.createFromTemplateWithAutosave(
	manualSelectionWithNoSyncAnsServerDetailsTestDef,6,
	"Test import single page with manual selection and not keeping sync of imported tiddlers,not saving server details in a tiddler and autosaving.");
TestRunner.add(manualSelectionWithNoSyncAnsServerDetailsAndAutoSaveTestDef);

var invalidHostTestDef = {
	name: "Test invalid host.",
	type: ImportMediaWikiTest,
	step1: function() {
		var host = 'http://invalidHost';
		this.expectGetReq('',host + '/' + this.namespaceQuery, 503);
		this.expectGetReq('',host + '/wiki/' + this.namespaceQuery, 503);
		this.expectGetReq('',host + '/w/' + this.namespaceQuery, 503);
		this.typeHost(host);
		this.clickNext();
	},
	step1Delay: 10,
	step2: function() {
		this.assertMessage(config.macros.importMediaWiki.errorLookingForWikiHost);
		this.assertTrue(this.getElementByClass("wizardFooter").childNodes[2].childNodes[0].nodeValue == 'next', 'next button not present');
	}
};
TestRunner.add(invalidHostTestDef);

var validHostWithNoWikiTestDef = {
	name: "Test valid host with no mediaWiki API.",
	type: ImportMediaWikiTest,
	step1: function() {
		var host = 'http://host';
		this.expectGetReq('',host + '/' + this.namespaceQuery, 404);
		this.expectGetReq('',host + '/wiki/' + this.namespaceQuery, 404);
		this.expectGetReq('',host + '/w/' + this.namespaceQuery, 404);
		this.typeHost(host);
		this.clickNext();
	},
	step1Delay: 10,
	step2: function() {
		this.assertMessage(config.macros.importMediaWiki.errorLookingForWikiApi);
		this.assertTrue(this.getElementByClass("wizardFooter").childNodes[2].childNodes[0].nodeValue== 'next', 'next button not present');
	}
};
TestRunner.add(validHostWithNoWikiTestDef);

var manualSelectionWithNoSelectedPageTestDef = Test.createTemplateFrom(manualSelectionTestDef,
	"Test import single page with manual selection fails when no page selected.");
manualSelectionWithNoSelectedPageTestDef.step3 = function(a) {
		this.assertEquals("", this.getSelectedWorkspace());
		this.clickNext();
	};
manualSelectionWithNoSelectedPageTestDef.step4 = function() {
		this.assertMessage( config.macros.importMediaWiki.noPageSelected);
	};
manualSelectionWithNoSelectedPageTestDef.step5 = manualSelectionWithNoSelectedPageTestDef.step6;
manualSelectionWithNoSelectedPageTestDef.step6 = null;
TestRunner.add(manualSelectionWithNoSelectedPageTestDef);

var impormoreTiddlersButtonTestDef = Test.createTemplateFrom(singlePageTestDef,
    "Test import more tiddlers button");
impormoreTiddlersButtonTestDef.step6 = function() {
	// first try to get the host
	var host = 'http://glb0659.globant.com/';
	this.expectGetReq('',host + this.namespaceQuery);
	host += 'mediawiki/';
	this.expectNamespaceQuery(host, [{id:0, title:""},{id:10, title:"Template"}]);
	//page definitions
	var mainPage = {pageid:1,ns:0,title:"Main Page", content: '<big>wiki page content.<\/big>{{Footer}}'};
	var anotherPage = {pageid:2,ns:0,title:"Another Page", content: '<big>yet another page.<\/big>'};
	//get pages
	this.expectPagesQuery(host, [mainPage, anotherPage]);
	//get main page content
	this.expectPagesContentQuery(host, [anotherPage]);
	//get templates used in main page
	this.expectTemplatesQuery(host, [anotherPage], []);
	this.clickImportMoreTiddlers();
};
impormoreTiddlersButtonTestDef.step6Delay = 500;
impormoreTiddlersButtonTestDef.step7 = function() {
	//Check the imported tiddlers message is still there
	this.assertImportedTiddlersMessage(["Main Page", "Template:Footer"]);
	this.assertEquals("", this.getSelectedWorkspace());
	var checkForAnotherPage = this.getCheckboxForPage("Another Page");
	checkForAnotherPage.checked = true;
	this.clickNext();
}
impormoreTiddlersButtonTestDef.step7Delay = 300;
impormoreTiddlersButtonTestDef.step8 = function() {
	this.assertMessage("All tiddlers imported");
	this.clickDone();
}
impormoreTiddlersButtonTestDef.step8Delay = 100;
impormoreTiddlersButtonTestDef.step9 = function() {
	this.assertWizardNotPresent();
	var importedTiddlers = ["Another Page", "Main Page", "Template:Footer"];
	this.assertTiddlersExists(importedTiddlers);
	var host = "glb0659.globant.com/mediawiki";
	this.assertTiddlersExists(["http://" + host]);
	this.assertImportedTiddlersMessage(importedTiddlers);
	this.assertImportedTiddlersFields(importedTiddlers, host);
};

impormoreTiddlersButtonTestDef.step9Delay = 0;
impormoreTiddlersButtonTestDef.step10 = function() {
		TestRunner.assertTiddlyWikiSaved(false);
};
TestRunner.add(impormoreTiddlersButtonTestDef);

var imporMoreTiddlersButtonWithoutFeedTestDef = Test.createTemplateFrom(manualSelectionWithNoServerTiddlerTestDef,
    "Test import more tiddlers button with no mediaWikiFeed saved");
imporMoreTiddlersButtonWithoutFeedTestDef.addAfterStep(function() {
	store.deleteTiddler("Main Page"); //to avoid the overwriting message
	this.clickImportMoreTiddlers();
},6);
imporMoreTiddlersButtonWithoutFeedTestDef.step7 = singlePageTestDef.step1;
imporMoreTiddlersButtonWithoutFeedTestDef.step7Delay = singlePageTestDef.step1Delay;
imporMoreTiddlersButtonWithoutFeedTestDef.step8 = singlePageTestDef.step2;
imporMoreTiddlersButtonWithoutFeedTestDef.step8Delay = singlePageTestDef.step2Delay;
imporMoreTiddlersButtonWithoutFeedTestDef.step9 = singlePageTestDef.step3;
imporMoreTiddlersButtonWithoutFeedTestDef.step9Delay = singlePageTestDef.step3Delay;
imporMoreTiddlersButtonWithoutFeedTestDef.step10 = singlePageTestDef.step4;
imporMoreTiddlersButtonWithoutFeedTestDef.step10Delay = singlePageTestDef.step4Delay;
imporMoreTiddlersButtonWithoutFeedTestDef.step11 = singlePageTestDef.step5;
TestRunner.add(imporMoreTiddlersButtonWithoutFeedTestDef);

var noNewTiddlerToImportTestDef = {
	name: "Test error message when there is no tiddler to import",
	step1: function() {
		// first try to get the host
		var host = 'http://glb0659.globant.com/';
		// get workspaces
		this.expectNamespaceQuery(host, [{id:0, title:""}]);
		//get pages
		this.expectPagesQuery(host, []);
	},
	step1Delay: 0,
	step2: function() {
		this.typeHost("http://glb0659.globant.com/");
		this.clickNext();
	},
	step2Delay : 100,
	step3:function() {
		this.assertMessage(config.macros.importMediaWiki.errorGettingTiddlerList);
	},
	step3Delay:0,
	step4: function() {
		TestRunner.assertTiddlyWikiSaved(false);
	}
};
TestRunner.add(noNewTiddlerToImportTestDef);
var noNewTiddlerToImportFilteringExistentTestDef = Test.createTemplateFrom(noNewTiddlerToImportTestDef,
    "Test error message when there is no tiddler to import because they were all imported");

noNewTiddlerToImportFilteringExistentTestDef.step1 = function() {
	// first try to get the host
	var host = 'http://glb0659.globant.com/';
	this.expectNamespaceQuery(host, [{id:0, title:""},{id:10, title:"Template"}]);
	//page definitions
	var mainPage = {pageid:1,ns:0,title:"Main Page", content: '<big>wiki page content.<\/big>{{Footer}}'};
	//get pages
	this.expectPagesQuery(host, [mainPage]);
	var tiddler = new Tiddler(mainPage.title);
	tiddler.tags.push(config.macros.importMediaWiki.mediaWikiTiddlersTag);
	store.addTiddler(tiddler);
};
	
noNewTiddlerToImportFilteringExistentTestDef.step3 = function() {
	var mes = config.macros.importMediaWiki.noTiddlerToImport
	    + config.macros.importMediaWiki.filteredTiddlers.format([1]);
	this.assertMessage(mes);
};
TestRunner.add(noNewTiddlerToImportFilteringExistentTestDef);
/*}}}*/
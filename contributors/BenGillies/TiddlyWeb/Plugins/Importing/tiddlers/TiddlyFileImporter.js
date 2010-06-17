/***
|TiddlyFileImporter|
|Version|0.1|
|Author|Ben Gillies|
|Type|plugin|
|Description|Upload a TiddlyWiki file to TiddlyWeb, and import the tiddlers.|
!Usage
Upload a TiddlyWiki file to TiddlyWeb, and import the tiddlers.
!Requires
tiddlyweb
tiddlywebplugins.reflector
!Code
***/
//{{{
(function($){
if(!version.extensions.TiddlyFileImporter)
{ //# ensure that the plugin is only installed once
	version.extensions.TiddlyFileImporter = { installed: true }
};

config.macros.fileImport = {
	reflectorURI: '/reflector',
	incorrectTypeError: 'Incorrect File Type. You must upload a TiddlyWiki',
	uploadLabel: 'Upload',
	uploadLabelPrompt: 'Import tiddlers from this TiddlyWiki',
	step1Text: 'Pick a TiddlyWiki file to Upload',
	step1Title: 'Step 1: Upload a TiddlyWiki file',

	handler: function(place, macroName, params, wikifier, paramString) {
		var wizard = new Wizard();
		wizard.createWizard(place, 'Import a TiddlyWiki');
		this.restart(wizard);
	},

	restart: function(wizard) {
		var me = config.macros.fileImport;
		wizard.addStep(me.step1Title, '<input type="hidden" '
			+ 'name="markList" />');
		var markList = wizard.getElement('markList');
		var uploadWrapper = document.createElement('div');
		markList.parentNode.insertBefore(uploadWrapper, markList);
		uploadWrapper.setAttribute('refresh', 'macro');
		uploadWrapper.getAttribute('macroName', 'fileImport');
		$(uploadWrapper).append('<p>' + me.step1Text + '</p>');
		var iframeName = 'reflectorImporter' + Math.random().toString();
		me.createForm(uploadWrapper, wizard, iframeName);
		wizard.setValue('serverType', 'tiddlyweb');
		wizard.setValue('adaptor', new config.adaptors.file());
		wizard.setValue('host', config.defaultCustomFields['server.host']);
		wizard.setValue('context', {});
		wizard.setButtons([{
			caption: me.uploadLabel,
			tooltip: me.uploadLabelPrompt,
			onClick: function() {
				var iframe = $('<iframe name="' + iframeName + '" '
					+ 'style="display: none" />').appendTo(uploadWrapper);
				// set an onload ready to hijack the form
				me.setOnLoad(uploadWrapper, wizard, iframe[0]);
				wizard.formElem.submit();
			}
		}]);
	},

	createForm: function(place, wizard, iframeName) {
		var form = wizard.formElem;
		var me = config.macros.fileImport;
		form.action = me.reflectorURI;
		form.enctype = 'multipart/form-data';
		form.method = 'POST';
		form.target = iframeName;
		$(place).append('<input type="file" name="file" />');
	},

	setOnLoad: function(place, wizard, iframe) {
		var me = config.macros.fileImport
		var loadHandler = function() {
			me.importTiddlers.apply(this, [place, wizard, iframe]);
		};
		iframe.onload = loadHandler;
		completeReadyStateChanges = 0;
		iframe.onreadystatechange = function() {
			if (++(completeReadyStaeChanges) == 3) {
				loadHandler();
			}
		}
	},

	importTiddlers: function(place, wizard, iframe) {
		var tmpStore = new TiddlyWiki();
		try {
			var POSTedWiki= iframe.contentWindow
				.document.documentElement.innerHTML;
		} catch(e) {
			displayMessage(config.macros.fileImport.incorrectTypeError);
			config.macros.fileImport.restart(wizard);
			return;
		}
		// now we are done, so remove the iframe
		$(iframe).remove();

		tmpStore.importTiddlyWiki(POSTedWiki);
		var newTiddlers = tmpStore.getTiddlers();
		var workspace = config.defaultCustomFields['server.workspace']
			.split(/^[^\/]*\//)[1];
		var context = {
			status: true,
			statusText: 'OK',
			httpStatus: 200,
			adaptor: wizard.getValue('adaptor'),
			tiddlers: newTiddlers
		};
		wizard.setValue('context', context);
		wizard.setValue('workspace', workspace);
		wizard.setValue('inFileImport', true);
		config.macros.importTiddlers.onGetTiddlerList(context, wizard);
	}
};

_onGetTiddler = config.macros.importTiddlers.onGetTiddler;
config.macros.importTiddlers.onGetTiddler = function(context, wizard) {
	context.adaptor = new config.adaptors.tiddlyweb();
	_onGetTiddler.apply(this, arguments);
	// now save the tiddlers
	if (wizard.getValue('inFileImport')) {
		var tiddler = context.tiddler;
		var fields = tiddler.fields;
		merge(fields, config.defaultCustomFields);
		delete fields['server.permissions'];
		delete fields['server.bag'];
		delete fields['server.page.revision'];
		delete fields['server.recipe'];
		fields.changecount = 1;
		store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
			tiddler.modifier, tiddler.modified, tiddler.tags, tiddler.fields,
			false, tiddler.created);
		autoSaveChanges(true);
	}
};

_onCancel = config.macros.importTiddlers.onCancel;
config.macros.importTiddlers.onCancel = function(e)
{
	var wizard = new Wizard(this);
	if (!wizard.getValue('inFileImport')) {
		return _onCancel.apply(this, arguments);
	}
	var place = wizard.clear();
	config.macros.fileImport.restart(wizard);
	return false;
};

})(jQuery);
//}}}

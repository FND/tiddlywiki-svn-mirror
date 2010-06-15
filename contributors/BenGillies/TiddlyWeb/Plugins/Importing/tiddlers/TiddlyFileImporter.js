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
		handler: function(place, macroName, params, wikifier, paramString) {
			// create a form to upload stuff
			var iframeName = this.createForm(place);

			// set an onload ready to hijack the form
			var iframe = $('iframe[name=' + iframeName + ']')[0];
			this.setOnLoad(place, iframe);
		},
		createForm: function(place) {
			// create an iframe
			var iframeName = 'reflectorImporter' + Math.random().toString();
			$('<form action="' + this.reflectorURI + '" method="POST"'
				+ ' enctype="multipart/form-data" target="' + iframeName + '">')
				.append('<input type="file" name="file" />')
				.append('<input type="submit" value="submit" />')
				.append('<iframe name="' + iframeName + '" '
				+ 'style="display: none" />')
			.appendTo(place);

			return iframeName;
		},
		setOnLoad: function(place, iframe) {
			var loadHandler = function() {
				importTiddlers(place, iframe);
			};

			iframe.onload = loadHandler;
			completeReadyStateChanges = 0;
			iframe.onreadystatechange = function() {
				if (++(completeReadyStaeChanges) == 3) {
					loadHandler();
				}
			}
		}
	};

function importTiddlers(place, iframe) {
	var tmpStore = new TiddlyWiki();
	try {
		var POSTedWiki= iframe.contentWindow.document.documentElement.innerHTML;
	} catch(e) {
		displayMessage('Incorrect File Type. You must upload a TiddlyWiki');
		return;
	}

	tmpStore.importTiddlyWiki(POSTedWiki);
	var newTiddlers = tmpStore.getTiddlers();
	$.each(newTiddlers, function(index, tiddler) {
		$(place).append(tiddler.title + '<br>');
	});
};

})(jQuery);
//}}}

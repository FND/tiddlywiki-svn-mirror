/***
|Name|BinaryUploadPlugin||
|Version|0.2.1|
|Author|Ben Gillies and Jon Robson|
|Type|plugin|
|Description|Upload a binary file to TiddlyWeb|
!Usage
To use:

&lt;&lt;binaryUpload bag:bag_name edit:tags edit:title tags:default_tags title:"xyz"&gt;&gt;

bag:bag_name is optional - The file will be saved to the current workspace if bag_name is left out
edit:tags - specifies that you want to tag the file being uploaded
edit:title - specifies that you want to set the title to something other than the filename
tags:default_tags - specifies a default set of tags to apply to the file. Note - require edit:tags to be set
title:"xyz" - predefines the title of the binary tiddler as xyz
tags:"[[foo bar]] bar" - predefines tags of the binary tiddler as 'foo bar' and bar.
!Requires
TiddlyWeb
tiddlywebplugins.form

!Code
***/
//{{{
if(!version.extensions.BinaryUploadPlugin)
{ //# ensure that the plugin is only installed once
		version.extensions.BinaryUploadPlugin = { installed: true };
}

(function($) {
var macro = config.macros.binaryUpload ={
		locale: {
			titleDefaultValue: "Please enter a title...",
			tagsDefaultValue: "Please enter some tags...",
			titlePrefix: "title: ",
			tagsPrefix: "tags: ",
			loadSuccess: 'Tiddler %0 successfully uploaded',
			loadError: "An error occurred when uploading the tiddler %0"
		},

		fullURL: '',
		handler: function(place, macroName, params, wikifier, paramString, tiddler) {
				params = paramString.parseParams(null, null, true);
				var locale = macro.locale;
				place = $('<div class="container" />').appendTo(place)[0];
				var uploadTo = params[0]['bag']? 'bags/' + params[0]['bag'] : config.defaultCustomFields['server.workspace'];
				var includeFields = {
						tags: params[0]['edit'] && params[0]['edit'].contains('tags') ? true : false,
						title: params[0]['edit'] && params[0]['edit'].contains('title') ? true : false
				};

				var baseURL = config.defaultCustomFields['server.host'];
				baseURL += (baseURL[baseURL.length - 1] !== '/') ? '/' : '';
				this.fullURL = baseURL + uploadTo + '/tiddlers';
				
				//create the upload form, complete with invisible iframe
				var iframeName = 'binaryUploadiframe' + Math.random().toString();
				var editables = [];
				var fields = ["title", "tags"];
				for(var i = 0; i < fields.length; i++) {
					var fieldName = fields[i];
					var defaultValue = params[0][fieldName] ? params[0][fieldName] : false;
					if(includeFields[fieldName] || defaultValue) {
						var localeDefault = locale["%0DefaultValue".format([fieldName])];
						var className = defaultValue ? "userInput" : "userInput notEdited";
						var inputEl;
						var val = defaultValue || localeDefault;
						if(defaultValue && !includeFields[fieldName]) {
							inputEl = $('<input type="hidden" /><input type="text" disabled />');
						} else {
							inputEl = $('<input type="text" />');
						}
						inputEl.attr("name", fieldName).
						addClass("%0Edit".format([fieldName])).
						val(val).addClass(className);
						
						var editEl = $("<span />").text(locale["%0Prefix".format([fieldName])]).
							appendTo('<div class="binaryUpload%0"></div>'.format([fieldName])).
							append(inputEl)[0]; 
						editables.push(editEl);
					}
				}
				$('<form class="binaryUploadForm" action="' + this.fullURL + '" method="POST" enctype="multipart/form-data" target="' + iframeName + '" />')
						.append(editables)
						.append('<div class="binaryUploadFile"><input type="file" name="file" /></div>')
						.append('<div class="binaryUploadSubmit"><input type="submit" value="Upload" /></div>')
						.submit(function() {
								$(".notEdited").val("");
								var fileName = $("input[name=title]", place).val() || $('input:file', place).val();
								if (!fileName) {
										return false; //the user hasn't selected a file yet
								}
								var fStart = fileName.lastIndexOf("\\");
								var fStart2 = fileName.lastIndexOf("/");
								fStart = fStart < fStart2 ? fStart2 : fStart;
								fileName = fileName.substr(fStart+1);
								$('input:file,input[name=title]', place).val(fileName);
								
								this.action += '?redirect=/bags/common/tiddlers.txt?select=title:'+fileName; //we need to go somewhere afterwards to ensure the onload event triggers
								$(place).append($('<iframe name="' + iframeName + '" id="' + iframeName + '"/>').css('display','none'));
								config.macros.binaryUpload.iFrameLoader(iframeName, fileName, place, uploadTo, tiddler);
								return true;
						}).appendTo(place);


			$(".notEdited", place).mousedown(function(ev) { // clear default text on click
				var target = $(ev.target);
				if(target.hasClass("notEdited")) {
					target.removeClass("notEdited");
					target.val("");
				}
			});

			$("input[name=file]", place).change(function(ev) {
				var target = $(ev.target);
				var fileName = target.val();
				var titleInput = $("input[name=title]", place);
				if(titleInput.hasClass("notEdited") || !titleInput.val()) {
					titleInput.val(fileName);
				}
				titleInput.removeClass("notEdited"); // allow editing on this element.
			});
		},
		iFrameLoader: function(iframeName, fileName, place, workspace, tiddler) {
				var iframe = document.getElementById(iframeName); //jQuery doesn't seem to want to do this!?
				var locale = macro.locale;
				$(".userInput").addClass("notEdited"); // reset editing
				var finishedLoading = function() {
						displayMessage(locale.loadSuccess.format([fileName]));
						$.getJSON(config.macros.binaryUpload.fullURL + '/' + fileName + '.json', function(file) {
								config.macros.binaryUpload.displayFile(place, fileName, workspace, tiddler);
								$(iframe).remove();
						});
				}
				var iFrameLoadHandler = function() {
						finishedLoading.apply();
						return;
				}
				
				iframe.onload = iFrameLoadHandler;
				//IE
				completeReadyStateChanges = 0;
				iframe.onreadystatechange = function() {
						if (++(completeReadyStateChanges) == 3) {
								iFrameLoadHandler();
						}
				}
		},
		displayFile: function(place, title, workspace, tiddler) {
				var adaptor = tiddler.getAdaptor();
				var context = {
					workspace: workspace
				};
				adaptor.getTiddler(title, context, null, function(context) {
					if(context.status) {
						store.addTiddler(context.tiddler);
						story.displayTiddler(place, title);
					} else {
						displayMessage(locale.loadError.format([title]));
					}
				});
		}
}
})(jQuery);
//}}}

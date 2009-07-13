/*
tiddlypad.js

Unobtrusive text editting

Copyright (c) UnaMesa Association 2009

Triple licensed under the BSD, MIT and GPL licenses:
  http://www.opensource.org/licenses/bsd-license.php
  http://www.opensource.org/licenses/mit-license.php
  http://www.gnu.org/licenses/gpl.html
*/

if(!$.tiddlypad) {
	$.tiddlypad = {};
}

$.tiddlypad.styles = {
	toolbar: {
		'display': 'none',
		'padding': '8px',
		'border': '1px solid #888',
		'background-color': '#aaa',
		'color': '#000',
		'position': 'absolute',
		'top': '1em',
		'right': '1em'
	},
	button: {
		'padding': '2px',
		'margin-right': '4px',
		'border': '1px solid white',
		'background-color': '#000',
		'color': '#fff',
		'cursor': 'pointer'
	},
	buttonHover: {
		'background-color': 'red'
	},
	buttonNoHover: {
		'background-color': 'black'
	},
	editorWrapper: {
		'position': 'absolute',
		'left': '0em',
		'top': '0em',
		'right': '0em',
		'bottom': '0em'
	},
	lightbox: {
		'position': 'absolute',
		'left': '0em',
		'top': '0em',
		'right': '0em',
		'bottom': '0em',
		'background-color': 'black',
		'opacity': '0.7'
	},
	textarea: {
		'position': 'absolute',
		'left': '2em',
		'top': '1em',
		'right': '2em',
		'bottom': '1em'
	}
};

// Return the pathname of the document in a form that twFile can understand
$.tiddlypad.getPath = function() {
	var path = document.location.pathname;
	var startpos = 0;
	if(path.charAt(2) == ":") {
		startpos = 1;
		path = path.replace(new RegExp("/","g"),"\\")
	}
	return unescape(path.substring(startpos));
};
	
// Initiate edit mode
$.tiddlypad.startEdit = function() {
	var errMsg = null;
	var content = $.twFile.load($.tiddlypad.getPath());
	if(content == null)
		errMsg = "Can't load previous content of file";
	else {
		$.tiddlypad.createEditor(content);
		$.tiddlypad.editButton.hide();
		$.tiddlypad.doneButton.show();
		$.tiddlypad.cancelButton.show();
	}
	if(errMsg != null)
		alert("Error: " + errMsg);
};

// Create the editor overlay
$.tiddlypad.createEditor = function(text) {
	var wrapper = $("<div></div>").css($.tiddlypad.styles.editorWrapper).hide().appendTo("body");
	var lightbox = $("<div></div>").css($.tiddlypad.styles.lightbox).appendTo(wrapper);
	var editor = $("<textarea></textarea>").css($.tiddlypad.styles.textarea).val(text).appendTo(wrapper);
	wrapper.slideDown();
};

$(function() {

	var createToolbarButton = function (toolbar,title) {
		return $("<span>" + title + "</span>").css($.tiddlypad.styles.button).hover(function () {
				$(this).css($.tiddlypad.styles.buttonHover);
			}, function () {
				$(this).css($.tiddlypad.styles.buttonNoHover);
			}).appendTo(toolbar);
	};

	var toolbar = $("<div></div>").css($.tiddlypad.styles.toolbar).appendTo("body");
	$.tiddlypad.editButton = createToolbarButton(toolbar,"Edit").click(function() {$.tiddlypad.startEdit();});
	$.tiddlypad.doneButton = createToolbarButton(toolbar,"Done").hide();
	$.tiddlypad.cancelButton = createToolbarButton(toolbar,"Cancel").hide();
	toolbar.fadeIn(400);
	
});
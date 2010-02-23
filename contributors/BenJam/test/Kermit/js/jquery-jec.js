/**
 * jQuery jEC (jQuery Editable Combobox) 1.0.0RC
 * http://code.google.com/p/jquery-jec
 * http://plugins.jquery.com/project/jEC
 *
 * Copyright (c) 2008 Lukasz Rajchel (lukasz@rajchel.pl | http://lukasz.rajchel.pl)
 * Dual licensed under the MIT (http://www.opensource.org/licenses/mit-license.php)
 * and GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * Documentation	:	http://code.google.com/p/jquery-jec/wiki/Documentation
 * Changelog:		:	http://code.google.com/p/jquery-jec/wiki/Changelog
 */

/*global document, jQuery*/
(function ($) {

	// jEC Core class
	$.jecCore = {
	
		// default options
		defaults: {
			position: 0,
			classes: '',
			styles: {},
			pluginClass: 'jecEditableOption',
			focusOnNewOption: false,
			useExistingOptions: false,
			ignoredKeys: [],
			acceptedRanges: [
				{min: 32, max: 126},
				{min: 191, max: 382}
			]
		},
		
		// options
		options: {},
		
		// values
		values: {},
		
		// IE hacks
		ieHacks: function () {
			// IE doesn't implement indexOf() method
			if ($.browser.msie && Array.prototype.indexOf === undefined) {
				Array.prototype.indexOf = function (object) {
	
					for (var i = 0; i < this.length; i += 1) {
						if (this[i] === object) {
							return i;
						}
					}
					return -1;
				};
			}
		},
		
		// clone object
		clone: function (obj) {
			if (obj === null || typeof(obj) !== 'object') {
				return obj;
			}
			
			var temp = new obj.constructor(), key;
			
			for (key in obj) {
				if (key !== undefined) {
					temp[key] = $.jecCore.clone(obj[key]);
				}
			}
			
			return temp;
		},
		
		// returns key code
		getKeyCode: function (event) {
			if (typeof(event.charCode) !== 'undefined' && event.charCode !== 0) {
				return event.charCode;
			} else {
				return event.keyCode;
			}
		},
		
		// special keys codes
		specialKeys: [46, 37, 38, 39, 40],
		
		lastKeyCode: null,
		
		// sets editable option to the value of currently selected option
		setEditableOption: function (elem) {
			var options = $.jecCore.options['id' + elem.attr('jec')];
			elem.children('option.' + options.pluginClass).val(elem.children('option:selected').text());
		},
		
		generateId: function () {
			// find unique identifier
			while (true) {
				var random = Math.floor(Math.random() * 100000);
				
				if (typeof($.jecCore.options['id' + random]) === 'undefined') {
					return random;
				}
			}
		},
		
		// keydown event handler
		// handles keys pressed on select (backspace and delete must be handled
		// in keydown event in order to work in IE)
		jecKeyDown: function (event) {
			var keyCode, option, value, options;
	
			options = $.jecCore.options['id' + $(this).attr('jec')];
			keyCode = $.jecCore.getKeyCode(event);
			$.jecCore.lastKeyCode = keyCode;

			switch (keyCode) {
			case 8:	// backspace
			case 46: // delete
				option = $(this).children('option.' + options.pluginClass);
				if (option.val().length >= 1) {
					value = option.val().substring(0, option.val().length - 1);
					option.val(value).text(value).attr('selected', 'selected');
				}
				return (keyCode !== 8);
			default:
				break;
			}
		},
		
		// keypress event handler
		// handles the rest of the keys (keypress event gives more informations
		// about pressed keys)
		jecKeyPress: function (event) {
			var keyCode, keyValue, i, option, value, validKey, options;
	
			options = $.jecCore.options['id' + $(this).attr('jec')];
			keyCode = $.jecCore.getKeyCode(event);

			if (keyCode !== 9) {
				// handle special keys
				for (i = 0; i < $.jecCore.specialKeys.length; i += 1) {
					if (keyCode === $.jecCore.specialKeys[i] && keyCode === $.jecCore.lastKeyCode) {
						return;
					}
				}

				// don't handle ignored keys
				if (options.ignoredKeys.indexOf(keyCode) === -1) {
					// remove selection from all options
					$(this).children(':selected').removeAttr('selected');

					keyValue = '';
					// iterate through valid ranges
					for (validKey in options.acceptedRanges) {
						// the range can be either a min,max tuple or exact value
						if ((typeof(options.acceptedRanges[validKey].exact) !== 'undefined' &&
								options.acceptedRanges[validKey].exact === keyCode) ||
							(typeof(options.acceptedRanges[validKey].min) !== 'undefined' &&
								typeof(options.acceptedRanges[validKey].max) !== 'undefined' &&
								keyCode >= options.acceptedRanges[validKey].min &&
								keyCode <= options.acceptedRanges[validKey].max)) {
							keyValue = String.fromCharCode(keyCode);
						}
					}

					// add key value to proper option tag
					option = $(this).children('option.' + options.pluginClass);
					value = option.val() + keyValue;
					option.val(value).text(value).attr('selected', 'selected');
				}
				
				return false;
			}
		},
		
		// change event handler
		jecChange: function () {
			$.jecCore.setEditableOption($(this));
		},
		
		// sets combobox
		setup: function (elem) {
			var options, editableOption, i;
			options = $.jecCore.options['id' + elem.attr('jec')];
			
			if (typeof(options) !== 'undefined') {
				// add editable option tag if not exists
				if (elem.children(options.pluginClass).length === 0) {
					editableOption = $(document.createElement('option'));
					editableOption.addClass(options.pluginClass);
	
					// add passed CSS classes
					if (typeof(options.classes) === 'string') {
						editableOption.addClass(options.classes);
					} else if (typeof(options.classes) === 'object') {
						for (i = 0; i < options.classes.length; i += 1) {
							editableOption.addClass(options.classes[i]);
						}
					}
	
					// add passed CSS styles
					if (typeof(options.styles) === 'object') {
						for (i = 0; i < options.styles.length; i += 1) {
							editableOption.append(options.styles[i]);
						}
					}
	
					// insert created element on correct position
					if (elem.children().eq(options.position).length !== 0) {
						elem.children().eq(options.position).before(editableOption);
					} else {
						elem.append(editableOption);
					}
					
					// handle new option's focus
					if (options.focusOnNewOption) {
						editableOption.attr('selected', 'selected');
					}
				}
	
				elem.bind('keydown', $.jecCore.jecKeyDown);
				elem.bind('keypress', $.jecCore.jecKeyPress);
	
				// handles 'useExistingOptions = true' behavior
				if (options.useExistingOptions) {
					$.jecCore.setEditableOption(elem);
					elem.bind('change', $.jecCore.jecChange);
				}
			}
		},
	
		// create editable combobox
		init: function (settings) {
	
			$.jecCore.ieHacks();
	
			return $(this).filter('select:not([jec])').each(function () {
	
				var random;
				random = $.jecCore.generateId();
			
				// override passed default options
				$.jecCore.options['id' + random] = $.extend($.jecCore.clone($.jecCore.defaults), settings);
				
				// add unique id
				$(this).attr('jec', random);
	
				$.jecCore.setup($(this));
			});
		},
		
		// destroys editable combobox
		destroy: function () {
			return $(this).filter('select[jec]').each(function () {
				$(this).jecOff();
				$(this).removeAttr('jec');
			});
		},
		
		// enable editablecombobox
		enable: function () {
			return $(this).filter('select[jec]').each(function () {
				$.jecCore.setup($(this));
				var value = $.jecCore.values['id' + $(this).attr('jec')];
				
				if (value !== undefined) {
					$(this).jecValue(value);
				}
			});
		},
		
		// disable editable combobox
		disable: function () {
			return $(this).filter('select[jec]').each(function () {
				var id, options;
				id = 'id' + $(this).attr('jec');
				options = $.jecCore.options[id];
				$.jecCore.values[id] = $(this).children('option.' + options.pluginClass).val();
				
				$(this).children('option.' + options.pluginClass).remove();
				$(this).unbind('keydown', $.jecCore.jecKeyDown);
				$(this).unbind('keypress', $.jecCore.jecKeyPress);
				
				if (options !== null && options.useExistingOptions) {
					$(this).unbind('change', $.jecCore.jecChange);
				}
			});
		},
		
		// gets or sets editable option's value
		value: function (value, setFocus) {
			var options = $.jecCore.options['id' + $(this).attr('jec')];
			
			if (typeof(value) === 'undefined' || value === null) {
				// get value
				return $(this).children('option.' + options.pluginClass).val();
			} else if (typeof(value) === 'string' || typeof(value) === 'number') {
				// set value
				return $(this).filter('select').each(function () {
					var option = $(this).children('option.' + options.pluginClass);
					option.val(value).text(value);
					if (typeof(setFocus) !== 'boolean' || setFocus) {
						option.attr('selected', 'selected');
					}
				});
			}
		}
	};

 	// register editableCombobox() jQuery function
	$.fn.extend({
		jec: $.jecCore.init,
		jecOn: $.jecCore.enable,
		jecOff: $.jecCore.disable,
		jecKill: $.jecCore.destroy,
		jecValue: $.jecCore.value,
		// deprecated
		editableCombobox: $.jecCore.init		
	});

})(jQuery);
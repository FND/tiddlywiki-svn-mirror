/***
|''Name''|EncryptionPlugin|
|''Description''|encrypts tiddlers|
|''Author''|FND|
|''Version''|0.1.0|
|''Status''|@@experimental@@|
|''Source''|http://svn.tiddlywiki.org/Trunk/contributors/FND/plugins/EncryptionPlugin.js|
|''CodeRepository''|http://svn.tiddlywiki.org/Trunk/contributors/FND/|
|''License''|[[BSD|http://www.opensource.org/licenses/bsd-license.php]]|
|''CoreVersion''|2.5.0|
|''Requires''|[[Gibberish AES]]|
|''Keywords''|encryption security accessControl|
!Notes
requires [[Gibberish AES|http://github.com/markpercival/gibberish-aes]] (MIT License) or an equivalent algorithm/API
!Revision History
!!v0.1 (2010-05-31)
* initial release
!TODO
* decrypt all
* encryption-aware search (i.e. decrypt all beforehand)
* password categories (also required for decrypt all)?
* password confirmation (second input field)
!StyleSheet
.TiddlerEncryptionPlugin {
	background-color: [[ColorPalette::TertiaryPale]];
}
!HTMLForm
<form class="TiddlerEncryptionPlugin" action="#">
	<fieldset>
		<legend />
		<dl>
			<dt>Password:</dt>
			<dd><input type="password" name="password" /></dd>
		</dl>
		<p class="annotation" />
		<input type="submit" />
		<input type="button" />
	</fieldset>
</form>
!Code
***/
//{{{
(function($) {

if(!window.GibberishAES) {
	throw "Missing dependency: Gibberish AES";
}

var cmd = config.commands;
var keyCache = {};

var plugin = config.extensions.encryptionPlugin = {
	locale: {
		formLabel: "Enter Password",
		submitLabel: "Confirm",
		cancelLabel: "Cancel",
		resetInfo: "all tiddlers have been re-encrypted",
		passwordError: "Error: invalid password",
		decryptionError: "Error: decryption failed"
	},
	timeout: 5 * 60 * 1000,
	name: store.getTiddlerText(tiddler.title + "::Name"),
	formTemplate: store.getTiddlerText(tiddler.title + "##HTMLForm"),

	init: function() {
		// hijack saveChanges to re-encrypt decrypted tiddlers
		var _saveChanges = saveChanges;
		saveChanges = function(onlyIfDirty, tiddlers) {
			$.each(keyCache, function(title, cipherKey) {
				plugin.cryptoToggle(title, cipherKey, "encrypt");
			});
			var status = _saveChanges.apply(this, arguments);
			$.each(keyCache, function(title, cipherKey) {
				plugin.cryptoToggle(title, cipherKey, "decrypt");
			});
			return status;
		};

		// hijack isReadOnly to take into account encryption status
		var _isReadOnly = Tiddler.prototype.isReadOnly;
		Tiddler.prototype.isReadOnly = function() {
			return _isReadOnly.apply(this, arguments) || plugin.isEncrypted(this);
		};

		// hijack removeTiddler to clear cache
		var _removeTiddler = TiddlyWiki.prototype.removeTiddler;
		TiddlyWiki.prototype.removeTiddler = function(title) {
			delete keyCache[title];
			return _removeTiddler.apply(this, arguments);
		};

		// augment tiddler toolbars with crypto commands
		config.shadowTiddlers.ToolbarCommands = config.shadowTiddlers.ToolbarCommands.
			replace(/(\+?editTiddler)/g, "encryptTiddler decryptTiddler $1").
			replace(/(\+?saveTiddler)/g, "encryptTiddler $1");

		// register style sheet
		var name = "StyleSheet" + this.name;
		config.shadowTiddlers[name] = store.getTiddlerText(tiddler.title + "##StyleSheet");
		store.addNotification(name, refreshStyles);
	},
	uiPrompt: function(src, callback) {
		var pos = $(src).offset();
		$(this.formTemplate).submit(this.uiSubmit).
			find("legend").text(this.locale.formLabel).end().
			find(".annotation").hide().end().
			find("[type=submit]").val(this.locale.submitLabel).end().
			find("[type=button]").val(this.locale.cancelLabel).
				click(this.uiCancel).end().
			data("callback", callback).
			hide().appendTo(document.body).
			offset(pos).css({ position: "absolute" }).show().
			find("[name=password]").focus();
	},
	uiSubmit: function(ev) {
		var form = $(this).closest("form");
		var password = form.find("[name=password]").val();
		var callback = form.data("callback");
		var status = password ? callback(password) : false;
		if(status && password) {
			form.remove();
		} else {
			var msg = password ? "decryptionError" : "passwordError";
			var el = $("[name=password]", form).addClass("error").focus(function(ev) {
				el.removeClass("error").unbind(ev.originalEvent.type).
					closest("form").find(".annotation").slideUp();
			});
			$(".annotation", form).html(plugin.locale[msg]).slideDown();
		}
		return false;
	},
	uiCancel: function(ev) {
		$(this).closest("form").remove();
	},
	resetTimer: function() {
		if(this.timer) {
			clearTimeout(this.timer);
		}
		this.timer = setTimeout(this.reEncryptAll, this.timeout);
	},
	reEncryptAll: function() {
		$.each($.extend({}, keyCache), function(title, cipherKey) {
			plugin.cryptoToggle(title, cipherKey, "encrypt");
			delete keyCache[title];
			if(!story.isDirty(title)) { // XXX: potential security risk
				story.refreshTiddler(title, null, true);
			}
		});
		displayMessage(plugin.locale.resetInfo);
	},
	cryptoToggle: function(title, cipherKey, mode) { // TODO: DRY; cf. encryptTiddler
		var tiddler = store.getTiddler(title);
		var body = tiddler && cipherKey ?
			plugin[mode](tiddler.text, cipherKey) : false;
		if(body) {
			tiddler.text = body;
			tiddler.fields.encrypted = mode == "encrypt" ? "true" : "suspended";
			return true;
		} else {
			return false;
		}
	},
	isEncrypted: function(tiddler) {
		return tiddler && tiddler.fields.encrypted == "true";
	},
	encrypt: function(str, key) {
		return GibberishAES.enc(str, key);
	},
	decrypt: function(str, key) {
		try {
			return GibberishAES.dec(str, key);
		} catch(exc) {
			return false;
		}
	}
};

cmd.encryptTiddler = {
	text: "encrypt",
	tooltip: "save tiddler in encrypted form",
	hideReadOnly: true,

	isEnabled: function(tiddler) {
		return !plugin.isEncrypted(tiddler) || keyCache[tiddler.title];
	},
	handler: function(ev, src, title) {
		var tid = story.findContainingTiddler(src);
		var txt = $("[edit=text]", tid);
		if(txt.length) { // edit mode
			var self = this;
			var args = arguments;
			var callback = function(cipherKey) {
				var title = $("[edit=title]", tid).val();
				var val = txt.val();
				txt.val(plugin.encrypt(val, cipherKey));
				cmd.saveTiddler.handler.apply(self, args); // XXX: more trouble than it's worth?
				store.getTiddler(title).fields.encrypted = "true";
				story.refreshTiddler(title, null, true);
				return true;
			};
			plugin.uiPrompt(src, callback);
		} else { // view mode -- XXX: is only re-encrypt; should be separate command
			var status = plugin.cryptoToggle(title, keyCache[title], "encrypt");
			if(status) {
				delete keyCache[tiddler.title];
				story.refreshTiddler(title, null, true);
			}
		}
		return false;
	}
};

cmd.decryptTiddler = {
	text: "decrypt",
	tooltip: "decrypt tiddler",

	isEnabled: plugin.isEncrypted, // TODO: disable in edit mode!?
	handler: function(ev, src, title) {
		var tiddler = store.getTiddler(title);
		var callback = function(cipherKey) {
			var body = plugin.decrypt(tiddler.text, cipherKey);
			if(body) {
				tiddler.text = body;
				tiddler.fields.encrypted = "suspended";
				keyCache[tiddler.title] = cipherKey;
				story.refreshTiddler(title, null, true);
				plugin.resetTimer();
				return true;
			} else {
				return false;
			}
		};
		plugin.uiPrompt(src, callback);
		return false;
	}
};

plugin.init();

})(jQuery);
//}}}

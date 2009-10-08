//{{{
function loadDependency(title, uri, options) {
	if(!confirm(tiddler.title + " loading dependency " + title)) { // TODO: i18n
		return false;
	}
	// TODO: support for non-raw (i.e. adaptor-based) imports
	options = options || {};
	var callback = function(status, context, responseText, uri, xhr) {
		if(status) {
			var t = options.baseTiddler || new Tiddler(title);
			t.fields = t.fields || config.defaultCustomFields;
			if(options.plugin) {
				t.tags.pushUnique("systemConfig");
				t.text = "//{{{\n" + responseText + "\n//}}}";
			} else {
				t.text = responseText;
			}
			store.saveTiddler(t.title, t.title, t.text, t.modifier, t.modified,
				t.tags, t.fields, false, t.created);
			if(options.plugin) {
				saveChanges(true);
				var loc = window.location.toString();
				window.location = loc.substr(0, loc.lastIndexOf("?"));
			}
		} else {
			displayMessage("failed to load depenency " + title);
		}
	};
	var req = httpReq("GET", uri, callback, null, null, null, null, null, null, true);
}
//}}}

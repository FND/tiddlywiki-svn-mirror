// ---------------------------------------------------------------------------------
// Convert URI encoding to Utf-8 for getLocalPath
// ---------------------------------------------------------------------------------
/***
Assign correct encode of file system to config.options.txtFsEncode, 
in order to save document to non-asscii path and/or file name on Gecko-based browsers (for Windows).
For example, setting config.options.txtFsEncode to "BIG5" for Trad. Chinese Windows XP.
***/
if (window.Components) {
	var getLocalPath_ori=getLocalPath;
	getLocalPath = function(s) {return getLocalPath_ori(mozConvertUriToUTF8(s));}
}

function mozConvertUriToUTF8(s) {
	if (window.netscape == undefined || config.options.txtFsEncode == undefined || config.options.txtFsEncode == "" )
		return s;
	try {
		netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");
	}
	catch(e) {
		return s;
		}
	var converter = Components.classes["@mozilla.org/intl/utf8converterservice;1"].getService(Components.interfaces.nsIUTF8ConverterService);
	var u = converter.convertURISpecToUTF8(s, config.options.txtFsEncode);
	return u;
}

/***
!Description

Strips spaces from items being saved in the cookie to prevent errors. 

!Code
***/

//{{{

(function() {

var _saveOptionCookie = saveOptionCookie;
saveOptionCookie = function(name) {
	arguments[0] = name.replace(/[()\s]/g, "_");
	return _saveOptionCookie.apply(this, arguments);
};

})();
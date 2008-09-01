(function($) {

	$.fn.require = function(name, version) {
		$.fn.require.required.push({'name': name, 'version': version});
	};
	
	$.fn.require.version = '0.0.1';
	$.fn.require.name = 'jQuery.require';
	$.fn.require.description = 'A simple dependancy library.';
	$.fn.require.required = [];
	$.fn.require.present = [];
	$.fn.require.missing = [];

	$.fn.require.detect = function() {

		// compile a list of what os present and what os missing				
		$($.fn.require.required).each(function(i,n){
			if($.fn.jw[n.name]) {
				$.fn.require.present.push(n);
			} else if ($.fn[n.name]) {
				$.fn.require.present.push(n);
			} else {
				console.log('Not included: ', n.name);
				$.fn.require.missing.push(n);
			}
		});
		
		// Check that our versions are up-to-date.
		$($.fn.require.present).each(function(i,n){
			var v = $.fn.jw[n.name] ? $.fn.jw[n.name].version : $.fn[n.name].version ;
			if(n.version && v) {
				// console.log('required version of:'+ n.name +' ', n.version);
				if(satifactory(v, n.version)) {
					console.log('Pesent and correct: ', n.name);
				} else {
					console.log('Needs updating: ', n.name);
				}
			}
		});
	};
	
	// Internal function to do some version maths
	function satifactory(version, min) {
		var m = min.split('.');
		var v = version.split('.');
		for (var i=0; i < m.length; i++) {
			m[i] = parseInt(m[i]);
		};
		for (var i=0; i < v.length; i++) {
			v[i] = parseInt(v[i]);
		};
		if(v[0] > m[0]) { return true; }
		else if (v[0] == m[0] && v[1] > m[1]) { return true; }
		else if (v[0] == m[0] && v[1] == m[1] && v[2] >= m[2]) { return true; }
		else { return false; }
	}

	// This might have dependancies too!
	// $(document).require('lightBox');

})(jQuery);

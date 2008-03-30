/***
requires DateChooser
***/
//{{{
merge(config.macros, {
	dateChooser: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {
			var dateFormat = 'DD MMM, YYYY'; // TODO, make configurable
			var curVal = tiddler.fields['mgtd_date'];
			var dateBox = createTiddlyElement(place,'input',null,'dateBox');
			dateBox.DateChooser = new DateChooser();
			if (curVal) {
				var startDate = Date.convertFromYYYYMMDDHHMM(curVal);
				dateBox.value = startDate.formatString(dateFormat);
				dateBox.DateChooser.setStartDate(startDate);
			}
			dateBox.onfocus = dateBox.DateChooser.display;
			dateBox.DateChooser.setUpdateFunction(function(objDate) {
				dateBox.value = objDate.formatString(dateFormat);
				tiddler.fields['mgtd_date'] = objDate.convertToYYYYMMDDHHMM();
			});
		}
	}
});

//}}}


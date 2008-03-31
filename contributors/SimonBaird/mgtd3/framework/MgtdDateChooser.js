/***
requires DateChooser
***/
//{{{
merge(config.macros, {
	dateChooser: {
		handler: function(place,macroName,params,wikifier,paramString,tiddler) {

			var useTiddler = tiddler;
			if (params[0])
				useTiddler = store.fetchTiddler(params[0]);

			var dateFormat = 'DD MMM, YYYY'; // TODO, make configurable
			var curVal = useTiddler.fields['mgtd_date'];
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
				useTiddler.fields['mgtd_date'] = objDate.convertToYYYYMMDDHHMM();
				// do all the housekeeping for a changed tiddler...
				store.notify(useTiddler.title,true);
				store.setDirty(true);
				useTiddler.changed();
				store.incChangeCount(useTiddler.title);
			});
		}
	}
});

//}}}


//{{{
//For demonstration purposes only
// A port of a plugin by Simon Baird to use DatePicker library
//requires DatePicker: http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/libraries/DatePicker.js

// some additions by Simon Baird

if (DatePicker){
    merge(config.macros, {
        dateChooser: {
            handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    
                var useTiddler = tiddler;
                if (params[0])
                    useTiddler = store.fetchTiddler(params[0]);
    
                var curVal = useTiddler.fields['mgtd_date'] || undefined;
                var startDate = curVal ? Date.convertFromYYYYMMDDHHMM(curVal) : null;

                var dateBox = createTiddlyElement(place,'input',null,'dateBox');            

                var dateFormat = config.mGTD.getOptTxt('ticklerdateformat');
				var defaultDateFormat = 'ddd, DD-mmm-YY';
				if (!dateFormat) {
					// makes it nicer for upgraders who don't have a format set
					dateFormat = defaultDateFormat;
					config.mGTD.setOptTxt('ticklerdateformat', defaultDateFormat);
				}
                dateBox.value = startDate ? startDate.formatString(dateFormat) : '(set date)';
    
                var callback = function(el,objDate){
                    el.value = objDate.formatString(dateFormat);
					store.setValue(useTiddler, 'mgtd_date',objDate.convertToYYYYMMDDHHMM());
                }
                DatePicker.create(dateBox,startDate,callback);
            }
        },

		addDay: {
			label:   {addDay:"+d", addWeek:"+w",  addMonth:"+m",   addYear:"+y"},
			tooltip: {addDay:"day",addWeek:"week",addMonth:"month",addYear:"year"},
            handler: function(place,macroName,params,wikifier,paramString,tiddler) {
                var useTiddler = tiddler;
                if (params[0]) useTiddler = store.fetchTiddler(params[0]);
                var curVal = useTiddler.fields['mgtd_date'] || undefined;
                var curDate = curVal ? Date.convertFromYYYYMMDDHHMM(curVal) : new Date();    
				// ensure ticklers activate at midnight on their day since new Date() has minutes
				curDate.setHours(0);
				curDate.setMinutes(0);
				curDate.setSeconds(0); 
				// call the suitable date method. happens to match the macroname. see MgtdDateUtils. sorry for confusing code.
				curDate[macroName](1);
				createTiddlyButton(place,config.macros.addDay.label[macroName],"add a "+config.macros.addDay.tooltip[macroName],function() {
					store.setValue(useTiddler, 'mgtd_date',objDate.convertToYYYYMMDDHHMM());
					return false;
				});

			}
		}
    });
}

config.macros.addWeek  = config.macros.addDay;
config.macros.addMonth = config.macros.addDay;
config.macros.addYear  = config.macros.addDay;
//}}}

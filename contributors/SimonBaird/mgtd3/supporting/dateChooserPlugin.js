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
                var startDate = curVal ? Date.convertFromYYYYMMDDHHMM(curVal) : new Date();    
                var dateBox = createTiddlyElement(place,'input',null,'dateBox');            

                var dateFormat = 'ddd, DD-mmm-YY'; // TODO, make configurable
                dateBox.value = startDate.formatString(dateFormat);
    
                var callback = function(el,objDate){
                    el.value = objDate.formatString(dateFormat);
                    useTiddler.fields['mgtd_date'] = objDate.convertToYYYYMMDDHHMM();
					useTiddler.touch();	// see MgtdDateUtils
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
				// call the suitable date method. happens to match the macroname. see MgtdDateUtils. sorry for confusing code.
				curDate[macroName](1);
				createTiddlyButton(place,config.macros.addDay.label[macroName],"add a "+config.macros.addDay.tooltip[macroName],function() {
                    useTiddler.fields['mgtd_date'] = curDate.convertToYYYYMMDDHHMM();
					useTiddler.touch();	// see MgtdDateUtils
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

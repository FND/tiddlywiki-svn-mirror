//{{{
//For demonstration purposes only
// A port of a plugin by Simon Baird to use DatePicker library
//requires DatePicker: http://svn.tiddlywiki.org/Trunk/contributors/SaqImtiaz/libraries/DatePicker.js
if (DatePicker){
    merge(config.macros, {
        dateChooser: {
            handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    
                var useTiddler = tiddler;
                if (params[0])
                    useTiddler = store.fetchTiddler(params[0]);
    
                var curVal = useTiddler.fields['mgtd_date']|| undefined;
                var startDate = curVal? Date.convertFromYYYYMMDDHHMM(curVal) : new Date();    
                var dateBox = createTiddlyElement(place,'input',null,'dateBox');            

                var dateFormat = 'ddd, DD-mmm-YY'; // TODO, make configurable
                dateBox.value = startDate.formatString(dateFormat);
    
                var callback = function(el,objDate){
                    el.value = objDate.formatString(dateFormat);
                    useTiddler.fields['mgtd_date'] = objDate.convertToYYYYMMDDHHMM();
                    // do all the housekeeping for a changed tiddler...
                    store.notify(useTiddler.title,true);
                    store.setDirty(true);
                    useTiddler.changed();
                    store.incChangeCount(useTiddler.title);
                }
                DatePicker.create(dateBox,startDate,callback);
            }
        }
    });
}
//}}}


config.macros.autoSave = {

  getMetaData: function(title,extField){
    extField = extField.toLowerCase();
    var tiddler =  store.getTiddler(title);
    if(!tiddler) {
      return false;
    }
    else{
      if(!tiddler.fields[extField]){
        return false;
      }
      else{
        return tiddler.fields[extField];
      }
    }
  },

  setMetaData: function(title,extField,extFieldVal){
    // console.log("saving",title,extField,extFieldVal);
    extField = extField.toLowerCase();
    if(extFieldVal == "null") {
      extFieldVal = "";
    }
    var tiddler =  store.getTiddler(title);
    if(!tiddler) {
      store.saveTiddler(title,title,null,true,null,[],config.defaultCustomFields,null);
      tiddler =  store.getTiddler(title);
    }
    store.setValue(tiddler,extField,extFieldVal); 

  },

  handler: function(place,macroName,params,wikifier,paramString,tiddler) {
    jQuery("input,textarea", place).blur(function(e) {
      config.macros.autoSave.setMetaData(tiddler.title, jQuery(this).attr("edit"), this.value)
    });
		story.setDirty(tiddler.title,false);
  }

}


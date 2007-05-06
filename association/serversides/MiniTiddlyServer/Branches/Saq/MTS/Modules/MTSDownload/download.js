var regexp = /<<saveChanges>>/i;
config.shadowTiddlers.SideBarOptions = config.shadowTiddlers.SideBarOptions.replace(regexp, "<<saveChanges>> <<mtsdownload>>");
config.shadowTiddlers.MTSDownloadPanel = '[[Right click on this link and select "Save As"|' + sourcePath + ']]';//
    
config.macros.mtsdownload = {
    label:"download »",
    prompt:"Download the wiki source"
};
config.macros.mtsdownload.handler = function (place,macroName,params,wikifier,paramString,tiddler) {
    config.macros.slider.handler(place, "slider", ["chkDownloadOpen","MTSDownloadPanel",this.label,this.prompt]);
}

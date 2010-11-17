/***
|''Requires''|TiddlyWebConfig|
***/

//{{{
(function($) {
    var callback = function(context, userParams) {
        if(!context.status) {
            return; // XXX: oughta do something
        }
        var tiddler = context.tiddler;
        var dirty = store.isDirty();
        store.setDirty(false);
        store.saveTiddler(tiddler.title, tiddler.title, tiddler.text,
            tiddler.modifier, tiddler.modified, tiddler.tgags, tiddler.fields,
            true, tiddler.created, tiddler.creator);
        store.setDirty(dirty);
    };

    try {
        var tiddler = store.getTiddler('LazyTiddlers');
        var adaptor = tiddler.getAdaptor();
        var tiddlers = tiddler.text.split("\n");
        var host = adaptor.fullHostName(tiddler.fields["server.host"]);

        $.each(tiddlers, function(i, tiddler) {
            var tiddler_info = tiddler.split(":");
            var bag = tiddler_info.shift();
            var title = tiddler_info.join(":");
            var context = {workspace: "bags/" + bag, host: host};
            adaptor.getTiddler(title, context, null, callback);
        });
    } catch(err) {} // Unable to get LazyTiddlers, don't do anything

})(jQuery);
//}}}
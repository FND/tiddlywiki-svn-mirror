RunOnce = {
    
    host : tiddler.title,
    
    disable : function(){
        store.suspendNotifications();
        store.setTiddlerTag(this.host,true,'systemConfigDisable');
        store.resumeNotifications();
    },
    
    old_restart : window.restart,
    
    init : function(){
        window.restart = function(){
            RunOnce.old_restart.apply(this,arguments);
            RunOnce.run();
            RunOnce.disable();
        }    
    },
    
    run : function(){
        story.displayTiddler(null,'home',1);
        config.macros.importWorkspace.getTiddlersForAllFeeds();    
    }
}

RunOnce.init();




// Create a shadow Tiddler // 
config.shadowTiddlers.MTSAdminPanel = "|<<mtsadduser>>|<<mtscreatewiki>>|\n|<<mtsuserlist>>|<<mtsdeletewiki>>|\n|<<mtsrevert>>|<<mtsbackup>>|";

// Create a handle for the backstage //

if ( config.backstageTasks ) {

    config.backstageTasks.push("MTSAdmin");
    config.tasks.MTSAdmin = {
        text: "MTS Admin", 
        tooltip: "MTS Controls and Admin Panel", 
        content: ""
    }

    //config.backstageTasks = ["save", "tidy","sync","importTask","copy","tweak","plugins"];


    for (var i in config.backstageTasks) {
        if (config.backstageTasks[i] == "save")
            config.backstageTasks.splice(i,6);
    }


    var adminOldIn = adminLoggedIn;
    adminLoggedIn = function () {
        adminOldIn.apply(this,arguments);
        config.tasks.MTSAdmin.content = config.shadowTiddlers.MTSAdminPanel
    }

    var adminOldOut = adminLoggedOut;
    adminLoggedOut = function () {
        adminOldOut.apply(this,arguments);
        config.tasks.MTSAdmin.content = "Please log in as an admin before accessing this panel";
    }

    if (isAdmin)
        adminLoggedIn();
    else
        adminLoggedOut();

}

/*
// Will only have one instance, or should anyway // 
config.macros.mtsadminpanel = {
    
};
config.macros.mtsadminpanel.handler = function(place, name, params) {

    config.macros.mtsadminpanel.place = place;
    
    if (isAdmin)
        login();
    else
        logout();
    
};
config.macros.mtsadminpanel.logout = function () {
    if ( saved )
        saved.parentNode.removeChild(saved);
    
    wikify(store.getTiddlerText("MTSAdminPanel"), config.macros.mtsadminpanel.place);
    config.macros.mtsadminpanel.saved = config.macros.mtsadminpanel.place.lastChild;
    
};
config.macros.mtsadminpanel.login = function () {
    if ( saved )
        saved.parentNode.removeChild(saved);
    
    wikify(store.getTiddlerText("MTSAdminPanel"), config.macros.mtsadminpanel.place);
    config.macros.mtsadminpanel.saved = config.macros.mtsadminpanel.place.lastChild;

};

*/
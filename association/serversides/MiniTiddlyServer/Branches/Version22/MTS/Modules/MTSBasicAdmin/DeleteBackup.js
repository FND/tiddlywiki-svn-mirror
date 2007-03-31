

// HELLO // 
function deleteBackup(path) {

    var lpath = path;
    
    if ( isAdmin == false ) {
        alert("You must be an administrator to access this function ");
        return;
    }
    
    if (confirm("Delete Backup: Are you sure?") == false )
        return;

    if ( path.indexOf(".html") < 0 ) {
        alert("Error, backup filename not valid: " + revertTo);
        return;
    }
    
    singleMessage("Deleting Backup..");
    
    var ret = function (response) {
        displayMessage(lpath + " successfully deleted");
        var row = document.getElementById(lpath);
        row.parentNode.removeChild(row);
    }
    
    ajaxModuleEvent("DeleteBackupEvent",ret, {backupToDelete:path});
    
}

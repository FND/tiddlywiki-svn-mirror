//{{{

merge(config.macros.saveChanges,{
        label: "save",
        prompt: "Save the TiddlyResume",
        accessKey: "S"});

merge(config.macros.selectTheme,{
        label: "theme",
        prompt: "Change the style of the TiddlyResume"});

merge(config.commands.editTiddler,{
	text: "edit",
	tooltip: "Edit this section",
	readOnlyText: "view",
	readOnlyTooltip: "View the source of this section"});

merge(config.commands.saveTiddler,{
	text: "done",
	tooltip: "Save changes to this section"});

merge(config.commands.cancelTiddler,{
	text: "cancel",
	tooltip: "Undo changes to this section",
	warning: "Are you sure you want to abandon your changes to '%0'?",
	readOnlyText: "done",
	readOnlyTooltip: "View this section normally"});

merge(config.commands.deleteTiddler,{
	text: "delete",
	tooltip: "Delete this section",
	warning: "Are you sure you want to delete '%0'?"});

config.messages.backstage = {
        open: {text: "", tooltip: "Open the backstage area to perform authoring and editing tasks"},
        close: {text: "", tooltip: "Close the backstage area"},
        prompt: "backstage: ",
        decal: {
                edit: {text: "edit", tooltip: "Edit the tiddler '%0'"}
        }
};

//}}}

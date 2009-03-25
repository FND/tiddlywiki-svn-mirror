WikispacesSoapAdaptor.old_savecredentials_loginCallback = WikispacesSoapAdaptor.loginCallback;
WikispacesSoapAdaptor.loginCallback = function(r,x,context)//status,context,responseText,url,xhr)
{
	var status = r instanceof Error ? false : true;
	if(status){
		if(context.username != config.options.txtWikispacesUsername || context.password !=config.options.txtWikispacesPassword) {
			SaveServerCredentials.save(context.username,context.password);
		}
	}
	WikispacesSoapAdaptor.old_savecredentials_loginCallback.apply(this,arguments);
		
}

SaveServerCredentials = {
	save: function(user,pass){
		if (!config.options.chkSaveServerCredentials)
			return false;
		var text = "config.options.txtWikispacesUsername = '%0';\nconfig.options.txtWikispacesPassword = '%1'".format([user,pass]);
		store.suspendNotifications();
		store.saveTiddler("ServerCredentials","ServerCredentials",text,config.options.txtUserName,new Date(),["excludeLists","excludeSearch","excludeSync","systemConfig"],{},true,new Date());
		store.resumeNotifications();
	}
}

PasswordPrompt.old_prompt = PasswordPrompt.prompt;
PasswordPrompt.prompt= function(callback,context){
	this.old_prompt.apply(this,arguments);
	var dd = document.getElementById('passwordPromptSubmitDD');
	wikify("<<option chkSaveServerCredentials>> Remember me",dd);
};

config.options.chkSaveServerCredentials = true;


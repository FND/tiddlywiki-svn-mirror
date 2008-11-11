config.commands.revisions = {};
merge(config.commands.revisions,{
	text: "revisions",
	tooltip: "View another revision of this tiddler",
	loading: "loading...",
	done: "Revision downloaded",
	revisionTooltip: "View this revision",
	popupNone: "No revisions",
	revisionTemplate: "%0 r:%1 m:%2",
	dateFormat:"YYYY mmm 0DD 0hh:0mm"	
});

config.commands.deleteTiddlerHosted = {};
merge(config.commands.deleteTiddlerHosted,{
	text: "delete",
	tooltip: "Delete this tiddler",
	warning: "Are you sure you want to delete '%0'?",
	hideReadOnly: true,
	done: "Deleted "
});

config.macros.ccAbout={};
merge(config.macros.ccAbout,{
	buttonBackstageText:"about",
	buttonBackstageTooltip:"Find out more about ccTiddly ",
	stepAboutTitle:"About",
	stepAboutTextStart:"You are running ccTiddly ",
	stepAboutTextEnd:"More info about ccTiddly can be found  at <a  target=new href=http://www.tiddlywiki.org/wiki/CcTiddly>http://www.tiddlywiki.org/wiki/CcTiddly</a><br/><br/>  More information about TiddlyWiki can be found at <a target=new href=http://www.tiddlywiki.com>http://www.tiddlywiki.com</a><br/>"
});

function ccTiddlyAdaptor(){
}

merge(ccTiddlyAdaptor,{ 
	errorTitleNotSaved:"<h1>Your changes were NOT saved.</h1>", 
	errorTextSessionExpired:"Your Session has expired. <br /> You will need to log into the new window and then copy your changes from this window into the new window. ", 
	errorTextConfig:"There was a conflict when saving. <br /> Please open the page in a new window to see the changes.",
	errorTextUnknown:"An unknown error occured.",
	errorClose:"close",
	buttonOpenNewWindow:"Open a Window where I can save my changes	.... ",
	buttonHideThisMessage:"Hide this message", 
	msgErrorCode:"Error Code : "
});

config.macros.ccAdmin = {}
merge(config.macros.ccAdmin,{
	stepAddTitle:"Add a new Workspace Administrator",
	WizardTitleText:"Workspace Administration.",
	buttonDeleteText:"Delete Users",
	buttonDeleteTooltip:"Click to delete users.",
	buttonAddText:"Add User",
	buttonAddTooltip:"Click to add user.",
	buttonCancelText:"Cancel",
	buttonCalcelTooltip:"Calcel adding user.",
	buttonCreateText:"Make User Admin",
	buttonCreateTooltip:"Click to make user admin.",
	labelWorkspace:"Workspace: ",
	labelUsername:"Username  : ",
	stepErrorTitle:"You need to be an administrator of this workspace.",
	stepErrorText:"Permission Denied to edit workspace : ",
	stepNoAdminTitle:"There are no admins of this workspace.",
	stepManageWorkspaceTitle:"",
	listAdminTemplate: {
	columns: [	
		{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
		{name: 'Name', field: 'name', title: "Username", type: 'String'},	
		{name: 'Last Visit', field: 'lastVisit', title: "Last Login", type: 'String'}
	],
	rowClasses: [
		{className: 'lowlight', field: 'lowlight'}
	]}
	
});

function ccTiddlyAutoSave(){
	return this;
}

merge(ccTiddlyAutoSave,{
	msgSaved:"Saved ",
	msgError:"There was an error saving "
});

config.macros.ccCreateWorkspace = {}
merge(config.macros.ccCreateWorkspace, {
	wizardTitle:"Create Workspace",
	buttonCreateText:"create",
	buttonCreateWorkspaceText:"Create Workspace",
	buttonCreateTooltip:'Create new workspace',
	errorPermissions:"You do not have permissions to create a workspace.  You may need to log in.",
	msgPleaseWait:"Please wait, your workspace is being created.",
	msgWorkspaceAvailable:"Workspace name is available.",
	errorWorkspaceNameInUse:"Workspace name is already in use.",
	stepTitle:"Please enter workspace name",
	stepCreateHtml:"<input class='input' id='workspace_name' name='workspace_name' value='"+workspace+"' tabindex='1' /><span></span><input type='hidden' name='workspace_error'></input><h2></h2><input type='hidden' name='workspace_url'></input>"
});


config.macros.ccEditWorkspace={};	
merge(config.macros.ccEditWorkspace,{
WizardTitleText:"Edit Workspace Permissions",
stepEditTitle:null,
stepLabelCreate:'Create',
stepLabelRead:'Read',
stepLabelUpdate:'Edit',
stepLabelDelete:'Delete',
stepLabelPermission:'',
stepLabelAnon:'  Anonymous   ',
stepLabelUser:' Authenticated   ',
stepLabelAdmin:' Admin  ',
buttonSubmitCaption:"Update Workspace Permissions",
buttonSubmitToolTip:"Update workspace permissions",
button1SubmitCaption:"ok",
button1SubmitToolTip:"review permissions",
step2Error:"Error", 
errorTextPermissionDenied:"You do not have permissions to edit this workspace permissions.  You may need to log in.",
errorUpdateFailed:"Permissions Not changed"
});

config.macros.ccFile = {};

merge(config.macros.ccFile,{
	wizardTitleText:"Manage Files",
	wizardStepText:"Manage files in workspace ",
	buttonDeleteText:"Delete Files",
	buttonDeleteTooltip:"Click to Delete files.",
	buttonUploadText:"Upload File",
	buttonUploadTooltip:"Click to Upload files.",
	buttonCancelText:"Cancel",
	buttonCancelTooltip:"Click to cancel.",
	labelFiles:"Existing Files ",
	errorPermissionDeniedTitle:"Permission Denied",
	errorPermissionDeniedUpload:"You do not have permissions to create a file on this server. ",
	errorPermissionDeniedView:"You do not have permissions to view files in this workspace. ",
	listAdminTemplate: {
	columns: [	
	{name: 'wiki text', field: 'wikiText', title: "", type: 'WikiText'},
	{name: 'Selected', field: 'Selected', rowName: 'name', type: 'Selector'},
	{name: 'Name', field: 'name', title: "File", type: 'WikiText'},
	{name: 'Size', field: 'fileSize', title: "size", type: 'String'}
	],
	rowClasses: [
	{className: 'lowlight', field: 'lowlight'}
	]}
});


config.macros.ccLogin={sha1:true};

merge(config.macros.ccLogin,{
	WizardTitleText:null,
	usernameRequest:"Username",
	passwordRequest:"Password",
	stepLoginTitle:null,
	stepLoginIntroTextHtml:"<label>username</label><input name=username id=username tabindex='1'><br /><label>password</label><input type='password' tabindex='2' class='txtPassword'><input   name='password'>",
	stepDoLoginTitle:"Logging you in",
	stepDoLoginIntroText:"we are currently trying to log you in.... ",
	stepForgotPasswordTitle:"Password Request",
	stepForgotPasswordIntroText:"Please contact your system administrator or register for a new account.  <br /><input id='forgottenPassword' type='hidden' name='forgottenPassword'/>",
	stepLogoutTitle:"Logout",
	stepLogoutText:"You are currently logged in as ",
	buttonLogout:"logout",
	buttonLogoutToolTip:"Click here to logout.",
	buttonLogin:"Login",
	buttonlogin:"login",
	buttonLoginToolTip:"Click to Login.",	
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonForgottenPassword:"Forgotten Password",	
	buttonSendForgottenPassword:"Mail me a New Password",
	buttonSendForgottenPasswordToolTip:"Click here if you have forgotten your password",
	buttonForgottenPasswordToolTip:"Click to be reminded of your password",
	msgNoUsername:"Please enter a username", 
	msgNoPassword:"Please enter a password",
	msgLoginFailed:"Login Failed, please try again. ", 
	configURL:url+"/handle/login.php", 
	configUsernameInputName:"cctuser",
	configPasswordInputName:"cctpass",
	configPasswordCookieName:"cctPass"
});

config.macros.ccLoginStatus={};

merge(config.macros.ccLoginStatus,{
	textDefaultWorkspaceLoggedIn:"Viewing default workspace",
	textViewingWorkspace:"Viewing Workspace : ",
	textLoggedInAs:"Logged in as ",
	textNotLoggedIn:"You are not logged in.",
	textAdmin:"You are an Administrator."
});

config.macros.ccOptions={};	

merge(config.macros.ccOptions, {
	linkManageUsers:"users",
	linkPermissions:"permissions",
	linkFiles:"files",
	linkCreate:"create",
	linkOffline:"offline",
	linkStats:"statistics"
	
});

config.macros.register={};	
merge(config.macros.register,{
	usernameRequest:"username",
	passwordRequest:"password",
	passwordConfirmationRequest:"confirm password",
	emailRequest:"email",
	stepRegisterTitle:"Register for an account.",
	stepRegisterIntroText:"Hi, please register below.... ",
	stepRegisterHtml:"<label> username</label><input class='input' id='reg_username' name='reg_username' tabindex='1'/><span></span><input type='hidden'  name='username_error'></input><br /><label>email</label><input class='input' name=reg_mail id='reg_mail' tabindex='2'/><span> </span><input type='hidden' name='mail_error'></input><br/><label>password</label><input type='password' class='input' id='password1' name='reg_password1' tabindex='3'/><span> </span><input type='hidden'  name='pass1_error'></input><br/><label>confirm password</label><input type='password' class='input' id='password2' name='reg_password2' tabindex='4'/><span> </span><input type='hidden'  name='pass2_error'></input>",
	buttonCancel:"Cancel",
	buttonCancelToolTip:"Cancel transaction ",
	buttonRegister:"Register",	
	buttonRegisterToolTip:"click to register",
	msgCreatingAccount:"Attempting to create the account for you.", 
	msgNoUsername:"No username entered", 
	msgEmailOk:"Email address is OK.",
	msgNoPassword:"no password entered.",
	msgDifferentPasswords:"Your Passwords do not match.",
	msgUsernameTaken:"The username requested has been taken.",
	msgUsernameAvailable:"The username is available.",
	step2Title:"",
	step2Html:"Please wait while we create you an account...",
	errorRegisterTitle:"Error",
	errorRegister:"User not created, please try again with a different username."
});


config.macros.ccStats={};
merge(config.macros.ccStats,{
	graph24HourTitle:"Last 24 hours",
	graph24HourDesc:"The number of views of this workspace in the past 24 hours",
	graph20MinsTitle:"Last 20 Minutes",
	graph20MinsDesc:"The number of views of this workspace in the last 20 minutes",
	graph7DaysTitle:"Last 7 days",
	graph7DaysDesc:"The number of views of this workspace in the last 7 days.",
	graph5MonthsTitle:"Last 5 months",
	graph5MonthsDesc:"The number of views of this workspace in the past 30 days.",
	errorPermissionDenied:"Permissions Denied to data for %0 You need to be an administrator on the %1 workspace.",
	stepTitle:"Workspace Statistics"
});


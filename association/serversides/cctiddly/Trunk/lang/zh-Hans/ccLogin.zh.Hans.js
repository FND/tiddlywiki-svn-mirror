/***
|''Name''|ccLogin.zh-Hans|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 25, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{
merge(config.macros.ccLogin,{
	WizardTitleText:"登入系统",
	usernameRequest:"用户",
	passwordRequest:"密码",
	stepLoginTitle:null,
	stepLoginIntroTextHtml:"<table border=0px><tr><td>用户</td><td><input name=username id=username tabindex='1'></td></tr><tr><td>密码</td><td><input type=password id='password' tabindex='2' name=password></td></tr></table>",
	stepDoLoginTitle:"登入用户为",
	stepDoLoginIntroText:"登入中 .... ",
	stepForgotPasswordTitle:"查询密码",
	stepForgotPasswordIntroText:"请与系统管理者联络，或重新注册一个新的帐号。  <br /><input id='forgottenPassword' type='hidden' name='forgottenPassword'/>",
	stepLogoutTitle:"登出",
	stepLogoutText:"您目前登入的用户名称为 ",
	buttonLogout:"登出",
	buttonLogoutToolTip:"点击此处登出系统",
	buttonLogin:"登入",
	buttonLoginToolTip:"点击此处登入系统",
	buttonCancel:"取消",
	buttonCancelToolTip:"取消作业 ",
	buttonForgottenPassword:"忘记密码",
	buttonSendForgottenPassword:"寄给我一组新的密码",
	buttonSendForgottenPasswordToolTip:"若您已忘记密码，请点击此处",
	buttonForgottenPasswordToolTip:"点击此处取得密码提示",
	msgNoUsername:"请输入用户名称", 
	msgNoPassword:"请输入密码",
	msgLoginFailed:"登入错误，请重新登入", 
	configURL:url+"/handle/login.php", 
	configUsernameInputName:"cctuser",
	configPasswordInputName:"cctpass",
	configPasswordCookieName:"cctPass"
});
if (isLoggedIn()){
	merge(config.tasks,{logout:{text: config.macros.ccLogin.buttonLogout, tooltip:config.macros.ccLogin.buttonLogoutToolTip,content: '<<ccLogin>>'}});
}else{
	merge(config.tasks,{login:{text: config.macros.ccLogin.buttonLogin, tooltip:config.macros.ccLogin.buttonLoginToolTip, content: '<<ccLogin>>'}});	
}
//}}}
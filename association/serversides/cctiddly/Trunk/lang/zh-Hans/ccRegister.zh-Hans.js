/***
|''Name''|ccRedister.zh-Hans|
|''Description:''||
|''Contributors''|BramChen|
|''Source:''| |
|''CodeRepository:''| |
|''Version:''|1.7.1|
|''Date:''|Sep 19, 2008|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWiki-zh |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.2.0|
***/
//{{{
merge(config.macros.register,{
	usernameRequest:"用户",
	passwordRequest:"密码",
	passwordConfirmationRequest:"确认密码",
	emailRequest:"电子邮件",
	stepRegisterTitle:"注册用户.",
	stepRegisterIntroText:"嗨，欢迎注册 .... ",
	stepRegisterHtml:"<table><tr><td style='text-align: right;'>用户</td><td><input class='input' id='reg_username' name='reg_username' tabindex='1'/></td><td><span></span><input type='hidden' name='username_error'></input></td></tr><tr><td style='text-align: right;'>电子邮件</td><td><input class='input' name=reg_mail id='reg_mail' tabindex='2'/></td><td><span> </span><input type='hidden' name='mail_error'></input></td></tr><tr><td style='text-align: right;'>密码</td><td><input type='password' class='input' id='password1' name='reg_password1' tabindex='3'/></td><td><span> </span><input type='hidden' name='pass1_error'></input></td></tr><tr><td style='text-align: right;'>确认密码</td><td><input type='password' class='input' id='password2' name='reg_password2' tabindex='4'/></td><td><span> </span><input type='hidden' name='pass2_error'></input></td></tr></table>",
	buttonCancel:"取消",
	buttonCancelToolTip:"取消作业",
	buttonRegister:"注册",	
	buttonRegisterToolTip:"点击此处注册",
	msgCreatingAccount:"Attempting to create the account for you.", 
	msgNoUsername:"为输入用户名称", 
	msgEmailOk:"电子邮件有效",
	msgNoPassword:"为输入密码",
	msgDifferentPasswords:"密码不符合",
	msgUsernameTaken:"The username requested has been taken.",
	msgUsernameAvailable:"用户名称有效",
	step2Title:"",
	step2Html:"创建用户中，请稍后 ..."
});
//}}}
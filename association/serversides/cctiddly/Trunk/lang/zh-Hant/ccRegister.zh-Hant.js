/***
|''Name''|ccRedister.zh-Hant|
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
	usernameRequest:"用戶",
	passwordRequest:"密碼",
	passwordConfirmationRequest:"確認密碼",
	emailRequest:"電子郵件",
	stepRegisterTitle:"註冊用戶.",
	stepRegisterIntroText:"嗨，歡迎註冊 .... ",
	stepRegisterHtml:"<table><tr><td style='text-align: right;'>用戶</td><td><input class='input' id='reg_username' name='reg_username' tabindex='1'/></td><td><span></span><input type='hidden' name='username_error'></input></td></tr><tr><td style='text-align: right;'>電子郵件</td><td><input class='input' name=reg_mail id='reg_mail' tabindex='2'/></td><td><span> </span><input type='hidden' name='mail_error'></input></td></tr><tr><td style='text-align: right;'>密碼</td><td><input type='password' class='input' id='password1' name='reg_password1' tabindex='3'/></td><td><span> </span><input type='hidden' name='pass1_error'></input></td></tr><tr><td style='text-align: right;'>確認密碼</td><td><input type='password' class='input' id='password2' name='reg_password2' tabindex='4'/></td><td><span> </span><input type='hidden' name='pass2_error'></input></td></tr></table>",
	buttonCancel:"取消",
	buttonCancelToolTip:"取消作業",
	buttonRegister:"註冊",	
	buttonRegisterToolTip:"點擊此處註冊",
	msgCreatingAccount:"Attempting to create the account for you.", 
	msgNoUsername:"為輸入用戶名稱", 
	msgEmailOk:"電子郵件有效",
	msgNoPassword:"為輸入密碼",
	msgDifferentPasswords:"密碼不符合",
	msgUsernameTaken:"The username requested has been taken.",
	msgUsernameAvailable:"用戶名稱有效",
	step2Title:"",
	step2Html:"建立用戶中，請稍後 ..."
});
//}}}
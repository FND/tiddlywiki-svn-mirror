/***
|''Name''|ccLogin.zh-Hant|
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
	WizardTitleText:"登入系統",
	usernameRequest:"用戶",
	passwordRequest:"密碼",
	stepLoginTitle:null,
	stepLoginIntroTextHtml:"<table border=0px><tr><td>用戶</td><td><input name=username id=username tabindex='1'></td></tr><tr><td>密碼</td><td><input type=password id='password' tabindex='2' name=password></td></tr></table>",
	stepDoLoginTitle:"登入用戶為",
	stepDoLoginIntroText:"登入中 .... ",
	stepForgotPasswordTitle:"查詢密碼",
	stepForgotPasswordIntroText:"請與系統管理者聯絡，或重新註冊一個新的帳號。  <br /><input id='forgottenPassword' type='hidden' name='forgottenPassword'/>",
	stepLogoutTitle:"登出",
	stepLogoutText:"您目前登入的用戶名稱為 ",
	buttonLogout:"登出",
	buttonLogoutToolTip:"點擊此處登出系統",
	buttonLogin:"登入",
	buttonLoginToolTip:"點擊此處登入系統",
	buttonCancel:"取消",
	buttonCancelToolTip:"取消作業 ",
	buttonForgottenPassword:"忘記密碼",
	buttonSendForgottenPassword:"寄給我一組新的密碼",
	buttonSendForgottenPasswordToolTip:"若您已忘記密碼，請點擊此處",
	buttonForgottenPasswordToolTip:"點擊此處取得密碼提示",
	msgNoUsername:"請輸入用戶名稱", 
	msgNoPassword:"請輸入密碼",
	msgLoginFailed:"登入錯誤，請重新登入", 
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
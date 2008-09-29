/***
|''Name''|ccAdaptor.zh-Hant|
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
merge(ccTiddlyAdaptor, { 
	errorTitleNotSaved:"<h1>所作的更動 *未完成* 儲存</h1>", 
	errorTextSessionExpired:"工作階段逾時，你必須於新視窗中登入系統，<br />並從本視窗中剪貼更動的資料再複製到新視窗", 
	errorTextConfig:"儲存時，發生版本衝突。<br />請於新視窗開啟頁面後，檢視相關更動",
	errorTextUnknown:"發生不明原因的錯誤",
	errorClose:"關閉",
	buttonOpenNewWindow:"開啟新視窗即可重新儲存	.... ",
	buttonHideThisMessage:"隱藏此訊息", 
	msgErrorCode:"錯誤碼 : "
	
});
ccTiddlyAdaptor.serverParsingErrorMessage = "自伺服器解析資料時發生錯誤";
ccTiddlyAdaptor.errorInFunctionMessage = "ccTiddlyAdaptor 發生錯誤：%0";
//}}}
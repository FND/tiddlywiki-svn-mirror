<?php
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//ccT language pack
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//short words
	$ccT_msg['word']['query_failed'] = "查詢失敗";
	$ccT_msg['word']['query'] = "查詢";
	$ccT_msg['word']['error'] = "錯誤";
	$ccT_msg['word']['file'] = "檔案";
	$ccT_msg['word']['existed'] = "已存在";
	$ccT_msg['word']['and'] = "and";
	$ccT_msg['word']['revision'] = "修改紀錄";

	//install script message
	$ccT_msg['install']['cct_install'] = "安裝 ccTiddly";
	$ccT_msg['install']['db_setup'] = "資料庫設定";
	$ccT_msg['install']['db_connected'] = "已連結資料庫伺服器!";
	$ccT_msg['install']['db_created'] = "Tiddly 資料庫建立完成!";
	$ccT_msg['install']['db_existed'] = "資料庫已存在";
	$ccT_msg['install']['table_setup'] = "資料表設定";
	$ccT_msg['install']['table_created'] = " 資料表建立完成";
	$ccT_msg['install']['table_existed'] = "資料表已存在";
	$ccT_msg['install']['install_completed'] = "安裝完成";
	$ccT_msg['install']['post_install'] = '請 <a href="index.php'.(($config=="default")?"":"?config=".$config).'">按此</a> 開始使用 ccTiddly';

	//plugins
	$ccT_msg['install']['plugins_msg']['successful'] = " 安裝完成";
	$ccT_msg['install']['plugins_msg']['unsuccessful'] = " 無法安裝";
	$ccT_msg['install']['plugins_msg']['exist'] = " 已存在";
	$ccT_msg['install']['plugins']['archivedtimeline'] = "ArchivedTimeline v0.5.2";
	$ccT_msg['install']['plugins']['commentplugin'] = "CommentPlugin v0.5.0";
	$ccT_msg['install']['plugins']['commentplugin_zh_tw'] = "CommentPlugin (traditional chinese) v0.5.0";
	$ccT_msg['install']['plugins']['commenttabplugin'] = "CommentTabPlugin";
	$ccT_msg['install']['plugins']['commenttabplugin_zh_tw'] = "CommentTabPlugin (traditional chinese)";
	$ccT_msg['install']['plugins']['genrssplugin'] = "GenRssPlugin v0.2.0";
	$ccT_msg['install']['plugins']['hidecommentsfromlists'] = "HideCommentsFromLists v0.2.0";
	$ccT_msg['install']['plugins']['loadextplugin'] = "LoadExtPlugin v1.5.2";
	$ccT_msg['install']['plugins']['nestedslidersplugin'] = "NestedSlidersPlugin v1.7.7";
	$ccT_msg['install']['plugins']['recentplugin'] = "recentPlugin v0.1.0";
	$ccT_msg['install']['plugins']['selectthemeplugin'] = "SelectThemePlugin v1.2.3";
	$ccT_msg['install']['plugins']['taggerplugin'] = "TaggerPlugin v1.0.1";
	$ccT_msg['install']['plugins']['xmlreader'] = "XMLReader v1.0.0";
	$ccT_msg['install']['plugins']['wikibar'] = "wikibar 2.0.0 beta3";
	$ccT_msg['install']['plugins']['uploadplugin'] = "BidiXTW uploadplugin 3.4.1";
	$ccT_msg['install']['plugins']['bigthemepack'] = "BigThemePack v0.1.0";
	$ccT_msg['install']['plugins']['breadcrumbs2'] = "BreadCrumbs2 v1.2.0";
	$ccT_msg['install']['plugins']['blog'] = "部落格套件 (包含 recent plugin and comment plugin)";

	//upgrade script messages
	$ccT_msg['upgrade']['warning'] = "此作業將你的ccT資料庫，自ccT v1.0 升級至 v1.1beta。升級作業之前，請確定你已做好<u><b>備份</b></u>。";
	$ccT_msg['upgrade']['continue'] = "升級";
	$ccT_msg['upgrade']['upgrade_script'] = "升級 ccTiddly";
	$ccT_msg['upgrade']['success'] = "完成更新.";
	$ccT_msg['upgrade']['back'] = '點擊 <a href="index.php'.(($config=="default")?"":"?config=".$config).'">這裡</a> 返回並刪除 upgrade.php. ';
	$ccT_msg['upgrade']['error'] = ' 個錯誤。請手動解決錯誤。';

	//import
	$ccT_msg['import']['import_title'] = 'ccTiddly 匯入功能';
	$ccT_msg['import']['bulktiddler'] = '請將欲匯入之記事貼入下方';
	$ccT_msg['import']['import'] = '匯入';
	$ccT_msg['import']['title'] = '標題';
	$ccT_msg['import']['modified'] = '更新日期';
	$ccT_msg['import']['modifier'] = '作者';
	$ccT_msg['import']['created'] = '建立日期';
	$ccT_msg['import']['tags'] = '標籤';
	$ccT_msg['import']['overwrite'] = '覆寫';
	$ccT_msg['import']['action'] = '執行指令';
	$ccT_msg['import']['result'] = '結果';
	$ccT_msg['import']['error'] = '錯誤';
	$ccT_msg['import']['failed'] = '失敗';
	$ccT_msg['import']['success'] = '完成';
	$ccT_msg['import']['skipped'] = '跳過';
	$ccT_msg['import']['insert'] = '新增';
	$ccT_msg['import']['update'] = '更新';

	//plugins
	$ccT_msg['copyright']['power_by'] = "系統採用";
	$ccT_msg['copyright']['standalone'] = "離線檢視";
	$ccT_msg['loginpanel']['name'] = "LoginPanel";
	$ccT_msg['loginpanel']['anoymous'] = "訪客";
	$ccT_msg['loginpanel']['username'] = "使用者:";
	$ccT_msg['loginpanel']['password'] = "密碼:";
	$ccT_msg['loginpanel']['welcome'] = "歡迎";
	$ccT_msg['loginpanel']['login'] = "登入";
	$ccT_msg['loginpanel']['logout'] = "登出";
	$ccT_msg['sidebaroption']['options'] = "選項";
	$ccT_msg['saveChanges']['upload'] = "手動上傳更新資料";
	$ccT_msg['saveChanges']['uploadPrompt'] = "更新伺服器資料： tiddlers 與 RSS (詳見[[選項]])";
	$ccT_msg['optionPanel']['uploadAll'] = "上傳更新所有文章";
	$ccT_msg['optionPanel']['uploadRSS'] = "上傳更新RSS";
	$ccT_msg['optionPanel']['autoUpload'] = "自動上傳更新資料";

	//LoginPanel, option panel

	//error msg followed
	$ccT_msg['msg']['query'] = " 查詢: ";
	$ccT_msg['msg']['error'] = " 錯誤: ";
	$ccT_msg['msg']['file'] = " 檔案: ";

	//warning msg
	$ccT_msg['warning']['blank_entry'] = "不允許產生空白文章內容。";
	$ccT_msg['warning']['save_error'] = "儲存發生錯誤";
	$ccT_msg['warning']['not_authorized'] = "權限不足，更改內容未儲存。";
	$ccT_msg['warning']['del_disabled'] = "停用刪除功能。";
	$ccT_msg['warning']['del_err'] = "刪除發生錯誤";
	$ccT_msg['warning']['tiddler_not_found'] = "文章不存在";
	$ccT_msg['warning']['tiddler_overwritten'] = "已由新文章取代";
	$ccT_msg['warning']['tiddler_need_reload'] = "自前次載入後，本文內容已有更動，\n請複製內容後重新載入，\n再貼上或另行修改。";
	$ccT_msg['warning']['no_revision'] = "無沿革紀錄";
	
	//notice
	$ccT_msg['notice']['TiddlerSaved'] = "文章已儲存";
	$ccT_msg['notice']['TiddlerDeleted'] = "文章已刪除";
	$ccT_msg['notice']['uploadRSS'] = "上傳 RSS";
	$ccT_msg['notice']['uploadStoreArea'] = "上傳 storeArea";
	$ccT_msg['notice']['timeOut'] = "執行逾時，指令未完成！";
	$ccT_msg['notice']['RSScreated'] = "RSS 已建立";
	$ccT_msg['notice']['uploadStoreArea_complete'] = "storeArea 上傳完成";

	//error msg
	$ccT_msg['error']['rss_file_create'] = "無法產生 rss 檔";
	$ccT_msg['error']['rss_file_write'] = "無法寫入 rss 檔";
	$ccT_msg['error']['js_file_open'] = "無法開啟 core js";
	$ccT_msg['error']['js_file_read'] = "無法讀取 core js";
	$ccT_msg['error']['config_not_found'] = "無此設定檔";
	$ccT_msg['error']['revision_not_found'] = "無沿革紀錄";

	//db error
	$ccT_msg['db']['connect'] = "無法連結資料庫";
	$ccT_msg['db']['select'] = "無法查詢資料庫";
	$ccT_msg['db']['result'] = "無法自資料庫取得資料";
	$ccT_msg['db']['insert'] = "無法新增資料至資料庫";
	$ccT_msg['db']['update'] = "無法更新資料至資料庫";
	$ccT_msg['db']['create'] = "無法建立資料庫";

	//External plugin
	$ccT_msg['uploadPlugin']['file_open_error'] = "無法開啟檔案。";
	
	//misc
	$ccT_msg['misc']['revision_tooltip'] = "檢視沿革紀錄";
	$ccT_msg['misc']['no_title'] = "未設標題";
	$ccT_msg['misc']['no_action'] = "未執行";
	$ccT_msg['misc']['break'] = "\n";
?>
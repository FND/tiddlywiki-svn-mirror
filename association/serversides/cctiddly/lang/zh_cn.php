<?php
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//language pack
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//short words
	$ccT_msg['word']['query_failed'] = "查询失败";
	$ccT_msg['word']['query'] = "查询";
	$ccT_msg['word']['error'] = "错误";
	$ccT_msg['word']['file'] = "文件";
	$ccT_msg['word']['existed'] = "已存在";
	$ccT_msg['word']['and'] = "and";
	$ccT_msg['word']['revision'] = "修改纪录";

	//install script message
	$ccT_msg['install']['cct_install'] = "安装 ccTiddly";
	$ccT_msg['install']['db_setup'] = "数据库设定";
	$ccT_msg['install']['db_connected'] = "已连结数据库伺服器!";
	$ccT_msg['install']['db_created'] = "Tiddly 数据库建立完成!";
	$ccT_msg['install']['db_existed'] = "数据库已存在";
	$ccT_msg['install']['table_setup'] = "资料表设定";
	$ccT_msg['install']['table_created'] = " 资料表建立完成";
	$ccT_msg['install']['table_existed'] = "资料表已存在";
	$ccT_msg['install']['install_completed'] = "安装完成";
	$ccT_msg['install']['post_install'] = '请 <a href="index.php'.(($config=="default")?"":"?config=".$config).'">按此</a> 开始使用 ccTiddly';

	//plugins
	$ccT_msg['install']['plugins_msg']['successful'] = " 安装完成";
	$ccT_msg['install']['plugins_msg']['unsuccessful'] = " 无法安装";
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
	//$ccT_msg['install']['plugins']['uploadplugin'] = "BidiXTW uploadplugin 3.4.1";
	/*$ccT_msg['install']['plugins']['bigthemepack'] = "BigThemePack v0.1.0";
	$ccT_msg['install']['plugins']['breadcrumbs2'] = "BreadCrumbs2 v1.2.0";*/
	$ccT_msg['install']['plugins']['blog'] = "部落格套件 (包含 recent plugin and comment plugin)";

	//upgrade script messages
	$ccT_msg['upgrade']['warning'] = "此作业将你的ccT资料库，自ccT v1.0 升级至 v1.1beta。开始升级作业之前，请确定你已做好<u><b>备份</b></u>。";
	$ccT_msg['upgrade']['continue'] = "开始升级";
	$ccT_msg['upgrade']['upgrade_scrupt'] = "升级 ccTiddly";
	$ccT_msg['upgrade']['success'] = "完成更新.";
	$ccT_msg['upgrade']['back'] = '点击 <a href="index.php'.(($config=="default")?"":"?config=".$config).'">这里</a> 返回并删除 upgrade.php. ';
	$ccT_msg['upgrade']['error'] = ' 个错误。请手动解决错误。';
	//import
	$ccT_msg['import']['import_title'] = 'ccTiddly 导入功能';
	$ccT_msg['import']['bulktiddler'] = '请将欲导入之文章贴入下方';
	$ccT_msg['import']['import'] = '汇入';
	$ccT_msg['import']['title'] = '标题';
	$ccT_msg['import']['modified'] = '更新日期';
	$ccT_msg['import']['modifier'] = '作者';
	$ccT_msg['import']['created'] = '创建日期';
	$ccT_msg['import']['tags'] = '标签';
	$ccT_msg['import']['overwrite'] = '覆写';
	$ccT_msg['import']['action'] = '执行指令';
	$ccT_msg['import']['result'] = '结果';
	$ccT_msg['import']['error'] = '错误';
	$ccT_msg['import']['failed'] = '失败';
	$ccT_msg['import']['success'] = '完成';
	$ccT_msg['import']['skipped'] = '跳过';
	$ccT_msg['import']['insert'] = '添加';
	$ccT_msg['import']['update'] = '更新';
	
	//plugins
	$ccT_msg['copyright']['power_by'] = "系统采用";
	$ccT_msg['copyright']['standalone'] = "离线检视";
	$ccT_msg['loginpanel']['name'] = "LoginPanel";
	$ccT_msg['loginpanel']['anoymous'] = "访客";
	$ccT_msg['loginpanel']['username'] = "使用者:";
	$ccT_msg['loginpanel']['password'] = "密码:";
	$ccT_msg['loginpanel']['welcome'] = "欢迎";
	$ccT_msg['loginpanel']['login'] = "登入";
	$ccT_msg['loginpanel']['logout'] = "logout";
	$ccT_msg['sidebaroption']['options'] = "选项";
	$ccT_msg['saveChanges']['upload'] = "手动上传更新资料";
	$ccT_msg['saveChanges']['uploadPrompt'] = "更新伺服器资料： tiddlers 与 RSS (详见 [[选项]])";
	$ccT_msg['optionPanel']['uploadAll'] = "上传更新所有文章";
	$ccT_msg['optionPanel']['uploadRSS'] = "上传更新RSS";
	$ccT_msg['optionPanel']['autoUpload'] = "自动上传更新资料";

	//error msg followed
	$ccT_msg['msg']['query'] = " 查询: ";
	$ccT_msg['msg']['error'] = " 错误: ";
	$ccT_msg['msg']['file'] = " 文件: ";
	
	//warning msg
	$ccT_msg['warning']['blank_entry'] = "不允许产生空白文章内容。";
	$ccT_msg['warning']['save_error'] = "保存发生错误";
	$ccT_msg['warning']['not_authorized'] = "权限不足，更改内容未保存。";
	$ccT_msg['warning']['del_disabled'] = "停用删除功能。";
	$ccT_msg['warning']['del_err'] = "删除发生错误";
	$ccT_msg['warning']['tiddler_not_found'] = "Tiddler not found";
	$ccT_msg['warning']['tiddler_overwritten'] = "已由新文章取代";
	$ccT_msg['warning']['tiddler_need_reload'] = "自前次载入后，本文内容已有更动，\n请复制内容后重新载入，\n再粘贴或另行修改。";
	$ccT_msg['warning']['no_revision'] = "无沿革纪录";
	
	//notice
	$ccT_msg['notice']['TiddlerSaved'] = "文章已保存";
	$ccT_msg['notice']['TiddlerDeleted'] = "文章已删除";
	$ccT_msg['notice']['uploadRSS'] = "上传 RSS";
	$ccT_msg['notice']['uploadStoreArea'] = "上传 storeArea";
	$ccT_msg['notice']['timeOut'] = "执行逾时，指令未完成！";
	$ccT_msg['notice']['RSScreated'] = "RSS 已创建";
	$ccT_msg['notice']['uploadStoreArea_complete'] = "storeArea 上传完成";
	
	//error msg
	$ccT_msg['error']['rss_file_create'] = "无法产生 rss 文件";
	$ccT_msg['error']['rss_file_write'] = "无法写入 rss 文件";
	$ccT_msg['error']['js_file_open'] = "无法开启 core js";
	$ccT_msg['error']['js_file_read'] = "无法读取 core js";
	$ccT_msg['error']['config_not_found'] = "无此设置档";
	$ccT_msg['error']['revision_not_found'] = "无沿革纪录";
	
	//db error
	$ccT_msg['db']['connect'] = "无法连结数据库";
	$ccT_msg['db']['select'] = "无法查询数据库";
	$ccT_msg['db']['result'] = "无法自数据库取得资料";
	$ccT_msg['db']['insert'] = "无法添加资料至数据库";
	$ccT_msg['db']['update'] = "无法更新资料至数据库";
	$ccT_msg['db']['create'] = "无法创建数据库";
	
	//External plugin
	$ccT_msg['uploadPlugin']['file_open_error'] = "无法开启档案";
	
	//misc
	$ccT_msg['misc']['revision_tooltip'] = "查阅沿革纪录";
	$ccT_msg['misc']['no_title'] = "未设标题";
	$ccT_msg['misc']['no_action'] = "未执行";
	$ccT_msg['misc']['break'] = "\n";
?>
<?php

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//ccT language pack
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//short words
	$ccT_msg['word']['query_failed'] = "Query failed";
	$ccT_msg['word']['query'] = "Query";
	$ccT_msg['word']['error'] = "error";
	$ccT_msg['word']['file'] = "File";
	$ccT_msg['word']['existed'] = "existed";
	$ccT_msg['word']['and'] = "and";
	$ccT_msg['word']['revision'] = "revision";
	
	//install script message
	$ccT_msg['install']['cct_install'] = "ccTiddly installation";
	$ccT_msg['install']['db_setup'] = "Database setup";
	$ccT_msg['install']['db_connected'] = "Connected to database server!";
	$ccT_msg['install']['db_created'] = "Tiddly database created successfully!";
	$ccT_msg['install']['db_existed'] = "Database existed";
	$ccT_msg['install']['table_setup'] = "Tables setup";
	$ccT_msg['install']['table_created'] = " created successfully";
	$ccT_msg['install']['table_existed'] = "Tables existed";
	$ccT_msg['install']['install_completed'] = "Installation succeed";
	$ccT_msg['install']['post_install'] = 'You can click <a href="index.php'.(($config=="default")?"":"?config=".$config).'">here</a> to start using ccTiddly';
	
	//plugins
	$ccT_msg['install']['plugins_msg']['successful'] = " install successfully";
	$ccT_msg['install']['plugins_msg']['unsuccessful'] = " cannot be installed";
	$ccT_msg['install']['plugins_msg']['exist'] = " exist";
	$ccT_msg['install']['plugins']['ArchivedTimeline'] = "ArchivedTimeline";
	$ccT_msg['install']['plugins']['CommentPlugin'] = "CommentPlugin";
	$ccT_msg['install']['plugins']['CommentTabPlugin'] = "CommentTabPlugin";
	$ccT_msg['install']['plugins']['GenRssPlugin'] = "GenRssPlugin";
	$ccT_msg['install']['plugins']['LoadExtPlugin'] = "LoadExtPlugin";
	$ccT_msg['install']['plugins']['NestedSlidersPlugin'] = "NestedSlidersPlugin";
	$ccT_msg['install']['plugins']['RecentTiddlersPlugin'] = "RecentTiddlersPlugin";
	$ccT_msg['install']['plugins']['SelectThemePlugin'] = "SelectThemePlugin";
	$ccT_msg['install']['plugins']['XMLReader2'] = "XMLReader2";
	$ccT_msg['install']['plugins']['wikibar'] = "wikibar";
	/*
	$ccT_msg['install']['plugins']['UploadPlugin'] = "UploadPlugin";
	$ccT_msg['install']['plugins']['BigThemePack'] = "BigThemePack";
	$ccT_msg['install']['plugins']['Breadcrumbs2'] = "BreadCrumbs2";
	*/
	$ccT_msg['install']['plugins']['blog'] = "blog (include CommentPlugin, CommentTabPlugin and RecentTiddlersPlugin)";
	
	//upgrade script messages
	$ccT_msg['upgrade']['warning'] = "This upgrades your database from ccT v1.0 to v1.1. Please make sure you have <u><b>backup</b></u> your TW before proceeding. Click <b>continue upgrade</b> to proceed.";
	$ccT_msg['upgrade']['continue'] = "Continue upgrade";
	$ccT_msg['upgrade']['upgrade_script'] = "Upgrade script";
	$ccT_msg['upgrade']['success'] = "Upgrade successful.";
	$ccT_msg['upgrade']['back'] = 'Please click <a href="index.php'.(($config=="default")?"":"?config=".$config).'">here</a> to go back and remove upgrade.php if it is no longer required.';
	$ccT_msg['upgrade']['error'] = ' error(s) occured. Please take a note of the error(s). You my have to fix it manually.';
	
	//import
	$ccT_msg['import']['import_title'] = 'ccTiddly Import';
	$ccT_msg['import']['bulktiddler'] = 'Please put your tiddlers you want to import below';
	$ccT_msg['import']['import'] = 'Import';
	$ccT_msg['import']['title'] = 'Title';
	$ccT_msg['import']['modified'] = 'modified';
	$ccT_msg['import']['modifier'] = 'modifier';
	$ccT_msg['import']['created'] = 'created';
	$ccT_msg['import']['tags'] = 'tags';
	$ccT_msg['import']['overwrite'] = 'Overwrite';
	$ccT_msg['import']['action'] = 'action';
	$ccT_msg['import']['result'] = 'result';
	$ccT_msg['import']['error'] = 'error';
	$ccT_msg['import']['failed'] = 'failed';
	$ccT_msg['import']['success'] = 'success';
	$ccT_msg['import']['skipped'] = 'skipped';
	$ccT_msg['import']['insert'] = 'insert';
	$ccT_msg['import']['update'] = 'update';
	
	//plugins
	$ccT_msg['copyright']['power_by'] = "powered by";
	$ccT_msg['copyright']['standalone'] = "standalone";
	$ccT_msg['loginpanel']['name'] = "LoginPanel";
	$ccT_msg['loginpanel']['anoymous'] = "anonymous";
	$ccT_msg['loginpanel']['username'] = "Username:";
	$ccT_msg['loginpanel']['password'] = "Password:";
	$ccT_msg['loginpanel']['welcome'] = "Welcome";
	$ccT_msg['loginpanel']['login'] = "login";
	$ccT_msg['loginpanel']['loginFailed'] = "login unsuccessful";
	$ccT_msg['loginpanel']['loginPrompt'] = "login to system";
	$ccT_msg['loginpanel']['logout'] = "logout";
	$ccT_msg['loginpanel']['logoutPrompt'] = "logout of system";
	$ccT_msg['sidebaroption']['options'] = "options";
	$ccT_msg['saveChanges']['upload'] = "Upload";
	$ccT_msg['saveChanges']['uploadPrompt'] = "upload RSS";
	$ccT_msg['optionPanel']['uploadAll'] = "Upload all tiddlers";
	$ccT_msg['optionPanel']['uploadRSS'] = "uploadRSS";
	$ccT_msg['optionPanel']['autoUpload'] = "auto upload RSS";
	
	//LoginPanel, option panel
	
	//error msg followed
	$ccT_msg['msg']['query'] = " Query: ";
	$ccT_msg['msg']['error'] = " Error: ";
	$ccT_msg['msg']['file'] = " File: ";
	
	//warning msg
	$ccT_msg['warning']['blank_entry'] = "You cannot create an entry with blank fields";
	$ccT_msg['warning']['save_error'] = "Save error";
	$ccT_msg['warning']['not_authorized'] = "You are not allowed to change the content";
	$ccT_msg['warning']['del_disabled'] = "Deleting has been disabled";
	$ccT_msg['warning']['del_err'] = "Delete error";
	$ccT_msg['warning']['tiddler_not_found'] = "Tiddler not found";
	$ccT_msg['warning']['tiddler_overwritten'] = "A tiddler is overwritten by another tiddler";
	$ccT_msg['warning']['tiddler_need_reload'] = "Tiddler have been changed since you last reload. Please copy down your changes and refresh your tiddler or pick the latest revision.";
	$ccT_msg['warning']['no_revision'] = "no revision available";
	
	//notice
	$ccT_msg['notice']['TiddlerSaved'] = "Tiddler saved";
	$ccT_msg['notice']['TiddlerDeleted'] = "Tiddler deleted";
	$ccT_msg['notice']['uploadRSS'] = "upload RSS";
	$ccT_msg['notice']['uploadStoreArea'] = "upload storeArea";
	$ccT_msg['notice']['timeOut'] = "Time out! Action not complete";
	$ccT_msg['notice']['RSScreated'] = "RSS created";
	$ccT_msg['notice']['uploadStoreArea_complete'] = "storeArea upload completed";
	
	//error msg
	$ccT_msg['error']['rss_file_create'] = "Cannot create rss file";
	$ccT_msg['error']['rss_file_write'] = "Cannot write to rss file";
	$ccT_msg['error']['js_file_open'] = "Cannot open js file";
	$ccT_msg['error']['js_file_read'] = "Cannot read js file";
	$ccT_msg['error']['config_not_found'] = "config not found";
	$ccT_msg['error']['revision_not_found'] = "revision not found";
	$ccT_msg['error']['workspace_not_found'] = "workspace not found";
	
	//db error
	$ccT_msg['db']['connect'] = "Cannot connect to database";
	$ccT_msg['db']['select'] = "Cannot select database";
	$ccT_msg['db']['result'] = "Cannot get data from database";
	$ccT_msg['db']['insert'] = "Cannot insert data to database";
	$ccT_msg['db']['update'] = "Cannot update data in database";
	$ccT_msg['db']['create'] = "Cannot create database";
	
	//External plugin
	$ccT_msg['uploadPlugin']['file_open_error'] = "Cannot open file";
	
	//misc
	$ccT_msg['misc']['revision_tooltip'] = "view revision of this tiddler";
	$ccT_msg['misc']['no_title'] = "no title";
	$ccT_msg['misc']['no_action'] = "no action";
	$ccT_msg['misc']['break'] = "\n";
?>
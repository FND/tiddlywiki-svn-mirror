/***
!UploadPlugin.zh-Hant
***/
//{{{
if (typeof config.macros.upload != "undefined"){
	merge(config.macros.upload.messages, {
		aboutToUpload: "關於上傳 TiddlyWiki 至 %0",
		backupFileStored: "前一版的檔案備份於 %0",
		crossDomain: "發生跨網域問題：不允許存取其他網站",
		errorDownloading: "下載時發生錯誤",
		errorUploadingContent: "傳時發生錯誤",
		fileLocked: "檔案被鎖住：目前不允許上傳",
		fileNotFound: "無此上傳檔案",
		fileNotUploaded: "檔案 %0 未完成上傳",
		mainFileUploaded: "主文件 TiddlyWiki 上傳至 %0",
		passwordEmpty: "請先輸入密碼後再上傳",
		urlParamMissing: "未指定 url 參數",
		rssFileNotUploaded: "Rss 檔案 %0 未上傳",
		rssFileUploaded: "Rss 檔上傳至 %0"
	});
	
	merge(config.macros.upload.label, {
		promptOption: " 依據 UploadOptions 的設定，儲存並上傳此 TiddlyWiki",
		promptParamMacro: "儲存並上傳此 TiddlyWiki 文件於 %0",
		saveLabel: "遠端存檔", 
		saveToDisk: "本機存檔",
		uploadLabel: "上傳"	
	});
	
	config.macros.saveChanges.label = (document.location.toString().substr(0,4) == "http")?"遠端存檔":"本機存檔";
	config.macros.option.passwordCheckboxLabel = "存放此密碼於本機";
	config.shadowTiddlers['OptionsPanel'] += '\n[[上傳選項|UploadOptions]]';
	config.shadowTiddlers['UploadOptions'] = "\
!UploadPlugin 選項設定\n\
帳號：<<option txtUploadUserName>>\n\
密碼：<<option pasUploadPassword>>\n\n\
上傳的服務程式的網址^^(1)^^: <<option txtUploadStoreUrl 50>>\n\
存放檔案的相對資料夾^^(2)^^: <<option txtUploadDir 50>>\n\
上傳檔案的檔名^^(3)^^: <<option txtUploadFilename 40>>\n\
存放備份檔於伺服主機上的資料夾^^(4)^^: <<option txtUploadBackupDir>>\n\n\
^^(1)^^可於[[上傳選項|UploadOptions]] 或使用巨集參數設定\n\
^^(2)^^若為空白，則與服務程式同資料夾\n\
^^(3)^^若為空白，則與使用原文件檔名\n\
^^(4)^^若為空白，於伺服主機之相同檔名的檔案將被覆寫取代\n\n\
依上述設定 <<upload>>\n\n\
!Upload 巨集語法範例\n\
{{{\n\
<<upload [storeUrl [toFilename [backupDir [uploadDir [username]]]]]>>\n\
}}}\n\
	選用之參數可以取代[[上傳選項|UploadOptions]] 的設定\n\
	";

}
//}}}
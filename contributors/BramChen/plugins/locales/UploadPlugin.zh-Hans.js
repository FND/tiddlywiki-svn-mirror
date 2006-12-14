/***
!UploadPlugin.zh-Hant
***/
//{{{
if (typeof config.macros.upload != "undefined"){
	merge(config.macros.upload.messages, {
		aboutToUpload: "关于上传 TiddlyWiki 至 %0",
		backupFileStored: "前一版的文件备份于 %0",
		crossDomain: "发生跨网域问题：不允许存取其他网站",
		errorDownloading: "下载时发生错误",
		errorUploadingContent: "传时发生错误",
		fileLocked: "文件被锁住：目前不允许上传",
		fileNotFound: "无此上传文件",
		fileNotUploaded: "文件 %0 未完成上传",
		mainFileUploaded: "主文件 TiddlyWiki 上传至 %0",
		passwordEmpty: "请先输入密码后再上传",
		urlParamMissing: "未指定 url 参数",
		rssFileNotUploaded: "Rss 文件 %0 未上传",
		rssFileUploaded: "Rss 文件传至 %0"
	});
	
	merge(config.macros.upload.label, {
		promptOption: " 依据 UploadOptions 的设置，保存并上传此 TiddlyWiki",
		promptParamMacro: "储存并上传此 TiddlyWiki 文件于 %0",
		saveLabel: "远端保存", 
		saveToDisk: "本机保存",
		uploadLabel: "上传"	
	});
	
	config.macros.saveChanges.label = (document.location.toString().substr(0,4) == "http")?"远端保存":"本机保存";
	config.macros.option.passwordCheckboxLabel = "保存此密码于本机";
	config.shadowTiddlers['OptionsPanel'] += '\n[[上传选项|UploadOptions]]';
	config.shadowTiddlers['UploadOptions'] = "\
!UploadPlugin 选项設置\n\
帐号：<<option txtUploadUserName>>\n\
密码：<<option pasUploadPassword>>\n\n\
上传的服务程式的网址^^(1)^^: <<option txtUploadStoreUrl 50>>\n\
保存文件的相对资料夹^^(2)^^: <<option txtUploadDir 50>>\n\
上传文件的档名^^(3)^^: <<option txtUploadFilename 40>>\n\
保存备份文件于伺服主机上的资料夹^^(4)^^: <<option txtUploadBackupDir>>\n\n\
^^(1)^^可于[[上传选项|UploadOptions]] 或使用宏的参数设置\n\
^^(2)^^若为空白，则与服务程式同资料夹\n\
^^(3)^^若为空白，则与使用原文件档名\n\
^^(4)^^若为空白，于伺服主机之相同档名的文件将被覆写取代\n\n\
依上述设定 <<upload>>\n\n\
!Upload 宏的语法范例\n\
{{{\n\
<<upload [storeUrl [toFilename [backupDir [uploadDir [username]]]]]>>\n\
}}}\n\
	选用之参数可以取代[[上传选项|UploadOptions]] 的設置\n\
	";

}
//}}}
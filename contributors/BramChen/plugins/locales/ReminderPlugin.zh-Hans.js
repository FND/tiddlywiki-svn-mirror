/***
|''Name:''|ReminderPlugin.zh-Hans|
|''Source:''|http://tiddlywiki-zh.googlecode.com/svn/trunk/contributors/BramChen/plugins/|
|''Author:''|BramChen (bram.chen (at) gmail (dot) com)|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.0.11|
|''Required:''|ReminderPlugin|
!!!!!Code
***/
//{{{
if (typeof config.macros.reminders != "undefined"){
	merge(config.macros.reminders, {
		defaultLeadTime: [0,365],
		defaultReminderMessage: "DIFF，事由：“TITLE”于 DATE ANNIVERSARY",
		defaultShowReminderMessage: "DIFF，事由：“TITLE” 于 DATE ANNIVERSARY -- TIDDLER",
		defaultAnniversaryMessage: "(DIFF)",
		untitledReminder: "无标题的事件",
		noReminderFound: "在往后的 LEADTIMEUPPER 天，无“TITLE”事件",
		todayString: "今天",
		tomorrowString: "明天",
		ndaysString: "DIFF天",
		emtpyShowRemindersString: "未发现任何需要提醒到期日的事项",
		dateFormat: "YYYY年0MM月0DD日 星期DDD"
	});

	config.macros.newReminder.handler = function newReminder(place,macroName,params){
		var today=new Date().getMidnight();
		var formstring = '<html><form><select name="year"><option value="">每年</option>';
		for (var i = 0; i < 5; i++)
		{
			formstring += '<option' + ((i == 0) ? ' selected' : '') + ' value="' + (today.getFullYear() +i) + '">' + (today.getFullYear() + i) + '</option>';
		}
		formstring += '</select>年&nbsp;&nbsp;<select name="month"><option value="">每月</option>';
		for (i = 0; i < 12; i++){
			formstring += '<option' + ((i == today.getMonth()) ? ' selected' : '') + ' value="' + (i+1) + '">' + config.messages.dates.months[i] + '</option>';
		}
		formstring += '</select>月&nbsp;&nbsp;<select name="day"><option value="">每日</option>';
		for (i = 1; i < 32; i++)
		{
			formstring += '<option' + ((i == (today.getDate() )) ? ' selected' : '') + ' value="' + i + '">' + i + '</option>';
		}
	
		formstring += '</select>日，&nbsp;&nbsp;事件标题：<input type="text" size="40" name="title" value="请输入事件标题" onfocus="this.select();"><input type="button" value="确定" onclick="addReminderToTiddler(this.form)"></form></html>';
	
		var panel = config.macros.slider.createSlider(place,null,"创建事件","创建工作项目的所属事件");
		wikify(formstring ,panel,null,store.getTiddler(params[1]));
	};
}
//}}}
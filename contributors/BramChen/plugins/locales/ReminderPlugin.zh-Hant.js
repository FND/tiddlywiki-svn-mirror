/***
!ReminderPlugin
***/
//{{{
if (typeof config.macros.reminders != "undefined"){
	merge(config.macros.reminders, {
		defaultLeadTime: [0,365],
		defaultReminderMessage: "�ɶ��GDIFF�ADATE ANNIVERSARY �ƥѡG�uTITLE�v",
		defaultShowReminderMessage: "�ɶ��GDIFF�A�ƥѡG�uTITLE�v �� DATE ANNIVERSARY -- TIDDLER",
		defaultAnniversaryMessage: "(DIFF)",
		untitledReminder: "�L���D���ƥ�",
		noReminderFound: "�b���᪺ LEADTIMEUPPER �ѡA�L�uTITLE�v�ƥ�",
		todayString: "����",
		tomorrowString: "����",
		ndaysString: "DIFF��",
		emtpyShowRemindersString: "���o�{����ݭn��������骺�ƶ�",
		dateFormat: "YYYY�~0MM��0DD�� �P��DDD"
	});

	config.macros.newReminder.handler = function newReminder(place,macroName,params){
		var today=new Date().getMidnight();
		var formstring = '<html><form><select name="year"><option value="">�C�~</option>';
		for (var i = 0; i < 5; i++)
		{
			formstring += '<option' + ((i == 0) ? ' selected' : '') + ' value="' + (today.getFullYear() +i) + '">' + (today.getFullYear() + i) + '</option>';
		}
		formstring += '</select>�~&nbsp;&nbsp;<select name="month"><option value="">�C��</option>';
		for (i = 0; i < 12; i++){
			formstring += '<option' + ((i == today.getMonth()) ? ' selected' : '') + ' value="' + (i+1) + '">' + config.messages.dates.months[i] + '</option>';
		}
		formstring += '</select>��&nbsp;&nbsp;<select name="day"><option value="">�C��</option>';
		for (i = 1; i < 32; i++)
		{
			formstring += '<option' + ((i == (today.getDate() )) ? ' selected' : '') + ' value="' + i + '">' + i + '</option>';
		}
	
		formstring += '</select>��A&nbsp;&nbsp;�ƥ���D�G<input type="text" size="40" name="title" value="�п�J�ƥ���D" onfocus="this.select();"><input type="button" value="�T�w" onclick="addReminderToTiddler(this.form)"></form></html>';
	
		var panel = config.macros.slider.createSlider(place,null,"�s�W�ƥ�","�s�W�u�@���ت����ݨƥ�");
		wikify(formstring ,panel,null,store.getTiddler(params[1]));
	};
}
//}}}
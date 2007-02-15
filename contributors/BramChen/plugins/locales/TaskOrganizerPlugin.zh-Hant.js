/***
!TaskOrganizerPlugin.zh-Hant
***/
//{{{
if (typeof config.macros.taskOrganizer != "undefined"){
	merge(config.macros.taskOrganizer.options, {
		pendingTask: "待辦事項",
		completedTask: "已完成",
		newTask: {label: "新增工作項目", tooltip: "增加工作項目"},
		addTaskCategory: {label: "新增專案", tooltip: "增加專案"},
		deleteTaskCategory: {label: "刪除專案", tooltip: "刪除專案"},
		deleteCategoryConfirmation: "確定刪除此專案類別？",
		deleteTasksConfirmation: "包括這個專案底下的工作項目都會刪除，確定嗎？",
		newTaskCategoryPrompt: "請輸入新專案名稱："
	});
}
//}}}
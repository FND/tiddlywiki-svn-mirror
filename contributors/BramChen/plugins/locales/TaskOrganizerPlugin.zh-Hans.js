/***
!TaskOrganizerPlugin.zh-Hans
***/
//{{{
if (typeof config.macros.taskOrganizer != "undefined"){
	merge(config.macros.taskOrganizer.options, {
		pendingTask: "待办",
		completedTask: "完成",
		newTask: {label: "創建工作项目", tooltip: "創建一个工作项目"},
		addTaskCategory: {label: "創建专案", tooltip: "創建一个新专案或新类别"},
		deleteTaskCategory: {label: "删除专案", tooltip: "删除这个专案或类别"},
		deleteCategoryConfirmation: "确定要删除这个专案或类别？",
		deleteTasksConfirmation: "包括这个专案底下的工作项目都会删除，确定吗？",
		newTaskCategoryPrompt: "新专案名称："
	});
}
//}}}
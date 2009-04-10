/***
|''Name:''|KoreanTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Korean|
|''Author:''|Snooey(Seongsu Yoon) (tiddlywiki (at) snooey (dot) net)|
|''Source:''|http://snooey.net/tiddlywiki/locale.ko.js |
|'' ''|http://snooey.net/tiddlywiki/#KoreanTranslationPlugin |
|''CodeRepository:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/ko/locale.ko.js |
|''Version:''|0.5.2 rev.2|
|''Date:''|Jan 24, 2009|
|''Comments:''|If you have suggestion about this translation, please make comments at http://blog.snooey.net/guestbook/ or mail to me |
|'' ''|another suggestion, please make comments at http://groups.google.co.uk/group/TiddlyWikiDev |
|''License:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''~CoreVersion:''|2.4.3|
***/

/***
|''이름:''|KoreanTranslationPlugin|
|''설명:''|TiddlyWiki를 한국어로 번역|
|''제작자:''|Snooey(Seongsu Yoon) (tiddlywiki (at) snooey (dot) net)|
|''소스:''|http://snooey.net/tiddlywiki/locale.ko.js |
|'' ''|http://snooey.net/tiddlywiki/#KoreanTranslationPlugin |
|''코드 저장소:''|http://svn.tiddlywiki.org/Trunk/association/locales/core/ko/locale.ko.js |
|''버전:''|0.5.2 rev.2|
|''날짜:''|2009년 1월 9일|
|''덧글:''|이 번역에 대한 제안이 있으신 경우, http://blog.snooey.net/guestbook/ 또는 제게 메일을 보내주십시요. |
|'' ''|다른 제안은 http://groups.google.co.uk/group/TiddlyWikiDev으로 보내주십시요. |
|''라이센스:''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]] |
|''코어 버전:''|2.4.3|
***/

//{{{
//--
//-- 번역 가능한 문장
//--

// "쌍 따옴표" 내에 둔 구문만 수정하시고, '온 따옴표' 내에 둔 구문은 수정하지 마십시요.

config.locale = "ko"; // W3C 언어 태그

if (config.options.txtUserName == 'YourName') // 이 줄은 번역하지 마시고, 다음 줄부터 번역하십시요.
	merge(config.options,{txtUserName: "이름_지정_필요"});

merge(config.tasks,{
	save: {text: "저장", tooltip: "이 TiddlyWiki에 변경 사항을 저장합니다", action: saveChanges},
	sync: {text: "동기화", tooltip: "다른 TiddlyWiki 파일과 서버와 변경 사항을 동기화합니다", content: '<<sync>>'},
	importTask: {text: "가져오기", tooltip: "다른 TiddlyWiki 파일과 서버에서 티들러와 플러그인을 가져옵니다", content: '<<importTiddlers>>'},
	tweak: {text: "세부조정", tooltip: "TiddlyWiki의 모양과 형식을 조정합니다", content: '<<options>>'},
	upgrade: {text: "업그레이드", tooltip: "TiddlyWiki 코어 코드를 업그레이드합니다", content: '<<upgrade>>'},
	plugins: {text: "플러그인", tooltip: "설치된 플러그인을 관리합니다", content: '<<plugins>>'}
});

// Options은 옵션 패널과 쿠키에 설정될 수 있습니다.
merge(config.optionsDesc,{
	txtUserName: "편집한 티들러에 서명할 사용자 이름입니다.",
	chkRegExpSearch: "검색할 때 정규식을 사용할 수 있게 합니다.",
	chkCaseSensitiveSearch: "대소문자를 구분하여 찾습니다.",
	chkIncrementalSearch: "키 단위로 증가해가면서 찾습니다.",
	chkAnimate: "애니메이션 기능을 활성화합니다.",
	chkSaveBackups: "변경 사항을 저장할 때 백업을 만듭니다.",
	chkAutoSave: "자동으로 변경 사항을 저장합니다.",
	chkGenerateAnRssFeed: "변경 사항을 저장할 때 RSS 피드를 생성합니다.",
	chkSaveEmptyTemplate: "변경 사항을 저장할 때 빈 템플릿 파일을 만듭니다.",
	chkOpenInNewWindow: "외부 링크를 새 창으로 엽니다.",
	chkToggleLinks: "링크를 클릭하여 티들러를 열 때 닫히게 합니다.",
	chkHttpReadOnly: "HTTP를 통해 볼 때 편집 기능을 숨깁니다.",
	chkForceMinorUpdate: "티들러를 편집할 때 수정한 날짜와 사용자 이름으로 업데이트하지 않습니다.",
	chkConfirmDelete: "티들러를 삭제하기 전에 확인합니다.",
	chkInsertTabs: "탭 키를 사용했을 때 다른 필드로 넘어가는 대신 탭 문자를 사용하게 합니다.",
	txtBackupFolder: "백업을 생성할 때 사용할 폴더의 이름입니다.",
	txtMaxEditRows: "편집 상자의 최대 줄 수입니다.",
	txtFileSystemCharSet: "변경 사항 저장할 때 기본으로 사용할 문자셋(인코딩)입니다. (Firefox/Mozilla 전용)"});

merge(config.messages,{
	customConfigError: "플러그인을 읽어들이는 도중에 문제가 발생하였습니다. PluginManager에서 자세한 사항을 확인하십시요.",
	pluginError: "오류: %0",
	pluginDisabled: "'systemConfigDisable' 태그로 비활성화되어서 실행하지 않았습니다.",
	pluginForced: "'systemConfigForce' 태그로 인해 강제로 실행되었습니다.",
	pluginVersionError: "TiddlyWiki의 새 버전을 필요로 하는 플러그인이므로 실행하지 않았습니다.",
	nothingSelected: "아무것도 선택되지 않았습니다. 하나 이상의 항목을 먼저 선택하십시요.",
	savedSnapshotError: "이 TiddlyWiki는 잘못 저장된 것 같습니다. http://www.tiddlywiki.com/#DownloadSoftware에서 자세한 사항을 확인하십시요.",
	subtitleUnknown: "(알려지지 않음)",
	undefinedTiddlerToolTip: "티들러 '%0'이(가) 아직 존재하지 않습니다.",
	shadowedTiddlerToolTip: "티들러 '%0'이(가) 아직 존재하지 않지만, 숨김 값으로 이미 정의되어 있습니다.",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "%0(으)로 연결되는 외부 링크",
	noTags: "태그된 티들러가 없습니다.",
	notFileUrlError: "변경 사항을 저장하려면 먼저 이 TiddlyWiki를 저장해야 합니다.",
	cantSaveError: "변경 사항을 저장할 수 없습니다. 아래 이유가 원인일 수 있습니다.\n- 브라우저가 저장을 지원하지 않습니다. (Firefox와 Internet Explorer, Safari, Opera는 정확히 설정되어 있다면 잘 동작합니다.)\n- TiddlyWiki 파일이 위치한 곳의 경로명이 잘못된 문자를 포함하고 있습니다.\n- TiddlyWiki HTML 파일이 삭제되었거나 이름이 변경되었습니다.",
	invalidFileError: "원본 파일 '%0' 이(가) 정상적인 TiddlyWiki로 존재하지 않습니다.",
	backupSaved: "백업이 저장되었습니다.",
	backupFailed: "백업 파일을 저장하지 못하였습니다.",
	rssSaved: "RSS 피드가 저장되었습니다.",
	rssFailed: "RSS 피드 파일을 저장하지 못하였습니다.",
	emptySaved: "빈 템플릿 파일이 저장되었습니다.",
	emptyFailed: "빈 템플릿 파일을 저장하지 못하였습니다.",
	mainSaved: "메인 TiddlyWiki 파일이 저장되었습니다.",
	mainFailed: "메인 TiddlyWiki 파일을 저장하지 못하였습니다. 변경 사항이 저장되지 않았습니다.",
	macroError: "매크로<<\%0>>에 오류가 있습니다.",
	macroErrorDetails: "매크로 <<\%0>>을(를) 실행하는 중에 아래의 오류가 발생하였습니다.\n%1",
	missingMacro: "매크로가 존재하지 않습니다.",
	overwriteWarning: "'%0' 이름을 가진 티들러가 이미 존재합니다. 확인을 누르면 덮어씁니다.",
	unsavedChangesWarning: "주의! TiddlyWiki에 저장되지 않은 변경 사항이 있습니다.\n\n저장하려면 확인을 누르십시요.\n버리시려면 취소를 누르십시요.",
	confirmExit: "--------------------------------\n\nTiddlyWiki에 저장되지 않은 변경 사항이 있습니다. 계속하게 될 경우 변경 사항을 모두 잃어버리게 됩니다.\n\n--------------------------------",
	saveInstructions: "변경 사항 저장",
	unsupportedTWFormat: "'%0'은(는) 지원하지 않는 TiddlyWiki 형식입니다.",
	tiddlerSaveError: "티들러 '%0'을(를) 저장하는 중에 오류가 발생하였습니다.",
	tiddlerLoadError: "티들러 '%0'을(를) 읽어들이는 중에 오류가 발생하였습니다.",
	wrongSaveFormat: "저장 형식 '%0'(으)로 저장할 수 없습니다. 저장하려면 표준 형식을 사용하십시요.",
	invalidFieldName: "%0은(는) 잘못된 필드명입니다.",
	fieldCannotBeChanged: "필드 '%0'이(가) 변경되지 않았습니다.",
	loadingMissingTiddler: "티들러 '%0'을(를) '%1' 서버에서 가져오려고 시도하고 있습니다.\n\n위치: 호스트 '%2'의 작업공간 '%3'",
	upgradeDone: "%0 버전으로 업데이트가 완료되었습니다.\n\n새  TiddlyWiki를 불러오려면 '확인' 을 누르십시요."});

merge(config.messages.messageClose,{
	text: "닫기",
	tooltip: "메세지 창을 닫습니다."});

config.messages.backstage = {
	open: {text: "기능도구", tooltip: "작업 생성 및 편집을 수행할 수 있는 기능도구 공간을 엽니다."},
	close: {text: "닫기", tooltip: "기능도구 공간을 닫습니다."},
	prompt: "기능도구: ",
	decal: {
		edit: {text: "편집", tooltip: "티들러 '%0'을(를) 편집합니다."}
	}
};

config.messages.listView = {
	tiddlerTooltip: "이 티들러의 본문 전체를 보려면 클릭하십시요.",
	previewUnavailable: "(미리 보기가 존재하지 않습니다.)"
};

config.messages.dates.months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월","12월"];
config.messages.dates.days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
config.messages.dates.shortMonths = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월","12월"];
config.messages.dates.shortDays = ["일", "월", "화", "수", "목", "금", "토"];
//날짜 형식 설정입니다. 한국어에는 무의미하지요.
config.messages.dates.daySuffixes = ["일","일","일","일","일","일","일","일","일","일",
		"일","일","일","일","일","일","일","일","일","일",
		"일","일","일","일","일","일","일","일","일","일",
		"일"];
config.messages.dates.am = "오전";
config.messages.dates.pm = "오후";

merge(config.messages.tiddlerPopup,{
	});

merge(config.views.wikified.tag,{
	labelNoTags: "태그 없음",
	labelTags: "태그: ",
	openTag: "태그 '%0' 열기",
	tooltip: "태그 '%0'이(가) 달린 티들러 열기",
	openAllText: "모두 열기",
	openAllTooltip: "이 티들러 모두 열기",
	popupNone: "태그 '%0'이(가) 달린 다른 티들러가 없습니다."});

merge(config.views.wikified,{
	defaultText: "티들러 '%0'이(가) 아직 존재하지 않습니다. 만드려면 더블 클릭하세요.",
	defaultModifier: "(빠짐)",
	shadowModifier: "(내장된 숨김 티들러)",
	dateFormat: "YYYY년 MM월 DD일", // use this to change the date format for your locale, eg "YYYY MMM DD", do not translate the Y, M or D
	createdPrompt: "만든 날짜:"});

merge(config.views.editor,{
	tagPrompt: "태그는 공백으로 구분하여 입력하며, 필요한 경우 [[대괄호를 두 번 사용]]하거나, 이미 있는 태그를 추가하십시요.",
	defaultText: "'%0'에 넣을 본문을 입력하십시요."});

merge(config.views.editor.tagChooser,{
	text: "태그",
	tooltip: "이 티들러에 추가할 이미 있는 태그를 선택할 수 있습니다.",
	popupNone: "아무 태그도 정의되지 않았습니다.",
	tagTooltip: "태그 '%0'을(를) 추가합니다."});

merge(config.messages,{
	sizeTemplates:
		[
		{unit: 1024*1024*1024*1024, template: "%0\u00a0TB"},
		{unit: 1024*1024*1024, template: "%0\u00a0GB"},
		{unit: 1024*1024, template: "%0\u00a0MB"},
		{unit: 1024, template: "%0\u00a0KB"},
		{unit: 1, template: "%0\u00a0바이트"}
		]});

merge(config.macros.search,{
	label: "찾기",
	prompt: "이 TiddlyWiki에서 찾기",
	accessKey: "F",
	successMsg: "%1을(를) 포함한 티들러를 %0개 찾았습니다.",
	failureMsg: "%0을(를) 포함한 티들러를 찾지 못하였습니다."});

merge(config.macros.tagging,{
	label: "'태그: ",
	labelNotTag: "태그되지 않음",
	tooltip: "태그 '%0'이(가) 달린 티들러의 목록"});

merge(config.macros.timeline,{
	dateFormat: "YYYY년 MM월 DD일"});// 왼쪽에 나온 대로 날짜 형식을 수정하시면 됩니다. Y와 M, D는 수정하시면 안됩니다.

merge(config.macros.allTags,{
	tooltip: "태그 '%0'가 달린 티들러를 보입니다.",
	noTags: "태그가 달린 티들러가 없습니다."});

config.macros.list.all.prompt = "알파벳순으로 정렬된 모든 티들러를 보입니다.";
config.macros.list.missing.prompt = "링크는 되어 있으나 정의되지 않은 티들러를 보입니다.";
config.macros.list.orphans.prompt = "다른 티들러에 링크되지 않은 티들러를 보입니다.";
config.macros.list.shadowed.prompt = "기본값 본문을 가진 숨김 티들러를 보입니다.";
config.macros.list.touched.prompt = "지역적으로(로컬로) 수정된 티들러를 보입니다.";

merge(config.macros.closeAll,{
	label: "모두 닫기",
	prompt: "보이는 모든 티들러를 닫습니다(편집중인 티들러는 제외하고 닫습니다)."});

merge(config.macros.permaview,{
	label: "절대주소",
	prompt: "현재 보이는 티들러를 모두 볼 수 있는 하나의 URL 링크로 이동합니다."});

merge(config.macros.saveChanges,{
	label: "변경 사항 저장",
	prompt: "모든 티들러를 저장하여 새 TiddlyWiki를 구성합니다.",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "새 티들러",
	prompt: "새 티들러를 만듭니다.",
	title: "새 티들러",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "새 일정",
	prompt: "현재 날자와 시간으로 새 티들러를 만듭니다.",
	accessKey: "J"});

merge(config.macros.options,{
	wizardTitle: "세부조정 고급 옵션",
	step1Title: "이 옵션들은 브라우저의 쿠키로 저장됩니다.",
	step1Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='false' name='chkUnknown'>알려지지 않은 옵션 보이기</input>",
	unknownDescription: "//(알려지지 않음)//",
	listViewTemplate: {
		columns: [
			{name: 'Option', field: 'option', title: "옵션", type: 'String'},
			{name: 'Description', field: 'description', title: "설명", type: 'WikiText'},
			{name: 'Name', field: 'name', title: "명칭", type: 'String'}
			],
		rowClasses: [
			{className: 'lowlight', field: 'lowlight'}
			]}
	});

merge(config.macros.plugins,{
	wizardTitle: "플러그인 관리",
	step1Title: "현재 읽어들인 플러그인",
	step1Html: "<input type='hidden' name='markList'></input>", // 번역 금지
	skippedText: "(이 플러그인은 작동할 때부터 추가되어 있었기 때문에 실행되지 않았습니다.)",
	noPluginText: "아무런 플러그인도 설치되어 있지 않습니다.",
	confirmDeleteText: "아래의 플러그인을 정말 삭제하시겠습니까?\n\n%0",
	removeLabel: "systemConfig 태그 제거",
	removePrompt: "systemConfig 태그를 제거합니다.",
	deleteLabel: "삭제",
	deletePrompt: "이 티들러를 영구 삭제합니다.",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Description', field: 'desc', title: "설명", type: 'String'},
			{name: 'Tiddler', field: 'tiddler', title: "티들러", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "크기", type: 'Size'},
			{name: 'Forced', field: 'forced', title: "강제 실행됨", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "비활성화됨", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "읽어들여됨", type: 'Boolean', trueText: "Yes", falseText: "No"},
			{name: 'Startup Time', field: 'startupTime', title: "작동한 시간", type: 'String'},
			{name: 'Error', field: 'error', title: "상태", type: 'Boolean', trueText: "오류", falseText: "OK"},
			{name: 'Log', field: 'log', title: "로그", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			]}
	});

merge(config.macros.toolbar,{
	moreLabel: "더 보기",
	morePrompt: "다른 명령을 보입니다."
	});

merge(config.macros.refreshDisplay,{
	label: "새로 고침",
	prompt: "전체 TiddlyWiki 화면을 새로 보여줍니다."
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "읽기 전용 TiddlyWiki 파일을 가져올 수 없습니다. file:// URL을 사용해서 열어보십시오.",
	wizardTitle: "다른 파일이나 서버에서 티들러 가져오기",
	step1Title: "1단계: 서버나 TiddlyWiki 파일의 위치를 지정합니다.",
	step1Html: "서버의 종류 지정: <select name='selTypes'><option value=''>선택하세요...</option></select><br>URL 또는 경로를 이곳에 입력: <input type='text' size=50 name='txtPath'><br>또는 파일 찾기 이용: <input type='file' size=50 name='txtBrowse'><br><hr>또는 미리 지정된 피드 선택: <select name='selFeeds'><option value=''>선택하세요...</option></select>",
	openLabel: "열기",
	openPrompt: "파일 또는 서버와의 연결을 엽니다.",
	openError: "Tiddlywiki 파일을 불러오는 중에 문제가 발생하였습니다.",
	statusOpenHost: "호스트를 열고 있습니다.",
	statusGetWorkspaceList: "사용 가능한 작업공간의 목록을 받아오고 있습니다.",
	step2Title: "2단계: 작업공간을 선택합니다.",
	step2Html: "작업공간의 이름 입력: <input type='text' size=50 name='txtWorkspace'><br>.또는 작업공간 선택: <select name='selWorkspace'><option value=''>선택하세요...</option></select>",
	cancelLabel: "취소",
	cancelPrompt: "가져오기를 취소합니다.",
	statusOpenWorkspace: "작업공간을 열고 있습니다.",
	statusGetTiddlerList: "사용 가능한 티들러의 목록을 받아오고 있습니다.",
	errorGettingTiddlerList: "티들러의 목록을 받아오는 중에 오류가 발생하였습니다. 다시 시도하려면 취소를 클릭하세요.",
	step3Title: "3단계: 가져올 티들러를 선택합니다.",
	step3Html: "<input type='hidden' name='markList'></input><br><input type='checkbox' checked='true' name='chkSync'>이 티들러를 다음에 변경 사항이 있을 때 동기화할 수 있게 이 서버와의 연결을 유지해둡니다.</input><br><input type='checkbox' name='chkSave'>다음 내용을 제목으로 만든 티들러에 이 서버의 자세한 사항을 'systemServer' 태그를 달아 기록:</input> <input type='text' size=25 name='txtSaveTiddler'>",
	importLabel: "가져오기",
	importPrompt: "이 티들러를 가져옵니다.",
	confirmOverwriteText: "아래 티들러를 덮어쓰시겠습니까?\n\n%0",
	step4Title: "4단계: %0개의 티들러를 가져오고 있습니다.",
	step4Html: "<input type='hidden' name='markReport'></input>", // 번역 금지
	doneLabel: "완료",
	donePrompt: "마법사를 닫습니다.",
	statusDoingImport: "티들러를 불러오고 있습니다.",
	statusDoneImport: "모든 티들러를 가져왔습니다.",
	systemServerNamePattern: "호스트 %1의 %2",
	systemServerNamePatternNoWorkspace: "호스트 %1",
	confirmOverwriteSaveTiddler: "티들러 '%0'이(가) 이미 존재합니다. 이 서버의 항목으로 덮어쓰려면 '확인'을, 바꾸지 않으시려면 '취소'를 선택하십시요.",
	serverSaveTemplate: "|''종류:''|%0|\n|''URL:''|%1|\n|''작업공간:''|%2|\n\n이 티들러는 해당 서버의 자세한 사항을 기록한 내용으로 자동 생성된 티들러입니다.",
	serverSaveModifier: "(시스템)",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "티들러", type: 'Tiddler'},
			{name: 'Size', field: 'size', tiddlerLink: 'size', title: "크기", type: 'Size'},
			{name: 'Tags', field: 'tags', title: "태그", type: 'Tags'}
			],
		rowClasses: [
			]}
	});

merge(config.macros.upgrade,{
	wizardTitle: "TiddlyWiki 코어 코드 업그레이드",
	step1Title: "이 TiddlyWiki를 최근 버전으로 업데이트하거나 고칩니다.",
	step1Html: "새 버전의 TiddlyWiki 코어 코드로 업그레이드하려고 합니다. (위치: <a href='%0' class='externalLink' target='_blank'>%1</a>). 업그레이드되어도 내용은 보존될 것입니다.<br><br>코어 업그레이드가 기존 플러그인과 충돌을 일으킬 수 있음을 주의하십시오. 만약 업그레이드된 파일을 실행하는 데에 문제가 발생한다면, <a href='http://www.tiddlywiki.org/wiki/CoreUpgrades' class='externalLink' target='_blank'>http://www.tiddlywiki.org/wiki/CoreUpgrades</a>를 참고하십시요.",
	errorCantUpgrade: "이 TiddlyWiki를 업그레이드할 수 없습니다. 로컬로 저장된 TiddlyWiki 파일만 업그레이드를 수행할 수 있습니다.",
	errorNotSaved: "업그레이드를 수행하기 전에 변경 사항을 저장해야 합니다.",
	step2Title: "업그레이드 사항 확인",
	step2Html_downgrade: "TiddlyWiki 버전을 %1에서 %0으로 다운그레이드하려고 합니다.<br><br>코어 코드를 이전 버전으로 다운그레이드하는 것은 권장하지 않습니다.",
	step2Html_restore: "이 TiddlyWiki의 코어 코드는 이미 최근 버전(%0)을 사용하고 있습니다.<br><br>코어 코드를 손상하거나 파괴하지 않고 안전하게 업그레이드를 계속할 수 있습니다.",
	step2Html_upgrade: "TiddlyWiki 버전을 %1에서 %0로 업그레이드하려고 합니다.",
	upgradeLabel: "업그레이드",
	upgradePrompt: "업그레이드 과정 준비",
	statusPreparingBackup: "백업을 준비하고 있습니다.",
	statusSavingBackup: "백업 파일을 저장하고 있습니다.",
	errorSavingBackup: "백업 파일을 저장하는 중에 문제가 발생하였습니다.",
	statusLoadingCore: "코어 코드를 읽어들이고 있습니다.",
	errorLoadingCore: "코어 코드를 읽어들이는 중에 문제가 발생하였습니다.",
	errorCoreFormat: "새 코어 코드에 오류가 있습니다.",
	statusSavingCore: "새 코어 코드를 저장하고 있습니다.",
	statusReloadingCore: "새 코어 코드를 다시 읽어들이고 있습니다.",
	startLabel: "시작",
	startPrompt: "업그레이드 과정을 시작합니다.",
	cancelLabel: "취소",
	cancelPrompt: "업그레이드 과정을 취소합니다.",
	step3Title: "업그레이드가 취소되었습니다.",
	step3Html: "업그레이드 과정을 취소하였습니다."
	});

merge(config.macros.sync,{
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'selected', rowName: 'title', type: 'Selector'},
			{name: 'Tiddler', field: 'tiddler', title: "티들러", type: 'Tiddler'},
			{name: 'Server Type', field: 'serverType', title: "서버 종류", type: 'String'},
			{name: 'Server Host', field: 'serverHost', title: "서버 호스트", type: 'String'},
			{name: 'Server Workspace', field: 'serverWorkspace', title: "서버 작업공간", type: 'String'},
			{name: 'Status', field: 'status', title: "동기화 상태", type: 'String'},
			{name: 'Server URL', field: 'serverUrl', title: "서버 URL", text: "View", type: 'Link'}
			],
		rowClasses: [
			],
		buttons: [
			{caption: "이 티들러 동기화", name: 'sync'}
			]},
	wizardTitle: "외부 서버와 파일과 동기화",
	step1Title: "동기화하고자 하는 티들러를 선택해 주십시요.",
	step1Html: "<input type='hidden' name='markList'></input>", // 번역 금지
	syncLabel: "동기화",
	syncPrompt: "이 티들러를 동기화합니다.",
	hasChanged: "연결되지 않은 동안 변경됨",
	hasNotChanged: "연결되지 않은 동안 변경되지 않음",
	syncStatusList: {
		none: {text: "...", display:null, className:'notChanged'},
		changedServer: {text: "서버에서 변경됨", display:null, className:'changedServer'},
		changedLocally: {text: "로컬에서 변경됨", display:null, className:'changedLocally'},
		changedBoth: {text: "서버와 로컬에서 변경됨", display:null, className:'changedBoth'},
		notFound: {text: "서버에서 찾을 수 없음", display:null, className:'notFound'},
		putToServer: {text: "서버에 업데이트 저장함", display:null, className:'putToServer'},
		gotFromServer: {text: "서버에서 업데이트 가져옴", display:null, className:'gotFromServer'}
		}
	});

merge(config.macros.annotations,{
	});

merge(config.commands.closeTiddler,{
	text: "닫기",
	tooltip: "이 티들러를 닫습니다."});

merge(config.commands.closeOthers,{
	text: "다른 티들러 닫기",
	tooltip: "다른 모든 티들러를 닫습니다."});

merge(config.commands.editTiddler,{
	text: "편집",
	tooltip: "이 티들러들 편집합니다.",
	readOnlyText: "보기",
	readOnlyTooltip: "이 티들러의 소스를 봅니다."});

merge(config.commands.saveTiddler,{
	text: "완료",
	tooltip: "이 티들러의 변경 사항을 저장합니다."});

merge(config.commands.cancelTiddler,{
	text: "취소",
	tooltip: "이 티들러의 변경 사항을 되돌립니다.",
	warning: "'%0'의 변경 사항을 정말 버리시겠습니까?",
	readOnlyText: "완료",
	readOnlyTooltip: "이 티들러를 보통 모양로 봅니다."});

merge(config.commands.deleteTiddler,{
	text: "삭제",
	tooltip: "이 티들러를 삭제합니다.",
	warning: "'%0'을(를) 정말 삭제하시겠습니까?"});

merge(config.commands.permalink,{
	text: "절대주소",
	tooltip: "이 티들러의 절대주소입니다."});

merge(config.commands.references,{
	text: "연관글",
	tooltip: "이 티들러로 링크된 티들러를 보여줍니다.",
	popupNone: "연관글 없음"});

merge(config.commands.jump,{
	text: "건너뛰기",
	tooltip: "열려있는 다른 티들러로 건너뜁니다."});

merge(config.commands.syncing,{
	text: "동기화",
	tooltip: "이 티들러를 서버나 외부 파일과 동기화합니다.",
	currentlySyncing: "<div>현재 <span class='popupHighlight'>'%0'</span>을 통해 아래와 동기화하고 있습니다.</"+"div><div>호스트: <span class='popupHighlight'>%1</span></"+"div><div>작업공간: <span class='popupHighlight'>%2</span></"+"div>", // Note escaping of closing <div> tag
	notCurrentlySyncing: "현재 동기화하고 있지 않습니다.",
	captionUnSync: "이 티들러의 동기화 중단.",
	chooseServer: "이 티들러를 다른 서버와 동기화",
	currServerMarker: "\u25cf ",
	notCurrServerMarker: "  "});

merge(config.commands.fields,{
	text: "필드",
	tooltip: "이 티들러의 확장된 필드를 보여줍니다.",
	emptyText: "이 티들러에 확장된 필드가 없습니다.",
	listViewTemplate: {
		columns: [
			{name: 'Field', field: 'field', title: "필드", type: 'String'},
			{name: 'Value', field: 'value', title: "값", type: 'String'}
			],
		rowClasses: [
			],
		buttons: [
			]}});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "[[처음 사용자용 문서]]",
	MainMenu: "[[처음 사용자용 문서]]\n\n\n^^~TiddlyWiki 버전 <<version>>\nⓒ 2009 [[UnaMesa|http://www.unamesa.org/]]^^",
	"처음 사용자용 문서": "이 빈 TiddlyWiki의 사용을 시작하려면 아래 티들러를 수정해야 합니다.\n* SiteTitle & SiteSubtitle: 상단에 보이는 이 사이트에 제목과 부제목입니다. (저장 후에는 브라우저 타이틀 바에도 보입니다.)\n* MainMenu: 메뉴(대개 왼쪽에 있음)\n* DefaultTiddlers: TiddlyWiki가 열렸을 때 띄울 티들러의 이름을 포함하고 있습니다.\n또한 편집한 티들러에 서명할 사용자 이름을 다음 칸에 해야 합니다. <<option txtUserName>>",
	SiteTitle: "내 TiddlyWiki",
	SiteSubtitle: "재사용 가능한 줄없는 개인 웹 공책",
	SiteUrl: "http://www.tiddlywiki.com/",
	TrOptionsPanel: "TiddlyWiki를 개인화 설정하는 이 인터페이스 옵션은 브라우저에 저장됩니다.\n\n편집한 티들러에 서명할 사용자 이름입니다. 위키 단어 입력하듯이 입력하십시요. (예 JoeBloggs)\n<<option txtUserName>>\n\n<<option chkSaveBackups>> [[백업 저장|SaveBackups]]\n<<option chkAutoSave>> [[자동 저장|AutoSave]]\n<<option chkRegExpSearch>> [[정규식 찾기|RegExpSearch]]\n<<option chkCaseSensitiveSearch>> [[대소문자 구분하여 찾기|CaseSensitiveSearch]]\n<<option chkAnimate>> [[애니메이션 활성화|EnableAnimations]]\n----\n[[고급 옵션|AdvancedOptions]] 참고",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "YYYY년 MM월 DD일" "일정">><<saveChanges>><<slider chkSliderOptionsPanel TrOptionsPanel "옵션 \u00bb" "TiddlyWiki의 고급 옵션을 바꿉니다.">>',
	SideBarTabs: '<<tabs txtMainTab "시간순" "티들러를 시간순으로 나열합니다." TabTimeline "모두" "모든 티들러를 보입니다." TabAll "태그" "모든 태그를 보입니다." TabTags "더보기" "다른 종류의 목록을 보입니다." TabMore>>',
	TabMore: '<<tabs txtMoreTab "빠짐" "빠진 티들러를 보입니다." TabMoreMissing "홀로섬" "홀로 선 티들러를 보입니다." TabMoreOrphans "숨김" "숨김 티들러를 보입니다." TabMoreShadowed>>'
	});

merge(config.annotations,{
	AdvancedOptions: "이 숨김 티들러는 몇 가지 고급 옵션을 추가하여 제공합니다.",
	ColorPalette: "이 숨김 티들러는 TiddlyWiki의 사용자 인터페이스의 색 배합을 결정하는 값들을 가지고 있습니다.",
	DefaultTiddlers: "이 숨김 티들러는 TiddlyWiki가 시작했을 때 자동으로 보여지는 티들러를 나열합니다.",
	EditTemplate: "이 숨김 티들러의 HTML 템플릿은 티들러가 편집될 때 어떤 식으로 보일 지를 결정합니다.",
	GettingStarted: "이 숨김 티들러는 기본 사용법 설명을 제공합니다.",
	"처음 사용자용 문서": "이 숨김 티들러는 'GettingStarted' 티들러를 한국어로 번역한 티들러입니다.",
	ImportTiddlers: "이 숨김 티들러는 티들러를 가져오는 기능을 제공합니다.",
	MainMenu: "이 숨김 티들러는 왼쪽 열의 메인 메뉴의 내용을 포함하고 있습니다.",
	MarkupPreHead: "이 티들러는 TiddlyWiki HTML 파일의 <head> 태그 내 상단에 삽입됩니다.",
	MarkupPostHead: "이 티들러는 TiddlyWiki HTML 파일의 <head>태그 내 하단에 삽입됩니다.",
	MarkupPreBody: "이 티들러는 TiddlyWiki HTML 파일의 <body> 태그 내 상단에 삽입됩니다.",
	MarkupPostBody: "이 티들러는 TiddlyWiki HTML 파일의 <body> 태그 내 하단에 있는 script 부분 바로 다음에 삽입됩니다.",
	OptionsPanel: "이 숨김 티들러는 오른쪽 열 사이드바의 옵션 패널 슬라이드의 내용을 포함하고 있습니다.",
	TrOptionsPanel: "이 숨김 티들러는 'OptionsPanel' 티들러를 한국어로 번역한 티들러입니다.",
	PageTemplate: "이 숨김 티들러의 HTML 템플릿은 TiddlyWiki 레이아웃 전체를 결정합니다.",
	PluginManager: "이 숨김 티들러는 플러그인 관리자 기능을 제공합니다.",
	SideBarOptions: "이 숨김 티들러는 오른쪽 열 사이드바의 옵션 패널의 내용을 포함하고 있습니다.",
	SideBarTabs: "이 숨김 티들러는 오른쪽 열 사이드바의 탭 패널의 내용을 포함하고 있습니다.",
	SiteSubtitle: "이 숨김 티들러는 페이지 제목의 두번째 부분의 내용을 포함하고 있습니다.",
	SiteTitle: "이 숨김 티들러는 페이지 제목의 첫번째 부분의 내용을 포함하고 있습니다.",
	SiteUrl: "이 숨김 티들러의 내용은 출판용으로 쓸 URL 경로 전체로 지정되어야 합니다.",
	StyleSheetColors: "이 숨김 티들러는 페이지 구성요소의 색과 관계된 CSS 정의를 포함하고 있습니다. ''이 티들러를 수정하지 마십시오.'' 대신 StyleSheet 숨김 티들러에 변경 사항을 넣으십시요.",
	StyleSheet: "이 티들러는 개인 CSS 정의를 포함할 수 있습니다.",
	StyleSheetLayout: "이 숨김 티들러는 페이지 구성요소의 레이아웃과 관계된 CSS 정의를 포함하고 있습니다. ''이 티들러를 수정하지 마십시오.'' 대신 StyleSheet 숨김 티들러에 변경 사항을 넣으십시요.",
	StyleSheetLocale: "이 숨김 티들러는 번역된 로케일과 관련된 CSS 정의를 포함하고 있습니다.",
	StyleSheetPrint: "이 숨김 티들러는 인쇄와 관련된 CSS 정의를 포함하고 있습니다.",
	TabAll: "이 숨김 티들러는 오른쪽 열 사이드바의 '모두' 탭의 내용을 포함하고 있습니다.",
	TabMore: "이 숨김 티들러는 오른쪽 열 사이드바의 '더보기' 탭의 내용을 포함하고 있습니다.",
	TabMoreMissing: "이 숨김 티들러는 오른쪽 열 사이드바의 '빠짐' 탭의 내용을 포함하고 있습니다.",
	TabMoreOrphans: "이 숨김 티들러는 오른쪽 열 사이드바의 '홀로섬' 탭의 내용을 포함하고 있습니다.",
	TabMoreShadowed: "이 숨김 티들러는 오른쪽 열 사이드바의 '숨김' 탭의 내용을 포함하고 있습니다.",
	TabTags: "이 숨김 티들러는 오른쪽 열 사이드바의 '태그' 탭의 내용을 포함하고 있습니다.",
	TabTimeline: "이 숨김 티들러는 오른쪽 열 사이드바의 '시간순' 탭의 내용을 포함하고 있습니다.",
	ToolbarCommands: "이 숨김 티들러는 티들러 도구바에 보이는 명령을 결정합니다.",
	ViewTemplate: "이 숨김 티들러의 HTML 템플릿은 티들러가 어떻게 보일 지를 결정합니다."
	});

//}}}
/***
|''Name:''|TurkishTranslationPlugin|
|''Description:''|Translation of TiddlyWiki into Turkish|
|''Source:''|www.fazlamesai.net/sundance|
|''Author:''|Kıvılcım Hindistan|
|''Version:''|1.0.0|
|''Date:''|Dec 05, 2006|
|''Comments:''|Please make comments at http://groups.google.co.uk/group/TiddlyWikiDev|
|''License:''|[[Creative Commons Attribution-ShareAlike 2.5 License|http://creativecommons.org/licenses/by-sa/2.5/]]|
|''~CoreVersion:''|2.1.0|
***/

/*{{{*/
// Translateable strings
// ---------------------

// Strings in "double quotes" should be translated; strings in 'single quotes' should be left alone

merge(config.options,{
	txtUserName: "İsminiz"});

merge(config.messages,{
	customConfigError: "Pluginleri yüklerken problemlerle karşılaşılmıştır. Detaylar için Plugin Yöneticisine bakınız.",
	pluginError: "Hata: %0",
	pluginDisabled: "'systemConfigDisable' etiketi tarafından devre dışı bırakıldığı için işleme konulmamıştır.",
	pluginForced: "'systemConfigForce' etiketi yüzünden işleme konulmuştur.tag",
	pluginVersionError: "Bu plugin Tiddly Wiki'nin yeni bir sürümünü gerektirdiğinden çalıştırılmamıştır.",
	nothingSelected: "Seçili öğe yok. Öncelikle bir ya da birden fazla öğe seçmeniz lazım.",
	savedSnapshotError: "Görünüşe göre TiddlyWiki hatalı olarak kaydedilmiştir. Detaylar için http://www.tiddlywiki.com/#DownloadSoftware adresine bakın",
	subtitleUnknown: "(bilinmiyor)",
	undefinedTiddlerToolTip: "'%0' isminde bir notcuk yok",
	shadowedTiddlerToolTip: "'%0' isminde oluşturulmuş bir notcuk yok, fakat ön tanımlı bir gölge değer var",
	tiddlerLinkTooltip: "%0 - %1, %2",
	externalLinkTooltip: "%0'a dış link",
	noTags: "Etiketlenmiş notcuk bulunmamaktadır",
	notFileUrlError: "Değişiklikleri kaydedebilmek için bu TiddlyWiki'yi bir dosyaya kaydetmeniz gerekmektedir",
	cantSaveError: "Değişiklikleri kaydetmek mümkün değildir. Olası sebepler:\n- Tarayıcınız dosya kaydetmeyi desteklemiyordur. (Firefox, Internet Explorer, Safari and Opera doğru konfigüre edildilerse bu özelliği desteklemektedirler)\n- TiddlyWiki dosyanızın sistemdeki yolu, problemli karakterler içermektedir \n-  TiddlyWiki HTML dosyanız başka bir yere taşınmış ya da ismi değiştirilmiştir.",
	invalidFileError: "Orjinal '%0' dosyası geçerli bir TiddlyWiki'ye benzemiyor",
	backupSaved: "Yedek dosyası kaydedildi",
	backupFailed: "Yedek dosyasının kaydı başarılamadı",
	rssSaved: "RSS akışı kaydedildi",
	rssFailed: "RSS akış dosyası kaydedilemedi",
	emptySaved: "Boş şablon dosyası kaydedildi",
	emptyFailed: "Boş şablon dosyası kaydedilemedi",
	mainSaved: "Ana TiddlyWiki dosyası kaydedildi",
	mainFailed: "Ana TiddlyWiki dosyasının kaydı başarılamadı. Yaptığınız değişiklikler kaydedilemedi.",
	macroError: "<<%0>> makrosunda hata var",
	macroErrorDetails: "<<%0>>:\n%1 makrosu çalıştırılırken hata gerçekleşti",
	missingMacro: "Böyle bir makro yok",
	overwriteWarning: "'%0' isimli bir notcuk halihazırda var. Üstüne yazmak için OK seçin",
	unsavedChangesWarning: "DİKKAT!  TiddlyWiki'de kaydedilmemiş değişiklikler var\n\n Kaydetmek için OK'e basın\nDeğişikliklerden vazgeçmek için CANCEL'a basın",
	confirmExit: "--------------------------------\n\nTiddlyWiki'de kaydedilmemiş değişiklikler var. Eğer devam ederseniz bu değişiklikleri kaybedeceksiniz.\n\n--------------------------------",
	saveInstructions: "DeğişiklikleriKaydet",
	unsupportedTWFormat: "Desteklenmeyen TiddlyWiki formatı '%0'",
	tiddlerSaveError: "'%0 isimli notcuku kaydederken hata oluştu'",
	tiddlerLoadError: "'%0' isimli notcuku yüklerken hata oluştu",
	wrongSaveFormat: "'%0' kayıt formatında kaydedilemedi. Kayıt için standart format kullanılıyor..",
	invalidFieldName: "%0 geçersiz alan ismi",
	fieldCannotBeChanged: "'%0' alanı değiştirilemez."});

merge(config.messages.messageClose,{
	text: "kapat",
	tooltip: "bu mesaj alanını kapat"});

config.messages.dates.months = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım","Aralık"];
config.messages.dates.days = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
config.messages.dates.shortMonths = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
config.messages.dates.shortDays = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

merge(config.views.wikified.tag,{
	labelNoTags: "etiket yok",
	labelTags: "etiketler: ",
	openTag: "açık etiketler '%0'",
	tooltip: "'%0' ile etiketlenmiş notcukları göster",
	openAllText: "hepsini aç",
	openAllTooltip: "Bu notcuklar için hepsini aç",
	popupNone: "'%0' ile etiketlenmiş başka notcuk yok"});

merge(config.views.wikified,{
	defaultText: "'%0' notu halihazırda mevcut değil. Oluşturmak için çift klikleyin",
	defaultModifier: "(eksik)",
	shadowModifier: "(dahili gölge notcuk)",
	createdPrompt: "Oluşturulduğu tarih"});

merge(config.views.editor,{
	tagPrompt: "Etiketleri boşluklarla ayırarak yazınız. Eğer gerekirse  [[çift köşeli parantez]] kullanın, yad da mevcut etiketlerden seçtiklerinizi ekleyin",
	defaultText: "'%0' için olan metni girin"});

merge(config.views.editor.tagChooser,{
	text: "tags",
	tooltip: "Bu nota uygun etiketleri seçiniz",
	popupNone: "Tanımlanmış bir etiket bulunmamaktadır",
	tagTooltip: "'%0' isimli notu ekle"});

merge(config.macros.search,{
	label: "arama",
	prompt: "Bu TiddlyWiki'de ara",
	accessKey: "F",
	successMsg: "%1'e uyan %0 notcuk bulundu",
	failureMsg: "%0'e uygun notcuk bulunamadı"});

merge(config.macros.tagging,{
	label: "etiketliyor: ",
	labelNotTag: "etiketlenmiyor",
	tooltip: "'%0' ile etiketlenmiş notcuklar"});

merge(config.macros.timeline,{
	dateFormat: "DD MMM YYYY"});

merge(config.macros.allTags,{
	tooltip: "'%0' ile etiketlenmiş notcukları göster",
	noTags: "Etiketlenmiş notcuk bulunmamakta"});

config.macros.list.all.prompt = "Bütün notcuklar alfabetik sırada";
config.macros.list.missing.prompt = "Kendilerine bağ bulunan fakat tanımlanmamış notcuklar";
config.macros.list.orphans.prompt = "Başka notlardan kendisine hiçbir bağ bulunmayan notcuklar";
config.macros.list.shadowed.prompt = "Öntanımlı içerikle doldurulmuş notcuklar";

merge(config.macros.closeAll,{
	label: "hepsini kapat",
	prompt: "Bütün görüntülenen notcukları kapat.(düzenlenenler dışında)"});

merge(config.macros.permaview,{
	label: "kalıcı görüntü",
	prompt: "Görüntülenmekte olan mevcut bütün notlara işaret eden bir bağ"});

merge(config.macros.saveChanges,{
	label: "değişiklikleri kaydet",
	prompt: "Yeni bir TiddlyWiki oluşturmak için bütün notcukları kaydet",
	accessKey: "S"});

merge(config.macros.newTiddler,{
	label: "yeni notcuk",
	prompt: "yeni bir notcuk oluştur",
	title: "Yeni Notcuk ",
	accessKey: "N"});

merge(config.macros.newJournal,{
	label: "yeni jurnal",
	prompt: "Mevcut tarih ve saatten yeni bir notcuk oluştur",
	accessKey: "J"});

merge(config.macros.plugins,{
	wizardTitle: "Pluginler",
	skippedText: "(Bu plugin TiddlyWiki başlatıldıktan sonra eklendiği için çalıştırılamamıştır)",
	step1: "Şu anda yüklenmekte olan pluginler",
	noPluginText: "Kurulu plugin bulunmamaktadır",
	confirmDeleteText: "Bu notcukları silmek istiyor musunuz?:\n\n%0",
	listViewTemplate : {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', tiddlerLink: 'title', title: "Başlık", type: 'TiddlerLink'},
			{name: 'Forced', field: 'forced', title: "Zorunlu", tag: 'systemConfigForce', type: 'TagCheckbox'},
			{name: 'Disabled', field: 'disabled', title: "Devredışı", tag: 'systemConfigDisable', type: 'TagCheckbox'},
			{name: 'Executed', field: 'executed', title: "Yüklü", type: 'Boolean', trueText: "Evet", falseText: "Hayır"},
			{name: 'Error', field: 'error', title: "Durum", type: 'Boolean', trueText: "Hata", falseText: "Tamam"},
			{name: 'Log', field: 'log', title: "Log", type: 'StringList'}
			],
		rowClasses: [
			{className: 'error', field: 'error'},
			{className: 'warning', field: 'warning'}
			],
		actions: [
			{caption: "Başka işlemle...", name: ''},
			{caption: "systemConfig etiketini silin", name: 'remove'},
			{caption: "Bu notcukları sonsuza kadar silin", name: 'delete'}
			]}
	});

merge(config.macros.refreshDisplay,{
	label: "yenile",
	prompt: "Bütün TiddlyWiki ekranını yenile"
	});

merge(config.macros.importTiddlers,{
	readOnlyWarning: "Mevcut notcukları salt-okunur bir TiddlyWiki'ye giremezsiniz. TiddlyWiki dosyasını  file:// URL şeklinde yerelinizde açmayı deneyin",
	defaultPath: "http://www.tiddlywiki.com/index.html",
	fetchLabel: "Getir",
	fetchPrompt: "TiddlyWiki dosyasını getir",
	fetchError: "TiddlyWiki dosyası getirilirken problemler yaşandı",
	confirmOverwriteText: "Bu notcukların üzerine yazmak istiyor musunuz? :\n\n%0",
	wizardTitle: "Başka bir TiddlyWiki dosyasından notcukları almak",
	step1: "Adım 1: TiddlyWiki dosyasını seçin",
	step1prompt: "URL ya da dosya sistemindeki yeri girin: ",
	step1promptFile: "...veya dosyayı bulun: ",
	step1promptFeeds: "...ya da daha önceden tanımlanmış bir akışı seçin: ",
	step1feedPrompt: "Seçin...",
	step2: "Adım 2: TiddlyWiki dosyası yükleniyor",
	step2Text: "Dosya %0'dan yüklenirken lütfen bekleyin.",
	step3: "Adım 3: Transfer edilecek notcukları seçin",
	step4: "%0 notcuk transfer edildi",
	step5: "Bitti",
	listViewTemplate: {
		columns: [
			{name: 'Selected', field: 'Selected', rowName: 'title', type: 'Selector'},
			{name: 'Title', field: 'title', title: "Başlık", type: 'String'},
			{name: 'Snippet', field: 'text', title: "Snippet", type: 'String'},
			{name: 'Tags', field: 'tags', title: "Etiketler", type: 'Tags'}
			],
		rowClasses: [
			],
		actions: [
			{caption: "Diğer eylemler...", name: ''},
			{caption: "Bu notcukları transfer et", name: 'import'}
			]}
	});

merge(config.commands.closeTiddler,{
	text: "kapat",
	tooltip: " Bu notu kapat"});

merge(config.commands.closeOthers,{
	text: "diğerlerini kapat",
	tooltip: "Bütün diğer notcukları kapat"});

merge(config.commands.editTiddler,{
	text: "düzenle",
	tooltip: "Bu notu düzenle",
	readOnlyText: "göster",
	readOnlyTooltip: "Bu notun kaynak kodunu göster"});

merge(config.commands.saveTiddler,{
	text: "bitti",
	tooltip: "Bu nottaki değişiklikleri kaydet"});

merge(config.commands.cancelTiddler,{
	text: "iptal et",
	tooltip: "Bu nottaki değişiklikleri iptal et",
	warning: "'%0' notundaki değişikliklerinizi iptal etmek istiyor musunuz?",
	readOnlyText: "bitti",
	readOnlyTooltip: "B notu normal haliyle göster"});

merge(config.commands.deleteTiddler,{
	text: "sil",
	tooltip: "Bu notu sil",
	warning: "'%0' notunu silmek istiyor musunuz?"});

merge(config.commands.permalink,{
	text: "kalıcı bağ",
	tooltip: "Bu notcuk için kalıcı bağ"});

merge(config.commands.references,{
	text: "referanslar",
	tooltip: "Bu nota olan referansları göster",
	popupNone: "Hiç referans yok"});

merge(config.commands.jump,{
	text: "atla",
	tooltip: "Açık olan bir başka nota geçmek"});

merge(config.shadowTiddlers,{
	DefaultTiddlers: "[[Başlamak]]",
	MainMenu: "[[Başlamak]]",
	SiteTitle: "Benim ~TiddlyWiki'm",
	SiteSubtitle: "tekrar kullanılabilir, sırasal olmayan, web defteri",
	SiteUrl: "http://www.tiddlywiki.com/",
	SideBarOptions: '<<search>><<closeAll>><<permaview>><<newTiddler>><<newJournal "DD MMM YYYY">><<saveChanges>><<slider chkSliderOptionsPanel [[SeçeneklerPaneli]] "seçenekler" "Gelişmiş TiddlyWiki seçeneklerini değiştirmek">>',
	SideBarTabs: '<<tabs txtMainTab "Zaman Akışı" "Zaman Akışı" TabTimeline "Tümü" "Bütün notcuklar" TabAll "Etiket" "Bütün etiketler" TabTags "Daha" "Daha fazla notcuk" TabMore>>',
	TabTimeline: '<<timeline>>',
	TabAll: '<<list all>>',
	TabTags: '<<allTags excludeLists>>',
	TabMore: '<<tabs txtMoreTab "Kayıp" "Kayıp notcuklar" TabMoreMissing "Yetimler" "Yetim notcuklar" TabMoreOrphans "Gölgelenmiş" "Gölgelenmiş notcuklar" TabMoreShadowed>>',
	TabMoreMissing: '<<list missing>>',
	TabMoreOrphans: '<<list orphans>>',
	TabMoreShadowed: '<<list shadowed>>',
	PluginYöneticisi: '<<plugins>>',
	NotTransferEtmek: '<<importTiddlers>>'});

/*}}}*/

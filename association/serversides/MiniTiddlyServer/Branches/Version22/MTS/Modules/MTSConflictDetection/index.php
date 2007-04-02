<?php

$module = new Module("Sean Clark Hess","1.0","http://www.minitiddlyserver.com");

$module->addEventPHP("SaveHighPriority","ConflictsSave.php");
$module->addEventPHP("PostSaveEvent","ConflictsPostSave.php");
$module->addEventPHP("ConflictsInitEvent","ConflictsInitEvent.php");
$module->addHTMLMacro("mtsconflictcleanup","ConflictCleanup.html");
$module->addEventPHP("ConflictCleanupEvent","ConflictCleanupEvent.php");
$module->addScript("Conflicts.js");

?>
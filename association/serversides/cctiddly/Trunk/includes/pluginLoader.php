<?php
include('pluginsLoaderClass.php');
global $pluginsLoader;
$pluginsLoader = new PluginsLoader();
$pluginsLoader->includePlugins($cct_base);
$pluginsLoader->runPlugins();
?>2
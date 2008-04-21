<?php
include_once($cct_base."tiddlers/ccVariables.php");




$dir = $cct_base."ccPlugins/";

// Open a known directory, and proceed to read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
       while (($file = readdir($dh)) !== false) {
			$ext = substr($file, strrpos($file, '.') + 1); 
			if ($ext == "js")
			{
				$tiddler_name = str_replace('.js', '', $file);
				echo "<div tiddler='".$tiddler_name."' modifier='ccTiddly'  modified='200804211142' created='200804211142' tags='systemConfig excludeLists excludeSearch'>\n";
            	include_once($cct_base."ccPlugins/".$file);
				echo "</div>\n";
    		}else if ($ext == "tiddler")
			{		
					$tiddler_name = str_replace('.tiddler', '', $file);
					include_once($cct_base."ccPlugins/".$file);
			}
    	}
        closedir($dh);
    }
}
include_once($cct_base."tiddlers/ccTiddly_debug_time.php");

?>
<div title="CreateWorkspace" tags="simple">
<pre>&lt;&lt;ccCreateWorkspace&gt;&gt;</pre>
</div>

<div title="CreateWorkspace">
<pre><<ccCreateWorkspace>></pre>
</div>

<div title="AnonDefaultTiddlers" modifier="ccTiddly">
<pre>
[[Login]] [[GettingStarted]]
</pre>
</div>


<div title="LoginStatus" modifier="ccTiddly" tags="simple">
<pre>
&lt;&lt;ccLoginStatus&gt;&gt;
</pre>
</div>
<div title="Login" modifier="ccTiddly">
<pre>
&lt;&lt;ccLogin&gt;&gt;
</pre>
</div>
<div title="Forgotten Details" modifier="ccTiddly">
<pre>
If you've forgotten your username and / or password, please contact the administrator:

simon@osmosoft.com
</pre>
</div>
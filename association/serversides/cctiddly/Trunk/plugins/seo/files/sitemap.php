<?php
$start_dirname = getcwd()."/uploads/tiddlers/";
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<?php
function recurse($dirname) 
{
	global $start_dirname;
	$dir = dir($dirname);
	while (false !== $entry = $dir->read()) 
	{
		if(is_dir($dirname.$entry) && $entry !==".")
			recurse($dirname.$entry);
		if(stristr($entry, ".html"))
		{
			$uri_dir = str_replace($start_dirname, "", $dirname);
			
			if($uri_dir)
				$uri_dir = "/".$uri_dir;
			?>
			   <url>	
			      <loc><?php echo "http://".$_SERVER["SERVER_ADDR"].$uri_dir."/".$entry;?></loc>
			   </url>
			<?php
		}
	}
	$dir->close();		
}
recurse($start_dirname);
?>		
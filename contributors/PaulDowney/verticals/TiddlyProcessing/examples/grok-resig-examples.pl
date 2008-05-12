#!/usr/bin/env perl

use strict;

sub slurp { local $/; open(FILE, shift); return <FILE> }


# cached copy of http://ejohn.org/apps/processing.js/examples/

my $tag = "BasicExample"
foreach my $f (<../tmp/basic/*html>) {
	my $t = slurp($f);

	my $title = $t;
	$title =~ s/^.*<h2>([^<]*)<\/h2>.*$/$1/s;

        my $explanation = $t;
	$explanation =~ s/^.*\h2>\s*<p>(.*?)<\/p>.*$/$1/s;
	$explanation =~ s/\s*\n\s*/ /g;

	my $attribution = $f;
	$attribution =~ s/^..\///g;
	$attribution = "Taken from [[$attribution|http://ejohn.org/apps/processing.js/examples/$attribution]]";

	my $code = $t;
	$code =~ s/^.*<script\s+type=.application\/processing.\s*>(.*)<\/script.*$/$1/s;
	#$code =~ s/'/\\'/g;

	my $tiddler = "<div title=\"$title\" modifier=\"PaulDowney\""
	 . " created=\"200805102327\" tags=\"Processing $tag Example\">\n<pre>"
	 . $explanation
	 . "\n\n<<Processing \n" .  $code . "\n>>\n\n"
	 . $attribution
	 . "</pre></div>\n";

	open(FILE, "> $title.tiddler");
	print FILE $tiddler;
	close(FILE);
}
	

#!/usr/bin/env perl 

#
#  dump ScrumWorks hashed database as TeamTask tiddlers
#

use Data::Dumper;

use strict;
use t;

my $html;

if ($html) {
print <<EOF;
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<body>
<div id='storeArea'>
EOF
}

#
#  impediments ..
#
my $table = $t::db->{'table'}->{'impediment'};
foreach my $i (keys %{$table->{'row'}}) {
    my $row = $table->{'row'}->{$i};
    tiddler({ 
	    'title'=> $row->{'summary'},
	    'content' => $row->{'detail'},
	    'user' => $row->{'teammember'},
	    'tags' => 'task'
    });
}

if ($html) {
print "</div>\n</body></html>";
}


sub tiddler(\%)
{
    my(%a) = %{(shift)};

    my $title = escape($a{'title'} || '');
    my $modifier = $a{'modifier'} || 'ScrumWorks';
    my $created = $a{'created'} || "200803201030";
    my $modified = $a{'modified'} || "200803201030";
    my $tt_user = user($a{'tt_user'} || $modifier);
    my $tt_priority = $a{'tt_priority'} || 1;
    my $tt_status = $a{'tt_status'} || 'Done';
    my $tt_scope = $a{'tt_scope'} || '';
    my $tt_task = $a{'tt_task'} || '';
    my $tags = $a{'tt_tags'} || 'task';
    my $content = escape($a{'content'} || '');

    print "<div title='$title' modifier='$modifier' created='$created' modified='$modified' changecount='1' tt_user='$tt_user' tt_priority='$tt_priority' tt_scope='$tt_scope' tt_tasks_metadata_format_version='0.4' tt_status='$tt_status' tags='$tags'>\n"
	. "<pre>$content</pre>\n"
    . "</div>\n";
}

sub user 
{
	my ($u) = @_;
	$u =~ s/\s//g;
	return $u;
}

sub escape 
{
    my ($text) = @_;
    $text =~ s/&/&amp;/go;
    $text =~ s/</&lt;/go;
    $text =~ s/>/&gt;/go;
    $text =~ s/'/&apos;/go;
    $text =~ s/"/&quot;/go;
    $text =~ s/\\u000a/\n/go;
    $text =~ s/\\u000d//go;
    return $text;
}

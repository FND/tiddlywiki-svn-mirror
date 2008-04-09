#!/usr/bin/env perl 

#
#  dump ScrumWorks hashed database as TeamTask tiddlers
#  issues:
#   - need to use cook, rather than insert hack
#   - datetime from posgress needs fixing
#   - need to add sprints
#   - need to add team
#
use strict;
use t;

{
    taskDefinitions('product');
    taskDefinitions('release');
    taskDefinitions('team');
    taskDefinitions('sprint');

    table('teammember', q(
	    'title' => _user($row->{'firstname'} . $row->{'lastname'}),
	    'tags' => 'user'
    ));

    table('backlogitem', q(
	    'title' => $row->{'title'},
	    'content' => $row->{'description'},
	    'tt_story' => _story('backlogitem'),
	    'tt_status' => _status($row->{'active'}),
	    'tt_rank' => $row->{'rank'},
	    'tt_estimate' => $row->{'estimate'},
	    'tt_product' => _product($row->{'product'}),
	    'tt_donedate' => _datetime($row->{'donedate'}),
	    'tt_release' => _release($row->{'releaseid'}),
	    'tt_sprint' => _sprint($row->{'sprint'}),
	    'tt_team' => _team(_sprint($row->{'sprint'}, 'team')),
	    'tags' => 'task story'
    ));

    if (0) {
    table('task', q(
	    'title' => $row->{'title'},
	    'content' => $row->{'description'},
	    'tt_status' => _status($row->{'active'}),
	    'tt_story' => _story($row->{'backlogitem'}),
	    'tt_user' => _user($row->{'pointperson'}),
	    'tt_rank' => $row->{'rank'},
	    'tt_estimate' => $row->{'estimate'},

	    'tt_product' => _product($row->{'product'}),
	    'tags' => 'task item'
    ));
    }

    table('impediment', q(
	    'title' => $row->{'summary'},
	    'content' => $row->{'detail'},
	    'tt_user' => _user($row->{'teammember'}),
	    'tt_donedate' => _datetime($row->{'resolutiondate'}),
	    'tt_team' => _team($row->{'team'}),
	    'tt_product' => _product($row->{'product'}),
	    'tags' => 'task impediment'
    ));

}

sub _user { wikiword(@_) }
sub _story { wikiword(lookup('backlogitem', shift, shift || 'title')); }
sub _product { wikiword(lookup('product', shift, shift || 'name')); }
sub _team { wikiword(lookup('team', shift, shift || 'name')); }
sub _release { wikiword(lookup('release', shift, shift || 'name')); }
sub _sprint{ wikiword(lookup('sprint', shift, shift || 'name')); }
sub _status { shift eq 'TRUE' ? "Active" : "Done"; }


sub table
{
    my ($table, $x) = @_;
    my $table = $t::db->{'table'}->{$table};
    foreach my $i (keys %{$table->{'row'}}) {
	my $row = $table->{'row'}->{$i};
	tiddler({eval $x});
    }
}

sub taskDefinitions()
{
	my ($table, $item, $name, $title) = @_;
	$name ||= 'name';

	my $t = $t::db->{'table'}->{$table};
        my $content = '';
	foreach my $i (keys %{$t->{'row'}}) {
	    my $row = $t->{'row'}->{$i};
	    if ($row->{$name}) {
		$content = $content . $row->{$name} . "\n";
	    }
        }

	$item = ucfirst($item);
	$title ||= "${item}Definitions";

	tiddler({
	    'title' => $title,
	    'content' => $content,
	    'tags' => 'TaskDefinitions'
	});
}

sub tiddler(\%)
{
    my(%a) = %{(shift)};

    $a{'creator'} ||= "ScrumWorks";
    $a{'created'} ||= _datetime();

    print "<div";

    foreach my $key (keys %a) {
	next if ($key =~ /content/);
	print " $key='" . escape($a{$key}) . "'";
    }

    print ">\n<pre>" . escape($a{'content'}) . "</pre>\n</div>\n";
}

sub lookup
{
    my ($table, $id, $item) = @_;
    $t::db->{'table'}{$table}{'row'}{$id}{$item};
}

sub wikiword
{
    my ($u) = @_;
    $u =~ s/[^\w\d]//g;
    return $u;
}

sub _datetime
{
    my ($time) = @_;
    $time = $time / 1000;
    my ($seconds, $minutes, $hours, $day_of_month, $month, $year, $wday, $yday, $isdst) = localtime($time);
    return sprintf("%04d%02d%02d%02d%02d%02d", $year+1900, $month+1, $day_of_month, $hours, $minutes, $seconds);
}

sub escape 
{
    my ($text) = @_;
    $text =~ s/&/&amp;/go;
    $text =~ s/</&lt;/go;
    $text =~ s/>/&gt;/go;
    $text =~ s/'/&apos;/go;
    $text =~ s/"/&quot;/go;
    $text =~ s/\\u0009/\t/go;
    $text =~ s/\\u000a/\n/go;
    $text =~ s/\\u000d//go;

    return $text;
}

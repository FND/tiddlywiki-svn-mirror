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
    table('teammember', q(
	    'title' => _user($row->{'firstname'} . $row->{'lastname'}),
	    'tags' => 'user'
    ));

    {
	my $content = "PhilHawksworth\nScrumWorks\n";
	my $table = "teammember";
	my $table = $t::db->{'table'}->{$table};
	foreach my $i (keys %{$table->{'row'}}) {
	    my $row = $table->{'row'}->{$i};
	    $content = $content . _user($row->{'firstname'} . $row->{'lastname'}) . "\n";
	}
	tiddler({'title' => 'UserDefinitions', 'content' => $content, 'tags' => 'TaskDefinitions'});
    }

    table('backlogitem', q(
	    'title' => $row->{'title'},
	    'content' => $row->{'description'},
	    'tt_status' => $row->{'active'} eq "TRUE" ? "Active":"Done",
	    'tt_story' => _story('backlogitem'),
	    'tt_rank' => $row->{'rank'},
	    'tt_estimate' => $row->{'estimate'},
	    'tt_product' => _product($row->{'product'}),
	    'tt_donedate' => _datetime($row->{'donedate'}),
	    'tt_release' => _release($row->{'releaseid'}),
	    'tt_sprint' => _sprint($row->{'sprint'}),
	    'tags' => 'task story'
    ));

    table('task', q(
	    'title' => $row->{'title'},
	    'content' => $row->{'description'},
	    'tt_status' => $row->{'status'},
	    'tt_story' => _story($row->{'backlogitem'}),
	    'tt_user' => _user($row->{'pointperson'}),
	    'tt_rank' => $row->{'rank'},
	    'tt_estimate' => $row->{'estimate'},
	    'tags' => 'task item'
    ));

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

sub _user { _wikiword(@_) }
sub _story { _wikiword(lookup('backlogitem', shift, 'title')); }
sub _product { _wikiword(lookup('product', shift, 'name')); }
sub _team { _wikiword(lookup('team', shift, 'name')); }
sub _release{ _wikiword(lookup('release', shift, 'name')); }
sub _sprint{ _wikiword(lookup('sprint', shift, 'name')); }

sub table
{
    my ($table, $x) = @_;
    my $table = $t::db->{'table'}->{$table};
    foreach my $i (keys %{$table->{'row'}}) {
	my $row = $table->{'row'}->{$i};
	tiddler({eval $x});
    }
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

sub _wikiword
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

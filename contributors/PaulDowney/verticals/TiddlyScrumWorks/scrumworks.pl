#!/usr/bin/env perl 

#
#  parse ScrumWorks dumped SQL into a Perl hash
#
use strict;
use Text::CSV;
use Data::Dumper;

sub slurp { local $/; return <STDIN> }
sub table 
{ 
	my $n = shift;
	$n =~ s/EJB//g; 
	return lc($n); 
}

my $cmds = slurp();
my $db = {};

my $csv = Text::CSV->new({quote_char => "'", escape_char => "'"});

for my $sql(split /\n/, $cmds) {

	next if ($sql =~ /^CREATE SCHEMA/);

	# CREATE MEMORY TABLE SHORTURLEJB(ID BIGINT NOT NULL,SHORTURL VARCHAR(256),LONGURL VARCHAR(256),LASTACCESSEDTIME BIGINT NOT NULL,CONSTRAINT PK_SHORTURLEJB PRIMARY KEY(ID))
	if ($sql =~ /^CREATE MEMORY TABLE/) {
		(my $table = $sql) =~ s/^CREATE MEMORY TABLE\s*(\w*)\(.*$/$1/;
		(my $cols = $sql) =~ s/^[^\(]*(.*$)$/$1/;

		$table = table($table);

		foreach my $col (split(/[\(,\)]/, $cols)) {
		    last if ($col =~ /CONSTRAINT/);
		    next unless ($col =~ /^[A-Z]/);
		    $col =~ s/ .*$//;
		    $col = lc($col);
		    push(@{$db->{table}{$table}{cols}}, $col);
		}
	} 

	# INSERT INTO TEAMEJB VALUES(98133,'Tools & Processes',NULL)
	if ($sql =~ /^INSERT INTO/) {

		(my $table = $sql) =~ s/^INSERT INTO (\w*) VALUES*.*$/$1/;
		(my $columns = $sql) =~ s/^[^\(]*(.*$)$/$1/;

		$table = table($table);

		$columns =~ s/^\(//;
		$columns =~ s/\)$//;

		unless ($csv->parse($columns)) {
		    print "\n\n>>>\n$columns\n<<<\n";
		    print $csv->error_diag();
		    exit(1);
		}

		my $cols = $db->{table}{$table}->{cols};

		my %row;
		my $n = 0;
		my $id;
		foreach my $field ($csv->fields()) {
		    unless ($id) {
			$id = $field;
			next;
		    }
		    $n++;
		    my $col = $cols->[$n];
		    $row{$col} = $field;
		}
		$db->{table}{$table}{row}{$id} = \%row;
	}
}

print "package t;\n";
print "our \$db;\n";
print Data::Dumper->new([$db], ['db'])->Dump();

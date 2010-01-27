#!/usr/bin/env perl
#
# adapted from http://daringfireball.net/2007/03/javascript_bookmarklet_builder

use strict;
use warnings;
use URI::Escape qw(uri_escape_utf8);
use open  IO  => ":utf8",       # UTF8 by default
          ":std";               # Apply to STDIN/STDOUT/STDERR

sub makeBookmarklet {
my $src = shift(@_);

# Zap the first line if there's already a bookmarklet comment:
  $src =~ s{^// ?javascript:.+\n}{};
  my $bookmarklet = $src;

  for ($bookmarklet) {
        s{^\s*//.+\n}{}gm;  # Kill comments.
            s{\t}{ }gm;         # Tabs to spaces
                s{[ ]{2,}}{ }gm;    # Space runs to one space
                    s{^\s+}{}gm;        # Kill line-leading whitespace
                        s{\s+$}{}gm;        # Kill line-ending whitespace
                            s{\n}{}gm;          # Kill newlines
  }

# Escape single- and double-quotes, spaces, control chars, unicode:
  $bookmarklet = "javascript:" .
      uri_escape_utf8($bookmarklet, qq('" \x00-\x1f\x7f-\xff));

      # print "// $bookmarklet\n" . $src;
  return $bookmarklet
}

my ($bookmarklet_src_file, $html_file) = @ARGV;

open(FILE, $bookmarklet_src_file);
my $bookmarklet_src = join("", <FILE>); 
my $bookmarklet = makeBookmarklet($bookmarklet_src);
close FILE;

open(FILE, $html_file);
my $html = join("", <FILE>); 
close FILE;

$html =~ s/\@\@\@bookmarkletJS\@\@\@/$bookmarklet/g;
print $html;


# print makeBookmarklet($bookmarklet);
# print makeBookmarklet($bookmarklet);
# print makeBookmarklet($bookmarklet);

# Put bookmarklet on clipboard:
# `/bin/echo -n '$bookmarklet' | /usr/bin/pbcopy`;


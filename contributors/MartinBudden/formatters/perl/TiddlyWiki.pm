package HTML::WikiConverter::TiddlyWiki;
use base 'HTML::WikiConverter';

use warnings;
use strict;

use URI;
use File::Basename;
our $VERSION = '0.01';

=head1 NAME

HTML::WikiConverter::TiddlyWiki - Convert HTML to TiddlyWiki markup

=head1 SYNOPSIS

  use HTML::WikiConverter;
  my $wc = new HTML::WikiConverter( dialect => 'TiddlyWiki' );
  print $wc->html2wiki( $html );

=head1 DESCRIPTION

This module contains rules for converting HTML into TiddlyWiki
markup. See L<HTML::WikiConverter> for additional usage details.

=cut

sub rules {
  my %rules = (
    hr => { replace => "\n----\n" },

    h1 => { start => '! ',      block => 1, trim => 'both', line_format => 'single' },
    h2 => { start => '!! ',     block => 1, trim => 'both', line_format => 'single' },
    h3 => { start => '!!! ',    block => 1, trim => 'both', line_format => 'single' },
    h4 => { start => '!!!! ',   block => 1, trim => 'both', line_format => 'single' },
    h5 => { start => '!!!!! ',  block => 1, trim => 'both', line_format => 'single' },
    h6 => { start => '!!!!!! ', block => 1, trim => 'both', line_format => 'single' },

    img => { replace => \&_image },

    b      => { start => "''", end => "''" },
    strong => { alias => 'b' },
    i      => { start => "//", end => "//" },
    em     => { alias => 'i' },
    u      => { start => "__", end => "__"},
    'sub'    => { start => "~~", end => "~~"},
    sup    => { start => "^^", end => "^^"},
    strike => { start => "--", end => "--"},
    code   => { start => "\n{{{\n", end => "\n}}}\n"},
    tt     => { start => "{{{", end => "}}}"},

# from PhpWiki
    blockquote => { start => \&_blockquote_start, block => 1, line_format => 'multi' },
    p => { block => 1, trim => 'both', line_format => 'multi' },

    a => { replace => \&_link },

# from MediaWiki
    ul => { line_format => 'multi', block => 1 },
    ol => { alias => 'ul' },
    dl => { alias => 'ul' },

    li => { start => \&_li_start, trim => 'leading' },
    dt => { alias => 'li' },
    dd => { alias => 'li' },

# from PmWiki
    table => { block => 1 },
    tr    => { start => "\n|", line_format => 'single' },
    td    => { start => \&_td_start, end => \&_td_end, trim => 'both' },
    th    => { alias => 'td' },

    pre => { preserve => 1 }
  );

  return \%rules;
}

# Calculates the prefix that will be placed before each list item.
# List item include ordered and unordered list items.
# derived from MediaWiki
sub _li_start {
  my( $self, $node, $rules ) = @_;
  my @parent_lists = $node->look_up( _tag => qr/ul|ol|dl/ );

  my $prefix = '';
  foreach my $parent ( @parent_lists ) {
    my $bullet = '';
    $bullet = '*' if $parent->tag eq 'ul';
    $bullet = '#' if $parent->tag eq 'ol';
    $bullet = ':' if $parent->tag eq 'dl';
    $bullet = ';' if $parent->tag eq 'dl' and $node->tag eq 'dt';
    $prefix = $bullet.$prefix;
  }

  return "\n$prefix ";
}

# derived from MediaWiki
sub _image {
  my( $self, $node, $rules ) = @_;
  return '' unless $node->attr('src');

  #my $img = basename( URI->new($node->attr('src'))->path );
  my $img = $node->attr('src');
  my $alt = $node->attr('alt') || '';
  my $align = $node->attr('align') || '';
  my $title = $node->attr('title') || '';
  
  my $ret = "[";
  $ret .= "<" if $align eq 'left';
  $ret .= ">" if $align eq 'right';
  $ret .= "img[";
  $ret .= "$title|" if $title;
  $ret .= "$img]]";
}

# derived from PmWiki
sub _anchor {
  my( $self, $node, $rules ) = @_;
  my $name = $node->attr('name') || '';
  return "[[#$name]]";
}

# derived from PmWiki
sub _link {
  my( $self, $node, $rules ) = @_;
  return $self->_anchor($node, $rules) if $node->attr('name');

  my $url = $node->attr('href') || '';
  my $text = $self->get_elem_contents($node) || '';

  return $url if $text eq $url;
  return "[[$text|$url]]";
}

# tables derived from PmWiki
sub _td_start {
  my( $self, $node, $rules ) = @_;
  my $colspan = $node->attr('colspan') || 1;
  my $prefix = ( '>' ) x ($colspan-1);
  $prefix .= '|' if $colspan > 1;
  $prefix .= $node->tag eq 'th' ? '!' : '';

  my $align = $node->attr('align') || 'none';
  my $style = $node->attr('style') || '';
  $align = 'center' if $style eq 'text-align: center;';
  $align = 'right' if $style eq 'text-align: right;';

  $prefix .= '' if $align eq 'none';
  $prefix .= '' if $align eq 'left';
  $prefix .= ' ' if $align eq 'center';
  $prefix .= ' ' if $align eq 'right';

  return $prefix;
}

sub _td_end {
  my( $self, $node, $rules ) = @_;
  my $suffix = '';
  my $align = $node->attr('align') || 'none';
  $suffix .= '|' if $align eq 'none';
  $suffix .= ' |' if $align eq 'left';
  $suffix .= ' |' if $align eq 'center';
  $suffix .= '|' if $align eq 'right';
 
  return $suffix;
}

# blockquote derived from PmWiki
sub _blockquote_start {
  my( $self, $node, $rules ) = @_;
  my @parent_bqs = $node->look_up( _tag => 'blockquote' );
  my $depth = @parent_bqs;
  
  my $start = ( '>' ) x $depth;
  return "\n".$start.' ';
}

=head1 AUTHOR

Martin Budden, C<< <mjbudden at gmail.com> >>

Heavily based on other HTML to wikitext modules written by David J. Iberri, C<< <diberri at cpan.org> >>

=head1 BUGS

Please report any bugs or feature requests to
C<bug-html-wikiconverter-tiddlywiki at rt.cpan.org>, or through the web
interface at
L<http://rt.cpan.org/NoAuth/ReportBug.html?Queue=HTML-WikiConverter-TiddlyWiki>.
I will be notified, and then you'll automatically be notified of
progress on your bug as I make changes.

=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc HTML::WikiConverter::TiddlyWiki

You can also look for information at:

=over 4

=item * AnnoCPAN: Annotated CPAN documentation

L<http://annocpan.org/dist/HTML-WikiConverter-TiddlyWiki>

=item * CPAN Ratings

L<http://cpanratings.perl.org/d/HTML-WikiConverter-TiddlyWiki>

=item * RT: CPAN's request tracker

L<http://rt.cpan.org/NoAuth/Bugs.html?Dist=HTML-WikiConverter-TiddlyWiki>

=item * Search CPAN

L<http://search.cpan.org/dist/HTML-WikiConverter-TiddlyWiki>

=back

=head1 COPYRIGHT & LICENSE

Copyright 2008 Martin Budden, all rights reserved.

Heavily based on other HTML to wikitext modules written by David J. Iberri

This program is free software; you can redistribute it and/or modify
it under the same terms as Perl itself.

=cut

1;

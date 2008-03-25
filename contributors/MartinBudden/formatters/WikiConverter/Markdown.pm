package HTML::WikiConverter::Markdown;

use warnings;
use strict;

use base 'HTML::WikiConverter';
our $VERSION = '0.02';

use Params::Validate ':types';
use HTML::Tagset;
use URI;

=head1 NAME

HTML::WikiConverter::Markdown - Convert HTML to Markdown markup

=head1 SYNOPSIS

  use HTML::WikiConverter;
  my $wc = new HTML::WikiConverter( dialect => 'Markdown' );
  print $wc->html2wiki( $html );

=head1 DESCRIPTION

This module contains rules for converting HTML into Markdown markup.
You should not use this module directly; HTML::WikiConverter is the
entry point for html->wiki conversion (eg, see synopsis above). See
L<HTML::WikiConverter> for additional usage details.

=head1 ATTRIBUTES

In addition to the regular set of attributes recognized by the
L<HTML::WikiConverter> constructor, this dialect also accepts the
following attributes that can be passed into the C<new()>
constructor. See L<HTML::WikiConverter/ATTRIBUTES> for usage details.

=head2 header_style

Possible values: C<'setext'>, C<'atx'>. Determines how headers
C<h1>-C<h6> will be formatted. See
L<http://daringfireball.net/projects/markdown/syntax#header> for more
information. Default is C<'atx'>.

=head2 link_style

Possible values: C<'inline'>, C<'reference'>. See
L<http://daringfireball.net/projects/markdown/syntax#link> for more
information. Default is C<'reference'>.

=head2 force_inline_anchor_links

Possible values: C<0>, C<1>. If enabled, links to anchors within the
same page (eg, C<#some-anchor>) will always produce inline Markdown
links, even under reference link style. This might be useful for
building tables of contents. Default is C<0>.

=head2 image_style

Possible values: C<'inline'>, C<'reference'>. See
L<http://daringfireball.net/projects/markdown/syntax#img> for more
information. Default is C<'reference'>.

=head2 image_tag_fallback

Possible values: C<0>, C<1>. Markdown's image markup does not
support image dimensions. If C<image_tag_fallback> is enabled, image
tags containing dimensional information (ie, width or height) will not
be converted into Markdown markup. Rather, they will be roughly
preserved in their HTML form. Default is C<1>.

=head2 unordered_list_style

Possible values: C<'asterisk'>, C<'plus'>, C<'dash'>. See
L<http://daringfireball.net/projects/markdown/syntax#list> for more
information. Default is C<'asterisk'>.

=head2 ordered_list_style

Possible values: C<'sequential'>, C<'one-dot'>. Markdown supports two
different markups for ordered lists. Sequential style gives each list
element its own ordinal number (ie, C<'1.'>, C<'2.'>, C<'3.'>,
etc.). One-dot style gives each list element the same ordinal number
(ie, C<'1.'>). See
L<http://daringfireball.net/projects/markdown/syntax#list> for more
information. Default is C<'sequential'>.

=cut

sub attributes { {
  header_style              => { default => 'atx', type => SCALAR },
  link_style                => { default => 'reference', type => SCALAR },
  force_inline_anchor_links => { default => 0, type => BOOLEAN },
  image_style               => { default => 'reference', type => SCALAR },
  image_tag_fallback        => { default => 1, type => BOOLEAN },
  unordered_list_style      => { default => 'asterisk', type => SCALAR },
  ordered_list_style        => { default => 'sequential', type => SCALAR },
} }

my @common_attrs = qw/ id class lang dir title style /;

sub rules {
  my $self = shift;

  my %rules = (
    hr => { replace => "\n\n----\n\n" },
    br => { preserve => 1, empty => 1 },
    p => { block => 1, trim => 'both', line_format => 'multi', line_prefix => \&_p_prefix },
    blockquote => { block => 1, trim => 'both', line_format => 'blocks', line_prefix => '> ' },
    ul => { block => 1, line_format => 'multi' },
    ol => { alias => 'ul' },
    li => { start => \&_li_start, trim => 'leading' },

    i => { start => '_', end => '_' },
    em => { alias => 'i' },
    b => { start => '**', end => '**' },
    strong => { alias => 'b' },
    code => { start => '`', end => '`' },

    a => { replace => \&_link },
    img => { replace => \&_img },
  );

  for( 1..6 ) {
    $rules{"h$_"} = { start => \&_header_start, end => \&_header_end, trim => 'both', block => 1 };
  }

  for( qw/ table caption tr th td / ) {
    $rules{$_} = { preserve => 1, attrs => \@common_attrs, start => "\n", end => "\n", line_format => 'multi' };
  }

  return \%rules;
}

sub _header_start {
  my( $self, $node, $rules ) = @_;
  return '' unless $self->header_style eq 'atx';
  ( my $level = $node->tag ) =~ s/\D//g;
  return unless $level;

  my $hr = ('#') x $level;
  return "$hr ";
}

sub _header_end {
  my( $self, $node, $rules ) = @_;
  return '' unless $self->header_style eq 'setext';
  ( my $level = $node->tag ) =~ s/\D//g;
  return unless $level;

  my $symbol = $level == 1 ? '=' : '-';
  my $len = length $self->get_elem_contents($node);
  my $bar = ($symbol) x $len;
  return "\n$bar\n";
}

sub _link {
  my( $self, $node, $rules ) = @_;

  my $url = $self->_abs2rel($node->attr('href') || '');
  my $text = $self->get_elem_contents($node);
  my $title = $node->attr('title') || '';
  
  my $style = $self->link_style;
  $style = 'inline' if $url =~ /^\#/ and $self->force_inline_anchor_links;

  if( $url eq $text ) {
    return sprintf "<%s>", $url;
  } elsif( $style eq 'inline' ) {
    return sprintf "[%s](%s %s)", $text, $url, $title if $title;
    return sprintf "[%s](%s)", $text, $url;
  } elsif( $style eq 'reference' ) {
    my $id = $self->_next_link_id;
    $self->_add_link( { id => $id, url => $url, title => $title } );
    return sprintf "[%s][%s]", $text, $id;
  }
}

sub _last_link_id { shift->_attr( { internal => 1 }, _last_link_id => @_ ) }

sub _links { shift->_attr( { internal => 1 }, _links => @_ ) }

sub _next_link_id {
  my $self = shift;
  my $next_id = ($self->_last_link_id || 0) + 1;
  $self->_last_link_id( $next_id );
  return $next_id;
}

sub _add_link {
  my( $self, $link ) = @_;
  $self->_links( [ @{ $self->_links || [] }, $link ] );
}

sub _img {
  my( $self, $node, $rules ) = @_;
  
  my $url = $node->attr('src') || '';
  my $text = $node->attr('alt') || '';
  my $title = $node->attr('title') || '';
  my $width = $node->attr('width') || '';
  my $height = $node->attr('height') || '';
  
  if( $width || $height and $self->image_tag_fallback ) {
    return "<img ".$self->get_attr_str( $node, qw/ src width height alt /, @common_attrs )." />";
  } elsif( $self->image_style eq 'inline' ) {
    return sprintf "![%s](%s \"%s\")", $text, $url, $title if $title;
    return sprintf "![%s](%s)", $text, $url;
  } elsif( $self->image_style eq 'reference' ) {
    my $id = $self->_next_link_id;
    $self->_add_link( { id => $id, url => $url, title => $title } );
    return sprintf "![%s][%s]", $text, $id;
  }
}

sub _li_start {
  my( $self, $node, $rules ) = @_;
  my @parent_lists = $node->look_up( _tag => qr/ul|ol/ );

  my $prefix = ('  ') x ( @parent_lists - 1 );

  my $bullet = '';
  $bullet = $self->_ul_li_start if $node->parent and $node->parent->tag eq 'ul';
  $bullet = $self->_ol_li_start($node->parent) if $node->parent and $node->parent->tag eq 'ol';
  return "\n$prefix$bullet ";
}

sub _ul_li_start {
  my $self = shift;
  my $style = $self->unordered_list_style;
  return '*' if $style eq 'asterisk';
  return '+' if $style eq 'plus';
  return '-' if $style eq 'dash';
  die "no such unordered list style: '$style'";
}

my %ol_count = ( );
sub _ol_li_start {
  my( $self, $ol ) = @_;
  my $style = $self->ordered_list_style;

  if( $style eq 'one-dot' ) {
    return '1.';
  } elsif( $style eq 'sequential' ) {
    my $count = ++$ol_count{$ol};
    return "$count.";
  } else {
    die "no such ordered list style: $style";
  }
}

sub _p_prefix {
  my( $wc, $node, $rules ) = @_;
  return $node->look_up( _tag => 'li' ) ? '    ' : '';
}

sub preprocess_node {
  my( $self, $node ) = @_;
  return unless $node->tag and $node->parent and $node->parent->tag;

  if( $node->parent->tag eq 'blockquote' and $self->_is_phrase_tag($node->tag) ) {
    $self->_envelop_elem( $node, HTML::Element->new('p') );
  } elsif( $node->tag eq '~text' ) {
    $self->_escape_text($node);
  }
}

sub _envelop_elem {
  my( $self, $node, $new_parent ) = @_;
  my $h = $node->replace_with($new_parent);
  $new_parent->push_content($h);
}

my @escapes = qw( \\ \` * _ { } ); # '#', '.', '[', and '!' are handled specially

sub _escape_text {
  my( $self, $node ) = @_;
  my $text = $node->attr('text') || '';
  my $escapes = join '', @escapes;
  $text =~ s/([\Q$escapes\E])/\\$1/g;
  $text =~ s/^([\d]+)\./$1\\./;
  $text =~ s/^\#/\\#/;
  $text =~ s/\!\[/\\![/g;
  $text =~ s/\]\[/]\\[/g;
  $node->attr( text => $text );
}

sub postprocess_output {
  my( $self, $outref ) = @_;
  $self->_add_references($outref);
}

sub _add_references {
  my( $self, $outref ) = @_;
  my @links = @{ $self->_links || [] };
  return unless @links;

  my $links = '';
  foreach my $link ( @links ) {
    my $id = $link->{id} || '';
    my $url = $link->{url} || '';
    my $title = $link->{title} || '';
    if( $title ) {
      $links .= sprintf "  [%s]: %s \"%s\"\n", $id, $url, $title;
    } else { 
      $links .= sprintf "  [%s]: %s\n", $id, $url;
    }
  }

  $self->_links( [] );
  $self->_last_link_id( 0 );

  $$outref .= "\n\n$links";
  $$outref =~ s/\s+$//gs;
}

sub _is_phrase_tag {
  my $tag = pop || '';
  return $HTML::Tagset::isPhraseMarkup{$tag} || $tag eq '~text';
}

sub _abs2rel {
  my( $self, $uri ) = @_;
  return $uri unless $self->base_uri;
  return URI->new($uri)->rel($self->base_uri)->as_string;
}

=head1 AUTHOR

David J. Iberri, C<< <diberri at cpan.org> >>

=head1 BUGS

Please report any bugs or feature requests to
C<bug-html-wikiconverter-markdown at rt.cpan.org>, or through the web interface at
L<http://rt.cpan.org/NoAuth/ReportBug.html?Queue=HTML-WikiConverter-Markdown>.
I will be notified, and then you'll automatically be notified of progress on
your bug as I make changes.

=head1 SUPPORT

You can find documentation for this module with the perldoc command.

    perldoc HTML::WikiConverter::Markdown

You can also look for information at:

=over 4

=item * AnnoCPAN: Annotated CPAN documentation

L<http://annocpan.org/dist/HTML-WikiConverter-Markdown>

=item * CPAN Ratings

L<http://cpanratings.perl.org/d/HTML-WikiConverter-Markdown>

=item * RT: CPAN's request tracker

L<http://rt.cpan.org/NoAuth/Bugs.html?Dist=HTML-WikiConverter-Markdown>

=item * Search CPAN

L<http://search.cpan.org/dist/HTML-WikiConverter-Markdown>

=back

=head1 COPYRIGHT & LICENSE

Copyright 2006 David J. Iberri, all rights reserved.

This program is free software; you can redistribute it and/or modify it
under the same terms as Perl itself.

=cut

1;

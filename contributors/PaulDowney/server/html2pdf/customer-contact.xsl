<?xml version="1.0"?>
<!-- 

	convert XHTML to XSL-FO

-->
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:fo="http://www.w3.org/1999/XSL/Format" xmlns:xhtml="http://www.w3.org/1999/xhtml" version="1.0">
	<xsl:output method="xml"/>
	<xsl:template match="/">
		<fo:root>
			<fo:layout-master-set>
				<fo:simple-page-master master-name="only">
					<fo:region-body region-name="xsl-region-body" margin="0.7in"/>
					<fo:region-before region-name="xsl-region-before" extent="0.7in" display-align="before"/>
					<fo:region-after region-name="xsl-region-after" display-align="after" extent="0.7in"/>
				</fo:simple-page-master>
			</fo:layout-master-set>

			<fo:page-sequence master-reference="only">
				<fo:static-content flow-name="xsl-region-after" font="Times">
					<fo:block line-height="20pt" font-size="8pt" text-align="right" margin-bottom="12pt" margin-right="12pt">Page <fo:page-number/> of <fo:page-number-citation ref-id="TheEnd"/></fo:block>
				</fo:static-content>

				<fo:flow flow-name="xsl-region-body">
					<xsl:apply-templates/>
					<fo:block id="TheEnd"/>
				</fo:flow>
			</fo:page-sequence>
		</fo:root>
	</xsl:template>

	<xsl:template match="xhtml:head/xhtml:title">
<fo:block break-before="page" 
        break-after="page"
          space-after="4in" 
          space-before="3in" 
          space-before.conditionality="retain" 
          font="24pt Times bold" 
          text-align="center">
	<xsl:choose>
		<xsl:when test="not(normalize-space(.))">
			=Missing Title=
		</xsl:when>
		<xsl:otherwise>
			<xsl:value-of select="."/>
		</xsl:otherwise>
	</xsl:choose>
</fo:block>
	</xsl:template>

	<!-- headings -->
	<xsl:template match="xhtml:h1">
		<fo:block font-family="Times" font-size="24pt" font-weight="bold" space-before="24pt" space-after="12pt" text-align="left">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>
	<xsl:template match="xhtml:h2">
		<fo:block font-family="Times" font-size="18pt" font-weight="bold" space-before="18pt" text-align="left">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>
	<xsl:template match="xhtml:h3">
		<fo:block font-family="Times" font-size="14pt" font-weight="bold" space-before="14pt" text-align="left">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>
	<xsl:template match="xhtml:h4">
		<fo:block font-family="Times" font-size="12pt" font-weight="bold" space-before="12pt" text-align="left">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>


	<xsl:template match="xhtml:body">
		<fo:block font-family="Times" font-size="12pt" space-before="12pt" space-after="12pt" text-align="justify">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>

	<xsl:template match="xhtml:p">
		<fo:block font-family="Times" font-size="12pt" space-before="12pt" space-after="12pt" text-align="justify">
			<xsl:apply-templates/>
		</fo:block>
	</xsl:template>

	<xsl:template match="xhtml:ol">
		<fo:list-block provisional-distance-between-starts="1cm" provisional-label-separation="0.5cm">
			<xsl:attribute name="space-after">
				<xsl:choose>
					<xsl:when test="ancestor::ul or ancestor::ol">
						<xsl:text>0pt</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>12pt</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<xsl:attribute name="start-indent">
				<xsl:variable name="ancestors">
					<xsl:choose>
						<xsl:when test="count(ancestor::xhtml:ol) or count(ancestor::xhtml:ul)">
							<xsl:value-of select="1 +                                      (count(ancestor::ol) +                                       count(ancestor::ul)) *                                      1.25"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:text>1</xsl:text>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:value-of select="concat($ancestors, 'cm')"/>
			</xsl:attribute>
			<xsl:apply-templates select="*"/>
		</fo:list-block>
	</xsl:template>

	<xsl:template match="xhtml:ol/xhtml:li">
		<fo:list-item>
			<fo:list-item-label end-indent="label-end()">
				<fo:block>
					<xsl:variable name="value-attr">
						<xsl:choose>
							<xsl:when test="../@start">
								<xsl:number value="position() + ../@start - 1"/>
							</xsl:when>
							<xsl:otherwise>
								<xsl:number value="position()"/>
							</xsl:otherwise>
						</xsl:choose>
					</xsl:variable>
					<xsl:choose>
						<xsl:when test="../@type='i'">
							<xsl:number value="$value-attr" format="i. "/>
						</xsl:when>
						<xsl:when test="../@type='I'">
							<xsl:number value="$value-attr" format="I. "/>
						</xsl:when>
						<xsl:when test="../@type='a'">
							<xsl:number value="$value-attr" format="a. "/>
						</xsl:when>
						<xsl:when test="../@type='A'">
							<xsl:number value="$value-attr" format="A. "/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:number value="$value-attr" format="1. "/>
						</xsl:otherwise>
					</xsl:choose>
				</fo:block>
			</fo:list-item-label>
			<fo:list-item-body start-indent="body-start()">
				<fo:block>
					<xsl:apply-templates select="*|text()"/>
				</fo:block>
			</fo:list-item-body>
		</fo:list-item>
	</xsl:template>

	<xsl:template match="xhtml:ul">
		<fo:list-block provisional-distance-between-starts="1cm" provisional-label-separation="0.2cm">
			<xsl:attribute name="space-after">
				<xsl:choose>
					<xsl:when test="ancestor::xhtml:ul or ancestor::xhtml:ol">
						<xsl:text>0pt</xsl:text>
					</xsl:when>
					<xsl:otherwise>
						<xsl:text>12pt</xsl:text>
					</xsl:otherwise>
				</xsl:choose>
			</xsl:attribute>
			<xsl:attribute name="start-indent">
				<xsl:variable name="ancestors">
					<xsl:choose>
						<xsl:when test="count(ancestor::ol) or count(ancestor::ul)">
							<xsl:value-of select="1 +                                      (count(ancestor::ol) +                                       count(ancestor::ul)) *                                      1.25"/>
						</xsl:when>
						<xsl:otherwise>
							<xsl:text>1</xsl:text>
						</xsl:otherwise>
					</xsl:choose>
				</xsl:variable>
				<xsl:value-of select="concat($ancestors, 'cm')"/>
			</xsl:attribute>
			<xsl:apply-templates select="*"/>
		</fo:list-block>
	</xsl:template>
	<xsl:template match="xhtml:ul/xhtml:li">
		<fo:list-item>
			<fo:list-item-label end-indent="label-end()">
				<fo:block>&#x2022;</fo:block>
			</fo:list-item-label>
			<fo:list-item-body start-indent="body-start()">
				<fo:block>
					<xsl:apply-templates select="*|text()"/>
				</fo:block>
			</fo:list-item-body>
		</fo:list-item>
	</xsl:template>

	<xsl:template match="xhtml:hr">
		<fo:block>
			<fo:leader leader-pattern="rule"/>
		</fo:block>
	</xsl:template>

	<xsl:template match="xhtml:i">
			<fo:inline font-style="italic">
			      <xsl:apply-templates select="*|text()"/>
			</fo:inline>
	</xsl:template>

	<xsl:template match="xhtml:img">
		<fo:block>
			<fo:external-graphic src="{@src}" content-width="scale-to-fit" content-height="100%" width="100%" scaling="uniform"/>
		</fo:block>
	</xsl:template>

	<xsl:template match="xhtml:object">
		<fo:block>
			<fo:external-graphic src="{@data}" content-width="scale-to-fit" content-height="100%" width="100%" scaling="uniform"/>
		</fo:block> 
	</xsl:template>

</xsl:stylesheet>

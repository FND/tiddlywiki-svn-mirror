<?xml version="1.0"?>
<!-- 

	convert XHTML to XSL-FO

-->
<xsl:stylesheet version="1.0"
     xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
	xmlns:fo="http://www.w3.org/1999/XSL/Format"
	xmlns:xhtml="http://www.w3.org/1999/xhtml">

   <xsl:output method="xml"/>
<xsl:template match="/">
    <fo:root>
      <fo:layout-master-set>
      <fo:simple-page-master 
        master-name="only">
        <fo:region-body 
           region-name="xsl-region-body" 
           margin="0.7in" 
            />
        <fo:region-before 
           region-name="xsl-region-before" 
           extent="0.7in" 
            display-align="before" />

          <fo:region-after 
           region-name="xsl-region-after" 
           display-align="after"
           extent="0.7in" 
           />
      </fo:simple-page-master>
      </fo:layout-master-set>

      <fo:page-sequence master-reference="only">
        <fo:flow 
           flow-name="xsl-region-body">
         <xsl:apply-templates />
        </fo:flow>
      </fo:page-sequence>

    </fo:root>
</xsl:template>


<xsl:template match="section">
 <fo:block  id="{generate-id}">
          <xsl:apply-templates/>
    </fo:block>
</xsl:template>

<xsl:template match="xhtml:h1">
    <fo:block  
      font-family="Times"
      font-size="18pt"
      font-weight="bold"
      space-before="18pt"
      space-after="12pt"
      text-align="center">
          <xsl:apply-templates/>
    </fo:block>
</xsl:template>

<xsl:template match="xhtml:p">
    <fo:block  
      font-family="Times"
      font-size="12pt"
      space-before="12pt"
      space-after="12pt"
      text-align="justify">
          <xsl:apply-templates/>
    </fo:block>
</xsl:template>

</xsl:stylesheet>

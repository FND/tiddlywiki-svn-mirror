/***
|''Name''|MasterIncludesLogMacro|
|''Version''|0.1|
|''Status''|@@experimental@@|
|''Author''|FND|
|''Source''|[tbd]|
|''License''|[[Creative Commons Attribution-ShareAlike 3.0 License|http://creativecommons.org/licenses/by-sa/3.0/]]|
|''~CoreVersion''|2.1|
|''Type''|macro|
|''Requires''|MasterIncludesPlugin|
|''Overrides''|N/A|
|''Description''|[tbd]|
!Usage
{{{
<<MasterIncludesLog [array] [prefix] [suffix]>>
}}}
* {{{prefix}}} and {{{suffix}}} are optional
!!Examples
<<MasterIncludesLog "imported">>
<<MasterIncludesLog "importedFiles">>
<<MasterIncludesLog "skipped">>
<<MasterIncludesLog "errors" "* {{{" "}}}\n">>
<<MasterIncludesLog "foo" "* {{{" "}}}\n">> /% DEBUG %/
!Revision History
!!v0.1 (2008-01-08)
* initial release
!To Do
[see MasterIncludesPlugin] /% DEBUG %/
!Code
[see MasterIncludesPlugin] /% DEBUG %/
***/
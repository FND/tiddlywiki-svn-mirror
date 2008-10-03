//{{{
// allow pipes in slice values (table notation)
TiddlyWiki.prototype.slicesRE = /(?:^([\'\/]{0,2})~?([\.\w]+)\:\1[\t\x20]*([^\n]+)[\t\x20]*$)|(?:^\|([\'\/]{0,2})~?([\.\w]+)\:?\4\|[\t\x20]*([^\n]+)[\t\x20]*\|$)/gm;
//}}}
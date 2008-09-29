import sys, re, os

sys.path.insert(0, '..')

from wikklytext.base import load_wikitext

for name in os.listdir('.'):
	m = re.match('^(.+)\.txt$', name)
	if m:
		buf = load_wikitext(name)
		u8name = m.group(1)+'.utf'
		print name, u8name
		
		m = re.match('.*/%\s*encoding:\s*\S+\s*%/(.+)$',buf, re.M|re.S)
		if m:
			txt = m.group(1)
		else:
			txt = buf
			
		txt = txt.rstrip().lstrip()
		print repr(txt)
		
		open(u8name, 'wb').write(txt.encode('utf-8-sig'))
		
		
			
		

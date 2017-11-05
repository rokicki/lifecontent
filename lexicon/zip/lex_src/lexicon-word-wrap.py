# coding=latin-1

import golly as g

with open("lexicon-no-wrap.txt") as f: s=f.read()

t=""
count=0
for line in s.split("\n"):
  count+=1
  i=0
  maxlen=72
  while len(line)>maxlen:
    i=maxlen
    while line[i]!=" ":
      i-=1
      if i<3:
        g.note("No spaces in the first 72 characters of this overlength line: '" + line + "'")
        t+=line+"\n"
        line=""
        break
    if i<3:
      break
    else:
      j=i
      while j>0:
        j-=1
        if line[j]=="}": break  # didn't find an open link marker
        if line[j]=="{":
          if line[j-1]==" ":
            i=j-1
            break
          else:
            g.note("Found weird formatting:  left curly brace just after non-space character\n"+line)
            g.exit()        
      t+=line[:i]+"\n   "
      line=line[i+1:].lstrip()
      maxlen=69
  t+=line+"\n"

g.note("All done.  Lines processed = " + str(count))
g.setclipstr(t)
#!/bin/sh
# Bash script to generate HTML versions of the Life Lexicon.

if !(./perfect lexicon.txt) then
{
  echo perfect failed!
  exit
} fi

if !(./htmlize lexicon.txt > tmp.htm) then
{
  echo htmlize failed!
  exit
} fi

if !(cat head.htm tmp.htm tail.htm > lexicon.htm) then
{
  echo cat failed!
  exit
} fi

if !(./perfect lexicon.htm) then
{
  echo perfect failed!
  exit
} fi

for x in ?.htm ;
  do {
    cat top1.htm $x top2.htm lex_$x bot.htm > tmp.htm;
    rm -f lex_$x
    mv tmp.htm lex_$x
    if !(./perfect lex_$x) then
    {
	echo failure with lex_$x !
	exit
    } fi
  }
done
./perfect lex.htm
./perfect lex_bib.htm

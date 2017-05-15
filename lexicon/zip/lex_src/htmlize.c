/*  Licence: CC BY 4.0  https://creativecommons.org/licenses/by/4.0/  */
/*
 *  This is a program to automatically generate HTML versions of the main
 *  part of the Life Lexicon from the ASCII version.  It is written in
 *  ANSI/ISO C (specifically, the common subset of C90 and C99), except
 *  that it assumes the use of ASCII.  It should also compile as C++.
 *
 *  This program does not attempt to convert the introductory notes at the
 *  beginning of the Lexicon and the bibliography at the end.  As such, the
 *  HTML produced is incomplete and requires extra material to be prepended
 *  and appended by the makehtml script.
 *
 *  Two HTML versions are produced.  The one-page version is output to stdout.
 *  The multipage version is output to files called lex_?.htm where ? is a
 *  letter or the number 1.
 *
 *  Usage:
 *    htmlize lexicon.txt
 *
 *  This program involves a lot of ad hoc stuff, and may need to be changed
 *  every now and then to cope with new complexities in the Lexicon.
 *  The Lexicon was not originally intended to be anything other than a plain
 *  text file, so the format was not designed to be easy to parse.
 *
 *  The program is very picky and most errors will cause it to terminate
 *  immediately with an appropriate message, whereas it would be better to
 *  go through the whole file and print out all necessary error messages.
 *
 *
 *  Stephen Silver
 *  life(at)argentum.freeserve.co.uk
 *
 *
 *  History:
 *   1998 Sep 24.  First released version.
 *   1998 Nov  8.  Added anchors for A-Z (for use in frames version).
 *   1999 Feb  8.  Added p as a possible mathematical symbol.
 *   2000 Jan 14.  Changed handling of p so that it is not italicised when
 *                 referring to a period.
 *   2000 Feb  6.  Removed use of <SMALL></SMALL> in exponents.
 *                 Changes to code handling italicised letters.
 *   2000 Feb 29.  Corrected bug in use of <TT></TT>.
 *   2000 Jun 17.  Fixed some non-ANSI things.
 *   2000 Jun 18.  Fixed memory leak.
 *   2000 Aug  3.  Changes to generate a multipage HTML version of the
 *                 Lexicon in addition to the single-page version.
 *   2000 Aug  8.  Changes to use of isalpha/isalnum/toupper/tolower so that
 *                 non-ASCII characters in the input won't cause problems.
 *                 (There are no such characters in the Lexicon at present.)
 *                 Also ensured that FreeHash is called on fatal errors.
 *   2000 Aug 11.  Removed unnecessary use of "&#34;".
 *                 Added error-checking for fclose().
 *                 Also minor cosmetic changes.
 *   2000 Nov  8.  A couple of minor changes for C++ compatibility.
 *   2000 Nov 16.  Fixed potential bug in IsEmpty().
 *   2001 Mar  3.  Changed FirstLetter() so that links to lex_1.htm in
 *                 multipage version now work.
 *   2001 May 27.  Changed NAME labels in multipage version.
 *   2001 May 28.  Anchors repositioned to circumvent bug in Netscape 6.01.
 *   2001 May 29.  Added code to handle numeric superscripts.
 *   2001 Jun  7.  Made all element and attribute names lowercase, as a first
 *                 step towards XHTML compatibility.
 *                 Use special style for Z when representing integers.
 *   2002 Jan 25.  Fixed LongRefLabel() so that the labels it generates
 *                 always begin with a letter.
 *   2003 May 16.  Added support for links to arbitrary http URLs.
 *                 Removed initialization of onepage_fp by stdout (which
 *                 doesn't work in some compilers).
 *   2003 May 26.  More special case handling of mathematical expressions.
 *                 Some minor improvements to single-page version.
 *   2003 May 27.  Change the way LongRefLabel() works for entries that don't
 *                 begin with a letter.
 *                 Links such as {glider}s now make the whole word into a
 *                 link, instead of just part of it.
 *                 Added lexicographic order checking.
 *   2005 Jan 28.  Added conversion of underscores to subscripts.
 *   2006 Mar  5.  Small change to LongRefLabel() to improve its use for
 *                 lexicographic ordering.
 *   2006 Mar 11.  Fix to prevent spurious italicization of P in M.I.P.
 *   2016 Sep 24.  Replaced the hash algorithm (which was broken on some 64-bit
 *                 compilers).
 *                 Increased the value of M to 32749 (so that the increasing
 *                 size of the Lexicon isn't likely to result in a hash table
 *                 overflow), and modified RefLabel() for this.
 *                 Added recognition of https URLs in IsURL().
 *                 Added "const" in a few places.
 *                 Added a licence to this file.
 */

#include <ctype.h>
#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#define FALSE 0
#define TRUE  1
typedef int BOOL;
typedef unsigned int UINT32;

/* These are for the first parameter of lexout(). */
#define ONEPAGE   1
#define MULTIPAGE 2
#define ALL (ONEPAGE | MULTIPAGE)

/* This defines the maximum line length and also acts as a check on the
 * ASCII file.  The maximum line length is really two less than this, the
 * extra two bytes being used for newline and null. */
#define MAXLINELEN 74

/* These macros are wrappers for isalpha, isalnum and isdigit.
 * They work on chars, rather than ints. */
#define IsAlpha(x) (isalpha((unsigned char)(x)))
#define IsAlnum(x) (isalnum((unsigned char)(x)))
#define IsDigit(x) (isdigit((unsigned char)(x)))

typedef enum {
    OK, NO_SECOND_COLON, NO_SECOND_BRACE
} ERRTYPE;

typedef enum {
    NORMAL, DIAGRAM
} MODE;

MODE mode;
unsigned long lineno=0;
unsigned keywords=0; /* number of keywords in lexicon, for information only */
unsigned crossref=0; /* number of cross-references, for information only */
FILE *onepage_fp;
FILE *multipage_fp = NULL;
char next_char = 'A';
char old_long_ref[99];

/* prototypes for forward references */
void FatalError(const char *str,...);



/*
 *  START OF HASH STUFF
 */

/*
 *  This is the modulus for the hash function,
 *  and will also determine the size of the hash table.
 */
#define M 32749

char *hashtable[M];
BOOL hashok[M];
int hashcount;
BOOL hash_initialized = FALSE;

/*
 *  Initialize the hash table.
 */
void
InitHash(void)
{
    char **cpp = hashtable;
    BOOL *bp = hashok;
    int i;

    for (i = 0; i < M; i++) {
	*cpp++ = NULL;
	*bp++ = FALSE;
    }
    hashcount = 0;
    hash_initialized = TRUE;
}

/*
 *  This is a hash function.
 *  The values produced by this can be different on different compilers,
 *  but that isn't really a problem.
 */
int
Hash(const char *str)
{
    unsigned long val = 0;

    while (*str) {
	val *= 97;
	val += *str;
	++str;
    }
    return (int) (val % M);
}

/*
 *  Insert a string into the hash table, if it isn't there already.
 *  This uses open addressing with linear probing (see Algorithm L in
 *  section 6.4 of Knuth's TAOCP).
 *  Returns TRUE if an actual insertion is done.
 *  If the table overflows then the program will exit immediately.
 */
BOOL
HashInsert(char *str)
{
    int i = Hash(str);
    for (;;) {
	if (hashtable[i]) {	/* something's there */
	    if (strcmp(hashtable[i], str)) {
		if (--i < 0)
		    i += M;
	    }
	    else
		return FALSE;
	}
	else {			/* insert into empty location */
	    if (++hashcount == M)
		FatalError("Hash table overflow!");
	    hashtable[i] = str;
	    return TRUE;
	}
    }
}

/*
 *  Get the value of a string from the hash table.
 *  The value is an arbitrary number used to make up the HTML NAME label,
 *  and as such we take it to be simply the position of the string in the
 *  table.
 *  Returns -1 if the string is not found.
 */
int
HashGetVal(const char *str)
{
    int i = Hash(str);

    for (;;) {
	if (hashtable[i]) {	/* something's there */
	    if (strcmp(hashtable[i], str)) {
		if (--i < 0)
		    i += M;
	    }
	    else
		return i;
	}
	else
	    return -1;
    }
}

/*
 *  Free all the strings in the hash table.
 *  This assumes that they were malloc'ed in the first place.
 */
void
FreeHash(void)
{
    char **cpp;
    int i;

    if (!hash_initialized) return;

    cpp = hashtable;
    for (i = 0; i < M; i++)
	free(*cpp++);
    hash_initialized = FALSE;
}

/*
 *  END OF HASH STUFF
 */



/*
 *  Fatal error handling.
 */
void
FatalError(const char *str,...)
{
    va_list ap;

    fprintf(stderr, "Error in line %lu: ", lineno);
    va_start(ap, str);
    vfprintf(stderr, str, ap);
    va_end(ap);
    fputc('\n', stderr);
    FreeHash();
    exit(EXIT_FAILURE);
}

/*
 *  Close a file, with error-checking.
 */
void
FCLOSE(FILE *fp, const char *errmsg)
{
    if (fclose(fp)) FatalError("%s", errmsg);
}

/*
 *  Tests if a string is essentially empty.
 */
BOOL
IsEmpty(const char *str)
{
    for (; *str; str++)
	if ((unsigned char)(*str) > ' ')
	    return FALSE;
    return TRUE;
}

/*
 *  This is the routine that is used for all HMTL output.
 *  The first argument controls which of the HTML streams the
 *  output is intended for.
 */
void
lexout(int which, const char *str, ...)
{
    va_list ap;

    va_start(ap, str);
    if (which & ONEPAGE)   vfprintf(onepage_fp, str, ap);
    va_end(ap);
    va_start(ap, str);
    if (which & MULTIPAGE) vfprintf(multipage_fp, str, ap);
    va_end(ap);
}

/*
 *  Returns a pointer to a static string containing the name of the
 *  multipage file for ch (which is a letter or digit).
 */
char*
MultipageFilename(int ch)
{
    static char fname[] = "lex_?.htm";

    fname[4] = (char)tolower(ch);
    return fname;
}

/*
 *  Move onto the next file in the multipage output.
 *  The input character selects the next file name.
 */
void
NextMultipageFile(int ch)
{
    char *fname;

    if (multipage_fp)
	FCLOSE(multipage_fp, "Error closing multipage output file,");
    fname = MultipageFilename(ch);
    multipage_fp = fopen(fname, "w");
    if (!multipage_fp)
	FatalError("Unable to open output file \"%s\".", fname);
}

/*
 *  This finds the first letter or digit of the given string.
 *  If it's a letter, the return value is the letter converted to uppercase.
 *  If it's a digit, the return value is '1'.
 *  If there is no letter or digit in the string then it returns 0.
 */
int
FirstLetter(const char *str)
{
    int ch;
    const char *cp = str;

    while (*cp)
    {
	ch = (unsigned char)(*cp);
	if (isalnum(ch)) {
	    if (isalpha(ch))
		return toupper(ch);
	    return '1';
	}
	cp++;
    }
    return 0;
}

/*
 *  Determines whether or not the beginning of the given string is an URL.
 *  Only needs to distinguish URLs from crossreferences, and only http URLs
 *  are currently checked for.
 */
BOOL
IsURL(const char *str)
{
    return (strlen(str) > 7 && 0 == memcmp("http://", str, 7)) ||
  	   (strlen(str) > 8 && 0 == memcmp("https://", str, 8));
}

/*
 *  This does a first pass of the file,
 *  storing cross-references in the hash table.
 */
void
FirstPass(FILE * fp)
{
    char line[MAXLINELEN], *cp0, *cp1, *str, *cp;

    InitHash();
    crossref = 0;
    lineno = 0;
    rewind(fp);
    while (fgets(line, MAXLINELEN, fp)) {
	lineno++;
	cp = line;
	while (NULL != (cp0 = strchr(cp, '{'))) {
	    ++cp0;
	    if (NULL == (cp1 = strchr(cp0, '}')))
		FatalError("Missing }.");
	    *cp1 = 0;
	    str = (char*)malloc(strlen(cp0) + 1);
	    if (!str)
		FatalError("Out of memory.");
	    strcpy(str, cp0);
	    if (IsURL(str)) {
		free(str);
	    }
	    else {
		++crossref;
		if (!HashInsert(str))
		    free(str);
	    }
	    cp = cp1 + 1;
	}
    }
}

/*
 *  Convert an unsigned int to base 36.
 *  (Assumes that no more than 8 digits are required.)
 */
void
itoa36(unsigned n, char *str)
{
    static const char digit[] = "0123456789abcdefghijklmnopqrstuvwxyz";
    char rev[8], *cp;

    /* Create string in reverse */
    cp = rev;
    while (n || cp == rev) {
	*cp++ = digit[n % 36];
	n /= 36;
    }

    /* Reverse it */
    while (cp > rev)
	*str++ = *--cp;
    *str = 0;
}

/*
 *  Produce the NAME label for a given string (for use in the single-page,
 *  version) or return NULL if the string is not in the hash table.
 *  If the def parameter is TRUE this means that the call is for a
 *  definition (rather than a link to the definition), and so the
 *  flag showing that this definition has been found is set.
 *  The input string is not altered.  The output is put into a static string.
 */
char *
RefLabel(const char *str, BOOL def)
{
    static char newstr[9];	/* with M==32749 we only really need 4 */
    int val = HashGetVal(str);

    if (val < 0)
	return NULL;
    if (def)
	hashok[val] = TRUE;
    itoa36(val + 10*36*36, newstr);  /* base 36 for brevity */
    return newstr;
}

/*
 *  Produce a long NAME label for a given string, for use in the multipage
 *  version (and also used for lexicographical ordering).
 *  Returns the label as a pointer to a static buffer.
 */
char *
LongRefLabel(const char *str)
{
    static char newstr[99];
    const char *scp = str;
    char *tcp = newstr;
    BOOL first_char = TRUE;

    while (*scp)
    {
	if (IsAlnum(*scp))
	{
	    if (first_char)
	    {
		if (!IsAlpha(*scp)) {
		    *tcp++ = 'a';
		    *tcp++ = '-';
		}
		first_char = FALSE;
	    }
	    *tcp = (char)tolower(*scp);
	    ++tcp;
	}
	++scp;
    }
    *tcp = *scp;
    return newstr;
}

/*
 *  Write a diagram line.
 *  Must convert every * to an O.
 */
void
puts_diag(char *line)
{
    char *cp = line;

    while (*cp) {
	if (*cp == '*')
	    *cp = 'O';
	++cp;
    }
    lexout(ALL, "%s\n", line);
}

/*
 *  Given a single line of ASCII, output the corresponding HTML.
 *  Returns an error code if the line is invalid for any reason.
 */
ERRTYPE
ConvertLine(char *line)
{
    char *cp, chr, *cp2, *lab, *str;
    int spnum, firstletter;

    /* diagram mode */
    if (mode == DIAGRAM) {
	if (*line != '\t') {
	    lexout(ALL, "</pre>\n");
	    mode = NORMAL;
	}
	else {
	    puts_diag(line);
	    return OK;
	}
    }

    /* normal mode */
    if (IsEmpty(line))
	return OK;
    if (*line == '\t') {	/* start of diagram */
	mode = DIAGRAM;
	lexout(ALL, "<pre>\n");
	puts_diag(line);
	return OK;
    }
    if (*line == ':') {		/* head word */
	char *long_ref, *word = line + 1;
	keywords++;
	cp = strchr(word, ':');
	if (!cp)
	    return NO_SECOND_COLON;
	*cp++ = 0;
	if (FirstLetter(word) == next_char)
	    NextMultipageFile(next_char);
	lexout(ALL, "<p>");

	if (FirstLetter(word) == next_char) {
	    lexout(ONEPAGE, "<a name=%c>:</a>", next_char);
	    next_char++;
	}
	else
	    lexout(ONEPAGE, ":");
	long_ref = LongRefLabel(word);
	lexout(MULTIPAGE, "<a name=%s>:</a>", long_ref);

	lab = RefLabel(word, TRUE);
	if (lab)
	    lexout(ONEPAGE, "<a name=%s>", lab);
	if (!strcmp(word, "Black&White"))/* too lazy to do this properly */
	    lexout(ALL, "<b>Black&amp;White</b>");
	else
	    lexout(ALL, "<b>%s</b>", word);
	if (lab)
	    lexout(ONEPAGE, "</a>");
	if (strcmp(old_long_ref,long_ref) > 0)
	    fprintf(stderr, "Error in lexicographic order: %s > %s\n",
		    old_long_ref, long_ref);
	strcpy(old_long_ref, long_ref);
    }
    else {			/* skip spaces at start of line */
	cp = line;
	spnum = 0;
	while (*cp == ' ') {
	    cp++;
	    spnum++;
	}
	if (spnum == 5)
	    lexout(ALL, "<p>");
	else if (spnum != 3)
	    FatalError("Incorrect indent.");
    }
    /* now do rest of line */
    while (0 != (chr = *cp++)) {
	switch (chr) {

	  case '{':
	    cp2 = strchr(cp, '}');
	    if (!cp2)
		return NO_SECOND_BRACE;	 /* such an error should have
					    been spotted in the first
					    pass, but let's play safe */
	    *cp2 = 0;
	    if (IsURL(cp)) {
		lexout(ALL, "<a href=\"%s\">%s", cp, cp);
	    }
	    else {
		lab = RefLabel(cp, FALSE);
		if (!lab)
		    FatalError("String \"%s\" is not in hash table.", cp);
		lexout(ONEPAGE, "<a href=\"#%s\">%s", lab, cp);
		firstletter = FirstLetter(cp);
		if (firstletter == next_char-1)
		    str = "";
		else
		    str = MultipageFilename(firstletter);
		lexout(MULTIPAGE, "<a href=\"%s#%s\">%s",
		       str, LongRefLabel(cp), cp);
	    }
	    cp = cp2 + 1;
	    /* include remainder of word (if any) in link */
	    while (IsAlnum(*cp)) lexout(ALL, "%c", *cp++);
	    lexout(ALL, "</a>");
	    break;

	  case 'O':		/* for O..O and O......O */
	    if (*(cp - 2) == ' ' && *cp == '.')
		lexout(ALL, "<tt>O");
	    else if (*(cp - 2) == '.' && (*cp == ' ' || *cp == 0))
		lexout(ALL, "O</tt>");
	    else
		lexout(ALL, "O");
	    break;

	  case 'Z':	/* possible use of Z to represent the integers */
	    if (!IsAlpha(*(cp - 2)) && !IsAlpha(*cp) &&
		    *cp != ',' && *cp != '-')
		lexout(ALL, "<span class=\"b\">%c</span>", chr);
	    else
		lexout(ALL, "%c", chr);
	    break;

	  case 'N':
	  case 'P':
	  case 'S':
	  case 'c':
	  case 'd':
	  case 'm':
	  case 'n':
	  case 'p':
	  case 'r':
	  case 't':
	  case 'u':
	  case 'v':
	    /* certain letters may be used as mathematical symbols */
	    if (*(cp - 2) == ' ' && chr == 'n'
		&& *cp == 'd' && *(cp + 1) == ',' ) {
		lexout(ALL, "<i>nd</i>");
		++cp;
	    }
	    else if ((*cp) == '_') {
		lexout(ALL, "<i>%c</i><sub>%c</sub>", chr, *(cp + 1));
		cp += 2;
	    }
	    else if (!IsAlpha(*(cp - 2)) && !IsAlnum(*cp)
		&& *(cp - 2) != '\'' && *(cp - 2) != '"'
		&& (chr != 'P')                 /* M.I.P. */
		&& (chr != 'S' || *cp != '='))	/* (S=stationary) */
		lexout(ALL, "<i>%c</i>", chr);
	    else if ((*(cp - 2)) == '(' && chr == 'm' && (*cp) == 'n')	/* (mn+m+n) */
		lexout(ALL, "<i>m");
	    else if ((*(cp - 2)) == 'm' && chr == 'n' && (*cp) == '+')	/* (mn+m+n) */
		lexout(ALL, "n</i>");
	    else
		lexout(ALL, "%c", chr);
	    break;

	  case 'x':		/* multiplication sign */
	    if (!IsAlpha(*(cp - 2)) && !IsAlpha(*cp))
		lexout(ALL, "&times;");
	    else
		lexout(ALL, "%c", chr);
	    break;

	  case '^':		/* exponentiation */
	    if (IsDigit(*cp)) {
		lexout(ALL, "<sup>");
		do {
		    lexout(ALL, "%c", *cp);
		    ++cp;
		} while (IsDigit(*cp));
		lexout(ALL, "</sup>");
	    }
	    else
		lexout(ALL, "<sup><i>%c</i></sup>", *cp++);
	    break;

	  case '<':
	    lexout(ALL, "&lt;");
	    break;

	  case '>':
	    lexout(ALL, "&gt;");
	    break;

	  case '&':
	    lexout(ALL, "&amp;");
	    break;

	  case ' ':
	    if (*cp != ' ')
		lexout(ALL, " ");    /* don't use double spaces */
	    break;

	  default:
	    lexout(ALL, "%c", chr);
	}
    }
    lexout(ALL, "\n");
    return OK;
}

/*
 *  This performs a check at the end to make sure that every reference
 *  refers to a definition that actually exists.
 *  Prints a warning for each reference for which this is not the case.
 *  Also prints the total number of cross-referenced words (valid or not).
 *  This also checks that the value of hashcount is correct - if it isn't
 *  then there is a bug in the program.
 */
void
FinalCheck(void)
{
    int i, count = 0;
    for (i = 0; i < M; i++) {
	if (hashtable[i]) {
	    count++;
	    if (!hashok[i])
		fprintf(stderr, "Invalid reference \"%s\"\n", hashtable[i]);
	}
    }
    if (count != hashcount)
	FatalError("Bug in hash routines!\n");
    fprintf(stderr, "%d cross-referenced keywords\n", hashcount);
}

/*
 *  main()
 */
int
main(int argc, char *argv[])
{
    char line[MAXLINELEN], *cp;
    int len;
    ERRTYPE err;
    FILE *fp;

    onepage_fp = stdout;
    strcpy(old_long_ref, "a");

    /* Process command-line arguments */
    if (argc != 2) {
	fprintf(stderr, "Usage:  htmlize <filename>\n");
	exit(EXIT_FAILURE);
    }
    fp = fopen(argv[1], "rt");
    if (!fp)
	FatalError("Cannot open input file %s.", argv[1]);

    /* Perform first pass */
    FirstPass(fp);

    /* Prepare for second pass */
    rewind(fp);
    keywords = 0;
    lineno = 0;
    mode = NORMAL;
    NextMultipageFile('1');

    /* Skim over the introductory notes, which cannot be converted */
    for (;;) {
	fgets(line, MAXLINELEN, fp);
	lineno++;
	len = strlen(line);
	cp = line + (len - 1);
	if (*cp != '\n')
	    FatalError("Line too long.");
	if (!memcmp(line, "----", 4))
	    break;
    }

    /* Main loop */
    while (fgets(line, MAXLINELEN, fp)) {
	lineno++;
	len = strlen(line);
	cp = line + (len - 1);
	if (*cp != '\n')
	    FatalError("Line too long.");
	*cp = 0;
	if (!memcmp(line, "----", 4))
	    break;		/* skip bibliography */
	err = ConvertLine(line);
	if (err)
	    FatalError("Type %d error.", err);
    }

    /* Finish up */
    FCLOSE(fp, "Error closing input file,");
    if (mode == DIAGRAM)
	lexout(ALL, "</pre>\n");
    fprintf(stderr, "%u keywords\n%u cross-references\n", keywords, crossref);
    FinalCheck();
    FreeHash();
    FCLOSE(multipage_fp, "Error closing multipage output file,");
    FCLOSE(onepage_fp, "Error closing single-page output file,");
    return 0;
}

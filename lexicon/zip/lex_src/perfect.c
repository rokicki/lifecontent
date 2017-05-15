/*
 *  This program is used to tidy up the Life Lexicon and can be used on both
 *  the ASCII and the HTML versions.  It does the following:
 *    Removes carriage returns.
 *    Removes tabs and spaces at ends of lines.
 *    Converts 8 spaces at the beginning of a line into a tab.
 *    Removes 1-7 spaces at the beginning of a line if followed by a tab.
 *    Makes sure file ends with a line feed.
 *  Some of these things are necessary in order for HTMLIZE to work properly.
 *  Others just ensure that the file is not unnecessarily large.
 *
 *  Stephen Silver
 *  life@argentum.freeserve.co.uk
 *
 *  History:
 *    1998 Sep 24  Original version.
 *    2000 Aug 11  Minor changes.
 */

#include <stdarg.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>


FILE *ifp, *ofp;

#define MAXLEN 1000
char linebuf[MAXLEN];
char *cp_lim = linebuf + (MAXLEN - 1);

/* Fatal error handling */
void
FatalError(char *str,...)
{
    va_list ap;

    fputs("Error: ", stderr);
    va_start(ap, str);
    vfprintf(stderr, str, ap);
    va_end(ap);
    fputc('\n', stderr);
    exit(EXIT_FAILURE);
}

/*
 *  Read next line from ifp into linebuf.
 *  Ignore carriage returns.
 *  Return 0 on failure (EOF), 1 otherwise.
 */
int
GetLine(void)
{
    int chr;
    char *cp = linebuf;

    for (;;) {
	do {
	    chr = getc(ifp);
	} while (chr == '\r');
	if (chr == EOF) {
	    if (cp == linebuf)
		return 0;
	    if (*(cp - 1) != '\n')
		*cp++ = '\n';
	    *cp = 0;
	    return 1;
	}
	*cp++ = chr;
	if (chr == '\n') {
	    *cp = 0;
	    return 1;
	}
	if (cp == cp_lim) {
	    *cp = 0;
	    return 1;
	}
    }
}

/*
 *  Convert from ifp to ofp.
 */
void
Convert(void)
{
    char *cp;
    int spaces, len;
    unsigned lineno = 0;

    while (GetLine()) {
	lineno++;
	len = strlen(linebuf);
	cp = linebuf + (len - 1);
	if (*cp != '\n')
	    FatalError("Line %u is too long.", lineno);
	/* remove trailing tabs and spaces */
	do {
	    --cp;
	}
	while (*cp == ' ' || *cp == '\t');
	*(cp + 1) = 0;
	/* deal with leading spaces */
	spaces = 0;
	cp = linebuf;
	while (*cp == ' ') {
	    cp++;
	    spaces++;
	}
	if (spaces >= 8) {
	    cp = linebuf + 7;
	    *cp = '\t';
	}
	else if (*cp != '\t')
	    cp = linebuf;
	/* output results */
	fputs(cp, ofp);
	fputc('\n', ofp);
    }
}

/*
 *  main()
 */
int
main(int argc, char *argv[])
{
    char *ofname, *ifname;

    if (argc != 2) {
	fputs("Usage:  perfect <filename>\n", stderr);
	exit(EXIT_FAILURE);
    }

    ifname = argv[1];
    ofname = tmpnam(NULL);

    ifp = fopen(ifname, "r");
    if (!ifp)
	FatalError("Unable to open input file \"%s\".", ifname);

    ofp = fopen(ofname, "wb");
    if (!ofp)
	FatalError("Unable to open output file \"%s\".", ofname);

    Convert();

    fclose(ifp);
    fclose(ofp);
    if (remove(ifname))
	FatalError("Unable to delete original \"%s\".", ifname);
    if (rename(ofname, ifname))
	FatalError("Unable to rename \"%s\" to \"%s\".", ofname, ifname);

    return 0;
}

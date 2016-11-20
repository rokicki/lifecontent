BEGIN {
    printf("<TITLE>The pattern</TITLE>\n");
    printf("<applet codebase=\"..\" code=\"LifeApp\" width=500 height=350>\n");
    printf("<param name=pattern value=\"bhept/%s\">\n",
        substr(ARGV[1],1,index(ARGV[1],".")-1));
    printf("</applet>\n");
    printf("<P>\n");
   }
{}
END {
    printf("Get <A HREF=\"%s\">Pattern File</A>\n",ARGV[1]);
}

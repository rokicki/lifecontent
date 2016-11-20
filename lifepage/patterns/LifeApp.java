/*
    Conway's Life Generator for Java.  (11-Jan-97 revision)
    Copyright 1996-97 by Paul B. Callahan, callahanp@acm.org

    Fixed null pointer exception (about time!) (4-Mar-98)
*/

import java.util.*;
import java.awt.*;
import java.awt.image.ImageObserver;
import java.awt.image.PixelGrabber;

class LifeGenerator {

      int CellList[], n;
      int a[];
      int b[];
      int c[];
      int generations;

      Color background;
      Color foreground;
      Color livecell;
      Color deadcell;
      Color border;

      int statusheight;
      int displaywidth;
      int displayheight;
      int cellsize;

      int originx;
      int originy;
      
      int maxcells;

      static int countmsk=0x1f;
      static int posmsk=0x7fffffe0;
      static int maxval=0x7fffffff;

      String statusLine;
      String loading;

      int scroll;

      static boolean rules[]={
                           false, false,
                           false, false,
                           false, true,
                           true,  true,
                           false, false,
                           false, false,
                           false, false,
                           false, false,
                           false, false };

     boolean newpattern;


     public LifeGenerator() {

       initPattern();
       maxcells=0;
       resizeIfNeeded(1);

     }

     public void initPattern() {

       n=0;
       generations=0;
       background=Color.white;
       foreground=Color.black;

       originx=0;
       originy=0;

       loading=null;
       scroll=10;
       cellsize=2;

       statusLine=new String("");

       newpattern=true;
     }

     public boolean isNewPattern() {
        return newpattern;
     }

     public void loadedPattern() {
        newpattern=false;
     }

     public void loading(String init_loading) {
        loading=init_loading;
     }

     public void setScroll(int init_scroll) {
        scroll=init_scroll;
     }

     public void setColors(Color init_background, Color init_foreground,
                           Color init_border) {
        background=init_background;
        foreground=init_foreground;
        border=init_border;
     }

     public void setCellColors(Color init_deadcell, Color init_livecell) {
        deadcell=init_deadcell;
        livecell=init_livecell;
     }

     public void setDisplaySize(int width, int height) {
         statusheight=35;

         displaywidth=width;
         displayheight=height-statusheight;
     }

     public void translate(int dx, int dy) {
         originx+=dx;
         originy+=dy;
     }

     public void recenter(int x, int y) {
        translate(displaywidth/2-x, displayheight/2-y);        
     }

     public boolean approachcenter(int x, int y) {
      boolean retval;

        if (y<displayheight && x<displaywidth) {
          translate((displaywidth/2-x)/scroll, 
                   (displayheight/2-y)/scroll);        
          retval=true;
        } else retval=false;
        
        return retval;
     }

     public void findPattern() {
        if (n>0) {
           int packed=CellList[n/2];
           int plotx=getPlotX(packed);
           int ploty=getPlotY(packed);
           recenter(plotx, ploty);
        }
     }

     public void zoom(int incr) {
        
        int x=(displaywidth/2-originx)/cellsize;
        int y=(displayheight/2-originy)/cellsize;

        cellsize+=incr;

      /* occasionally simultaneous button handlers can
         decrement cellsize to 0 */

        if (cellsize<1) cellsize=1;

        recenter(x*cellsize+originx, y*cellsize+originy);
     }

     public void updateStatusLine(Graphics g) {
         g.setColor(background);
         g.drawString(statusLine,0,displayheight+15);

         if (loading!=null) {
            statusLine="Loading: " + loading;
         } else {
            statusLine="Generations: " + generations + "  Cells: " + n;
         }
         g.setColor(foreground);
         g.drawString(statusLine,0,displayheight+15);
     }

     void resizeIfNeeded(int cellcount) {
        int tmp[];
        int i;

         if (cellcount>maxcells) {     

           int newsize=2*cellcount;

           tmp=new int[newsize];
           for (i=0; i<maxcells; i++) tmp[i]=CellList[i];
           CellList=tmp;

           tmp=new int[newsize];
           for (i=0; i<maxcells; i++) tmp[i]=a[i];
           a=tmp;

           tmp=new int[newsize];
           for (i=0; i<maxcells; i++) tmp[i]=b[i];
           b=tmp;

           tmp=new int[newsize];
           for (i=0; i<maxcells; i++) tmp[i]=c[i];
           c=tmp;

           maxcells=newsize;
         }
     }

      static int combineLists(int a[], int na,
                              int b[], int nb,
                              int c[]) {
           int i,j,nc;

           i=0; j=0; nc=0;
           a[na]=maxval;
           b[nb]=maxval;
           while (i<na || j<nb) {
              if ((a[i]^b[j])<=countmsk) {
                 c[nc++]=(a[i++]&countmsk)+b[j++];
              } else if (a[i]<b[j]) {
                 c[nc++]=a[i++];
              } else {
                 c[nc++]=b[j++];
              }
           }

           return nc;
      }


     static void extractCenterCells(int list[], int n,
                                    int counts[]) {
           int i=0, j=0;
          
           while (i<n) {
              if ((list[i]^counts[j])<=countmsk) {
                 counts[j]--;
                 i++;
                 j++;
              } else j++;                  
           }
     }

     static int Cell(int x, int y, int value) {

         return ((y+(1<<12))<<18) +((x+(1<<12))<<5) + value; 

     }

     int getPlotX(int packed) {
        return (((packed>>5)&0x1fff)-(1<<12))*cellsize+originx;
     }

     int getPlotY(int packed) {
        return ((packed>>18)-(1<<12))*cellsize+originy;
     }
     
     void plotCell(int packed, Graphics g) {

        int plotx=getPlotX(packed);
        int ploty=getPlotY(packed);

        if (plotx > 3 && plotx < displaywidth-3-cellsize &&
            ploty > 3 && ploty < displayheight-3-cellsize ) {
          int boxsize=cellsize-((cellsize>3)?1:0);
          g.fillRect(plotx, ploty, boxsize, boxsize);
        }
     }

     public void paintAll(Graphics g) {
         g.clearRect(0,0,displaywidth, displayheight+statusheight);

         g.setColor(deadcell);
         g.fillRect(0,0,displaywidth, displayheight);
         g.setColor(border);
         g.drawRect(0,0,displaywidth-1, displayheight-1);
         g.setColor(livecell);

         for (int i=0; i<n; i++) {
                  plotCell(CellList[i],g);            
         }

         updateStatusLine(g);
     }

     int nextGen(int counts[], int ncounts,
                         int list[], Graphics g) {
        int nlist=0;
        for (int i=0; i<ncounts; i++) {
           int count=counts[i]&countmsk;
           if (rules[count]) {
              list[nlist++]=(counts[i]&posmsk)+2;
              if ((count&1)==0) {
                  g.setColor(livecell);
                  plotCell(counts[i],g);
              }
           } else {
              if ((count&1)==1) {
                  g.setColor(deadcell);
                  plotCell(counts[i],g);            
              }
           }
        }
        return nlist;
     }


     public void generate(Graphics g) {
        int na, nb, nc;

          for (na=0; na<n; na++) a[na]=CellList[na]-(1<<18);
          resizeIfNeeded(n+na);
          nb=combineLists(CellList,n,a,na,b);

          for (na=0; na<n; na++) a[na]=CellList[na]+(1<<18);
          resizeIfNeeded(na+nb);
          nc=combineLists(a,na,b,nb,c);

          for (na=0; na<nc; na++) a[na]=c[na]-(1<<5);
          resizeIfNeeded(na+nc);
          nb=combineLists(a,na,c,nc,b);

          for (na=0; na<nc; na++) a[na]=c[na]+(1<<5);
          resizeIfNeeded(na+nb);
          nc=combineLists(a,na,b,nb,c);

          extractCenterCells(CellList, n, c);

          n=nextGen(c, nc, CellList, g);

          generations++;
     }


    public boolean loadLifePattern(Image img, ImageObserver imgobs) {

        int w=img.getWidth(imgobs);
        int h=img.getHeight(imgobs);

        if (w<0 || h<0) return false;

        cellsize=displaywidth/w;
        if (cellsize>displayheight/h) cellsize= displayheight/h;
        if (cellsize<1) cellsize=1; 

        originx= (displaywidth-w*cellsize)/2-cellsize/2;
        originy= (displayheight-h*cellsize)/2-cellsize/2;

        int[] pixels = new int[w * h];

        PixelGrabber pg = new PixelGrabber(img, 0, 0, w, h, pixels, 0, w);

        try {
            pg.grabPixels();
        } catch (InterruptedException e) {
//            System.err.println("interrupted waiting for pixels!");
            return false;
        }
        int i,j;

        int pix0= pixels[0];
        int pix1= -1;
        int count1= 0;

        for (i=0; i<h; i++) {
           for (j=0; j<w; j++) {
            
              if (pixels[i*w+j]!=pix0) {
                 pix1= pixels[i*w+j];
                 count1++;
              }
          }
        }

        /* figure out which pixel color denotes a live cell */        

        if (pix0==0xffffff) {}
        else if (pix1==0xffffff || count1 > w*h-count1) {
           pix1=pix0;
           count1=w*h-count1;
        }

        resizeIfNeeded(count1);

        n=0;
        for (i=0; i<h; i++) {
           for (j=0; j<w; j++) {
            
              if (pixels[i*w+j]==pix1) {
              CellList[n++]=Cell(j,i,2);
              }

          }
        }

        return true;
   }
}



public class LifeApp extends java.applet.Applet implements Runnable{

  LifeGenerator LifeList;
  Thread killme=null;
  int speed=50;
  boolean neverPainted=true;
  int count=0;
  TextField patfield;
  Button pausebutton;
  Button zoomout;
  boolean generating=false;
  int stepsleft=0;
  int scrollfraction=5;

  public LifeApp() {
    LifeList = new LifeGenerator();
  }

  public void init() {

    pausebutton=new Button("Start");
    zoomout=new Button("<");

    String patname=getParameter("pattern");
    if (patname==null) patname="gun30";

    if (getParameter("started")!=null) {
       pausebutton.setLabel("Stop");
       generating=true;
    }

    String pstring;

    if ((pstring=getParameter("speed"))!=null) {
        speed=Integer.valueOf(pstring).intValue();
    }

    if ((pstring=getParameter("scrollfraction"))!=null) {
        scrollfraction=Integer.valueOf(pstring).intValue();
    }


     setLayout(new FlowLayout(FlowLayout.RIGHT, 0, 
                   size().height-30));

     add(pausebutton);
     add(new Button("Step"));
     add(zoomout);
     add(new Button(">"));
     add(new Button("Recenter"));
     add(patfield=new TextField(patname,8));
  }

   public void start() {
  
    if (killme==null)
      {
         killme=new Thread(this);
         killme.start();
      }
  }

  public void stop() {
      killme=null;
  }


  public boolean mouseDown(Event ev, int x, int y) {

      if (LifeList.approachcenter(x,y)) {
            LifeList.paintAll(getGraphics());
      }

      return true;
  }

  public boolean action(Event ev, Object arg) {
     boolean acted=true;
     boolean damage=true;

      if (ev.target instanceof Button) {
         String label=(String)arg;

         if (label.equals("Stop")) {
            pausebutton.setLabel("Start");
            generating=false;
         }
         else if (label.equals("Start")) {
            pausebutton.setLabel("Stop");
            generating=true;
         }
         else if (label.equals("Step")) {
            stepsleft=1;
            if (generating) {
               pausebutton.setLabel("Start");
               generating=false;
            }
            damage=false;
         }
         else if (label.equals("Recenter")) {
            LifeList.findPattern();
         }
         else if (label.equals("<")) {
            LifeList.zoom(-1);
            if (LifeList.cellsize<=1) zoomout.disable();
         }     
         else if (label.equals(">")) {
            LifeList.zoom(1);
            if (LifeList.cellsize>=2) zoomout.enable();
         }
         else acted=false;
      } else if (ev.target==patfield) {
         stop();
         LifeList.initPattern();
         zoomout.enable();
         start();
      } else acted=false;

      if (acted && damage) LifeList.paintAll(getGraphics());

      return acted;
  }

  

  static String makeGifName(String patname) {
      int i=patname.indexOf(".");
      String base=(i<0)?patname:patname.substring(0,i);
      return base.concat(".gif");
  }

  void loadNew(String patname) {

    Image img=getImage(getCodeBase(), makeGifName(patname));

    LifeList.loading(patname);
    LifeList.paintAll(getGraphics());

    while(killme!=null && !LifeList.loadLifePattern(img, this)) {
       try {Thread.sleep(200);} catch
                    (InterruptedException e) {} 
    }
    if (LifeList.cellsize<=1) zoomout.disable();

    LifeList.loadedPattern();

    LifeList.loading(null);
    LifeList.paintAll(getGraphics());

  }

  public void run() {

    Graphics g=getGraphics();

    if (LifeList.isNewPattern()) {
       LifeList.setColors(getBackground(), Color.black, 
                                           Color.red.darker());
       LifeList.setCellColors(Color.white, Color.blue);
       LifeList.setScroll(scrollfraction);
       LifeList.setDisplaySize(size().width, size().height);
       loadNew(patfield.getText());
    }

    while (killme != null) {
         try {Thread.sleep(speed);} catch
                         (InterruptedException e) {}
         repaint();         
    }
    killme=null;
  }

  public void paint(Graphics g) {
     LifeList.paintAll(g);
  }

  public void update(Graphics g) {
   if (generating || stepsleft-- > 0) {
     LifeList.generate(g);
     LifeList.updateStatusLine(g);
   }
  }

}

/* Still Life generator copyright 1996-97 by Paul Callahan 
   (23-Jan-97 revision)*/

import java.util.*;
import java.net.*;
import java.awt.*;
import java.applet.*;

class CellBoard {

   int scale;
   int xorig, yorig;

   int cellrad;

   int ncolumns, nrows;
   int cells[][];
   int neighbors[][];
   boolean mark[][];
   boolean fixed[][];

   int i_fix[];
   int j_fix[];
   int fix_ind[][];
   int nfix;

   int nviolations;
   int ncells;
   int randmove;
   int randset;

   int couldToggle;

   Color meshcolor=Color.blue;
   Color fixedcolor=Color.cyan;
   Color bg=Color.white;
   Color fg=Color.black;
   Color border=Color.red.darker();
   Color inconsistent=Color.red;

   static int rules[][]={ {0,0,0,1,0,0,0,0,0}, 
                          {0,0,1,1,0,0,0,0,0} };
 
   Color advicecol[];


   CellBoard(int nrows0, int ncolumns0, int scale0) {
      ncolumns=ncolumns0;
      nrows=nrows0;
      scale=scale0;

      cells=new int[nrows][ncolumns];
      neighbors=new int[nrows][ncolumns];
      mark=new boolean[nrows][ncolumns];
      fixed=new boolean[nrows][ncolumns];

      fix_ind=new int[nrows][ncolumns];
      i_fix=new int[(nrows-2)*(ncolumns-2)];
      j_fix=new int[(nrows-2)*(ncolumns-2)];
      nfix=0;

      nviolations=0;
      ncells=0;
      randmove=3;
      randset=10;

      for (int i=0; i<nrows; i++) {
         for (int j=0; j<ncolumns; j++) {
           cells[i][j]=0;
           neighbors[i][j]=0;
           mark[i][j]=false;
           fixed[i][j]=false;
           fix_ind[i][j]= -1;
        }
      }

      cellrad=scale/2-1;
      xorig=scale;
      yorig=scale;

      advicecol=new Color[11];

      advicecol[0]=new Color(0xff0000);
      advicecol[1]=new Color(0xff0000);
      advicecol[2]=new Color(0xff0000);
      advicecol[3]=new Color(0xff0000);
      advicecol[4]=new Color(0x0000ff);
      advicecol[5]=new Color(0x00ff00);
      advicecol[6]=new Color(0x00ff00);
      advicecol[7]=new Color(0x00ff00);
      advicecol[8]=new Color(0x00ff00);

      couldToggle=0;

   }

   void setRandMove(int rm) {
      randmove=rm;
   }

   boolean isStable() {

       return couldToggle==0;
   }


   void clear(Graphics g) {
   
       for (int i=1; i<nrows-1; i++) {
          for (int j=1; j<ncolumns-1; j++) {
              if (!fixed[i][j] && cells[i][j]==1) displayToggle(i,j,g);
          }
       }


   }
   void randomize(Graphics g, Random rng) {
   
       for (int i=1; i<nrows-1; i++) {
          for (int j=1; j<ncolumns-1; j++) {
              if (!fixed[i][j] && 
                  rng.nextInt()%randset==0) displayToggle(i,j,g);
          }
       }


   }

   boolean stabilize(Graphics g, Random rng) {

         int count=0;
         int choose_i, choose_j;
         int maximprove= -10;
         choose_i= -1;
         choose_j= -1;

         int randcount=0;
         int rand_i=0, rand_j=0;

            
         for (int enum=0; enum<nfix; enum++) {
            int i=i_fix[enum]; 
            int j=j_fix[enum];
            if (!fixed[i][j]) {

              randcount++;
              if (rng.nextInt()%randcount==0) {
                  rand_i=i;
                  rand_j=j;
              }
              int adv=getAdvice(i,j);
              if (adv>maximprove) {
                 maximprove=adv;
                 choose_i=i;
                 choose_j=j;
                 count=1;
              } else if (adv==maximprove) {
                 count++;
                 if (rng.nextInt()%count==0) {
                     choose_i=i;
                     choose_j=j;
                 }
            }
          }
         }

         if (choose_i== -1) {
             return false;
         }
         
         if (rng.nextInt()%randmove==0) displayToggle(rand_i, rand_j, g);
         else displayToggle(choose_i, choose_j, g);

         return true;

   }


   int violation(int i, int j) {
      i=i%nrows;
      if (i<0) i+=nrows;
  
      j=j%ncolumns;
      if (j<0) j+=ncolumns;

      return rules[cells[i][j]][neighbors[i][j]]^cells[i][j];
   }



   boolean couldHelp(int i, int j) {

     return
         violation(i-1,j-1) +
         violation(i-1,j  ) +
         violation(i-1,j+1) +
         violation(i  ,j-1) +
         violation(i  ,j  ) +
         violation(i  ,j+1) +
         violation(i+1,j-1) +
         violation(i+1,j  ) +
         violation(i+1,j+1) > 0;

   }

   int dviolation(int i, int j, int dneighbor) {

     int val=cells[i][j];
     int ncount=neighbors[i][j];

     int retval=0;
     if (rules[val][ncount]==val) {
         if (rules[val][ncount+dneighbor]!=val) retval= 1;
     }  else {
         if (rules[val][ncount+dneighbor]==val) retval= -1;
     }

      return retval;

   }


   int getAdvice(int i, int j) {

     int val=cells[i][j];
     int ncount=neighbors[i][j];
     int dcell=1-2*val;

     int dviol=
         dviolation(i-1,j-1,dcell)+
         dviolation(i-1,j  ,dcell)+
         dviolation(i-1,j+1,dcell)+
         dviolation(i  ,j-1,dcell)+
         dviolation(i  ,j+1,dcell)+
         dviolation(i+1,j-1,dcell)+
         dviolation(i+1,j  ,dcell)+
         dviolation(i+1,j+1,dcell);

     if (rules[val][ncount]==val) {
         if (rules[val+dcell][ncount]!=val+dcell) dviol++;
     } else {
         if (rules[val+dcell][ncount]==val+dcell) dviol--;
     }

     return -dviol;

   }


   void paintViolations(Graphics g) {

      g.clipRect(xorig-scale,yorig-scale,ncolumns*scale+1,nrows*scale+1);

       for (int i=0; i<nrows; i++) {
          for (int j=0; j<ncolumns; j++) {
              drawViolation(i,j,g);
          }
       }
   }



   void toggle(int i, int j) {

      nviolations-=getAdvice(i,j);

      int newval=1-cells[i][j];
      int change=newval-cells[i][j];

      ncells+=change;
      cells[i][j]=newval;

      neighbors[i-1][j-1]+=change;
      neighbors[i-1][j  ]+=change;
      neighbors[i-1][j+1]+=change;
      neighbors[i  ][j-1]+=change;
      neighbors[i  ][j+1]+=change;
      neighbors[i+1][j-1]+=change;
      neighbors[i+1][j  ]+=change;
      neighbors[i+1][j+1]+=change;

   }

   void fixedFree(int x, int y, Graphics g) {
      int i=(y-yorig)/scale + 1;
      int j=(x-xorig)/scale + 1;

      if (y>=yorig && x>=xorig &&
          i>0 && i<nrows-1 && j>0 && j<ncolumns-1) {
             fixed[i][j]= !fixed[i][j]; 

             drawCell(i,j,g);
             drawViolation(i,j,g);
             drawAdvice(i,j,g);

             couldToggle=0;
             for (int enum=0; enum<nfix; enum++) {
                 if (!fixed[i_fix[enum]][j_fix[enum]]) couldToggle++;
             }

          }

   }

   void userToggle(int x, int y, Graphics g) {

      int i=(y-yorig)/scale + 1;
      int j=(x-xorig)/scale + 1;

      if (y>=yorig && x>=xorig &&
          i>0 && i<nrows-1 && j>0 && j<ncolumns-1) {
          displayToggle(i,j,g);
      }
   }

   void displayToggle(int i, int j, Graphics g) {


        toggle(i,j);

        for (int di= -2; di<=2; di++) {
           for (int dj= -2; dj<=2; dj++) {

             if (i+di>=0 && i+di<=nrows-1 && j+dj>=0 && j+dj<=ncolumns-1) {
                 drawCell(i+di,j+dj,g);

                 drawViolation(i+di,j+dj,g);

                 if (i+di>0 && i+di<nrows-1 && j+dj>0 && j+dj<ncolumns-1) {
                    drawAdvice(i+di,j+dj,g);                
                 }


             }
         }
      }

   }


   void paintBoard(Graphics g) {

      g.setColor(bg);
      g.fillRect(xorig-scale,yorig-scale,ncolumns*scale+1,nrows*scale+1);

      g.setColor(meshcolor);

      for (int i=1; i<nrows-2; i++) {
         g.drawLine(xorig, yorig+i*scale,
                    xorig+(ncolumns-2)*scale-1, yorig+i*scale);
      }

      for (int j=1; j<ncolumns-2; j++) {
         g.drawLine(xorig+j*scale, yorig, 
                    xorig+j*scale, yorig+(nrows-2)*scale-1);
      }

      g.setColor(border);
      g.drawRect(xorig,yorig,(ncolumns-2)*scale,(nrows-2)*scale);


      for (int i=1; i<nrows-1; i++) {
         for (int j=1; j<ncolumns-1; j++) {

             if (cells[i][j]==1 || fixed[i][j]) {
                drawCell(i,j,g);
             }  

             drawViolation(i,j,g);

             drawAdvice(i,j,g);
         }
      }

      for (int i=0; i<nrows; i++) {
          drawViolation(i,0,g);
          drawViolation(i,ncolumns-1,g);
      }


      for (int j=1; j<ncolumns-1; j++) {
          drawViolation(0,j,g);
          drawViolation(nrows-1,j,g);
      }



   }



   void drawViolation(int i, int j, Graphics g) {

              if (violation(i,j)==1) {
                  g.setColor(inconsistent);

                  g.drawLine(xorig+(j-1)*scale+1, yorig+(i-1)*scale+1,
                             xorig+j*scale-1, yorig+i*scale-1);  

                  g.drawLine(xorig+(j-1)*scale+2, yorig+(i-1)*scale+1,
                             xorig+j*scale-1, yorig+i*scale-2);  

                  g.drawLine(xorig+j*scale-1, yorig+(i-1)*scale+1,
                             xorig+(j-1)*scale+1, yorig+i*scale-1);

                  g.drawLine(xorig+j*scale-1, yorig+(i-1)*scale+2,
                             xorig+(j-1)*scale+2, yorig+i*scale-1);

              }
   }





  void drawAdvice(int i, int j, Graphics g) {

      int ind=fix_ind[i][j];

      if ( !couldHelp(i,j) ) {
           if (ind>=0) {
               i_fix[ind]=i_fix[--nfix];
               j_fix[ind]=j_fix[nfix];
               fix_ind[i_fix[ind]][j_fix[ind]]=ind;

               if (!fixed[i][j]) couldToggle--;               
               fix_ind[i][j]= -1;
           }
      } else {
           if (ind== -1) {
               fix_ind[i][j]=nfix;
               i_fix[nfix]=i;
               j_fix[nfix++]=j;

               if (!fixed[i][j]) couldToggle++;
           }

        int dviolations=getAdvice(i,j);
        int advicerad=cellrad-10+Math.abs(dviolations);

        if (dviolations< -4) dviolations= -4;
        else if (dviolations >4) dviolations=4;

        g.setColor(advicecol[dviolations+4]);

        g.fillRect(xorig+j*scale-scale/2-advicerad,
                 yorig+i*scale-scale/2-advicerad, 
                     2*advicerad+1, 2*advicerad+1);

      }
  }




  void drawCell(int i, int j, Graphics g) {

      if (!fixed[i][j]) g.setColor(bg);
      else g.setColor(fixedcolor);  

      g.fillRect(xorig+(j-1)*scale+1, yorig+(i-1)*scale+1,
                 scale-1, scale-1);

      g.setColor(meshcolor);

      if (i>1 && i<nrows-1 && j>0 && j<ncolumns-1) {
        g.drawLine(xorig+(j-1)*scale, yorig+(i-1)*scale,
                   xorig+j*scale-1,   yorig+(i-1)*scale);
      }
   
      if (j>1 && j<ncolumns-1 && i>0 && i<nrows-1 ) {
         g.drawLine(xorig+(j-1)*scale, yorig+(i-1)*scale,
                 xorig+(j-1)*scale, yorig+i*scale-1);
      }
/*
      if (fixed[i][j]) {
         g.drawRect(xorig+(j-1)*scale+1, yorig+(i-1)*scale+1,
                    scale-2, scale-2);
      }
*/
      if (cells[i][j]==1) {
         g.setColor(fg);
         g.fillOval(xorig+j*scale-scale/2-cellrad, 
                    yorig+i*scale-scale/2-cellrad, 
                     cellrad*2, cellrad*2);
      }
  }


}




public class StillLife extends java.applet.Applet implements Runnable {

  CellBoard board;
  Random rgen;
  Thread killme=null;
  boolean fixing;
  boolean setFixed;
  Choice fixSet;
  Choice randomProb;
  Button setCells;
  Button stabilizeButton;
  Button stopButton;

  public void init() {

     setLayout(new FlowLayout(FlowLayout.CENTER, 0, 
                   size().height-30));

     stabilizeButton=new Button("Stabilize");
     stopButton=new Button("Stop");

     stabilizeButton.disable();
     stopButton.disable();

     fixSet=new Choice();
     fixSet.addItem("Set");
     fixSet.addItem("Fix");

     randomProb=new Choice();
     randomProb.addItem("1/2");
     randomProb.addItem("1/3");
     randomProb.addItem("1/4");
     randomProb.addItem("1/5");
     randomProb.addItem("1/6");
     randomProb.addItem("1/7");
     randomProb.addItem("1/8");
     randomProb.addItem("1/9");
     randomProb.addItem("1/10");
     randomProb.addItem("1/20");
     randomProb.addItem("1/50");
     randomProb.addItem("1/100");

     randomProb.select("1/3");

     add(new Button("Clear"));
     add(new Button("Randomize"));
     add(stabilizeButton);
     add(stopButton);
     add(fixSet);
//     add(new Label("(Instructions Below)")); 
     add(randomProb);
     add(new Button("Help"));

     int scale=24;

     board=new CellBoard((size().height-30)/scale, 
                          size().width/scale, scale);

     rgen=new Random();

     fixing=false;
     setFixed=false;
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

  public void run() {

      while (killme != null) {
         try {Thread.sleep(5);} catch
                         (InterruptedException e) {}
         repaint();         
      }
      killme=null;
  }


  public void update(Graphics g) {

     if (fixing) {        
        fixing=board.stabilize(g,rgen);
     }

     if (!fixing && !board.isStable()) {
         if (!stabilizeButton.isEnabled()) {
              stabilizeButton.enable();
         } 
     } else {
         if (stabilizeButton.isEnabled()) {
              stabilizeButton.disable();
         }
     }

     if (fixing) {
         if (!stopButton.isEnabled()) {
           stopButton.enable();
         }
     } else {
         if (stopButton.isEnabled()) {
           stopButton.disable();
         }
     }

  }


  public boolean mouseDown(Event ev, int x, int y) {

      if (!setFixed) {
          board.userToggle(x,y,getGraphics());
      } else {
         board.fixedFree(x,y,getGraphics());
      }

      return true;
  }

  public boolean action(Event ev, Object arg) {
    boolean acted=true;

      String label=(String)arg;

      if (ev.target instanceof Button) {
         if (label.equals("Clear")) {
            board.clear(getGraphics());
         } else if (label.equals("Randomize")) {
            board.randomize(getGraphics(),rgen);
         } else if (label.equals("Stabilize")) {
             fixing=true;
         } else if (label.equals("Stop")) {
             fixing=false;
         } else if (label.equals("Help")) {
             URL u=null;
             try {u=new URL(getDocumentBase(),"#moreinfo");} 
                catch (MalformedURLException e) {}
             getAppletContext().showDocument(u);
         } else acted=false;
      } else if (ev.target instanceof Choice) {
         if (label.equals("Fix")) {
             setFixed=true;
         } else if (label.equals("Set")) {
             setFixed=false;
         } else if (label.equals("1/2")) {
             board.setRandMove(2);
         } else if (label.equals("1/3")) {
             board.setRandMove(3);
         } else if (label.equals("1/4")) {
             board.setRandMove(4);
         } else if (label.equals("1/5")) {
             board.setRandMove(5);
         } else if (label.equals("1/6")) {
             board.setRandMove(6);
         } else if (label.equals("1/7")) {
             board.setRandMove(7);
         } else if (label.equals("1/8")) {
             board.setRandMove(8);
         } else if (label.equals("1/9")) {
             board.setRandMove(9);
         } else if (label.equals("1/10")) {
             board.setRandMove(10);
         } else if (label.equals("1/20")) {
             board.setRandMove(20);
         } else if (label.equals("1/50")) {
             board.setRandMove(50);
         } else if (label.equals("1/100")) {
             board.setRandMove(100);
         } else acted=false;
      } else acted=false;

      return acted;
  }


  public void paint(Graphics g) {

      board.paintBoard(g);

  }

}

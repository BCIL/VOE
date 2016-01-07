<div style="text-align:center"><img src ="http://54.164.172.154/paper/BioITCore_Logo_XL.png?raw=true" width=200 height=200/></div> <br />
 
Visual Omics Explorer (VOE)
==================
- The Visual Omics Explorer consist of five visualizations: <br />
1) Google Genomics Cloud 2) PhyloXML trees 3) ChIP-Seq data 4) RNA-Seq data 5) Genetic Variant data
 
Google Genomics Cloud
---------------
- Allows browsing sequence read alignments to the reference human genome from humans genomes projects hosted on Google Genomics.
 
PhyloXML trees
----------------
- Provides Radial, Sunburst and Indented Tree visualizations of PhyloXML data.
 
ChIP-Seq data visualization
---------------------------
- Visualizes the amount of molecular interaction sites predicted by ChIP-Seq data in *.bed file format.
 
Genetic Variant data visualization
--------------------------------------
- Visualizes the  amount of genetic variantes predicted in Genetic Variant data in *.vcf file format.
 
RNA-Seq data visualization
--------------------------
- Displays visualizations in circular chart and line graph of gene expression data in *.tsv, *.diff, and *.tabular file formats.

<br />
VOE Android App
--------------------------
- VOE is packaged as a touch enabled, mobile app for the Android system.
- To install the app on your Android device you'll need to allow installation of applications from Unknown sources on your device. To enable this feature, on your Android device: Tap Home > Tap Menu> Tap Settings > Tap Applications > Tap Unknown sources checkbox to allow install apps from Unknown sources.
- On any internet browser on your Android device type the link: http://tinyurl.com/voe-apk in the address bar and download with the Android package installer.
 
</hr />
 
### - How to run Visual Omics Explorer - ###
 
To clone VOE from GitHub
------------------------
```bash
$ git clone https://github.com/BCIL/VOE.git
$ cd VOE
```
 
Setting up local host environment via command line:
--------------------------------
```bash
$ python -m SimpleHTTPServer 9090
```
On any internet browser, type "127.0.0.1:9090" in the address bar.
 
Setting up local host environment via graphical user interface:
-------------------------------- 
Download  and install a desktop web server application Fenix Web servers from: http://fenixwebserver.com/.  After installation, to start up a web server, on the top left menu  of the Fenix application, click on Web Servers>New. Enter the directory path of the VOE master zip file  which can be cloned from GitHub on the command line (mentioned earlier above) or downloaded from: https://github.com/BCIL/VOE/archive/master.zip and port 9090.
 
On any internet browser, type "127.0.0.1:9090" in the address bar.

<br />
[Visual Omics Explorer (VOE)](http://bcil.github.io/VOE/). <br />
Last updated on January 7, 2016
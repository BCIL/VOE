<div style="text-align:center"><img src ="images/BioITCore_Logo_voe.png" width=200 height=200/></div> <br />
 
Visual Omics Explorer (VOE)
==================

- The Visual Omics Explorer consist of five visualizations: 
<br />

<ol>
<li>Google Genomics Cloud</li>
<li>PhyloXML trees</li>
<li>ChIP-Seq data</li>
<li>RNA-Seq data</li>
<li>Genetic Variant data</li>
</ol>
 
Google Genomics Cloud
---------------
- Allows browsing sequence read alignments to the reference human genome from various human genome projects hosted on Google Genomics.
 
PhyloXML trees
----------------
- Provides Radial, Sunburst and Indented Tree visualizations of PhyloXML data.
 
ChIP-Seq data visualization
---------------------------
- Visualizes the amount of molecular interaction sites predicted by ChIP-Seq data in *.bed file format.
 
Genetic Variant data visualization
--------------------------------------
- Visualizes the amount of genetic variants predicted in Genetic Variant data in *.vcf file format.
 
RNA-Seq data visualization
--------------------------
- Displays visualizations in circular chart and line graph of gene expression data in *.tsv, *.diff, and *.tabular file formats.
 
VOE Android App
--------------------------
 
- The VOE app can run on Android device’s version 4.4 or newer and requires the device to be permitted to install applications from unknown sources. This feature can be enabled in the device’s settings (A) under Security > Unknown sources.
- To install the app, on any internet browser of an Android device enter the link: http://tinyurl.com/voe-apk in the address bar and select direct download with the Android package installer to download and install.
 
<br /><br />
 
### - How to run Visual Omics Explorer locally- ###
 
A local copy of VOE’s source code will be required and can be downloaded (https://github.com/BCIL/VOE/archive/master.zip) or cloned (http://bcil.github.io/VOE/) from our Github repository.
 
We provide two ways to set up a local web server to access the machine’s local host in order to run VOE:
Setting up a local web server via command line:
--------------------------------
 
On the terminal, in VOE’s directory from which the source code was obtained, enter the command below to start up a built-in HTTP server program in Python:

```bash 
user@bcil:~/VOE# python -m SimpleHTTPServer 9090
```
To run VOE, open up any internet browser and enter “127.0.0.1:9090” in the address bar.
 
Setting up a local web server via graphical user interface:
--------------------------------
 
-Download and install the web server program Fenix Web servers from: http://fenixwebserver.com/. 

-After installation, to start up a Fenix web server, on the top left menu of the program, click on Web Servers>New.

- Enter VOE’s directory path from which the source code was obtained and port 9090

- To run VOE, on any internet browser, enter “127.0.0.1:9090” in the address bar.

<br />
[Visual Omics Explorer (VOE)](http://bcil.github.io/VOE/). <br />
Last updated on January 11, 2016

<div style="text-align:center"><img src ="https://github.com/BCIL/PhyloD3/blob/master/Archive/BioITCore_logo/BioITCore_Logo_XL.png?raw=true" width=200 height=200/></div> <br />

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

<br /><br />

### - How to run Visual Omics Explorer - ###

To clone VOE from GitHub
------------------------
```bash
$ git clone https://github.com/BCIL/VOE.git
$ cd VOE
```

Setting up localhost environment
--------------------------------
```bash
$ python -m SimpleHTTPServer 9090
```
On any internet browser, type ["127.0.0.1:9090"](http://127.0.0.1:9090) in the address bar.

<br />
[Visual Omics Explorer (VOE)](http://bcil.github.io/VOE/). <br />
Last updated on January 6, 2016
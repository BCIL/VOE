<div style="text-align:center"><img src ="https://github.com/BCIL/PhyloD3/blob/master/Archive/BioITCore_logo/BioITCore_Logo_XL.png?raw=true" width=200 height=200/></div> <br />

Visual Omics Explorer (VOE)
==================
- The Visual Omics Explorer composed by five visualizations <br />
(Google Genomics Cloud, PhyloXML trees, ChIP-Seq data, RNA-Seq data, and Variant Call Format data)

Google Genomics browser
---------------
- Powered by Google Genomics API and pViz.js visualization.
- The data is pulled from Google Genomics database.

PhyloXML trees
----------------
- The dedicate python server allows the user to upload own phyloXML file.
- Three different visualizations, Radial tree, Indented tree, and Sunburst

ChIP-Seq data visualization
---------------------------
- The tool uses *.bed file to generate visualization.

Variant Call Format data visualization
--------------------------------------
- The tool allows *.vcf file as input.

RNA-Seq data visualizations
--------------------------
- Two different visualizations (line chart, donut + fucus chart).
- *.tsv, *.diff, and *.tabular file types are accepted.



### How to run Visual Omics Explorer ###

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
Then, type ["127.0.0.1:9090"](http://127.0.0.1:9090) in the address bar of your interner browser.

[Visual Omics Explorer (VOE)](http://bcil.github.io/VOE/). <br>
Last updated on January 5, 2016

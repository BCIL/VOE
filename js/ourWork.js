
//// template pages
	$('#phyloXML_link').attr('href','phyloXML.html');
	$('#googleGenomics_link').attr('href','GoogleGenomics.html')
	$('#geneExpression_link').attr('href','DifferentialExpression.html')
	$('#RNA-Seq_link').attr('href','RNA-Sequencing.html')
	$('#ChIP-Seq_link').attr('href','ChIP-Seq.html')
	$('#vcf_link').attr('href','GeneticVariant.html')

//// iframe pages

// phyloXML
	$('#phyloXML_main').attr('src','http://bit.do/phyloxml_main');

// Google Genomics
	$('.googlegenomics_main').attr('src','visualizations/GoogleGenomics/GoogleGenomics_main.html');

// Gene Expression
	$('.cuffdiff_main').attr('src','visualizations/RNA-Seq/CuffDiff_viz/cuffdiff.html');

// RNA-Sequencing
	$('.rnaseq_main').attr('src', 'visualizations/RNA-Seq/RNASeq_viz/RNASeq_viz.html')

// ChIP-Seq
	$('.chipseq_main').attr('src', 'visualizations/ChIP-Seq/Bedfile_viz.html')

// Genetinc variant
	$('.vcf_main').attr('src', 'visualizations/vcf_file_viz/vcf_file_viz.html')


#!/usr/bin/env python

import os.path
import os
import posixpath
import BaseHTTPServer
import urllib
import cgi
import shutil
import mimetypes
import re
try:
    from cStringIO import StringIO
except ImportError:
    from StringIO import StringIO


class SimpleHTTPRequestHandler(BaseHTTPServer.BaseHTTPRequestHandler):

    upFile = '';
    def do_GET(self):
        """Serve a GET request."""
        f = self.send_head()

        s = StringIO()
        s.write('<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 3.2 Final//EN">')
        s.write("<html>\n<title> Get method result page </title>\n<head>\n</head>\n<body>\n<h2>Get method!</h2>\n</body>\n</html>")

        if f:
            s.write("<span><h4> Upload status: <text style='color:blue'><b>Success!</b></text></h4></span>\n");
            self.copyfile(f, self.wfile)
            f.close();

        else:
            s.write("<span><h4> Upload status: <text style='color:red'><b>Failed!</b></text></h4></span>\n");  

    def do_HEAD(self):
        """Serve a HEAD request."""
        f = self.send_head()
        if f:
            f.close()

    def do_POST(self):
        """Serve a POST request."""
        r, info = self.deal_post_data()
        print r, info, "by: ", self.client_address
        f = StringIO()
        f.write("<html>\n<title>Upload Result Page</title>\n")
        f.write('<head> <script type="text/javascript" src="js/jkl-dumper.js" charset="Shift_JIS"></script>');
        f.write('\n<script type="text/javascript" src="js/parser.js"></script>\n<script type="text/javascript" src="js/jkl-parsexml.js"></script>\n<script type="text/javascript" src="js/loadxmldoc.js"></script> \n<script type="text/javascript" src="js/expandCollapse.js"></script>\n<script type="text/javascript" src="js/jquery.js"></script>\n<link href="bs3/css/bootstrap.min.css" rel="stylesheet">\n<link href="css/bootstrap-reset.css" rel="stylesheet">\n<link href="font-awesome/css/font-awesome.css" rel="stylesheet">\n<link rel="stylesheet" href="js/file-uploader/css/jquery.fileupload.css">\n<link rel="stylesheet" href="js/file-uploader/css/jquery.fileupload-ui.css">');
        f.write('<style>\nbody {\nfont-family: sans-serif;\npadding-left: 2em;\npadding-top: 1em;}\ntr.spaceUnder > td {\npadding-bottom: 1em;}\n#usage h2{margin-bottom: 0px;}\n</style>'); 
        f.write('</head>');
        f.write("<body>\n<h2>Upload Result Page</h2>\n")
        f.write("<hr>\n")
        if r:
            # modify XML
            os.system("python modifyXML.py uploaded/"+upFile);
            
            # upload success
            f.write("<span><h4> Upload status: <text style='color:blue'><b>Success!</b></text></h4></span>\n");
            f.write("<br><h4> Upload file: <text id='upFile_name'>" + upFile + "</text></h4>\n");
            f.write("<br><a href=\"%s\" style='color:blue'> Go back to the previous page</a>\n" % self.headers['referer'])
            
            # visualization buttons
            f.write('<div class="gen_viz">\n<h2 class="lead"> Visualization </h2>\n<button type="submit" id="gen_Radial" class="btn btn-primary start">Generate Radial Tree</button>\n<button type="submit" id="gen_Indented" class="btn btn-primary start">Generate Indented Tree</button>\n<button type="submit" id="gen_Sunburst" class="btn btn-primary start">Generate Sunburst</button>\n</div>')
            f.write("<script>var fn = document.getElementById('upFile_name').innerHTML\n");
            f.write("window.fin = fn\n");
            f.write("var d = parser(fin)\n")
            
            # open visualization selection page
            f.write('$(function () {$("#gen_Radial").bind("click", function () {window.parsed = p_d;window.open("RadialTree.html", "");});});')
            f.write('$(function () {$("#gen_Indented").bind("click", function () {window.parsed = p_d;window.open("IndentedTree.html", "");});});')
            f.write('$(function () {$("#gen_Sunburst").bind("click", function () {window.parsed = p_d;window.open("Sunburst.html", "");});});')
            f.write("</script>\n")
            f.write("</body>\n</html>\n")

        else:
            f.write("<span><h4> Upload status: <text style='color:red'><b>Failed!</b></text></h4></span>\n");            
            f.write(info)
            f.write("<br><a href=\"%s\">back</a>" % self.headers['referer'])
            f.write("</body>\n</html>\n")  
        length = f.tell()
        f.seek(0)
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Content-Length", str(length))
        self.end_headers()
        if f:
            self.copyfile(f, self.wfile)
            f.close()
        
    def deal_post_data(self):
        boundary = self.headers.plisttext.split("=")[1]
        remainbytes = int(self.headers['content-length'])
        line = self.rfile.readline()
        remainbytes -= len(line)
        if not boundary in line:
            return (False, "Content NOT begin with boundary")
        line = self.rfile.readline()
        remainbytes -= len(line)
        fn = re.findall(r'Content-Disposition.*name="file"; filename="(.*)"', line)
        if not fn:
            return (False, "Can't find out file name...")
        path = self.translate_path(self.path)
        fn = os.path.join(path, 'uploaded/'+fn[0])
        fin_ext = os.path.splitext(fn)[1]
        fin_getname = os.path.splitext(fn)[0].split('/');
        idx = len(fin_getname)-1;
        global upFile
        upFile = fin_getname[idx] + os.path.splitext(fn)[1]
        if fin_ext != '.xml':
            return (False, "\t The uploaded file extension ( " + fin_ext + " ) is not suported. \n Please upload an xml type of file.");

        line = self.rfile.readline()
        remainbytes -= len(line)
        line = self.rfile.readline()
        remainbytes -= len(line)
        try:
            out = open(fn, 'wb')
        except IOError:
            return (False, "Can't create file to write, do you have permission to write?")
                
        preline = self.rfile.readline()
        remainbytes -= len(preline)
        while remainbytes > 0:
            line = self.rfile.readline()
            remainbytes -= len(line)
            if boundary in line:
                preline = preline[0:-1]
                if preline.endswith('\r'):
                    preline = preline[0:-1]
                out.write(preline)
                out.close()
                return (True, "File '%s' upload success!" % fn)
            else:
                out.write(preline)
                preline = line
        return (False, "Unexpect Ends of data.")

    def send_head(self):
        
        path = self.translate_path(self.path)
        f = None

        if os.path.isdir(path):
            if not self.path.endswith('/'):
                # redirect browser - doing basically what apache does
                self.send_response(301)
                self.send_header("Location", self.path + "/")
                self.end_headers()
                return None
            for index in "index.html", "index.htm":
                index = os.path.join(path, index)
                if os.path.exists(index):
                    path = index
                    break
            else:
                return self.list_directory(path)
        ctype = self.guess_type(path)
        try:
            # Always read in binary mode. Opening files in text mode may cause
            # newline translations, making the actual size of the content
            # transmitted *less* than the content-length!
            f = open(path, 'rb')
        except IOError:
            self.send_error(404, "File not found")
            return None
        self.send_response(200)
        self.send_header("Content-type", ctype)
        fs = os.fstat(f.fileno())
        self.send_header("Content-Length", str(fs[6]))
        self.send_header("Last-Modified", self.date_time_string(fs.st_mtime))
        self.end_headers()
        return f

    def list_directory(self, path):
       
        try:
            list = os.listdir(path)
        except os.error:
            self.send_error(404, "No permission to list directory")
            return None
        list.sort(key=lambda a: a.lower())
        f = StringIO()
        displaypath = cgi.escape(urllib.unquote(self.path))
        length = f.tell()
        f.seek(0)

        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.send_header("Content-Length", str(length))
        self.end_headers()
        return f

    def translate_path(self, path):
        """Translate a /-separated PATH to the local filename syntax.

        Components that mean special things to the local file system
        (e.g. drive or directory names) are ignored.  (XXX They should
        probably be diagnosed.)

        """
        # abandon query parameters
        path = path.split('?',1)[0]
        path = path.split('#',1)[0]
        path = posixpath.normpath(urllib.unquote(path))
        words = path.split('/')
        words = filter(None, words)
        path = os.getcwd()
        for word in words:
            drive, word = os.path.splitdrive(word)
            head, word = os.path.split(word)
            if word in (os.curdir, os.pardir): continue
            path = os.path.join(path, word)
        return path

    def copyfile(self, source, outputfile):
        
        shutil.copyfileobj(source, outputfile)

    def guess_type(self, path):
        
        base, ext = posixpath.splitext(path)
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        ext = ext.lower()
        if ext in self.extensions_map:
            return self.extensions_map[ext]
        else:
            return self.extensions_map['']

    if not mimetypes.inited:
        mimetypes.init() # try to read system mime.types
    extensions_map = mimetypes.types_map.copy()
    extensions_map.update({
        '': 'application/octet-stream', # Default
        '.py': 'text/plain',
        '.c': 'text/plain',
        '.h': 'text/plain',
        })


def test(HandlerClass = SimpleHTTPRequestHandler,
         ServerClass = BaseHTTPServer.HTTPServer):
    BaseHTTPServer.test(HandlerClass, ServerClass)

if __name__ == '__main__':
    test()
var sys = require("sys"),
    http = require("http"),
    fs = require("fs"),
    path = require("path");


var sfad = function(basepath){
  var self = this, reqpath;
  this.basepath = basepath;
  
  this.httpd = http.createServer(function(req, res){
    reqpath = path.join(basepath, req.url);
    fs.stat(reqpath, function(error, stats){
      if(error){
        self.doError(res, error.message);
      } else if(stats.isDirectory()) {
        self.streamDirectory(req.url, reqpath, res);
      } else if(stats.isFile()){
        self.streamFile(reqpath, stats, res);
      } else {
        sfad.doError(res, "we're not sure how to serve this up.");
      }
    });
  });
};

sfad.prototype.start = function(port, host){
  try {
    this.httpd.listen(port||8180, host||"127.0.0.1");
    sys.puts("Now spewing the sfda of "+this.basepath+" on http://"+(host||"127.0.0.1")+":"+(port||80));
  } catch(e){
    sys.puts("Could not bind() to address: "+(host||"127.0.0.1")+":"+(port||8180));
  }
};

sfad.prototype.doError = function(res, message){
  res.sendHeader(404, {'Content-Type': 'text/plain'});
  res.write(message);
  res.close();
};

sfad.prototype.streamDirectory = function(curpath, dirpath, res){
  var self = this;
  fs.readdir(dirpath, function(error, items){
    if(error){
      self.doError(res, error.message);
    } else {
      res.sendHeader(404, {'Content-Type': 'text/html'});
      res.write("<h1>Contents:</h1>");
      res.write("<ul>");
      items.forEach(function(item){
        if(item == ".DS_Store" || item.substr(0, 1) == ".") return;
        res.write('<li><a href="'+path.join('/', curpath, item)+'">'+item+'</a></li>');
      });
      res.write("</ul>");
      res.close();
    }
  });
};

sfad.prototype.streamFile = function(filepath, stat, res) {
  var self = this;
  var encoding = "binary",
      extension = path.extname(filepath).substr(1);
  
  if(self.contentTypes[extension]){
    contentType = self.contentTypes[extension];
    sys.puts("found contenttype.");
  } else {
    contentType = "text/plain";
  }
  
  res.sendHeader(200, {
    'Content-Type': contentType,
    'Content-Length': stat.size,
  });
  
  fs.open(filepath, process.O_RDONLY, 0666, function(error, fd){
    if(error){
      self.doError(res, error.message);
    } else {
      var pos = 0;
      
      (function(){
        fs.read(fd, 16*1024, pos, encoding, function (error, chunk, bytesRead){
          if(error){
            self.doError(res, error.message);
          } else {
            if (!chunk) {
              fs.close(fd);
              res.close();
              return;
            }
            
            res.write(chunk, encoding);
            pos += bytesRead;
            arguments.callee();
          }
        });
      })();
    }
  });
};

sfad.prototype.contentTypes = {
  "aiff":"audio/x-aiff",
  "arj":"application/x-arj-compressed",
  "asf":"video/x-ms-asf",
  "asx":"video/x-ms-asx",
  "au":"audio/ulaw",
  "avi":"video/x-msvideo",
  "bcpio":"application/x-bcpio",
  "ccad":"application/clariscad",
  "cod":"application/vnd.rim.cod",
  "com":"application/x-msdos-program",
  "cpio":"application/x-cpio",
  "cpt":"application/mac-compactpro",
  "csh":"application/x-csh",
  "css":"text/css",
  "deb":"application/x-debian-package",
  "dl":"video/dl",
  "doc":"application/msword",
  "drw":"application/drafting",
  "dvi":"application/x-dvi",
  "dwg":"application/acad",
  "dxf":"application/dxf",
  "dxr":"application/x-director",
  "etx":"text/x-setext",
  "ez":"application/andrew-inset",
  "fli":"video/x-fli",
  "flv":"video/x-flv",
  "gif":"image/gif",
  "gl":"video/gl",
  "gtar":"application/x-gtar",
  "gz":"application/x-gzip",
  "hdf":"application/x-hdf",
  "hqx":"application/mac-binhex40",
  "html":"text/html",
  "ice":"x-conference/x-cooltalk",
  "ief":"image/ief",
  "igs":"model/iges",
  "ips":"application/x-ipscript",
  "ipx":"application/x-ipix",
  "jad":"text/vnd.sun.j2me.app-descriptor",
  "jar":"application/java-archive",
  "jpeg":"image/jpeg",
  "jpg":"image/jpeg",
  "js":"text/javascript",
  "json":"application/json",
  "latex":"application/x-latex",
  "lsp":"application/x-lisp",
  "lzh":"application/octet-stream",
  "m":"text/plain",
  "m3u":"audio/x-mpegurl",
  "man":"application/x-troff-man",
  "me":"application/x-troff-me",
  "midi":"audio/midi",
  "mif":"application/x-mif",
  "mime":"www/mime",
  "movie":"video/x-sgi-movie",
  "mp4":"video/mp4",
  "mpg":"video/mpeg",
  "mpga":"audio/mpeg",
  "ms":"application/x-troff-ms",
  "nc":"application/x-netcdf",
  "oda":"application/oda",
  "ogm":"application/ogg",
  "pbm":"image/x-portable-bitmap",
  "pdf":"application/pdf",
  "pgm":"image/x-portable-graymap",
  "pgn":"application/x-chess-pgn",
  "pgp":"application/pgp",
  "php":"text/php",
  "pm":"application/x-perl",
  "png":"image/png",
  "pnm":"image/x-portable-anymap",
  "ppm":"image/x-portable-pixmap",
  "ppz":"application/vnd.ms-powerpoint",
  "pre":"application/x-freelance",
  "prt":"application/pro_eng",
  "ps":"application/postscript",
  "qt":"video/quicktime",
  "ra":"audio/x-realaudio",
  "rar":"application/x-rar-compressed",
  "ras":"image/x-cmu-raster",
  "rgb":"image/x-rgb",
  "rm":"audio/x-pn-realaudio",
  "rpm":"audio/x-pn-realaudio-plugin",
  "rtf":"text/rtf",
  "rtx":"text/richtext",
  "scm":"application/x-lotusscreencam",
  "set":"application/set",
  "sgml":"text/sgml",
  "sh":"application/x-sh",
  "shar":"application/x-shar",
  "silo":"model/mesh",
  "sit":"application/x-stuffit",
  "skt":"application/x-koan",
  "smil":"application/smil",
  "snd":"audio/basic",
  "sol":"application/solids",
  "spl":"application/x-futuresplash",
  "src":"application/x-wais-source",
  "stl":"application/SLA",
  "stp":"application/STEP",
  "sv4cpio":"application/x-sv4cpio",
  "sv4crc":"application/x-sv4crc",
  "swf":"application/x-shockwave-flash",
  "tar":"application/x-tar",
  "tcl":"application/x-tcl",
  "tex":"application/x-tex",
  "texinfo":"application/x-texinfo",
  "tgz":"application/x-tar-gz",
  "tiff":"image/tiff",
  "tr":"application/x-troff",
  "tsi":"audio/TSP-audio",
  "tsp":"application/dsptype",
  "tsv":"text/tab-separated-values",
  "txt":"text/plain",
  "unv":"application/i-deas",
  "ustar":"application/x-ustar",
  "vcd":"application/x-cdlink",
  "vda":"application/vda",
  "vivo":"video/vnd.vivo",
  "vrm":"x-world/x-vrml",
  "wav":"audio/x-wav",
  "wax":"audio/x-ms-wax",
  "wma":"audio/x-ms-wma",
  "wmv":"video/x-ms-wmv",
  "wmx":"video/x-ms-wmx",
  "wrl":"model/vrml",
  "wvx":"video/x-ms-wvx",
  "xbm":"image/x-xbitmap",
  "xlw":"application/vnd.ms-excel",
  "xml":"text/xml",
  "xpm":"image/x-xpixmap",
  "xwd":"image/x-xwindowdump",
  "xyz":"chemical/x-pdb",
  "zip":"application/zip",
};

sfad.prototype.contentCharsets = {
  'text/javascript': 'UTF-8',
  'text/html': 'UTF-8',
};

(function(){
  var args = process.argv, argc = 0;
  var port = 8180;
  var dir = path.normalize(process.cwd());
  
  args.forEach(function(arg){
    if(arg == "-help" || arg == "--help" || arg == "-h"){
      sys.puts("Usage: node-sfad [-p=8180] path");
      process.exit();
    } else if(arg.substr(0, 3) == "-p="){
      port = parseInt(arg.substr(3), 10);
    } else {
      if(arg.substr(0, 1) == "/"){
        dir = path.normalize(arg);
      } else if(arg.substr(0, 2) == "..") {
        dir = path.join(process.cwd(), path.normalize(arg));
      } else {
        dir = path.join(process.cwd(), path.normalize(arg));
      }
    }
  });
  
  new sfad(dir).start(port);
})();
var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring')

var root = __dirname;
var words=[];
var defination=[];
var server = http.createServer(function(req,res){
  var url = parse(req.url);
  var path = join(root,url.pathname);
  if(url.pathname=="/"){
    path=join(path,"index.html");
    console.log(req.method);
    switch (req.method) {
      case "GET":
        console.log("show");
        showPage(req,res,path);
        break;
      case "POST":
        var body='';
        req.setEncoding('utf-8');
        req.on('data',function(chunk){
          body+=chunk;
        })
        req.on('end',function(){
          var parse_Str = qs.parse(body);
          words.push(parse_Str.eng);
          defination.push(parse_Str.def);
        })
        showPage(req,res,path);
        break;
      case "DELETE":
        console.log("delete");
        break;
      default:
        res.writeHead(500,{"Content-Type":"text/plain"});c
        res.write("Internal Server Error !");
        res.end("");
        console.log("default");
        break;
    }
  }
});
function showPage(req,res,path){
  var stream = fs.createReadStream(path);
  stream.on('data',function(chunk){
    req.setEncoding('utf-8');
    body = String(chunk).split('</thead>');
    item_html='';
    for(var i=0;i<words.length;i++){
      item_html+='<tr>\n'+
        '<td>'+words[i]+'</td>\n'+
        '<td>'+defination[i]+'</td>\n'+
        '<td>'+''+'</td>\n'+
        '</tr>\n'
    }
    full_html=body[0]+'</thead>\n'+item_html+body[1];
    res.writeHead(200,{"Content-Type":"text/html"});
    res.write(full_html);
  })
  stream.on('end',function(){
    res.end();
  })
  stream.on('error',function(){
    res.writeHead(500,{"Content-Type":"text/plain"})
    res.write("Internal Server Error !")
    res.end("")
  })
}
server.listen(5000);

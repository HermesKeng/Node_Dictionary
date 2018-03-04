var http = require('http');
var parse = require('url').parse;
var join = require('path').join;
var fs = require('fs');
var qs = require('querystring');
var mysql = require('mysql');

var root = __dirname;
var words=[];
var defination=[];

var db = mysql.createConnection({
  host:'127.0.0.1',
  user:'hermes',
  password:'12345678',
  database:'Dictionary'
});
function edit_data_DB(edit_data){
  db.query("Update wordsheet Set definition=?,picture_link=? Where word=?",[edit_data.edit_def,edit_data.edit_link,edit_data.edit_word],function(err){
    if(err){
      throw err;
    }
  })
}
function add_data_DB(parse_Str){
  db.query("Insert into wordsheet (word,definition,picture_link)"+
  "Values(?,?,?)"
  ,[parse_Str.eng,parse_Str.def,parse_Str.picture_link]
  ,function(err){
    if(err){
      throw err;
    }else {
      console.log("Add new raw data(" +parse_Str.eng,parse_Str.def,parse_Str.picture_link,")");
    }
  });
}
function delete_data_DB(word){
  console.log(word);
  db.query("DELETE from wordsheet where word=?",[word],function(err){
    if(err){
      throw err;
    }
  })
}
function bad_request(res){
  res.writeHead(500,{"Content-Type":"text/plain"});
  res.write("Internal Server Error !");
  res.end("");
}
function add_data(req,res,path){
  var body='';
  req.setEncoding('utf-8');
  req.on('data',function(chunk){
    body+=chunk;
    var parse_Str = qs.parse(body);
    add_data_DB(parse_Str);
    showPage(req,res,path);
  })
}
function delete_data(req,res,path){
  var body="";
  req.setEncoding('utf-8');
  req.on('data',function(chunk){
    body+=chunk;
    var parse_Str = qs.parse(body);
    console.log(parse_Str);
    delete_data_DB(parse_Str.word);
    showPage(req,res,path);
  })
}
function edit_data(req,res,path){
  var body="";
  req.setEncoding('utf-8');
  req.on('data',function(chunk){
    body+=chunk;
    var parse_Str = qs.parse(body);
    console.log(parse_Str);
    edit_data_DB(parse_Str);
    showPage(req,res,path);
  })
}
function create_html(body,db_data){
  var item_html='';
  for(var i in db_data){
    item_html+='<tr>\n'+
      '<td>'+db_data[i].word+'</td>\n'+
      '<td>'+db_data[i].definition+'</td>\n'+
      '<td>'+db_data[i].picture_link+'</td>\n'+
      '</tr>\n'
  }
  var full_html=body[0]+'</thead>\n'+item_html+body[1];
  return full_html;
}
function send_html(html,res){
  res.writeHead(200,{"Content-Type":"text/html"});
  res.write(html);
  res.end();
}
var server = http.createServer(function(req,res){
  var url = parse(req.url);
  var path = join(root,url.pathname);
  if(url.pathname=="/"){
    path=join(path,"index.html");
    console.log(req.method);
    switch (req.method) {
      case "GET":
        showPage(req,res,path);
        break;
      case "POST":
        add_data(req,res,path);
        break;
      case "DELETE":
        delete_data(req,res,path);
        break;
      default:
        bad_request(res);
        console.log("default");
        break;
    }
  }else if(url.pathname=="/update"){
    var path = join(root,"index.html");
    switch (req.method) {
      case "POST":
        edit_data(req,res,path);
        break;
      default:
        bad_request(res);
        console.log("default");
        break;
    }
  }
});
function showPage(req,res,path){

  var stream = fs.createReadStream(path);

  stream.on('data',function(chunk){
    req.setEncoding('utf-8');
    db.query("Select * from wordsheet",function(err,db_data){
      if(err){
        throw err;
      }else{
        body = String(chunk).split('</thead>');
        full_html=create_html(body,db_data);
        send_html(full_html,res);
      }
    });

  })

  stream.on('error',function(){
    res.writeHead(500,{"Content-Type":"text/plain"})
    res.write("Internal Server Error !")
    res.end("")
  })
}
db.query('CREATE TABLE IF NOT EXISTS wordsheet('+
'id INT(10) NOT NULL AUTO_INCREMENT,'+
'word varchar(255),'+
'defination TEXT,'+
'picture_link LONGTEXT,'+
'PRIMARY KEY(id)'+
');',function(err){
  if(err){
    throw err;
  }else{
    console.log("server started");
    server.listen(5000,'127.0.0.1');
  }
})

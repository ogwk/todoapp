'use strict';

var express = require('express'),
    app = express();
//セッション
var session = require('express-session');
//ビュー
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({
    secret:"secret word", //クッキーを保存するセッションIDを署名するために使用される秘密ワード
    resave:false,//セッションをセッションストアに強制的に保存するかどうか
    saveUninitialized:false,//初期化されていないセッションを強制的に保存するかどうか
    cookie: {
        maxAge:60*1000//クッキーの保存期間
    }
}));

//middleware
app.get('/', function(req, res){
    var session = req.session;
    if (!!session.visitCount) {
        session.visitCount += 1;
    } else {
        session.visitCount = 1;
    }
    res.render('index',{visitCount:session.visitCount
    });
})

app.listen(8000);
console.log("server starting...");

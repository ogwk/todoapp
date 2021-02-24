'use strict';

var express = require('express'),
    app = express();
//クッキー
var cookieParser = require('cookie-parser');
//セッション
var session = require('express-session');
//ビュー
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
//ログイン機能
var passport = require('passport');
var bodyParser = require('body-parser');
//データベース
const Post = require('./models/user');
const flash = require('connect-flash');

app.use(flash());

app.use(session({
    secret:"secret word", //クッキーを保存するセッションIDを署名するために使用される秘密ワード
    resave:false,//セッションをセッションストアに強制的に保存するかどうか
    saveUninitialized:false,//初期化されていないセッションを強制的に保存するかどうか
    cookie: {
        maxAge:60*1000//クッキーの保存期間
    }
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));

//DB接続
var {Client} = require('pg'); 


var LocalStrategy = require('passport-local').Strategy;

//ログインチェック
passport.use(new LocalStrategy(function(username, password, done)
{
    //ここを通らない
    console.log(username);　
    console.log(password);
    if (username === "test" && password === "test") {
        return done(null, username)
      } else {
        console.log("login error")
        return done(null, false, { message: 'パスワードが正しくありません。' })
      }
    })
);
/*
    {
        
        console.log("test");
        User.findOne({ where: { username: [username] } },function(err, user)
        { //
            if (err)
            { 
                 return done(err);
            }
            if (!user) {
                console.log("test2");
                return done(null, false, { message: 'ユーザーIDが正しくありません。' });
            }
            if (!user.validPassword(password)) {
                console.log("test3");
                return done(null, false, { message: 'パスワードが正しくありません。' });
            }
            console.log("test4");
            return done(null, user);
        });
    }
*/
/*
{
    var client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'users',
        password:'postgres',
        port:8000
    });
    const query = 'select * from users where users.name =' + username;
    client.query(query, function(err, res) {
        console.log(query);
        console.log(res);
        if(err){

        }
        if(res.password === password){

        }else{

        }
    })
}
));
*/
/*
passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
*/
//middleware
/*
app.use(session({
    secret:"secret word", //クッキーを保存するセッションIDを署名するために使用される秘密ワード
    resave:false,//セッションをセッションス)トアに強制的に保存するかどうか
    saveUninitialized:false,//初期化されていないセッションを強制的に保存するかどうか
    cookie: {
        maxAge:60*1000//クッキーの保存期間
    }
}));
*/

app.get('/login',(req, res, next)=>{
    let {login, error} = req.flash();
    res.render('login', {error: error});
});

app.post('/login',(req, res, next)=>{                         /* 横取り開始 */
    req.flash('login', req.body.name);         /* ID を 'login' に保存 */
    if (! req.body.name) {                     /* ID未入力の場合 */
        req.flash('error', 'Usernameが未入力');
        res.redirect('/login');                 /* 認証処理は呼ばない */
    }
    else if (! req.body.password) {               /* ID未入力の場合 */
        req.flash('error', 'Passwordが未入力');
        res.redirect('/login');                 /* 認証処理は呼ばない */
    }
    else {
        
        next();
        }                      /* フォームに入力があれば認証処理を呼ぶ */
    },
    passport.authenticate('local',{
        
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash:    true
    })
);

app.get('/', function(req, res){
    var session = req.session;
    if (!!session.visitCount) {
        session.visitCount += 1;
    } else {
        session.visitCount = 1;
    }
    res.render('index',{visitCount:session.visitCount
    });

    /*res.cookie('name1','value1', {
        maxAge:60000,
        httpOnly:false,
        domain:'.wakuwaku.com',
        path:'/cookie',
        secure:true
    })
    */
})






app.listen(8000);
console.log("server starting...");

'use strict';

const express = require('express')
const app = express();
//クッキー
const cookieParser = require('cookie-parser');
//セッション
const session = require('express-session');
//ビュー
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//post
const post = require('./routes/posts');

//ログイン機能
const passport = require('passport');
const bodyParser = require('body-parser');
//データベース
const Post = require('./models/user');
const flash = require('connect-flash');

const LocalStrategy = require('passport-local').Strategy;
const { password } = require('pg/lib/defaults');


//DB接続
//const todolist = require('./db/todolist').todolist
//const user = require('./db/user').user

const { Pool, Client } = require('pg')
const user = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password:'postgres',
    port:5432
});

const todolist = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tododatalist',
    password:'postgres',
    port:5432
});




//ミドルウェア
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

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
app.use(flash());

//認証用ストラテジ
passport.use(new LocalStrategy(function(username, password, done)
{
    console.log('check start')
    const query = 'select * from "users" where users.username = $1';
    const value = [username];
    console.log('connect start')    
    user.connect()    
    .then(() => console.log("Connected successfuly"))
    .then(() => user.query(query,value))
    .then(result => {
        if(result.rows[0].password === password){
            console.log('success');
            return done(null, { username, password});
        }else{
            console.log('bad');
            return done(null, false, { message: 'パスワードが正しくありません。' });
        }})
    .catch((e => console.log(e)))
}));

passport.serializeUser(function(user, done) {
    done(null, user);
    console.log('serialize');
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

//routing
app.get('/login', post.index);
app.post('/login', function(req, res, next){                         
    const username = req.body.username;
    const password = req.body.password;    
    req.flash('login', username);   
    if (! username) {                     /* ID未入力の場合 */
        req.flash('error', 'Usernameが未入力');
        res.redirect('/login');                 /* 認証処理は呼ばない */
    }
    else if (! password) {               /* ID未入力の場合 */
        req.flash('error', 'Passwordが未入力');
        res.redirect('/login');                 /* 認証処理は呼ばない */
    }
    else {
        console.log('return');
        next();
    }},                  /* フォームに入力があれば認証処理を呼ぶ */        
    passport.authenticate('local',{  
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash:    true
    })
);

app.get('/', post.show);
app.post('/', post.add);
app.post('/done',post.done);
app.get('/donelist', post.showdonelist);
app.get('/useradd', post.useradd);
//ログアウト
app.post('/logout', post.logout);

app.listen(8000);
console.log("server starting...");

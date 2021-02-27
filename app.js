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
//ログイン機能
const passport = require('passport');
const bodyParser = require('body-parser');
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

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(passport.initialize());
app.use(passport.session());


//DB接続
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

const LocalStrategy = require('passport-local').Strategy;
const { password } = require('pg/lib/defaults');

//ログインチェック
passport.use(new LocalStrategy(function(username, password, done)
{
    const query = 'select * from "users" where users.username = $1';
    const value = [username];
    user.connect()    
    .then(() => console.log("Connected successfuly"))
    .then(() => user.query(query,value))
    .then(result => {
        if(result.rows[0].password === password){
            console.log('success');
            return done(null, username);
        }else{
            console.log('bad');
            return done(null, false, { message: 'パスワードが正しくありません。' });
        }})
    .catch((e => console.log(e)))
}));

passport.serializeUser(function(username, done) {
    done(null, username);
});
  
passport.deserializeUser(function(username, done) {
    done(null, username);
});

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
    res.render('login');
});

app.post('/login',(req, res, next)=>{                         /* 横取り開始 */
    console.log(req);
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
        
        next();
        }                      /* フォームに入力があれば認証処理を呼ぶ */
    },
    passport.authenticate('local',{  
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash:    true
    })
);

app.get('/：username', function(req, res){
    console.log('call ejs')
    todolist.connect()    
    .then(() => console.log("Connected successfuly"))
    .then(() => todolist.query('select * from "todolist"'))
    .then(results => {
        console.log(results.rows);
        res.render('index',{username:req.prams.username, datas:results});})
    .catch((e => console.log(e)))
});


    /*res.cookie('name1','value1', {
        maxAge:60000,
        httpOnly:false,
        domain:'.wakuwaku.com',
        path:'/cookie',
        secure:true
    })
    */

app.post('/', function(req,res){
    const adddata = req.body.add;
    const query = 'INSERT INTO "todolist"(data, date) VALUES($1, CURRENT_DATE) RETURNING *';
    const value = [adddata];
    todolist.query(query, value)
    .then(result => {
        console.log('new data add');
        res.redirect('/');})
    .catch((e => console.log(e)))
});




app.listen(8000);
console.log("server starting...");

'use strict';
const express = require('express')
const app = express();

//ログイン機能
const passport = require('passport');
const bodyParser = require('body-parser');
//クッキー
const cookieParser = require('cookie-parser');

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

exports.index = function(req, res){ 
    let {login, error} = req.flash();
    if(!error){
        error = '';
    }else{

    }
    res.render('login', {errormessage:error});
}

 /*
    ログイン
 */
exports.login = function(req, res, next){                         

    usercheck(req, res,next);          
    
    passport.authenticate('local',{  
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash:    true
    })
}
 /*
     todoリスト一覧を表示
 */
exports.show = function(req, res){
    if(!req.user){
        var user = {username:"nobody", password:""};
    }else{
        var user = req.user;
    } 
    const query = 'select * from "todolist" where adduser = $1 and flgdone = false';
    const value = [user.username];
 
    todolist.connect()    
    .then(() => todolist.query(query,value))
    .then(results => {
        if(!req.user){
            var user = {username:"nobody", password:""};
        }else{
            var user = req.user
        }
        res.render('index',{user: user, datas:results});})
    .catch((e => console.log(e)))
}

 /*
    完了リスト一覧を表示
 */
exports.showdonelist = function(req, res){
    if(!req.user){
        var user = {username:"nobody", password:""};
    }else{
        var user = req.user;
    } 
    const query = 'select * from "todolist" where adduser = $1 and flgdone = true';
    const value = [user.username];
 
    todolist.connect()    
    .then(() => todolist.query(query,value))
    .then(results => {
        if(!req.user){
            var user = {username:"nobody", password:""};
        }else{
            var user = req.user
        }
        res.render('donelist',{user: user, datas:results});})
    .catch((e => console.log(e)))
}

 /*
    Todoリストを追加
 */
exports.add = function(req, res){
    let username = '';
    if(!req.user){
        username = 'nobody';
    }else{
        username = String(req.user.username);
    } 
    const adddata = String(req.body.add);
    const query = 'insert into "todolist"(data, date, adduser, flgdone) VALUES($1, CURRENT_DATE, $2,false) RETURNING *';
    const value = [adddata, username];
    console.log(value);
    todolist.query(query, value)
    .then(result => res.redirect('/'))
    .catch((e => console.log(e)))
}

 /*
    ユーザー登録画面表示
 */
exports.useradd = function(req, res){
    let {msg} = req.flash();
    if(!msg){const msg = '';}
    res.render('useradd',{msg:msg});
}

 /*
    ユーザー登録
 */
exports.registrate = function(req, res){
   const username = req.body.username;
   const password1 =req.body.password1;
   const password2 =req.body.password2;
   //入力チェック
   if(username === ""){
        req.flash('msg', 'ユーザー名を入力してください');
        res.redirect('/useradd');
   }
   else if(password1 === ""){
        req.flash('msg', 'パスワードを入力してください。');
        res.redirect('/useradd');
    }   
    else if(password2 === ""){
        req.flash('msg', 'パスワード(再入力）を入力してください。');
        res.redirect('/useradd');
     }       
     else if(password1 !== password2){
        req.flash('msg', '再入力されたパスワードが異なります。');
        res.redirect('/useradd');
     }
     else{
        const query = 'insert into "users"(username,password) values($1,$2)';
        const value = [username,password1];
        user.query(query, value)        
        .then(results => {
            req.flash('msg', '登録が完了しました。');
            res.redirect('/useradd');
        })        
        .catch(e => console.log(e))
     }
}


 /*
    選択したtodoリストを完了に変更
 */
exports.done = function(req, res){
    let data = parseInt(req.body.id);
    const query = 'update "todolist" set flgdone = true where id in ($1)'; 
    const value = [data]//[]忘れない
    todolist.query(query,value)
        .then(result => res.redirect('/'))
        .catch(e => console.log(e))
} 


 /*
    全てのtodoリストを表示
 */
exports.alldatashow = function(req, res){
    const query = 'select * from "todolist" order by id asc'; 
    todolist.query(query)
            .then(result => res.render('alldata',{todo:result}))
            .catch(e => console.log(e))
} 

 /*
    全削除
 */
exports.deletealldata = function(req, res){
    const query = 'delete from "todolist"'; 
    todolist.query(query)
            .then(result => res.redirect('/alldata'))
            .catch(e => console.log(e))
} 

 /*
    ログアウト
 */
exports.logout = function(req, res){
    //cookie削除
    res.redirect('/login')
}

 /*
    入力内容チェック関数（未使用）
 */
const usercheck = function(req, res, next){
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
    }                      /* フォームに入力があれば認証処理を呼ぶ */   
}
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

 
exports.login = function(req, res, next){                         

    usercheck(req, res,next);          
    
    passport.authenticate('local',{  
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash:    true
    })
}

exports.show = function(req, res){
    if(!req.user){
        var user = {username:"nobody", password:""};
    }else{
        var user = req.user;
    } 
    const query = 'select * from "todolist" where adduser = $1 and flgdone = false';

    const value = [user.username];
 
    todolist.connect()    
    .then(() => console.log("Connected successfuly"))
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

exports.showdonelist = function(req, res){
    if(!req.user){
        var user = {username:"nobody", password:""};
    }else{
        var user = req.user;
    } 
    const query = 'select * from "todolist" where adduser = $1 and flgdone = true';

    const value = [user.username];
 
    todolist.connect()    
    .then(() => console.log("Connected successfuly"))
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

exports.add = function(req, res){
    if(!req.user){
        const user = {username:"nobody", password:""};
    }else{
        const user = req.user;
    } 
    const adddata = req.body.add;
    const query = 'INSERT INTO "todolist"(data, date, adduser, flgdone) VALUES($1, CURRENT_DATE, $2,false) RETURNING *';
    const value = [adddata, user.username];
    todolist.query(query, value)
    .then(result => {
        console.log('new data add');
        res.redirect('/')})
    .catch((e => console.log(e)))
}

exports.useradd = function(req, res){
    const errmsg = "";
    res.render('useradd',{errmsg:errmsg});
}

exports.done = function(req, res){
    console.log(typeof req.body.datalist);
    const datalists = [];
    for(let ii = 0;ii < req.body.datalist.length;ii++){
        datalists.push(String(req.body.datalist[ii]));
    }
    
    console.log(datalists);
    const query = 'update "todolist" set flgdone = true where id in ($1)'; 
    const value = [datalists.join()];//[]忘れない
    console.log([value]);
    todolist.query(query,value)
            .then(result => res.redirect('/'))
            .catch(e => {console.log(e)
            console.log(query)})
} 

function updatedonelist(req,res,data){
    const query = 'update "todolist" set flgdone = true where id = $1';
    const value = [data];
    todolist.query(query,value)
    .catch(e => console.log(e))
}

    

exports.logout = function(req, res){
    //cookie削除
    res.redirect('/login')
}


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
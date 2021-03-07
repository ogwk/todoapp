'use strict';
const { Pool, Client } = require('pg')

const todolist = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'tododatalist',
    password:'postgres',
    port:5432
});

exports.todolist = todolist;
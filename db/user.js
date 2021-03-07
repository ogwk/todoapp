'use strict';

const { Pool, Client } = require('pg')
const user = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'users',
    password:'postgres',
    port:5432
});
  


exports.user = user;
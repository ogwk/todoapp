/**
 * USAGE:
 * psql -f initial_db.sql -Upostgres 
 */
drop database if exists users;
create database users OWNER=postgres;

\connect users;

drop table if exists users;
create table if not exists users (
    id serial,
    name text,
    password text,
    trackingCookie text,
    primary key(id)
);

insert into users(name, password) values('test', 'test');


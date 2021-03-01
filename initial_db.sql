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
    username text,
    password text,
    trackingCookie text,
    primary key(id)
);

insert into users(name, password) values('test', 'test');

drop database if exists tododatalist;
create database tododatalist OWNER=postgres;

\connect todolist;

drop table if exists todolist;
create table if not exists todolist (
    id serial,
    data text,
    date date,
    adduser text,
    primary key(id)
);

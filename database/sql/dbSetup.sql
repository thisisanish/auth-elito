-- SQL script for setting up Database for Auth Microservice --
-- Create a new database called 'auth' if it does not exist already
CREATE DATABASE IF NOT EXISTS auth;
USE auth;
-- Create a new table called 'info' in schema 'auth';

DROP TABLE IF EXISTS info;
CREATE TABLE info
(
    id INT AUTO_INCREMENT NOT NULL,
    uid VARCHAR(36) NOT NULL UNIQUE, -- primary key column
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(64) NOT NULL,
    lastName VARCHAR (64) NOT NULL,
    _status INT NOT NULL DEFAULT 0,
    _owner INT NOT NULL DEFAULT 1,
    _group INT NOT NULL DEFAULT 1,
    _perms INT NOT NULL DEFAULT 500,
    _groupMemberships INT NOT NULL,
    PRIMARY KEY(uid),
    KEY(id, email)
);


-- Insert rows into table 'info' 
INSERT INTO info
( -- columns to insert data into
 uid, email, firstName, lastName, _groupMemberships
)
VALUES
( -- first row: values for the columns in the list above
'zzzzz', 'root@gmail.com', 'Shekh', 'Administrator', 1   
   
),
( -- second row: values for the columns in the list above
 'a2dfg6578', 'ataul443@gmail.com', 'Shekh', 'Ataul', 4  
),
(
    'asdfghg23', 'ak@gmail.com', 'Manik','Bhai', 4
),
(
    'wertyuytrew', 'pika@gmail.com', 'Shubhra', 'Bai', 4
);



-- Create a new table called 'secret' in schema 'auth'
DROP TABLE IF EXISTS secret;
CREATE TABLE secret
(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
    password VARCHAR(255) NOT NULL,
    _status INT NOT NULL DEFAULT 0,
    _owner INT NOT NULL,
    _group INT NOT NULL,
    _perms INT NOT NULL DEFAULT 500
);

-- Insert rows into table 'secret'
INSERT INTO secret
(
password,_owner,_group,_status
)
VALUES
( -- first row: values for the columns in the list above
'alliswell', 1,4, 0
),
( -- second row: values for the columns in the list above
'alli', 2 ,2, 0
),
( -- second row: values for the columns in the list above
'popopop', 3 ,2, 1
),
( -- second row: values for the columns in the list above
'lklklklk', 4 ,2, 0
);

-- Create a new table called 'action' in schema 'auth'
DROP TABLE IF EXISTS _action;
CREATE TABLE _action
(
    _title VARCHAR(100) NOT NULL PRIMARY KEY,
    _applyObject TINYINT NOT NULL
);

INSERT INTO _action 
(
    _title,_applyObject
)
VALUES
('read',     1),
('write',    1),
('delete',   1),
('activate', 1),
('passwd',   1),
('create',   0);

DROP TABLE IF EXISTS _implementedAction;
CREATE TABLE _implementedAction
(
    _table VARCHAR(100) NOT NULL,
    _action VARCHAR(100) NOT NULL,
    _status INT NOT NULL DEFAULT 0,
    PRIMARY KEY (_table, _action)

);

INSERT INTO _implementedAction
(
    _table,_action,_status
)
VALUES
('info',       'read',     0),
('info',       'write',    0),
('info',       'delete',   0),
('info',       'activate',   2),
('secret',      'read',     0),
('secret',      'write',    0),
('secret',      'delete',   0),
('secret',      'passwd', 0);

DROP TABLE IF EXISTS privilege;
CREATE TABLE privilege(
    role VARCHAR(30) NOT NULL DEFAULT 'other',
    who INT NOT NULL DEFAULT 0,
    action VARCHAR(30) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT '',
    relatedTable VARCHAR(30) NOT NULL DEFAULT '',
    relatedId INT NOT NULL DEFAULT 0,
    PRIMARY KEY (role, who, action, type, relatedTable, relatedId)
);

INSERT INTO privilege
(
    role,who,action,type,relatedTable,relatedId
)
VALUES
('self',  0, 'passwd',   'object', 'secret',  0),
('group', 8, 'create',    'table', 'secret', 0),
('group', 8, 'create',    'table', 'info', 0),
('group', 4, 'activate' ,   'object', 'info', 0);

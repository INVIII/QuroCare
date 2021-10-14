const connection = require('./sqlConnector')

const queries = []

queries.push(
'CREATE TABLE patient(_id varchar(25) NOT NULL, fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, email varchar(50) NOT NULL, phone varchar(20), gender varchar(15), password varchar(255), admitted BIT, PRIMARY KEY(_id));',
'CREATE TABLE doctor (_id varchar(25) NOT NULL , fname varchar(15) NOT NULL, lname varchar(15) NOT NULL, department varchar(15) NOT NULL, phone varchar(20) NOT NULL, password varchar(255) NOT NULL, email varchar(50), fees INT(10), PRIMARY KEY(_id));',
'CREATE TABLE appointment(_id varchar(25) NOT NULL, pat_id varchar(25) NOT NULL, doc_id varchar(25) NOT NULL, Date DATE, pat_s BIT NOT NULL, doc_s BIT NOT NULL, details varchar(255), time varchar(25), address varchar(100), age varchar(25), phone varchar(25), PRIMARY KEY(_id), FOREIGN KEY (pat_id) REFERENCES patient(_id), FOREIGN KEY (doc_id) REFERENCES doctor(_id));',
'CREATE TABLE admin(_id varchar(25) NOT NULL, name varchar(25) NOT NULL, password varchar(255) NOT NULL, PRIMARY KEY (_id));',
'CREATE TABLE prescription(_id varchar(25) NOT NULL, disease varchar(100), pat_id varchar(25) NOT NULL, doc_id varchar(25) NOT NULL, allergies varchar(100), date DATE, feedback varchar(500), PRIMARY KEY(_id), FOREIGN KEY (pat_id) REFERENCES patient(_id), FOREIGN Key (doc_id) REFERENCES doctor(_id));',
'CREATE TABLE room( roomid varchar(25) NOT NULL, occupied BIT, PRIMARY KEY(roomid));',
'CREATE TABLE waiting( _id varchar(25), pat_id varchar(25), doc_id varchar(25), PRIMARY KEY (_id), FOREIGN KEY (pat_id) REFERENCES patient(_id), FOREIGN Key (doc_id) REFERENCES doctor(_id));',
'CREATE TABLE occupies( pat_id varchar(25), roomid varchar(25), PRIMARY KEY(pat_id,roomid), FOREIGN KEY(pat_id) REFERENCES patient(_id), FOREIGN KEY(roomid) REFERENCES room(roomid));'
)



for (const i of queries) {
  connection.query(i, function (err, res) {
    if (err) throw err
    console.log(res)
  })
}

connection.end()

const dotenv = require('dotenv');
const mysql = require('mysql');

// configraration with env. 
dotenv.config();
var dbConnection = mysql.createConnection({
  host: "localhost",  
  user: "onetouch",
  password: "Onetouch.co.id0",
  database: "chatvia" 
}); 

dbConnection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = dbConnection;

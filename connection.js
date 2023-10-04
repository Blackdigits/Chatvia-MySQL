const dotenv = require('dotenv');
const mysql = require('mysql');

// configraration with env. 
dotenv.config();
var dbConnection = mysql.createConnection({
  host: "103.134.152.2",  
  user: "balancia_onetouch",
  password: "Onetouch.co.id0",
  database: "balancia_chatvia" 
}); 

dbConnection.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

module.exports = dbConnection;

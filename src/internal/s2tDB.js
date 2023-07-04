const mysql = require('mysql');

var connection = null;
exports.connect = function () {
  if (connection == null) {
      connection = mysql.createConnection({
        host: "spin2timedb.cyadrtpulaz9.eu-west-1.rds.amazonaws.com",
        user: "admin",
        password: "spin2time",
        database: "spin2timedb",
        multipleStatements: true
      });
      connection.connect(function (err) {
      if (err) { console.log(`Failed to connect to Spin2TimeDB: ${err}`); }
    });
  }
  return connection;
}
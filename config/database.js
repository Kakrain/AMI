
var mysql = require('mysql');
var pool = null;

var init = function() {
	pool = mysql.createPool({
		host : 'localhost',
		port: 3306,
		user : 'root',
		password: 'root',
		database: 'inca'
	});
};

var query = function(statement) {
	pool.getConnection(function(err, connection) {
		if (err) throw err;
		connection.query(statement, function(error, rows, fields) {
			if (error) throw error;
			console.log('Result: ', rows[0]);
		});
	});
}

var validateUser = function(user, password) {
	pool.getConnection(function(err, connection) {
		if (err) throw err;
		connection.query("Select * from users", function(error, rows, fields) {
			if (error) throw error;
			for (i = 0; i < rows.length; i++) {
				console.log(user + " " + password);
				if((rows[i]["username"] === user) &&
					(rows[i]["upassword"] === password)) {
					console.log("User validated");
					return true;
				}
			}
			return false;
		});
	});
}

exports.init = init;
exports.query = query;
exports.validateUser = validateUser;
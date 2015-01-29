
module.exports = function(app) {
	
    app.get('/', function(req, res) {
        res.render('index.html');
    });
	
	app.all('/game/', function(req, res) {
		res.redirect("/game"); 
	});
	
	app.get('/logout', function(req, res) {
        res.redirect('/');
    });
	
};
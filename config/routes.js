
module.exports = function(app, passport) {

    app.get('/', function(req, res) {
        res.render('index.html');
    });

	
    app.get('/login', function(req, res) {
        res.render('login.html', { message: req.flash('loginMessage') });
    });


    app.get('/signup', function(req, res) {
        res.render('signup.html', { message: req.flash('signupMessage') });
    });
	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game',
        failureRedirect : '/signup',
        failureFlash : true
    }));

    app.get('/game', isLoggedIn, function(req, res) {
		res.redirect('/game');
		res.render('index.html',{ user : req.user });
    });

    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

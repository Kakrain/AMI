
module.exports = function(app, passport) {
	
    app.get('/', function(req, res) {
        res.render('index.html');
    });

    app.get('/login', function(req, res) {
		if (req.isAuthenticated())
			res.redirect('/game');
        res.render('login.html', { message: req.flash('loginMessage') });
    });
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/game',
        failureRedirect : '/login',
        failureFlash : true
    }));
	
    app.get('/signup', function(req, res) {
		if (req.isAuthenticated())	
			res.redirect('/game');
        res.render('signup.html', { message: req.flash('signupMessage') });
    });
	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/game',
        failureRedirect : '/signup',
        failureFlash : true
    }));
	
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/game',
		failureRedirect : '/'
	}));
	
	app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect : '/game',
		failureRedirect : '/'
    }));
		
	app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        next();
    res.redirect('/');
}
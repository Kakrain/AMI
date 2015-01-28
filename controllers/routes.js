
module.exports = function(app, passport, express) {
	
    app.get('/', function(req, res) {
        res.render('index.html');
    });

    app.get('/login', function(req, res) {
		if (req.isAuthenticated())
			res.redirect('/code');
        res.render('login.html', { message: req.flash('loginMessage') });
    });
	app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/code',
        failureRedirect : '/login',
        failureFlash : true
    }));
	
    app.get('/signup', function(req, res) {
		console.log("URL: " + req.url);
		if (req.isAuthenticated())	
			res.redirect('/code');
        res.render('signup.html', { message: req.flash('signupMessage') });
    });
	app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/code',
        failureRedirect : '/signup',
        failureFlash : true
    }));
	
	app.get('/auth/facebook', passport.authenticate('facebook', { scope : 'email' }));
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
        successRedirect : '/code',
		failureRedirect : '/'
	}));
	
	app.get('/auth/twitter', passport.authenticate('twitter'));
    app.get('/auth/twitter/callback', passport.authenticate('twitter', {
		successRedirect : '/code',
		failureRedirect : '/'
    }));
	
	app.get('/code', function(req, res) {
		if (req.isAuthenticated()){
			var text = "";
			var code = "0123456789";
			for( var i=0; i < 5; i++ )
				text += code.charAt(Math.floor(Math.random() * code.length));
			var email = req.user.local.email;
			try{
				email = email.substr(0,email.indexOf('@'));
			}catch(err){
				if(req.user.facebook.name){
					email = req.user.facebook.name;
				}else if(req.user.twitter.username){
					email = req.user.twitter.username;
				}
			}
			req.flash('username',email);
			req.flash('code',text);
			res.render('code.html', {username: req.flash('username'), message: req.flash('code')});
		}else{
			res.redirect('/');
		}
    });
	
	app.all('/game/*:file', function(req, res, next) {
		console.log("*****GAME*****");
		if (req.isAuthenticated()) {
			next();
		} else {
			res.redirect("/login"); 
		}
	},function(req,res){
		res.render("index.html"); 
	});
	
	app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });
	
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
	else res.redirect('/');
}
var express = require('express'),
		serverConf = require('./conf/conf').serverConf,
		adminConf = require('./conf/conf').adminConf,
		app = express.createServer(),
		dataAccess = require('./dataAccess').mongoAccess,
		streamer = require('./streamer').streamer,
		tplModel = null,
		checkAuth = function (req, res, next) {
			if (req.session) {
				if (!req.session.user_id) {
			    res.redirect('/login');
			  } else {
			    next();
			  }
			}
		};

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
});
app.configure('development', function(){
	app.use(express.bodyParser());
	app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "foo tickkkets"}));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  var oneYear = 31557600000;
  app.use(express.bodyParser());
	app.use(express.methodOverride());
  app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
  app.use(express.cookieParser());
  app.use(express.session({ secret: "foo tickkkets"}));
  app.use(express.errorHandler()); 
});

// Routers
app.get('/', function (req, res) {
	res.render('index', { displayList: tplModel.displayList, layout : false });
});
app.get('/login', function (req, res) {
	res.render('login', { layout : false });
});
app.get('/admin/:user', checkAuth, function (req, res) {
	if (req.params.user == "julien.zmiro") {
		res.render('admin', { displayList: tplModel.displayList, pendingList: tplModel.pendingList, layout : false });
	}
});
app.post("/admin/:user/add/:idToAdd", checkAuth, function (req, res) {
	if (req.params.user == "julien.zmiro") {
		tplModel.changeList(req.params.idToAdd, "display", function (elemUpdated) {
			res.writeHead(200, {'content-type': 'text/json' });
			res.write( JSON.stringify({ type : 'add'}) );
			res.end('\n');
		});
	}
});
app.post("/admin/:user/rm/:idToRm", checkAuth, function (req, res) {
	if (req.params.user == "julien.zmiro") {
		tplModel.changeList(req.params.idToRm, "pending", function (elemUpdated) {
			res.writeHead(200, {'content-type': 'text/json' });
			res.write( JSON.stringify({ type : 'rm'}) );
			res.end('\n');
		});
	}
});
app.post("/admin/:user/ban/:idToBan", checkAuth, function (req, res) {
	if (req.params.user == "julien.zmiro") {
		tplModel.changeList(req.params.idToBan, "banned", function (elemUpdated) {
			res.writeHead(200, {'content-type': 'text/json' });
			res.write( JSON.stringify({ type : 'ban'}) );
			res.end('\n');
		});
	}
});
app.post('/login', function (req, res) {
  var post = req.body;
  if (post.login == adminConf.login && post.pwd == adminConf.pwd) {
    req.session.user_id = adminConf.id;
    res.redirect('/admin/julien.zmiro');
  } else {
  	if (req.session.user_id) {
  		delete req.session.user_id;
  	}
    res.send('Bad user/pass');
  }
});
app.get('/logout', function (req, res) {
  delete req.session.user_id;
  res.redirect('/');
});
app.get('/*', function(req, res) {
  res.render('404.jade', { layout: false, status: 404 });
});

var init = (function () {
	console.log("Server Init");
	dataAccess.init(function () {
		streamer.init(50, function (model) {
			var loopStream = function () {
				streamer.stream();
			};
			tplModel = model;
			app.listen(serverConf.port, serverConf.host);
			loopStream();
			setInterval(loopStream, 1800000);
		});
	});
}());
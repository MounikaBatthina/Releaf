
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , session = require('client-sessions');

var user = require('./routes/user');

var app = express();

app.use(session({   
	  
	cookieName: 'session',    
	secret: 'ebay_test',    
	duration: 30 * 60 * 1000,    //setting the time for active session
	activeDuration: 5 * 60 * 1000,  

}));

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//***********************GET APIS FOR RELEAF*********************
app.get('/', routes.index);
app.get('/users', user.list);
app.get('/releafSample', user.releafSample);
app.get('/retrieveCompany',user.retrieveCompany);
app.get('/retrieveCompanies',user.retrieveCompanies);

//**************************POST APIS FOR RELEAF******************
app.post('/signIn',user.signIn);
app.post('/addCompany', user.addCompany);
app.post('/removeCompany',user.removeCompany);
app.post('/updateCompany',user.updateCompany);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

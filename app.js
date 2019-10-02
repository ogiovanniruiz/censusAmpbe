var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var parcelsRouter = require('./routes/parcels');
var campaignsRouter = require('./routes/campaigns')
var censustractRouter = require('./routes/censustracts')
var targetRouter = require('./routes/targets')
var orgRouter = require('./routes/organizations')
var activityRouter = require('./routes/activities')
var contactRouter = require('./routes/contact')
var personRouter = require('./routes/people')
var scriptRouter = require('./routes/scripts')
var textingRouter = require('./routes/texting')
var phonebankRouter = require('./routes/phonebank')

var app = express();
var mongoose = require('mongoose');

var mongoDB = ""
var corsOptions = { methods: 'GET,POST,PATCH,DELETE,OPTIONS',
                    optionsSuccessStatus: 200,
                    origin: ""}

if(app.get('env') === 'census'){
  process.env.app_sid =  'APcfa84370fade47d9de6493f08e73b6fa'
  process.env.accountSid = 'ACaa2284052d10b1610817013666b0ca9d'
  process.env.authToken = 'cb57765af76625d6ed79376cc411a2ca'

  mongoDB = 'mongodb://root:7EA9e666!@AmplifyMongo/v2db?authSource=admin';
  corsOptions.origin = 'https://outreach.censusie.org'
  
}else if(app.get('env') === 'devServer'){

  process.env.app_sid =  'APcfa84370fade47d9de6493f08e73b6fa'
  process.env.accountSid = 'ACaa2284052d10b1610817013666b0ca9d'
  process.env.authToken = 'cb57765af76625d6ed79376cc411a2ca'

  mongoDB = 'mongodb://root:7EA9e666!@devAmplifyMongo/v2db?authSource=admin';
  corsOptions.origin = 'https://dev.outreach.censusie.org'

} 
else if(app.get('env') === 'campaigns'){

  process.env.app_sid =  'AP3445c5a3471c40dbca2fd426cc205417'
  process.env.accountSid = 'ACc923c4760fbb4e54694ca4e2275dc132'
  process.env.authToken = '3220b02b69c5ff27397dfd8f6eec6c3d'

  mongoDB = 'mongodb://root:7EA9e666!@mongoCampaigns/v2db?authSource=admin';
  corsOptions.origin = 'https://amp.ieunited.org'

}else if(app.get('env') === 'development'){

  process.env.app_sid =  'APcfa84370fade47d9de6493f08e73b6fa'
  process.env.accountSid = 'ACaa2284052d10b1610817013666b0ca9d'
  process.env.authToken = 'cb57765af76625d6ed79376cc411a2ca'

  mongoDB = 'mongodb://127.0.0.1:27017/v2db?authSource=v2db&w=1';
  corsOptions.origin = 'http://localhost:4200'
  
}


mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const cors = require('cors');

app.use(cors(corsOptions));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/campaigns', campaignsRouter);
app.use('/parcels', parcelsRouter);
app.use('/censustracts', censustractRouter)
app.use('/targets', targetRouter)
app.use('/organizations', orgRouter)
app.use('/activities', activityRouter)
app.use('/contact', contactRouter)
app.use('/person', personRouter)
app.use('/scripts', scriptRouter)
app.use('/texting', textingRouter)
app.use('/phonebank', phonebankRouter)

module.exports = app;
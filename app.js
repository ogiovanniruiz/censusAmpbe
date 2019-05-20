var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var parcelsRouter = require('./routes/parcels');

var app = express();

var mongoose = require('mongoose');
var mongoDB = 'mongodb://127.0.0.1:27017/v2db?authSource=v2db&w=1';
//var mongoDB = 'mongodb://192.168.1.124:27018/v2db?authSource=v2db&w=1';
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const cors = require('cors');

app.use(cors({
  methods: 'GET,POST,PATCH,DELETE,OPTIONS',
  optionsSuccessStatus: 200,
  //origin: 'https://census.inlandempowerment.org'
  origin: 'http://localhost:4200'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/parcels', parcelsRouter);

module.exports = app;

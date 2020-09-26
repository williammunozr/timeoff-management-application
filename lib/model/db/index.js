"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var nconf     = require('nconf');

nconf.env();

var env         = process.env.NODE_ENV || "development";
var db_name     = nconf.get('DB_NAME');
var db_username = nconf.get('DB_USERNAME');
var db_password = nconf.get('DB_PASSWORD');
var db_host     = nconf.get('DB_HOST');
var db_dialect  = nconf.get('DB_DIALECT');

console.log(db_name);


var config    = require(__dirname + '/../../../config/db.json')[env];
if (env == "production") {
  config.username = db_username;
  config.password = db_password;
  config.database = db_name;
  config.host     = db_host;
  config.dialect  = db_dialect;
}
var sequelize = new Sequelize(config.database, config.username, config.password, config);

var db        = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0)
      && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

// Link models according associations
//
Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

// Add scopes
//
Object.keys(db).forEach(function(modelName) {
  if ('loadScope' in db[modelName]) {
    db[modelName].loadScope(db);
  }
});

// Link models based on associations that are based on scopes
//
Object.keys(db).forEach(function(modelName) {
  if ('scopeAssociate' in db[modelName]) {
    db[modelName].scopeAssociate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;

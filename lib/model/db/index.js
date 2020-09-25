"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");

var env         = process.env.NODE_ENV || "development";
var db_name     = process.env.DB_NAME;
var db_username = process.env.DB_USERNAME;
var db_password = process.env.DB_PASSWORD;
var db_host     = process.env.DB_HOST;
var db_dialect  = process.env.DB_DIALECT;

console.log("Value of env: %s", env);
console.log('Database Name: %s', process.env.DB_NAME);

// var config    = require(__dirname + '/../../../config/db.json')[env];
// var sequelize = new Sequelize(config.database, config.username, config.password, config);

var sequelize = new Sequelize(db_name, db_username, db_password, {
  host: db_host,
  dialect: db_dialect
});
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

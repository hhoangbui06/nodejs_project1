const express = require('express')
const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
mongoose.plugin(slug)

const schema = new mongoose.Schema({
  websiteName: String,
  logo: String,
  phone: String,
  email: String,
  address: String,
  copyright: String,
  facebook: String
},
  {
    timestamps: true
  });
const setting = mongoose.model('Setting', schema, 'settings')
module.exports = setting;
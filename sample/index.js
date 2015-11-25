'use strict';

const express = require('express');
const multer  = require('multer');
const AWS = require('aws-sdk');
const fs = require('fs');
const StorageS3 = require('./index');
let s3 = new AWS.S3({
    accessKeyId: "<accessKeyId>", 
    secretAccessKey: "<secretAccessKey>", 
    region: "<region>",
    apiVersion: "2006-03-01"
});
let storage = new StorageS3({
  service: s3,
  destination: 'folderpath',
  params: { Bucket: 'mybucket', ACL: 'public-read' }
});

let upload = multer({ storage: storage });
let app = express();
let http = require('http');
let server = http.createServer(app);

app.post('/photos', upload.array('photos', 12), function (req, res, next) {
  console.log(req);
  res.send({ upload: 'ok' });
});

server.listen(3000);
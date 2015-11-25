'use strict';

const util = require('util');
const path = require('path');
const AWS = require('aws-sdk');
const EventEmitter = require('events');

class StorageS3 {
  constructor(config) {
    if (!config.service instanceof AWS.S3) throw new Error('[config.service] not is a instance of \'AWS.S3\'.');
    if (!config.params) throw new Error('[config.params] is required.');

    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  createManagedUpload(file) {
    let config = this.getConfig();
    let destination = config.destination == null ? '' : config.destination;
    let destinationPath = path.join(destination, file.originalname);
    
    config.params.Key = destinationPath;
    config.params.Body = file.stream;

    return new AWS.S3.ManagedUpload(config);
  }

  _handleFile(req, file, callback) {
    let managedUpload = this.createManagedUpload(file);

    managedUpload.send((err, uploadedObjectS3) => {
      if (err) return callback(err, uploadedObjectS3);

      callback(null, {
        filename: file.originalname,
        location: uploadedObjectS3.Location,
        etag: uploadedObjectS3.ETag
      });
    });
  }
}

//**
//* @extends(EventEmitter);
//*
util.inherits(StorageS3, EventEmitter);

module.exports = StorageS3;



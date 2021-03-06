'use strict';

let util = require('util');
let path = require('path');
let AWS = require('aws-sdk');
let EventEmitter = require('events');

class StorageS3 {
  constructor(config) {
    if (!config.service instanceof AWS.S3) throw new Error('[config.service] not is a instance of \'AWS.S3\'.');
    if (!config.params) throw new Error('[config.params] is required.');

    this.config = config;
  }

  getConfig() {
    return this.config;
  }

  getPath(file) {
  }

  getFilename(file) {
  }

  createManagedUpload(file) {
    let config = this.getConfig();
    let destination = this.getPath(file) || (config.destination == null ? '' : config.destination);
    let filename = this.getFilename(file) || file.originalname;
    let destinationPath = path.join(destination, filename);

    config.params.Key = destinationPath;
    config.params.Body = file.stream;

    let upload = new AWS.S3.ManagedUpload(config);
    
    upload.on('httpUploadProgress', (data) => {
      this.emit('progress', data);
    });

    return upload;
  }

  _removeFile(req, file, callback) {
    let config = this.getConfig();

    config.service.deleteObject({
      Bucket: config.params.Bucket,
      Key: file.path
    }, callback);
  }

  _handleFile(req, file, callback) {
    let managedUpload = this.createManagedUpload(file);

    managedUpload.send((err, uploadedObjectS3) => {
      if (err) return callback(err, uploadedObjectS3);

      let data = {
        filename: file.originalname,
        location: uploadedObjectS3.Location,
        path: uploadedObjectS3.Location.replace(/https?:\/\/([A-Za-z0-9\-\:\.]+)/, ''),
        etag: uploadedObjectS3.ETag
      };

      this.emit('loaded', data);

      callback(null, data);
    });
  }
}

//**
//* @extends(EventEmitter);
//*
util.inherits(StorageS3, EventEmitter);

module.exports = StorageS3;
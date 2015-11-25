'use strict';

const AWS = require('aws-sdk');
const StorageS3 = require('../index');
const s3config = require('./config.json');
const chai = require('chai');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const expect = require('chai').expect;

lab.experiment('StorageS3', () => {
  let s3 = new AWS.S3(s3config);
  let config = {
        service: s3,
        destination: 'folderpath',
        params: { Bucket: s3config.bucket, ACL: 'public-read' }
      };

  lab.test('#new', (done) => {
    let storage = new StorageS3(config);

    expect(storage).to.be.an.instanceof(StorageS3);

    done();
  });

  lab.test('#getConfig', (done) => {
    let storage = new StorageS3(config);

    expect(storage.getConfig()).to.be.equal(config);

    done();
  });


  lab.test('#createManagedUpload', (done) => {
    let storage = new StorageS3(config);
    let managedUpload;

    managedUpload = storage.createManagedUpload({
      destination: 'tmp/test',
      originalname: 'file.txt',
      stream: 'Hello word!'
    });

    expect(managedUpload).to.have.property('send');

    done();
  });

  lab.test('#_handleFile', (done) => {
    let storage = new StorageS3(config);
    let file = {
      originalname: 'file.txt',
      stream: 'Hello word!'
    };

    storage._handleFile(null, file, (err, data) => {
      expect(err).to.be.equal(null);
      expect(data.location).to.contain(file.originalname);
      
      done();
    });
  });

  lab.after((done) => {
    var params = {
      Bucket: s3config.bucket,
      Key: config.destination + '/file.txt',
    };

    s3.deleteObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack);
        done();
      }
      
      done();
    });
  });
});
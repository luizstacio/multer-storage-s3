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

  lab.test('#getFilename', (done) => {
    
    class MyStorage extends StorageS3 {
      constructor(config) {
        super(config);
      }

      getFilename(file) {
        return file.originalname.replace(/\./, `.${Date.now()}.`);
      }
    }

    let storage = new MyStorage(config);
    let file = {
      originalname: 'file.txt',
      stream: 'Hello word!'
    };

    storage._handleFile(null, file, (err, data) => {
      expect(err).to.be.equal(null);
      expect(data.location).to.match(/file\.([0-9]+)\.txt/);
      
      done();
    });
  });

  lab.test('#getPath', (done) => {
    let path = 'folderpath2';
    
    class MyStorage extends StorageS3 {
      constructor(config) {
        super(config);
      }

      getPath(file) {
        return path;
      }
    }

    let storage = new MyStorage(config);
    let file = {
      originalname: 'file.txt',
      stream: 'Hello word!'
    };

    storage._handleFile(null, file, (err, data) => {
      expect(err).to.be.equal(null);
      expect(data.location).to.contain(path);
      
      done();
    });
  });

  lab.after((done) => {
    s3.listObjects({
      Bucket: s3config.bucket,
      Prefix: 'folderpath'
    }, function (err, data) {

      s3.deleteObjects({
        Bucket: s3config.bucket,
        Delete: {
          Objects: data.Contents.map((item) => { return { Key: item.Key } })
        }
      }, function(err, data) {
        if (err) {
          console.log(err, err.stack);
          done();
        }
        done();
      });
    });
  });
});
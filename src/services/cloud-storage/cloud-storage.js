'use strict';

const formidable = require('formidable');

const CloudLocal = require('./cloud-local');
const bodyParser = require('body-parser');
const Bucket = require('./bucket');

class CloudStorage extends CloudLocal {
  init() {
    // TODO : change this port and pass through config
    this.port = 8080;
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.raw());
    this.app.use(bodyParser.text());
    this.app
      .post(`/storage/v1/b`, this._insertBucket)
      .get(`/storage/v1/b`, this._listBuckets)
      .get(`/storage/v1/b/:bucketName`, this._getBucket)
      .delete(`/storage/v1/b/:bucketName`, this._deleteBucket)
      .post(`/upload/storage/v1/b/:bucketName/:o`, this._uploadObject)
      .get(`/host/:bucketName/:objectName`, this._viewObjecet);
  }

  _viewObjecet(req, res) {
    const bucketName = req.params.bucketName;
    const objectName = req.params.objectName;
    const _bucket = new Bucket();
    const objectPath = _bucket.getObjectLocation(objectName, bucketName);
    res.sendFile(objectPath);
  }

  _uploadObject(req, res) {
    const fileName = req.query.name;
    const bucketName = req.params.bucketName;

    const form = new formidable.IncomingForm();

    form.parse(req, function (err, fields, files) {
      console.log(Object.values(files)[0].type);
      console.log(Object.values(files)[0].size);
      const tmpPath = Object.values(files)[0].path;
      const _bucket = new Bucket();
      const objectInstance = _bucket.uploadObject(
        tmpPath,
        fileName,
        bucketName
      );
      console.log(objectInstance);
      res.send(objectInstance);
    });
  }

  _updateObject(req, res) {
    const bucketName = req.params.bucketName;
    const path = req.params.path;
    const fileName = req.params.fileName;
    const _bucket = new Bucket();
    const objectInstance = _bucket.updateBucket(path, fileName, bucketName);
    res.send(objectInstance);
  }

  _insertBucket(req, res) {
    const _bucket = new Bucket();
    const bucketName = req.body.name;
    const bucket = _bucket.insertBucket(bucketName);
    res.send(bucket);
  }

  _getBucket(req, res) {
    const bucketName = req.params.bucketName;
    const _bucket = new Bucket();
    try {
      const bucket = _bucket.getBucket(bucketName);
      bucket ? res.send(bucket) : res.status(404).send();
    } catch (err) {
      res.status(404).send('error');
    }
  }

  _deleteBucket(req, res) {
    console.log(req.params);
    const bucketName = req.params.bucketName;
    const _bucket = new Bucket();
    try {
      _bucket.deleteBucket(bucketName)
        ? res.status(204).send()
        : res.status(404).send();
    } catch (err) {
      res.status(404).send('error');
    }
  }

  _listBuckets(req, res) {
    const _bucket = new Bucket();
    res.send(_bucket.listBuckets());
  }
}

module.exports = CloudStorage;

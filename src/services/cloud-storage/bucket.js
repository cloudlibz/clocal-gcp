const fs = require('fs');
const { execSync } = require('child_process');
const homedir = require('os').homedir();
const BucketConfigStore = require('./bucket-config-store');
const BucketObjectsConfigStore = require('./bucket-objects-config-store');
const path = require('path');

class Bucket {
  constructor() {
    const storageLocationPath = `${homedir}/.clocal-gcp/storage`;
    if (!fs.existsSync(storageLocationPath)) {
      execSync(`mkdir -p ${storageLocationPath}`);
    }
    this.storageLocation = storageLocationPath;
    this._bucketConfigStore = new BucketConfigStore();
    this._bucketObjects = new BucketObjectsConfigStore();
  }

  getObjectLocation(fileName, bucketName) {
    return `${this.storageLocation}/${bucketName}/${fileName}`;
  }

  updateObject(path, fileName, bucketName) {
    try {
      this.deleteObject(bucketName, objectName);
      return this.uploadObject(path, fileName, bucketName);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  uploadObject(path, fileName, bucketName) {
    try {
      const bucketConfig = this._bucketConfigStore.getBucket(bucketName);
      if (bucketConfig) {
        const objectPath = `${this.storageLocation}/${bucketName}/${fileName}`;
        fs.copyFileSync(path, `${objectPath}`);
        fs.unlinkSync(path);
        if (fs.existsSync(objectPath)) {
          try {
            const objectInstance = this._getObjectInstace(bucketName, fileName);
            this._bucketObjects.insertObject(
              bucketName,
              objectInstance,
              objectPath
            );
            return objectInstance;
          } catch (err) {
            return err;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  _getBucketName(gcpUrl) {
    const path = gcpUrl.replace('gs://', '');
    return path.substr(0, path.indexOf('/'));
  }

  copyObjects(sourceUrl, destinationUrl) {
    try {
      const srcBucket = this._getBucketName(sourceUrl);
      const destBucket = this._getBucketName(destinationUrl);
      const srcFileName = path.parse(sourceUrl).base;
      const destFileName = path.parse(destinationUrl).base;
      const srcBucketObjects = this._bucketConfigStore.getBucket(srcBucket);
      if (srcBucketObjects === undefined)
        throw Error(`Bucket ${srcBucket} does not exist`);
      const destBucketObjects = this._bucketConfigStore.getBucket(srcBucket);
      if (srcBucketObjects === undefined)
        throw Error(`Bucket ${destBucket} does not exist`);
      const srcPath = `${this.storageLocation}/${srcBucket}/${srcFileName}`;
      const destPath = `${this.storageLocation}/${destBucket}/${destFileName}`;
      fs.copyFileSync(srcPath, destPath);
      if (fs.existsSync(destPath)) {
        try {
          const objectInstance = this._getObjectInstace(
            destBucket,
            destFileName
          );
          this._bucketObjects.insertObject(destBucket, destFileName, destPath);
          return `Copied successfully\n${objectInstance}`;
        } catch (err) {
          return err;
        }
      } else {
        throw Error(`copy operation failed`);
      }
    } catch (err) {
      return err;
    }
  }

  listObjects(bucketName) {
    return this._bucketObjects.listObjects(bucketName);
  }

  deleteObject(bucketName, objectName) {
    try {
      const bucketConfig = this._bucketConfigStore.getBucket(bucketName);
      if (bucketConfig === undefined) throw Error('bucket not exists');
      const bucketObjects = this._bucketObjects.getObject(bucketConfig.name);
      if (bucketObjects === undefined) throw Error(`object doesn't exists`);
      const objectPath = `${this.storageLocation}/${bucketName}/${fileName}`;
      fs.unlinkSync(objectPath);
      if (!fs.existsSync(objectPath)) {
        this._bucketObjects.deleteObject(bucketName, objectName);
        return `${objectName} was deleted from ${bucketName}`;
      } else {
        return 'object deletion operation failed';
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  insertBucket(bucketName) {
    try {
      const bucketPath = `${this.storageLocation}/${bucketName}`;
      fs.mkdirSync(bucketPath);
      if (fs.existsSync(bucketPath)) {
        const bucketInstance = this._getBucketInstace(bucketName, bucketPath);
        this._bucketConfigStore.insertBucket(bucketInstance);
        return bucketInstance;
      }

      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * check whether path is a bucket path or a local path
   * @param {*} path
   */
  _checkBucketPath(path) {
    return path.includes('gs://');
  }

  deleteBucket(bucketName) {
    try {
      const bucketPath = `${this.storageLocation}/${bucketName}`;
      fs.rmdirSync(bucketPath);
      if (!fs.existsSync(bucketPath)) {
        this._bucketConfigStore.deleteBucket(bucketName);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }

  getBucket(bucketName) {
    try {
      return this._bucketConfigStore.getBucket(bucketName);
    } catch (err) {
      return false;
    }
  }

  listBuckets() {
    try {
      return {
        kind: 'storage#buckets',
        items: this._bucketConfigStore.listBuckets(),
      };
    } catch (err) {
      return false;
    }
  }

  updateBucket(bucketInstance) {
    try {
      throw Error('not implemented yet');
    } catch (err) {
      return false;
    }
  }

  _getBucketInstace(bucketName, path, bucketInstance) {
    const updateTime = new Date().toISOString();
    let bucket;
    if (bucketInstance) {
      bucket = bucketInstance;
    } else {
      bucket = {
        kind: 'storage#bucket',
        id: bucketName,
        selfLink: 'string',
        projectNumber: 'number',
        name: 'string',
        timeCreated: updateTime,
        updated: 'datetime',
        metageneration: 'long',
        location: 'string',
        storageClass: 'string',
        etag: 'string',
      };
    }
    bucket.updated = updateTime;
    bucket.id = bucketName;
    bucket.name = bucketName;
    return bucket;
  }

  _getObjectInstace(bucketName, objectName, objectInstance) {
    const updateTime = new Date().toISOString();
    let object;
    if (objectInstance) {
      object = objectInstance;
    } else {
      object = {
        kind: 'storage#object',
        id: objectName,
        selfLink: '',
        name: objectName,
        bucket: bucketName,
        generation: '',
        metageneration: '1',
        contentType: 'text/plain',
        timeCreated: updateTime,
        updated: '',
        storageClass: 'STANDARD',
        timeStorageClassUpdated: '',
        size: '24',
        md5Hash: 'W4NmunBvbZ2nOebprTShkw==',
        mediaLink: '',
        crc32c: 'D+fHZQ==',
        etag: 'COyc/YnXo9wCEAE=',
      };
    }
    object.updated = updateTime;
    object.id = objectName;
    object.name = objectName;
    object.selfLink = `http://localhost:8000/host/${bucketName}/${objectName}`;
    return object;
  }
}

module.exports = Bucket;

/**
 * Before running this file make sure GOOGLE_APPLICATION_CREDENTIALS variable is set
 */

const Storage = require('@google-cloud/storage');
const gcs = new Storage();

gcs.interceptors.push({
  request: reqOpts => {
    reqOpts.uri = reqOpts.uri.replace(
      'https://www.googleapis.com',
      'http://localhost:8080'
    );
    // console.log(JSON.stringify(reqOpts));
    return reqOpts;
  },
});
gcs
  .createBucket('test-bucket')
  .then(async res => {
    try {
      const bucketList = await gcs.getBuckets();
      const bucket = await gcs.bucket('test-bucket').get();
      // this endpoint doesn't work correctly
      // const uploadRes = await gcs.bucket('test-bucket').upload('./test.txt');
      
      // await gcs.bucket('test-bucket').delete();
    } catch (err) {
      console.log(`${err.message}`);
    }
  })
  .catch(err => console.log(err));

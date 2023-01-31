const crypto = require('crypto');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');

const storage = new Storage();

async function getFileMetadata(bucketName, localPath, fileName) {
  try {
    const [metadata] = await storage.bucket(bucketName).file(fileName).getMetadata();
    const localContent = fs.readFileSync(localPath);
    const localHash = crypto.createHash('md5').update(localContent).digest('base64');
    const remoteHash = metadata.md5Hash;
    return localHash === remoteHash ? 'matches' : 'no-match';
  } catch (error) {
    return 'not-created';
  }
}

async function getBucketMetadata(bucketName) {
  try {
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    return metadata;
  } catch (error) {
    return false;
  }
}

module.exports = {
  getFileMetadata,
  getBucketMetadata,
};
const crypto = require('crypto');
const fs = require('fs');
const { Storage } = require('@google-cloud/storage');


async function getFileMetadata(bucketName, localPath, fileName, keyFile) {
  const storage = new Storage({
    keyFile
  });
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

async function getBucketMetadata(bucketName, keyFile) {
  const storage = new Storage({
    keyFile,
  });
  try {
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    return metadata;
  } catch (error) {
    console.log(error['errors'][0]['message'])
    return false;
  }
}

module.exports = {
  getFileMetadata,
  getBucketMetadata,
};
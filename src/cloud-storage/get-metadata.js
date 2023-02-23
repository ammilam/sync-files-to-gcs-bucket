const crypto = require('crypto');
const fs = require('fs');

const { Storage } = require('@google-cloud/storage');

async function checkIfFileExists(bucketName, file, keyFile) {
  try {
    // initialize new storage client
    const storage = new Storage({
      keyFile
    });
    const [exists] = await storage.bucket(bucketName).file(file).exists()
    return exists
  } catch (error) {
    console.error(error)
  }

}

async function getFileMetadata(bucketName, localPath, file, keyFile) {
  // initialize new storage client
  const storage = new Storage({
    keyFile
  });
  try {
    // invoke checkIfFileExists function to check if a file exists in the bucket
    // that matches a file name matches
    const exists = await checkIfFileExists(bucketName, file)
    if (exists) {
      const [metadata] = await storage.bucket(bucketName).file(file).getMetadata();
      const localContent = fs.readFileSync(localPath);
      const localHash = crypto.createHash('md5').update(localContent).digest('base64');
      const remoteHash = metadata.md5Hash;
      const response =  localHash == remoteHash ? 'matches' : 'no-match';
      return response
    } else {
      return 'not-created'
    }
  } catch (error) {
    console.log(error);
  }
}

async function getBucketMetadata(bucketName, keyFile) {
  // initialize new storage client
  const storage = new Storage({
    keyFile,
  });
  try {
    // get bucket metadata, used to verify a bucket exists
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    return metadata;
  } catch (error) {
    console.error(error)
    return false;
  }
}

module.exports = {
  getFileMetadata,
  getBucketMetadata,
};


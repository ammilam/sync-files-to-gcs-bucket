//
// Metadata module
// Exports functions that reads bucket and file metadata
//

// import modules
const md5 = require('crypto-md5')
let fs = require('fs')

// Imports the Google Cloud storage client library
const {
  Storage
} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// function that parses the md5 checksum of the file in a gcs bucket,
// and compares it to the md5 hash of the local file. If they don't match,
// or if the file doesn't exist on the remote bucket, a new version will be created.
async function getFileMetadata(bucketName, localPathToFile, fileName) {
  try {
    // Gets the metadata for the file
    const [metadata] = await storage
      .bucket(bucketName)
      .file(fileName)
      .getMetadata();
    // load in the local file's contents
    let buf = await fs.readFileSync(localPathToFile)
    // get md5 hash of the local file
    let localFileHash = md5(buf, 'base64')
    // parse out md5 hash from the remote file in gcs
    let remoteFileHash = metadata['md5Hash']
    // compare hashes and do stuff
    if (localFileHash == remoteFileHash) {
      return "matches"
    } else {
      console.log(`md5 doesn't match, uploading ${fileName} to ${bucketName}`)
      return "no-match"
    }
  } catch (e) {
    console.log(`${fileName} doesn't exist in ${bucketName}, creating first version`)
    return "not-created"
  }
}

// function used to verify a bucket exists by attempting to check metadata
async function getBucketMetadata(bucketName) {
  try {
    const [metadata] = await storage.bucket(bucketName).getMetadata();
    return metadata
  } catch {
    return false
  }
}

// export functions for consumption
module.exports = {
  getFileMetadata,
  getBucketMetadata
}

//
// Cloud Storage Module
// Uploads files to a gcs bucket
//

// Imports the Google Cloud storage client library
const {
  Storage
} = require('@google-cloud/storage');

// Creates a client
const storage = new Storage();

// create a file used to upload files to a gcs bucket
async function uploadFile(bucketName, localPathToFile, localFileName) {

  const options = {
    destination: localFileName,
  };

  await storage.bucket(bucketName).upload(localPathToFile, options).catch(error => {
    console.error(error)
  }).then(response => {
    let updated = response[0]['metadata']['updated']
    let name = response[0]['metadata']['name']
    let bucket = response[0]['metadata']['bucket']
    if (updated) {
      console.log(`new version "${name}" successfully uploaded to ${bucket}`)
    }
  })
}

// export the function for consumption
module.exports = {
  uploadFile
}

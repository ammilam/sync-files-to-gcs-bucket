const {
  Storage
} = require('@google-cloud/storage');

const fs = require("fs");

async function uploadFile(bucketName, localPathToFile, file, keyFile, method) {
  const storage = new Storage({
    keyFile
  });

  const options = {
    destination: file
  };

  try {
    const [{
      metadata: {
        updated,
        name,
        bucket
      }
    }] = await storage.bucket(bucketName).upload(localPathToFile, options);
    if (updated) {
      console.log(`${updated} new version successfully created from "${localPathToFile}" and uploaded to ${bucket} at ${name}`);
      if (method === "move") {
        fs.unlinkSync(localPathToFile);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  uploadFile
};

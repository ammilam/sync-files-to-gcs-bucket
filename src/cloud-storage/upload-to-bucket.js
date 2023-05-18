const {
  Storage
} = require('@google-cloud/storage');

const fs = require("fs");
const metadata = require("./get-metadata");

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
    }] = await storage.bucket(bucketName).upload(localPathToFile, options).then(() => {
      if (method === "move") {
        const [exists] = storage.bucket(bucketName).file(file).exists()
        if (exists) {
          fs.unlinkSync(localPathToFile);
        }
      }
    })

    if (updated) {
      console.log(`${updated} new version successfully created from "${localPathToFile}" and uploaded to ${bucket} at ${name}`);
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = {
  uploadFile
};

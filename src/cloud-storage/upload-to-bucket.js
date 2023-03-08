const {
  Storage
} = require('@google-cloud/storage');


async function uploadFile(bucketName, localPathToFile, file, keyFile) {
  const storage = new Storage({
    keyFile
  });

  const options = {
    destination: file
  };

  let retries = 10

  const retryOptions = {
    retryOptions: {
      autoRetry: true,
      retryDelayMultiplier: 3,
      totalTimeout: 10000,
      maxRetryDelay: 1000 * retries,
      maxRetries: retries,
    }
  }

  try {
    const [{
      metadata: {
        updated,
        name,
        bucket
      }
    }] = await storage.bucket(bucketName).upload(localPathToFile, options, retryOptions);
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
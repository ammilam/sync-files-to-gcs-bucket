const fs = require("fs");
const {
  SecretManagerServiceClient
} = require('@google-cloud/secret-manager');
// Create a client instance of the Google Cloud Secret Manager service

// Helper function to get the latest secret version
async function getLatestSecret(project, secret, keyFile) {
  const client = new SecretManagerServiceClient({
    keyFile
  });

  // Access the latest version of the specified secret
  const [version] = await client.accessSecretVersion({
    name: `projects/${project}/secrets/${secret}/versions/latest`,
  });
  // Return the secret data as a string
  return version.payload.data.toString()
}
// Helper function to add a new secret version
async function addSecretVersion(project, secret, payload, keyFile) {
  try {
    const client = new SecretManagerServiceClient({
      keyFile
    });

    // Add a new version of the secret with the given payload
    const [version] = await client.addSecretVersion({
      parent: `projects/${project}/secrets/${secret}`,
      payload: {
        data: payload
      }
    });
    // Return the newly added secret version
    return version;
  } catch (error) {
    console.error(error)
  }
}

// Main function to add a new version of the secret
async function addVersion(project, secret, path) {
  try {
    // Get the file size in KB
    const fileSizeInKb = await fs.statSync(path).size / 1024;
    const p = await fs.readFileSync(path)
    // Get the file payload
    const payload = Buffer.from(p, 'utf8')
    const checkPayload = payload.toString()


    // Check if the file size exceeds the limit of 64 KB
    if (fileSizeInKb > 64) {
      console.error(`File size of ${fileSizeInKb} KB exceeds the limit of 64 KB`);
    }

    // Get the latest version of the secret
    const lS = await getLatestSecret(project, secret);
    const latestSecret = Buffer.from(lS, 'utf8').toString()
    // Check if the latest secret version matches the file contents
    if (latestSecret !== checkPayload) {
      // If not, add a new version of the secret with the file payload
      const version = await addSecretVersion(project, secret, payload)
      console.log(`Added secret version ${version.name}`);
    } else {
      // If the latest secret version already matches the file contents, log a message
      console.log("Latest secret version already matches the file contents");
    }
  } catch (error) {
    console.error(error)
  }
}

// Export the main function as a module
module.exports.addSecretVersion = addVersion;
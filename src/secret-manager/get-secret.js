async function getVersions(name = 'projects/1023185922343/secrets/test/versions/latest') {

    // Imports the Secret Manager library
    const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
  
    // Instantiates a client
    const client = new SecretManagerServiceClient();
  
    async function accessSecretVersion() {
      const [version] = await client.accessSecretVersion({
        name: name,
      });
  
      // Extract the payload as a string.
      const payload = version.payload.data.toString();
  
      // WARNING: Do not print the secret in a production environment - this
      // snippet is showing how to access the secret material.
      console.info(`Payload: ${payload}`);
    }
  
    accessSecretVersion();
    // [END secretmanager_access_secret_version]
  }
  
  const args = process.argv.slice(2);
  getVersions(...args).catch(console.error);
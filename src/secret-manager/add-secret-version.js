const fs = require("fs");
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

async function addVersion(project, secret, path) {
  const client = new SecretManagerServiceClient();
  const fileSizeInKb = getFileSizeInKb(path);
  const payload = getFilePayload(path);

  if (fileSizeInKb > 64) {
    throw new Error(`File size of ${fileSizeInKb} KB exceeds the limit of 64 KB`);
  }

  const latestSecret = await getLatestSecret(client, project, secret);
  console.log(latestSecret)
  if (latestSecret !== payload) {
    const version = await addSecretVersion(client, project, secret, payload);
    console.log(`Added secret version ${version.name}`);
  } else {
    console.log("Latest secret version already matches the file contents");
  }
}

function getFileSizeInKb(path) {
  return fs.statSync(path).size / 1024;
}

function getFilePayload(path) {
  return Buffer.from(fs.readFileSync(path), 'utf8');
}

async function getLatestSecret(client, project, secret) {
  const [secretVersion] = await client.accessSecretVersion({
    name: `projects/${project}/secrets/${secret}/versions/latest`,
  });
  return secretVersion.payload.data.toString();
}

async function addSecretVersion(client, project, secret, payload) {
  const [version] = await client.addSecretVersion({
    parent: `projects/${project}/secrets/${secret}`,
    payload: {
      data: payload
    }
  });
  return version;
}

module.exports.addSecretVersion = addVersion;

// module used to watch directories
const chokidar = require("chokidar");
// module used for slurp in environment variables
const { config } = require("dotenv");
config();

// fs module for interacting with the filesystem
const fs = require("fs");
const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS
const pa = require("path");
const filename = pa.basename(__filename);
const args = require('yargs').argv;

// create a variables from flags passed in at runtime
const path = args.path
const project = args.project
const bucket = args.bucket
const interval = args.interval
const type = args.type || "cloud-storage";
const secret = args.secret

// used to determine the name of the file being ran
const exe = filename.match(/.*\.js/) ? `node ${filename}` : filename;

// error handling for path when referencing local directory
if (path === "./") {
  console.log(`
      error on: ${path}
      referencing the current working directory without an explicit file,
      or sub directory designation is not supported
      `)
  process.exit(1)
}

// ensure proper flags are passed in at runtime
if ((type === "cloud-storage" && !secret) && (!path || !bucket)) {
  console.error(`
    you must supply at least one path, and a gcs bucket name

    ${exe} --path=./path/to/local/file --bucket=gcs-bucket-name
    ${exe} --path=./path/to/local/file --path=./path/to/local/another/file.txt --bucket=gcs-bucket-name
    ${exe} --path=./path/to/local/file --bucket=gcs-bucket-name --interval=900
    `);
  process.exit(1);
}

if (type === "secret-manager" && (!secret || !project || !path)) {
  console.error(`
  when --type=secret-manager, you must supply a secret, a project id, and a path to a local file
  ${exe} --secret=a-secret --project=gcp-project-1234 --path=./path/to
  `)
}

// import local modules
const cloudStorage = require("./src/cloud-storage/upload-to-bucket");
const metadata = require("./src/cloud-storage/get-metadata");
const storageTransferService = require("./src/storage-transfer-service/posix-request");
const secretManager = require("./src/secret-manager/add-secret-version")
const auth = require("./src/google-auth/auth")

// function to upload file to a bucket
async function upload(bucket, localPathToFile, keyFile) {
  const localFileName = localPathToFile.match(/^(\/?[\w.-]+)+([\/\w.-]+)?(\.\w*)?$/)[1];
  const bucketStatus = await metadata.getBucketMetadata(bucket, keyFile);
  const localFileStats = fs.statSync(localPathToFile);
  const fileStatus = await metadata.getFileMetadata(bucket, localPathToFile, localFileName, keyFile);
  if (type === "secret-manager") {
    if (localFileStats.isDirectory()) {
      console.error(`
      when type=secret-manager, you must pass in a single file, not a folder
      `)
      process.exit(1)
    } else {
      await secretManager.addSecretVersion(project, secret, localPathToFile, keyFile)
    }
  } else {
    // check if gcs bucket exists
    if (bucketStatus) {
      // invoke getFileMetadata function to check if the md5 hash for the local file
      // matches the md5 hash of the object in the gcs bucket
      if (fileStatus !== "matches") {
        if (type === "transfer-service") {
          console.log("this feature is disabled at this time");
          process.exit(0);
        }
        else {
          cloudStorage.uploadFile(bucket, localPathToFile, localFileName, keyFile);
        }
      }
    } else {
      console.log("bucket doesn't exist");
    }
  }
}

// function that watches paths passed in via the --path flag at runtime
async function watchDirectory(path, bucket, interval, project, secret, keyFile) {
  console.log(`Watching ${path} for changes to send to ${bucket||secret}. Polling interval: ${interval ? `${interval} seconds` : 'FS events'}.`);

  const watcher = chokidar.watch(path, {
    persistent: true,
    useFsEvents: !interval,
    usePolling: !!interval,
    interval: Number(interval),
  });

  watcher.on('change', p => upload(bucket, p, project, secret, keyFile));
  watcher.on('add', p => upload(bucket, p, project, secret, keyFile));
}


// main function, will auth with google and then invoke the watchDirectory function
async function main() {
  // await auth.googleAuth()
  await watchDirectory(path, bucket, interval, project, secret, keyFile);
}

main().catch(console.error);

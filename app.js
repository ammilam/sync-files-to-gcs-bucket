// module used to watch directories
const chokidar = require("chokidar");
const { config } = require("dotenv");
config();
const fs = require("fs");
const pa = require("path");
const filename = pa.basename(__filename);
const args = require('yargs').argv;


// if set, grabs the value from the type variable when executed. sets default if not present

// create a variables from arguments
const path = args.path
const project = args.project
const bucket = args.bucket
const interval = args.interval

const type = args.type || "cloud-storage";
const exe = filename.match(/.*\.js/) ? `node ${filename}` : filename;

if (!path||!bucket) {
  console.error(`
    you must supply at least one source directory, and a gcs bucket name

    ${exe} --path=./path/to/local/file --bucket=gcs-bucket-name
    ${exe} --path=./path/to/local/file --path=./path/to/local/another/file.txt --bucket=gcs-bucket-name
    ${exe} --path=./path/to/local/file --bucket=gcs-bucket-name --interval=900
    `);
  process.exit(1);
}


// import local modules
const auth = require("./src/google-auth/auth")
const cloudStorage = require("./src/cloud-storage/upload-to-bucket");
const metadata = require("./src/cloud-storage/get-metadata");
const storageTransferService = require("./src/storage-transfer-service/posix-request");

// function to upload file to a bucket
async function upload(bucket, localPathToFile) {
  const localFileName = localPathToFile.match(/\/(.*)$/)[1];
  const localFileStats = fs.statSync(localPathToFile);
  const fileSizeInGb = localFileStats.size / (1024 * 1024 * 1024);
  const bucketStatus = await metadata.getBucketMetadata(bucket);

  // check if gcs bucket exists
  if (bucketStatus) {
    // invoke getFileMetadata function to check if the md5 hash for the local file
    // matches the md5 hash of the object in the gcs bucket
    const fileStatus = await metadata.getFileMetadata(bucket, localPathToFile, localFileName);
    if (fileStatus !== "matches") {
      if (type === "transfer-service") {
        console.log("this feature is disabled at this time");
        process.exit(0);
      } else {
        cloudStorage.uploadFile(bucket, localPathToFile, localFileName);
      }
    }
  } else {
    console.log("bucket doesn't exist");
  }
}

// main function that watches a local directory or files for changes, moves them to gcs
async function watchDirectory(path, bucket, interval) {
  console.log(`Watching ${path} for changes to send to ${bucket}. Polling interval: ${interval ? `${interval} seconds` : 'FS events'}.`);

  const watcher = chokidar.watch(path, {
    persistent: true,
    useFsEvents: !interval,
    usePolling: !!interval,
    interval: Number(interval),
  });

  watcher.on('change', p => upload(bucket, p));
  watcher.on('add', p => upload(bucket, p));
}

async function main() {
  await auth.googleAuth()
  await watchDirectory(path, bucket, interval);
}

main().catch(console.error);

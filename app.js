// module used to watch directories
const chokidar = require("chokidar");
const { config } = require("dotenv");
config();
const fs = require("fs");
const path = require("path");
const filename = path.basename(__filename);

// if set, grabs the value from the interval variable when executed
const interval = process.env.interval;

// if set, grabs the value from the type variable when executed. sets default if not present
const type = process.env.type || "cloud-storage";

// create a variable from arguments
const [dir, bucketName, sourceAgentPoolName] = process.argv.slice(2);
const exe = filename.match(/.*\.js/) ? `node ${filename}` : filename;

if (!dir || !bucketName) {
  console.error(`
    you must supply both a source directory and a gcs bucket name
    
    ${exe} ./path/to/local/file gcs-bucket-name
    interval=300 ${exe} ./path/to/local/file gcs-bucket-name
    `);
  process.exit(1);
}

const projectId = sourceAgentPoolName
  ? sourceAgentPoolName.match(/projects\/(.*?)\/.*/)[1]
  : "";

const cloudStorage = require("./src/cloud-storage/upload-to-bucket");
const metadata = require("./src/cloud-storage/get-metadata");
const storageTransferService = require("./src/storage-transfer-service/posix-request");

async function upload(bucketName, localPathToFile) {
  const localFileName = localPathToFile.match(/\/(.*)$/)[1];
  const localFileStats = fs.statSync(localPathToFile);
  const fileSizeInGb = localFileStats.size / (1024 * 1024 * 1024);
  const bucketStatus = await metadata.getBucketMetadata(bucketName);

  if (bucketStatus) {
    const fileStatus = await metadata.getFileMetadata(bucketName, localPathToFile, localFileName);
    if (fileStatus !== "matches") {
      if (type === "transfer-service") {
        console.log("this feature is disabled at this time");
        process.exit(0);
      } else {
        cloudStorage.uploadFile(bucketName, localPathToFile, localFileName);
      }
    }
  } else {
    console.log("bucket doesn't exist");
  }
}

// main function that watches a local directory or files for changes, moves them to gcs
async function watchDirectory(dir, bucketName, interval) {
  console.log(`Watching ${dir} for changes to send to ${bucketName}. Polling interval: ${interval ? `${interval} seconds` : 'FS events'}.`);
  const watcher = chokidar.watch(dir, {
    persistent: true,
    useFsEvents: !interval,
    usePolling: !!interval,
    interval: Number(interval),
  });

  watcher.on('change', path => upload(bucketName, path));
  watcher.on('add', path => upload(bucketName, path));
}

async function main() {
  await watchDirectory(dir, bucketName, interval);
}

main().catch(console.error);
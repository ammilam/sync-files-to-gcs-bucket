// module used to watch directories
const chokidar = require('chokidar');
require('dotenv').config();
var fs = require("fs");
var path = require('path');
var filename = path.basename(__filename);

// if set, grabs the value from the interval variable when executed
let interval = process.env.interval

// if set, grabs the value from the type variable when executed. sets default if not present
let type = process.env.type ? process.env.type : "cloud-storage"

// create a variable from arguments
var args = process.argv.slice(2)
let dir = args[0]
let bucketName = args[1]
let sourceAgentPoolName = args[2]
let exe = filename.match(/.*\.js/) ? `node ${filename}` : filename


if (args.length == 0) {
  console.error(`
  You must pass in at least two arguments

  Usage:

    Cloud Storage:
      interval=300 ${exe} ./path/to/local/file gcs-bucket-name
      type=cloud-storage ${exe} ./path/to/local/file gcs-bucket-name

    Storage Transfer Service:
      type=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name projects/gcp-project-id-1234/agentPools/default
      `)

  process.exit(1)
}

// make sure if 'type' variable is set that the input is valid
if (!type.match(/cloud\-storage|transfer\-service/)) {
  console.error(`
    you must set the 'type' variable to either cloud-storage or transfer-service
    type=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name projects/gcp-project-id-1234/agentPools/default
    `)
  process.exit(1)
}


if (type.match(/transfer-service/) && !sourceAgentPoolName) {
  console.error(`
    when using storage transfer service, a storage agent pool name must be passed in
    type=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name projects/gcp-project-id-1234/agentPools/default
  `)
  process.exit(1)
}

// if arguments aren't passed in, exit
if (!dir || !bucketName) {
  console.error(`
    you must supply both a source directory and a gcs bucket name
    interval=300 ${exe} ./path/to/local/file gcs-bucket-name
    `)
  process.exit(1)
}

let projectId = sourceAgentPoolName ? sourceAgentPoolName.match(/projects\/(.*?)\/.*/)[1] : ""


// import local modules and their functions
let cloudStorage = require('./src/cloud-storage/upload-to-bucket')
let metadata = require('./src/cloud-storage/get-metadata')
let storageTransferService = require('./src/storage-transfer-service/posix-request')

async function switchUpload(bucketName, localPathToFile, localFileName, projectId, sourceAgentPoolName) {
  switch (true) {
    case type == "transfer-service":
      storageTransferService.createStorageTransferRequest(localPathToFile, bucketName, projectId, sourceAgentPoolName);
      break;
    default:
      cloudStorage.uploadFile(bucketName, localPathToFile, localFileName)
  }
}

async function upload(bucketName, localPathToFile) {
  let localFileName = localPathToFile.match(/\/(.*)$/)[1]

  var localFileStats = fs.statSync(localPathToFile)
  var fileSizeInGb = localFileStats.size / (1024 * 1024 * 1024);

  let bucketStatus = await metadata.getBucketMetadata(bucketName)

  if (bucketStatus) {
    let fileStatus = await metadata.getFileMetadata(bucketName, localPathToFile, localFileName)
    switch (true) {
      case fileStatus === "matches":
        // do nothing;
        break;
      default:
        switchUpload(bucketName, localPathToFile, localFileName, projectId, sourceAgentPoolName)
    }
  } else {
    console.log("bucket doesn't exist")
  }
}

// main function that watches a local directory or files for changes, moves them to gcs
function main() {
  console.log(`watching ${dir} for changes to send to ${bucketName}${interval ? `will poll every ${interval} seconds` : ""}`)
  const watcher = chokidar.watch(dir, {
    persistent: true,
    useFsEvents: interval ? false : true,
    usePolling: interval ? true : false,
    interval: Number(interval),
  });

  // One-liner for current directory
  watcher
    .on('change', path => {
      upload(bucketName, path)
    })
    .on('add', path => {
      upload(bucketName, path)
    })


}

// start app
main()

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
let projectId = args[2]
let sourceAgentPoolName = args[3]
let exe = filename.match(/.*\.js/) ? `node ${filename}` : filename


if (args.length == 0) {
  console.error(`

  You must pass in at least two arguments

  Usage:

    Cloud Storage:
      interval=300 ${exe} ./path/to/local/file gcs-bucket-name
      type=cloud-storage ${exe} ./path/to/local/file gcs-bucket-name

    Storage Transfer Service:
        type=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name gcp-project-id-1234 projects/gcp-project-id-1234/agentPools/transfer_service_default
        `)

  process.exit(1)
}

// make sure if 'type' variable is set that the input is valid
if (!type.match(/cloud\-storage|transfer\-service/)) {
  console.error("you must set the 'type' variable to either cloud-storage or transfer-service")
  console.error(`\ntype=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name gcp-project-id-1234 projects/gcp-project-id-1234/agentPools/transfer_service_default`)
  process.exit(1)
}


if (type.match(/transfer-service/) && !(projectId == "" || sourceAgentPoolName == "")) {
  console.error("when using storage transfer service, a project id must be passed in as the 3rd argument and storage agent pool name must be passed in on the 4th")
  console.error(`\ntype=transfer-service interval=300 ${exe} ./path/to/local/file gcs-bucket-name gcp-project-id-1234 projects/gcp-project-id-1234/agentPools/transfer_service_default`)

  process.exit(1)
}

// if arguments aren't passed in, exit
if (!dir || !bucketName) {
  console.error("you must supply both a source directory and a gcs bucket name")
  console.error(`interval=300 ${exe} ./path/to/local/file gcs-bucket-name`)
  process.exit(1)
}

// import local modules and their functions
let cloudStorage = require('./src/cloud-storage/upload-to-bucket')
let metadata = require('./src/cloud-storage/get-metadata')
let storageTransferService = require('./src/storage-transfer-service/posix-request')

async function switchUpload(bucketName, localPathToFile, localFileName, projectId, sourceAgentPoolName) {
  switch (true) {
    case type.match(/transfer\-service/):
      storageTransferService.createStorageTransferRequest();
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

    if (fileStatus === "matches") {

      // do nothing
    } else if (fileStatus == "no-match") {
      switchUpload(bucketName, localPathToFile, localFileName, projectId, sourceAgentPoolName)
      cloudStorage.uploadFile(bucketName, localPathToFile, localFileName)
    } else {
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

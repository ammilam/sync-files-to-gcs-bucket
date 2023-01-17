// module used to watch directories
const chokidar = require('chokidar');

// create a variable from arguments
var args = process.argv.slice(2)
let dir = args[0]
let bucketName = args[1]

// if arguments aren't passed in, exit
if (!(dir || bucketName)) {
  console.error("you must supply both a source directory and a gcs bucket name")
  process.exit(1)
}

// import local modules and their functions
let cloudStorage = require('./cloud-storage')
let metadata = require('./get-metadata')

async function upload(bucketName, localPathToFile) {
  let localFileName = localPathToFile.match(/\/(.*)$/)[1]

  let bucketStatus = await metadata.getBucketMetadata(bucketName)

  if (bucketStatus) {

    let fileStatus = await metadata.getFileMetadata(bucketName, localPathToFile, localFileName)

    if (fileStatus === "matches") {
      // do nothing
    } else if (fileStatus == "no-match") {
      cloudStorage.uploadFile(bucketName, localPathToFile, localFileName)
    } else {
      cloudStorage.uploadFile(bucketName, localPathToFile, localFileName)
    }
  } else {
    console.log("bucket doesn't exist")
  }
}

// main function that watches a local directory or files for changes, moves them to gcs
function main() {
  console.log(`watching ${dir} for changes to send to ${bucketName}`)
  const watcher = chokidar.watch(dir, {
    persistent: true
  });

  // One-liner for current directory
  watcher
    .on('change', path => {
      upload(bucketName, path)
    })
}

// start app
main()


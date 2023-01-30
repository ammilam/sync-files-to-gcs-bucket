async function createStorageTransferRequest(rootDirectory, gcsSinkBucket, projectId, sourceAgentPoolName) {

    // Imports the Google Cloud client library
    const {
        StorageTransferServiceClient,
    } = require('@google-cloud/storage-transfer');

    // Creates a client
    const client = new StorageTransferServiceClient();
    let maxRetryDelayMillis = 60000
    let options = {
      retry: {
        backoffSettings: {
          maxRetryDelayMillis,
        },
      },
    };
    /**
     * Creates a request to transfer from the local file system to the sink bucket
     */
    async function transferDirectory() {
        const createRequest = {
            transferJob: {
                projectId,
                transferSpec: {
                    sourceAgentPoolName,
                    posixDataSource: {
                        rootDirectory,
                    },
                    gcsDataSink: { bucketName: gcsSinkBucket },
                },
                status: 'ENABLED',
            },
        };

        // Runs the request and creates the job
        const [transferJob] = await client.createTransferJob(createRequest);

        const runRequest = {
            jobName: transferJob.name,
            projectId: projectId,
            options
        };

        await client.runTransferJob(runRequest);

        console.log(
            `Created and ran a transfer job from '${rootDirectory}' to '${gcsSinkBucket}' with name ${transferJob.name}`
        );
    }

    transferDirectory();
    // [END storagetransfer_transfer_from_posix]
}

module.exports.createStorageTransferRequest = createStorageTransferRequest

process.on('unhandledRejection', err => {
    console.error(err.message);
    process.exitCode = 1;
});
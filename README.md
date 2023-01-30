# Sync Local Directory To Google Cloud Storage Bucket

This solution is intended to be used to sync files created or updated inside of a local directory to a GCS Bucket. 

## Usage

Download the latest zip file containing binaries from the Release and execute the appropriate binary based off the system architecture. The executeable accepts the following arguments

- arg 1 => (required) path to the local directory to sync files from
- arg 2 => (required) gcs bucket name
- arg 3 => (required if using storage transfer service) if using storage transfer service, a source agent pool name must be specified

```
# on mac os, no interval is required as it responds to file system events
./sync-dir-to-bucket-* ./path/to/local/dir gcs-bucket-name 

# for other os
interval=300 type=cloud-storage ./sync-dir-to-bucket-* ./path/to/local/dir gcs-bucket-name

# when using storage transfer service
interval=300 type=transfer-service ./path/to/local/file gcs-bucket-name projects/gcp-project-id-1234/agentPools/default
```

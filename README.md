# Sync Local Directory To Google Cloud Storage Bucket

This solution is intended to be used to sync files created or updated inside of a local directory to a GCS Bucket. 

## Usage

Download the latest [zip](ammilam/sync-local-dir-to-gcs-bucket/releases/latest/download/sync-dir-to-bucket.zip) containing binaries from the Release and execute the appropriate binary based off the system architecture. The executeable accepts the following arguments

- arg 1 => (required) path to the local directory to sync files from
- arg 2 => (required) gcs bucket name

```
# on mac os, no interval is required as it responds to file system events
./sync-dir-to-bucket-* ./path/to/local/dir gcs-bucket-name 

# for other os
interval=300 ./sync-dir-to-bucket-* ./path/to/local/dir gcs-bucket-name
```

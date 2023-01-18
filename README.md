# Sync Local Directory To Google Cloud Storage Bucket

This solution is intended to be used to sync files created or updated inside of a local directory to a GCS Bucket. 

## Usage

Download the latest zip file containing binaries from the Release and execute the appropriate binary based off the system architecture. The executeable accepts the following arguments

- arg 1 => path to the local directory to sync files from
- arg 2 => gcs bucket name
- arg 3 => sets the polling interval, this is optional for Macs

```
./sync-dir-to-bucket-* ./path/to/local/dir gcs-bucket-name 30 

```

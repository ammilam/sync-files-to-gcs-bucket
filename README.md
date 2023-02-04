# Sync Local Directory To Google Cloud Storage Bucket

This solution is intended to be used to sync files created or updated inside of a local or nfs filesystem to a GCS Bucket.

## Prerequisites

### Auth

Users and automated systems needing to execute this application will need to be authenticated to GCP either by setting the application-default credentials, or by exporting a service account json key to `GOOGLE_APPLICATION_CREDENTIALS`. See below for examples.

#### Application Default Credentials

```bash
# login with application-default credentials
gcloud auth application-default login
```

#### Service Account JSON Key

```bash
# authenticate using a service account json key
export GOOGLE_APPLICATION_CREDENTIALS=./key/to/service/account.json
```

## Usage

Download the [zip](https://github.com/ammilam/sync-local-dir-to-gcs-bucket/releases/latest/download/sync-dir-to-bucket.zip) containing executables from the latest Release and execute the appropriate binary based off the system architecture. This application accepts the following flags:

- path => (required) path to the local file or directory to sync to gcp, multiple can be specified
- bucket => (required) google projectId
- interval => (optional) sets the interval in seconds to poll the directory for changes

```bash
# on mac os, no interval is required as it responds to file system events
./sync-to-bucket  --path=./path/to/local/dir --bucket=gcs-bucket-name

# for other os
./sync-to-bucket --path=./path/to/local/dir --bucket=gcs-bucket-name --interval=900

# specifying multiple paths
./sync-to-bucket --path=./path/to/local/file --path=./path/to/another/file.txt --bucket=gcs-bucket-name --interval=900
```

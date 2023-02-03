# Sync Local Directory To Google Cloud Storage Bucket

This solution is intended to be used to sync files created or updated inside of a local directory to a GCS Bucket.

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
# authenticate using a service account JWT
export GOOGLE_APPLICATION_CREDENTIALS=./key/to/service/account.json
```

## Usage

Download the [zip](https://github.com/ammilam/sync-local-dir-to-gcs-bucket/releases/latest/download/sync-dir-to-bucket.zip) containing executables from the latest Release and execute the appropriate binary based off the system architecture. The executable accepts the following flags:

- dir => (required) path to the local directory to sync files from
- bucket => (required) google projectId
- interval => (optional) sets the interval in seconds to poll the directory for changes

```bash
# on mac os, no interval is required as it responds to file system events
./sync-dir-to-bucket-*  --dir=./path/to/local/file --bucket=gcs-bucket-name

# for other os
./sync-dir-to-bucket-* --dir=./path/to/local/file --bucket=gcs-bucket-name --interval=900
```

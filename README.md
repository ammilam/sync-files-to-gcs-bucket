# Sync To GCP

This repo is contains source code for a commandline utility that either monitors local or nfs filesystems for changes by interval based polling, or filesystem events depending on system architecture. Currently, this tool supports syncing a collection of files or contents of directories to a Google Cloud Storage Bucket, or an individual file's contents to a Google Secret Manager Secret as a new version. This tool will only sync changes when differences are detected between the copy in GCP and the local copy.

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

Download the [zip](https://github.com/ammilam/sync-local-dir-to-gcs-bucket/releases/latest/download/sync-dir-to-bucket.zip) containing executables from the latest Release and execute the appropriate binary based off the system architecture. Depending on the intended destination of the local file and/or its contents, refer to [Google Cloud Storage](#google-cloud-storage) or [Google Secret Manager](#google-secret-manager-secret).

### Google Cloud Storage

When syncing to Google Cloud Storage, the following flags are supported:

- path => (required) path to the local file or directory to sync to gcp, multiple can be specified
- bucket => (required) google projectId
- interval => (optional) sets the interval in seconds to poll the directory for changes
- type => (optional) accepts either cloud-storage or secret-manager

```bash
#########################
## -type=cloud-storage ##
#########################
# on mac os, no interval is required as it responds to file system events
./sync-to-gcp  --path=./path/to/local/dir --bucket=gcs-bucket-name

# for other os
./sync-to-gcp --path=./path/to/local/dir --bucket=gcs-bucket-name --interval=900

# specifying multiple paths
./sync-to-gcp --path=./path/to/local/file.txt --path=./path/to/another/file.txt --bucket=gcs-bucket-name --interval=900

```

### Google Secret Manager Secret

When syncing to a Google Secret Manager Secret, the following flags are supported:

- path => (required) path to a single local file, directories are not supported
- secret => (required for secret-manager) a secret manager secret name
- project => (required for secret-manager) the google project id containing the secret manager secret
- interval => (optional) sets the interval in seconds to poll the directory for changes
- type => (optional) accepts either cloud-storage or secret-manager

```bash
##########################
## -type=secret-manager ##
##########################
# only accepts files, not folders
./sync-to-gcp --path=./path/to/cert.pem --secret=private-key --project=a-gcp-project-1234
```
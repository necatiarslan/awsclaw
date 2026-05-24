# Aws Claw: S3 Guide

Aws Claw provides two tools for Amazon S3: **S3Tool** for bucket and object management, and **S3FileOperationsTool** for bulk file/folder transfers. You can also open an interactive **S3 Explorer** UI directly in VS Code.

---

## 🪣 S3Tool

### Object Operations

| Command | Description |
|---|---|
| `ListBuckets` | List all S3 buckets in the account |
| `ListObjectsV2` | List objects with prefix/delimiter filtering and pagination |
| `ListObjectVersions` | List object versions in a versioning-enabled bucket |
| `HeadBucket` | Check if a bucket exists and you have access |
| `HeadObject` | Get object metadata without downloading |
| `GetObject` | Download or read object content |
| `PutObject` | Upload content to an S3 object |
| `DeleteObject` | Delete an object or a specific version |
| `CopyObject` | Copy an object within or between buckets |
| `SelectObjectContent` | Query CSV/JSON/Parquet content using SQL |
| `GetObjectAttributes` | Get specific object attributes (size, ETag, storage class, etc.) |
| `GetObjectLegalHold` | Get the legal hold status of an object |
| `GetObjectRetention` | Get the retention settings of an object |

#### Example: List buckets

```json
{ "command": "ListBuckets", "params": {} }
```

#### Example: List objects in a folder

```json
{
  "command": "ListObjectsV2",
  "params": { "Bucket": "my-bucket", "Prefix": "data/", "Delimiter": "/", "MaxKeys": 100 }
}
```

#### Example: Read a file as text

```json
{
  "command": "GetObject",
  "params": { "Bucket": "my-bucket", "Key": "config.json", "AsText": true }
}
```

`GetObject` options:
- `AsText: true` — return content as UTF-8 text
- `DownloadToTemp: true` — download to system temp folder and return the local path
- Neither — return base64-encoded content

#### Example: Upload content

```json
{
  "command": "PutObject",
  "params": {
    "Bucket": "my-bucket",
    "Key": "data/output.json",
    "Body": "{\"status\":\"ok\"}",
    "ContentType": "application/json"
  }
}
```

#### Example: Copy an object

```json
{
  "command": "CopyObject",
  "params": {
    "Bucket": "dest-bucket",
    "Key": "archive/file.txt",
    "CopySource": "/source-bucket/data/file.txt"
  }
}
```

#### Example: Query a CSV file with S3 Select

```json
{
  "command": "SelectObjectContent",
  "params": {
    "Bucket": "my-bucket",
    "Key": "users.csv",
    "Expression": "SELECT * FROM s3object s WHERE s.age > 30",
    "ExpressionType": "SQL",
    "InputSerialization": { "CSV": { "FileHeaderInfo": "USE" } },
    "OutputSerialization": { "JSON": {} }
  }
}
```

---

### Bucket Configuration

#### Read Configuration

| Command | Description |
|---|---|
| `GetBucketLocation` | Get the region where a bucket is located |
| `GetBucketVersioning` | Get versioning state |
| `GetBucketEncryption` | Get default encryption configuration |
| `GetBucketLifecycleConfiguration` | Get lifecycle rules |
| `GetBucketReplication` | Get cross-region replication settings |
| `GetBucketLogging` | Get server access logging configuration |
| `GetBucketTagging` | Get bucket tags |
| `GetBucketCors` | Get CORS configuration |
| `GetBucketWebsite` | Get static website hosting configuration |
| `GetBucketAccelerateConfiguration` | Get transfer acceleration settings |
| `GetBucketRequestPayment` | Get requester-pays configuration |
| `GetBucketPolicy` | Get bucket policy JSON |
| `GetBucketNotificationConfiguration` | Get event notification targets (SNS/SQS/Lambda) |

#### Write Configuration

| Command | Description |
|---|---|
| `CreateBucket` | Create a new bucket |
| `DeleteBucket` | Delete an empty bucket |
| `PutBucketVersioning` | Enable or suspend versioning |
| `PutBucketEncryption` | Set default encryption |
| `PutBucketLifecycleConfiguration` | Set lifecycle rules |
| `PutBucketReplication` | Configure cross-region replication |
| `PutBucketLogging` | Configure server access logging |
| `PutBucketTagging` | Set bucket tags |
| `PutBucketCors` | Configure CORS |
| `PutBucketWebsite` | Configure static website hosting |
| `PutBucketPolicy` | Set a bucket policy |
| `PutBucketNotificationConfiguration` | Configure event notifications |
| `PutBucketAccelerateConfiguration` | Enable transfer acceleration |
| `PutPublicAccessBlock` | Configure public access blocking |
| `DeleteBucketPolicy` | Remove bucket policy |
| `DeleteBucketTagging` | Remove bucket tags |
| `DeleteBucketWebsite` | Disable website hosting |
| `DeleteBucketCors` | Remove CORS configuration |
| `DeleteBucketLifecycle` | Remove lifecycle rules |
| `DeleteBucketReplication` | Remove replication configuration |

#### Object Tagging and Access

| Command | Description |
|---|---|
| `PutObjectTagging` | Set tags on an object |
| `DeleteObjectTagging` | Remove tags from an object |
| `PutObjectAcl` | Set object access control |
| `PutObjectLegalHold` | Set legal hold on an object |
| `PutObjectRetention` | Set retention settings on an object |

#### Example: Enable versioning

```json
{
  "command": "PutBucketVersioning",
  "params": {
    "Bucket": "my-bucket",
    "VersioningConfiguration": { "Status": "Enabled" }
  }
}
```

#### Example: Set default encryption (AES-256)

```json
{
  "command": "PutBucketEncryption",
  "params": {
    "Bucket": "my-bucket",
    "ServerSideEncryptionConfiguration": {
      "Rules": [{ "ApplyServerSideEncryptionByDefault": { "SSEAlgorithm": "AES256" } }]
    }
  }
}
```

#### Example: Set a bucket policy

```json
{
  "command": "PutBucketPolicy",
  "params": {
    "Bucket": "my-bucket",
    "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":[\"s3:GetObject\"],\"Resource\":[\"arn:aws:s3:::my-bucket/*\"]}]}"
  }
}
```

---

### S3 Explorer UI

Open an interactive file browser for any bucket directly in VS Code.

```json
{
  "command": "OpenS3Explorer",
  "params": { "Bucket": "my-bucket", "Prefix": "data/" }
}
```

The S3 Explorer supports:
- Breadcrumb navigation with Go Home / Go Up
- Search/filter by filename
- Auto-refresh every 15 seconds
- Preview, download, upload, delete, rename, copy, and move files
- Sort by name, type, modified date, or size
- Copy S3 URI (`s3://`), HTTPS URL, ARN, and object key to clipboard
- View object metadata, content type, and custom metadata

---

## 📂 S3FileOperationsTool

For bulk file and folder transfers with folder structure preservation.

### Commands

#### UploadFile — upload one or more files

```json
{
  "command": "UploadFile",
  "params": {
    "Bucket": "my-bucket",
    "LocalPaths": ["/home/user/report.csv", "/home/user/summary.txt"],
    "S3KeyPrefix": "reports/2025/",
    "ContentType": "text/csv"
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `Bucket` | Yes | S3 bucket name |
| `LocalPaths` | Yes | Array of local file paths |
| `S3KeyPrefix` | No | Destination folder prefix in S3 |
| `ContentType` | No | MIME type (auto-detected if omitted) |

Content type is auto-detected for 40+ extensions (images, documents, archives, media, code). Falls back to `application/octet-stream` for unknown types.

#### DownloadFile — download one or more files

```json
{
  "command": "DownloadFile",
  "params": {
    "Bucket": "my-bucket",
    "S3Keys": ["data/2025/jan.csv", "data/2025/feb.csv"],
    "LocalDirectory": "/home/user/downloads",
    "PreserveStructure": true
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `Bucket` | Yes | S3 bucket name |
| `S3Keys` | Yes | Array of S3 object keys |
| `LocalDirectory` | Yes | Local destination directory |
| `PreserveStructure` | No | Preserve the S3 folder structure locally |

#### UploadFolder — upload a local folder recursively

```json
{
  "command": "UploadFolder",
  "params": {
    "Bucket": "my-bucket",
    "LocalPaths": ["/home/user/project"],
    "S3KeyPrefix": "backups/",
    "PreserveStructure": true
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `Bucket` | Yes | S3 bucket name |
| `LocalPaths` | Yes | Array of local folder paths |
| `S3KeyPrefix` | No | Destination folder prefix in S3 |
| `PreserveStructure` | No | Preserve directory structure in S3 |

#### DownloadFolder — download an S3 prefix/folder

```json
{
  "command": "DownloadFolder",
  "params": {
    "Bucket": "my-bucket",
    "S3KeyPrefixes": ["data/2024/", "data/2025/"],
    "LocalDirectory": "/home/user/downloads",
    "PreserveStructure": true
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `Bucket` | Yes | S3 bucket name |
| `S3KeyPrefixes` | Yes | Array of S3 prefixes to download |
| `LocalDirectory` | Yes | Local destination directory |
| `PreserveStructure` | No | Preserve the S3 folder structure locally |

Large prefixes are automatically paginated.

---

## 💬 Example Natural Language Prompts

- *"List all my S3 buckets"*
- *"Show me the objects in my-bucket under the data/ prefix"*
- *"Download config.json from my-bucket and show me its contents"*
- *"Upload all CSV files in /home/user/reports to my-bucket under reports/2025/"*
- *"Enable versioning on my-bucket"*
- *"What encryption is configured on my-bucket?"*
- *"Query users.csv in my-bucket and return rows where age > 30"*
- *"Open the S3 Explorer for my-bucket"*
- *"What lifecycle rules are set on my-bucket?"*
- *"Download the entire data/2025/ prefix from my-bucket to /tmp/data"*

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **SNS / SQS / Lambda** | Use `GetBucketNotificationConfiguration` to view event triggers |
| **CloudTrail** | S3 data events are logged and viewable in CloudWatch Logs |
| **Glue** | Glue crawlers catalog S3 data; ETL jobs read and write S3 |
| **EMR** | EMR clusters use S3 via EMRFS for input/output data |
| **CloudFormation** | S3 buckets and configurations managed via stacks |
| **IAM** | Bucket/object policies control access — use `SimulatePrincipalPolicy` to test permissions |

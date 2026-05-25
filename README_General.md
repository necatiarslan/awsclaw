# Aws Claw: General Guide

This guide covers Aws Claw extension setup, credential management, session configuration, local file operations, and cross-service navigation patterns.

---

## 🗂️ Use Cases

- **Initial setup**: connect Aws Claw to your AWS account and verify credentials
- **Profile switching**: switch between multiple AWS profiles (dev, staging, prod) without leaving VS Code
- **Region switching**: change the active region for all subsequent AWS operations
- **Custom endpoints**: point Aws Claw at LocalStack or a compatible S3 endpoint for local development
- **Credential refresh**: refresh credentials after `aws sso login` or key rotation
- **Local file operations**: read, write, and zip local files as part of a workflow (e.g., package Lambda code)
- **Cross-service discovery**: navigate from one service to related resources in other services

---

## 💬 Sample Prompts

- *"What AWS profile and region am I currently using?"*
- *"Switch to the production profile in us-west-2"*
- *"List all available AWS profiles"*
- *"Refresh my AWS credentials"*
- *"Test my AWS connection in us-east-1"*
- *"Set the endpoint to http://localhost:4566 for LocalStack"*
- *"Read the file /home/user/config.json"*
- *"Zip the /home/user/lambda-code folder"*
- *"List all files in the /home/user/project directory recursively"*

---

## 🔧 SessionTool Commands

Manage AWS profile, region, and endpoint settings.

| Command | Description |
|---|---|
| `GetSession` | Get the current profile, region, and endpoint |
| `SetSession` | Update profile, region, and/or endpoint |
| `ListProfiles` | List profiles from AWS config and credentials files |
| `RefreshCredentials` | Clear and reload cached credentials |

#### Example: Get current session

```json
{ "command": "GetSession", "params": {} }
```

#### Example: Switch profile and region

```json
{
  "command": "SetSession",
  "params": {
    "AwsProfile": "production",
    "AwsRegion": "us-west-2"
  }
}
```

#### Example: Set a custom endpoint (LocalStack)

```json
{
  "command": "SetSession",
  "params": { "AwsEndPoint": "http://localhost:4566" }
}
```

#### Example: List profiles

```json
{ "command": "ListProfiles", "params": {} }
```

#### Example: Refresh credentials after SSO login

```json
{ "command": "RefreshCredentials", "params": {} }
```

---

## 🔧 TestAwsConnectionTool

Test AWS connectivity using STS GetCallerIdentity.

```json
{ "region": "us-east-1" }
```

Returns `true` if the connection is successful.

---

## 🔧 FileOperationsTool Commands

Perform local file operations on your workspace.

| Command | Description |
|---|---|
| `ReadFile` | Read file content |
| `WriteFile` | Create or overwrite a file |
| `AppendFile` | Append content to a file |
| `ReadFileAsBase64` | Read file as base64 (useful for binary uploads) |
| `ReadFileStream` | Get file metadata without reading content |
| `GetFileInfo` | Get file stats (size, dates) |
| `ListFiles` | List directory contents |
| `ZipTextFile` | Create a zip archive of a file or directory |

#### Example: Read a local file

```json
{ "command": "ReadFile", "params": { "filePath": "/home/user/config.json" } }
```

#### Example: Write a file

```json
{
  "command": "WriteFile",
  "params": {
    "filePath": "/home/user/output.txt",
    "content": "Hello from Aws Claw",
    "overwrite": true
  }
}
```

#### Example: List files recursively

```json
{ "command": "ListFiles", "params": { "dirPath": "/home/user/project", "recursive": true } }
```

#### Example: Zip a folder (for Lambda deployment)

```json
{ "command": "ZipTextFile", "params": { "filePath": "/home/user/lambda-code" } }
```

---

## 🔐 How Credentials Work

Aws Claw uses the standard AWS SDK credential provider chain:

1. Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`)
2. AWS SSO — run `aws sso login` first, then `RefreshCredentials`
3. Shared credentials file (`~/.aws/credentials`)
4. Shared config file (`~/.aws/config`)

**Credentials are never sent to any AI service.** All API calls run locally.

---

## 🛡️ Safety Model

| Operation type | Behavior |
|---|---|
| List, describe, get, search, scan, query | Execute automatically (read-only, safe) |
| Put, post, upload, delete, create, update, copy, invoke, start, execute | Require user confirmation before running |
| Readonly mode | Block all write operations (enable via `SetAwsReadonlyMode`) |

---

## 🔍 Cross-Service Discovery Guide

### CloudWatch Log Group Patterns

| AWS Service | Log Group Pattern |
|---|---|
| Lambda | `/aws/lambda/{functionName}` |
| API Gateway | `API-Gateway-Execution-Logs_{restApiId}/{stageName}` |
| Glue Jobs | `/aws-glue/jobs/output` and `/aws-glue/jobs/error` |
| Glue Crawlers | `/aws-glue/crawlers` |
| RDS Instance | `/aws/rds/instance/{instanceId}/{logType}` |
| RDS Aurora | `/aws/rds/cluster/{clusterId}/{logType}` |
| ECS | `/ecs/{serviceName}` |
| Step Functions | `/aws/vendedlogs/states/{stateMachineName}-Logs` |
| CloudTrail | `aws-cloudtrail-logs-{accountId}-{hash}` |

### Service Navigation Map

| Starting Point | What to Look For | How to Navigate |
|---|---|---|
| Lambda function | Execution role | `GetFunctionConfiguration` → `Role` → `IAMTool` `GetRole` |
| Lambda function | Trigger sources | `LambdaTool` `ListEventSourceMappings` |
| Lambda function | Logs | `CloudWatchLogTool` — group `/aws/lambda/{functionName}` |
| EC2 instance | VPC/subnet/security group | Instance metadata contains `vpcId`, `subnetId`, `securityGroups` |
| EC2 instance | Attached volumes | `DescribeVolumes` filter: `attachment.instance-id` |
| API Gateway method | Lambda backend | `GetIntegration` → Lambda ARN |
| API Gateway | Execution logs | `CloudWatchLogTool` prefix `API-Gateway-Execution-Logs_` |
| Glue job | Job logs | `/aws-glue/jobs/output` in CloudWatch |
| RDS instance | Database logs | `DescribeDBLogFiles` or CloudWatch `/aws/rds/instance/...` |
| S3 bucket | Event notifications | `GetBucketNotificationConfiguration` → SNS/SQS/Lambda |
| CloudFormation stack | All managed resources | `DescribeStackResources` |
| SQS queue | Dead-letter queue | `GetQueueAttributes` → `RedrivePolicy` |
| Step Functions | Execution logs | CloudWatch `/aws/vendedlogs/states/{name}` |

# Aws Claw: Lambda Guide

Aws Claw exposes **LambdaTool** for managing AWS Lambda functions — invoking functions, inspecting configuration, updating code, managing event source mappings, aliases, versions, layers, and function URLs.

---

## 🗂️ Use Cases

- **Invoke and test**: call a Lambda function with a test payload and see the response or logs
- **Debug triggers**: list event source mappings to find which SQS, DynamoDB, or Kinesis streams trigger a function
- **Inspect configuration**: check runtime, memory, timeout, environment variables, and execution role
- **Deploy updates**: update function code from S3 or publish a new version
- **Traffic splitting**: create aliases pointing to specific versions for blue/green or canary deployments
- **Concurrency management**: set or remove reserved concurrency to control function scaling
- **Layer management**: publish and inspect Lambda layers (shared dependencies)
- **Permission audit**: inspect resource-based policies to see what can invoke the function

---

## 💬 Sample Prompts

- *"List all my Lambda functions"*
- *"What is the runtime, memory, and timeout for the payment-processor function?"*
- *"Invoke the hello-world function with payload {\"name\": \"test\"}"*
- *"What SQS queues trigger the order-handler function?"*
- *"Show me the environment variables for the api-handler function"*
- *"What IAM role does the data-processor function use?"*
- *"Update the code for my-function from s3://code-bucket/function.zip"*
- *"List all versions of the payment-processor function"*
- *"Create an alias named prod pointing to version 5 of payment-processor"*
- *"Set reserved concurrency to 50 for the image-resizer function"*
- *"What permissions does the api-handler function grant to other services?"*

---

## 🔧 LambdaTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListFunctions` | List all Lambda functions |
| `GetFunction` | Get function details including code location |
| `GetFunctionConfiguration` | Get runtime, handler, memory, timeout, env vars, role |
| `GetFunctionConcurrency` | Get reserved concurrency setting |
| `GetFunctionUrlConfig` | Get function URL configuration |
| `GetFunctionCodeSigningConfig` | Get code signing configuration |
| `GetPolicy` | Get resource-based policy (who can invoke) |
| `GetAccountSettings` | Get Lambda account-level limits |
| `ListAliases` | List aliases for a function |
| `GetAlias` | Get a specific alias |
| `ListVersionsByFunction` | List published versions |
| `ListEventSourceMappings` | List event source mappings (triggers) |
| `GetEventSourceMapping` | Get details of a specific trigger |
| `ListLayerVersions` | List versions of a Lambda layer |
| `ListTags` | List tags for a function |

#### Example: Get function configuration

```json
{ "command": "GetFunctionConfiguration", "params": { "FunctionName": "payment-processor" } }
```

#### Example: List event source mappings (triggers)

```json
{ "command": "ListEventSourceMappings", "params": { "FunctionName": "order-handler" } }
```

#### Example: List all versions

```json
{ "command": "ListVersionsByFunction", "params": { "FunctionName": "payment-processor" } }
```

---

### Invoke

| Command | Description |
|---|---|
| `Invoke` | Invoke a function synchronously or asynchronously |

#### Example: Synchronous invocation with logs

```json
{
  "command": "Invoke",
  "params": {
    "FunctionName": "hello-world",
    "Payload": "{\"name\": \"Alice\"}",
    "InvocationType": "RequestResponse",
    "LogType": "Tail"
  }
}
```

`InvocationType` options:
- `RequestResponse` — synchronous, waits for result
- `Event` — asynchronous, returns immediately
- `DryRun` — validate permissions without invoking

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateFunction` | Create a new function |
| `UpdateFunctionCode` | Update function code from S3 or zip |
| `UpdateFunctionConfiguration` | Update runtime, memory, timeout, env vars |
| `DeleteFunction` | Delete a function |
| `CreateEventSourceMapping` | Add an event trigger (SQS, DynamoDB, Kinesis) |
| `CreateFunctionUrlConfig` | Create a function URL |
| `PutFunctionConcurrency` | Set reserved concurrency |
| `PublishVersion` | Publish a new version |
| `CreateAlias` | Create an alias pointing to a version |
| `UpdateAlias` | Update an alias |
| `DeleteAlias` | Delete an alias |
| `AddPermission` | Grant invocation permission to another service |
| `PublishLayerVersion` | Publish a new layer version |
| `TagResource` | Tag a function |
| `UntagResource` | Remove tags from a function |

#### Example: Update function code from S3

```json
{
  "command": "UpdateFunctionCode",
  "params": {
    "FunctionName": "payment-processor",
    "S3Bucket": "code-bucket",
    "S3Key": "builds/payment-processor-v2.zip",
    "Publish": true
  }
}
```

#### Example: Create prod alias pointing to version 5

```json
{
  "command": "CreateAlias",
  "params": {
    "FunctionName": "payment-processor",
    "Name": "prod",
    "FunctionVersion": "5"
  }
}
```

#### Example: Grant SNS permission to invoke the function

```json
{
  "command": "AddPermission",
  "params": {
    "FunctionName": "order-handler",
    "StatementId": "sns-invoke",
    "Action": "lambda:InvokeFunction",
    "Principal": "sns.amazonaws.com",
    "SourceArn": "arn:aws:sns:us-east-1:123456789012:orders-topic"
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **CloudWatch Logs** | Every function writes to `/aws/lambda/{functionName}` — use `CloudWatchLogTool` |
| **SQS / SNS / DynamoDB** | Use `ListEventSourceMappings` to find trigger sources |
| **API Gateway** | API Gateway integrations invoke Lambda — use `APIGatewayTool` `GetIntegration` |
| **IAM** | Find the execution role via `GetFunctionConfiguration` → `Role` field |
| **Step Functions** | Lambda is commonly a task state in Step Functions workflows |
| **CloudFormation** | Functions managed by SAM/CloudFormation — use `CloudFormationTool` |

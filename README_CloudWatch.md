# Aws Claw: CloudWatch Logs Guide

Aws Claw exposes **CloudWatchLogTool** for querying and managing CloudWatch log groups and streams — searching events, running Insights queries, inspecting metric filters and subscriptions, and opening the interactive log viewer.

---

## 🗂️ Use Cases

- **Lambda debugging**: find error logs for a Lambda function by log group and filter for `ERROR`
- **API Gateway troubleshooting**: search execution logs for failed requests or status codes
- **Glue job monitoring**: read output and error logs for ETL job runs
- **RDS log inspection**: read database error or slow query logs published to CloudWatch
- **Insights analytics**: run SQL-like queries across log groups to count errors, measure latency, or find patterns
- **Alert setup**: create metric filters to generate CloudWatch metrics from log patterns
- **Log shipping**: configure subscription filters to stream logs to Kinesis or Lambda
- **Retention management**: set retention policies to control log storage costs

---

## 💬 Sample Prompts

- *"Show me the recent logs for the payment-processor Lambda function"*
- *"Search the api-handler logs for any ERROR messages in the last hour"*
- *"What log groups exist for my Glue jobs?"*
- *"Run a CloudWatch Insights query to count errors by function over the last 24 hours"*
- *"What is the retention policy on the /aws/lambda/payment-processor log group?"*
- *"Open the CloudWatch Log Viewer for /aws/lambda/order-handler"*
- *"List all metric filters for the /aws/lambda/payment-processor log group"*
- *"What subscription filters are on the /aws/lambda/payment-processor log group?"*
- *"Set retention to 30 days on the /aws/lambda/old-function log group"*
- *"Create a metric filter on the api logs that counts HTTP 500 responses"*

---

## 🔧 CloudWatchLogTool Commands

### Read Operations

| Command | Description |
|---|---|
| `DescribeLogGroups` | List log groups with optional prefix filter |
| `DescribeLogStreams` | List streams in a log group (sortable by last event time) |
| `GetLogEvents` | Get events from a specific log stream |
| `FilterLogEvents` | Search across streams in a log group using a filter pattern |
| `StartQuery` | Start a CloudWatch Insights query |
| `GetQueryResults` | Get results from a running or completed Insights query |
| `GetLogGroupFields` | Discover fields available in a log group |
| `DescribeMetricFilters` | List metric filters for a log group |
| `DescribeQueryDefinitions` | List saved Insights query definitions |
| `DescribeSubscriptionFilters` | List subscription filters for a log group |
| `DescribeDestinations` | List log destinations |
| `OpenCloudWatchLogView` | Open the interactive log viewer in VS Code |

#### Example: Find Lambda log groups

```json
{ "command": "DescribeLogGroups", "params": { "logGroupNamePrefix": "/aws/lambda/", "limit": 50 } }
```

#### Example: Get most recent streams in a log group

```json
{
  "command": "DescribeLogStreams",
  "params": {
    "logGroupName": "/aws/lambda/payment-processor",
    "orderBy": "LastEventTime",
    "descending": true,
    "limit": 5
  }
}
```

#### Example: Search logs for errors

```json
{
  "command": "FilterLogEvents",
  "params": {
    "logGroupName": "/aws/lambda/payment-processor",
    "filterPattern": "ERROR"
  }
}
```

#### Example: Run a CloudWatch Insights query

```json
{
  "command": "StartQuery",
  "params": {
    "logGroupName": "/aws/lambda/payment-processor",
    "queryString": "fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 20",
    "startTime": 1704067200000,
    "endTime": 1704153600000
  }
}
```

Then retrieve results:

```json
{ "command": "GetQueryResults", "params": { "queryId": "<queryId from StartQuery>" } }
```

#### Example: Open the log viewer

```json
{
  "command": "OpenCloudWatchLogView",
  "params": { "logGroupName": "/aws/lambda/payment-processor" }
}
```

---

### Write Commands

| Command | Description |
|---|---|
| `CreateLogGroup` | Create a log group |
| `CreateLogStream` | Create a log stream |
| `PutLogEvents` | Write events to a log stream |
| `PutRetentionPolicy` | Set retention period (days) |
| `PutMetricFilter` | Create or update a metric filter |
| `PutSubscriptionFilter` | Create or update a subscription filter |
| `PutResourcePolicy` | Create or update a resource policy |
| `DeleteLogGroup` | Delete a log group |
| `DeleteLogStream` | Delete a log stream |
| `DeleteMetricFilter` | Delete a metric filter |
| `DeleteSubscriptionFilter` | Delete a subscription filter |
| `DeleteRetentionPolicy` | Remove retention policy (reverts to Never Expire) |
| `DeleteResourcePolicy` | Delete a resource policy |
| `TagLogGroup` | Tag a log group |
| `UntagLogGroup` | Remove tags from a log group |

---

## 📋 Log Group Naming Conventions

| AWS Service | Log Group Pattern |
|---|---|
| **Lambda** | `/aws/lambda/{functionName}` |
| **API Gateway** | `API-Gateway-Execution-Logs_{restApiId}/{stageName}` |
| **Glue Jobs** | `/aws-glue/jobs/output` and `/aws-glue/jobs/error` |
| **Glue Crawlers** | `/aws-glue/crawlers` |
| **RDS Instance** | `/aws/rds/instance/{instanceId}/{logType}` |
| **RDS Aurora** | `/aws/rds/cluster/{clusterId}/{logType}` |
| **ECS** | `/ecs/{serviceName}` |
| **Step Functions** | `/aws/vendedlogs/states/{stateMachineName}-Logs` |
| **CloudTrail** | `aws-cloudtrail-logs-{accountId}-{hash}` |
| **AppSync** | `/aws/appsync/apis/{apiId}` |
| **CodeBuild** | `/aws/codebuild/{projectName}` |

---

## 📊 Useful Insights Query Examples

**Find errors across a function:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| sort @timestamp desc
| limit 50
```

**Count errors by log stream:**
```
stats count(*) as errorCount by @logStream
| filter @message like /ERROR/
| sort errorCount desc
```

**Lambda latency analysis:**
```
filter @type = "REPORT"
| stats avg(@duration) as avgDuration, max(@duration) as maxDuration by bin(1h)
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **Lambda** | Logs at `/aws/lambda/{functionName}` — use `LambdaTool` for function config |
| **API Gateway** | Execution logs at `API-Gateway-Execution-Logs_{id}/{stage}` |
| **Glue** | Job logs at `/aws-glue/jobs/output` — use `GlueTool` `GetJobRuns` to correlate |
| **RDS** | Database logs at `/aws/rds/instance/{id}/{type}` |
| **EC2** | VPC Flow Logs — use `EC2Tool` `DescribeFlowLogs` to find the log group |
| **Step Functions** | Execution logs at `/aws/vendedlogs/states/{name}` |

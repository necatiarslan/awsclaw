# Aws Claw: SQS Guide

Aws Claw exposes **SQSTool** for full Amazon SQS queue and message management — from inspecting queue attributes and dead-letter queues to sending, receiving, and deleting messages.

---

## 🗂️ Use Cases

- **Debug stuck messages**: inspect message counts and DLQ configuration on a queue
- **Manual testing**: send test messages to trigger downstream consumers (Lambda, EC2 workers)
- **Drain a queue**: receive and delete all messages from a non-production queue
- **Purge bad data**: clear a queue that received corrupted payloads
- **Investigate DLQ**: find which source queues feed a dead-letter queue and check their redrive policies
- **Manage FIFO ordering**: send messages to FIFO queues with message group IDs
- **Audit permissions**: inspect queue policies to verify cross-account or SNS access

---

## 💬 Sample Prompts

- *"List all my SQS queues starting with prod-"*
- *"How many messages are in the order-processing queue?"*
- *"Show me the attributes of the payments-queue including visibility timeout and retention period"*
- *"Send a test message to the notifications queue"*
- *"Receive up to 10 messages from the ingestion-queue"*
- *"What is the dead-letter queue configured for the orders-queue?"*
- *"Which queues use the failed-messages-dlq as their dead-letter queue?"*
- *"Purge all messages from the test-queue"*
- *"Create a new FIFO queue called jobs.fifo with a 30-second visibility timeout"*
- *"What tags are on the processing-queue?"*

---

## 🔧 SQSTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListQueues` | List queues with optional name prefix filter |
| `GetQueueUrl` | Get the URL for a queue by name |
| `GetQueueAttributes` | Get message counts, delay, visibility timeout, policy, DLQ config |
| `ListDeadLetterSourceQueues` | List queues that use a given queue as their DLQ |
| `ListQueueTags` | List tags on a queue |

#### Example: List queues by prefix

```json
{ "command": "ListQueues", "params": { "QueueNamePrefix": "prod-" } }
```

#### Example: Get all queue attributes

```json
{
  "command": "GetQueueAttributes",
  "params": {
    "QueueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue",
    "AttributeNames": ["All"]
  }
}
```

#### Example: Find source queues for a DLQ

```json
{
  "command": "ListDeadLetterSourceQueues",
  "params": { "QueueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/my-dlq" }
}
```

---

### Message Operations

| Command | Description |
|---|---|
| `SendMessage` | Send a single message |
| `SendMessageBatch` | Send up to 10 messages in one call |
| `ReceiveMessage` | Receive up to 10 messages (supports long polling) |
| `DeleteMessage` | Delete a message by receipt handle |
| `DeleteMessageBatch` | Delete up to 10 messages in one call |
| `ChangeMessageVisibility` | Extend or reduce visibility timeout of a received message |
| `ChangeMessageVisibilityBatch` | Change visibility for up to 10 messages |
| `PurgeQueue` | Delete all messages in a queue |

#### Example: Send a message

```json
{
  "command": "SendMessage",
  "params": {
    "QueueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue",
    "MessageBody": "{\"orderId\": \"123\", \"status\": \"pending\"}"
  }
}
```

#### Example: Receive messages with long polling

```json
{
  "command": "ReceiveMessage",
  "params": {
    "QueueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/my-queue",
    "MaxNumberOfMessages": 10,
    "WaitTimeSeconds": 5
  }
}
```

#### Example: Send FIFO message with group ID

```json
{
  "command": "SendMessage",
  "params": {
    "QueueUrl": "https://sqs.us-east-1.amazonaws.com/123456789012/jobs.fifo",
    "MessageBody": "{\"jobId\": \"abc\"}",
    "MessageGroupId": "batch-1",
    "MessageDeduplicationId": "job-abc-001"
  }
}
```

---

### Queue Lifecycle

| Command | Description |
|---|---|
| `CreateQueue` | Create a new standard or FIFO queue |
| `SetQueueAttributes` | Update queue settings (retention, visibility, DLQ, etc.) |
| `AddPermission` | Grant cross-account or service permissions |
| `RemovePermission` | Remove a permission by label |
| `TagQueue` | Add tags to a queue |
| `UntagQueue` | Remove tags from a queue |
| `DeleteQueue` | Delete a queue |

#### Example: Create a queue with DLQ

```json
{
  "command": "CreateQueue",
  "params": {
    "QueueName": "order-processor",
    "Attributes": {
      "VisibilityTimeout": "30",
      "MessageRetentionPeriod": "1209600",
      "RedrivePolicy": "{\"deadLetterTargetArn\":\"arn:aws:sqs:us-east-1:123456789012:failed-orders\",\"maxReceiveCount\":5}"
    }
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **Lambda** | SQS queues trigger Lambda via event source mappings — use `ListEventSourceMappings` |
| **SNS** | SNS fan-out to SQS — use `ListSubscriptionsByTopic` to find SQS subscriptions |
| **S3** | S3 event notifications deliver to SQS — check `GetBucketNotificationConfiguration` |
| **CloudWatch** | SQS metrics (approximate message count, age) are in CloudWatch Metrics |
| **Step Functions** | Step Functions can send messages to SQS as task states |

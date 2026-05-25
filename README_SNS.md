# Aws Claw: SNS Guide

Aws Claw exposes **SNSTool** for managing Amazon SNS topics, subscriptions, platform applications, and SMS — including publishing messages and inspecting notification configuration.

---

## 🗂️ Use Cases

- **Publish alerts**: send operational notifications to email, SMS, or SQS subscribers
- **Fan-out architecture**: inspect topic subscriptions to understand which SQS queues and Lambda functions receive messages
- **Mobile push**: manage platform applications (APNS, FCM) and device endpoints for push notifications
- **SMS management**: check SMS attributes, sandbox status, and opted-out phone numbers
- **Audit topics**: inspect topic attributes, data protection policies, and subscription counts
- **Event-driven triggers**: configure topics that react to S3 events, CloudWatch alarms, or application code

---

## 💬 Sample Prompts

- *"List all my SNS topics"*
- *"What subscriptions are on the alerts topic?"*
- *"Publish a test message to the notifications topic"*
- *"Is my account in SMS sandbox mode?"*
- *"What SMS attributes are configured for my account?"*
- *"List all platform applications for push notifications"*
- *"Check if phone number +15555551234 has opted out of SMS"*
- *"Subscribe my email to the ops-alerts topic"*
- *"What is the data protection policy on the payments-topic?"*
- *"Create a new SNS topic called deployment-events"*

---

## 🔧 SNSTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListTopics` | List all SNS topics |
| `GetTopicAttributes` | Get topic attributes (policy, subscription count, etc.) |
| `ListSubscriptions` | List all subscriptions across topics |
| `ListSubscriptionsByTopic` | List subscriptions for a specific topic |
| `GetSubscriptionAttributes` | Get attributes of a subscription |
| `ListTagsForResource` | List tags for a topic or other SNS resource |
| `ListPlatformApplications` | List mobile push platform applications |
| `GetPlatformApplicationAttributes` | Get attributes of a platform application |
| `ListEndpointsByPlatformApplication` | List device endpoints for a platform application |
| `GetEndpointAttributes` | Get attributes of a specific endpoint |
| `GetSMSAttributes` | Get SMS sending configuration |
| `GetSMSSandboxAccountStatus` | Check if account is in SMS sandbox |
| `GetDataProtectionPolicy` | Get data protection policy for a topic |
| `CheckIfPhoneNumberIsOptedOut` | Check if a phone number has opted out of SMS |
| `ListPhoneNumbersOptedOut` | List all opted-out phone numbers |
| `ListOriginationNumbers` | List SMS origination phone numbers |

#### Example: List topics

```json
{ "command": "ListTopics", "params": {} }
```

#### Example: Get topic attributes

```json
{
  "command": "GetTopicAttributes",
  "params": { "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts" }
}
```

#### Example: List subscriptions for a topic

```json
{
  "command": "ListSubscriptionsByTopic",
  "params": { "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts" }
}
```

---

### Publish

#### Example: Publish a message

```json
{
  "command": "Publish",
  "params": {
    "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts",
    "Subject": "Deployment Complete",
    "Message": "Version 2.1.0 deployed to production successfully."
  }
}
```

#### Example: Send SMS directly to a phone number

```json
{
  "command": "Publish",
  "params": {
    "phoneNumber": "+15555551234",
    "Message": "Your verification code is 847291"
  }
}
```

#### Example: Publish per-protocol messages

```json
{
  "command": "Publish",
  "params": {
    "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts",
    "MessageStructure": "json",
    "Message": "{\"email\": \"Full email body here\", \"sqs\": \"{\\\"event\\\": \\\"deployed\\\"}\"}"
  }
}
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateTopic` | Create a new topic |
| `Subscribe` | Subscribe an endpoint (email, SQS, Lambda, HTTP, SMS) |
| `ConfirmSubscription` | Confirm a pending subscription |
| `Unsubscribe` | Unsubscribe an endpoint |
| `SetTopicAttributes` | Update topic display name, policy, etc. |
| `SetSubscriptionAttributes` | Update subscription attributes (e.g., raw delivery) |
| `CreatePlatformApplication` | Create a mobile push platform application |
| `CreatePlatformEndpoint` | Register a device endpoint |
| `DeleteTopic` | Delete a topic |
| `DeletePlatformApplication` | Delete a platform application |
| `DeleteEndpoint` | Delete a device endpoint |
| `TagResource` | Tag a topic or resource |
| `UntagResource` | Remove tags from a resource |

#### Example: Subscribe an email address

```json
{
  "command": "Subscribe",
  "params": {
    "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts",
    "Protocol": "email",
    "Endpoint": "ops-team@example.com"
  }
}
```

#### Example: Subscribe an SQS queue

```json
{
  "command": "Subscribe",
  "params": {
    "TopicArn": "arn:aws:sns:us-east-1:123456789012:alerts",
    "Protocol": "sqs",
    "Endpoint": "arn:aws:sqs:us-east-1:123456789012:alerts-queue"
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **SQS** | SNS fan-out to SQS queues — use `SQSTool` to inspect subscriber queues |
| **Lambda** | SNS can invoke Lambda — use `LambdaTool` `ListEventSourceMappings` |
| **S3** | S3 bucket events publish to SNS — check `S3Tool` `GetBucketNotificationConfiguration` |
| **CloudWatch** | SNS delivery metrics are in CloudWatch Metrics |
| **CloudFormation** | SNS resources managed by CloudFormation stacks |

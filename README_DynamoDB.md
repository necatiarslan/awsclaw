# Aws Claw: DynamoDB Guide

Aws Claw exposes **DynamoDBTool** for managing Amazon DynamoDB — querying and scanning tables, performing CRUD operations on items, managing tables, TTL, backups, and global tables.

---

## 🗂️ Use Cases

- **Data exploration**: query or scan a table to inspect items during development or debugging
- **Item lookup**: retrieve a specific item by primary key
- **Write operations**: put, update, or delete items during testing or manual data correction
- **Table management**: create, update, or delete tables and modify billing mode
- **TTL management**: enable or disable automatic item expiration on a table
- **Backup and restore**: create on-demand backups and restore tables
- **Global tables**: replicate tables across multiple AWS regions for low-latency access
- **Schema inspection**: describe a table to understand its key schema, GSIs, and throughput settings

---

## 💬 Sample Prompts

- *"List all my DynamoDB tables"*
- *"Describe the users-table including its indexes"*
- *"Get the item with pk=user-123 and sk=profile from the users-table"*
- *"Query the orders table for all orders where pk = customer-456"*
- *"Scan the products table for items where price is less than 50"*
- *"Update the status field to shipped for item pk=order-789 in the orders table"*
- *"Delete the item pk=temp-record sk=draft from the staging-table"*
- *"Is TTL enabled on the sessions table?"*
- *"Enable TTL on the sessions table using the expiresAt attribute"*
- *"Create a backup of the users table called daily-backup-2026-01-15"*
- *"List all backups for the users table"*
- *"What is the billing mode for the orders table?"*

---

## 🔧 DynamoDBTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListTables` | List all DynamoDB tables |
| `DescribeTable` | Get key schema, indexes, throughput, billing mode |
| `DescribeTimeToLive` | Get TTL configuration |
| `DescribeContinuousBackups` | Get backup and point-in-time recovery status |
| `DescribeTableReplicaAutoScaling` | Get auto-scaling settings for replicas |
| `ListBackups` | List on-demand backups |
| `DescribeBackup` | Get details of a specific backup |
| `ListGlobalTables` | List global tables |
| `ListTagsOfResource` | List tags for a table |

#### Example: Describe a table

```json
{ "command": "DescribeTable", "params": { "TableName": "users" } }
```

---

### Query and Scan

| Command | Description |
|---|---|
| `Query` | Query by primary key with optional filter |
| `Scan` | Scan all items with optional filter |
| `GetItem` | Get a single item by primary key |

#### Example: Query by partition key

```json
{
  "command": "Query",
  "params": {
    "TableName": "orders",
    "KeyConditionExpression": "pk = :pk",
    "ExpressionAttributeValues": { ":pk": { "S": "customer-456" } },
    "Limit": 25
  }
}
```

#### Example: Query with sort key prefix

```json
{
  "command": "Query",
  "params": {
    "TableName": "orders",
    "KeyConditionExpression": "pk = :pk AND begins_with(sk, :prefix)",
    "ExpressionAttributeValues": {
      ":pk": { "S": "customer-456" },
      ":prefix": { "S": "order#" }
    }
  }
}
```

#### Example: Scan with filter

```json
{
  "command": "Scan",
  "params": {
    "TableName": "products",
    "FilterExpression": "price < :maxPrice",
    "ExpressionAttributeValues": { ":maxPrice": { "N": "50" } },
    "Limit": 100
  }
}
```

#### Example: Get a single item

```json
{
  "command": "GetItem",
  "params": {
    "TableName": "users",
    "Key": { "pk": { "S": "user-123" }, "sk": { "S": "profile" } }
  }
}
```

**DynamoDB attribute type prefixes:** `S` = string, `N` = number, `BOOL` = boolean, `NULL` = null, `L` = list, `M` = map, `SS` = string set, `NS` = number set

---

### Write Operations

| Command | Description |
|---|---|
| `PutItem` | Create or replace an item |
| `UpdateItem` | Update specific attributes of an item |
| `DeleteItem` | Delete an item by primary key |

#### Example: Put an item

```json
{
  "command": "PutItem",
  "params": {
    "TableName": "users",
    "Item": {
      "pk": { "S": "user-123" },
      "sk": { "S": "profile" },
      "name": { "S": "Alice" },
      "age": { "N": "30" }
    }
  }
}
```

#### Example: Update a specific attribute

```json
{
  "command": "UpdateItem",
  "params": {
    "TableName": "orders",
    "Key": { "pk": { "S": "order-789" }, "sk": { "S": "meta" } },
    "UpdateExpression": "SET #s = :status",
    "ExpressionAttributeNames": { "#s": "status" },
    "ExpressionAttributeValues": { ":status": { "S": "shipped" } }
  }
}
```

---

### Table Lifecycle

| Command | Description |
|---|---|
| `CreateTable` | Create a new table |
| `UpdateTable` | Update billing, GSIs, or throughput |
| `DeleteTable` | Delete a table |
| `UpdateTimeToLive` | Enable or disable TTL |
| `CreateBackup` | Create an on-demand backup |
| `DeleteBackup` | Delete a backup |
| `RestoreTableFromBackup` | Restore a table from a backup |
| `CreateGlobalTable` | Create a global table (multi-region replication) |
| `UpdateGlobalTable` | Add/remove replica regions |
| `TagResource` | Tag a table |
| `UntagResource` | Remove tags from a table |

#### Example: Create a table with pay-per-request billing

```json
{
  "command": "CreateTable",
  "params": {
    "TableName": "events",
    "KeySchema": [
      { "AttributeName": "pk", "KeyType": "HASH" },
      { "AttributeName": "sk", "KeyType": "RANGE" }
    ],
    "AttributeDefinitions": [
      { "AttributeName": "pk", "AttributeType": "S" },
      { "AttributeName": "sk", "AttributeType": "S" }
    ],
    "BillingMode": "PAY_PER_REQUEST"
  }
}
```

#### Example: Enable TTL

```json
{
  "command": "UpdateTimeToLive",
  "params": {
    "TableName": "sessions",
    "TimeToLiveSpecification": { "AttributeName": "expiresAt", "Enabled": true }
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **Lambda** | DynamoDB Streams trigger Lambda — use `LambdaTool` `ListEventSourceMappings` |
| **CloudWatch** | DynamoDB metrics (capacity, throttling) in CloudWatch |
| **IAM** | Table access controlled by IAM — use `IAMTool` `SimulatePrincipalPolicy` |
| **CloudFormation** | Tables managed by CloudFormation stacks |
| **S3** | DynamoDB table exports go to S3 |

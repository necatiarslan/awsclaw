# Aws Claw: RDS Data API Guide

Aws Claw exposes **RDSDataTool** for executing SQL directly against Amazon Aurora Serverless clusters and RDS clusters with the Data API enabled — without managing database connections.

---

## 🗂️ Use Cases

- **Ad-hoc SQL queries**: run SELECT statements against Aurora Serverless from your IDE without a DB client
- **Data inspection**: query production or staging databases to investigate issues
- **Batch inserts**: insert multiple rows in a single API call using parameterized batch statements
- **Transactional updates**: wrap multiple SQL statements in a transaction with explicit commit/rollback
- **Schema exploration**: query `information_schema` to inspect tables, columns, and indexes
- **Data validation**: verify data integrity after a migration or ETL job
- **Automated scripting**: run SQL as part of a workflow without connection pooling complexity

---

## 💬 Sample Prompts

- *"Run SELECT * FROM users WHERE age > 30 on the analytics cluster"*
- *"How many rows are in the orders table on the prod-cluster?"*
- *"Insert a test record into the events table on the staging cluster"*
- *"Begin a transaction, update two rows, then commit"*
- *"What tables exist in the mydb database on the aurora-serverless cluster?"*
- *"Run a batch insert of 5 records into the products table"*
- *"Rollback the last transaction on the analytics cluster"*

---

## 🔧 RDSDataTool Commands

### ExecuteStatement — run a single SQL statement

```json
{
  "command": "ExecuteStatement",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "database": "mydb",
    "sql": "SELECT * FROM users WHERE age > :minAge",
    "parameters": [{ "name": "minAge", "value": { "longValue": 30 } }],
    "includeResultMetadata": true
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `resourceArn` | Yes | ARN of the Aurora/RDS cluster |
| `secretArn` | Yes | Secrets Manager secret with DB credentials |
| `database` | No | Database name |
| `sql` | Yes | SQL statement |
| `parameters` | No | Named parameters (see types below) |
| `transactionId` | No | Transaction ID (from `BeginTransaction`) |
| `includeResultMetadata` | No | Include column metadata in results |

**Parameter value types:**

| Type | Example |
|---|---|
| String | `{ "name": "p1", "value": { "stringValue": "hello" } }` |
| Integer/Long | `{ "name": "p2", "value": { "longValue": 42 } }` |
| Float/Double | `{ "name": "p3", "value": { "doubleValue": 3.14 } }` |
| Boolean | `{ "name": "p4", "value": { "booleanValue": true } }` |
| Null | `{ "name": "p5", "value": { "isNull": true } }` |
| Blob/Binary | `{ "name": "p6", "value": { "blobValue": "base64..." } }` |

---

### BatchExecuteStatement — batch insert or update

```json
{
  "command": "BatchExecuteStatement",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "database": "mydb",
    "sql": "INSERT INTO users (name, age) VALUES (:name, :age)",
    "parameterSets": [
      [{ "name": "name", "value": { "stringValue": "Alice" } }, { "name": "age", "value": { "longValue": 30 } }],
      [{ "name": "name", "value": { "stringValue": "Bob" } }, { "name": "age", "value": { "longValue": 25 } }]
    ]
  }
}
```

---

### Transaction Management

#### Step 1 — begin a transaction

```json
{
  "command": "BeginTransaction",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "database": "mydb"
  }
}
```

Returns a `transactionId`.

#### Step 2 — execute statements within the transaction

```json
{
  "command": "ExecuteStatement",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "database": "mydb",
    "sql": "UPDATE orders SET status = :status WHERE id = :id",
    "transactionId": "<transactionId>",
    "parameters": [
      { "name": "status", "value": { "stringValue": "shipped" } },
      { "name": "id", "value": { "longValue": 1001 } }
    ]
  }
}
```

#### Step 3 — commit or rollback

```json
{
  "command": "CommitTransaction",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "transactionId": "<transactionId>"
  }
}
```

```json
{
  "command": "RollbackTransaction",
  "params": {
    "resourceArn": "arn:aws:rds:us-east-1:123456789012:cluster:my-cluster",
    "secretArn": "arn:aws:secretsmanager:us-east-1:123456789012:secret:my-db-secret",
    "transactionId": "<transactionId>"
  }
}
```

---

## ⚠️ Prerequisites

The Data API must be enabled on the cluster. To check:
- Use `RDSTool` `DescribeDBClusters` and look for `HttpEndpointEnabled: true`
- The cluster must be Aurora Serverless v1/v2 or an RDS cluster with Data API support

The `secretArn` must point to a Secrets Manager secret containing:
```json
{ "username": "admin", "password": "yourpassword" }
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **RDS** | Use `RDSTool` `DescribeDBClusters` to find cluster ARNs and verify Data API is enabled |
| **Secrets Manager** | The `secretArn` references a Secrets Manager secret with DB credentials |
| **Lambda** | Lambda functions commonly use the Data API to avoid connection pooling |
| **CloudWatch** | SQL query metrics and errors appear in CloudWatch |

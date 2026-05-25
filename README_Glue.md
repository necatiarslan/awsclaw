# Aws Claw: Glue Guide

Aws Claw exposes **GlueTool** for managing AWS Glue — ETL jobs, crawlers, triggers, workflows, the Glue Data Catalog (databases, tables, partitions), and connections.

---

## 🗂️ Use Cases

- **Job monitoring**: inspect recent job runs and their status, duration, and error messages
- **Start ETL jobs**: trigger Glue jobs manually with custom arguments
- **Catalog exploration**: browse the Glue Data Catalog to inspect databases, tables, and partitions
- **Crawler management**: run crawlers to refresh the catalog from S3 or other data sources
- **Job creation**: create new ETL jobs specifying the script location, IAM role, and worker type
- **Trigger inspection**: view scheduled or conditional triggers and their associated jobs
- **Bookmark management**: check job bookmark state to understand incremental processing progress
- **Connection audit**: inspect Glue connections to databases, Kafka, or other sources

---

## 💬 Sample Prompts

- *"List all Glue jobs in my account"*
- *"What is the status of the last 5 runs of the sales-etl job?"*
- *"Start the customer-data-etl job with input path s3://my-bucket/raw/"*
- *"List all Glue crawlers and their last crawl status"*
- *"Run the s3-events-crawler now"*
- *"What databases are in the Glue Data Catalog?"*
- *"List all tables in the analytics database"*
- *"What partitions exist for the events table in the analytics database?"*
- *"What is the bookmark state for the daily-sales-etl job?"*
- *"Show me all triggers and which jobs they run"*
- *"Create a new Glue ETL job called data-transformer using script s3://bucket/scripts/transform.py"*
- *"What connections are configured in Glue?"*

---

## 🔧 GlueTool Commands

### Job Operations

| Command | Description |
|---|---|
| `ListJobs` | List Glue jobs |
| `GetJob` | Get configuration of a specific job |
| `GetJobRuns` | List all runs for a job |
| `GetJobRun` | Get details of a specific run |
| `GetJobBookmark` | Get bookmark (incremental state) for a job |
| `StartJobRun` | Start a job run with optional argument overrides |
| `CreateJob` | Create a new Glue job |
| `UpdateJob` | Update an existing job |
| `DeleteJob` | Delete a job |

#### Example: List jobs

```json
{ "command": "ListJobs", "params": { "MaxResults": 50 } }
```

#### Example: List recent job runs

```json
{ "command": "GetJobRuns", "params": { "JobName": "sales-etl", "MaxResults": 10 } }
```

#### Example: Start a job run with arguments

```json
{
  "command": "StartJobRun",
  "params": {
    "JobName": "customer-data-etl",
    "Arguments": {
      "--input-path": "s3://my-bucket/raw/",
      "--output-path": "s3://my-bucket/processed/"
    }
  }
}
```

#### Example: Create a new Glue ETL job

```json
{
  "command": "CreateJob",
  "params": {
    "Name": "data-transformer",
    "Role": "arn:aws:iam::123456789012:role/GlueRole",
    "Command": {
      "Name": "glueetl",
      "ScriptLocation": "s3://my-bucket/scripts/transform.py"
    },
    "WorkerType": "G.1X",
    "NumberOfWorkers": 5,
    "GlueVersion": "4.0"
  }
}
```

---

### Crawler Operations

| Command | Description |
|---|---|
| `ListCrawlers` | List all crawlers |
| `GetCrawler` | Get configuration and last status of a crawler |
| `GetCrawlers` | List crawlers with details |
| `ListCrawls` | List crawl runs for a crawler |
| `StartCrawler` | Start a crawler run |
| `CreateCrawler` | Create a new crawler |
| `UpdateCrawler` | Update a crawler |
| `DeleteCrawler` | Delete a crawler |

#### Example: Get crawler status

```json
{ "command": "GetCrawler", "params": { "CrawlerName": "s3-events-crawler" } }
```

#### Example: Start a crawler

```json
{ "command": "StartCrawler", "params": { "Name": "s3-events-crawler" } }
```

---

### Trigger Operations

| Command | Description |
|---|---|
| `ListTriggers` | List triggers |
| `GetTrigger` | Get a specific trigger |
| `GetTriggers` | List triggers with optional job filter |
| `UpdateTrigger` | Update a trigger |

---

### Data Catalog Operations

| Command | Description |
|---|---|
| `GetDatabases` | List all databases in the catalog |
| `GetDatabase` | Get a specific database |
| `GetTables` | List tables in a database |
| `GetTable` | Get a specific table definition |
| `GetPartitions` | List partitions for a table |
| `CreateDatabase` | Create a new database |
| `CreateTable` | Create a new table |
| `DeleteDatabase` | Delete a database |
| `DeleteTable` | Delete a table |

#### Example: List databases

```json
{ "command": "GetDatabases", "params": {} }
```

#### Example: List tables in a database

```json
{ "command": "GetTables", "params": { "DatabaseName": "analytics" } }
```

#### Example: List partitions for a table

```json
{
  "command": "GetPartitions",
  "params": {
    "DatabaseName": "analytics",
    "TableName": "events",
    "Expression": "year = '2025'"
  }
}
```

---

### Connections and Tags

| Command | Description |
|---|---|
| `GetConnections` | List Glue connections |
| `TagResource` | Tag a Glue resource |
| `UntagResource` | Remove tags |
| `GetTags` | Get tags for a resource |

---

## 📋 CloudWatch Log Groups

Glue logs follow these patterns:
- Job output: `/aws-glue/jobs/output`
- Job errors: `/aws-glue/jobs/error`
- Crawlers: `/aws-glue/crawlers`

Use `CloudWatchLogTool` with `DescribeLogGroups` and prefix `/aws-glue/` to find them.

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **CloudWatch Logs** | Job and crawler logs — use `CloudWatchLogTool` |
| **S3** | Job scripts, input data, and output stored in S3 — use `S3Tool` |
| **IAM** | Jobs require execution roles — use `IAMTool` to inspect |
| **EMR** | EMR can use Glue Data Catalog as Hive metastore |
| **Step Functions** | Step Functions can start Glue jobs as task states |
| **CloudFormation** | Glue resources managed by CloudFormation stacks |
| **DynamoDB** | Glue can read DynamoDB tables as data sources |

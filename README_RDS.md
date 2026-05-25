# Aws Claw: RDS Guide

Aws Claw exposes **RDSTool** for managing Amazon RDS — inspecting and managing DB instances, Aurora clusters, snapshots, parameter groups, logs, proxies, events, and lifecycle operations.

---

## 🗂️ Use Cases

- **Health monitoring**: check instance state, storage, and pending maintenance actions
- **Log access**: list and download database log files (error, slow query, audit)
- **Snapshot management**: create, list, and restore from manual snapshots
- **Parameter inspection**: review parameter groups to understand database configuration
- **Backup audit**: check automated backup settings and retention periods
- **Capacity planning**: query orderable instance options and reserved instances
- **Network review**: inspect subnet groups and security groups for a DB instance
- **Failover tracking**: monitor Aurora cluster members and replication
- **Proxy management**: inspect RDS Proxy endpoints and configurations
- **Event tracking**: view RDS events for instances and clusters

---

## 💬 Sample Prompts

- *"List all my RDS instances"*
- *"What is the status of the production database my-db?"*
- *"Show me all Aurora clusters in us-east-1"*
- *"List available snapshots for the my-db instance"*
- *"What log files are available for my-db?"*
- *"Download the error log for the my-db instance"*
- *"What parameter group is my-db using and what are its settings?"*
- *"List all automated backups for the analytics-cluster"*
- *"Create a manual snapshot of my-db"*
- *"Restore my-db from snapshot my-db-snap-2025-01-01"*
- *"What RDS events happened in the last 24 hours?"*
- *"List all RDS Proxy instances in my account"*
- *"What are the pending maintenance actions for my instances?"*

---

## 🔧 RDSTool Commands

### Read Operations

| Command | Description |
|---|---|
| `DescribeDBInstances` | Describe RDS DB instances |
| `DescribeDBClusters` | Describe Aurora DB clusters |
| `DescribeDBSnapshots` | Describe instance snapshots |
| `DescribeDBClusterSnapshots` | Describe Aurora cluster snapshots |
| `DescribeDBInstanceAutomatedBackups` | List automated backups for instances |
| `DescribeDBClusterAutomatedBackups` | List automated backups for clusters |
| `DescribeDBLogFiles` | List log files for a DB instance |
| `DownloadDBLogFilePortion` | Download a portion of a log file |
| `DescribeDBParameterGroups` | List parameter groups |
| `DescribeDBClusterParameterGroups` | List Aurora cluster parameter groups |
| `DescribeDBSubnetGroups` | List subnet groups |
| `DescribeDBSecurityGroups` | List DB security groups |
| `DescribeDBProxies` | List RDS Proxy instances |
| `DescribeDBProxyEndpoints` | List RDS Proxy endpoints |
| `DescribeDBEngineVersions` | List available engine versions |
| `DescribeDBRecommendations` | List AWS recommendations for DB instances |
| `DescribeEvents` | List RDS events |
| `DescribeEventSubscriptions` | List event notification subscriptions |
| `DescribeBlueGreenDeployments` | List Blue/Green deployment resources |
| `DescribeGlobalClusters` | List Aurora global database clusters |
| `DescribeIntegrations` | List zero-ETL integrations |
| `DescribePendingMaintenanceActions` | List pending maintenance actions |
| `DescribeReservedDBInstances` | List reserved DB instances |
| `DescribeReservedDBInstancesOfferings` | List reserved DB instance purchase options |
| `DescribeOrderableDBInstanceOptions` | List valid options for an engine/version |
| `DescribeCertificates` | List TLS certificates |
| `DescribeExportTasks` | List snapshot export tasks to S3 |
| `DescribeOptionGroups` | List option groups |
| `DescribeAccountAttributes` | Get RDS quotas and limits |
| `DescribeValidDBInstanceModifications` | Get valid modification options for a DB |
| `ListTagsForResource` | List tags for a DB resource |

#### Example: List all DB instances

```json
{ "command": "DescribeDBInstances", "params": {} }
```

#### Example: Describe a specific instance

```json
{ "command": "DescribeDBInstances", "params": { "DBInstanceIdentifier": "my-db" } }
```

#### Example: List available log files

```json
{ "command": "DescribeDBLogFiles", "params": { "DBInstanceIdentifier": "my-db" } }
```

#### Example: Download an error log

```json
{
  "command": "DownloadDBLogFilePortion",
  "params": {
    "DBInstanceIdentifier": "my-db",
    "LogFileName": "error/mysql-error.log"
  }
}
```

#### Example: List snapshots for an instance

```json
{ "command": "DescribeDBSnapshots", "params": { "DBInstanceIdentifier": "my-db" } }
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateDBInstance` | Create a new DB instance |
| `ModifyDBInstance` | Modify instance settings (storage, class, etc.) |
| `StartDBInstance` | Start a stopped instance |
| `StopDBInstance` | Stop an instance |
| `DeleteDBInstance` | Delete an instance |
| `CreateDBSnapshot` | Create a manual snapshot |
| `RestoreDBInstanceFromDBSnapshot` | Restore an instance from a snapshot |
| `AddTagsToResource` | Tag a DB resource |
| `RemoveTagsFromResource` | Remove tags from a DB resource |

#### Example: Create a snapshot

```json
{
  "command": "CreateDBSnapshot",
  "params": {
    "DBInstanceIdentifier": "my-db",
    "DBSnapshotIdentifier": "my-db-manual-2026-01-01"
  }
}
```

#### Example: Restore from a snapshot

```json
{
  "command": "RestoreDBInstanceFromDBSnapshot",
  "params": {
    "DBInstanceIdentifier": "my-db-restored",
    "DBSnapshotIdentifier": "my-db-manual-2026-01-01"
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **CloudWatch Logs** | DB logs published to CloudWatch — groups: `/aws/rds/instance/{id}/{logType}` |
| **RDS Data API** | Run SQL on Aurora Serverless — use `RDSDataTool` (see README_RDSData.md) |
| **EC2** | RDS uses VPCs, subnets, and security groups — use `EC2Tool` |
| **IAM** | IAM auth can be enabled for RDS — use `IAMTool` |
| **S3** | Snapshot exports go to S3 — use `DescribeExportTasks` |
| **CloudFormation** | RDS resources managed by stacks |

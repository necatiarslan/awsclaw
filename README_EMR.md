# Aws Claw: EMR Guide

Aws Claw exposes **EMRTool** for managing Amazon EMR clusters — inspecting cluster state, steps, instances, studios, notebook executions, and security configurations, as well as launching and terminating clusters.

---

## 🗂️ Use Cases

- **Cluster health check**: inspect running clusters, their steps, and instance group status
- **Job debugging**: find failed steps on a cluster and read their status and error details
- **Capacity planning**: check instance groups, fleets, and managed scaling policies
- **Studio access**: inspect EMR Studios and their session mappings for notebook users
- **Release selection**: list available EMR release labels and supported instance types for a release
- **Security audit**: inspect security configurations for encryption and auth settings
- **Notebook tracking**: list and describe notebook executions and their status
- **Auto-termination**: check if a cluster is configured to auto-terminate after idle time

---

## 💬 Sample Prompts

- *"List all running EMR clusters"*
- *"What is the status of cluster j-1234567890ABC?"*
- *"Show me all failed steps on cluster j-1234567890ABC"*
- *"What instances are running in cluster j-1234567890ABC?"*
- *"List all EMR studios in my account"*
- *"What is the auto-termination policy for cluster j-1234567890ABC?"*
- *"What managed scaling policy is configured for cluster j-1234567890ABC?"*
- *"List available EMR release labels"*
- *"What instance types are supported for emr-7.0.0?"*
- *"Launch a new EMR cluster with Spark 3 on emr-7.0.0"*
- *"Add a Spark submit step to cluster j-1234567890ABC"*
- *"Terminate cluster j-1234567890ABC"*

---

## 🔧 EMRTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListClusters` | List clusters with optional state and date filters |
| `DescribeCluster` | Get detailed cluster info (state, config, apps) |
| `ListSteps` | List steps with optional state filter |
| `DescribeStep` | Get details of a specific step |
| `ListInstances` | List EC2 instances in a cluster |
| `ListInstanceFleets` | List instance fleets |
| `ListInstanceGroups` | List instance groups (master, core, task) |
| `ListBootstrapActions` | List bootstrap actions for a cluster |
| `ListStudios` | List EMR Studios |
| `DescribeStudio` | Get details of a studio |
| `ListNotebookExecutions` | List notebook executions |
| `DescribeNotebookExecution` | Get details of a notebook execution |
| `ListReleaseLabels` | List available EMR release labels |
| `DescribeReleaseLabel` | Get details and supported apps for a release |
| `ListSupportedInstanceTypes` | List supported instance types for a release |
| `ListSecurityConfigurations` | List security configurations |
| `DescribeSecurityConfiguration` | Get a security configuration |
| `GetAutoTerminationPolicy` | Get auto-termination policy for a cluster |
| `GetManagedScalingPolicy` | Get managed scaling policy |
| `GetBlockPublicAccessConfiguration` | Get block public access config |
| `ListStudioSessionMappings` | List studio session mappings |
| `GetStudioSessionMapping` | Get a specific session mapping |

#### Example: List running and waiting clusters

```json
{ "command": "ListClusters", "params": { "ClusterStates": ["RUNNING", "WAITING"] } }
```

#### Example: List failed steps on a cluster

```json
{
  "command": "ListSteps",
  "params": {
    "ClusterId": "j-1234567890ABC",
    "StepStates": ["FAILED"]
  }
}
```

#### Example: List running instances

```json
{
  "command": "ListInstances",
  "params": {
    "ClusterId": "j-1234567890ABC",
    "InstanceStates": ["RUNNING"]
  }
}
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `RunJobFlow` | Create a new EMR cluster |
| `AddJobFlowSteps` | Add steps to a running cluster |
| `ModifyCluster` | Modify cluster settings (e.g., step concurrency level) |
| `PutAutoScalingPolicy` | Configure auto-scaling for an instance group |
| `AddTags` | Tag a cluster |
| `RemoveTags` | Remove tags from a cluster |
| `TerminateJobFlows` | Terminate one or more clusters |

#### Example: Launch a new EMR cluster

```json
{
  "command": "RunJobFlow",
  "params": {
    "Name": "analytics-cluster",
    "ReleaseLabel": "emr-7.0.0",
    "Applications": [{ "Name": "Spark" }, { "Name": "Hadoop" }],
    "Instances": {
      "InstanceGroups": [
        { "InstanceRole": "MASTER", "InstanceType": "m5.xlarge", "InstanceCount": 1 },
        { "InstanceRole": "CORE", "InstanceType": "m5.xlarge", "InstanceCount": 2 }
      ]
    },
    "ServiceRole": "EMR_DefaultRole",
    "JobFlowRole": "EMR_EC2_DefaultRole"
  }
}
```

#### Example: Add a Spark submit step

```json
{
  "command": "AddJobFlowSteps",
  "params": {
    "JobFlowId": "j-1234567890ABC",
    "Steps": [{
      "Name": "spark-job",
      "ActionOnFailure": "CONTINUE",
      "HadoopJarStep": {
        "Jar": "command-runner.jar",
        "Args": ["spark-submit", "--deploy-mode", "cluster", "s3://my-bucket/scripts/job.py"]
      }
    }]
  }
}
```

#### Example: Terminate a cluster

```json
{ "command": "TerminateJobFlows", "params": { "JobFlowIds": ["j-1234567890ABC"] } }
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **S3** | Clusters use S3 for input/output data (EMRFS), logs, and scripts |
| **EC2** | Clusters run on EC2 instances — use `EC2Tool` to inspect them |
| **CloudWatch** | Cluster metrics and logs — use `CloudWatchLogTool` |
| **IAM** | Clusters use EC2 instance profiles and service roles — use `IAMTool` |
| **Glue Data Catalog** | EMR can use Glue as Hive metastore — use `GlueTool` |
| **CloudFormation** | EMR clusters managed by CloudFormation stacks |

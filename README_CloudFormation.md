# Aws Claw: CloudFormation Guide

Aws Claw exposes **CloudFormationTool** for inspecting and managing CloudFormation stacks — viewing resources, events, outputs, change sets, drift status, stack sets, and registered resource types.

---

## 🗂️ Use Cases

- **Audit infrastructure**: list all stacks and inspect their resources, outputs, and parameters
- **Troubleshoot deployments**: view stack events to find the step that caused a rollback
- **Template inspection**: retrieve the current template body for any deployed stack
- **Drift detection**: detect whether deployed resources have drifted from the CloudFormation template
- **Change management**: create and inspect change sets before applying updates
- **Cross-stack dependencies**: trace exported values and the stacks that import them
- **Cost estimation**: estimate the cost of a template before deploying
- **Compliance**: audit stacks for termination protection and applied stack policies
- **Multi-account deployment**: inspect stack sets and their instances across accounts/regions

---

## 💬 Sample Prompts

- *"List all my CloudFormation stacks"*
- *"Show me all resources in the prod-api stack"*
- *"What events happened recently on the checkout-stack?"*
- *"Get the template body for the vpc-stack"*
- *"Detect drift on the prod-api stack"*
- *"What resources have drifted from the template in prod-api?"*
- *"List the change sets for the checkout-stack"*
- *"What are the exported outputs from my stacks?"*
- *"Which stacks import the ProdVpcId export?"*
- *"Show me all stack sets in my account"*
- *"Validate this CloudFormation template"*
- *"What are the CloudFormation account limits?"*

---

## 🔧 CloudFormationTool Commands

### Read Operations (66 commands total)

**Stacks:**

| Command | Description |
|---|---|
| `ListStacks` | List all stacks (supports status filter) |
| `DescribeStacks` | Describe one or more stacks in detail |
| `DescribeStackResources` | List all resources in a stack |
| `ListStackResources` | List resources with pagination |
| `DescribeStackResource` | Get details of a specific resource |
| `DescribeStackEvents` | List events for a stack |
| `GetTemplate` | Get the template body for a deployed stack |
| `GetTemplateSummary` | Get template metadata and parameter descriptions |
| `GetStackPolicy` | Get the stack policy |
| `DescribeAccountLimits` | Get CloudFormation account limits |

**Drift:**

| Command | Description |
|---|---|
| `DetectStackDrift` | Initiate drift detection on a stack |
| `DescribeStackDriftDetectionStatus` | Check drift detection status |
| `DescribeStackResourceDrifts` | List drifted resources for a stack |
| `DetectStackResourceDrift` | Detect drift on a specific resource |

**Change Sets:**

| Command | Description |
|---|---|
| `ListChangeSets` | List change sets for a stack |
| `DescribeChangeSet` | Describe a specific change set |
| `DescribeChangeSetHooks` | Describe hooks for a change set |

**Exports and Imports:**

| Command | Description |
|---|---|
| `ListExports` | List all exported output values |
| `ListImports` | List stacks importing a specific export |

**Stack Sets:**

| Command | Description |
|---|---|
| `ListStackSets` | List all stack sets |
| `DescribeStackSet` | Describe a specific stack set |
| `ListStackInstances` | List instances in a stack set |
| `DescribeStackInstance` | Describe a specific stack instance |
| `ListStackSetOperations` | List operations on a stack set |
| `DescribeStackSetOperation` | Describe a specific operation |
| `DetectStackSetDrift` | Initiate drift detection on a stack set |

**Resource Types and Scanning:**

| Command | Description |
|---|---|
| `ListTypes` | List registered resource types |
| `DescribeType` | Describe a specific resource type |
| `ListResourceScans` | List resource scans |
| `DescribeResourceScan` | Describe a resource scan |
| `ListResourceScanResources` | List resources discovered in a scan |
| `ValidateTemplate` | Validate a CloudFormation template |
| `EstimateTemplateCost` | Estimate cost for a template |

#### Example: List all stacks

```json
{ "command": "ListStacks", "params": {} }
```

#### Example: View stack resources

```json
{ "command": "DescribeStackResources", "params": { "StackName": "prod-api" } }
```

#### Example: Get the template body

```json
{ "command": "GetTemplate", "params": { "StackName": "vpc-stack" } }
```

#### Example: Detect drift and check results

```json
{ "command": "DetectStackDrift", "params": { "StackName": "prod-api" } }
```

```json
{ "command": "DescribeStackResourceDrifts", "params": { "StackName": "prod-api" } }
```

#### Example: List exported values

```json
{ "command": "ListExports", "params": {} }
```

#### Example: Find which stacks import a specific export

```json
{ "command": "ListImports", "params": { "ExportName": "ProdVpcId" } }
```

---

### Write / Lifecycle Commands

| Command | Description |
|---|---|
| `CreateStack` | Create a new stack |
| `UpdateStack` | Update a stack |
| `DeleteStack` | Delete a stack |
| `CancelUpdateStack` | Cancel a stack update |
| `ContinueUpdateRollback` | Continue a rollback after failure |
| `SetStackPolicy` | Set or update a stack policy |
| `UpdateTerminationProtection` | Enable or disable termination protection |
| `CreateChangeSet` | Create a change set |
| `ExecuteChangeSet` | Apply a change set |
| `DeleteChangeSet` | Delete a change set |
| `CreateStackSet` | Create a stack set |
| `UpdateStackSet` | Update a stack set |
| `DeleteStackSet` | Delete a stack set |
| `CreateStackInstances` | Deploy stack set instances |
| `DeleteStackInstances` | Remove stack set instances |

---

## 🔗 Related Services

CloudFormation manages infrastructure for virtually every AWS service:

| Service Created | Related Tool |
|---|---|
| S3 buckets | `S3Tool` |
| Lambda functions | `LambdaTool` |
| DynamoDB tables | `DynamoDBTool` |
| EC2 instances / VPCs | `EC2Tool` |
| IAM roles / policies | `IAMTool` |
| RDS databases | `RDSTool` |
| SNS topics | `SNSTool` |
| SQS queues | `SQSTool` |
| Step Functions | `StepFuncTool` |
| API Gateways | `APIGatewayTool` |
| Glue jobs | `GlueTool` |
| EMR clusters | `EMRTool` |

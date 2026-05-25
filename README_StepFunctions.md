# Aws Claw: Step Functions Guide

Aws Claw exposes **StepFuncTool** for managing AWS Step Functions state machines and executions — listing and describing workflows, starting and stopping executions, viewing step-by-step history, and managing versions, aliases, and activities.

---

## 🗂️ Use Cases

- **Inspect workflows**: view state machine definitions and configurations
- **Monitor executions**: list running, failed, or completed executions and check their status
- **Debug failures**: get step-by-step execution history to identify which state failed and why
- **Start workflows**: trigger a state machine with an input payload
- **Update definitions**: modify state machine logic (Amazon States Language JSON) and publish a new version
- **Traffic splitting**: use aliases to point to specific state machine versions for safe rollouts
- **Validate before deploy**: validate an Amazon States Language definition without creating a resource
- **Activity management**: inspect activities used by worker-based workflows

---

## 💬 Sample Prompts

- *"List all my Step Functions state machines"*
- *"Show me the definition of the order-processing state machine"*
- *"List all failed executions of the checkout-workflow state machine"*
- *"What happened in execution arn:aws:states:...:execution:order-processing:exec-001?"*
- *"Start a new execution of the checkout-workflow with input {\"orderId\": \"12345\"}"*
- *"Show me the last 20 events of this execution in reverse order"*
- *"Update the order-processing state machine with a new definition"*
- *"Validate this Amazon States Language JSON definition"*
- *"What aliases exist for the checkout-workflow state machine?"*
- *"Stop the currently running execution of checkout-workflow"*
- *"List all activities in my account"*

---

## 🔧 StepFuncTool Commands

### Read Operations

| Command | Description |
|---|---|
| `ListStateMachines` | List all state machines |
| `DescribeStateMachine` | Get definition, role, type, and configuration |
| `ListExecutions` | List executions with optional status filter |
| `DescribeExecution` | Get execution status, input, and output |
| `GetExecutionHistory` | Get step-by-step events for an execution |
| `DescribeStateMachineForExecution` | Get state machine details associated with an execution |
| `ListStateMachineVersions` | List published versions |
| `ListStateMachineAliases` | List aliases for a state machine |
| `DescribeStateMachineAlias` | Get alias details |
| `ListActivities` | List activities |
| `DescribeActivity` | Get activity details |
| `ListMapRuns` | List Map Runs for an execution |
| `DescribeMapRun` | Get Map Run details |

#### Example: List all state machines

```json
{ "command": "ListStateMachines", "params": { "maxResults": 20 } }
```

#### Example: List failed executions

```json
{
  "command": "ListExecutions",
  "params": {
    "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:order-processing",
    "statusFilter": "FAILED",
    "maxResults": 10
  }
}
```

`statusFilter` values: `RUNNING`, `SUCCEEDED`, `FAILED`, `TIMED_OUT`, `ABORTED`

#### Example: Get execution history (most recent events first)

```json
{
  "command": "GetExecutionHistory",
  "params": {
    "executionArn": "arn:aws:states:us-east-1:123456789012:execution:order-processing:exec-001",
    "maxResults": 50,
    "reverseOrder": true
  }
}
```

---

### Execution Management

| Command | Description |
|---|---|
| `StartExecution` | Start a new execution with an optional input payload |
| `StopExecution` | Stop a running execution |

#### Example: Start an execution

```json
{
  "command": "StartExecution",
  "params": {
    "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:checkout-workflow",
    "name": "order-12345",
    "input": "{\"orderId\": \"12345\", \"amount\": 99.99}"
  }
}
```

#### Example: Stop a running execution

```json
{
  "command": "StopExecution",
  "params": {
    "executionArn": "arn:aws:states:us-east-1:123456789012:execution:checkout-workflow:exec-001",
    "cause": "manual cancellation"
  }
}
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateStateMachine` | Create a new state machine |
| `UpdateStateMachine` | Update definition, role, or logging configuration |
| `ValidateStateMachineDefinition` | Validate an Amazon States Language definition |
| `PublishStateMachineVersion` | Publish a state machine version |
| `CreateStateMachineAlias` | Create an alias pointing to a version |
| `UpdateStateMachineAlias` | Update an alias |
| `DeleteStateMachineAlias` | Delete an alias |
| `DeleteStateMachineVersion` | Delete a published version |
| `DeleteStateMachine` | Delete a state machine |
| `CreateActivity` | Create an activity |
| `DeleteActivity` | Delete an activity |
| `TagResource` | Tag a state machine or activity |
| `UntagResource` | Remove tags from a resource |

#### Example: Create a state machine

```json
{
  "command": "CreateStateMachine",
  "params": {
    "name": "MyWorkflow",
    "definition": "{\"StartAt\": \"Step1\", \"States\": {\"Step1\": {\"Type\": \"Pass\", \"End\": true}}}",
    "roleArn": "arn:aws:iam::123456789012:role/StepFuncRole"
  }
}
```

#### Example: Update a state machine definition

```json
{
  "command": "UpdateStateMachine",
  "params": {
    "stateMachineArn": "arn:aws:states:us-east-1:123456789012:stateMachine:MyWorkflow",
    "definition": "{\"StartAt\": \"Validate\", \"States\": {\"Validate\": {\"Type\": \"Pass\", \"Next\": \"Process\"}, \"Process\": {\"Type\": \"Pass\", \"End\": true}}}",
    "publish": true
  }
}
```

---

## 📋 CloudWatch Log Groups

Step Functions log groups typically follow:
```
/aws/vendedlogs/states/<state-machine-name>-Logs
```
Use `CloudWatchLogTool` with `DescribeLogGroups` prefix `/aws/vendedlogs/states/` to find them.

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **Lambda** | Lambda is commonly a task state — use `LambdaTool` |
| **SQS** | Step Functions can send messages to SQS queues |
| **SNS** | Step Functions can publish to SNS topics |
| **DynamoDB** | Task states can read/write DynamoDB tables |
| **Glue** | Step Functions can start Glue ETL jobs |
| **EMR** | Step Functions can add EMR cluster steps |
| **CloudWatch Logs** | Execution logs — use `CloudWatchLogTool` |
| **IAM** | State machine execution roles — use `IAMTool` |
| **CloudFormation** | State machines managed by CloudFormation |

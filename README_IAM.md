# Aws Claw: IAM Guide

Aws Claw exposes **IAMTool** for managing AWS Identity and Access Management — inspecting roles, users, groups, policies, simulating permissions, auditing credentials, and performing lifecycle operations.

---

## 🗂️ Use Cases

- **Permission debugging**: simulate whether a role or user has permission to perform a specific action on a resource
- **Role inspection**: view trust policies, attached managed policies, and inline policies for any role
- **User audit**: list users, their access keys, MFA device status, and last-used timestamps
- **Credential report**: generate and download a report of all users and their credential status
- **Least-privilege review**: check what policies are attached to a function or service role
- **Group management**: inspect IAM groups and their members
- **Policy history**: list all versions of a managed policy and read specific version documents
- **Cross-account access**: inspect trust policies for cross-account role assumption

---

## 💬 Sample Prompts

- *"List all IAM roles in my account"*
- *"What policies are attached to the LambdaExecutionRole?"*
- *"Can the GlueJobRole read from s3://my-bucket/data/?"*
- *"Show me the trust policy for the CodeDeployRole"*
- *"List all IAM users and their access key status"*
- *"Does user alice have MFA enabled?"*
- *"Generate a credential report for my account"*
- *"What inline policies are on the DataProcessorRole?"*
- *"Show me the full document for the AmazonS3ReadOnlyAccess managed policy"*
- *"Create a new role for Lambda with basic execution permissions"*
- *"Attach the AmazonDynamoDBReadOnlyAccess policy to the ApiHandlerRole"*
- *"What is my IAM account summary (resource counts)?"*

---

## 🔧 IAMTool Commands

### Role Operations

| Command | Description |
|---|---|
| `ListRoles` | List IAM roles with optional path prefix |
| `GetRole` | Get role details including trust policy |
| `ListRolePolicies` | List inline policy names for a role |
| `GetRolePolicy` | Get an inline policy document |
| `ListAttachedRolePolicies` | List managed policies attached to a role |
| `ListRoleTags` | List tags on a role |

#### Example: Get a role

```json
{ "command": "GetRole", "params": { "RoleName": "LambdaExecutionRole" } }
```

#### Example: List attached managed policies

```json
{ "command": "ListAttachedRolePolicies", "params": { "RoleName": "LambdaExecutionRole" } }
```

#### Example: Get an inline policy

```json
{
  "command": "GetRolePolicy",
  "params": { "RoleName": "DataProcessorRole", "PolicyName": "S3ReadPolicy" }
}
```

---

### Policy Operations

| Command | Description |
|---|---|
| `ListPolicies` | List managed policies (AWS-managed or customer-managed) |
| `GetPolicy` | Get policy metadata |
| `GetPolicyVersion` | Get the JSON document for a specific policy version |
| `ListPolicyVersions` | List all versions of a managed policy |

#### Example: Get the full document for a policy

```json
{ "command": "GetPolicy", "params": { "PolicyArn": "arn:aws:iam::123456789012:policy/MyPolicy" } }
```

```json
{
  "command": "GetPolicyVersion",
  "params": {
    "PolicyArn": "arn:aws:iam::123456789012:policy/MyPolicy",
    "VersionId": "v1"
  }
}
```

---

### User and Group Operations

| Command | Description |
|---|---|
| `ListUsers` | List IAM users |
| `GetUser` | Get user details |
| `ListAccessKeys` | List access keys for a user |
| `ListMFADevices` | List MFA devices for a user |
| `ListGroups` | List IAM groups |
| `GetAccountSummary` | Get account resource counts and limits |
| `GetAccountPasswordPolicy` | Get account password policy |

#### Example: List users and check access keys

```json
{ "command": "ListUsers", "params": {} }
```

```json
{ "command": "ListAccessKeys", "params": { "UserName": "alice" } }
```

---

### Permission Simulation

| Command | Description |
|---|---|
| `SimulatePrincipalPolicy` | Simulate whether a role/user can perform specific actions |

#### Example: Check if a role can read from S3

```json
{
  "command": "SimulatePrincipalPolicy",
  "params": {
    "PolicySourceArn": "arn:aws:iam::123456789012:role/GlueJobRole",
    "ActionNames": ["s3:GetObject", "s3:ListBucket"],
    "ResourceArns": ["arn:aws:s3:::my-data-bucket/*"]
  }
}
```

---

### Credential Reporting

| Command | Description |
|---|---|
| `GenerateCredentialReport` | Start generating a credential report (async) |
| `GetCredentialReport` | Download the most recent credential report |
| `GetServiceLastAccessedDetails` | Get last-accessed service details for an entity |

#### Example: Generate and get credential report

```json
{ "command": "GenerateCredentialReport", "params": {} }
```

Then retrieve:
```json
{ "command": "GetCredentialReport", "params": {} }
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateRole` | Create a new IAM role |
| `CreateUser` | Create a new IAM user |
| `AttachRolePolicy` | Attach a managed policy to a role |
| `PutRolePolicy` | Add or update an inline policy on a role |
| `UpdateAssumeRolePolicy` | Update a role trust policy |
| `DeleteRole` | Delete a role |
| `TagRole` | Tag a role |
| `UntagRole` | Remove tags from a role |

#### Example: Create a Lambda execution role

```json
{
  "command": "CreateRole",
  "params": {
    "RoleName": "MyLambdaRole",
    "AssumeRolePolicyDocument": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":\"lambda.amazonaws.com\"},\"Action\":\"sts:AssumeRole\"}]}"
  }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **All services** | IAM roles control access to every AWS service |
| **Lambda** | Check execution role via `GetFunctionConfiguration` → `Role` |
| **EC2** | Instance profiles link to IAM roles |
| **STS** | Use `STSTool` `GetCallerIdentity` to verify current identity |
| **CloudTrail / CloudWatch** | IAM API calls logged in CloudTrail |
| **CloudFormation** | IAM resources managed by stacks |

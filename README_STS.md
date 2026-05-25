# Aws Claw: STS Guide

Aws Claw exposes **STSTool** for AWS Security Token Service operations — verifying identity, assuming roles, getting temporary credentials, decoding authorization failures, and federation.

---

## 🗂️ Use Cases

- **Identity verification**: quickly confirm which account, IAM user, or role your current credentials represent
- **Cross-account access**: assume a role in another account to manage resources there
- **Authorization debugging**: decode encoded authorization failure messages to see which action was denied
- **MFA-protected operations**: get a short-lived session token using an MFA code before performing sensitive actions
- **OIDC/web identity**: assume a role using a web identity token (e.g., from GitHub Actions or a Kubernetes service account)
- **Federation**: get temporary credentials for federated users with a scoped-down policy
- **Access key lookup**: find which AWS account owns a given access key ID

---

## 💬 Sample Prompts

- *"Who am I? Show me my current AWS identity"*
- *"Assume the DeployRole in account 987654321098"*
- *"Assume the CrossAccountRole with external ID my-external-id"*
- *"I got an encoded authorization failure message — decode it for me"*
- *"Get a session token valid for 8 hours with MFA"*
- *"Which AWS account does access key AKIAIOSFODNN7EXAMPLE belong to?"*
- *"Get a federation token with read-only S3 access"*
- *"Assume the GitHubActionsRole using this OIDC token"*

---

## 🔧 STSTool Commands

| Command | Description |
|---|---|
| `GetCallerIdentity` | Get the account ID, ARN, and user ID of current credentials |
| `AssumeRole` | Assume an IAM role and get temporary credentials |
| `AssumeRoleWithSAML` | Assume a role using a SAML assertion |
| `AssumeRoleWithWebIdentity` | Assume a role using an OIDC/web identity token |
| `DecodeAuthorizationMessage` | Decode an encoded authorization failure message |
| `GetAccessKeyInfo` | Get the account ID for a given access key |
| `GetSessionToken` | Get temporary credentials (with optional MFA) |
| `GetFederationToken` | Get temporary credentials for a federated user |
| `GetDelegatedAccessToken` | Get a delegated access token |
| `GetWebIdentityToken` | Get a web identity token for a role |

---

### GetCallerIdentity — verify current identity

```json
{ "command": "GetCallerIdentity", "params": {} }
```

Returns: `Account`, `Arn`, `UserId`

---

### AssumeRole — assume an IAM role

```json
{
  "command": "AssumeRole",
  "params": {
    "RoleArn": "arn:aws:iam::123456789012:role/DeployRole",
    "RoleSessionName": "deploy-session",
    "DurationSeconds": 3600
  }
}
```

**Cross-account with external ID:**
```json
{
  "command": "AssumeRole",
  "params": {
    "RoleArn": "arn:aws:iam::987654321098:role/CrossAccountRole",
    "RoleSessionName": "cross-account-session",
    "ExternalId": "my-external-id",
    "DurationSeconds": 3600
  }
}
```

| Parameter | Required | Description |
|---|---|---|
| `RoleArn` | Yes | ARN of the role to assume |
| `RoleSessionName` | Yes | Name for the session |
| `DurationSeconds` | No | Token lifetime in seconds |
| `ExternalId` | No | External ID for cross-account access |
| `Policy` | No | Additional inline session policy (restricts permissions) |

---

### DecodeAuthorizationMessage — debug access denied errors

```json
{
  "command": "DecodeAuthorizationMessage",
  "params": { "EncodedMessage": "<encoded-message-string>" }
}
```

Reveals: the denied action, the resource, and the conditions that caused the denial.

---

### GetSessionToken — get MFA-protected credentials

```json
{
  "command": "GetSessionToken",
  "params": {
    "DurationSeconds": 28800,
    "SerialNumber": "arn:aws:iam::123456789012:mfa/alice",
    "TokenCode": "847291"
  }
}
```

---

### GetFederationToken — temporary credentials for federated users

```json
{
  "command": "GetFederationToken",
  "params": {
    "Name": "federated-user",
    "DurationSeconds": 3600,
    "Policy": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::my-bucket/*\"}]}"
  }
}
```

---

### AssumeRoleWithWebIdentity — OIDC federation

```json
{
  "command": "AssumeRoleWithWebIdentity",
  "params": {
    "RoleArn": "arn:aws:iam::123456789012:role/GitHubActionsRole",
    "RoleSessionName": "github-actions-deploy",
    "WebIdentityToken": "<oidc-token-from-provider>"
  }
}
```

---

### GetAccessKeyInfo — identify an access key

```json
{
  "command": "GetAccessKeyInfo",
  "params": { "AccessKeyId": "AKIAIOSFODNN7EXAMPLE" }
}
```

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **IAM** | Use `IAMTool` to manage the roles you assume |
| **Session Management** | Use `SessionTool` in awsclaw-general to switch profiles and regions |
| **All AWS services** | Every service call requires valid credentials from STS |

# Aws Claw: API Gateway Guide

Aws Claw exposes **APIGatewayTool** for managing AWS API Gateway REST APIs — inspecting resources, methods, integrations, stages, authorizers, usage plans, API keys, domain names, and VPC links. Includes test invocation of methods and authorizers.

---

## 🗂️ Use Cases

- **API discovery**: list all REST APIs and explore their resource trees
- **Integration inspection**: find which Lambda function, HTTP endpoint, or service backs each API method
- **Stage management**: view stage configurations, variables, and deployment history
- **Authorization debugging**: test an authorizer with a sample token without making a real API call
- **Method testing**: invoke a method against a stage for debugging without a client
- **Usage plan audit**: inspect API key throttling limits and quota configurations
- **Domain management**: view custom domain names and their base path mappings
- **VPC link inspection**: find APIs connected to private VPC resources
- **Export**: export API definitions as Swagger/OpenAPI for documentation or migration

---

## 💬 Sample Prompts

- *"List all my REST APIs"*
- *"Show me all the resources and methods in the checkout-api"*
- *"What Lambda function does the POST /orders method invoke?"*
- *"List all stages for the payment-api"*
- *"What stage variables are configured on the prod stage of payment-api?"*
- *"List all deployments for the checkout-api"*
- *"Test invoke the GET /health endpoint on the monitoring-api"*
- *"Test this Bearer token against the JWT authorizer on checkout-api"*
- *"What usage plans are configured and what are their throttle limits?"*
- *"List all API keys in my account"*
- *"What custom domain names are configured?"*
- *"List all VPC links"*
- *"Export the checkout-api as an OpenAPI spec"*

---

## 🔧 APIGatewayTool Commands

### Read Operations (68 commands total)

**APIs:**

| Command | Description |
|---|---|
| `GetRestApis` | List all REST APIs |
| `GetRestApi` | Get details of a specific API |
| `GetResources` | List all resources (endpoints) for an API |
| `GetResource` | Get a specific resource |
| `GetMethod` | Get a specific method definition |
| `GetMethodResponse` | Get a method response |
| `GetIntegration` | Get the backend integration for a method |
| `GetIntegrationResponse` | Get an integration response |
| `GetStages` | List all stages for an API |
| `GetStage` | Get a specific stage |
| `GetDeployments` | List deployments for an API |
| `GetDeployment` | Get a specific deployment |
| `GetAuthorizers` | List authorizers for an API |
| `GetAuthorizer` | Get a specific authorizer |
| `GetUsagePlans` | List usage plans |
| `GetUsagePlan` | Get a specific usage plan |
| `GetUsagePlanKeys` | List API keys in a usage plan |
| `GetUsagePlanKey` | Get a specific usage plan key |
| `GetUsage` | Get usage data for a usage plan |
| `GetApiKeys` | List API keys |
| `GetApiKey` | Get a specific API key |
| `GetDomainNames` | List custom domain names |
| `GetDomainName` | Get a specific custom domain |
| `GetBasePathMappings` | List base path mappings for a domain |
| `GetBasePathMapping` | Get a specific base path mapping |
| `GetVpcLinks` | List VPC links |
| `GetVpcLink` | Get a specific VPC link |
| `GetModels` | List models for an API |
| `GetModel` | Get a specific model |
| `GetRequestValidators` | List request validators |
| `GetRequestValidator` | Get a specific validator |
| `GetGatewayResponses` | List gateway error responses |
| `GetGatewayResponse` | Get a specific gateway response |
| `GetDocumentationParts` | List documentation parts |
| `GetDocumentationVersions` | List documentation versions |
| `GetClientCertificates` | List client certificates |
| `GetAccount` | Get API Gateway account settings |
| `GetExport` | Export API as Swagger/OpenAPI |
| `GetSdk` | Get SDK for an API stage |
| `GetTags` | Get tags for a resource |

#### Example: List all REST APIs

```json
{ "command": "GetRestApis", "params": { "limit": 25 } }
```

#### Example: Explore resources for an API

```json
{ "command": "GetResources", "params": { "restApiId": "abc123def", "limit": 100 } }
```

#### Example: Find what backs a method

```json
{
  "command": "GetIntegration",
  "params": {
    "restApiId": "abc123def",
    "resourceId": "xyz789",
    "httpMethod": "POST"
  }
}
```

#### Example: List stages

```json
{ "command": "GetStages", "params": { "restApiId": "abc123def" } }
```

#### Example: List usage plans and throttle limits

```json
{ "command": "GetUsagePlans", "params": { "limit": 25 } }
```

---

### Test Invocation

| Command | Description |
|---|---|
| `TestInvokeMethod` | Test invoke a method without deploying |
| `TestInvokeAuthorizer` | Test invoke an authorizer with a sample token |

#### Example: Test invoke a GET endpoint

```json
{
  "command": "TestInvokeMethod",
  "params": {
    "restApiId": "abc123def",
    "resourceId": "xyz789",
    "httpMethod": "GET",
    "pathWithQueryString": "/items?category=books"
  }
}
```

#### Example: Test invoke a POST endpoint with a body

```json
{
  "command": "TestInvokeMethod",
  "params": {
    "restApiId": "abc123def",
    "resourceId": "xyz789",
    "httpMethod": "POST",
    "pathWithQueryString": "/orders",
    "body": "{\"item\": \"book\", \"quantity\": 2}",
    "headers": { "Content-Type": "application/json" }
  }
}
```

#### Example: Test an authorizer

```json
{
  "command": "TestInvokeAuthorizer",
  "params": {
    "restApiId": "abc123def",
    "authorizerId": "auth001",
    "headers": { "Authorization": "Bearer eyJ..." }
  }
}
```

---

### Lifecycle Commands

| Command | Description |
|---|---|
| `CreateRestApi` | Create a new REST API |
| `CreateResource` | Add a resource to an API |
| `PutMethod` | Create or update a method |
| `CreateDeployment` | Deploy an API to a stage |
| `CreateStage` | Create a new stage |
| `CreateAuthorizer` | Create an authorizer |
| `CreateApiKey` | Create an API key |
| `CreateUsagePlan` | Create a usage plan |
| `CreateDomainName` | Create a custom domain |
| `ImportRestApi` | Import from Swagger/OpenAPI |
| `UpdateRestApi` | Update API settings |
| `UpdateStage` | Update stage settings or variables |
| `DeleteRestApi` | Delete an API |
| `DeleteResource` | Delete a resource |
| `DeleteMethod` | Delete a method |
| `DeleteStage` | Delete a stage |
| `DeleteAuthorizer` | Delete an authorizer |
| `DeleteApiKey` | Delete an API key |
| `DeleteUsagePlan` | Delete a usage plan |
| `DeleteDomainName` | Delete a custom domain |
| `TagResource` | Tag an API Gateway resource |
| `UntagResource` | Remove tags |

---

## 📋 CloudWatch Log Groups

API Gateway execution logs follow this pattern:
```
API-Gateway-Execution-Logs_<restApiId>/<stageName>
```

Access logs are configured per stage. Use `CloudWatchLogTool` `DescribeLogGroups` with prefix `API-Gateway-Execution-Logs_` to find them.

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **Lambda** | Most API methods integrate with Lambda — use `LambdaTool` |
| **CloudWatch Logs** | Execution logs at `API-Gateway-Execution-Logs_{id}/{stage}` |
| **IAM** | Authorizers and execution roles — use `IAMTool` |
| **Step Functions** | APIs can invoke state machines — use `StepFuncTool` |
| **DynamoDB** | APIs with DynamoDB direct integrations — use `DynamoDBTool` |
| **SNS / SQS** | APIs can publish to SNS/SQS directly |
| **CloudFormation** | APIs managed by CloudFormation/SAM |

# Aws Claw: EC2 Guide

Aws Claw exposes **EC2Tool** for full Amazon EC2 lifecycle management — launching and controlling instances, managing VPCs and networking, EBS volumes, snapshots, AMIs, security groups, Elastic IPs, key pairs, and launch templates.

---

## 🗂️ Use Cases

- **Instance management**: launch, start, stop, reboot, and terminate instances
- **Network setup**: create VPCs, subnets, internet/NAT gateways, and route tables
- **Security**: create security groups and manage inbound/outbound rules
- **Storage**: create EBS volumes, attach them to instances, and take snapshots
- **AMI management**: create golden AMIs from running instances, deregister old ones
- **Elastic IPs**: allocate and associate static IPs with instances
- **Cost optimization**: check spot price history before switching to spot instances
- **Debugging**: get instance console output when SSH is unavailable
- **Audit**: list all instances in a region with their state, VPC, and tags

---

## 💬 Sample Prompts

- *"List all running EC2 instances in us-east-1"*
- *"Show me the details of instance i-0abc1234def56789"*
- *"What is the console output for instance i-0abc1234def56789?"*
- *"Stop instance i-0abc1234def56789"*
- *"Launch a t3.micro instance with the Amazon Linux 2 AMI in subnet-12345"*
- *"List all my VPCs and their CIDR blocks"*
- *"What security group rules are on sg-12345?"*
- *"Add inbound HTTPS rule to security group sg-12345"*
- *"Create a snapshot of volume vol-12345"*
- *"What is the spot price history for m5.large instances?"*
- *"List all EBS volumes attached to instance i-0abc1234def56789"*
- *"Create an AMI from instance i-0abc1234def56789"*

---

## 🔧 EC2Tool Commands

### Instance Lifecycle

| Command | Description |
|---|---|
| `RunInstances` | Launch new instances |
| `StartInstances` | Start stopped instances |
| `StopInstances` | Stop running instances |
| `RebootInstances` | Reboot instances |
| `TerminateInstances` | Terminate instances permanently |

#### Example: Launch an instance

```json
{
  "command": "RunInstances",
  "params": {
    "ImageId": "ami-0abcdef1234567890",
    "InstanceType": "t3.micro",
    "MinCount": 1,
    "MaxCount": 1,
    "KeyName": "my-key",
    "SecurityGroupIds": ["sg-12345"],
    "SubnetId": "subnet-12345"
  }
}
```

---

### Query Commands

| Command | Description |
|---|---|
| `DescribeInstances` | Describe instances with optional filters |
| `DescribeInstanceStatus` | Get status checks for instances |
| `DescribeInstanceTypes` | Get CPU/memory/networking specs for instance types |
| `DescribeInstanceTypeOfferings` | List instance types available in a location |
| `DescribeImages` | Describe AMIs |
| `DescribeVpcs` | Describe VPCs |
| `DescribeSubnets` | Describe subnets |
| `DescribeSecurityGroups` | Describe security groups |
| `DescribeSecurityGroupRules` | Describe rules for a security group |
| `DescribeVolumes` | Describe EBS volumes |
| `DescribeSnapshots` | Describe EBS snapshots |
| `DescribeKeyPairs` | Describe key pairs |
| `DescribeAddresses` | Describe Elastic IP addresses |
| `DescribeRouteTables` | Describe route tables |
| `DescribeInternetGateways` | Describe internet gateways |
| `DescribeNatGateways` | Describe NAT gateways |
| `DescribeNetworkInterfaces` | Describe network interfaces |
| `DescribeFlowLogs` | Describe VPC flow logs |
| `DescribeLaunchTemplates` | Describe launch templates |
| `DescribeTransitGateways` | Describe transit gateways |
| `DescribeVpcEndpoints` | Describe VPC endpoints |
| `DescribeVpcPeeringConnections` | Describe VPC peering connections |
| `DescribeSpotPriceHistory` | Get spot instance price history |
| `DescribeRegions` | List available AWS regions |
| `DescribeAvailabilityZones` | List availability zones |
| `DescribeAccountAttributes` | Get EC2 account limits |
| `GetConsoleOutput` | Get console output from an instance |
| `GetPasswordData` | Get Windows instance password data |
| `DescribeTags` | Describe tags across EC2 resources |

#### Example: Find all running instances

```json
{
  "command": "DescribeInstances",
  "params": { "Filters": [{ "Name": "instance-state-name", "Values": ["running"] }] }
}
```

#### Example: List volumes attached to an instance

```json
{
  "command": "DescribeVolumes",
  "params": { "Filters": [{ "Name": "attachment.instance-id", "Values": ["i-0abc1234"] }] }
}
```

---

### VPC and Networking

| Command | Description |
|---|---|
| `CreateVpc` | Create a VPC |
| `DeleteVpc` | Delete a VPC |
| `CreateSubnet` | Create a subnet |
| `DeleteSubnet` | Delete a subnet |
| `CreateInternetGateway` | Create an internet gateway |
| `AttachInternetGateway` | Attach internet gateway to a VPC |
| `DetachInternetGateway` | Detach internet gateway |
| `DeleteInternetGateway` | Delete an internet gateway |
| `CreateNatGateway` | Create a NAT gateway |
| `DeleteNatGateway` | Delete a NAT gateway |
| `CreateRouteTable` | Create a route table |
| `DeleteRouteTable` | Delete a route table |
| `CreateRoute` | Add a route to a route table |
| `DeleteRoute` | Remove a route |
| `AssociateRouteTable` | Associate a route table with a subnet |
| `DisassociateRouteTable` | Disassociate a route table |

---

### Security Groups

| Command | Description |
|---|---|
| `CreateSecurityGroup` | Create a security group |
| `DeleteSecurityGroup` | Delete a security group |
| `AuthorizeSecurityGroupIngress` | Add inbound rules |
| `AuthorizeSecurityGroupEgress` | Add outbound rules |
| `RevokeSecurityGroupIngress` | Remove inbound rules |
| `RevokeSecurityGroupEgress` | Remove outbound rules |

#### Example: Allow HTTPS inbound

```json
{
  "command": "AuthorizeSecurityGroupIngress",
  "params": {
    "GroupId": "sg-12345",
    "IpPermissions": [{
      "IpProtocol": "tcp",
      "FromPort": 443,
      "ToPort": 443,
      "IpRanges": [{ "CidrIp": "0.0.0.0/0" }]
    }]
  }
}
```

---

### Storage (EBS and Snapshots)

| Command | Description |
|---|---|
| `CreateVolume` | Create an EBS volume |
| `DeleteVolume` | Delete a volume |
| `AttachVolume` | Attach a volume to an instance |
| `DetachVolume` | Detach a volume |
| `CreateSnapshot` | Create a snapshot |
| `DeleteSnapshot` | Delete a snapshot |
| `CreateImage` | Create an AMI from an instance |
| `DeregisterImage` | Delete an AMI |

---

### Elastic IPs and Key Pairs

| Command | Description |
|---|---|
| `AllocateAddress` | Allocate an Elastic IP |
| `ReleaseAddress` | Release an Elastic IP |
| `AssociateAddress` | Associate Elastic IP with an instance |
| `DisassociateAddress` | Disassociate an Elastic IP |
| `CreateKeyPair` | Create an SSH key pair |
| `DeleteKeyPair` | Delete a key pair |

---

### Tagging

| Command | Description |
|---|---|
| `CreateTags` | Tag one or more resources |
| `DeleteTags` | Remove tags from resources |

---

## 🔗 Related Services

| Integration | Description |
|---|---|
| **CloudWatch** | VPC Flow Logs deliver to CloudWatch — use `DescribeFlowLogs` to find the log group |
| **IAM** | Instance profiles link to IAM roles — use `IAMTool` to inspect |
| **CloudFormation** | EC2 resources created by stacks — use `DescribeStackResources` |
| **S3** | AMI snapshots stored in S3; user data scripts often reference S3 |
| **EBS** | Use `DescribeVolumes` filtered by `attachment.instance-id` |

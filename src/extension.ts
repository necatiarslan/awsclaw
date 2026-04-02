import * as vscode from 'vscode';
import * as ui from './common/UI';
import { StatusBarItem } from './statusbar/StatusBarItem';
import { Session } from './common/Session';
import { ClientManager } from './common/ClientManager';
import * as stsAPI from './sts/API';
import { AIHandler } from './chat/AIHandler';
import { CloudWatchLogView } from './cloudwatch/CloudWatchLogView';
import { S3Explorer } from './s3/S3Explorer';
import { CommandHistoryView } from './common/CommandHistoryView';
import { ServiceAccessView } from './common/ServiceAccessView';
import { McpManager } from './mcp/McpManager';
import { McpManageView } from './mcp/McpManageView';
import { initializeLicense, isLicenseValid, promptForLicense, clearLicense } from "./common/License";

export function activate(context: vscode.ExtensionContext) {
	ui.logToOutput('Awsclaw is now active!');

	// Initialize Core Services
	initializeLicense(context);
	const session = new Session(context);
	session.IsProVersion = isLicenseValid();
	
	new AIHandler();
	const statusBar = new StatusBarItem();
	const clientManager = ClientManager.Instance;
	const mcpManager = new McpManager(context);

	// Register disposables
	context.subscriptions.push(
		session,
		statusBar,
		clientManager,
		mcpManager,
		{ dispose: () => ui.dispose() }
	);

	if (Session.Current?.IsHostSupportLanguageTools()) {
		// Register language model tools dynamically from generated registry
		const { TOOLS } = require('./common/ToolRegistry');
		for (const tool of TOOLS) {
			context.subscriptions.push(
				vscode.lm.registerTool(tool.name, tool.instance)
			);
		}
		ui.logToOutput(`Registered ${TOOLS.length} language model tools`);
	}
	else {
		ui.logToOutput(`Language model tools registration skipped for ${Session.Current?.HostAppName}`);
	}

	ui.logToOutput('Language model tools registered');

	// Register Commands
	context.subscriptions.push(
		vscode.commands.registerCommand('awsclaw.AskAwsclaw', async () => { await AIHandler.Current.askAI(); }),

		vscode.commands.registerCommand('awsclaw.SetAwsEndpoint', async () => { Session.Current?.SetAwsEndpoint(); }),

		vscode.commands.registerCommand('awsclaw.SetDefaultRegion', async () => { Session.Current?.SetAwsRegion(); }),

		vscode.commands.registerCommand('awsclaw.SetAwsReadonlyMode', async () => { await Session.Current?.SetAwsReadonlyMode(); }),

		vscode.commands.registerCommand('awsclaw.RefreshCredentials', () => { Session.Current?.RefreshCredentials(); }),

		vscode.commands.registerCommand('awsclaw.ListAwsProfiles', () => { StatusBarItem.Current.ListAwsProfiles(); }),

		vscode.commands.registerCommand('awsclaw.SetAwsProfile', () => { StatusBarItem.Current.SetAwsProfile(); }),

		vscode.commands.registerCommand('awsclaw.TestAwsConnection', async () => {
			const result = await stsAPI.TestAwsConnection();
			if (result.isSuccessful) {
				ui.showInfoMessage('AWS connectivity test successful.');
			} else {
				ui.showErrorMessage('AWS connectivity test failed.', result.error);
			}
		}),

		vscode.commands.registerCommand('awsclaw.OpenCloudWatchView', async (logGroup: string, logStream?: string) => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			const region = Session.Current.AwsRegion;
			const stream = logStream || '';
			CloudWatchLogView.Render(Session.Current.ExtensionUri, region, logGroup, stream);
		}),


		vscode.commands.registerCommand('awsclaw.OpenS3ExplorerView', async (bucket: string, key?: string) => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			S3Explorer.Render(Session.Current.ExtensionUri, bucket, key);
		}),

        vscode.commands.registerCommand('awsclaw.ShowCommandHistory', () => {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            CommandHistoryView.Render(Session.Current.ExtensionUri);
        }),

        vscode.commands.registerCommand('awsclaw.OpenServiceAccessView', () => {
            if (!Session.Current) {
                ui.showErrorMessage('Session not initialized', new Error('No session'));
                return;
            }
            ServiceAccessView.Render(Session.Current.ExtensionUri);
        }),

		vscode.commands.registerCommand('awsclaw.ActivatePro', () => {
			if (Session.Current?.IsProVersion) {
				ui.showInfoMessage('You already have an active Pro license!');
				return;
			}

			let buyUrl = 'https://necatiarslan.lemonsqueezy.com/checkout/buy/077f6804-ab37-49b1-b8e4-1c63870d728f';
			if (Session.Current?.IsDebugMode()) {
				buyUrl = 'https://necatiarslan.lemonsqueezy.com/checkout/buy/ec1d3673-0b2a-423d-87f7-1822815bc665';
			}

			vscode.env.openExternal(vscode.Uri.parse(buyUrl));
			vscode.commands.executeCommand('awsclaw.EnterLicenseKey');
		}),

		vscode.commands.registerCommand('awsclaw.EnterLicenseKey', async () => {
			if (Session.Current?.IsProVersion) {
				ui.showInfoMessage('You already have an active Pro license!');
				return;
			}

			await promptForLicense(context);
			if (Session.Current) {
				Session.Current.IsProVersion = isLicenseValid();
			}
		}),

		vscode.commands.registerCommand('awsclaw.ResetLicenseKey', async () => {
			await clearLicense();
			ui.showInfoMessage('License key has been reset. Please enter a new license key to activate Pro features.');
			if (Session.Current) {
				Session.Current.IsProVersion = false;
			}
		}),

		vscode.commands.registerCommand('awsclaw.StartMcpServer', async () => {
			if (!Session.Current) {
				ui.showErrorMessage('Session not initialized', new Error('No session'));
				return;
			}
			if(Session.Current.IsHostSupportLanguageTools()) {
				ui.showInfoMessage('MCP server is not required in VsCode');
				return;
			}
			await mcpManager.startSession();
		}),

		vscode.commands.registerCommand('awsclaw.StopMcpServers', () => {
			if(!Session.Current) { return; }
			if(Session.Current.IsHostSupportLanguageTools()) {
				ui.showInfoMessage('MCP server is not required in VsCode');
				return;
			}
			mcpManager.stopAll();
			ui.showInfoMessage('All MCP sessions stopped.');
		}),

		vscode.commands.registerCommand('awsclaw.OpenMcpManageView', () => {
			if(!Session.Current) { return; }
			if(Session.Current.IsHostSupportLanguageTools()) {
				ui.showInfoMessage('MCP server is not required in VsCode');
				return;
			}
			McpManageView.Render(context.extensionUri, mcpManager);
		}),

		vscode.commands.registerCommand('awsclaw.LoadMoreResults', async (paginationContext: any) => {
			if (!paginationContext) {
				ui.showErrorMessage('Pagination context not available', new Error('No pagination context'));
				return;
			}

			// Add pagination token to params based on tokenType
			const updatedParams = { ...paginationContext.params };
			if (paginationContext.tokenType === 'NextContinuationToken') {
				updatedParams.ContinuationToken = paginationContext.paginationToken;
			} else if (paginationContext.tokenType === 'NextToken') {
				updatedParams.NextToken = paginationContext.paginationToken;
			} else if (paginationContext.tokenType === 'NextMarker') {
				updatedParams.Marker = paginationContext.paginationToken;
			}

			// Create and send a new chat request with the pagination params
			const prompt = `Continue loading more results for: ${paginationContext.command} with previous parameters`;
			await AIHandler.Current.askAI(prompt);
		})
	);
}

export function deactivate() {
	ui.logToOutput('Awsclaw is now de-active!');
}


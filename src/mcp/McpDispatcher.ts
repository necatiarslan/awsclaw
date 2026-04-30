import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BaseTool } from '../common/BaseTool';
import { Session } from '../common/Session';
import { needsConfirmation, confirmProceed } from '../common/ActionGuard';
import { McpClientCapabilities, McpOutboundRequester, McpRequest, McpResponse } from './types';
import { McpSession } from './McpSession';

interface ToolRecord {
    name: string;
    instance: BaseTool<any>;
}

interface ResourceRecord {
    uri: string;
    name: string;
    description?: string;
    mimeType?: string;
}

export class McpDispatcher {
    private readonly tools: Map<string, ToolRecord>;
    private readonly toolMetadata: Map<string, any>;
    private readonly resources: ResourceRecord[];
    private clientCapabilities?: McpClientCapabilities;
    private outboundRequester?: McpOutboundRequester;

    constructor(enabledTools: Set<string>, options?: { outboundRequester?: McpOutboundRequester }) {
        this.tools = new Map<string, ToolRecord>();
        this.toolMetadata = new Map<string, any>();
        this.outboundRequester = options?.outboundRequester;
        this.resources = [
            {
                uri: `file://${path.join(__dirname, '../../README_AWS_SERVICES.md')}`,
                name: 'README_AWS_SERVICES',
                description: 'Reference for AWS services supported by Awsclaw MCP tools',
                mimeType: 'text/markdown'
            }
        ];
        
        try {
            this.loadToolsFromPackageJson();
        } catch (error: any) {
            throw new Error(`Failed to load MCP tool definitions: ${error.message}`);
        }
        
        // Load tools dynamically from generated registry
        const { TOOLS } = require('../common/ToolRegistry');
        const allTools: ToolRecord[] = TOOLS.map((t: any) => ({
            name: t.name,
            instance: t.instance as BaseTool<any>
        }));

        for (const t of allTools) {
            if (enabledTools.has(t.name)) {
                this.tools.set(t.name, t);
            }
        }
    }

    public setOutboundRequester(requester: McpOutboundRequester): void {
        this.outboundRequester = requester;
    }

    public listTools(): any[] {
        return Array.from(this.tools.keys())
            .map(name => {
                const metadata = this.toolMetadata.get(name);
                if (!metadata) {
                    return null; // Skip tools without metadata
                }
                return {
                    name: metadata.name,
                    description: metadata.modelDescription || metadata.userDescription || '',
                    inputSchema: metadata.inputSchema || { type: 'object' }
                };
            })
            .filter(tool => tool !== null);
    }

    private listResources(): any[] {
        return this.resources.map(r => ({
            uri: r.uri,
            name: r.name,
            description: r.description || '',
            mimeType: r.mimeType || 'text/plain'
        }));
    }

    private loadToolsFromPackageJson(): void {
        const packageJsonPath = path.join(__dirname, '../../package.json');
        
        if (!fs.existsSync(packageJsonPath)) {
            throw new Error('package.json not found');
        }

        let packageJson: any;
        try {
            const raw = fs.readFileSync(packageJsonPath, 'utf8');
            packageJson = JSON.parse(raw);
        } catch (error: any) {
            if (error instanceof SyntaxError) {
                throw new Error('Invalid JSON in package.json');
            }
            throw error;
        }

        const languageModelTools = packageJson?.contributes?.languageModelTools;
        if (!Array.isArray(languageModelTools)) {
            throw new Error('languageModelTools section missing in package.json');
        }

        for (const tool of languageModelTools) {
            if (tool.name) {
                this.toolMetadata.set(tool.name, tool);
            }
        }
    }

    public async handle(request: McpRequest): Promise<McpResponse | undefined> {
        try {
            McpSession.Current?.writeLine(`Request Method: ${request.method}`);

            if (request.method === 'initialize') {
                this.clientCapabilities = request.params?.capabilities as McpClientCapabilities | undefined;
                return {
                    id: request.id!,
                    jsonrpc: '2.0',
                    result: {
                        protocolVersion: '2024-11-05',
                        capabilities: {
                            tools: {},
                            resources: {},
                            prompts: {}
                        },
                        serverInfo: {
                            name: 'awsclaw',
                            version: '1.0.0'
                        }
                    }
                };
            }

            if (request.method === 'notifications/initialized' || request.method === 'initialized') {
                return undefined;
            }

            if (request.id === undefined || request.id === null) {
                return undefined;
            }

            if (request.method === 'list_tools' || request.method === 'tools/list') {
                return { 
                    id: request.id!, 
                    jsonrpc: '2.0', 
                    result: { 
                        tools: this.listTools()
                    } 
                };
            }

            if (request.method === 'list_resources' || request.method === 'resources/list') {
                return {
                    id: request.id!,
                    jsonrpc: '2.0',
                    result: {
                        resources: this.listResources()
                    }
                };
            }

            if (request.method === 'read_resource' || request.method === 'resources/read') {
                const uri = request.params?.uri as string;
                if (!uri) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: 'uri is required', code: -32602 } };
                }

                const resource = this.resources.find(r => r.uri === uri);
                if (!resource) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: `Resource not found: ${uri}`, code: -32004 } };
                }

                try {
                    const filePath = uri.replace(/^file:\/\//, '');
                    const content = fs.readFileSync(filePath, 'utf8');
                    return {
                        id: request.id!,
                        jsonrpc: '2.0',
                        result: {
                            contents: [
                                {
                                    uri: resource.uri,
                                    mimeType: resource.mimeType || 'text/plain',
                                    text: content
                                }
                            ]
                        }
                    };
                } catch (error: any) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: error?.message || 'Failed to read resource', code: -32005 } };
                }
            }

            if (request.method === 'call_tool' || request.method === 'tools/call') {
                const toolName = (request.params?.tool || request.params?.name) as string;
                const args = (request.params?.params || request.params?.arguments) as Record<string, any> || {};
                const command = (request.params?.command || args?.command) as string;
                const params = (args?.params || args) as Record<string, any>;

                McpSession.Current?.writeLine(`Calling toolName: ${toolName}, command: ${command}`);

                if (!toolName || !command) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: 'tool and command (or name and arguments) are required', code: -32602 } };
                }

                const tool = this.tools.get(toolName);
                if (!tool) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: `Tool ${toolName} is not enabled for MCP`, code: -32601 } };
                }

                if (!Session.Current) {
                    return { id: request.id!, jsonrpc: '2.0', error: { message: 'Session not initialized in VS Code', code: -32000 } };
                }

                if (needsConfirmation(command)) {
                    let approval: { approved: boolean; action: 'accept' | 'decline' | 'cancel'; message: string };

                    if (!this.supportsFormElicitation()) {
                        // Fallback to legacy modal confirmation when elicitation not supported
                        const confirmed = await confirmProceed(command, params);
                        approval = {
                            approved: confirmed,
                            action: confirmed ? 'accept' : 'decline',
                            message: confirmed ? 'Approved' : `User declined action command: ${command}`
                        };
                    } else {
                        if (!this.outboundRequester) {
                            return {
                                id: request.id!,
                                jsonrpc: '2.0',
                                error: {
                                    message: 'This action requires user approval, but outbound MCP requests are not available in this transport.',
                                    code: -32603
                                }
                            };
                        }

                        approval = await this.requestActionApproval(command, params);
                    }

                    if (!approval.approved) {
                        const code = approval.action === 'cancel' ? -32000 : -32001;
                        return {
                            id: request.id!,
                            jsonrpc: '2.0',
                            error: {
                                message: approval.message,
                                code
                            }
                        };
                    }
                }

                const s = Session.Current;
                const originalDisabledTools = s.DisabledTools;
                const originalDisabledCommands = s.DisabledCommands;

                s.DisabledTools = new Set();
                s.DisabledCommands = new Map();

                const tokenSource = new vscode.CancellationTokenSource();
                try {
                    const result = await tool.instance.invoke({
                        input: { command, params, skipConfirmation: true }
                    } as any, tokenSource.token);

                    const raw = (result as any).output ?? (result as any).content ?? result;
                    const content = Array.isArray(raw?.content) ? raw.content : Array.isArray(raw) ? raw : undefined;
                    let text: string | undefined;
                    if (content && content.length > 0) {
                        text = content.map((c: any) => c.value ?? c.text ?? '').join('');
                    } else if (typeof raw === 'string') {
                        text = raw;
                    }

                    if (!text) {
                        return { id: request.id!, jsonrpc: '2.0', result: { content: [{ type: 'text', text: JSON.stringify(raw) }] } };
                    }

                    let parsed: any = text;
                    try {
                        parsed = JSON.parse(text);
                    } catch (e) {
                        parsed = text;
                    }

                    return { 
                        id: request.id!, 
                        jsonrpc: '2.0', 
                        result: { 
                            content: [{ type: 'text', text: typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2) }] 
                        } 
                    };
                } finally {
                    tokenSource.dispose();
                    s.DisabledTools = originalDisabledTools;
                    s.DisabledCommands = originalDisabledCommands;
                }
            }

            return { id: request.id!, jsonrpc: '2.0', error: { message: `Method not found: ${request.method}`, code: -32601 } };
        } catch (error: any) {
            return { id: request.id!, jsonrpc: '2.0', error: { message: error?.message || 'Internal error', code: -32603, data: error?.stack } };
        }
    }

    private supportsFormElicitation(): boolean {
        const elicitation = this.clientCapabilities?.elicitation;
        if (!elicitation) {
            return false;
        }

        // Per MCP compatibility note, empty object implies form mode support.
        return Object.keys(elicitation).length === 0 || elicitation.form !== undefined;
    }

    private summarizeParams(params?: Record<string, any>): string {
        if (!params || Object.keys(params).length === 0) {
            return '(none)';
        }

        const lines: string[] = [];
        for (const [key, raw] of Object.entries(params)) {
            lines.push(`${key}: ${this.formatParamValue(key, raw)}`);
        }
        return lines.join('\n');
    }

    private formatParamValue(key: string, value: any): string {
        if (/(body|payload|zipfile|secret|token|password|credential|authorization)/i.test(key)) {
            return '[...]';
        }

        if (typeof value === 'string') {
            return value.length > 120 ? `${value.slice(0, 40)}...` : value;
        }

        if (typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
            return String(value);
        }

        const serialized = JSON.stringify(value);
        return serialized.length > 120 ? `${serialized.slice(0, 40)}...` : serialized;
    }

    private async requestActionApproval(command: string, params?: Record<string, any>): Promise<{ approved: boolean; action: 'accept' | 'decline' | 'cancel'; message: string }> {
        const requester = this.outboundRequester;
        if (!requester) {
            return {
                approved: false,
                action: 'cancel',
                message: 'Action requires approval but approval transport is unavailable.'
            };
        }

        const response = await requester(
            'elicitation/create',
            {
                mode: 'form',
                message: [
                    `Approve action command: ${command}`,
                    '',
                    'Parameters:',
                    this.summarizeParams(params)
                ].join('\n'),
                requestedSchema: {
                    type: 'object',
                    properties: {
                        approve: {
                            type: 'boolean',
                            title: 'Approve',
                            description: `Allow execution of ${command}`,
                            default: false
                        }
                    },
                    required: ['approve']
                }
            },
            120000
        );

        const action = (response?.action as 'accept' | 'decline' | 'cancel' | undefined) ?? 'cancel';
        if (action !== 'accept') {
            return {
                approved: false,
                action,
                message: action === 'decline'
                    ? `User declined action command: ${command}`
                    : `User cancelled approval request for command: ${command}`
            };
        }

        const approved = response?.content?.approve === true;
        if (!approved) {
            return {
                approved: false,
                action: 'decline',
                message: `Approval form was submitted without confirmation for command: ${command}`
            };
        }

        return {
            approved: true,
            action: 'accept',
            message: 'Approved'
        };
    }
}

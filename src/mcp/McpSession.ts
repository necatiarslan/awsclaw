import * as vscode from 'vscode';
import { McpDispatcher } from './McpDispatcher';
import { McpRequest, McpResponse } from './types';

interface PendingRequest {
    resolve: (value: any) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
}

export class McpSession implements vscode.Pseudoterminal {
    public static Current: McpSession | undefined;
    private readonly writeEmitter = new vscode.EventEmitter<string>();
    private readonly closeEmitter = new vscode.EventEmitter<void>();
    onDidWrite: vscode.Event<string> = this.writeEmitter.event;
    onDidClose?: vscode.Event<void>;

    private buffer = '';
    private readonly pending = new Map<string | number, PendingRequest>();
    private requestSeq = 1;

    constructor(
        private readonly sessionId: number,
        private readonly dispatcher: McpDispatcher,
        private readonly onSessionClosed: (id: number) => void
    ) {
        const outboundRequester = (method: string, params: Record<string, any>, timeoutMs = 120000): Promise<any> => {
            const id = `server-${this.requestSeq++}`;
            this.writeLine(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.pending.delete(id);
                    reject(new Error(`Timed out waiting for response to ${method}`));
                }, timeoutMs);

                this.pending.set(id, {
                    resolve,
                    reject,
                    timer
                });
            });
        };

        this.dispatcher.setOutboundRequester(outboundRequester);
        McpSession.Current = this;
        this.onDidClose = this.closeEmitter.event;
    }

    open(): void {
        this.writeLine(`Awsclaw MCP session ${this.sessionId} started.`);
        this.writeLine('Type Ctrl+C to close this session.');
    }

    close(): void {
        for (const [id, request] of this.pending.entries()) {
            clearTimeout(request.timer);
            request.reject(new Error(`Session closed before response was received for request ${id}`));
        }
        this.pending.clear();
        this.writeLine(`MCP session ${this.sessionId} closed.`);
        this.closeEmitter.fire();
        this.onSessionClosed(this.sessionId);
        McpSession.Current = undefined;
    }

    handleInput(data: string): void {
        if (data === '\u0003') {
            this.close();
            return;
        }

        this.buffer += data;
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() || '';

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) {
                continue;
            }

            let request: McpRequest | undefined;
            try {
                request = JSON.parse(trimmed);
            } catch (error: any) {
                this.writeLine(JSON.stringify({ error: { message: 'Invalid JSON', detail: error?.message } }));
                continue;
            }

            if (request) {
                if (this.isResponseMessage(request)) {
                    this.settlePending(request);
                    continue;
                }
                this.dispatch(request);
            }
        }
    }

    private isResponseMessage(message: any): boolean {
        return (
            !!message &&
            typeof message === 'object' &&
            message.id !== undefined &&
            message.method === undefined &&
            (Object.prototype.hasOwnProperty.call(message, 'result') || Object.prototype.hasOwnProperty.call(message, 'error'))
        );
    }

    private settlePending(message: any): void {
        const request = this.pending.get(message.id);
        if (!request) {
            return;
        }

        clearTimeout(request.timer);
        this.pending.delete(message.id);
        if (Object.prototype.hasOwnProperty.call(message, 'error')) {
            request.reject(new Error(message.error?.message || 'MCP client returned an error'));
            return;
        }

        request.resolve(message.result);
    }

    private async dispatch(request: McpRequest): Promise<void> {
        const response = await this.dispatcher.handle(request);
        if (response) {
            this.writeLine(JSON.stringify(response));
        }
    }

    public writeLine(text: string): void {
        this.writeEmitter.fire(text + '\r\n');
    }
}

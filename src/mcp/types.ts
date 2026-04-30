import { Readable, Writable } from 'stream';

export interface McpRequest {
    jsonrpc?: '2.0';
    id?: string | number;
    method: string;
    params?: Record<string, any>;
}

export interface McpResponse {
    jsonrpc: '2.0';
    id: string | number;
    result?: any;
    error?: {
        message: string;
        code?: number;
        data?: any;
    };
}

export interface McpClientCapabilities {
    elicitation?: {
        form?: object;
        url?: object;
    };
    [key: string]: any;
}

export type McpOutboundRequester = (
    method: string,
    params: Record<string, any>,
    timeoutMs?: number
) => Promise<any>;

export interface McpSessionStreams {
    input: Readable;
    output: Writable;
}

export interface McpSessionConfig {
    enabledTools: Set<string>;
}

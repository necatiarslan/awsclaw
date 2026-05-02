import * as net from 'net';

const port = parseInt(process.env.AWSCLAW_MCP_PORT || '37114', 10) || 37114;
const host = process.env.AWSCLAW_MCP_HOST || '127.0.0.1';

const socket = net.createConnection({ host, port }, () => {
    process.stdin.pipe(socket);
    socket.pipe(process.stdout);
    socket.on('end', () => process.exit(0));
});

socket.on('error', (err: NodeJS.ErrnoException) => {
    process.stderr.write(
        `Awsclaw MCP bridge is not running on ${host}:${port}.\n` +
        `Please run "Awsclaw: Start MCP Server" in the command palette first.\n` +
        `Error: ${err.message}\n`
    );
    process.exit(1);
});

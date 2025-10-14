
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { server } from "./server";

// Start the server
async function main() {
  const args = process.argv.slice(2);
  const type = args.at(0) || "stdio";
  if (type === "sse") {
    const app = express();
    let transport: SSEServerTransport;
    app.get("/sse", async (req, res) => {
      console.error("SSE connection request received");
      transport = new SSEServerTransport("/messages", res);
      await server.connect(transport);
    });
    app.post("/messages", async (req, res) => {
      // Note: to support multiple simultaneous connections, these messages will
      // need to be routed to a specific matching transport. (This logic isn't
      // implemented here, for simplicity.)
      console.error("Message post received");
      await transport.handlePostMessage(req, res);
    });
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.error(`MCP Server running on sse, listening on port ${port}`);
    });
  } else if (type === "stdio") {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
  } else {
    throw new Error(`Unknown transport type: ${type}`);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
#!/usr/bin/env node

/**
 * Test: Parameter Schema and Elicitation Patterns
 * This test specifically examines how parameter requirements work
 * and demonstrates different elicitation patterns
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

async function testParameterSchemas() {
  console.log("📊 Testing Parameter Schemas and Elicitation Patterns\n");

  // Start the MCP server as a child process
  const serverProcess = spawn("node", ["./build/index.js"], {
    cwd: projectRoot,
    stdio: ["pipe", "pipe", "inherit"]
  });

  // Create client transport using the server's stdio
  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin
  });

  const client = new Client({
    name: "parameter-schema-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    // Connect to server
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Test 1: Test new rain prediction tool specifically
    console.log("🧪 Test 1: Testing rain prediction elicitation...");
    console.log("===============================================");
    
    try {
      console.log("Calling rain_prediction_with_elicitation with no parameters...");
      const result = await client.callTool("rain_prediction_with_elicitation", {});
      
      console.log("Response type:", result.isError ? "Error with guidance" : "Success");
      if (result.content && result.content[0]) {
        const responseText = result.content[0].text;
        console.log("Contains location examples:", responseText.includes("Seattle"));
        console.log("Contains elicitation note:", responseText.includes("elicitation"));
        console.log("Contains parameter guidance:", responseText.includes("Location Required"));
      }
    } catch (error) {
      console.log("Rain prediction error:", error.message);
    }

    // Test 2: Test with partial parameters
    console.log("\n🧪 Test 2: Testing with partial parameters...");
    try {
      console.log("Calling rain_prediction_with_elicitation with location only...");
      const result = await client.callTool("rain_prediction_with_elicitation", {
        location: "Tokyo"
      });
      
      if (result.content && result.content[0]) {
        const responseText = result.content[0].text;
        console.log("✅ Got rain prediction for Tokyo");
        console.log("Includes forecast period:", responseText.includes("Forecast Period"));
        console.log("Includes elicitation test result:", responseText.includes("Elicitation Test Result"));
      }
    } catch (error) {
      console.log("Partial parameters test error:", error.message);
    }

    // Test 3: Test with all parameters
    console.log("\n🧪 Test 3: Testing with all parameters...");
    try {
      console.log("Calling rain_prediction_with_elicitation with all parameters...");
      const result = await client.callTool("rain_prediction_with_elicitation", {
        location: "San Francisco",
        hours_ahead: 48,
        include_probability: true
      });
      
      if (result.content && result.content[0]) {
        const responseText = result.content[0].text;
        console.log("✅ Got complete rain prediction");
        console.log("Includes detailed probability:", responseText.includes("Detailed Probability"));
        console.log("Includes confidence level:", responseText.includes("Confidence Level"));
      }
    } catch (error) {
      console.log("All parameters test error:", error.message);
    }

    console.log("\n✅ All elicitation tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    await client.close();
    serverProcess.kill();
    console.log("🧹 Cleaned up connections");
  }
}

// Run the test
testParameterSchemas().catch(console.error);
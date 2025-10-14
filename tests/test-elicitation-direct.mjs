#!/usr/bin/env node

/**
 * Direct elicitation test - connects to running MCP server
 */

import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function testElicitation() {
  console.log("🌧️ Testing Rain Prediction Elicitation\n");

  // Connect to the running MCP server
  const transport = new SSEClientTransport(
    new URL("http://localhost:3001/sse")
  );

  const client = new Client({
    name: "elicitation-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Test 1: List tools to see our new rain prediction tool
    console.log("🧪 Test 1: Listing available tools...");
    const tools = await client.listTools();
    
    const rainTool = tools.tools.find(t => t.name === "rain_prediction_with_elicitation");
    if (rainTool) {
      console.log("✅ Found rain_prediction_with_elicitation tool");
      console.log(`   Description: ${rainTool.description}`);
      console.log(`   Parameters: ${Object.keys(rainTool.inputSchema?.properties || {}).join(", ")}`);
    } else {
      console.log("❌ Rain prediction tool not found");
      console.log("Available tools:", tools.tools.map(t => t.name).join(", "));
    }

    console.log("\n");

    // Test 2: Call rain prediction with no parameters (should trigger elicitation attempt)
    console.log("🧪 Test 2: Calling rain prediction with no parameters...");
    try {
      const result = await client.callTool("rain_prediction_with_elicitation", {});
      
      console.log("Response received!");
      console.log("Is error:", !!result.isError);
      
      if (result.content && result.content[0]) {
        const text = result.content[0].text;
        console.log("Contains 'Location Required':", text.includes("Location Required"));
        console.log("Contains 'elicitation':", text.includes("elicitation"));
        console.log("Contains examples:", text.includes("Seattle"));
        
        // Show a snippet of the response
        console.log("\nResponse snippet:");
        console.log(text.substring(0, 200) + "...");
      }
    } catch (error) {
      console.log("Error calling tool:", error.message);
    }

    console.log("\n");

    // Test 3: Call with location parameter
    console.log("🧪 Test 3: Calling rain prediction with location...");
    try {
      const result = await client.callTool("rain_prediction_with_elicitation", {
        location: "Tokyo"
      });
      
      if (result.content && result.content[0]) {
        const text = result.content[0].text;
        console.log("✅ Got rain prediction for Tokyo");
        console.log("Contains forecast:", text.includes("Forecast Period"));
        console.log("Contains test result:", text.includes("Elicitation Test Result"));
        
        // Show a snippet
        console.log("\nResponse snippet:");
        console.log(text.substring(0, 300) + "...");
      }
    } catch (error) {
      console.log("Error calling tool with location:", error.message);
    }

    console.log("\n✅ Elicitation test completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await client.close();
    console.log("🧹 Disconnected from server");
  }
}

testElicitation().catch(console.error);
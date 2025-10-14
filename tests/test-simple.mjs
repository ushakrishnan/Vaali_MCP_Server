#!/usr/bin/env node

/**
 * Simple test to demonstrate tools/list method
 * Uses compiled JS version to avoid ts-node issues
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";

async function testToolsList() {
  console.log("🔧 Simple Tools/List Test\n");

  // Create client transport - let's test using the compiled server
  const transport = new StdioClientTransport({
    command: "node",
    args: ["./lib/src/index.js", "stdio"]
  });

  const client = new Client({
    name: "simple-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    // Connect to server
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Test 1: tools/list method (automatically provided by McpServer)
    console.log("🧪 Test: tools/list method...");
    const toolsList = await client.listTools();
    
    console.log("✅ tools/list method works automatically!");
    console.log(`📝 Server provides ${toolsList.tools.length} tools\n`);
    
    console.log("Available Tools:");
    console.log("================");
    
    toolsList.tools.forEach((tool, index) => {
      console.log(`\n${index + 1}. ${tool.name}`);
      console.log(`   Description: ${tool.description}`);
      
      if (tool.inputSchema && tool.inputSchema.properties) {
        const properties = tool.inputSchema.properties;
        const required = tool.inputSchema.required || [];
        
        console.log(`   Parameters (${Object.keys(properties).length} total):`);
        Object.entries(properties).forEach(([paramName, paramSchema]) => {
          const isRequired = required.includes(paramName);
          const reqIcon = isRequired ? '🔴 REQUIRED' : '🟡 OPTIONAL';
          console.log(`     ${reqIcon} ${paramName}: ${paramSchema.type}`);
          if (paramSchema.description) {
            console.log(`       → ${paramSchema.description}`);
          }
          if (paramSchema.enum) {
            console.log(`       → Options: ${paramSchema.enum.join(', ')}`);
          }
        });
        
        if (required.length > 0) {
          console.log(`   ⚠️  Required: ${required.join(', ')}`);
        } else {
          console.log(`   🎯 All parameters optional - elicitation supported`);
        }
      } else {
        console.log(`   📝 No parameters`);
      }
    });

    // Test 2: Test a tool without location (elicitation scenario)
    console.log("\n🧪 Test: Tool without required parameter...");
    try {
      const result = await client.callTool("get_weather", {});
      console.log("📝 Response:");
      if (result.content && result.content[0]) {
        const text = result.content[0].text;
        console.log(text.substring(0, 200) + (text.length > 200 ? "..." : ""));
      }
      console.log(`Is Error: ${result.isError || false}`);
    } catch (error) {
      console.log("❌ Tool call error:", error.message);
    }

    // Test 3: Test with parameter
    console.log("\n🧪 Test: Tool with parameter...");
    try {
      const result = await client.callTool("get_weather", { location: "Austin" });
      console.log("📝 Weather Response:");
      if (result.content && result.content[0]) {
        const weather = JSON.parse(result.content[0].text);
        console.log(`Location: ${weather.location}`);
        console.log(`Temperature: ${weather.temperature}`);
        console.log(`Condition: ${weather.condition}`);
      }
    } catch (error) {
      console.log("❌ Weather call error:", error.message);
    }

    console.log("\n✅ Test completed successfully!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    // Clean up
    await client.close();
    console.log("🧹 Connection closed");
  }
}

// Run the test
testToolsList().catch(console.error);
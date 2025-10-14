#!/usr/bin/env node

/**
 * Test: tools/list method and parameter requirements
 * This test demonstrates how MCP servers automatically handle tools/list 
 * and how parameter schemas are communicated to clients
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

async function testToolsList() {
  console.log("🔧 Testing MCP tools/list method and parameter requirements\n");

  // Start the MCP server as a child process
  const serverProcess = spawn("node", ["-r", "ts-node/register", "./src/index.ts", "stdio"], {
    cwd: projectRoot,
    stdio: ["pipe", "pipe", "inherit"]
  });

  // Create client transport using the server's stdio
  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin
  });

  const client = new Client({
    name: "tools-list-test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    // Connect to server
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Test 1: List all available tools
    console.log("🧪 Test 1: Listing all tools (tools/list method)...");
    try {
      const toolsList = await client.listTools();
      console.log("📝 Available tools:");
      console.log(`Found ${toolsList.tools.length} tools:\n`);
      
      toolsList.tools.forEach((tool, index) => {
        console.log(`${index + 1}. ${tool.name}`);
        console.log(`   Description: ${tool.description}`);
        
        if (tool.inputSchema) {
          console.log(`   Input Schema:`);
          console.log(`     Type: ${tool.inputSchema.type}`);
          
          if (tool.inputSchema.properties) {
            console.log(`     Parameters:`);
            Object.entries(tool.inputSchema.properties).forEach(([param, schema]) => {
              const isRequired = tool.inputSchema.required?.includes(param) || false;
              const description = schema.description || 'No description';
              console.log(`       - ${param} (${schema.type}${isRequired ? ', required' : ', optional'}): ${description}`);
            });
          }
          
          if (tool.inputSchema.required && tool.inputSchema.required.length > 0) {
            console.log(`     Required: ${tool.inputSchema.required.join(', ')}`);
          }
        }
        console.log("");
      });
    } catch (error) {
      console.log("❌ Tools list failed:", error.message);
    }

    // Test 2: Demonstrate parameter validation
    console.log("🧪 Test 2: Testing parameter validation...");
    
    // Test with missing required parameter (should trigger elicitation guidance)
    console.log("\n2a. Calling get_weather without location (optional parameter):");
    try {
      const result = await client.callTool("get_weather", {});
      console.log("📝 Response (elicitation guidance):");
      if (result.content && result.content[0]) {
        console.log(result.content[0].text);
      }
      console.log(`IsError flag: ${result.isError || false}\n`);
    } catch (error) {
      console.log("❌ Tool call failed:", error.message);
    }

    // Test with valid parameter
    console.log("2b. Calling get_weather with location:");
    try {
      const result = await client.callTool("get_weather", { location: "New York" });
      console.log("📝 Response (weather data):");
      if (result.content && result.content[0]) {
        const weatherData = JSON.parse(result.content[0].text);
        console.log(`Location: ${weatherData.location}`);
        console.log(`Temperature: ${weatherData.temperature}`);
        console.log(`Condition: ${weatherData.condition}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Tool call failed:", error.message);
    }

    // Test 3: Test tool with different parameter types
    console.log("🧪 Test 3: Testing different parameter types...");
    
    console.log("3a. Text analyzer with required parameters:");
    try {
      const result = await client.callTool("text_analyzer", {
        text: "This is a sample text for analysis.",
        analysis_type: "sentiment"
      });
      console.log("📝 Analysis result:");
      if (result.content && result.content[0]) {
        const analysis = JSON.parse(result.content[0].text);
        console.log(`Word count: ${analysis.wordCount}`);
        console.log(`Sentiment: ${analysis.sentiment?.overall || 'N/A'}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Analysis failed:", error.message);
    }

    console.log("3b. Calculator with expression validation:");
    try {
      const result = await client.callTool("calculate", {
        expression: "2 + 3 * 4"
      });
      console.log("📝 Calculation result:");
      if (result.content && result.content[0]) {
        console.log(result.content[0].text);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Calculation failed:", error.message);
    }

    // Test 4: Test enhanced weather tool with optional parameters
    console.log("🧪 Test 4: Testing optional parameter combinations...");
    
    console.log("4a. Enhanced weather with user location fallback:");
    try {
      const result = await client.callTool("get_weather_enhanced", {
        use_user_location: true,
        include_forecast: true
      });
      console.log("📝 Enhanced weather data:");
      if (result.content && result.content[0]) {
        const weatherData = JSON.parse(result.content[0].text);
        console.log(`Location: ${weatherData.location}`);
        console.log(`Temperature: ${weatherData.temperature}`);
        console.log(`UV Index: ${weatherData.uvIndex}`);
        console.log(`Has forecast: ${!!weatherData.forecast}`);
      }
      console.log("");
    } catch (error) {
      console.log("❌ Enhanced weather failed:", error.message);
    }

    // Test 5: Test prompts/list method
    console.log("🧪 Test 5: Listing all prompts (prompts/list method)...");
    try {
      const promptsList = await client.listPrompts();
      console.log("📝 Available prompts:");
      console.log(`Found ${promptsList.prompts.length} prompts:\n`);
      
      promptsList.prompts.forEach((prompt, index) => {
        console.log(`${index + 1}. ${prompt.name}`);
        console.log(`   Description: ${prompt.description}`);
        
        if (prompt.arguments && prompt.arguments.length > 0) {
          console.log(`   Arguments:`);
          prompt.arguments.forEach(arg => {
            console.log(`     - ${arg.name} (${arg.required ? 'required' : 'optional'}): ${arg.description}`);
          });
        }
        console.log("");
      });
    } catch (error) {
      console.log("❌ Prompts list failed:", error.message);
    }

    console.log("✅ All tools/list tests completed!");

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
testToolsList().catch(console.error);
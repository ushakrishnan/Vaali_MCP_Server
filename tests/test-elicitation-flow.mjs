#!/usr/bin/env node

/**
 * Test: Demonstrate how elicitation prompt could be used by intelligent clients
 * Shows the manual flow that advanced LLMs might automate
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

async function demonstrateElicitationFlow() {
  console.log("🤖 Demonstrating How LLMs Could Use Elicitation Prompts\n");

  const transport = new StdioClientTransport({
    command: "node",
    args: ["./lib/src/index.js", "stdio"]
  });

  const client = new Client({
    name: "elicitation-demo-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Scenario: User asks "What's the weather like?"
    console.log("👤 User: What's the weather like?");
    console.log("🤖 LLM: I'll check the weather for you...\n");

    // Step 1: LLM tries to call weather tool without location
    console.log("🔧 Step 1: LLM calls get_weather tool without location");
    try {
      const weatherResult = await client.callTool("get_weather", {});
      
      if (weatherResult.isError) {
        console.log("❌ Tool returned error (as expected)");
        console.log("📝 Error message:");
        if (weatherResult.content && weatherResult.content[0]) {
          const errorText = weatherResult.content[0].text;
          console.log(errorText.substring(0, 200) + "...\n");
          
          // Step 2: LLM notices the prompt suggestion
          if (errorText.includes("get_location_for_weather")) {
            console.log("🧠 LLM notices: Error mentions 'get_location_for_weather' prompt");
            console.log("🔧 Step 2: LLM calls the elicitation prompt");
            
            const promptResult = await client.getPrompt("get_location_for_weather", {
              user_context: "User asked for weather without specifying location"
            });
            
            console.log("✅ Got elicitation prompt");
            if (promptResult.messages && promptResult.messages[0]) {
              const promptText = promptResult.messages[0].content.text;
              console.log("📝 Prompt content:");
              console.log(promptText.substring(0, 300) + "...\n");
              
              // Step 3: LLM uses prompt to ask user
              console.log("🤖 LLM to User (using prompt structure):");
              console.log("I need to know your location to get weather information.");
              console.log("You can specify:");
              console.log("- A city name (e.g., 'New York', 'London')");
              console.log("- City with state/country (e.g., 'Austin, TX')");
              console.log("- Coordinates (e.g., '40.7128,-74.0060')");
              console.log("- Or choose from: New York, San Francisco, London, Tokyo\n");
              
              // Step 4: Simulate user response
              console.log("👤 User: San Francisco");
              console.log("🤖 LLM: Great! Let me get the weather for San Francisco...\n");
              
              // Step 5: LLM calls tool again with location
              console.log("🔧 Step 3: LLM retries get_weather with location");
              const finalResult = await client.callTool("get_weather", {
                location: "San Francisco"
              });
              
              if (!finalResult.isError && finalResult.content && finalResult.content[0]) {
                console.log("✅ Success! Got weather data");
                const weather = JSON.parse(finalResult.content[0].text);
                console.log("📊 Weather Response:");
                console.log(`   Location: ${weather.location}`);
                console.log(`   Temperature: ${weather.temperature}`);
                console.log(`   Condition: ${weather.condition}`);
                console.log(`   Humidity: ${weather.humidity}`);
                console.log(`   Wind: ${weather.windSpeed}\n`);
                
                console.log("🤖 LLM to User: The weather in San Francisco is currently");
                console.log(`   ${weather.condition} with a temperature of ${weather.temperature}.`);
                console.log(`   Humidity is at ${weather.humidity} with winds at ${weather.windSpeed}.`);
              }
            }
          }
        }
      }
    } catch (error) {
      console.log("❌ Error:", error.message);
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📋 ELICITATION FLOW SUMMARY");
    console.log("=".repeat(60));
    console.log("1. ❌ Tool call fails with helpful error message");
    console.log("2. 🧠 LLM notices error mentions elicitation prompt");
    console.log("3. 🔧 LLM calls elicitation prompt for structured guidance");
    console.log("4. 🤖 LLM uses prompt to ask user for missing information");
    console.log("5. 👤 User provides the missing information");
    console.log("6. ✅ LLM retries tool call successfully");
    console.log("\n💡 Key Insight: The prompt provides STRUCTURE for how to ask for missing info");

  } catch (error) {
    console.error("❌ Demo failed:", error);
  } finally {
    await client.close();
    console.log("🧹 Connection closed");
  }
}

demonstrateElicitationFlow().catch(console.error);
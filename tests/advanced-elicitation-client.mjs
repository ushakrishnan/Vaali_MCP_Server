#!/usr/bin/env node

/**
 * Advanced Elicitation Client - Demonstrates intelligent parameter elicitation
 * This shows how a sophisticated MCP client could automatically handle missing parameters
 * by detecting elicitation hints and using structured prompts
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import readline from 'readline';

class AdvancedElicitationClient {
  constructor() {
    this.client = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async connect() {
    const transport = new StdioClientTransport({
      command: "node",
      args: ["./lib/src/index.js", "stdio"]
    });

    this.client = new Client({
      name: "advanced-elicitation-client",
      version: "1.0.0"
    }, {
      capabilities: {}
    });

    await this.client.connect(transport);
    console.log("🤖 Advanced Elicitation Client Connected\n");
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
    this.rl.close();
  }

  /**
   * Analyzes tool error responses for elicitation hints
   * Returns the suggested prompt name if found
   */
  detectElicitationHint(errorResponse) {
    if (!errorResponse.isError || !errorResponse.content?.[0]?.text) {
      return null;
    }

    const errorText = errorResponse.content[0].text;
    
    // Look for prompt suggestions in error messages
    const promptRegex = /use the ['"]([\w_-]+)['"] prompt/i;
    const match = errorText.match(promptRegex);
    
    if (match) {
      return match[1]; // Return the prompt name
    }
    
    // Could also detect other patterns like:
    // - "see the xyz prompt for guidance"
    // - "try calling prompt:xyz"
    // - etc.
    
    return null;
  }

  /**
   * Uses an elicitation prompt to gather missing parameters
   */
  async elicitParameters(promptName, context = {}) {
    console.log(`🧠 Client detected elicitation hint: '${promptName}' prompt`);
    console.log(`🔧 Fetching elicitation guidance...`);
    
    try {
      const promptResult = await this.client.getPrompt(promptName, context);
      
      if (promptResult.messages?.[0]?.content?.text) {
        const guidanceText = promptResult.messages[0].content.text;
        
        console.log("📋 Structured Guidance:");
        console.log("=" + "=".repeat(50));
        console.log(guidanceText);
        console.log("=" + "=".repeat(50));
        
        // Extract structured information from the prompt
        const extractedInfo = this.parseElicitationPrompt(guidanceText);
        
        // Interact with user using structured guidance
        return await this.interactWithUser(extractedInfo);
      }
    } catch (error) {
      console.log(`❌ Failed to fetch elicitation prompt: ${error.message}`);
      return null;
    }
    
    return null;
  }

  /**
   * Parses the elicitation prompt to extract structured information
   */
  parseElicitationPrompt(guidanceText) {
    const info = {
      examples: [],
      suggestions: [],
      formats: []
    };

    // Extract examples (e.g., "New York", "London")
    const exampleRegex = /"([^"]+)"/g;
    let match;
    while ((match = exampleRegex.exec(guidanceText)) !== null) {
      info.examples.push(match[1]);
    }

    // Extract suggestions from "Choose from suggestions" line
    const suggestionsMatch = guidanceText.match(/Choose from suggestions[:\s]+([^\n]+)/i);
    if (suggestionsMatch) {
      info.suggestions = suggestionsMatch[1].split(/[,\s]+/).filter(s => s.length > 0);
    }

    // Extract format patterns
    if (guidanceText.includes("coordinates")) {
      info.formats.push("coordinates");
    }
    if (guidanceText.includes("city name")) {
      info.formats.push("city");
    }
    if (guidanceText.includes("state/country")) {
      info.formats.push("city_with_region");
    }

    return info;
  }

  /**
   * Interactive user session using structured guidance
   */
  async interactWithUser(extractedInfo) {
    console.log("\n🤖 I need some additional information...\n");
    
    // Present options based on extracted information
    if (extractedInfo.suggestions.length > 0) {
      console.log("Quick options:");
      extractedInfo.suggestions.forEach((suggestion, index) => {
        console.log(`  ${index + 1}. ${suggestion}`);
      });
      console.log("");
    }

    if (extractedInfo.examples.length > 0) {
      console.log("Example formats:");
      extractedInfo.examples.slice(0, 3).forEach(example => {
        console.log(`  • ${example}`);
      });
      console.log("");
    }

    return new Promise((resolve) => {
      this.rl.question("Please enter your choice: ", (answer) => {
        // Smart parsing of user input
        const parsedAnswer = this.parseUserInput(answer, extractedInfo);
        resolve(parsedAnswer);
      });
    });
  }

  /**
   * Intelligently parses user input based on the guidance context
   */
  parseUserInput(input, extractedInfo) {
    const trimmed = input.trim();
    
    // Check if it's a number (selecting from suggestions)
    const num = parseInt(trimmed);
    if (!isNaN(num) && num > 0 && num <= extractedInfo.suggestions.length) {
      return extractedInfo.suggestions[num - 1];
    }
    
    // Return the raw input for other cases
    return trimmed;
  }

  /**
   * Intelligent tool calling with automatic elicitation
   */
  async callToolWithElicitation(toolName, parameters = {}, maxRetries = 2) {
    console.log(`🔧 Calling tool: ${toolName}`);
    console.log(`📥 Parameters: ${JSON.stringify(parameters)}`);
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.client.callTool(toolName, parameters);
        
        if (result.isError) {
          console.log(`❌ Attempt ${attempt}: Tool returned error`);
          
          // Check for elicitation hints
          const promptHint = this.detectElicitationHint(result);
          
          if (promptHint && attempt < maxRetries) {
            console.log(`🧠 Detected elicitation opportunity!`);
            
            // Use the elicitation prompt to get missing information
            const elicitedValue = await this.elicitParameters(promptHint, {
              user_context: `Tool '${toolName}' needs additional parameters`
            });
            
            if (elicitedValue) {
              // Try to determine which parameter to set
              // For this demo, we'll assume it's 'location' for weather tools
              if (toolName.includes('weather')) {
                parameters.location = elicitedValue;
                console.log(`🔄 Retrying with location: ${elicitedValue}\n`);
                continue;
              }
            }
          }
          
          // Show error to user if no elicitation or final attempt
          console.log("📝 Error details:");
          if (result.content?.[0]?.text) {
            console.log(result.content[0].text);
          }
          return result;
        }
        
        // Success!
        console.log(`✅ Tool call successful!`);
        return result;
        
      } catch (error) {
        console.log(`❌ Attempt ${attempt}: ${error.message}`);
        if (attempt === maxRetries) {
          throw error;
        }
      }
    }
  }

  async demonstrateAdvancedElicitation() {
    console.log("🚀 Advanced Elicitation Demonstration");
    console.log("=====================================\n");
    
    console.log("Scenario: User asks 'What's the weather like?'");
    console.log("The client will automatically handle missing location parameter.\n");
    
    // Demonstrate the advanced flow
    const result = await this.callToolWithElicitation("get_weather", {});
    
    if (!result.isError && result.content?.[0]?.text) {
      const weather = JSON.parse(result.content[0].text);
      console.log("\n🌤️  Weather Report:");
      console.log("==================");
      console.log(`📍 Location: ${weather.location}`);
      console.log(`🌡️  Temperature: ${weather.temperature}`);
      console.log(`☁️  Condition: ${weather.condition}`);
      console.log(`💧 Humidity: ${weather.humidity}`);
      console.log(`💨 Wind Speed: ${weather.windSpeed}`);
      console.log(`📊 Forecast: ${weather.forecast}`);
    }
    
    console.log("\n" + "=".repeat(60));
    console.log("🎯 Advanced Elicitation Benefits:");
    console.log("=".repeat(60));
    console.log("✅ Automatic detection of missing parameters");
    console.log("✅ Structured guidance from server prompts");
    console.log("✅ Rich user interaction with examples and options");
    console.log("✅ Intelligent retry logic");
    console.log("✅ Consistent experience across all tools");
  }
}

async function runAdvancedDemo() {
  const client = new AdvancedElicitationClient();
  
  try {
    await client.connect();
    await client.demonstrateAdvancedElicitation();
  } catch (error) {
    console.error("❌ Demo failed:", error);
  } finally {
    await client.close();
    console.log("\n🧹 Demo completed");
  }
}

// Run the demonstration
runAdvancedDemo().catch(console.error);
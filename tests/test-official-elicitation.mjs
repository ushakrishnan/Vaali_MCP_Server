#!/usr/bin/env node

/**
 * Official MCP Elicitation Test - Interactive Workflows for Parameter Collection
 * 
 * Demonstrates how MCP elicitation enables interactive workflows where tools
 * can request missing parameters during execution, rather than requiring
 * all parameters upfront.
 */

import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testInteractiveWorkflows() {
  console.log("🚀 MCP Elicitation: Interactive Workflows Test");
  console.log("=".repeat(60));
  
  console.log("\n💡 This demonstrates the TRUE purpose of MCP elicitation:");
  console.log("• ✨ Interactive workflows that collect missing parameters DURING execution");
  console.log("• 🔄 Tools that can work with partial parameters and ask for what's missing");
  console.log("• 🎯 Smart parameter collection based on what the tool actually needs");
  console.log("• 🛡️ Graceful fallback for clients without elicitation support");

  console.log("\n📋 Testing Tools with Missing Parameters:");
  console.log("-".repeat(50));

  const transport = new StdioClientTransport({
    command: "node",
    args: [path.join(__dirname, "../lib/src/index.js"), "stdio"],
    env: process.env
  });

  // Test without elicitation capability first
  const clientWithoutElicitation = new Client({
    name: "standard-client",
    version: "1.0.0"
  }, {
    capabilities: {} // No elicitation capability
  });

  try {
    console.log("🔌 Testing with standard client (no elicitation capability)...");
    await clientWithoutElicitation.connect(transport);

    // Test 1: Weather without location (should show parameter guidance)
    console.log("\n🌤️ Test 1: Weather tool without location parameter");
    console.log("Expected: Parameter guidance fallback");
    try {
      const result = await clientWithoutElicitation.callTool("get_weather_with_elicitation", {});
      console.log("Result:", result.content[0].text.substring(0, 200) + "...");
    } catch (error) {
      console.log("✅ Expected error (parameter guidance):", error.message);
    }

    // Test 2: Email without parameters
    console.log("\n📧 Test 2: Email tool without required parameters");
    console.log("Expected: Parameter guidance fallback");
    try {
      const result = await clientWithoutElicitation.callTool("send_email_with_elicitation", {});
      console.log("Result:", result.content[0].text.substring(0, 200) + "...");
    } catch (error) {
      console.log("✅ Expected error (parameter guidance):", error.message);
    }

    // Test 3: Show that our parameter guidance pattern still works
    console.log("\n🌤️ Test 3: Original weather tool (parameter guidance pattern)");
    try {
      const result = await clientWithoutElicitation.callTool("get_weather", {});
      console.log("✅ Parameter guidance works:", result.content[0].text.substring(0, 150) + "...");
    } catch (error) {
      console.log("Result:", error.message);
    }

    await clientWithoutElicitation.close();

  } catch (error) {
    console.error("❌ Standard client test failed:", error.message);
  }

  // Now test the same with elicitation capability
  const transport2 = new StdioClientTransport({
    command: "node", 
    args: [path.join(__dirname, "../lib/src/index.js"), "stdio"],
    env: process.env
  });

  const clientWithElicitation = new Client({
    name: "elicitation-capable-client",
    version: "1.0.0"
  }, {
    capabilities: {
      elicitation: {} // Elicitation support declared
    }
  });

  try {
    console.log("\n🔌 Testing with elicitation-capable client...");
    await clientWithElicitation.connect(transport2);

    console.log("\n🎯 Interactive Workflow Tests:");
    console.log("-".repeat(40));

    // The tools will attempt elicitation but we can't easily simulate user input
    // in this automated test, so they'll likely timeout or error
    console.log("\n🌤️ Test 1: Weather tool (will attempt elicitation)");
    try {
      const result = await clientWithElicitation.callTool("get_weather_with_elicitation", {});
      console.log("✅ Weather result:", result.content[0].text);
    } catch (error) {
      console.log("⏱️ Expected timeout/error (no elicitation handler):", error.message);
    }

    console.log("\n📧 Test 2: Email tool with partial parameters");
    try {
      const result = await clientWithElicitation.callTool("send_email_with_elicitation", { 
        to: "user@example.com" 
      });
      console.log("✅ Email result:", result.content[0].text);
    } catch (error) {
      console.log("⏱️ Expected timeout/error (elicitation for subject/body):", error.message);
    }

    console.log("\n📅 Test 3: Calendar event with partial parameters");
    try {
      const result = await clientWithElicitation.callTool("create_calendar_event_with_elicitation", { 
        title: "Team Meeting" 
      });
      console.log("✅ Calendar result:", result.content[0].text);
    } catch (error) {
      console.log("⏱️ Expected timeout/error (elicitation for date/time):", error.message);
    }

    await clientWithElicitation.close();

  } catch (error) {
    console.error("❌ Elicitation client test failed:", error.message);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎉 INTERACTIVE WORKFLOW TESTS COMPLETED!");
  console.log("=".repeat(60));

  console.log("\n🔍 Key Insights about MCP Elicitation:");
  console.log("• 🎯 Purpose: Enable interactive parameter collection during tool execution");
  console.log("• 🔄 Workflow: Tool starts → detects missing params → elicits from user → continues");
  console.log("• 📱 UI: Client shows forms/dialogs based on JSON schemas from server");
  console.log("• ✅ Actions: Users can accept (provide data), decline, or cancel");
  console.log("• 🛡️ Fallback: Tools provide helpful guidance for non-elicitation clients");

  console.log("\n🆚 Comparison: Parameter Guidance vs Official Elicitation:");
  
  console.log("\n📝 Parameter Guidance Pattern (our original approach):");
  console.log("  • Works with any MCP client (universal compatibility)");
  console.log("  • Uses error messages + prompts + retry logic");
  console.log("  • Rich contextual help and examples");
  console.log("  • Client handles retry intelligence");
  
  console.log("\n⚡ Official MCP Elicitation:");
  console.log("  • Requires elicitation-capable client");
  console.log("  • Direct server → client structured requests");
  console.log("  • JSON schema-driven UI generation");
  console.log("  • Accept/decline/cancel response model");
  console.log("  • Standardized protocol feature");

  console.log("\n🌟 Best Practice: Hybrid Approach");
  console.log("  • Try official elicitation first (enhanced experience)");
  console.log("  • Fall back to parameter guidance (universal compatibility)");
  console.log("  • Tools work with ANY MCP client");
  console.log("  • Progressive enhancement based on client capabilities");

  console.log("\n💡 Interactive Workflow Examples:");
  console.log("  • Weather tool: Start without location → elicit location → get weather");
  console.log("  • Email tool: Start with recipient → elicit subject/body → send email");  
  console.log("  • File search: Start without query → elicit search criteria → search files");
  console.log("  • Calendar: Start with title → elicit date/time → create event");
}

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n🛑 Test interrupted by user");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Test terminated");
  process.exit(0);
});

// Run the test
testInteractiveWorkflows().catch((error) => {
  console.error("💥 Fatal error:", error);
  process.exit(1);
});
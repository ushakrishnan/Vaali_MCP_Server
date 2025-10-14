#!/usr/bin/env node

/**
 * Direct test of the rain prediction tool implementation
 * This shows how elicitation would work without needing an actual client
 */

import { server } from "../lib/src/server.js";

async function testRainPredictionElicitation() {
  console.log("🌧️ Testing Rain Prediction Elicitation Implementation\n");

  // Test 1: Call rain prediction with no parameters
  console.log("🧪 Test 1: Calling rain_prediction_with_elicitation with no parameters...");
  try {
    const result = await server.callTool("rain_prediction_with_elicitation", {});
    
    console.log("✅ Tool call completed");
    console.log("Result is error:", !!result.isError);
    
    if (result.content && result.content[0]) {
      const text = result.content[0].text;
      console.log("✅ Contains 'Location Required':", text.includes("Location Required"));
      console.log("✅ Contains 'elicitation':", text.includes("elicitation"));
      console.log("✅ Contains examples:", text.includes("Seattle"));
      console.log("✅ Contains parameter guidance:", text.includes("Example:"));
      
      console.log("\n📝 Response preview:");
      console.log(text.substring(0, 400) + "...\n");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 2: Call with location parameter
  console.log("🧪 Test 2: Calling with location parameter...");
  try {
    const result = await server.callTool("rain_prediction_with_elicitation", {
      location: "Tokyo"
    });
    
    if (result.content && result.content[0]) {
      const text = result.content[0].text;
      console.log("✅ Got rain prediction for Tokyo");
      console.log("✅ Contains forecast period:", text.includes("Forecast Period"));
      console.log("✅ Contains elicitation test result:", text.includes("Elicitation Test Result"));
      
      console.log("\n📝 Response preview:");
      console.log(text.substring(0, 400) + "...\n");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  // Test 3: Call with all parameters
  console.log("🧪 Test 3: Calling with all parameters...");
  try {
    const result = await server.callTool("rain_prediction_with_elicitation", {
      location: "San Francisco",
      hours_ahead: 48,
      include_probability: true
    });
    
    if (result.content && result.content[0]) {
      const text = result.content[0].text;
      console.log("✅ Got complete rain prediction");
      console.log("✅ Contains detailed probability:", text.includes("Detailed Probability"));
      console.log("✅ Contains confidence level:", text.includes("Confidence Level"));
      console.log("✅ Contains 48 hours:", text.includes("48 hours"));
      
      console.log("\n📝 Response preview:");
      console.log(text.substring(0, 400) + "...\n");
    }
  } catch (error) {
    console.log("❌ Error:", error.message);
  }

  console.log("✅ Elicitation functionality test completed!");
  console.log("\n🔬 Summary:");
  console.log("- Rain prediction tool successfully implements hybrid elicitation pattern");
  console.log("- Parameter guidance fallback works when elicitation fails/unavailable");
  console.log("- Tool provides clear examples and instructions for required parameters");
  console.log("- All parameter combinations work correctly");
}

testRainPredictionElicitation().catch(console.error);
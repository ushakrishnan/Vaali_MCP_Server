#!/usr/bin/env node

/**
 * Test Runner - Runs all MCP tests in sequence
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tests = [
  {
    name: "MCP Capabilities & Auto-generated Methods",
    file: "test-mcp-capabilities.mjs",
    description: "Tests tools/list, prompts/list, resources/list methods"
  },
  {
    name: "Tools List & Parameter Requirements", 
    file: "test-tools-list.mjs",
    description: "Tests parameter schemas and validation"
  },
  {
    name: "Parameter Schemas & Elicitation Patterns",
    file: "test-parameter-schemas.mjs", 
    description: "Tests elicitation flows and schema analysis"
  }
];

async function runTest(test) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Running: ${test.name}`);
    console.log(`📝 ${test.description}`);
    console.log(`${'='.repeat(60)}\n`);

    const testProcess = spawn("node", [test.file], {
      cwd: __dirname,
      stdio: "inherit"
    });

    testProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`\n✅ ${test.name} - PASSED\n`);
        resolve();
      } else {
        console.log(`\n❌ ${test.name} - FAILED (exit code: ${code})\n`);
        reject(new Error(`Test failed with exit code ${code}`));
      }
    });

    testProcess.on("error", (error) => {
      console.log(`\n❌ ${test.name} - ERROR: ${error.message}\n`);
      reject(error);
    });
  });
}

async function runAllTests() {
  console.log("🚀 MCP Test Suite - Running All Tests");
  console.log("=====================================");

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      await runTest(test);
      passed++;
    } catch (error) {
      failed++;
      console.error(`Test failed: ${error.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total:  ${tests.length}`);
  
  if (failed === 0) {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log(`\n💥 ${failed} test(s) failed`);
    process.exit(1);
  }
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.length > 0) {
  const testName = args[0];
  const test = tests.find(t => t.file.includes(testName) || t.name.toLowerCase().includes(testName.toLowerCase()));
  
  if (test) {
    console.log(`🎯 Running single test: ${test.name}`);
    runTest(test).catch(error => {
      console.error("Test failed:", error.message);
      process.exit(1);
    });
  } else {
    console.log("❌ Test not found. Available tests:");
    tests.forEach(t => console.log(`  - ${t.file} (${t.name})`));
    process.exit(1);
  }
} else {
  // Run all tests
  runAllTests().catch(error => {
    console.error("Test suite failed:", error.message);
    process.exit(1);
  });
}
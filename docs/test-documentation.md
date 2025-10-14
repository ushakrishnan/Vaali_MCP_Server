# Test Documentation

This document provides comprehensive documentation for all tests in the `tests/` folder, explaining their purpose, implementation details, and how to run them.

## 📁 Test Directory Overview

The tests are organized into several categories:

1. **MCP Protocol Compliance Tests** - Verify MCP specification adherence
2. **Advanced Elicitation Demonstrations** - Show intelligent parameter elicitation
3. **Integration Tests** - Test complete workflows and interactions
4. **Utility Tests** - Helper scripts and test runners

## 🔧 MCP Protocol Compliance Tests

### `test-mcp-capabilities.mjs`
**Purpose**: Verifies that the MCP server automatically provides the core protocol methods

**Key Features**:
- Tests that `tools/list`, `prompts/list`, and `resources/list` are automatically handled by McpServer
- Verifies server capabilities declaration and initialization
- Demonstrates that manual implementation of list methods is NOT required
- Shows auto-generated JSON-RPC responses

**What it Tests**:
```javascript
// Automatically provided by McpServer:
✅ tools/list method - returns all registered tools
✅ prompts/list method - returns all registered prompts  
✅ resources/list method - returns all registered resources
✅ Server capabilities - proper capability declaration
```

**Run Command**: `npm run test:mcp:capabilities`

**Expected Output**:
```
🔧 Testing MCP Auto-generated Methods and Capabilities

✅ tools/list method works automatically!
📝 Server provides 6 tools

✅ prompts/list method works automatically!  
📝 Server provides 5 prompts

✅ resources/list method works automatically!
📝 Server provides 3 resources
```

**Key Learning**: The McpServer class handles protocol plumbing automatically - you focus on business logic, not protocol implementation.

---

### `test-tools-list.mjs`
**Purpose**: Deep dive into tool listing functionality and parameter requirements

**Key Features**:
- Detailed analysis of tool schemas generated from Zod definitions
- Tests parameter requirement detection (required vs optional)
- Demonstrates different parameter types and constraints
- Shows how clients can discover tool capabilities

**What it Tests**:
```javascript
✅ Tool schema generation from Zod definitions
✅ Parameter requirement classification (required/optional)
✅ Parameter type mapping (string, boolean, enum, etc.)
✅ Description propagation from .describe() calls
✅ JSON Schema compliance of generated schemas
```

**Run Command**: `npm run test:mcp:tools`

**Expected Output**:
```
🔧 Analyzing Tool Schemas and Parameter Requirements

🔧 get_weather:
   Parameters: 1 total (0 required, 1 optional)
   Schema Type: object with optional properties
   
🔧 text_analyzer:
   Parameters: 2 total (2 required, 0 optional)
   Schema Type: object with required properties
```

**Key Learning**: Zod schemas automatically become JSON Schema parameter definitions - `z.string()` = required, `z.string().optional()` = optional.

---

### `test-parameter-schemas.mjs`
**Purpose**: Comprehensive testing of parameter validation and elicitation patterns

**Key Features**:
- Tests complete elicitation workflow from error to successful retry
- Analyzes parameter schemas in detail with type mapping
- Demonstrates elicitation pattern implementation
- Shows client-side error handling and recovery

**What it Tests**:
```javascript
✅ Complete elicitation flow: error → prompt → retry → success
✅ Parameter schema analysis and validation
✅ Error message parsing and elicitation hint detection
✅ Prompt fetching and structured guidance parsing
✅ Retry logic with elicited parameters
```

**Run Command**: `npm run test:mcp:parameters`

**Expected Output**:
```
🔧 Testing Parameter Schemas and Elicitation Patterns

📋 Parameter Schema Analysis:
   🟡 location: string (optional)
      Description: Location to get weather for
      Elicitation: supported via get_location_for_weather prompt

🎯 Testing Elicitation Flow:
   Step 1: Call tool without location ❌
   Step 2: Detect elicitation hint ✅  
   Step 3: Fetch guidance prompt ✅
   Step 4: Retry with location ✅
```

**Key Learning**: Elicitation is a design pattern that makes optional parameters user-friendly through structured guidance.

---

## 🚀 Advanced Elicitation Demonstrations

### `advanced-concept-demo.mjs`
**Purpose**: Educational walkthrough of the advanced elicitation concept

**Key Features**:
- Step-by-step explanation of the elicitation flow
- Conceptual demonstration without real server communication
- Perfect for understanding the theoretical framework
- Shows expected inputs and outputs at each stage

**What it Demonstrates**:
```
📋 STEP 1: User Request → "What's the weather?"
📋 STEP 2: Client Calls Tool → callTool("get_weather", {})
📋 STEP 3: Server Returns Hint → "use 'get_location_for_weather' prompt"
📋 STEP 4: Client Detects Hint → regex parsing success
📋 STEP 5: Client Fetches Prompt → structured guidance
📋 STEP 6: Client Presents Options → user-friendly interface
📋 STEP 7: User Provides Input → "Seattle"
📋 STEP 8: Client Retries → callTool("get_weather", {location: "Seattle"})
📋 STEP 9: Server Returns Data → complete weather report
```

**Run Command**: `npm run test:advanced-concept`

**Key Learning**: Shows the complete user experience transformation from "parameter required" errors to seamless guided interactions.

---

### `advanced-elicitation-client.mjs`
**Purpose**: Full implementation of an intelligent MCP client with automatic elicitation

**Key Features**:
- Real intelligent client that automatically handles missing parameters
- Sophisticated error parsing and hint detection
- Rich user interaction with examples and suggestions
- Intelligent retry logic with context preservation

**Implementation Highlights**:
```javascript
✅ detectElicitationHint() - regex-based hint detection
✅ elicitParameters() - automatic prompt fetching and parsing
✅ interactWithUser() - rich interaction with examples
✅ callToolWithElicitation() - retry logic with elicited parameters
✅ parseUserInput() - intelligent input interpretation
```

**What it Demonstrates**:
- How sophisticated clients could work in practice
- Automatic parameter collection without user frustration
- Context-aware guidance presentation
- Seamless error recovery and retry

**Run Command**: `npm run test:advanced-elicitation`

**Key Learning**: Shows how MCP can evolve from simple tool calling to intelligent, context-aware parameter management.

---

### `working-advanced-demo.mjs`
**Purpose**: Live demonstration of advanced elicitation with real server communication

**Key Features**:
- Actually connects to the MCP server via stdio transport
- Demonstrates real protocol interactions
- Tests live elicitation flow with actual responses
- Validates that the implementation works in practice

**What it Tests**:
```javascript
✅ Real client-server connection via StdioClientTransport
✅ Live tool calling with missing parameters
✅ Actual error response parsing for elicitation hints
✅ Real prompt fetching from the server
✅ Live retry with elicited parameters
✅ Complete weather data retrieval
```

**Run Command**: `npm run test:working-advanced`

**Key Learning**: Proves that advanced elicitation patterns work with real MCP implementations, not just in theory.

---

## 🔄 Integration Tests

### `test-elicitation-flow.mjs`  
**Purpose**: Demonstrates how LLMs could use elicitation prompts in practice

**Key Features**:
- Shows manual elicitation flow that advanced LLMs might automate
- Tests complete prompt-based guidance workflow
- Demonstrates context-aware parameter collection
- Real client-server communication with elicitation patterns

**What it Demonstrates**:
```javascript
1. Tool call without required parameter
2. Error response with elicitation guidance
3. Manual prompt fetching and interpretation
4. User guidance presentation
5. Parameter collection and retry
6. Successful tool execution
```

**Run Command**: `node tests/test-elicitation-flow.mjs`

**Key Learning**: Shows the bridge between current LLM capabilities and future intelligent parameter elicitation.

---

### `test-simple.mjs`
**Purpose**: Basic MCP functionality verification and smoke testing

**Key Features**:
- Simple server startup and connection testing
- Basic tool listing and calling
- Minimal client implementation for quick verification
- Smoke test for core MCP functionality

**What it Tests**:
```javascript
✅ Server startup and stdio transport
✅ Client connection and initialization
✅ Basic tools/list functionality
✅ Simple tool calling without parameters
✅ Clean disconnect and shutdown
```

**Run Command**: `node tests/test-simple.mjs`

**Key Learning**: Provides a simple baseline test to verify MCP server functionality.

---

## 🛠️ Utility Tests

### `run-tests.mjs`
**Purpose**: Test runner script that orchestrates multiple test executions

**Key Features**:
- Centralized test execution management
- Sequential test running with proper cleanup
- Consolidated reporting and results summary
- Error handling and graceful degradation

**What it Provides**:
```javascript
✅ Sequential execution of all MCP tests
✅ Proper server startup and shutdown between tests
✅ Consolidated reporting and success/failure tracking
✅ Error isolation - one test failure doesn't stop others
```

**Run Command**: `npm run test:mcp`

**Key Learning**: Demonstrates best practices for test organization and execution in MCP environments.

---

## 📊 Test Execution Guide

### Quick Test Commands

```bash
# Run all MCP protocol tests
npm run test:mcp

# Individual MCP protocol tests
npm run test:mcp:capabilities
npm run test:mcp:tools  
npm run test:mcp:parameters

# Advanced elicitation demonstrations
npm run test:advanced-concept
npm run test:advanced-elicitation
npm run test:working-advanced

# Complete test suite
npm run test:all
```

### Manual Test Execution

```bash
cd tests

# Protocol compliance tests
node test-mcp-capabilities.mjs
node test-tools-list.mjs
node test-parameter-schemas.mjs

# Advanced demonstrations  
node advanced-concept-demo.mjs
node advanced-elicitation-client.mjs
node working-advanced-demo.mjs

# Integration tests
node test-elicitation-flow.mjs
node test-simple.mjs
```

### Test Dependencies

All tests require:
- ✅ Built server: `npm run build`
- ✅ MCP SDK dependencies: `@modelcontextprotocol/sdk`
- ✅ Node.js ES modules support
- ✅ Server implementation in `lib/src/index.js`

## 🎯 Test Coverage Summary

| Test Category | Files | Coverage |
|---------------|-------|----------|
| **MCP Protocol** | 3 | Complete MCP specification compliance |
| **Advanced Elicitation** | 3 | Full elicitation pattern implementation |
| **Integration** | 2 | End-to-end workflow validation |
| **Utilities** | 2 | Test infrastructure and smoke tests |
| **Total** | **10** | **Comprehensive test coverage** |

### Key Test Insights

1. **Protocol Compliance**: ✅ Server fully implements MCP specification
2. **Auto-generation**: ✅ McpServer handles protocol plumbing automatically  
3. **Schema Generation**: ✅ Zod definitions become JSON Schema parameters
4. **Elicitation Patterns**: ✅ Advanced guidance works with real implementations
5. **Client Intelligence**: ✅ Sophisticated clients can automate parameter collection
6. **Error Recovery**: ✅ Graceful handling of missing parameters and retry logic

## 🚀 Future Test Enhancements

### Planned Additions
- **Performance Tests**: Load testing and benchmark validation
- **Security Tests**: Parameter validation and injection protection  
- **Multi-transport Tests**: SSE and other transport mechanisms
- **Error Scenario Tests**: Edge cases and failure mode handling
- **Compliance Tests**: Official MCP specification test suite integration

### Advanced Testing Scenarios
- **Multi-parameter Elicitation**: Complex workflows with multiple missing parameters
- **Context Preservation**: User preference learning and session management
- **Voice Interface Testing**: Speech-based parameter elicitation
- **Multi-modal Testing**: Image, map, and rich media parameter collection

This comprehensive test suite ensures robust MCP implementation while demonstrating advanced elicitation patterns that transform user experience from manual parameter management to intelligent, guided interactions.
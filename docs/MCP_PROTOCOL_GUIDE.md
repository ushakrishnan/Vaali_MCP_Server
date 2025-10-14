# MCP Protocol Implementation Guide

## Tools/List Implementation Analysis

### ✅ Key Finding: You DON'T Implement tools/list Manually

The `tools/list` method is **automatically provided** by the `McpServer` class from `@modelcontextprotocol/sdk`. You simply register tools and the server handles the JSON-RPC protocol.

```typescript
// You do this:
server.tool("get_weather", "Get weather information", {
  location: z.string().optional().describe("Location for weather")
}, async ({ location }) => { ... });

// McpServer automatically provides:
// - tools/list JSON-RPC method
// - Parameter schemas from Zod definitions  
// - Protocol compliance and routing
```

### Parameter Requirements from Zod Schemas

Parameter requirements are **automatically determined** from your Zod schemas:

```typescript
// REQUIRED parameter
server.tool("example", "Description", {
  text: z.string().describe("Required text input")
}, handler);
// → inputSchema.required = ["text"]

// OPTIONAL parameter  
server.tool("example", "Description", {
  location: z.string().optional().describe("Optional location")
}, handler);
// → inputSchema.required = [] (empty)

// ENUM parameter
server.tool("example", "Description", {
  mode: z.enum(["basic", "detailed"]).describe("Analysis mode")
}, handler);
// → inputSchema.properties.mode.enum = ["basic", "detailed"]
```

### Automatic JSON-RPC Handling

The `McpServer` class provides these methods automatically:

```typescript
// Automatically handled by McpServer:
✅ tools/list    → Returns all registered tools with schemas
✅ tools/call    → Routes to your tool handlers with validation
✅ prompts/list  → Returns all registered prompts
✅ resources/list → Returns all registered resources

// You focus on business logic:
server.tool("name", "desc", schema, handler);
server.prompt("name", "desc", args, handler);
server.resource("uri", "name", "desc", handler);
```

## Message Flow Implementation

### 1. Server Initialization & Capability Declaration

```typescript
const server = new McpServer({
  name: "vaali", 
  version: "1.0.0"
}, {
  capabilities: {
    tools: { listChanged: true },
    prompts: { listChanged: true },
    resources: { listChanged: true }
  }
});

// Register tools - McpServer tracks these automatically
server.tool("get_weather", "Get weather", weatherSchema, weatherHandler);
server.tool("calculate", "Calculate", calcSchema, calcHandler);
```

### 2. Client Discovery Phase

```
Client → Server: {"method": "tools/list", "id": 1}
McpServer automatically responds with:
Server → Client: {
  "result": {
    "tools": [
      {
        "name": "get_weather",
        "description": "Get weather",
        "inputSchema": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "Location for weather"
            }
          },
          "required": []  // Empty because z.string().optional()
        }
      }
    ]
  }
}
```

### 3. Tool Invocation Phase

```
Client → Server: {
  "method": "tools/call",
  "params": {
    "name": "get_weather", 
    "arguments": {"location": "Seattle"}
  }
}

McpServer automatically:
1. Validates parameters against Zod schema
2. Routes to your handler function
3. Returns response in MCP format
```

## Error Handling Patterns

### Protocol Errors (Handled by McpServer)

```json
// Unknown tool
{"error": {"code": -32602, "message": "Unknown tool: invalid_tool"}}

// Invalid parameters (Zod validation failure)
{"error": {"code": -32602, "message": "Invalid params"}}
```

### Tool Execution Errors (Handled by Your Code)

```typescript
// In your tool handler:
if (!location) {
  return {
    content: [{
      type: "text",
      text: "Location required. Please specify a city name."
    }],
    isError: true  // Indicates tool-level error
  };
}
```

## Elicitation Pattern Implementation

### Smart Parameter Collection

Instead of failing with cryptic errors, implement elicitation patterns:

```typescript
// Basic elicitation
server.tool("get_weather", "Get weather", {
  location: z.string().optional().describe("Location for weather")
}, async ({ location }) => {
  if (!location) {
    return {
      content: [{
        type: "text",
        text: "Location required. Please use the 'get_location_for_weather' prompt for guidance."
      }],
      isError: true
    };
  }
  // Return weather data...
});

// Elicitation prompt
server.prompt("get_location_for_weather", 
  "Helps users provide location information", 
  {
    user_context: z.string().optional().describe("Context about the request")
  }, 
  async ({ user_context }) => {
    return {
      messages: [{
        role: "assistant",
        content: {
          type: "text",
          text: `Please provide a location for weather information.

Examples:
• "New York" - City name
• "London, UK" - City with country  
• "Tokyo, Japan" - International locations

Choose from suggestions: Seattle, Portland, Vancouver

You can also provide coordinates if preferred.`
        }
      }]
    };
  }
);
```

## Best Practices

### 1. Schema Design
- Use `z.string().optional()` for elicitation-friendly parameters
- Include `.describe()` for all parameters
- Use `z.enum()` for constrained choices

### 2. Error Messages
- Provide helpful guidance, not just "parameter required"
- Reference elicitation prompts when available
- Include examples of valid inputs

### 3. Tool Organization
- Group related tools logically
- Use consistent parameter naming
- Implement progressive enhancement (basic → enhanced tools)

### 4. Testing
- Test tools/list automatic generation
- Verify parameter schema accuracy
- Test elicitation flow end-to-end

## Implementation Checklist

✅ **Server Setup**
- [ ] Use McpServer with proper capabilities
- [ ] Register tools with Zod schemas
- [ ] Include helpful descriptions

✅ **Parameter Design**  
- [ ] Use `.optional()` for elicitation parameters
- [ ] Add `.describe()` to all parameters
- [ ] Test required vs optional behavior

✅ **Error Handling**
- [ ] Return helpful error messages
- [ ] Use `isError: true` flag appropriately
- [ ] Reference elicitation prompts

✅ **Testing**
- [ ] Verify tools/list works automatically
- [ ] Test parameter validation
- [ ] Test complete elicitation flows

This guide shows how the MCP SDK handles protocol complexity automatically, letting you focus on creating helpful, user-friendly tools with intelligent parameter collection.
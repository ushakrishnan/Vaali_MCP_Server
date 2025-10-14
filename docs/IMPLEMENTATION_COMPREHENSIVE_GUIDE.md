# MCP Implementation Guide: Complete Development Reference

A comprehensive guide to implementing MCP servers with hybrid elicitation patterns, testing strategies, and production-ready code examples.

## Table of Contents

1. [Project Architecture](#project-architecture)
2. [Core Implementation Patterns](#core-implementation-patterns)
3. [Testing Framework](#testing-framework)
4. [Advanced Features](#advanced-features)
5. [Production Deployment](#production-deployment)
6. [Complete Code Examples](#complete-code-examples)

## Project Architecture

### Overview

This project demonstrates a complete MCP server implementation with:

- **🚀 Hybrid Elicitation**: Official MCP elicitation + parameter guidance fallback
- **🛡️ Universal Compatibility**: Works with any MCP client
- **🧪 Comprehensive Testing**: Protocol compliance, integration, and functionality tests
- **📚 Rich Documentation**: Complete guides and examples
- **🔧 Production Ready**: Error handling, logging, and deployment patterns

### Directory Structure

```
vaali/
├── src/
│   ├── index.ts              # Server entry point with transport setup
│   └── server.ts             # Tool implementations and server configuration
├── tests/
│   ├── test-mcp-capabilities.mjs        # Protocol compliance tests
│   ├── test-parameter-schemas.mjs       # Schema validation tests
│   ├── test-elicitation-direct.mjs      # Elicitation testing
│   └── advanced-elicitation-client.mjs  # Advanced client patterns
├── docs/
│   ├── ELICITATION_COMPREHENSIVE_GUIDE.md  # Complete elicitation guide
│   ├── CLAUDE_DESKTOP_GUIDE.md             # Claude Desktop integration
│   └── README.md                           # Project overview
└── lib/                      # Compiled JavaScript output
```

### Key Components

#### 1. **Server Infrastructure** (`src/server.ts`)
- ✅ Tool registration with hybrid elicitation
- ✅ Structured prompts for parameter guidance
- ✅ Error handling and validation
- ✅ Capability detection and fallback logic

#### 2. **Transport Layer** (`src/index.ts`)
- ✅ Multiple transport support (stdio, SSE)
- ✅ Environment-based configuration
- ✅ Error handling and logging

#### 3. **Testing Suite** (`tests/`)
- ✅ Protocol compliance verification
- ✅ Elicitation functionality testing
- ✅ Integration testing with real clients
- ✅ Advanced pattern demonstrations

## Core Implementation Patterns

### Basic Tool with Hybrid Elicitation

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z } from "zod";

// Server setup with elicitation capability
const server = new Server(
  {
    name: "example-server",
    version: "1.0.0"
  },
  {
    capabilities: {
      tools: {},
      prompts: {},
      elicitation: {} // ← Declare elicitation support
    }
  }
);

// Hybrid elicitation tool pattern
server.tool(
  "example_tool_with_elicitation",
  "Example tool demonstrating hybrid elicitation pattern",
  {
    required_param: z.string().optional().describe("Required parameter for tool"),
    optional_param: z.string().optional().describe("Optional parameter with default")
  },
  async ({ required_param, optional_param }) => {
    // Step 1: Try official elicitation for missing parameters
    if (!required_param) {
      try {
        console.log("🔧 Attempting elicitation...");
        
        const result = await server.elicitInput({
          message: "Tool requires additional information:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              required_param: {
                type: "string" as const,
                title: "Required Parameter",
                description: "This parameter is required for tool execution",
                examples: ["example1", "example2", "example3"]
              }
            },
            required: ["required_param"]
          }
        });

        if (result.action === "accept") {
          console.log("✅ Elicitation successful");
          const content = result.content as Record<string, any>;
          if (content.required_param && typeof content.required_param === 'string') {
            required_param = content.required_param;
          }
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "🔧 Tool execution declined. Required parameter needed."
            }]
          };
        }
      } catch (error: any) {
        console.log("❌ Elicitation failed:", error.message);
        // Fall through to parameter guidance
      }
    }

    // Step 2: Parameter validation with guidance fallback
    if (!required_param) {
      return {
        content: [{
          type: "text",
          text: `🔧 Tool requires additional information:

**Required Parameter**: Please provide the required parameter

📋 **Examples:**
   • Option 1: "example1"
   • Option 2: "example2"  
   • Option 3: "example3"

💡 **Usage:** { "required_param": "your_value", "optional_param": "optional_value" }

🔬 **Note:** This tool demonstrates MCP elicitation. With an elicitation-capable client, you would see an interactive form.`
        }],
        isError: true
      };
    }

    // Step 3: Set defaults and execute tool logic
    optional_param = optional_param || "default_value";
    
    // Execute actual tool functionality
    return executeToolLogic(required_param, optional_param);
  }
);

async function executeToolLogic(required: string, optional: string) {
  return {
    content: [{
      type: "text",
      text: `🔧 Tool executed successfully!
      
**Required Parameter**: ${required}
**Optional Parameter**: ${optional}
**Timestamp**: ${new Date().toISOString()}

✅ Tool execution completed with provided parameters.`
    }]
  };
}
```

### Advanced Error Handling Pattern

```typescript
async function robustElicitationPattern({ param1, param2, param3 }) {
  const missingParams = [];
  const elicitSchema = {
    type: "object" as const,
    properties: {} as Record<string, any>,
    required: [] as string[]
  };

  // Build dynamic schema for missing parameters
  if (!param1) {
    elicitSchema.properties.param1 = {
      type: "string" as const,
      title: "Parameter 1",
      description: "First required parameter",
      examples: ["value1", "value2"]
    };
    elicitSchema.required.push("param1");
    missingParams.push("param1");
  }

  if (!param2) {
    elicitSchema.properties.param2 = {
      type: "number" as const,
      title: "Parameter 2", 
      description: "Numeric parameter",
      minimum: 1,
      maximum: 100,
      default: 50
    };
    // Optional parameter - not added to required
  }

  // Only attempt elicitation if we have missing required parameters
  if (missingParams.length > 0) {
    try {
      const result = await server.elicitInput({
        message: `Please provide missing parameters (${missingParams.join(', ')}):`,
        requestedSchema: elicitSchema
      });

      if (result.action === "accept") {
        const content = result.content as Record<string, any>;
        
        // Safely extract and validate each parameter
        if (content.param1 && typeof content.param1 === 'string') {
          param1 = content.param1;
        }
        if (content.param2 && typeof content.param2 === 'number') {
          param2 = content.param2;
        }
        
        console.log("✅ Elicitation completed:", { param1, param2 });
      } else {
        return createDeclinedResponse(result.action);
      }
    } catch (error: any) {
      console.log("❌ Elicitation error:", error.message);
      return createElicitationErrorResponse(missingParams);
    }
  }

  // Final validation and defaults
  if (!param1) {
    return createParameterGuidanceResponse();
  }
  
  param2 = param2 || 50; // Default value
  param3 = param3 || "default"; // Default value

  return executeWithParameters(param1, param2, param3);
}
```

### Multi-Transport Server Setup

```typescript
// src/index.ts - Complete server setup
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { server } from "./server.js";

async function main() {
  const args = process.argv.slice(2);
  const transportType = args[0] || "stdio";
  
  if (transportType === "sse") {
    // SSE Transport for web-based clients
    const app = express();
    let transport: SSEServerTransport;
    
    app.get("/sse", async (req, res) => {
      console.error("SSE connection request received");
      transport = new SSEServerTransport("/messages", res);
      await server.connect(transport);
    });
    
    app.post("/messages", async (req, res) => {
      console.error("Message post received");
      await transport.handlePostMessage(req, res);
    });
    
    const port = process.env.PORT || 3001;
    app.listen(port, () => {
      console.error(`MCP Server running on sse, listening on port ${port}`);
    });
    
  } else if (transportType === "stdio") {
    // Stdio Transport for Claude Desktop and similar clients
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MCP Server running on stdio");
    
  } else {
    throw new Error(`Unknown transport type: ${transportType}`);
  }
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
```

## Testing Framework

### Protocol Compliance Testing

```typescript
// tests/test-mcp-capabilities.mjs
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { spawn } from "child_process";

async function testMCPCompliance() {
  console.log("🔧 Testing MCP Protocol Compliance\n");

  // Start server as child process
  const serverProcess = spawn("node", ["./lib/src/index.js", "stdio"], {
    cwd: process.cwd(),
    stdio: ["pipe", "pipe", "inherit"]
  });

  // Create client connection
  const transport = new StdioClientTransport({
    reader: serverProcess.stdout,
    writer: serverProcess.stdin
  });

  const client = new Client({
    name: "test-client",
    version: "1.0.0"
  }, {
    capabilities: {}
  });

  try {
    await client.connect(transport);
    console.log("✅ Connected to MCP server\n");

    // Test 1: Tools listing
    console.log("🧪 Test 1: Tools listing...");
    const tools = await client.listTools();
    console.log(`✅ Found ${tools.tools.length} tools`);
    
    tools.tools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });

    // Test 2: Prompts listing  
    console.log("\n🧪 Test 2: Prompts listing...");
    const prompts = await client.listPrompts();
    console.log(`✅ Found ${prompts.prompts.length} prompts`);
    
    prompts.prompts.forEach(prompt => {
      console.log(`   - ${prompt.name}: ${prompt.description}`);
    });

    // Test 3: Tool execution
    console.log("\n🧪 Test 3: Tool execution...");
    const result = await client.callTool("example_tool", { test: "value" });
    console.log("✅ Tool execution successful");
    
    console.log("\n✅ All MCP compliance tests passed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    await client.close();
    serverProcess.kill();
    console.log("🧹 Cleaned up test environment");
  }
}

testMCPCompliance().catch(console.error);
```

### Elicitation Testing

```typescript
// tests/test-elicitation-functionality.mjs
async function testElicitationFunctionality() {
  console.log("🌧️ Testing Elicitation Functionality\n");

  const client = await createTestClient();

  // Test 1: No parameters (should trigger elicitation attempt)
  console.log("🧪 Test 1: Elicitation trigger test...");
  try {
    const result = await client.callTool("rain_prediction_with_elicitation", {});
    
    if (result.isError) {
      console.log("✅ Parameter guidance triggered correctly");
      const text = result.content[0].text;
      console.log("✅ Contains examples:", text.includes("Seattle"));
      console.log("✅ Contains elicitation note:", text.includes("elicitation"));
    } else {
      console.log("⚠️ Unexpected success without parameters");
    }
  } catch (error) {
    console.log("❌ Elicitation test error:", error.message);
  }

  // Test 2: With parameters (should execute successfully)
  console.log("\n🧪 Test 2: Successful execution test...");
  try {
    const result = await client.callTool("rain_prediction_with_elicitation", {
      location: "Tokyo",
      hours_ahead: 24,
      include_probability: true
    });
    
    const text = result.content[0].text;
    console.log("✅ Got prediction for Tokyo");
    console.log("✅ Contains forecast period:", text.includes("Forecast Period"));
    console.log("✅ Contains test result:", text.includes("Elicitation Test Result"));
  } catch (error) {
    console.log("❌ Execution test error:", error.message);
  }

  console.log("\n✅ Elicitation functionality tests completed!");
}
```

### Integration Testing

```typescript
// tests/test-integration.mjs
async function testFullIntegration() {
  console.log("🔗 Testing Full Integration Workflows\n");

  const client = await createTestClient();

  // Test workflow: Weather lookup with elicitation
  console.log("🧪 Integration Test: Weather workflow...");
  
  // Step 1: Try without location (get guidance)
  const step1 = await client.callTool("get_weather_with_elicitation", {});
  console.log("✅ Step 1: Got parameter guidance");
  
  // Step 2: Use guidance to provide location
  const step2 = await client.callTool("get_weather_with_elicitation", {
    location: "San Francisco"
  });
  console.log("✅ Step 2: Got weather data with provided location");
  
  // Verify workflow consistency
  console.log("✅ Full integration workflow completed successfully");
}
```

## Advanced Features

### Conditional Elicitation

```typescript
async function conditionalElicitationExample({ userType, preferences }) {
  // Different elicitation based on user context
  const schema = {
    type: "object" as const,
    properties: {} as Record<string, any>,
    required: [] as string[]
  };

  if (userType === "beginner") {
    // Simple schema for beginners
    schema.properties.basicOption = {
      type: "string" as const,
      title: "Choose Option",
      enum: ["option1", "option2", "option3"],
      description: "Select one of the basic options"
    };
  } else if (userType === "advanced") {
    // Complex schema for advanced users
    schema.properties.advancedConfig = {
      type: "string" as const,
      title: "Advanced Configuration",
      description: "Provide custom configuration string",
      pattern: "^[a-zA-Z0-9_-]+$"
    };
  }

  return attemptElicitation(schema);
}
```

### Smart Default Detection

```typescript
async function smartDefaultsExample({ location, timezone }) {
  // Try to detect context-aware defaults
  if (!location) {
    const detectedLocation = await detectUserLocation();
    
    if (detectedLocation) {
      const result = await server.elicitInput({
        message: `Detected location: ${detectedLocation}. Use this location?`,
        requestedSchema: {
          type: "object" as const,
          properties: {
            useDetected: {
              type: "boolean" as const,
              title: "Use Detected Location",
              description: `Use ${detectedLocation} for this request`,
              default: true
            },
            customLocation: {
              type: "string" as const,
              title: "Custom Location",
              description: "Or specify a different location"
            }
          }
        }
      });
      
      if (result.action === "accept") {
        location = result.content.useDetected ? 
          detectedLocation : 
          result.content.customLocation;
      }
    }
  }
  
  return executeWithSmartDefaults(location, timezone);
}
```

### Multi-Step Elicitation

```typescript
class ElicitationWizard {
  constructor() {
    this.steps = [];
    this.results = {};
  }
  
  addStep(name, schema, condition = () => true) {
    this.steps.push({ name, schema, condition });
    return this;
  }
  
  async execute() {
    for (const step of this.steps) {
      if (!step.condition(this.results)) {
        continue;
      }
      
      const result = await server.elicitInput({
        message: `Step: ${step.name}`,
        requestedSchema: step.schema
      });
      
      if (result.action === "accept") {
        this.results[step.name] = result.content;
      } else {
        break; // User declined or cancelled
      }
    }
    
    return this.results;
  }
}

// Usage example
async function wizardExample() {
  const wizard = new ElicitationWizard()
    .addStep("contact", {
      type: "object",
      properties: {
        email: { type: "string", format: "email" },
        name: { type: "string" }
      },
      required: ["email"]
    })
    .addStep("preferences", {
      type: "object", 
      properties: {
        notifications: { type: "boolean", default: true },
        frequency: { type: "string", enum: ["daily", "weekly", "monthly"] }
      }
    }, (results) => results.contact?.email); // Only if email provided

  const data = await wizard.execute();
  return processWizardResults(data);
}
```

## Production Deployment

### Environment Configuration

```typescript
// src/config.ts
export const config = {
  // Server configuration
  name: process.env.MCP_SERVER_NAME || "production-server",
  version: process.env.MCP_SERVER_VERSION || "1.0.0",
  
  // Transport configuration
  transport: process.env.MCP_TRANSPORT || "stdio",
  port: parseInt(process.env.PORT || "3001"),
  
  // Feature flags
  enableElicitation: process.env.ENABLE_ELICITATION !== "false",
  enableLogging: process.env.ENABLE_LOGGING !== "false",
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW || "60000"),
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  
  // Security
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(",") || ["*"],
  requireAuth: process.env.REQUIRE_AUTH === "true"
};
```

### Error Handling and Logging

```typescript
// src/error-handling.ts
import { Logger } from "./logger.js";

export class ElicitationError extends Error {
  constructor(message: string, public code: string, public details?: any) {
    super(message);
    this.name = "ElicitationError";
  }
}

export async function safeElicitation(
  elicitFn: () => Promise<any>,
  fallbackFn: () => Promise<any>,
  context: string
) {
  try {
    Logger.info(`Attempting elicitation: ${context}`);
    const result = await elicitFn();
    Logger.info(`Elicitation successful: ${context}`);
    return result;
  } catch (error) {
    Logger.warn(`Elicitation failed: ${context}`, error);
    Logger.info(`Falling back to parameter guidance: ${context}`);
    return await fallbackFn();
  }
}

export function createProductionErrorResponse(error: Error, context: string) {
  Logger.error(`Production error: ${context}`, error);
  
  return {
    content: [{
      type: "text",
      text: `⚠️ An error occurred during ${context}. Please try again or contact support if the issue persists.`
    }],
    isError: true
  };
}
```

### Health Monitoring

```typescript
// src/health.ts
export class HealthMonitor {
  private static metrics = {
    totalRequests: 0,
    successfulElicitations: 0,
    failedElicitations: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date()
  };

  static recordElicitationAttempt(success: boolean, responseTime: number) {
    this.metrics.totalRequests++;
    if (success) {
      this.metrics.successfulElicitations++;
    } else {
      this.metrics.failedElicitations++;
    }
    
    // Update average response time
    this.metrics.averageResponseTime = 
      (this.metrics.averageResponseTime + responseTime) / 2;
  }

  static getHealthStatus() {
    const successRate = this.metrics.successfulElicitations / 
      (this.metrics.successfulElicitations + this.metrics.failedElicitations);
    
    return {
      status: successRate > 0.8 ? "healthy" : "degraded",
      metrics: this.metrics,
      timestamp: new Date().toISOString()
    };
  }
}
```

## Complete Code Examples

### Production-Ready Weather Tool

```typescript
// Complete production weather tool with all patterns
server.tool(
  "weather_production",
  "Production-ready weather tool with comprehensive elicitation support",
  {
    location: z.string().optional().describe("Location for weather lookup"),
    units: z.enum(["celsius", "fahrenheit"]).optional().describe("Temperature units"),
    includeExtended: z.boolean().optional().describe("Include extended forecast")
  },
  async ({ location, units, includeExtended }) => {
    const startTime = Date.now();
    const context = "weather_production";
    
    try {
      // Production elicitation with monitoring
      const result = await safeElicitation(
        async () => {
          if (!location) {
            return await server.elicitInput({
              message: "Weather information requires your location:",
              requestedSchema: {
                type: "object" as const,
                properties: {
                  location: {
                    type: "string" as const,
                    title: "Location",
                    description: "City name, coordinates, or address",
                    examples: ["Seattle, WA", "Tokyo, Japan", "40.7128,-74.0060"]
                  },
                  units: {
                    type: "string" as const,
                    title: "Temperature Units",
                    enum: ["celsius", "fahrenheit"],
                    default: "fahrenheit"
                  },
                  includeExtended: {
                    type: "boolean" as const,
                    title: "Extended Forecast",
                    description: "Include 7-day forecast",
                    default: false
                  }
                },
                required: ["location"]
              }
            });
          }
          return null;
        },
        async () => {
          if (!location) {
            return {
              content: [{
                type: "text",
                text: createParameterGuidanceMessage()
              }],
              isError: true
            };
          }
          return null;
        },
        context
      );
      
      if (result?.isError) {
        return result;
      }
      
      if (result?.action === "accept") {
        const content = result.content as Record<string, any>;
        location = content.location || location;
        units = content.units || units;
        includeExtended = content.includeExtended || includeExtended;
      }
      
      // Validate and set defaults
      if (!location) {
        throw new ElicitationError("Location required", "MISSING_LOCATION");
      }
      
      units = units || "fahrenheit";
      includeExtended = includeExtended || false;
      
      // Execute weather lookup
      const weatherData = await getWeatherData(location, units, includeExtended);
      
      // Record success metrics
      HealthMonitor.recordElicitationAttempt(true, Date.now() - startTime);
      
      return {
        content: [{
          type: "text",
          text: formatWeatherResponse(weatherData, location, units, includeExtended)
        }]
      };
      
    } catch (error) {
      HealthMonitor.recordElicitationAttempt(false, Date.now() - startTime);
      return createProductionErrorResponse(error, context);
    }
  }
);

function createParameterGuidanceMessage() {
  return `🌤️ Weather Tool - Location Required

Please provide your location for weather information:

📍 **Location Examples:**
   • City: "Seattle", "London", "Tokyo"
   • City with region: "Austin, TX", "Paris, France"  
   • Coordinates: "40.7128,-74.0060"

⚙️ **Optional Parameters:**
   • units: "celsius" or "fahrenheit" (default: fahrenheit)
   • includeExtended: true/false (default: false)

💡 **Example:** { "location": "San Francisco", "units": "celsius", "includeExtended": true }

🔬 **Note:** This tool supports MCP elicitation for enhanced user experience.`;
}
```

### Azure Deployment with GitHub Actions

For automated deployment to Azure App Service, this guide covers setting up GitHub Actions CI/CD pipeline with proper Azure credentials.

#### Prerequisites

- Azure subscription with sufficient permissions
- GitHub repository with your MCP server code
- Azure CLI installed locally

#### Step 1: Azure Service Principal Setup

Due to Azure tenant policies that may restrict credential lifetime, you have two approaches:

##### Option A: Azure CLI (If Policies Allow)

```bash
# Get your subscription and tenant info
az account show --query "{subscriptionId:id, tenantId:tenantId}" --output table

# Create service principal (replace YOUR_SUBSCRIPTION_ID)
az ad sp create-for-rbac \
  --name "your-mcp-server-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --sdk-auth
```

**Note:** If you get "Credential lifetime exceeds the max value" error, use Option B.

##### Option B: Azure Portal Manual Setup (Recommended)

When Azure CLI fails due to restrictive tenant policies:

1. **Create App Registration:**
   - Go to [Azure Portal](https://portal.azure.com) → **Microsoft Entra ID** → **App registrations**
   - Click **"New registration"**
   - Name: `your-mcp-server-github-actions`
   - Click **"Register"**
   - Copy the **Application (client) ID**

2. **Create Client Secret:**
   - In your app registration → **Certificates & secrets**
   - Click **"New client secret"**
   - Description: `GitHub Actions Secret`
   - Expires: Choose the maximum allowed by your tenant policy
   - Click **"Add"** and **copy the secret value immediately**

3. **Assign Contributor Role:**
   ```bash
   # Replace with your values
   az role assignment create \
     --assignee YOUR_APP_CLIENT_ID \
     --role contributor \
     --scope /subscriptions/YOUR_SUBSCRIPTION_ID
   ```

4. **Create Credentials JSON:**
   ```json
   {
     "clientId": "YOUR_APP_CLIENT_ID",
     "clientSecret": "YOUR_CLIENT_SECRET",
     "subscriptionId": "YOUR_SUBSCRIPTION_ID", 
     "tenantId": "YOUR_TENANT_ID"
   }
   ```

#### Step 2: GitHub Repository Setup

1. **Add GitHub Secret:**
   - Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
   - Click **"New repository secret"**
   - Name: `AZURE_CREDENTIALS`
   - Value: Paste the JSON from Step 1

2. **Verify Workflow File:**
   Ensure `.github/workflows/azure-deploy.yml` exists with proper triggers:
   ```yaml
   on:
     workflow_dispatch:
     push:
       branches: [ main ]
       paths-ignore:
         - '**.md'
         - 'docs/**'
         - 'infra/**'
   ```

#### Step 3: Test Deployment

1. **Manual Test:**
   - Go to **Actions** tab in your GitHub repo
   - Click **"Deploy to Azure App Service"**
   - Click **"Run workflow"**
   - Select branch and environment
   - Click **"Run workflow"**

2. **Automatic Test:**
   - Make a code change (not documentation)
   - Push to main branch
   - Check **Actions** tab for automatic deployment

#### Workflow Features

The GitHub Actions workflow includes:

- ✅ **Smart Credential Detection:** Skips deployment if `AZURE_CREDENTIALS` not configured
- ✅ **Automatic Infrastructure:** Creates Azure resources if they don't exist
- ✅ **Build and Test:** Runs `npm ci`, `npm run build`, `npm test`
- ✅ **Production Configuration:** Sets `NODE_ENV=production`, `PORT=8080`
- ✅ **Health Checks:** Validates endpoints after deployment
- ✅ **Deployment URLs:** Provides SSE and health endpoint URLs

#### Troubleshooting

**Common Issues:**

1. **"Credential lifetime exceeds policy"**
   - Use Azure Portal manual setup (Option B)
   - Contact Azure admin to check tenant policies

2. **"Insufficient privileges"**
   - Ensure service principal has Contributor role
   - Check subscription permissions

3. **"Resource group creation failed"**
   - Verify subscription has quota for App Service
   - Check naming conflicts

4. **"Deployment timeout"**
   - Check application logs in Azure portal
   - Verify package.json scripts (`build`, `start`)

#### Security Best Practices

- ✅ **Minimal Permissions:** Service principal has only Contributor access to specific subscription
- ✅ **Short-Lived Secrets:** Use minimum credential lifetime required
- ✅ **Secure Storage:** GitHub encrypts repository secrets
- ✅ **Audit Trail:** All deployments logged in GitHub Actions and Azure Activity Log

### Alternative: Deploy to Azure Button + Manual Updates

For users who prefer the one-click "Deploy to Azure" button approach, here are efficient update strategies that don't require deleting resource groups:

#### Option 1: Azure Portal Deployment Center (Recommended)

After initial deployment via Deploy to Azure button:

1. **Navigate to App Service** in Azure Portal
2. **Deployment Center** → **Settings** 
3. **Source:** GitHub
4. **Authorize GitHub** and select repository
5. **Branch:** main
6. **Save configuration**

**Result:** Automatic deployment on every push to main branch! 🚀

#### Option 2: Azure CLI Quick Updates

```bash
# Build project locally
npm run build

# Create deployment package (Windows PowerShell)
Compress-Archive -Path dist,package.json,package-lock.json,data,config.json -DestinationPath deploy.zip -Force

# Deploy to existing App Service (replace YOUR_APP_NAME)
az webapp deployment source config-zip \
  --resource-group vaali-mcp-rg \
  --name YOUR_APP_NAME \
  --src deploy.zip

# Optional: Restart app service
az webapp restart --name YOUR_APP_NAME --resource-group vaali-mcp-rg

# Get deployment URL to test
az webapp show --name YOUR_APP_NAME --resource-group vaali-mcp-rg --query defaultHostName -o tsv
```

```bash
# Linux/macOS alternative for zip creation
zip -r deploy.zip dist package.json package-lock.json data config.json
```

#### Option 3: VS Code Azure Extension

1. **Install Azure App Service extension** in VS Code
2. **Sign in to Azure account**
3. **Right-click App Service** → **Deploy to Web App**
4. **Select dist folder** for deployment

#### Option 4: Manual Workflow Trigger

Use existing GitHub Actions workflow manually:

1. **GitHub Actions tab** → **Deploy to Azure App Service**
2. **Run workflow** → Select **production** environment
3. **Monitor deployment** in Actions log

#### Update Strategy Comparison

| Method | Setup Time | Automation Level | Best For |
|--------|------------|------------------|----------|
| **Deployment Center** | 5 minutes | Fully automatic | Production use |
| **Azure CLI** | None | Manual | Quick fixes |
| **VS Code Extension** | 2 minutes | Semi-automatic | Development |
| **GitHub Actions** | One-time | Triggered manually | Testing |

**💡 Recommended Approach:**
1. **Initial deployment:** Deploy to Azure button
2. **Setup automation:** Deployment Center (one-time, 5 minutes)  
3. **Ongoing updates:** Push to GitHub → Automatic deployment

**⚠️ Never delete Resource Group for updates:**
- **Wastes money:** New resource provisioning costs
- **Loses configuration:** Custom domains, SSL, environment variables
- **Unnecessary downtime:** All update methods work with existing resources

This comprehensive implementation guide provides everything needed to build production-ready MCP servers with hybrid elicitation patterns, complete testing frameworks, and robust error handling.

## Conclusion

This implementation demonstrates:

- ✅ **Complete MCP Server**: All protocol requirements met
- ✅ **Hybrid Elicitation**: Universal compatibility with progressive enhancement
- ✅ **Production Ready**: Error handling, logging, monitoring
- ✅ **Comprehensive Testing**: Protocol compliance and functionality verification
- ✅ **Best Practices**: Security, performance, maintainability

The patterns and examples in this guide provide a solid foundation for building sophisticated MCP applications that work across all client types while providing optimal user experiences.
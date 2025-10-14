# MCP Elicitation: Comprehensive Implementation Guide

A complete guide to implementing MCP elicitation with universal compatibility using the hybrid approach.

## Table of Contents

1. [Understanding MCP Elicitation](#understanding-mcp-elicitation)
2. [Hybrid Implementation Strategy](#hybrid-implementation-strategy)
3. [Technical Implementation](#technical-implementation)
4. [Architecture Patterns](#architecture-patterns)
5. [Best Practices](#best-practices)
6. [Real-World Examples](#real-world-examples)
7. [Advanced Patterns](#advanced-patterns)

## Understanding MCP Elicitation

**MCP Elicitation** enables tools to seamlessly collect missing parameters **during execution** through interactive forms and dialogs, transforming rigid API calls into natural, conversational workflows.

### What Elicitation Solves

**Traditional Tool Flow:**
```
User: "What's the weather like?"
Tool: Error - Location parameter required
User: Must start over with "What's weather in Seattle?"
```

**With Elicitation:**
```
User: "What's the weather like?"
Tool: Interactive form appears asking for location
User: Fills in "Seattle"
Tool: Returns weather for Seattle
```

### Two Complementary Approaches

#### 1. 🚀 **Official MCP Elicitation** (Enhanced Experience)

Interactive parameter collection for elicitation-capable clients using `server.elicitInput()`.

**How it works:**
```typescript
// Tool starts execution and detects missing location
const result = await server.elicitInput({
  type: "object",
  properties: {
    location: { 
      type: "string", 
      description: "City name or coordinates for weather lookup" 
    }
  },
  required: ["location"]
}, "Please provide your location for weather information");

// Client shows interactive form to user
// User responds: { action: "accept", content: { location: "Seattle" } }
// Tool continues execution with collected data
```

**Characteristics:**
- ✅ Interactive forms during tool execution
- ✅ Structured JSON schema validation  
- ✅ Accept/Decline/Cancel response model
- ✅ Official MCP protocol feature
- ⚠️ Requires client elicitation capability support

#### 2. 📋 **Parameter Guidance Pattern** (Universal Compatibility)

Intelligent error handling using MCP's existing features to guide parameter collection.

**How it works:**
```typescript
// 1. Tool called with missing parameter
const result = await client.callTool("get_weather", {});

// 2. Server returns helpful error with detailed guidance
{
  "content": [{
    "type": "text",
    "text": "Location required for weather lookup. Please specify:\n- City name (e.g., 'New York', 'London')\n- City with state (e.g., 'Austin, TX')\n- Coordinates (e.g., '40.7128,-74.0060')"
  }],
  "isError": true
}

// 3. Client processes guidance and prompts user
// 4. User provides: "Seattle"
// 5. Client retries: callTool("get_weather", { location: "Seattle" })
```

**Characteristics:**
- ✅ Works with ANY MCP client
- ✅ Rich, contextual guidance with examples
- ✅ Uses standard MCP features
- ⚠️ Requires intelligent client implementation

## Hybrid Implementation Strategy

**Our Approach: Best of Both Worlds**

We implement **both approaches simultaneously** in the same tools, providing:
- ✨ **Enhanced experience** for elicitation-capable clients
- 🛡️ **Universal compatibility** for all MCP clients
- 🔄 **Automatic capability detection** and graceful fallback

### Benefits of Hybrid Approach

| Feature | Official Only | Guidance Only | Hybrid Approach |
|---------|---------------|---------------|-----------------|
| **Compatibility** | Elicitation clients only | Universal | Universal with enhancement |
| **User Experience** | Rich forms | Text guidance | Best for each client |
| **Implementation** | Simple | Client-dependent | Progressive enhancement |
| **Future-Proof** | Yes | Limited | Optimal |

## Technical Implementation

### Basic Hybrid Pattern

```typescript
async function weatherToolWithElicitation({ location, units }) {
  // Step 1: Try official elicitation for missing parameters
  if (!location) {
    try {
      console.log("🌤️ Attempting weather elicitation...");
      
      const result = await server.elicitInput({
        message: "Weather information requires your location:",
        requestedSchema: {
          type: "object" as const,
          properties: {
            location: {
              type: "string" as const,
              title: "Location",
              description: "City name, coordinates, or address",
              examples: ["Seattle, WA", "Tokyo, Japan", "40.7128,-74.0060"]
            }
          },
          required: ["location"]
        }
      });

      if (result.action === "accept") {
        location = result.content.location;
        console.log("✅ Elicitation successful:", location);
      } else if (result.action === "decline") {
        return {
          content: [{
            type: "text",
            text: "🌤️ Weather lookup declined. Location information is required."
          }]
        };
      }
    } catch (error) {
      console.log("❌ Elicitation failed:", error.message);
      // Fall through to parameter guidance
    }
  }

  // Step 2: Parameter validation with guidance fallback
  if (!location) {
    return {
      content: [{
        type: "text",
        text: `🌤️ Weather Tool - Location Required

Please provide your location for weather information:

📍 **Location Examples:**
   • City: "Seattle", "London", "Tokyo"
   • City with region: "Austin, TX", "Paris, France"
   • Coordinates: "40.7128,-74.0060"

💡 **Example:** { "location": "San Francisco", "units": "metric" }

🔬 **Note:** This tool demonstrates MCP elicitation. With an elicitation-capable client, you would see an interactive form instead of this message.`
      }],
      isError: true
    };
  }

  // Step 3: Execute tool logic with collected parameters
  return getWeatherData(location, units || "imperial");
}
```

### Error Handling and Response Parsing

```typescript
if (result.action === "accept") {
  console.log("✅ Elicitation successful!");
  console.log("Raw result:", JSON.stringify(result, null, 2));
  
  try {
    const content = result.content;
    if (typeof content === 'object' && content !== null) {
      const contentObj = content as Record<string, any>;
      
      if (contentObj.location && typeof contentObj.location === 'string') {
        location = contentObj.location;
        console.log("✅ Got location from elicitation:", location);
      }
      
      if (contentObj.units && typeof contentObj.units === 'string') {
        units = contentObj.units;
        console.log("✅ Got units from elicitation:", units);
      }
    }
  } catch (parseError) {
    console.log("❌ Error parsing elicitation response:", parseError.message);
    // Fall through to parameter guidance
  }
}
```

### Schema Design Best Practices

```typescript
// ✅ Good: Flat object with primitive types
const goodSchema = {
  type: "object" as const,
  properties: {
    location: {
      type: "string" as const,
      title: "Location",
      description: "City name or coordinates",
      examples: ["Seattle", "Tokyo", "40.7128,-74.0060"]
    },
    units: {
      type: "string" as const,
      title: "Temperature Units",
      description: "Temperature unit preference",
      enum: ["celsius", "fahrenheit"],
      default: "fahrenheit"
    },
    includeForecast: {
      type: "boolean" as const,
      title: "Include Forecast",
      description: "Include 5-day weather forecast",
      default: false
    }
  },
  required: ["location"]
};

// ❌ Avoid: Nested objects, complex types
const badSchema = {
  type: "object",
  properties: {
    location: {
      type: "object", // ❌ No nested objects
      properties: {
        city: { type: "string" },
        coordinates: { type: "array" } // ❌ No arrays
      }
    }
  }
};
```

## Architecture Patterns

### Pattern 1: Progressive Enhancement

```typescript
// Start with basic functionality, enhance with elicitation
async function basicTool({ param1, param2 }) {
  // 1. Basic parameter validation
  if (!param1) {
    return createParameterGuidance("param1", "Please provide param1...");
  }
  
  // 2. Tool execution
  return executeToolLogic(param1, param2);
}

// Enhanced version with elicitation
async function enhancedTool({ param1, param2 }) {
  // 1. Try elicitation first
  const elicited = await tryElicitation({ param1, param2 });
  if (elicited) {
    ({ param1, param2 } = elicited);
  }
  
  // 2. Fall back to basic pattern
  return basicTool({ param1, param2 });
}
```

### Pattern 2: Conditional Elicitation

```typescript
async function smartElicitation({ requiredParam, optionalParam }) {
  const missingParams = [];
  const elicitSchema = { type: "object", properties: {}, required: [] };
  
  // Only elicit missing required parameters
  if (!requiredParam) {
    elicitSchema.properties.requiredParam = {
      type: "string",
      description: "This parameter is required"
    };
    elicitSchema.required.push("requiredParam");
    missingParams.push("requiredParam");
  }
  
  // Optionally elicit optional parameters with defaults
  if (!optionalParam) {
    elicitSchema.properties.optionalParam = {
      type: "string",
      description: "Optional parameter",
      default: "default_value"
    };
  }
  
  // Only elicit if there are missing required parameters
  if (missingParams.length > 0) {
    return attemptElicitation(elicitSchema);
  }
  
  return executeWithDefaults({ requiredParam, optionalParam });
}
```

### Pattern 3: Multi-step Elicitation

```typescript
async function multiStepElicitation(args) {
  // Step 1: Collect basic required information
  if (!args.basicInfo) {
    const basicResult = await server.elicitInput({
      message: "Let's start with basic information:",
      requestedSchema: basicInfoSchema
    });
    
    if (basicResult.action === "accept") {
      args.basicInfo = basicResult.content;
    }
  }
  
  // Step 2: Collect advanced options based on basic info
  if (args.basicInfo && !args.advancedOptions) {
    const advancedSchema = generateAdvancedSchema(args.basicInfo);
    const advancedResult = await server.elicitInput({
      message: "Now let's configure advanced options:",
      requestedSchema: advancedSchema
    });
    
    if (advancedResult.action === "accept") {
      args.advancedOptions = advancedResult.content;
    }
  }
  
  return executeComplexTool(args);
}
```

## Best Practices

### For Server Developers

1. **Always implement parameter guidance fallback**
   ```typescript
   // Never rely solely on elicitation
   if (!requiredParam) {
     return createHelpfulGuidance();
   }
   ```

2. **Use clear, descriptive schemas**
   ```typescript
   {
     type: "string",
     title: "Location", // Clear title
     description: "City name, coordinates, or address", // Detailed description
     examples: ["Seattle, WA", "Tokyo", "40.7128,-74.0060"] // Multiple examples
   }
   ```

3. **Handle all response types**
   ```typescript
   if (result.action === "accept") {
     // Use provided data
   } else if (result.action === "decline") {
     // User declined - provide alternative
   } else {
     // Cancelled or timeout - graceful handling
   }
   ```

4. **Validate elicited data**
   ```typescript
   if (result.action === "accept") {
     const content = result.content;
     if (validateContent(content)) {
       useContent(content);
     } else {
       return createValidationError();
     }
   }
   ```

### For Client Developers

1. **Declare elicitation capability**
   ```typescript
   const client = new Client({
     name: "my-client",
     version: "1.0.0"
   }, {
     capabilities: {
       elicitation: {} // Declare support
     }
   });
   ```

2. **Implement rich form generation**
   ```typescript
   // Convert JSON schema to interactive UI forms
   function generateForm(schema) {
     return schema.properties.map(prop => 
       createFormField(prop.type, prop.title, prop.description)
     );
   }
   ```

3. **Handle timeout and cancellation**
   ```typescript
   try {
     const result = await client.elicit(request);
     // Handle result
   } catch (error) {
     if (error.code === 'TIMEOUT') {
       // Handle timeout gracefully
     }
   }
   ```

## Real-World Examples

### Weather Tool Workflow

**With Elicitation Client:**
```
User: "What's the weather like?"
→ 📱 Location input form appears
→ User enters "Seattle, WA"
→ ✅ "Currently 45°F and cloudy in Seattle"
```

**With Standard Client:**
```
User: "What's the weather like?"
→ 📝 "Location required. Please specify a city name..."
→ User: "Seattle"
→ ✅ "Currently 45°F and cloudy in Seattle"
```

### Email Composition Tool

**With Elicitation Client:**
```
User: "Send email to alice@example.com"
→ 📝 Subject/body composition form appears
→ User fills: Subject: "Meeting Tomorrow", Body: "Let's meet at 2pm"
→ ✅ "Email sent successfully"
```

**With Standard Client:**
```
User: "Send email to alice@example.com"
→ 📝 "Subject and body required. Please provide..."
→ User provides subject and body
→ ✅ "Email sent successfully"
```

### File Search Tool

**With Elicitation Client:**
```
User: "Find some files"
→ 🔍 Search criteria form appears
→ User specifies: Pattern: "*.ts", Directory: "src/"
→ ✅ Returns TypeScript files in src directory
```

**With Standard Client:**
```
User: "Find some files"
→ 📝 "Search criteria required. Specify file pattern..."
→ User: "Find *.ts files in src/"
→ ✅ Returns TypeScript files in src directory
```

## Advanced Patterns

### Smart Default Detection

```typescript
async function smartWeatherTool({ location, units }) {
  // Try to detect user location from context
  if (!location) {
    const detectedLocation = await detectUserLocation();
    if (detectedLocation) {
      // Ask for confirmation instead of requiring input
      const result = await server.elicitInput({
        message: `Use detected location: ${detectedLocation}?`,
        requestedSchema: {
          type: "object",
          properties: {
            useDetected: {
              type: "boolean",
              title: "Use Detected Location",
              description: `Use ${detectedLocation} for weather lookup`,
              default: true
            },
            customLocation: {
              type: "string",
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
  
  return getWeatherData(location, units);
}
```

### Contextual Schema Generation

```typescript
function generateEmailSchema(context) {
  const schema = {
    type: "object",
    properties: {
      recipient: {
        type: "string",
        title: "Recipient",
        description: "Email address of recipient"
      }
    },
    required: ["recipient"]
  };
  
  // Add subject suggestions based on context
  if (context.includes("meeting")) {
    schema.properties.subject = {
      type: "string",
      title: "Subject",
      description: "Email subject",
      examples: ["Meeting Request", "Meeting Follow-up", "Meeting Confirmation"]
    };
  }
  
  // Add template options for common scenarios
  if (context.includes("urgent")) {
    schema.properties.priority = {
      type: "string",
      title: "Priority",
      enum: ["high", "normal", "low"],
      default: "high"
    };
  }
  
  return schema;
}
```

### Elicitation Chain Management

```typescript
class ElicitationChain {
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
        message: `Step ${step.name}:`,
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

// Usage
const chain = new ElicitationChain()
  .addStep("contact", contactSchema)
  .addStep("message", messageSchema, (results) => results.contact?.email)
  .addStep("options", optionsSchema);

const data = await chain.execute();
```

## Future Enhancements

1. **🎨 Rich Schema Support**: Support for more complex form types
2. **🔄 Multi-step Elicitation**: Collecting parameters in logical stages
3. **🧠 Smart Defaults**: Pre-filling forms with contextual information
4. **📊 Analytics**: Understanding parameter collection patterns
5. **🎯 Conditional Logic**: Dynamic forms based on user responses
6. **🌐 Internationalization**: Multi-language elicitation support

## Conclusion

The hybrid elicitation approach provides:

- ✅ **Universal Compatibility**: Works with any MCP client
- ✅ **Progressive Enhancement**: Better experience where possible
- ✅ **Future-Proof**: Ready for elicitation adoption
- ✅ **Best Practices**: Proper error handling and validation
- ✅ **Real-World Ready**: Production-tested patterns

By implementing both official elicitation and parameter guidance patterns, your MCP tools can provide optimal user experiences across all client types while maintaining forward compatibility for future protocol enhancements.

**The result**: Natural, conversational tool interactions that work universally while providing enhanced experiences where possible! 🚀
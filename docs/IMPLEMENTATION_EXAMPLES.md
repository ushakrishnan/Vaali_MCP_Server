# Implementation Examples: Hybrid Elicitation Patterns

This document provides complete code examples for implementing hybrid elicitation tools that work with both elicitation-capable and standard MCP clients.

## Basic Implementation Template

### Complete Tool Implementation

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";

// Server instance with elicitation capability
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

// Example: Weather tool with hybrid elicitation
export async function get_weather_with_elicitation(args: any) {
  // Step 1: Try official elicitation (enhanced experience)
  if (server.options.capabilities?.elicitation && !args.location) {
    try {
      const result = await server.elicitInput({
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "City name, state/country, or coordinates for weather lookup"
          }
        },
        required: ["location"]
      }, "Please provide your location for weather information");
      
      // Handle elicitation response
      if (result.action === "accept") {
        args.location = (result.content as any).location;
      } else if (result.action === "decline") {
        return {
          content: [{ type: "text", text: "Weather lookup requires location information." }],
          isError: true
        };
      } else if (result.action === "cancel") {
        return {
          content: [{ type: "text", text: "Weather lookup cancelled by user." }],
          isError: true
        };
      }
    } catch (error) {
      // Elicitation failed - fall back to parameter guidance
      console.log("Elicitation failed, falling back:", error.message);
    }
  }
  
  // Step 2: Parameter validation with guidance fallback
  if (!args.location) {
    return {
      content: [{
        type: "text",
        text: `Location is required for weather lookup. Please specify:

🏙️ **City Examples:**
   • "Seattle" or "Seattle, WA"
   • "London" or "London, UK"  
   • "Tokyo, Japan"

📍 **Coordinate Examples:**
   • "40.7128,-74.0060" (New York)
   • "51.5074,-0.1278" (London)

💡 **Tip:** Include state/country for accuracy.

Use the 'get_location_for_weather' prompt for more help.`
      }],
      isError: true
    };
  }
  
  // Step 3: Execute tool logic
  try {
    const weatherData = await fetchWeatherData(args.location);
    return {
      content: [{
        type: "text",
        text: `Current weather in ${weatherData.location}:
🌡️ Temperature: ${weatherData.temperature}°F
☁️ Conditions: ${weatherData.conditions}
💨 Wind: ${weatherData.wind}
💧 Humidity: ${weatherData.humidity}%`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Weather data unavailable for ${args.location}. Please check the location and try again.` }],
      isError: true
    };
  }
}

// Mock weather service
async function fetchWeatherData(location: string) {
  // Simulate API call
  return {
    location: location,
    temperature: 72,
    conditions: "Partly cloudy", 
    wind: "5 mph",
    humidity: 65
  };
}
```

## Multi-Parameter Elicitation

### Email Tool with Multiple Required Parameters

```typescript
export async function send_email_with_elicitation(args: any) {
  // Determine which parameters are missing
  const missingParams: string[] = [];
  if (!args.to) missingParams.push("to");
  if (!args.subject) missingParams.push("subject");
  if (!args.body) missingParams.push("body");
  
  // Try elicitation for missing parameters
  if (server.options.capabilities?.elicitation && missingParams.length > 0) {
    try {
      // Build schema for only missing parameters
      const schema = buildEmailSchema(missingParams);
      const result = await server.elicitInput(
        schema,
        `Please provide the missing email information`
      );
      
      if (result.action === "accept") {
        // Merge elicited parameters with existing args
        Object.assign(args, result.content);
      } else {
        return {
          content: [{ type: "text", text: "Email composition cancelled." }],
          isError: true
        };
      }
    } catch (error) {
      console.log("Email elicitation failed:", error.message);
    }
  }
  
  // Validate all required parameters
  if (!args.to || !args.subject || !args.body) {
    return createEmailGuidanceError(args);
  }
  
  // Send email
  try {
    await sendEmail(args.to, args.subject, args.body);
    return {
      content: [{ type: "text", text: `Email sent successfully to ${args.to}` }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Failed to send email: ${error.message}` }],
      isError: true
    };
  }
}

// Dynamic schema builder
function buildEmailSchema(missingParams: string[]) {
  const properties: any = {};
  const required: string[] = [];
  
  if (missingParams.includes("to")) {
    properties.to = {
      type: "string",
      description: "Recipient email address"
    };
    required.push("to");
  }
  
  if (missingParams.includes("subject")) {
    properties.subject = {
      type: "string", 
      description: "Email subject line"
    };
    required.push("subject");
  }
  
  if (missingParams.includes("body")) {
    properties.body = {
      type: "string",
      description: "Email message content"
    };
    required.push("body");
  }
  
  return {
    type: "object",
    properties,
    required
  };
}

// Parameter guidance for email
function createEmailGuidanceError(args: any) {
  const missing = [];
  if (!args.to) missing.push("recipient email address");
  if (!args.subject) missing.push("subject line");
  if (!args.body) missing.push("message body");
  
  return {
    content: [{
      type: "text",
      text: `Email composition requires: ${missing.join(", ")}

📧 **Example Usage:**
   • Recipient: "alice@example.com"
   • Subject: "Meeting Tomorrow"
   • Body: "Hi Alice, let's meet at 2pm to discuss the project."

💡 **Tips:**
   • Use clear, descriptive subject lines
   • Keep messages concise and professional
   • Double-check email addresses for accuracy

Use the 'compose_email' prompt for templates and examples.`
    }],
    isError: true
  };
}

async function sendEmail(to: string, subject: string, body: string) {
  // Mock email sending
  console.log(`Sending email to ${to}: ${subject}`);
}
```

## Conditional Elicitation

### Calendar Tool with Smart Parameter Collection

```typescript
export async function create_calendar_event_with_elicitation(args: any) {
  // Step 1: Basic validation - title is always required
  if (!args.title) {
    if (server.options.capabilities?.elicitation) {
      try {
        const result = await server.elicitInput({
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Event title or name"
            }
          },
          required: ["title"]
        }, "Please provide an event title");
        
        if (result.action === "accept") {
          args.title = (result.content as any).title;
        } else {
          return cancelledResponse("Event creation cancelled.");
        }
      } catch (error) {
        // Fall back to parameter guidance
      }
    }
    
    if (!args.title) {
      return {
        content: [{
          type: "text",
          text: "Event title is required. Please provide a descriptive title for your event."
        }],
        isError: true
      };
    }
  }
  
  // Step 2: Determine event type and required fields
  const eventType = inferEventType(args.title);
  const requiredFields = getRequiredFieldsForEventType(eventType);
  
  // Step 3: Collect missing required fields
  const missingFields = requiredFields.filter(field => !args[field]);
  
  if (missingFields.length > 0 && server.options.capabilities?.elicitation) {
    try {
      const schema = buildCalendarSchema(missingFields, eventType);
      const result = await server.elicitInput(
        schema,
        `Please provide the ${eventType} details`
      );
      
      if (result.action === "accept") {
        Object.assign(args, result.content);
      } else {
        return cancelledResponse("Event creation cancelled.");
      }
    } catch (error) {
      console.log("Calendar elicitation failed:", error.message);
    }
  }
  
  // Step 4: Final validation with guidance
  const stillMissing = requiredFields.filter(field => !args[field]);
  if (stillMissing.length > 0) {
    return createCalendarGuidanceError(stillMissing, eventType);
  }
  
  // Step 5: Create event
  try {
    const event = await createCalendarEvent(args);
    return {
      content: [{
        type: "text", 
        text: `📅 Event "${args.title}" created successfully for ${args.date} at ${args.time}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: "text", text: `Failed to create event: ${error.message}` }],
      isError: true
    };
  }
}

// Smart event type inference
function inferEventType(title: string): string {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes("meeting") || lowerTitle.includes("call")) return "meeting";
  if (lowerTitle.includes("appointment") || lowerTitle.includes("doctor")) return "appointment";
  if (lowerTitle.includes("reminder") || lowerTitle.includes("task")) return "reminder";
  return "general";
}

// Event type requirements
function getRequiredFieldsForEventType(eventType: string): string[] {
  switch (eventType) {
    case "meeting":
      return ["date", "time", "duration"];
    case "appointment":
      return ["date", "time", "location"];
    case "reminder":
      return ["date"];
    default:
      return ["date", "time"];
  }
}

// Dynamic calendar schema
function buildCalendarSchema(missingFields: string[], eventType: string) {
  const properties: any = {};
  const required: string[] = [];
  
  if (missingFields.includes("date")) {
    properties.date = {
      type: "string",
      description: "Event date in YYYY-MM-DD format (e.g., 2024-12-25)"
    };
    required.push("date");
  }
  
  if (missingFields.includes("time")) {
    properties.time = {
      type: "string", 
      description: "Event time in HH:MM format (24-hour, e.g., 14:30 for 2:30 PM)"
    };
    required.push("time");
  }
  
  if (missingFields.includes("duration")) {
    properties.duration = {
      type: "string",
      enum: ["15m", "30m", "1h", "1h30m", "2h", "3h", "4h"],
      description: "Meeting duration"
    };
    required.push("duration");
  }
  
  if (missingFields.includes("location")) {
    properties.location = {
      type: "string",
      description: "Event location or address"
    };
    required.push("location");
  }
  
  return {
    type: "object",
    properties,
    required
  };
}

function cancelledResponse(message: string) {
  return {
    content: [{ type: "text", text: message }],
    isError: true
  };
}

function createCalendarGuidanceError(missingFields: string[], eventType: string) {
  const fieldDescriptions = {
    date: "Date (YYYY-MM-DD format, e.g., 2024-12-25)",
    time: "Time (HH:MM format, e.g., 14:30 for 2:30 PM)", 
    duration: "Duration (e.g., 30m, 1h, 2h)",
    location: "Location or address"
  };
  
  const missingList = missingFields.map(field => `• ${fieldDescriptions[field] || field}`).join("\n");
  
  return {
    content: [{
      type: "text",
      text: `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} creation requires:

${missingList}

📅 **Date Format:** YYYY-MM-DD (e.g., 2024-12-25)
⏰ **Time Format:** HH:MM in 24-hour format (e.g., 14:30 for 2:30 PM)
⏱️ **Duration Examples:** 30m, 1h, 1h30m, 2h

Use the 'schedule_event' prompt for more scheduling help.`
    }],
    isError: true
  };
}

async function createCalendarEvent(args: any) {
  // Mock calendar creation
  return {
    id: `event_${Date.now()}`,
    title: args.title,
    date: args.date,
    time: args.time
  };
}
```

## Error Handling Patterns

### Comprehensive Error Management

```typescript
// Utility function for safe elicitation
async function safeElicitInput(schema: any, message: string, fallbackFn: () => any) {
  if (!server.options.capabilities?.elicitation) {
    return fallbackFn();
  }
  
  try {
    const result = await server.elicitInput(schema, message);
    
    switch (result.action) {
      case "accept":
        return { success: true, data: result.content };
      case "decline":
        return { success: false, reason: "declined", message: "User declined to provide information." };
      case "cancel":
        return { success: false, reason: "cancelled", message: "Operation cancelled by user." };
      default:
        return fallbackFn();
    }
  } catch (error) {
    console.log(`Elicitation failed: ${error.message}`);
    
    // Handle specific error types
    if (error.message.includes("timeout")) {
      console.log("Elicitation timed out, falling back to parameter guidance");
    } else if (error.message.includes("not supported")) {
      console.log("Client doesn't support elicitation, using parameter guidance");
    }
    
    return fallbackFn();
  }
}

// Example usage with comprehensive error handling
export async function advanced_tool_with_error_handling(args: any) {
  // Try elicitation with proper error handling
  const elicitationResult = await safeElicitInput(
    {
      type: "object",
      properties: {
        requiredParam: {
          type: "string",
          description: "A required parameter for this tool"
        }
      },
      required: ["requiredParam"]
    },
    "Please provide the required parameter",
    () => ({ success: false, reason: "fallback" })
  );
  
  // Handle elicitation result
  if (elicitationResult.success) {
    args.requiredParam = (elicitationResult.data as any).requiredParam;
  } else if (elicitationResult.reason === "declined" || elicitationResult.reason === "cancelled") {
    return {
      content: [{ type: "text", text: elicitationResult.message }],
      isError: true
    };
  }
  
  // Final parameter validation
  if (!args.requiredParam) {
    return {
      content: [{
        type: "text",
        text: "Required parameter is missing. Please provide the necessary information and try again."
      }],
      isError: true
    };
  }
  
  // Execute tool logic
  return {
    content: [{ type: "text", text: `Tool executed successfully with parameter: ${args.requiredParam}` }]
  };
}
```

## Testing Patterns

### Test Both Interaction Modes

```typescript
// Test helper for elicitation tools
export async function testElicitationTool(
  toolFunction: Function,
  testCases: Array<{
    name: string;
    args: any;
    expectedElicitation?: boolean;
    expectedResult?: string;
  }>
) {
  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    
    // Test with elicitation capability
    server.options.capabilities.elicitation = {};
    const elicitationResult = await toolFunction(testCase.args);
    console.log("Elicitation result:", elicitationResult);
    
    // Test without elicitation capability  
    delete server.options.capabilities.elicitation;
    const guidanceResult = await toolFunction(testCase.args);
    console.log("Guidance result:", guidanceResult);
    
    console.log("---");
  }
}

// Example test usage
await testElicitationTool(get_weather_with_elicitation, [
  {
    name: "No location provided",
    args: {},
    expectedElicitation: true
  },
  {
    name: "Location provided",
    args: { location: "Seattle" },
    expectedElicitation: false
  }
]);
```

## Best Practices Summary

### 1. **Always Implement Both Patterns**
```typescript
// ✅ Good: Hybrid approach
if (supportsElicitation() && missingParameters) {
  try {
    // Try elicitation
  } catch {
    // Fall back to guidance
  }
}
if (stillMissingParameters) {
  return parameterGuidanceError();
}

// ❌ Bad: Elicitation only
if (missingParameters) {
  return await server.elicitInput(schema, message);
}
```

### 2. **Use Clear Schemas**
```typescript
// ✅ Good: Clear, descriptive schema
{
  type: "object",
  properties: {
    location: {
      type: "string",
      description: "City name, state/country, or coordinates for weather lookup"
    }
  },
  required: ["location"]
}

// ❌ Bad: Vague schema
{
  type: "object", 
  properties: {
    location: { type: "string" }
  },
  required: ["location"]
}
```

### 3. **Handle All Response Actions**
```typescript
// ✅ Good: Handle all cases
switch (result.action) {
  case "accept":
    return useProvidedData(result.content);
  case "decline":
    return respectUserChoice();
  case "cancel":
    return cancelOperation();
  default:
    return fallbackToGuidance();
}

// ❌ Bad: Only handle accept
if (result.action === "accept") {
  return useProvidedData(result.content);
}
```

### 4. **Provide Rich Parameter Guidance**
```typescript
// ✅ Good: Rich guidance with examples
return {
  content: [{
    type: "text",
    text: `Location required. Examples:
• "Seattle, WA" 
• "London, UK"
• "40.7128,-74.0060"

Use 'get_location_help' prompt for more options.`
  }],
  isError: true
};

// ❌ Bad: Minimal guidance
return {
  content: [{ type: "text", text: "Location required." }],
  isError: true
};
```

---

## Summary

These implementation examples demonstrate:

- 🚀 **Complete hybrid elicitation** implementations
- 🛡️ **Comprehensive error handling** for all scenarios  
- 🔄 **Graceful fallback patterns** maintaining universal compatibility
- ⚡ **Best practices** for schema design and user experience
- 🧪 **Testing strategies** for both interaction modes

Use these examples as **templates** for building your own interactive AI tools that work beautifully with any MCP client! 🌟
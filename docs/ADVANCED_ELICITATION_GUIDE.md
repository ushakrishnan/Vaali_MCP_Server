# Advanced Hybrid Elicitation Implementation Guide# Advanced Elicitation Guidance Pattern



This document provides technical guidance for implementing the hybrid elicitation pattern that combines official MCP elicitation with intelligent parameter guidance for universal compatibility.This document demonstrates an advanced implementation where MCP clients can automatically detect and handle parameter elicitation using structured prompts from the server.



## Overview## Overview



The **Hybrid Elicitation Pattern** provides:The Advanced Elicitation pattern extends the basic elicitation concept by:



1. **🚀 Enhanced Experience**: Interactive forms for elicitation-capable clients1. **Automatic Detection**: Clients parse error messages for elicitation hints

2. **🛡️ Universal Compatibility**: Parameter guidance for all MCP clients  2. **Structured Guidance**: Clients fetch and parse elicitation prompts automatically  

3. **🔄 Automatic Fallback**: Seamless capability detection and degradation3. **Rich Interaction**: Users get contextual examples, suggestions, and options

4. **⚡ Progressive Enhancement**: Same tool, optimal experience for each client4. **Intelligent Retry**: Failed calls are automatically retried with elicited parameters

5. **🎯 Future-Proof**: Ready for elicitation adoption while maintaining compatibility5. **Consistent UX**: All tools benefit from the same elicitation infrastructure



## Architecture## Architecture



``````

User Request: "What's the weather?"User Request: "What's the weather?"

         ↓         ↓

Tool execution startsClient calls tool with no location

         ↓         ↓

Detect missing location parameterServer returns error with elicitation hint

         ↓         ↓

┌─────────────────────────┬─────────────────────────┐Client detects hint: "use the 'get_location_for_weather' prompt"

│ Elicitation Client      │ Standard Client         │         ↓

├─────────────────────────┼─────────────────────────┤Client automatically fetches the prompt

│ Show location form      │ Return parameter        │         ↓

│ User enters "Seattle"   │ guidance error          │Client presents structured guidance to user

│ Continue execution      │ User provides location  │         ↓

│ Return weather data     │ Retry → Return weather  │User provides missing parameter

└─────────────────────────┴─────────────────────────┘         ↓

         ↓Client retries tool call with complete parameters

Success: Weather data for Seattle         ↓

```Success: Weather data returned

```

## Implementation Guide

## Implementation Components

### 1. Tool Structure

### 1. Error Message Pattern

```typescript

export async function get_weather_with_elicitation(args: any) {The server embeds elicitation hints in error messages:

  // Step 1: Try official elicitation (enhanced experience)

  if (server.options.capabilities?.elicitation && !args.location) {```javascript

    try {// In server.ts

      const result = await server.elicitInput({if (!location) {

        type: "object",  return {

        properties: {    isError: true,

          location: {    content: [{

            type: "string",      type: "text",

            description: "City name, state/country, or coordinates for weather lookup"      text: "Location is required for weather data. Please use the 'get_location_for_weather' prompt for guidance on providing location information."

          }    }]

        },  };

        required: ["location"]}

      }, "Please provide your location for weather information");```

      

      if (result.action === "accept") {### 2. Structured Prompts

        args.location = (result.content as any).location;

      } else if (result.action === "decline" || result.action === "cancel") {The server provides rich elicitation prompts:

        return {

          content: [{ type: "text", text: "Weather lookup cancelled by user." }],```javascript

          isError: true// In server.ts - prompts

        };{

      }  name: "get_location_for_weather",

    } catch (error) {  description: "Helps users provide location information for weather queries",

      // Elicitation failed (timeout, not supported, etc.) - fall back  arguments: [{

      console.log("Elicitation failed, falling back to parameter guidance:", error.message);    name: "user_context",

    }    description: "Context about why location is needed",

  }    required: false

    }]

  // Step 2: Parameter validation with guidance fallback}

  if (!args.location) {```

    return {

      content: [{### 3. Intelligent Client Detection

        type: "text",

        text: `Location is required for weather lookup. Please specify:The client automatically detects elicitation opportunities:



🏙️ **City Examples:**```javascript

   • "Seattle" or "Seattle, WA"// In advanced-elicitation-client.mjs

   • "London" or "London, UK"  detectElicitationHint(errorResponse) {

   • "Tokyo, Japan"  const errorText = errorResponse.content[0].text;

  const promptRegex = /use the ['"]([\w_-]+)['"] prompt/i;

📍 **Coordinate Examples:**  const match = errorText.match(promptRegex);

   • "40.7128,-74.0060" (New York)  return match ? match[1] : null;

   • "51.5074,-0.1278" (London)}

```

💡 **Tip:** Include state/country for accuracy.

### 4. Automatic Guidance Fetching

Use the 'get_location_for_weather' prompt for more help.`

      }],When a hint is detected, the client fetches structured guidance:

      isError: true

    };```javascript

  }async elicitParameters(promptName, context = {}) {

    const promptResult = await this.client.getPrompt(promptName, context);

  // Step 3: Execute tool logic  const guidanceText = promptResult.messages[0].content.text;

  return await getWeatherData(args.location);  const extractedInfo = this.parseElicitationPrompt(guidanceText);

}  return await this.interactWithUser(extractedInfo);

```}

```

### 2. Server Configuration

### 5. Rich User Interaction

```typescript

// In server.tsThe client presents structured options to users:

import { Server } from "@modelcontextprotocol/sdk/server/index.js";

```javascript

const server = new Server(// Example output:

  {🤖 I need some additional information...

    name: "vaali",

    version: "0.0.1"Quick options:

  },  1. Seattle

  {  2. Portland

    capabilities: {  3. Vancouver

      tools: {},

      prompts: {},Example formats:

      elicitation: {} // ← Declare elicitation support  • New York

    }  • London, UK

  }  • Tokyo, Japan

);

```Please enter your choice: _

```

### 3. Capability Detection

## Key Benefits

```typescript

function supportsElicitation(): boolean {### For Users

  return server.options.capabilities?.elicitation !== undefined;- **Natural Flow**: Missing parameters are handled seamlessly

}- **Rich Guidance**: Examples and suggestions reduce guesswork

- **Consistent Experience**: All tools work the same way

function canElicitParameter(paramName: string, args: any): boolean {- **Error Recovery**: Automatic retry eliminates frustration

  return supportsElicitation() && 

         args[paramName] === undefined;### For Developers

}- **Centralized Logic**: Elicitation handled once, works everywhere

```- **Declarative**: Just add prompts, clients handle the rest

- **Extensible**: New elicitation patterns can be added easily

### 4. Elicitation Schema Patterns- **Protocol Standard**: Works with any MCP-compliant client



#### Simple Text Input### For Tool Authors

```typescript- **Simple Implementation**: Just reference prompts in error messages

const locationSchema = {- **Rich Metadata**: Prompts can include examples, formats, validation

  type: "object",- **Context Aware**: Prompts can adapt based on user context

  properties: {- **Reusable**: One prompt can serve multiple tools

    location: {

      type: "string",## Advanced Features

      description: "City name, state/country, or coordinates"

    }### 1. Context-Aware Prompts

  },

  required: ["location"]Prompts can adapt based on the calling context:

};

``````javascript

// Client passes context when fetching prompts

#### Multiple Parametersconst context = {

```typescript  user_context: `Tool '${toolName}' needs additional parameters`,

const emailSchema = {  attempted_parameters: JSON.stringify(parameters),

  type: "object",   user_location: "detected_city" // from IP geolocation

  properties: {};

    subject: {```

      type: "string",

      description: "Email subject line"### 2. Multi-Parameter Elicitation

    },

    body: {Handle multiple missing parameters in sequence:

      type: "string", 

      description: "Email message content"```javascript

    }const missingParams = ['location', 'date_range', 'units'];

  },for (const param of missingParams) {

  required: ["subject", "body"]  const value = await this.elicitParameter(param, context);

};  parameters[param] = value;

```}

```

#### Enum Choices

```typescript### 3. Validation and Correction

const prioritySchema = {

  type: "object",Validate elicited parameters and ask for corrections:

  properties: {

    priority: {```javascript

      type: "string",const validatedLocation = await this.validateLocation(elicitedLocation);

      enum: ["low", "medium", "high", "urgent"],if (!validatedLocation.valid) {

      description: "Task priority level"  console.log(`❌ "${elicitedLocation}" is not a valid location.`);

    }  console.log(`💡 Suggestion: ${validatedLocation.suggestion}`);

  },  return await this.elicitParameters(promptName, context);

  required: ["priority"]}

};```

```

### 4. Learning from History

### 5. Error Handling Patterns

Remember user preferences for future calls:

#### Timeout Handling

```typescript```javascript

try {// Store user preferences

  const result = await server.elicitInput(schema, message);this.userPreferences.defaultLocation = elicitedLocation;

  // Process result...

} catch (error) {// Use in future calls

  if (error.message.includes("timeout")) {if (!parameters.location && this.userPreferences.defaultLocation) {

    // Fall back to parameter guidance  parameters.location = this.userPreferences.defaultLocation;

    return createParameterGuidanceError();}

  }```

  throw error;

}## Message Flow Example

```

```

#### User Cancellation1. User: "What's the weather?"

```typescript

if (result.action === "cancel") {2. Client → Server: callTool("get_weather", {})

  return {

    content: [{ type: "text", text: "Operation cancelled by user." }],3. Server → Client: {

    isError: true     isError: true,

  };     content: [{

}       type: "text", 

       text: "Location required. Use 'get_location_for_weather' prompt."

if (result.action === "decline") {     }]

  return {   }

    content: [{ type: "text", text: "Please provide the required information to continue." }],

    isError: true  4. Client detects hint → Client: getPrompt("get_location_for_weather")

  };

}5. Server → Client: {

```     messages: [{

       role: "assistant",

### 6. Parameter Guidance Fallback       content: {

         type: "text",

```typescript         text: "Please provide location. Examples: \"Seattle\", \"London, UK\"..."

function createLocationGuidanceError() {       }

  return {     }]

    content: [{   }

      type: "text",

      text: `Location is required for weather lookup. Please specify:6. Client presents options → User selects: "Seattle"



🏙️ **City Examples:**7. Client → Server: callTool("get_weather", {location: "Seattle"})

   • "Seattle" or "Seattle, WA"

   • "London" or "London, UK"8. Server → Client: {

   • "Tokyo, Japan"     content: [{

       type: "text",

📍 **Coordinate Examples:**         text: "{\"temperature\": \"72°F\", \"condition\": \"Sunny\"...}"

   • "40.7128,-74.0060" (New York)     }]

   • "51.5074,-0.1278" (London)   }



💡 **Tip:** Include state/country for better accuracy.9. Client presents weather data to user

```

📋 Use the 'get_location_for_weather' prompt for additional help.`

    }],## Implementation Notes

    isError: true

  };### Error Message Conventions

}

```For consistent client detection, use these patterns in error messages:



## Advanced Patterns- `"Please use the 'prompt_name' prompt for guidance"`

- `"See the 'prompt_name' prompt for help"`

### 1. Conditional Elicitation- `"Try calling prompt:prompt_name"`



```typescript### Prompt Naming Conventions

// Only elicit missing parameters, keep provided ones

const missingParams = [];Use descriptive prompt names that indicate their purpose:

if (!args.to) missingParams.push("to");

if (!args.subject) missingParams.push("subject");  - `get_location_for_weather` - Location elicitation for weather

if (!args.body) missingParams.push("body");- `get_date_range_for_reports` - Date range for report generation

- `get_preferences_for_search` - User preferences for search

if (missingParams.length > 0 && supportsElicitation()) {

  const schema = buildSchemaForMissingParams(missingParams);### Client State Management

  const result = await server.elicitInput(schema, "Please complete the email information");

  // Merge results with existing args...Advanced clients should maintain:

}

```- **Elicitation History**: Remember what was elicited

- **User Preferences**: Store commonly used values

### 2. Multi-Step Elicitation  - **Context Stack**: Track nested elicitation calls

- **Retry State**: Manage retry attempts and backoff

```typescript

// Step 1: Get basic info## Testing the Advanced Client

if (!args.eventType && supportsElicitation()) {

  const typeResult = await server.elicitInput(eventTypeSchema, "What type of event?");Build and run the demonstration:

  args.eventType = typeResult.content.eventType;

}```bash

npm run build

// Step 2: Get type-specific details  npm run test:advanced-elicitation

if (args.eventType === "meeting" && !args.attendees) {```

  const attendeeResult = await server.elicitInput(attendeeSchema, "Who should attend?");

  args.attendees = attendeeResult.content.attendees;This will demonstrate:

}

```1. ✅ Automatic elicitation hint detection

2. ✅ Structured prompt fetching and parsing

### 3. Smart Defaults3. ✅ Rich user interaction with examples

4. ✅ Intelligent retry with elicited parameters

```typescript5. ✅ Complete weather report delivery

const schema = {

  type: "object",## Future Enhancements

  properties: {

    location: {### Client-Side Improvements

      type: "string",- **Machine Learning**: Learn from user patterns to predict parameters

      description: "City name or coordinates",- **Voice Interface**: Handle elicitation through speech

      default: getUserDefaultLocation() // From context/preferences- **GUI Integration**: Rich visual forms for parameter collection

    }- **Multi-Modal**: Support images, maps, etc. for parameter input

  },

  required: ["location"]### Server-Side Improvements

};- **Dynamic Prompts**: Generate prompts based on current context

```- **Validation Logic**: Include validation rules in prompts

- **Localization**: Multi-language elicitation support

## Client Implementation Considerations- **Analytics**: Track elicitation success rates



### For Elicitation-Capable Clients### Protocol Extensions

- **Standardized Hints**: Official MCP specification for elicitation

1. **Form Generation**: Convert JSON schemas to interactive forms- **Prompt Metadata**: Machine-readable elicitation specifications

2. **Validation**: Implement client-side validation from schema- **Parameter Relationships**: Express dependencies between parameters

3. **Timeout Handling**: Provide reasonable timeouts (30-60 seconds)- **Progressive Disclosure**: Multi-step elicitation for complex workflows

4. **User Experience**: Clear forms with helpful descriptions

This advanced pattern transforms MCP from a simple tool protocol into an intelligent, user-friendly interface that gracefully handles the complexity of real-world parameter gathering.
### For Standard Clients

1. **Error Parsing**: Extract parameter guidance from error messages
2. **Prompt Integration**: Use guidance prompts for additional help
3. **Retry Logic**: Automatically retry with user-provided parameters
4. **Intelligence**: Learn from patterns and provide suggestions

## Testing Strategy

### Test Both Patterns

```javascript
// Test with elicitation client
const elicitationClient = new Client({
  name: "test-elicitation",
  version: "1.0.0"
}, {
  capabilities: { elicitation: {} }
});

// Test with standard client  
const standardClient = new Client({
  name: "test-standard", 
  version: "1.0.0"
}, {
  capabilities: {}
});
```

### Test Scenarios

1. **Missing single parameter**: Location for weather
2. **Missing multiple parameters**: Email subject and body
3. **Partial parameters**: Some provided, some missing
4. **User cancellation**: Decline/cancel elicitation
5. **Timeout handling**: Elicitation request timeout
6. **Fallback behavior**: Standard client parameter guidance

## Best Practices

### For Server Developers

1. ✅ **Always implement both patterns** for universal compatibility
2. ✅ **Try elicitation first**, fall back gracefully  
3. ✅ **Use clear, descriptive schemas** with helpful descriptions
4. ✅ **Provide rich parameter guidance** with examples and tips
5. ✅ **Test with both client types** to ensure proper behavior
6. ✅ **Handle all response actions** (accept/decline/cancel)
7. ✅ **Implement reasonable timeouts** and error handling

### For Client Developers

1. ✅ **Declare elicitation capability** if supported
2. ✅ **Generate rich forms** from JSON schemas
3. ✅ **Handle error guidance intelligently** for non-elicitation mode
4. ✅ **Provide good fallback UX** for schema limitations  
5. ✅ **Implement timeout handling** for elicitation requests
6. ✅ **Support all response actions** (accept/decline/cancel)

### Schema Design Guidelines

1. **Keep schemas flat** - nested objects not supported
2. **Use primitive types** - string, number, boolean, enums
3. **Provide clear descriptions** for all properties
4. **Mark required fields** appropriately
5. **Use enums for choices** rather than free text when possible
6. **Include examples in descriptions** when helpful

## Error Handling Matrix

| Scenario | Elicitation Client | Standard Client |
|----------|-------------------|-----------------|
| **Missing params** | Show interactive form | Return guidance error |
| **User decline** | Respect user choice | Return guidance error |
| **User cancel** | Cancel operation | Return guidance error |
| **Timeout** | Fall back to guidance | Return guidance error |
| **Schema error** | Fall back to guidance | Return guidance error |
| **Network error** | Fall back to guidance | Return guidance error |

## Performance Considerations

1. **Capability Detection**: Cache capability detection results
2. **Schema Generation**: Pre-build common schemas  
3. **Timeout Values**: Use appropriate timeouts (30-60s)
4. **Fallback Speed**: Fast fallback to parameter guidance
5. **Memory Usage**: Clean up elicitation resources after use

## Security Considerations  

1. **Input Validation**: Validate all elicited parameters
2. **Schema Safety**: Ensure schemas don't leak sensitive info
3. **User Control**: Always allow decline/cancel options
4. **Audit Logging**: Log elicitation requests for security review
5. **Rate Limiting**: Prevent elicitation spam/abuse

---

## Summary

The hybrid elicitation pattern provides the best of both worlds:

- 🚀 **Enhanced experience** with interactive forms for capable clients
- 🛡️ **Universal compatibility** with parameter guidance fallback  
- 🔄 **Automatic capability detection** and graceful degradation
- ⚡ **Progressive enhancement** - same tools, optimal experience for each client
- 🎯 **Future-proof** implementation ready for MCP elicitation adoption

This approach ensures your MCP tools work beautifully with any client while providing cutting-edge interactive experiences where supported! 🌟
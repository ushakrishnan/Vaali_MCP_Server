# Interactive Workflows: How MCP Elicitation Works# How Location Elicitation Prompt is Used



## Understanding MCP Elicitation vs Parameter Guidance## The Question: When location is absent, does Claude automatically look at the prompt?



**MCP Elicitation** enables tools to seamlessly collect missing parameters **during execution** through interactive forms and dialogs, transforming rigid API calls into natural, conversational workflows.**Short Answer**: No, Claude does not automatically call the elicitation prompt. The current flow relies on error messages with guidance.



## Two Complementary Approaches## Current Implementation Flow



### 1. 🚀 **Official MCP Elicitation** (Enhanced Experience)### 1. **Tool Call Without Location**

```typescript

Interactive parameter collection for elicitation-capable clients:// User: "What's the weather like?"

// Claude calls:

```typescriptawait client.callTool("get_weather", {});

// User: "What's the weather like?"```

// Tool starts execution and detects missing location

const result = await server.elicitInput({### 2. **Server Returns Helpful Error**

  type: "object",```json

  properties: {{

    location: {  "content": [{

      type: "string",     "type": "text",

      description: "City name or coordinates for weather lookup"    "text": "Location is required for weather lookup. Please specify a location such as:\n- City name (e.g., 'New York', 'London')\n- City with state/country (e.g., 'Austin, TX', 'Paris, France')\n- Coordinates (e.g., '40.7128,-74.0060')\n\nYou can also use the 'get_location_for_weather' prompt to help format your request."

    }  }],

  },  "isError": true

  required: ["location"]}

}, "Please provide your location for weather information");```



// Client shows location input form### 3. **Claude's Response**

// User enters "San Francisco" Claude typically responds: "I need to know your location to get weather information. Please specify a city name, coordinates, or location."

// Tool continues: returns weather for San Francisco

```### 4. **User Provides Location**

User: "San Francisco"

**Flow:**

1. 🎯 Tool starts execution### 5. **Claude Retries**

2. 🔍 Detects missing parameters```typescript

3. 📱 Shows interactive form to userawait client.callTool("get_weather", { location: "San Francisco" });

4. ✅ User provides data```

5. 🚀 Tool continues with collected data

## Advanced Elicitation Pattern (Possible Future)

### 2. 📋 **Parameter Guidance Pattern** (Universal Compatibility)

Some advanced LLM clients could potentially:

Intelligent error handling for all MCP clients:

### 1. **Detect Elicitation Hint**

```typescript```typescript

// User: "What's the weather like?"// LLM sees error message mentioning "get_location_for_weather" prompt

// Tool call:// and automatically calls:

await client.callTool("get_weather", {});const prompt = await client.getPrompt("get_location_for_weather", {

  user_context: "User requested weather without location"

// Server returns helpful guidance:});

{```

  "content": [{

    "type": "text", ### 2. **Use Structured Guidance**

    "text": "Location is required for weather lookup. Please specify:\n- City name (e.g., 'New York', 'London')\n- City with state (e.g., 'Austin, TX')\n- Coordinates (e.g., '40.7128,-74.0060')"```typescript

  }],// Prompt provides structured template:

  "isError": true{

}  "messages": [{

```    "role": "user", 

    "content": {

**Flow:**      "text": `I need to get weather information, but no location was specified.

1. 🎯 Tool called with missing parameters

2. ❌ Returns informative error with guidancePlease provide a location for the weather lookup. You can:

3. 🤖 Client/AI processes guidance

4. 🔄 User provides missing information1. **Specify a city name**: e.g., "New York", "San Francisco", "London"

5. ✅ Tool called again with complete parameters2. **Include state/country**: e.g., "Austin, TX", "Paris, France" 

3. **Use coordinates**: e.g., "40.7128,-74.0060"

## Key Differences4. **Choose from suggestions**: New York, San Francisco, London, Tokyo



| Aspect | Official Elicitation | Parameter Guidance |What location would you like weather information for?`

|--------|---------------------|-------------------|    }

| **User Experience** | Interactive forms/dialogs | Error messages + retry |  }]

| **Client Requirements** | Must support elicitation | Works with any MCP client |}

| **Parameter Collection** | During tool execution | Before tool execution |```

| **Response Model** | Accept/decline/cancel | Error → guidance → retry |

| **UI Generation** | JSON schema → forms | Text guidance → manual entry |### 3. **Structured User Interaction**

LLM uses the prompt structure to create a better user experience with specific options and examples.

## Implementation in Vaali

## Why Use Prompts for Elicitation?

Our server implements **both approaches** for maximum compatibility:

### 1. **Consistency**

```typescriptThe prompt ensures all clients ask for location information in the same structured way.

export async function get_weather_with_elicitation(args: any) {

  // Try official elicitation first### 2. **Rich Guidance**

  if (server.options.capabilities?.elicitation && !args.location) {Instead of generic "please provide location", the prompt gives:

    try {- Specific format examples

      const result = await server.elicitInput({- Multiple input options  

        type: "object",- Suggested locations

        properties: {- Context-aware messaging

          location: { type: "string", description: "City name or coordinates" }

        },### 3. **Localization/Customization**

        required: ["location"]Prompts can be customized for different:

      }, "Please provide your location for weather information");- Languages

      - Regions  

      if (result.action === "accept") {- User types

        args.location = (result.content as any).location;- Application contexts

      }

    } catch (error) {### 4. **Client Intelligence**

      // Fall back to parameter guidanceAdvanced MCP clients can:

      return createLocationGuidanceError();- Detect elicitation patterns

    }- Automatically fetch relevant prompts

  }- Create richer user interactions

  

  // Validate parameters## Implementation in Our Server

  if (!args.location) {

    return createLocationGuidanceError();Our implementation provides both patterns:

  }

  ### 1. **Simple Error with Guidance** (Current)

  // Execute tool logic```typescript

  return getWeatherData(args.location);if (!location) {

}  return {

```    content: [{

      type: "text",

## Benefits of Hybrid Approach      text: "Location is required... You can also use the 'get_location_for_weather' prompt..."

    }],

### ✨ **Enhanced Experience**    isError: true

- Elicitation-capable clients get rich interactive forms  };

- Immediate parameter collection during workflow}

- No error/retry cycles for common missing parameters```



### 🛡️ **Universal Compatibility**  ### 2. **Structured Elicitation Prompt** (For Advanced Clients)

- Standard MCP clients get intelligent parameter guidance```typescript

- Detailed examples and suggestions in error messagesserver.prompt("get_location_for_weather", "Elicit location information", {

- Seamless fallback preserves functionality  user_context: z.string().optional()

}, async ({ user_context }) => {

### 🔄 **Progressive Enhancement**  // Returns structured guidance with examples and options

- Same tool works with ANY MCP client});

- Automatic capability detection```

- Best possible experience for each client type

## Key Insight

## Real-World Examples

**The prompt doesn't automatically trigger** - it provides **structure and consistency** for how clients should ask for missing information. It's a design pattern that enables:

### Weather Tool Workflow

1. ✅ **Better user experience** with structured guidance

**With Elicitation Client:**2. ✅ **Consistent interactions** across different clients  

```3. ✅ **Rich context** with examples and suggestions

User: "What's the weather like?"4. ✅ **Future extensibility** for smarter client implementations

→ Location input form appears

→ User enters "Seattle"The elicitation prompt is like a "template" that clients can use to create better user interactions when parameters are missing.
→ "Current weather in Seattle: 45°F, Cloudy"
```

**With Standard Client:**
```
User: "What's the weather like?"
→ "Location required. Please specify a city name..."
→ User: "Seattle"
→ "Current weather in Seattle: 45°F, Cloudy"
```

### Email Tool Workflow

**With Elicitation Client:**
```
User: "Send email to alice@example.com"
→ Subject/body composition form appears
→ User fills in "Meeting Tomorrow" / "Let's meet at 2pm"
→ "Email sent successfully"
```

**With Standard Client:**
```
User: "Send email to alice@example.com"  
→ "Subject and body required. Please provide..."
→ User provides subject and body
→ "Email sent successfully"
```

## Technical Implementation Details

### Elicitation Schema Requirements
- **Flat objects only** (no nested objects or arrays)
- **Primitive types**: string, number, boolean, enums
- **JSON Schema format** with descriptions and validation
- **Required fields** clearly specified

### Client Capability Detection
```typescript
const hasElicitation = server.options.capabilities?.elicitation !== undefined;
```

### Error Handling Patterns
- **Timeout handling**: Elicitation requests can timeout
- **User decline**: Users can decline to provide information
- **Graceful degradation**: Always fall back to parameter guidance

## Future Enhancements

1. **🎨 Rich Schema Support**: More complex form types
2. **🔄 Multi-step Elicitation**: Collecting parameters in stages  
3. **🧠 Smart Defaults**: Pre-filling forms with context
4. **📊 Analytics**: Understanding parameter collection patterns
5. **🎯 Conditional Logic**: Dynamic forms based on user responses

## Best Practices

### For Server Developers
- Always implement parameter guidance fallback
- Use clear, descriptive schema properties
- Provide helpful error messages with examples
- Test with both elicitation and standard clients

### For Client Developers  
- Declare elicitation capability if supported
- Implement rich form generation from JSON schemas
- Handle timeout and cancellation gracefully
- Provide good fallback UI for unsupported schemas

### For AI/LLM Integration
- Leverage both patterns for optimal user experience
- Use context to provide smart parameter suggestions
- Handle retry logic intelligently
- Learn from user preferences over time

---

**The Result**: Natural, conversational tool interactions that work universally while providing enhanced experiences where possible! 🚀
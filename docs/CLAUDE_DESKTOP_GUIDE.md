# Claude Desktop Integration: Complete Usage Guide

A comprehensive guide to using the Vaali MCP server with Claude Desktop, including natural language prompts, elicitation patterns, and real-world workflows.

## Table of Contents

1. [Setup and Configuration](#setup-and-configuration)
2. [Natural Language Prompts](#natural-language-prompts)
3. [Elicitation Testing](#elicitation-testing)
4. [Advanced Workflows](#advanced-workflows)
5. [Behind the Scenes](#behind-the-scenes)
6. [Troubleshooting](#troubleshooting)

## Setup and Configuration

### Prerequisites

- Claude Desktop application installed
- Node.js runtime for MCP server
- Basic understanding of JSON configuration

### Claude Desktop Configuration

Add to your Claude Desktop configuration (`%APPDATA%\Claude\claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "vaali": {
      "command": "node",
      "args": [
        "path/to/vaali/lib/src/index.js",
        "stdio"
      ],
      "cwd": "path/to/vaali"
    }
  }
}
```

### Verify Installation

1. Restart Claude Desktop
2. Look for MCP indicator in Claude interface
3. Try a simple prompt: `"What tools do you have available?"`

## Natural Language Prompts

### Automatic Tool Usage

Claude automatically selects and uses tools based on natural language requests:

#### Weather Tools
```
User: "What's the weather in Tokyo?"
→ Claude calls get_weather tool → Returns current weather

User: "Give me weather for Seattle with forecast"  
→ Claude calls get_weather_enhanced → Returns detailed weather with forecast

User: "Check weather using my location"
→ Claude calls get_weather_enhanced with use_user_location=true
```

#### Calculation Tools
```
User: "Calculate 25 * 4 + 10"
→ Claude calls calculate tool → Returns: "110"

User: "What's the square root of 144?"
→ Claude calls calculate tool → Returns: "12"
```

#### Text Analysis Tools
```
User: "Analyze the sentiment of 'This is a wonderful day'"
→ Claude calls text_analyzer → Returns sentiment analysis

User: "Get statistics for this text: [your text]"
→ Claude calls text_analyzer → Returns word count, readability, etc.
```

### Automatic Resource Usage

Claude reads resources to provide contextual information:

```
User: "What's in the app configuration?"
→ Claude reads config resource → Returns configuration details

User: "Show me the user data"
→ Claude reads sample-data resource → Returns user information
```

### Prompt-Driven Workflows

Complex workflows triggered by natural language:

```
User: "Generate weather report for Alice"
→ Claude uses weather_report_generator prompt → Executes multi-step workflow

User: "Create code review checklist for Python"
→ Claude uses code_review prompt → Returns structured checklist

User: "Generate API documentation for developers"
→ Claude uses documentation_writer prompt → Returns comprehensive docs
```

## Elicitation Testing

### Testing Elicitation Functionality

The Vaali server includes specialized tools to test MCP elicitation patterns:

#### Rain Prediction Tool (Elicitation Test)

**Trigger Elicitation:**
```
User: "Test the elicitation tool for rain prediction"
User: "Use the rain_prediction_with_elicitation tool"
User: "What's the rain forecast?" (sometimes)
```

**Expected Behavior:**
- **If elicitation supported**: Interactive form appears asking for location
- **If elicitation not supported**: Parameter guidance message with examples

**Example Parameter Guidance Response:**
```
🌧️ Rain Prediction Tool - Location Required

This client doesn't support elicitation, so please provide the location parameter directly:

📍 Location Examples:
   • City: "Seattle", "London", "Tokyo"
   • City with region: "Austin, TX", "Paris, France"
   • Coordinates: "40.7128,-74.0060"

⏰ Optional Parameters:
   • hours_ahead: 1-72 hours (default: 24)
   • include_probability: true/false (default: true)

💡 Example: { "location": "San Francisco", "hours_ahead": 12, "include_probability": true }

🔬 Note: This tool specifically tests MCP elicitation. With an elicitation-capable client, you would see an interactive form instead of this message.
```

#### Testing With Parameters

```
User: "Rain forecast for Tokyo"
→ Gets 24-hour rain prediction with default settings

User: "Rain forecast for Seattle for next 48 hours"  
→ Gets 48-hour prediction with detailed probability

User: "Use rain_prediction_with_elicitation tool with location Tokyo, hours_ahead 12, include_probability true"
→ Gets detailed 12-hour prediction
```

### Other Elicitation Tools

#### Email Tool
```
User: "Send an email"
→ Parameter guidance for recipient, subject, body

User: "Send email to test@example.com saying hello"
→ Executes email send successfully
```

#### Calendar Tool
```
User: "Schedule a meeting"
→ Parameter guidance for meeting details

User: "Schedule team meeting tomorrow 2pm"
→ Creates calendar event
```

#### File Search Tool
```
User: "Find some files"
→ Parameter guidance for search criteria

User: "Find all .md files"
→ Executes file search
```

## Advanced Workflows

### Complex Contextual Operations

#### Smart Weather Report
```
User: "Give me a weather report for Bob using our company template"

Claude's Automatic Process:
1. Uses weather_report_generator prompt
2. Reads sample-data resource → Finds Bob is in London
3. Calls location_lookup tool → Gets coordinates/timezone
4. Calls get_weather tool → Gets current conditions
5. Calls text_analyzer → Analyzes weather description
6. Combines all data into personalized report
```

#### Configuration-Based Operations
```
User: "What's the weather like at our default location?"

Claude's Process:
1. Reads config resource → Gets defaultLocation: "San Francisco"
2. Calls get_weather tool with "San Francisco"
3. Returns weather for San Francisco
```

#### Multi-Step Analysis
```
User: "Analyze all user locations and their weather patterns"

Claude's Process:
1. Reads sample-data resource → Gets all user locations
2. For each location:
   - Calls location_lookup tool
   - Calls get_weather tool
   - Calls text_analyzer on weather description
3. Combines results into comparative analysis
```

### Elicitation Workflow Examples

#### Current Claude Desktop Experience

**Weather Tool Workflow:**
```
User: "What's the weather like today?"

Claude's Process:
1. Calls get_weather_with_elicitation({})
2. Server returns parameter guidance error
3. Claude responds: "I need your location first. Please provide..."
4. User: "Seattle"
5. Claude calls get_weather_with_elicitation({location: "Seattle"})
6. Returns weather data for Seattle
```

**Email Tool Workflow:**
```
User: "Send an email to alice@example.com"

Claude's Process:
1. Calls send_email_with_elicitation({to: "alice@example.com"})
2. Server detects missing subject/body, returns guidance
3. Claude responds: "I need a subject and message. What would you like to say?"
4. User provides subject and message
5. Claude calls tool with complete parameters
6. Email sent successfully
```

### Future Elicitation Experience

**When Claude Desktop supports elicitation:**
```
User: "What's the weather like today?"

Enhanced Process:
1. Calls get_weather_with_elicitation({})
2. Interactive location form appears
3. User fills in "Seattle, WA"
4. Tool continues execution automatically
5. Returns weather data for Seattle
```

## Behind the Scenes

### What Users See vs. What Happens

| **User Says** | **User Sees** | **Claude Does Behind Scenes** |
|---------------|---------------|-------------------------------|
| "What's the config?" | Configuration details | `resources/read` config.json |
| "Weather in NYC?" | Current weather data | `tools/call` get_weather |
| "Test elicitation" | Parameter guidance or form | `tools/call` rain_prediction_with_elicitation |
| "Calculate 2+2" | "2+2 = 4" | `tools/call` calculate |
| "Generate weather report for Alice" | Full structured report | Prompt → 5 resource/tool calls → Combined response |

### The Magic of Natural Integration

**From the user's perspective:**
- 🗣️ **Natural conversation** - Just ask questions normally
- 🤖 **Claude seems smarter** - Has access to your app data and tools
- ⚡ **Instant workflows** - Complex operations happen automatically
- 🎯 **Contextual responses** - Answers use your specific data and preferences

**Claude automatically decides:**
- 📖 Which resources to read for context
- 🛠️ Which tools to call for dynamic data
- 📝 Whether to use structured prompt workflows
- 🔄 How to combine multiple data sources

### Elicitation Detection and Handling

**Current Behavior (Parameter Guidance):**
```javascript
// Server detects missing parameters
if (!location) {
  return {
    content: [{ 
      type: "text", 
      text: "Location required. Please specify..." 
    }],
    isError: true
  };
}

// Claude processes error and guides user
// User provides missing information
// Claude retries with complete parameters
```

**Future Behavior (Official Elicitation):**
```javascript
// Server attempts elicitation
const result = await server.elicitInput({
  message: "Please provide your location:",
  requestedSchema: locationSchema
});

// Interactive form appears in Claude Desktop
// User fills form directly in UI
// Tool continues with collected data
```

## Troubleshooting

### Common Issues

#### MCP Server Not Connecting
- **Symptom**: Claude doesn't recognize MCP tools
- **Solution**: Check claude_desktop_config.json path and restart Claude Desktop

#### Tool Calls Failing
- **Symptom**: Error messages instead of tool responses
- **Solution**: Verify server is running and check console logs

#### Elicitation Not Triggering
- **Symptom**: No parameter guidance or forms appear
- **Solution**: Use specific tool names like "rain_prediction_with_elicitation"

### Debugging Steps

1. **Check Server Status**
   ```bash
   node lib/src/index.js stdio
   # Should show: "MCP Server running on stdio"
   ```

2. **Test Direct Tool Call**
   ```
   User: "Use the rain_prediction_with_elicitation tool"
   # Should trigger elicitation test
   ```

3. **Verify Configuration**
   ```json
   // Ensure paths are absolute in claude_desktop_config.json
   {
     "mcpServers": {
       "vaali": {
         "command": "node",
         "args": ["C:/full/path/to/vaali/lib/src/index.js", "stdio"]
       }
     }
   }
   ```

### Expected Responses

#### Successful Parameter Guidance
```
🌧️ Rain Prediction Tool - Location Required

This client doesn't support elicitation, so please provide the location parameter directly:
[...detailed guidance with examples...]
```

#### Successful Tool Execution
```
🌧️ Rain Prediction for Tokyo

📅 Forecast Period: Next 24 hours
⏰ Generated: [timestamp]

[...detailed weather prediction...]

🔬 Elicitation Test Result: Attempted elicitation succeeded - using parameter guidance fallback
```

### Testing Checklist

- [ ] Claude Desktop recognizes MCP server
- [ ] Basic tools work (calculate, text_analyzer)
- [ ] Elicitation tools trigger parameter guidance
- [ ] Tools work with provided parameters
- [ ] Complex workflows execute successfully
- [ ] Resources are accessible
- [ ] Prompts generate structured responses

## Advanced Usage Tips

### Specific Tool Targeting

To test specific elicitation tools:
```
"Use the rain_prediction_with_elicitation tool"
"Test the elicitation tool for rain prediction"
"Call the ELICITATION TEST TOOL"
```

### Parameter Format Examples

For tools that need specific formats:
```
"Rain forecast for Tokyo" (natural language)
"Use rain tool with location Seattle, hours 48" (semi-structured)
"Call rain_prediction_with_elicitation with {location: 'NYC', hours_ahead: 12}" (structured)
```

### Workflow Triggers

For complex prompt-driven workflows:
```
"Generate weather report for [user]" (uses weather_report_generator prompt)
"Create code review for [language]" (uses code_review prompt)
"Write documentation for [audience]" (uses documentation_writer prompt)
```

## Conclusion

The Vaali MCP server with Claude Desktop provides:

- ✅ **Natural Language Interface**: No technical knowledge required
- ✅ **Elicitation Testing**: Demonstrates current and future MCP capabilities
- ✅ **Rich Workflows**: Complex operations through simple requests
- ✅ **Universal Compatibility**: Works with current Claude Desktop (parameter guidance) and future elicitation support
- ✅ **Comprehensive Examples**: Real-world usage patterns and testing scenarios

**The result**: A seamless AI experience where Claude appears to have specialized knowledge and capabilities through MCP integration, with elicitation providing progressively enhanced user interactions! 🚀
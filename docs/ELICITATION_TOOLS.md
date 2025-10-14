# Elicitation Tools Documentation

This document describes all the interactive workflow tools that implement the hybrid elicitation pattern in the Vaali MCP Server.

## Overview

Our elicitation tools demonstrate **interactive parameter collection** where tools can seamlessly collect missing parameters during execution using either:

1. **🚀 Official MCP Elicitation**: Interactive forms for elicitation-capable clients
2. **📋 Parameter Guidance**: Intelligent error messages for universal compatibility

## Tool Catalog

### 🌤️ Weather Tools

#### `get_weather_with_elicitation`
**Purpose**: Get weather information with interactive location collection.

**Interactive Workflow**:
```
User: "What's the weather like?"
→ Tool starts execution
→ Detects missing location parameter
→ [Elicitation Client] Shows location input form
→ [Standard Client] Returns location guidance error
→ User provides "Seattle, WA" 
→ Tool returns weather data for Seattle
```

**Elicitation Schema**:
```json
{
  "type": "object",
  "properties": {
    "location": {
      "type": "string",
      "description": "City name, state/country, or coordinates for weather lookup"
    }
  },
  "required": ["location"]
}
```

**Parameter Guidance Fallback**:
- City name examples (Seattle, London, Tokyo)
- State/country format (Seattle, WA; London, UK)
- Coordinate format (40.7128,-74.0060)
- Reference to `get_location_for_weather` prompt

**Use Cases**:
- Quick weather checks without specifying location upfront
- Interactive location selection from common cities
- Demonstrates basic single-parameter elicitation

### 📧 Email Tools  

#### `send_email_with_elicitation`
**Purpose**: Send emails with interactive composition workflow.

**Interactive Workflow**:
```
User: "Send email to alice@example.com"
→ Tool starts with recipient
→ Detects missing subject and body
→ [Elicitation Client] Shows email composition form
→ [Standard Client] Returns composition guidance
→ User provides subject and body
→ Tool sends email
```

**Elicitation Schema**:
```json
{
  "type": "object", 
  "properties": {
    "subject": {
      "type": "string",
      "description": "Email subject line"
    },
    "body": {
      "type": "string",
      "description": "Email message content"
    }
  },
  "required": ["subject", "body"]
}
```

**Parameter Guidance Fallback**:
- Subject line examples and best practices
- Body composition tips
- Professional email templates
- Reference to email composition prompts

**Use Cases**:
- Quick email sending with interactive composition
- Multi-parameter collection in single workflow
- Demonstrates progressive parameter gathering

### 📅 Calendar Tools

#### `create_calendar_event_with_elicitation`  
**Purpose**: Create calendar events with interactive scheduling.

**Interactive Workflow**:
```
User: "Create meeting titled 'Team Standup'"
→ Tool starts with title
→ Detects missing date and time
→ [Elicitation Client] Shows scheduling form
→ [Standard Client] Returns scheduling guidance
→ User provides date/time information
→ Tool creates calendar event
```

**Elicitation Schema**:
```json
{
  "type": "object",
  "properties": {
    "date": {
      "type": "string", 
      "description": "Event date (YYYY-MM-DD format)"
    },
    "time": {
      "type": "string",
      "description": "Event time (HH:MM format, 24-hour)"
    },
    "duration": {
      "type": "string",
      "description": "Event duration (e.g., '1h', '30m', '2h30m')"
    }
  },
  "required": ["date", "time"]
}
```

**Parameter Guidance Fallback**:
- Date format examples (2024-12-25)
- Time format examples (14:30 for 2:30 PM)
- Duration format examples (1h, 30m, 2h30m)
- Common scheduling patterns

**Use Cases**:
- Natural event creation workflows
- Time/date parameter collection
- Demonstrates conditional required parameters

### 🔍 File Search Tools

#### `file_search_with_elicitation`
**Purpose**: Search files with interactive criteria collection.

**Interactive Workflow**:
```
User: "Search for files"
→ Tool starts execution
→ Detects missing search criteria
→ [Elicitation Client] Shows search criteria form
→ [Standard Client] Returns search guidance
→ User provides query and filters
→ Tool performs file search
```

**Elicitation Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string", 
      "description": "Search query (filename, content, or pattern)"
    },
    "fileType": {
      "type": "string",
      "enum": ["all", "text", "code", "docs", "images"],
      "description": "Type of files to search"
    },
    "includeHidden": {
      "type": "boolean",
      "description": "Include hidden files in search"
    }
  },
  "required": ["query"]
}
```

**Parameter Guidance Fallback**:
- Search query examples and patterns
- File type filter options
- Search scope recommendations
- Advanced search syntax help

**Use Cases**:
- Interactive file discovery
- Search criteria refinement
- Demonstrates enum choices and boolean parameters

## Implementation Pattern

All elicitation tools follow this consistent pattern:

### 1. **Capability Detection**
```typescript
if (server.options.capabilities?.elicitation && missingParameters) {
  // Try official elicitation
}
```

### 2. **Elicitation Attempt**
```typescript
try {
  const result = await server.elicitInput(schema, message);
  if (result.action === "accept") {
    // Use collected parameters
  }
} catch (error) {
  // Fall back to parameter guidance
}
```

### 3. **Parameter Validation**
```typescript
if (!requiredParam) {
  return createParameterGuidanceError();
}
```

### 4. **Tool Execution**
```typescript
return executeToolLogic(args);
```

## Fallback Behaviors

### Elicitation Timeout
When elicitation requests timeout:
- Automatically fall back to parameter guidance
- Log timeout for debugging
- Provide clear error message to user

### User Decline/Cancel
When users decline or cancel elicitation:
- Respect user choice
- Return informative cancellation message
- Don't fall back to parameter guidance

### Schema Limitations
When schemas can't express requirements:
- Fall back to parameter guidance immediately
- Use rich text guidance for complex parameters
- Provide examples and detailed instructions

### Client Incompatibility  
When clients don't support elicitation:
- Automatically use parameter guidance
- Maintain full functionality
- Provide enhanced error messages

## Testing Elicitation Tools

### Test with Elicitation Client
```bash
# Start server
npm run dev:sse

# Test with elicitation capability
node tests/test-official-elicitation.mjs
```

### Test with Standard Client
```bash
# Test parameter guidance fallback
npm run test:working-advanced
```

### Manual Testing
```bash
# Interactive testing with real client
npm run dev:inspector
# Open in browser and test each tool
```

## Best Practices

### Schema Design
1. **Keep schemas flat** - no nested objects
2. **Use clear descriptions** for all properties
3. **Mark required fields** appropriately  
4. **Use enums for choices** when possible
5. **Provide examples** in descriptions

### Error Messages
1. **Include specific examples** for each parameter
2. **Reference related prompts** for additional help
3. **Use consistent formatting** across tools
4. **Provide clear guidance** on parameter format

### User Experience
1. **Start with partial parameters** when available
2. **Only elicit missing information** 
3. **Respect user cancellation** gracefully
4. **Provide meaningful progress** indicators

### Fallback Strategy
1. **Always implement parameter guidance** backup
2. **Test both interaction modes** thoroughly  
3. **Handle timeouts gracefully**
4. **Log elicitation failures** for debugging

## Future Enhancements

### Enhanced Schemas
- Multi-step elicitation workflows
- Conditional parameter requirements
- Dynamic schema generation
- Rich validation patterns

### Smart Defaults
- Context-aware default values
- User preference learning
- Historical parameter usage
- Location/time-based defaults

### Advanced Interactions
- Multi-choice parameter selection
- Range/slider inputs for numbers  
- Date/time picker widgets
- File/folder browser integration

---

## Summary

Our elicitation tools demonstrate the power of **interactive workflows** that adapt to client capabilities:

- 🚀 **Enhanced experience** with interactive forms for capable clients
- 🛡️ **Universal compatibility** with parameter guidance for all clients
- 🔄 **Seamless fallback** maintains functionality regardless of client support
- ⚡ **Progressive enhancement** provides optimal experience for each client type

These tools serve as **reference implementations** for building interactive AI workflows that feel natural and work universally! 🌟
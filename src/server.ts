import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";

// Get the project root directory (2 levels up from lib/src/server.js)
const projectRoot = path.resolve(__dirname, "../..");

// Create server instance with all capabilities
const server = new McpServer({
  name: "vaali",
  version: "1.0.0",
}, {
  capabilities: {
    resources: {},
    prompts: {},
    tools: {
      listChanged: true
    },
    roots: {
      listChanged: true
    }
  }
});

// Resources capability - provide access to files and data
server.resource(
  "config",
  "file://config.json",
  {
    description: "Application configuration file", 
    mimeType: "application/json"
  },
  async (uri) => {
    console.error(`[DEBUG] Config resource called with URI: ${uri.toString()}`);
    try {
      const configPath = path.join(projectRoot, "config.json");
      console.error(`[DEBUG] Reading config from path: ${configPath}`);
      const configContent = await fs.promises.readFile(configPath, "utf8");
      console.error(`[DEBUG] Successfully read config: ${configContent.length} characters`);
      return {
        contents: [{
          uri: uri.toString().replace(/\/$/, ''), // Remove trailing slash if present
          mimeType: "application/json", 
          text: configContent
        }]
      };
    } catch (error) {
      console.error(`[DEBUG] Error reading config: ${error}`);
      throw new Error(`Failed to read config.json: ${error}`);
    }
  }
);

server.resource(
  "readme",
  "file://readme.md",
  {
    description: "Project documentation and usage guide",
    mimeType: "text/markdown"
  },
  async (uri) => {
    console.error(`[DEBUG] Readme resource called with URI: ${uri.toString()}`);
    try {
      const readmePath = path.join(projectRoot, "readme.md");
      console.error(`[DEBUG] Reading readme from path: ${readmePath}`);
      const readmeContent = await fs.promises.readFile(readmePath, "utf8");
      console.error(`[DEBUG] Successfully read readme: ${readmeContent.length} characters`);
      return {
        contents: [{
          uri: uri.toString().replace(/\/$/, ''), // Remove trailing slash if present
          mimeType: "text/markdown",
          text: readmeContent
        }]
      };
    } catch (error) {
      console.error(`[DEBUG] Error reading readme: ${error}`);
      throw new Error(`Failed to read readme.md: ${error}`);
    }
  }
);

server.resource(
  "sample-data",
  "file://data/sample.json",
  {
    description: "Sample data for testing and demonstration",
    mimeType: "application/json"
  },
  async (uri) => {
    console.error(`[DEBUG] Sample-data resource called with URI: ${uri.toString()}`);
    try {
      const sampleDataPath = path.join(projectRoot, "data", "sample.json");
      console.error(`[DEBUG] Reading from path: ${sampleDataPath}`);
      const sampleDataContent = await fs.promises.readFile(sampleDataPath, "utf8");
      console.error(`[DEBUG] Successfully read ${sampleDataContent.length} characters`);
      return {
        contents: [{
          uri: uri.toString().replace(/\/$/, ''), // Remove trailing slash if present
          mimeType: "application/json",
          text: sampleDataContent
        }]
      };
    } catch (error) {
      console.error(`[DEBUG] Error reading sample data: ${error}`);
      throw new Error(`Failed to read data/sample.json: ${error}`);
    }
  }
);



// Prompts capability - provide reusable prompt templates
server.prompt(
  "code_review",
  "Generate a code review checklist",
  {
    language: z.string().describe("Programming language"),
    complexity: z.string().optional().describe("Code complexity level (simple, medium, complex)")
  },
  async ({ language, complexity = "medium" }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Please review this ${language} code with ${complexity} complexity level. 

Check for:
- Code style and formatting
- Performance considerations
- Security vulnerabilities
- Error handling
- Documentation quality
- Test coverage
- Best practices adherence

Provide specific feedback and suggestions for improvement.`
          }
        }
      ]
    };
  }
);

server.prompt(
  "documentation_writer",
  "Generate comprehensive documentation",
  {
    type: z.string().describe("Documentation type (API, user guide, technical spec)"),
    audience: z.string().describe("Target audience (developers, end-users, stakeholders)"),
    detail_level: z.string().optional().describe("Level of detail (brief, detailed, comprehensive)")
  },
  async ({ type, audience, detail_level = "detailed" }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Write ${detail_level} ${type} documentation for ${audience}.

Include:
- Clear overview and purpose
- Prerequisites and requirements
- Step-by-step instructions
- Code examples where applicable
- Troubleshooting section
- FAQ or common issues
- References and further reading

Use clear, accessible language appropriate for the target audience.`
          }
        }
      ]
    };
  }
);

server.prompt(
  "test_generator",
  "Generate comprehensive test cases",
  {
    component: z.string().describe("Component or function to test"),
    test_type: z.string().describe("Type of tests (unit, integration, e2e)")
  },
  async ({ component, test_type }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Generate comprehensive ${test_type} tests for ${component}.

Include:
- Happy path scenarios
- Edge cases and boundary conditions
- Error handling tests
- Performance tests if applicable
- Mock/stub setup where needed
- Assertions for expected behavior
- Test data setup and cleanup

Ensure tests are maintainable and follow best practices.`
          }
        }
      ]
    };
  }
);

server.prompt(
  "weather_report_generator",
  "Generate a comprehensive weather report using app configuration and user data",
  {
    user_id: z.string().optional().describe("User ID to get location preferences from sample data"),
    location_override: z.string().optional().describe("Override location instead of using user's default")
  },
  async ({ user_id, location_override }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Create a comprehensive weather report following these steps:

1. **Resource Check**: First, read the app configuration (config resource) to get:
   - Default location settings
   - Supported regions
   - App timezone preferences

2. **User Context**: If user_id is provided, check the sample data resource to find:
   - User's preferred location
   - Weather alert preferences
   - Notification settings

3. **Weather Data**: Use the get_weather tool to fetch current conditions for:
   - The location from step 1 or 2 (or location_override if provided)
   - Include temperature, conditions, humidity, wind speed

4. **Text Analysis**: Use the text_analyzer tool to analyze the weather description and provide:
   - Basic metrics of the weather report
   - Sentiment analysis of conditions (positive/negative/neutral)

5. **Report Format**: Generate a structured report including:
   - Location and timestamp
   - Current conditions with analysis
   - User-specific recommendations based on preferences
   - Weather alert status if applicable

Please follow this workflow to demonstrate how MCP resources, tools, and prompts work together contextually.

User ID: ${user_id || "not specified"}
Location Override: ${location_override || "use default from resources"}`
          }
        }
      ]
    };
  }
);

server.prompt(
  "get_location_for_weather",
  "Elicit location information for weather lookup",
  {
    user_context: z.string().optional().describe("Any additional context about the user")
  },
  async ({ user_context }) => {
    const suggested_locations = ["New York", "San Francisco", "London", "Tokyo"];
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `I need to get weather information, but no location was specified. 

Please provide a location for the weather lookup. You can:

1. **Specify a city name**: e.g., "New York", "San Francisco", "London"
2. **Include state/country**: e.g., "Austin, TX", "Paris, France" 
3. **Use coordinates**: e.g., "40.7128,-74.0060"
4. **Choose from suggestions**: ${suggested_locations.join(", ")}

${user_context ? `\nAdditional context: ${user_context}` : ""}

What location would you like weather information for?`
          }
        }
      ]
    };
  }
);

// Tools capability - interactive functions
server.tool(
  "get_weather",
  "Get weather for a location",
  {
    location: z.string().optional().describe("Location to get weather for, e.g., city name, state, or coordinates"),
  },
  async ({ location }) => {
    // If no location is provided, return a helpful error message
    if (!location) {
      return {
        content: [
          {
            type: "text",
            text: "Location is required for weather lookup. Please specify a location such as:\n- City name (e.g., 'New York', 'London')\n- City with state/country (e.g., 'Austin, TX', 'Paris, France')\n- Coordinates (e.g., '40.7128,-74.0060')\n\nYou can also use the 'get_location_for_weather' prompt to help format your request.",
          },
        ],
        isError: true
      };
    }

    // mock weather data
    const conditions = [ "Sunny", "Rainy", "Cloudy", "Snowy" ];
    const weather = {
      location: location,
      temperature: `${Math.floor(Math.random() * 80) + 10}°F`,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.floor(Math.random() * 40) + 30}%`,
      windSpeed: `${Math.floor(Math.random() * 20) + 5} mph`,
      forecast: "Partly cloudy with chance of rain later"
    }
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weather, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "get_weather_enhanced",
  "Get enhanced weather information with smart location resolution",
  {
    location: z.string().optional().describe("Location to get weather for - can be city name, coordinates, or search query"),
    use_user_location: z.boolean().optional().describe("Try to use user's default location from resources"),
    include_forecast: z.boolean().optional().describe("Include extended forecast information")
  },
  async ({ location, use_user_location = false, include_forecast = false }) => {
    // If no location provided and not using user location, return helpful guidance
    if (!location && !use_user_location) {
      return {
        content: [
          {
            type: "text",
            text: "Enhanced weather lookup requires a location. You can:\n\n1. Provide a specific location (city, coordinates, etc.)\n2. Set use_user_location=true to use default location\n3. Use the 'get_location_for_weather' prompt for guided location input\n\nExample: { \"location\": \"San Francisco\" } or { \"use_user_location\": true }",
          },
        ],
        isError: true
      };
    }

    // If using user location but no specific location, try to get from sample data
    if (use_user_location && !location) {
      // In a real implementation, you'd read from user preferences/sample data
      location = "San Francisco"; // Default fallback
    }

    // mock enhanced weather data
    const conditions = [ "Sunny", "Rainy", "Cloudy", "Snowy", "Partly Cloudy", "Thunderstorms", "Foggy", "Windy" ];
    const weather: any = {
      location: location,
      temperature: `${Math.floor(Math.random() * 80) + 10}°F`,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.floor(Math.random() * 40) + 30}%`,
      windSpeed: `${Math.floor(Math.random() * 20) + 5} mph`,
      windDirection: ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.floor(Math.random() * 8)],
      pressure: `${(Math.random() * 2 + 29).toFixed(2)} inHg`,
      visibility: `${Math.floor(Math.random() * 10) + 1} miles`,
      uvIndex: Math.floor(Math.random() * 11),
      timestamp: new Date().toISOString()
    };

    if (include_forecast) {
      weather.forecast = {
        today: "Partly cloudy with chance of rain later",
        tomorrow: "Mostly sunny with light winds",
        week: "Variable conditions with temperatures ranging from 45-75°F"
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(weather, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "calculate",
  "Perform mathematical calculations",
  {
    expression: z.string().describe("Mathematical expression to evaluate (e.g., '2 + 3 * 4')"),
  },
  async ({ expression }) => {
    try {
      // Simple expression evaluator (Note: In production, use a proper math parser)
      const result = Function(`"use strict"; return (${expression})`)();
      return {
        content: [
          {
            type: "text",
            text: `${expression} = ${result}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `Error evaluating expression: ${error.message}`,
          },
        ],
      };
    }
  }
);

server.tool(
  "text_analyzer",
  "Analyze text for various metrics",
  {
    text: z.string().describe("Text to analyze"),
    analysis_type: z.enum(["basic", "detailed", "sentiment"]).describe("Type of analysis to perform"),
  },
  async ({ text, analysis_type }) => {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, '').length;

    let analysis: any = {
      wordCount: words.length,
      sentenceCount: sentences.length,
      characterCount: characters,
      characterCountNoSpaces: charactersNoSpaces,
      averageWordsPerSentence: Math.round((words.length / sentences.length) * 100) / 100
    };

    if (analysis_type === "detailed") {
      const wordFrequency = words.reduce((freq: any, word) => {
        const lowercaseWord = word.toLowerCase().replace(/[^\w]/g, '');
        freq[lowercaseWord] = (freq[lowercaseWord] || 0) + 1;
        return freq;
      }, {});
      
      analysis.mostCommonWords = Object.entries(wordFrequency)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([word, count]) => ({ word, count }));
    }

    if (analysis_type === "sentiment") {
      // Simple sentiment analysis (in production, use a proper NLP library)
      const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'happy', 'love'];
      const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'sad', 'angry', 'disappointed'];
      
      const lowerText = text.toLowerCase();
      const positiveScore = positiveWords.reduce((score, word) => 
        score + (lowerText.match(new RegExp(word, 'g')) || []).length, 0);
      const negativeScore = negativeWords.reduce((score, word) => 
        score + (lowerText.match(new RegExp(word, 'g')) || []).length, 0);
      
      analysis.sentiment = {
        positive: positiveScore,
        negative: negativeScore,
        overall: positiveScore > negativeScore ? 'positive' : 
                negativeScore > positiveScore ? 'negative' : 'neutral'
      };
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(analysis, null, 2),
        },
      ],
    };
  }
);

server.tool(
  "generate_uuid",
  "Generate a unique identifier",
  {
    format: z.enum(["v4", "simple"]).optional().describe("UUID format (v4 for standard UUID, simple for basic ID)"),
  },
  async ({ format = "v4" }) => {
    let uuid: string;
    
    if (format === "v4") {
      // Generate UUID v4
      uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    } else {
      // Generate simple ID
      uuid = Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    return {
      content: [
        {
          type: "text",
          text: uuid,
        },
      ],
    };
  }
);

server.tool(
  "location_lookup",
  "Look up location information and timezone data",
  {
    query: z.string().describe("Location name, coordinates, or search query"),
    include_timezone: z.boolean().optional().describe("Include timezone information in response")
  },
  async ({ query, include_timezone = true }) => {
    // Mock location service (in production, would use real geocoding API)
    const locationMap: any = {
      "san francisco": { lat: 37.7749, lng: -122.4194, timezone: "America/Los_Angeles", country: "US" },
      "new york": { lat: 40.7128, lng: -74.0060, timezone: "America/New_York", country: "US" },
      "london": { lat: 51.5074, lng: -0.1278, timezone: "Europe/London", country: "UK" },
      "tokyo": { lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo", country: "JP" },
      "austin": { lat: 30.2672, lng: -97.7431, timezone: "America/Chicago", country: "US" },
      "dublin": { lat: 53.3498, lng: -6.2603, timezone: "Europe/Dublin", country: "IE" }
    };

    const location = locationMap[query.toLowerCase()] || {
      lat: Math.random() * 180 - 90,
      lng: Math.random() * 360 - 180,
      timezone: "UTC",
      country: "Unknown"
    };

    const result: any = {
      query: query,
      coordinates: {
        latitude: location.lat,
        longitude: location.lng
      },
      country: location.country,
      found: !!locationMap[query.toLowerCase()]
    };

    if (include_timezone) {
      result.timezone = location.timezone;
      result.currentTime = new Date().toLocaleString("en-US", { timeZone: location.timezone });
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  }
);

// Official MCP Elicitation Tools - Interactive Workflows for Parameter Collection
server.tool(
  "get_weather_with_elicitation",
  "Get weather with official MCP elicitation for missing location parameter",
  {
    location: z.string().optional().describe("Location to get weather for - if not provided, will elicit from user")
  },
  async ({ location }) => {
    // If location is missing, use official MCP elicitation to collect it
    if (!location) {
      try {
        const result = await server.server.elicitInput({
          message: "Weather lookup requires a location. Please provide the location:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              location: {
                type: "string" as const,
                title: "Location",
                description: "City name, state/country, or coordinates (e.g., 'New York', 'London, UK', '40.7,-74.0')",
                minLength: 2
              }
            },
            required: ["location"]
          }
        });
        
        if (result.action === "accept") {
          location = result.content.location as string;
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "❌ Weather lookup declined. You can call this tool again with a location parameter if you change your mind."
            }],
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "⚠️ Weather lookup cancelled. No location was provided."
            }],
          };
        }
      } catch (error: any) {
        // Fallback to parameter guidance pattern for non-elicitation clients
        return {
          content: [{
            type: "text",
            text: "Location is required for weather lookup. This client doesn't support elicitation, so please provide the location parameter directly:\n\n• City name (e.g., 'New York', 'London')\n• City with state/country (e.g., 'Austin, TX', 'Paris, France')\n• Coordinates (e.g., '40.7128,-74.0060')\n\nExample: { \"location\": \"San Francisco\" }"
          }],
          isError: true
        };
      }
    }

    // Now we have a location, get the weather
    const conditions = [ "Sunny", "Rainy", "Cloudy", "Snowy" ];
    const weather = {
      location: location,
      temperature: `${Math.floor(Math.random() * 80) + 10}°F`,
      condition: conditions[Math.floor(Math.random() * conditions.length)],
      humidity: `${Math.floor(Math.random() * 40) + 30}%`,
      windSpeed: `${Math.floor(Math.random() * 20) + 5} mph`,
      forecast: "Partly cloudy with chance of rain later",
      retrievedVia: "official elicitation"
    };

    return {
      content: [{
        type: "text",
        text: `🌤️ Weather for ${location}:\n\n${JSON.stringify(weather, null, 2)}`
      }],
    };
  }
);

server.tool(
  "send_email_with_elicitation",
  "Send an email with elicitation for missing required parameters",
  {
    to: z.string().optional().describe("Recipient email address"),
    subject: z.string().optional().describe("Email subject"),
    body: z.string().optional().describe("Email body content")
  },
  async ({ to, subject, body }) => {
    // Collect missing parameters via elicitation
    const missingParams: string[] = [];
    if (!to) missingParams.push("to");
    if (!subject) missingParams.push("subject");
    if (!body) missingParams.push("body");

    if (missingParams.length > 0) {
      try {
        const properties: any = {};
        
        if (!to) {
          properties.to = {
            type: "string" as const,
            format: "email" as const,
            title: "Recipient Email",
            description: "Email address of the recipient"
          };
        }
        
        if (!subject) {
          properties.subject = {
            type: "string" as const,
            title: "Email Subject",
            description: "Subject line for the email",
            minLength: 1
          };
        }
        
        if (!body) {
          properties.body = {
            type: "string" as const,
            title: "Email Body",
            description: "Main content of the email message",
            minLength: 1
          };
        }

        const result = await server.server.elicitInput({
          message: `Email sending requires missing information: ${missingParams.join(", ")}. Please provide:`,
          requestedSchema: {
            type: "object" as const,
            properties,
            required: missingParams
          }
        });
        
        if (result.action === "accept") {
          to = to || result.content.to as string;
          subject = subject || result.content.subject as string;
          body = body || result.content.body as string;
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "❌ Email sending declined. You can try again with the required parameters."
            }],
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "⚠️ Email sending cancelled. Required parameters were not provided."
            }],
          };
        }
      } catch (error: any) {
        // Fallback for non-elicitation clients
        return {
          content: [{
            type: "text",
            text: `Email sending requires missing parameters: ${missingParams.join(", ")}.\n\nThis client doesn't support elicitation. Please provide all parameters:\n\nExample:\n{\n  "to": "user@example.com",\n  "subject": "Hello",\n  "body": "Your message here"\n}`
          }],
          isError: true
        };
      }
    }

    // Simulate sending email
    const emailId = Date.now().toString(36);
    return {
      content: [{
        type: "text",
        text: `📧 Email sent successfully!\n\nTo: ${to}\nSubject: ${subject}\nBody: ${body}\n\nEmail ID: ${emailId}\nSent via: official MCP elicitation`
      }],
    };
  }
);

server.tool(
  "create_calendar_event_with_elicitation",
  "Create a calendar event with elicitation for missing parameters",
  {
    title: z.string().optional().describe("Event title"),
    date: z.string().optional().describe("Event date (YYYY-MM-DD)"),
    time: z.string().optional().describe("Event time (HH:MM)"),
    duration: z.string().optional().describe("Duration in minutes"),
    attendees: z.string().optional().describe("Comma-separated list of attendee emails")
  },
  async ({ title, date, time, duration, attendees }) => {
    // Check for required parameters
    const missing: string[] = [];
    if (!title) missing.push("title");
    if (!date) missing.push("date");
    if (!time) missing.push("time");

    if (missing.length > 0) {
      try {
        const properties: any = {};
        
        if (!title) {
          properties.title = {
            type: "string" as const,
            title: "Event Title",
            description: "Name/title of the calendar event"
          };
        }
        
        if (!date) {
          properties.date = {
            type: "string" as const,
            format: "date" as const,
            title: "Event Date",
            description: "Date for the event (YYYY-MM-DD format)"
          };
        }
        
        if (!time) {
          properties.time = {
            type: "string" as const,
            title: "Event Time",
            description: "Start time for the event (HH:MM format, 24-hour)"
          };
        }

        // Optional parameters with defaults
        if (!duration) {
          properties.duration = {
            type: "string" as const,
            title: "Duration (minutes)",
            description: "How long the event will last in minutes",
            default: "60"
          };
        }

        if (!attendees) {
          properties.attendees = {
            type: "string" as const,
            title: "Attendees (optional)",
            description: "Comma-separated email addresses of attendees"
          };
        }

        const result = await server.server.elicitInput({
          message: `Creating calendar event requires: ${missing.join(", ")}. Please provide the details:`,
          requestedSchema: {
            type: "object" as const,
            properties,
            required: missing
          }
        });
        
        if (result.action === "accept") {
          title = title || result.content.title as string;
          date = date || result.content.date as string;
          time = time || result.content.time as string;
          duration = duration || result.content.duration as string || "60";
          attendees = attendees || result.content.attendees as string || "";
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "❌ Calendar event creation declined."
            }],
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "⚠️ Calendar event creation cancelled."
            }],
          };
        }
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: `Calendar event creation requires: ${missing.join(", ")}.\n\nThis client doesn't support elicitation. Please provide all required parameters:\n\nExample:\n{\n  "title": "Team Meeting",\n  "date": "2025-01-15",\n  "time": "14:00",\n  "duration": "60",\n  "attendees": "user1@example.com,user2@example.com"\n}`
          }],
          isError: true
        };
      }
    }

    // Create the calendar event
    const eventId = Date.now().toString(36);
    const event = {
      id: eventId,
      title,
      date,
      time,
      duration: `${duration} minutes`,
      attendees: attendees ? attendees.split(",").map(e => e.trim()) : [],
      created: new Date().toISOString(),
      createdVia: "official MCP elicitation"
    };

    return {
      content: [{
        type: "text",
        text: `📅 Calendar event created successfully!\n\n${JSON.stringify(event, null, 2)}`
      }],
    };
  }
);

server.tool(
  "file_search_with_elicitation", 
  "Search for files with elicitation for search criteria",
  {
    query: z.string().optional().describe("Search query/pattern"),
    file_type: z.string().optional().describe("File extension to filter by"),
    location: z.string().optional().describe("Directory to search in")
  },
  async ({ query, file_type, location }) => {
    // Elicit missing search criteria
    if (!query) {
      try {
        const properties: any = {
          query: {
            type: "string" as const,
            title: "Search Query",
            description: "Text pattern or filename to search for",
            minLength: 1
          }
        };

        // Optional refinements
        if (!file_type) {
          properties.file_type = {
            type: "string" as const,
            enum: ["js", "ts", "md", "json", "txt", "py", "any"],
            enumNames: ["JavaScript (.js)", "TypeScript (.ts)", "Markdown (.md)", "JSON (.json)", "Text (.txt)", "Python (.py)", "Any file type"],
            title: "File Type",
            description: "Filter by file extension"
          };
        }

        if (!location) {
          properties.location = {
            type: "string" as const,
            enum: ["current", "src", "docs", "tests", "all"],
            enumNames: ["Current directory", "Source code (src/)", "Documentation (docs/)", "Tests (tests/)", "All directories"],
            title: "Search Location",
            description: "Where to search for files"
          };
        }

        const result = await server.server.elicitInput({
          message: "File search requires a search query. Please specify what to search for:",
          requestedSchema: {
            type: "object" as const,
            properties,
            required: ["query"]
          }
        });
        
        if (result.action === "accept") {
          query = result.content.query as string;
          file_type = file_type || result.content.file_type as string || "any";
          location = location || result.content.location as string || "all";
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "❌ File search declined."
            }],
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "⚠️ File search cancelled."
            }],
          };
        }
      } catch (error: any) {
        return {
          content: [{
            type: "text",
            text: "File search requires a search query. This client doesn't support elicitation.\n\nPlease provide the search parameters:\n\nExample:\n{\n  \"query\": \"weather\",\n  \"file_type\": \"js\",\n  \"location\": \"src\"\n}"
          }],
          isError: true
        };
      }
    }

    // Simulate file search
    const mockFiles = [
      `src/weather-${query}.ts`,
      `tests/${query}-test.js`, 
      `docs/${query}-guide.md`,
      `lib/${query}-utils.json`
    ].filter(f => file_type === "any" || f.endsWith(`.${file_type}`));

    const searchResults = {
      query,
      file_type,
      location,
      matches: mockFiles.slice(0, Math.floor(Math.random() * 3) + 1),
      total_found: Math.floor(Math.random() * 10) + 1,
      search_time_ms: Math.floor(Math.random() * 100) + 10,
      searchedVia: "official MCP elicitation"
    };

    return {
      content: [{
        type: "text",
        text: `🔍 File search results:\n\n${JSON.stringify(searchResults, null, 2)}`
      }],
    };
  }
);

server.tool(
  "collect_feedback",
  "Collect user feedback using official MCP elicitation",
  {
    topic: z.string().optional().describe("Specific topic for feedback")
  },
  async ({ topic = "general experience" }) => {
    try {
      const elicitParams = {
        message: `Please provide your feedback about ${topic}:`,
        requestedSchema: {
          type: "object" as const,
          properties: {
            rating: {
              type: "number" as const,
              minimum: 1,
              maximum: 5,
              title: "Rating",
              description: "Rate your experience from 1 (poor) to 5 (excellent)"
            },
            feedback_type: {
              type: "string" as const,
              enum: ["bug_report", "feature_request", "general_feedback", "compliment"],
              enumNames: ["Bug Report", "Feature Request", "General Feedback", "Compliment"],
              title: "Feedback Type",
              description: "What type of feedback are you providing?"
            },
            comments: {
              type: "string" as const,
              title: "Comments",
              description: "Your detailed feedback or comments"
            },
            contact_ok: {
              type: "boolean" as const,
              title: "Contact Permission",
              description: "Is it okay for us to contact you about this feedback?",
              default: false
            }
          },
          required: ["rating", "feedback_type", "comments"]
        }
      };

      const result = await server.server.elicitInput(elicitParams);
      
      if (result.action === "accept") {
        const feedback = {
          id: Date.now().toString(36),
          topic: topic,
          ...result.content,
          timestamp: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: `📝 Thank you for your feedback!\n\nFeedback ID: ${feedback.id}\nRating: ${(feedback as any).rating}/5 stars\nType: ${(feedback as any).feedback_type}\n\n"${(feedback as any).comments}"\n\nYour feedback helps us improve!`,
            },
          ],
        };
      } else if (result.action === "decline") {
        return {
          content: [
            {
              type: "text",
              text: "👋 No problem! Feel free to provide feedback anytime.",
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: "⚠️ Feedback collection cancelled.",
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Official MCP elicitation not supported by this client.\n\nError: ${error.message}\n\nThis tool demonstrates official MCP elicitation. For a fallback approach, you can provide feedback directly as a string parameter instead.`,
          },
        ],
        isError: true
      };
    }
  }
);

server.tool(
  "quick_survey",
  "Run a quick survey using official MCP elicitation with enum choices",
  {
    survey_type: z.enum(["satisfaction", "feature_priority", "usage_patterns"]).optional().describe("Type of survey to run")
  },
  async ({ survey_type = "satisfaction" }) => {
    try {
      let elicitParams: any;
      
      if (survey_type === "satisfaction") {
        elicitParams = {
          message: "Quick satisfaction survey (takes 30 seconds):",
          requestedSchema: {
            type: "object" as const,
            properties: {
              overall_satisfaction: {
                type: "string" as const,
                enum: ["very_satisfied", "satisfied", "neutral", "dissatisfied", "very_dissatisfied"],
                enumNames: ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
                title: "Overall Satisfaction",
                description: "How satisfied are you with the service?"
              },
              recommend: {
                type: "string" as const,
                enum: ["definitely", "probably", "maybe", "probably_not", "definitely_not"],
                enumNames: ["Definitely", "Probably", "Maybe", "Probably Not", "Definitely Not"],
                title: "Recommendation",
                description: "Would you recommend this to a friend?"
              },
              primary_use: {
                type: "string" as const,
                enum: ["work", "personal", "education", "research", "other"],
                enumNames: ["Work", "Personal", "Education", "Research", "Other"],
                title: "Primary Use Case",
                description: "What do you primarily use this for?"
              }
            },
            required: ["overall_satisfaction", "recommend"]
          }
        };
      } else if (survey_type === "feature_priority") {
        elicitParams = {
          message: "Help us prioritize features:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              most_important: {
                type: "string" as const,
                enum: ["performance", "new_features", "ease_of_use", "documentation", "support"],
                enumNames: ["Performance", "New Features", "Ease of Use", "Documentation", "Support"],
                title: "Most Important",
                description: "What's most important to improve?"
              },
              next_feature: {
                type: "string" as const,
                enum: ["mobile_app", "api_access", "integrations", "analytics", "collaboration"],
                enumNames: ["Mobile App", "API Access", "Integrations", "Analytics", "Collaboration"],
                title: "Next Feature",
                description: "What feature would you like to see next?"
              }
            },
            required: ["most_important"]
          }
        };
      } else {
        elicitParams = {
          message: "Tell us about your usage patterns:",
          requestedSchema: {
            type: "object" as const,
            properties: {
              frequency: {
                type: "string" as const,
                enum: ["daily", "weekly", "monthly", "rarely"],
                enumNames: ["Daily", "Weekly", "Monthly", "Rarely"],
                title: "Usage Frequency",
                description: "How often do you use this service?"
              },
              session_length: {
                type: "string" as const,
                enum: ["few_minutes", "half_hour", "hour", "several_hours"],
                enumNames: ["A few minutes", "About half an hour", "About an hour", "Several hours"],
                title: "Session Length",
                description: "How long are your typical sessions?"
              },
              time_of_day: {
                type: "string" as const,
                enum: ["morning", "afternoon", "evening", "night", "varies"],
                enumNames: ["Morning", "Afternoon", "Evening", "Night", "Varies"],
                title: "Time of Day",
                description: "When do you typically use this?"
              }
            },
            required: ["frequency"]
          }
        };
      }

      const result = await server.server.elicitInput(elicitParams);
      
      if (result.action === "accept") {
        const surveyResponse = {
          id: Date.now().toString(36),
          type: survey_type,
          ...result.content,
          completed: new Date().toISOString()
        };
        
        return {
          content: [
            {
              type: "text",
              text: `📊 Survey completed! Thank you for your time.\n\nSurvey Type: ${survey_type}\nResponse ID: ${surveyResponse.id}\n\nResults:\n${JSON.stringify(result.content, null, 2)}\n\nYour input helps us improve the service!`,
            },
          ],
        };
      } else if (result.action === "decline") {
        return {
          content: [
            {
              type: "text",
              text: "👍 No worries! Surveys are optional. Thanks for considering it.",
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: "📋 Survey cancelled. Feel free to try again later!",
            },
          ],
        };
      }
    } catch (error: any) {
      return {
        content: [
          {
            type: "text",
            text: `❌ Official MCP elicitation not supported by this client.\n\nError: ${error.message}\n\nThis tool demonstrates official MCP elicitation with enum choices. Try using a client that supports the elicitation capability.`,
          },
        ],
        isError: true
      };
    }
  }
);

// Rain Prediction Tool - Specifically designed to test elicitation
server.tool(
  "rain_prediction_with_elicitation",
  "🧪 ELICITATION TEST TOOL: Rain prediction that demonstrates interactive parameter collection using MCP elicitation patterns",
  {
    location: z.string().optional().describe("Location for rain prediction"),
    hours_ahead: z.number().optional().describe("Number of hours ahead to predict (1-72)"),
    include_probability: z.boolean().optional().describe("Include detailed probability data")
  },
  async ({ location, hours_ahead, include_probability }) => {
    // Step 1: Try official elicitation for missing parameters
    if (!location) {
      try {
        console.log("🌧️ Attempting rain prediction elicitation...");
        
        const properties: any = {
          location: {
            type: "string" as const,
            title: "Location",
            description: "City name, coordinates, or address for rain prediction",
            examples: ["Seattle, WA", "Tokyo, Japan", "40.7128,-74.0060"]
          }
        };
        
        const required = ["location"];

        // Add optional parameters to elicitation
        if (!hours_ahead) {
          properties.hours_ahead = {
            type: "number" as const,
            title: "Prediction Window",
            description: "How many hours ahead to predict rain",
            minimum: 1,
            maximum: 72,
            default: 24
          };
        }

        if (include_probability === undefined) {
          properties.include_probability = {
            type: "boolean" as const,
            title: "Detailed Probability",
            description: "Include detailed probability and confidence data",
            default: true
          };
        }
        
        const result = await server.server.elicitInput({
          message: "Rain prediction requires location information. Please provide the details:",
          requestedSchema: {
            type: "object" as const,
            properties,
            required
          }
        });

        if (result.action === "accept") {
          console.log("✅ Elicitation successful!");
          console.log("Raw result:", JSON.stringify(result, null, 2));
          console.log("Content type:", typeof result.content);
          console.log("Content value:", result.content);
          
          // Safely extract values with validation
          try {
            const content = result.content;
            if (typeof content === 'object' && content !== null) {
              const contentObj = content as Record<string, any>;
              console.log("Parsed content object:", contentObj);
              
              if (contentObj.location && typeof contentObj.location === 'string') {
                location = contentObj.location;
                console.log("✅ Got location from elicitation:", location);
              }
              
              if (!hours_ahead && contentObj.hours_ahead && typeof contentObj.hours_ahead === 'number') {
                hours_ahead = contentObj.hours_ahead;
                console.log("✅ Got hours_ahead from elicitation:", hours_ahead);
              }
              
              if (include_probability === undefined && contentObj.include_probability !== undefined && typeof contentObj.include_probability === 'boolean') {
                include_probability = contentObj.include_probability;
                console.log("✅ Got include_probability from elicitation:", include_probability);
              }
            } else {
              console.log("⚠️ Elicitation content is not an object:", typeof content);
              console.log("Content value:", content);
              // Fall through to parameter guidance
            }
          } catch (parseError: any) {
            console.log("❌ Error parsing elicitation response:", parseError.message);
            console.log("Stack:", parseError.stack);
            // Fall through to parameter guidance
          }
        } else if (result.action === "decline") {
          return {
            content: [{
              type: "text",
              text: "🌧️ Rain prediction declined. Location information is required for accurate forecasting."
            }],
          };
        } else {
          return {
            content: [{
              type: "text",
              text: "⚠️ Rain prediction cancelled by user."
            }],
          };
        }
      } catch (error: any) {
        console.log("❌ Elicitation failed:", error.message);
        // Fall through to parameter guidance
      }
    }

    // Step 2: Parameter validation with guidance fallback
    if (!location) {
      return {
        content: [{
          type: "text",
          text: `🌧️ Rain Prediction Tool - Location Required

This client doesn't support elicitation, so please provide the location parameter directly:

📍 **Location Examples:**
   • City: "Seattle", "London", "Tokyo"
   • City with region: "Austin, TX", "Paris, France"
   • Coordinates: "40.7128,-74.0060", "51.5074,-0.1278"
   • Address: "123 Main St, Boston, MA"

⏰ **Optional Parameters:**
   • hours_ahead: 1-72 hours (default: 24)
   • include_probability: true/false (default: true)

💡 **Example:** { "location": "San Francisco", "hours_ahead": 12, "include_probability": true }

🔬 **Note:** This tool specifically tests MCP elicitation. With an elicitation-capable client, you would see an interactive form instead of this message.`
        }],
        isError: true
      };
    }

    // Step 3: Set defaults for optional parameters
    hours_ahead = hours_ahead || 24;
    include_probability = include_probability !== undefined ? include_probability : true;

    // Step 4: Generate rain prediction (mock data)
    const predictions = generateRainPrediction(location, hours_ahead, include_probability);

    return {
      content: [{
        type: "text",
        text: `🌧️ **Rain Prediction for ${location}**

📅 **Forecast Period:** Next ${hours_ahead} hours
⏰ **Generated:** ${new Date().toLocaleString()}

${predictions.summary}

${include_probability ? `
📊 **Detailed Probability:**
${predictions.detailed}

🎯 **Confidence Level:** ${predictions.confidence}%
📡 **Data Sources:** Weather stations, satellite imagery, radar data
` : ''}

💡 **Recommendation:** ${predictions.recommendation}

---
🔬 **Elicitation Test Result:** Attempted elicitation ${location ? 'succeeded' : 'failed - using parameter guidance fallback'}`
      }]
    };
  }
);

// Mock rain prediction generator
function generateRainPrediction(location: string, hours: number, includeDetailed: boolean) {
  // Generate mock prediction data
  const rainChance = Math.floor(Math.random() * 100);
  const intensity = ["Light", "Moderate", "Heavy"][Math.floor(Math.random() * 3)];
  const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
  
  const summary = rainChance > 50 
    ? `🌧️ **${rainChance}% chance of rain** expected in the next ${hours} hours.\n⛈️ **Intensity:** ${intensity} precipitation likely between hours ${Math.floor(hours * 0.3)}-${Math.floor(hours * 0.7)}.`
    : `☀️ **${100 - rainChance}% chance of staying dry** for the next ${hours} hours.\n🌤️ **Conditions:** Mostly clear with possible light clouds.`;

  const detailed = includeDetailed ? [
    `• Hour 1-6: ${Math.floor(Math.random() * 30)}% chance`,
    `• Hour 7-12: ${Math.floor(Math.random() * 50) + 20}% chance`, 
    `• Hour 13-18: ${Math.floor(Math.random() * 60) + 30}% chance`,
    `• Hour 19-24: ${Math.floor(Math.random() * 40) + 10}% chance`,
    hours > 24 ? `• Beyond 24h: ${Math.floor(Math.random() * 50) + 25}% chance` : null
  ].filter(Boolean).join('\n') : '';

  const recommendation = rainChance > 70 
    ? "🌂 **Bring an umbrella!** High probability of rain."
    : rainChance > 40 
    ? "🤔 **Keep an eye on the sky.** Moderate rain chance."
    : "😎 **Enjoy the weather!** Low rain probability.";

  return {
    summary,
    detailed,
    confidence,
    recommendation
  };
}

// Note: Roots capability is declared in server options above
// The roots capability allows MCP clients to access specified file system directories
// The actual root URIs are: file:///workspace, file:///documents, file:///config

export { server };
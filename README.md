# Vaali MCP Server

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)
![MCP](https://img.shields.io/badge/MCP-1.19.1-purple.svg)

A **Model Context Protocol (MCP) server** that demonstrates advanced AI agent capabilities through interactive parameter collection and contextual workflow automation, featuring both official MCP elicitation and intelligent parameter guidance patterns.

## 📑 Table of Contents

- [What is This?](#-what-is-this)
- [Technical Innovation](#-technical-innovation-for-researchers)
- [Quick Start](#-quick-start)
- [Complete MCP Implementation](#-complete-mcp-implementation)
- [Documentation](#-learn-more)
- [VS Code Integration](#-vs-code-integration)
- [What Makes This Special](#-what-makes-this-special)
- [Research Applications](#-research-applications)
- [Project Status](#-project-status)

## 🎯 What is This? 

**Vaali** makes AI assistants (like Claude) **smarter and more helpful** by giving them:
- 🔧 **Tools** they can use (weather, calculations, text analysis)
- 📋 **Prompts** that guide complex workflows  
- 📁 **Resources** with your data and preferences
- 🤖 **Interactive parameter collection** that asks for missing information intelligently

**Simple Example:**
```
You: "What's the weather like?"

With Elicitation-Capable Client:
✨ Interactive form appears asking for location
📍 You enter "Seattle, WA"  
🌤️ "Current weather in Seattle: 45°F, Cloudy"

With Standard Client:
📋 "I can help with weather! Please provide your location:
   • City: 'Seattle', 'London', 'Tokyo'
   • City with region: 'Austin, TX', 'Paris, France'
   Or enter any city name..."
```

### 📸 Real Claude Desktop Elicitation in Action

Here's how the Vaali MCP server's elicitation looks in Claude Desktop:

![Claude Desktop Elicitation Screenshot](public/claude_screenshot.png)

*Screenshot showing Claude Desktop's interactive parameter collection with the Vaali MCP server - demonstrating the seamless user experience of hybrid elicitation patterns.*

## 🧠 Technical Innovation (For Researchers)

This project implements **both official MCP elicitation and intelligent parameter guidance patterns**, demonstrating comprehensive approaches to interactive parameter collection in AI agent workflows.

### Hybrid Approach: Two Complementary Methods

1. **🔥 Official MCP Elicitation** (NEW): Interactive workflows that collect missing parameters DURING tool execution
   - Server directly requests structured data from clients using `server.elicitInput()`
   - JSON schema-driven forms and dialogs in supporting clients
   - Accept/decline/cancel response model with immediate parameter collection
   - Standardized protocol feature for enhanced user experience

2. **📋 Parameter Guidance Pattern**: Universal compatibility approach using existing MCP features
   - Works with ANY MCP client through intelligent error handling and contextual guidance
   - Rich contextual help, examples, and intelligent suggestions
   - Client-side intelligence for error recovery and preference learning

### Key Technical Contributions

- **🚀 Interactive Workflows**: Tools that start execution and collect missing parameters progressively
- **🔄 Hybrid Compatibility**: Same tools work with elicitation-capable AND standard MCP clients
- **🛡️ Graceful Fallbacks**: Automatic detection of client capabilities with appropriate response patterns
- **🎯 Progressive Enhancement**: Enhanced experience for capable clients, universal functionality for all
- **📊 Comprehensive Implementation**: Full MCP server with resources, tools, prompts, and elicitation

### Research Significance

- **Interactive AI Workflows**: Demonstrates how tools can seamlessly collect parameters during execution
- **Protocol Evolution**: Shows official MCP elicitation working alongside existing parameter guidance
- **Universal Compatibility**: Single implementation works across all MCP client capabilities
- **User Experience**: Progressive enhancement from error messages to interactive forms
- **Hybrid Architecture**: Best of both worlds - standardized elicitation + universal fallbacks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- VS Code (recommended)

### Installation & Testing
```bash
# Clone and setup
git clone <repository-url>
cd vaali

# Install dependencies
npm install

# Build the project
npm run build

# Test elicitation concepts (educational walkthrough)
npm run test:advanced-concept

# Test with real MCP clients
npm run test:working-advanced

# Run all tests
npm run test:all

# Start server for Claude Desktop (stdio mode)
npm run start:stdio

# Start server with SSE transport (for debugging)
npm run start:sse
```

### Claude Desktop Integration

Add to your Claude Desktop configuration file:

**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`  
**macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Linux:** `~/.config/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "vaali": {
      "command": "node",
      "args": ["C:/absolute/path/to/vaali/lib/src/index.js", "stdio"],
      "cwd": "C:/absolute/path/to/vaali"
    }
  }
}
```

> **Note:** Use absolute paths for reliable operation. Replace with your actual project path.

Then try natural language commands:
```
"What's the weather in Tokyo?"
"Generate a weather report for Alice"
"Calculate 25 * 4 + 10"
"Test the elicitation tool"
```

## 🏗️ Complete MCP Implementation

This server demonstrates all four MCP capabilities working together:

### ✅ Resources (Static Data)
- **config**: Application configuration and settings
- **sample-data**: User profiles and preferences  
- **readme**: Project documentation

### ✅ Tools (Interactive Functions)
- **Weather Tools**: Current conditions, forecasts, location lookup
- **Analysis Tools**: Text analysis, calculations, data processing
- **Elicitation Tools**: Interactive parameter collection testing

### ✅ Prompts (Workflow Templates)
- **Weather Report Generator**: Multi-step personalized reports
- **Code Review**: Structured review checklists
- **Documentation Writer**: Comprehensive documentation generation

### ✅ Elicitation (Interactive Parameter Collection)
- **Official MCP Elicitation**: JSON schema-driven interactive forms
- **Parameter Guidance**: Universal compatibility with rich contextual help
- **Hybrid Implementation**: Automatic fallback for maximum compatibility

## 📚 Learn More

### For Users & Beginners
- **[docs/CLAUDE_DESKTOP_GUIDE.md](docs/CLAUDE_DESKTOP_GUIDE.md)** - Complete Claude Desktop usage guide
- **[docs/README.md](docs/README.md)** - Documentation index and navigation

### For Developers
- **[docs/IMPLEMENTATION_COMPREHENSIVE_GUIDE.md](docs/IMPLEMENTATION_COMPREHENSIVE_GUIDE.md)** - Complete technical implementation
- **[docs/test-documentation.md](docs/test-documentation.md)** - Testing suite documentation

### For Researchers
- **[docs/ELICITATION_COMPREHENSIVE_GUIDE.md](docs/ELICITATION_COMPREHENSIVE_GUIDE.md)** - Elicitation patterns and best practices
- **[docs/ADVANCED_IMPLEMENTATION_SUMMARY.md](docs/ADVANCED_IMPLEMENTATION_SUMMARY.md)** - Technical architecture overview

## 🎮 VS Code Integration

| Debug Mode | Purpose | How to Use |
|------------|---------|-----------|
| **Agent Builder** | Test with AI Toolkit | F5 → "Debug in Agent Builder" |
| **MCP Inspector** | Protocol debugging | F5 → "Debug SSE in Inspector" |
| **STDIO Mode** | Client integration | F5 → "Debug STDIO in Inspector" |

## 🔬 What Makes This Special

### For Undergraduates: **Interactive AI Tools**
Instead of rigid forms, AI tools can **collect information naturally** during conversation - like asking for your location when you ask about weather, or your email subject when sending messages.

### For Graduate Students: **Dual-Mode Parameter Collection**
Implements **two complementary approaches**: official MCP elicitation for rich interactive forms in supporting clients, plus universal parameter guidance that works with any MCP client through intelligent error handling and prompts.

### For PhD Researchers: **Hybrid Protocol Architecture**
Demonstrates **progressive enhancement** in structured protocols - tools automatically detect client capabilities and provide optimal user experience (interactive forms) while maintaining universal compatibility (guidance fallbacks). Shows how to evolve protocols without breaking existing implementations.

## 🧪 Research Applications

- **Interactive AI Workflows**: How tools can seamlessly collect parameters during execution
- **Protocol Enhancement**: Extending MCP with progressive capabilities while maintaining compatibility
- **User Experience Design**: From error messages to interactive forms to natural conversation
- **Client-Server Architecture**: Capability detection and graceful degradation patterns
- **Hybrid System Design**: Combining standardized protocols with intelligent behaviors

## 🎯 Project Status

✅ **Complete MCP implementation** with all four capabilities (resources, tools, prompts, elicitation)  
✅ **Interactive workflow tools** that collect parameters during execution  
✅ **Hybrid compatibility** - works with elicitation-capable AND standard clients  
✅ **Comprehensive testing suite** demonstrating interactive workflows  
✅ **Claude Desktop integration** with natural language usage  
✅ **Production-ready** server architecture with graceful fallbacks  
✅ **MIT Licensed** - Open source and ready for contributions

Built on MCP SDK 1.19.1 and demonstrates cutting-edge interactive AI tool capabilities.

## 🌟 Key Features

- **🔄 Hybrid Elicitation**: Both official MCP elicitation and universal parameter guidance
- **📊 Full MCP Compliance**: Resources, tools, prompts, and elicitation capabilities
- **🎯 Progressive Enhancement**: Optimal experience based on client capabilities
- **🛡️ Universal Compatibility**: Works with any MCP client
- **🧪 Research-Ready**: Comprehensive examples for academic and industrial research
- **🚀 Production-Ready**: Robust error handling and graceful fallbacks

## 🤝 Contributing

Contributions are welcome! This project demonstrates advanced MCP patterns and is perfect for:

- **Researchers**: Extending elicitation patterns and protocol research
- **Developers**: Adding new tools and improving client compatibility  
- **Students**: Learning about interactive AI workflows and protocol design

### Development Setup
```bash
# Development mode with hot reload
npm run dev:stdio

# Run tests continuously
npm run test:watch

# Debug with VS Code
Press F5 → Select debug configuration
```

### Areas for Contribution
- Additional elicitation patterns and examples
- New interactive tools demonstrating parameter collection
- Client compatibility testing and improvements
- Documentation and educational content
- Performance optimizations and error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Want to understand how interactive workflows transform AI interactions?** Run `npm run test:advanced-concept` for an educational walkthrough!
# Azure Deployment Guide

Complete guide for deploying Vaali MCP Server to Azure App Service with multiple deployment strategies.

## Quick Start

### Deploy to Azure Button (Recommended for First-Time Users)

[![Deploy to Azure](https://aka.ms/deploytoazurebutton)](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fushakrishnan%2FVaali_MCP_Server%2Fmain%2Finfra%2Fazuredeploy.json)

**What you get:**
- ✅ Azure App Service (Linux, Node.js 18)
- ✅ App Service Plan (B1 Basic tier - cost-effective)
- ✅ HTTPS endpoint automatically enabled
- ✅ Environment variables pre-configured for SSE transport

**After deployment, your server will be available at:**
- **Main URL:** `https://your-app-name.azurewebsites.net`
- **SSE Endpoint:** `https://your-app-name.azurewebsites.net/sse`

## Deployment Options

### Option 1: One-Click + Automatic Updates (Best for Most Users)

1. **Initial Deployment:** Click "Deploy to Azure" button above
2. **Setup Continuous Deployment:**
   - Go to Azure Portal → Your App Service → **Deployment Center**
   - **Source:** GitHub
   - **Authorize** and select this repository
   - **Branch:** main
   - **Save**

**Result:** Automatic deployment on every code push! 🚀

### Option 2: Manual Updates via Azure CLI

For quick one-off updates without setting up automation:

```powershell
# Windows PowerShell commands

# 1. Build the project
npm run build

# 2. Create deployment package
Compress-Archive -Path dist,package.json,package-lock.json,data,config.json -DestinationPath deploy.zip -Force

# 3. Deploy to your App Service (replace YOUR_APP_NAME)
az webapp deployment source config-zip `
  --resource-group vaali-mcp-rg `
  --name YOUR_APP_NAME `
  --src deploy.zip

# 4. Restart if needed (usually not required)
az webapp restart --name YOUR_APP_NAME --resource-group vaali-mcp-rg

# 5. Get URL to test deployment
az webapp show --name YOUR_APP_NAME --resource-group vaali-mcp-rg --query defaultHostName -o tsv
```

```bash
# Linux/macOS alternative
npm run build
zip -r deploy.zip dist package.json package-lock.json data config.json
az webapp deployment source config-zip \
  --resource-group vaali-mcp-rg \
  --name YOUR_APP_NAME \
  --src deploy.zip
```

### Option 3: GitHub Actions CI/CD

For developers who want full automation with testing:

1. **Setup Azure Service Principal:** See [Implementation Guide](IMPLEMENTATION_COMPREHENSIVE_GUIDE.md#azure-deployment-with-github-actions)
2. **Add GitHub Secret:** `AZURE_CREDENTIALS` with service principal JSON
3. **Automatic Deployment:** Push to main branch triggers deployment

### Option 4: VS Code Extension

1. **Install:** Azure App Service extension in VS Code
2. **Sign in:** to your Azure account
3. **Deploy:** Right-click App Service → Deploy to Web App
4. **Select:** `dist` folder for deployment

## Pricing and Scaling

### Tier Comparison

| Tier | Relative Cost | CPU | RAM | Use Case | 
|------|---------------|-----|-----|----------|
| **B1 Basic** | **Base Cost** ✅ | 1 vCPU | 1.75 GB | Development, demos, light production |
| **B2 Basic** | **2x Base** | 2 vCPU | 3.5 GB | Higher traffic, team usage |
| **S1 Standard** | **~5x Base** | 1 vCPU | 1.75 GB | Production with staging slots |

### Performance Expectations

- **B1 Basic:** 10-20 concurrent MCP connections
- **B2 Basic:** 20-50 concurrent connections  
- **S1 Standard:** 50+ connections with enterprise features

### Cost Optimization

- ✅ **Start with B1** for development and testing
- ✅ **Scale up** only when performance requires it
- ✅ **Stop App Service** when not in use for development
- ✅ **Monitor costs** through Azure Cost Management

## Configuration

### Environment Variables

The deployment automatically configures:

```bash
NODE_ENV=production
PORT=8080
WEBSITE_RUN_FROM_PACKAGE=1
```

### Custom Configuration

Add custom environment variables in Azure Portal:
- **App Service** → **Configuration** → **Application settings**

Common settings:
```bash
MCP_SERVER_NAME=your-server-name
ENABLE_LOGGING=true
RATE_LIMIT_MAX=100
```

## Monitoring and Troubleshooting

### Health Checks

Test your deployment:

```bash
# Test SSE endpoint
curl https://your-app-name.azurewebsites.net/sse

# Test health endpoint (if available)
curl https://your-app-name.azurewebsites.net/health
```

### View Logs

1. **Azure Portal** → Your App Service → **Log stream**
2. **Advanced Monitoring:** Application Insights (optional)

### Common Issues

**Issue:** App won't start
- **Solution:** Check logs for build errors, verify package.json scripts

**Issue:** SSE endpoint not responding  
- **Solution:** Verify PORT environment variable, check application logs

**Issue:** Deployment timeout
- **Solution:** Check package size, increase timeout in deployment settings

## Security

### Default Security Features

- ✅ **HTTPS Only:** Automatically enabled
- ✅ **Managed Identity:** Available for Azure service integration
- ✅ **Network Security:** Azure App Service built-in protection

### Additional Security

```bash
# Enable additional security headers
az webapp config set \
  --resource-group vaali-mcp-rg \
  --name YOUR_APP_NAME \
  --use-32bit-worker-process false \
  --web-sockets-enabled true
```

## Integration with MCP Clients

### Claude Desktop Configuration

```json
{
  "mcpServers": {
    "vaali-azure": {
      "command": "node",
      "args": ["-e", "
        const { SSEClientTransport } = require('@modelcontextprotocol/sdk/client/sse.js');
        const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
        const transport = new SSEClientTransport(new URL('https://your-app-name.azurewebsites.net/sse'));
        const client = new Client({ name: 'claude-desktop', version: '1.0.0' }, { capabilities: {} });
        client.connect(transport).catch(console.error);
      "]
    }
  }
}
```

### Other MCP Clients

Use the SSE endpoint: `https://your-app-name.azurewebsites.net/sse`

## Backup and Recovery

### Configuration Backup

Export your App Service settings:

```bash
az webapp config appsettings list \
  --name YOUR_APP_NAME \
  --resource-group vaali-mcp-rg \
  --output json > app-settings-backup.json
```

### Disaster Recovery

- **Infrastructure:** ARM templates in `infra/` folder enable recreation
- **Code:** Source code in GitHub repository
- **Data:** No persistent data storage in this stateless application

## Support

For deployment issues:
1. **Check Azure Activity Log** for resource-level errors
2. **Review App Service Logs** for application errors  
3. **Consult Implementation Guide** for detailed troubleshooting
4. **GitHub Issues** for code-related problems

---

**Quick Reference:**
- **Deploy:** [Deploy to Azure Button](https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2Fushakrishnan%2FVaali_MCP_Server%2Fmain%2Finfra%2Fazuredeploy.json)
- **Update:** Azure Portal Deployment Center (recommended)
- **Monitor:** Azure Portal Log Stream
- **Scale:** Change App Service Plan tier as needed
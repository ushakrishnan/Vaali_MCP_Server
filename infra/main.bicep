// Azure App Service Infrastructure as Code
@description('Location for all resources')
param location string = resourceGroup().location

@description('Name of the web app (must be globally unique)')
param webAppName string

@description('Name of the App Service plan')
param appServicePlanName string = '${webAppName}-plan'

@description('App Service plan pricing tier - B1 recommended (lowest cost), B2 (2x B1), S1+ (production features)')
@allowed([
  'B1'
  'B2' 
  'S1'
  'S2'
])
param skuName string = 'B1'

@description('Number of instances (1 recommended for most use cases)')
@minValue(1)
@maxValue(3)
param skuCapacity int = 1

// App Service Plan (Linux, configurable tier)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: skuName
    tier: skuName == 'B1' || skuName == 'B2' ? 'Basic' : 'Standard'
    capacity: skuCapacity
  }
  kind: 'linux'
  properties: {
    reserved: true  // Required for Linux
  }
}

// Web App
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      appCommandLine: 'npm run start:sse'
      appSettings: [
        {
          name: 'NODE_ENV'
          value: 'production'
        }
        {
          name: 'TRANSPORT'
          value: 'sse'
        }
        {
          name: 'PORT'
          value: '3001'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '18-lts'
        }
        {
          name: 'SCM_DO_BUILD_DURING_DEPLOYMENT'
          value: 'true'
        }
      ]
      cors: {
        allowedOrigins: ['*']
        supportCredentials: false
      }
    }
    httpsOnly: true
  }
}

// Output the web app URL
@description('URL of the deployed web application')
output webAppUrl string = 'https://${webApp.properties.defaultHostName}'

@description('Name of the created web app')
output webAppName string = webApp.name

@description('SSE endpoint for MCP clients')
output sseEndpoint string = 'https://${webApp.properties.defaultHostName}/sse'

@description('Resource group name')
output resourceGroupName string = resourceGroup().name

@description('Relative cost comparison - B1: Base cost (recommended), B2: 2x B1, S1+: ~5x B1 with production features')
output relativeCost string = skuName == 'B1' ? 'Base cost - Most economical choice' : skuName == 'B2' ? '2x base cost - Better performance' : '~5x base cost - Production features included'

@description('Performance and feature guide')
output performanceGuide string = skuName == 'B1' ? '10-20 concurrent connections, perfect for demos' : skuName == 'B2' ? '20-50 concurrent connections, good for teams' : '50+ concurrent connections with staging slots and backups'

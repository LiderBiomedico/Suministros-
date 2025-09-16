const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // 1. Verificar variables de entorno
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        hasApiKey: !!process.env.AIRTABLE_API_KEY,
        hasBaseId: !!process.env.AIRTABLE_BASE_ID,
        apiKeyLength: process.env.AIRTABLE_API_KEY?.length || 0,
        baseIdLength: process.env.AIRTABLE_BASE_ID?.length || 0,
        apiKeyPrefix: process.env.AIRTABLE_API_KEY?.substring(0, 3) || 'none',
        baseIdPrefix: process.env.AIRTABLE_BASE_ID?.substring(0, 3) || 'none',
        nodeVersion: process.version,
        platform: process.platform
      },
      validations: {}
    };

    // 2. Validar formato de API Key
    if (process.env.AIRTABLE_API_KEY) {
      const apiKey = process.env.AIRTABLE_API_KEY;
      diagnostics.validations.apiKeyFormat = {
        startsWithPat: apiKey.startsWith('pat'),
        startsWithKey: apiKey.startsWith('key'),
        hasCorrectLength: apiKey.length >= 17,
        isValid: apiKey.startsWith('pat') || apiKey.startsWith('key')
      };
    }

    // 3. Validar formato de Base ID
    if (process.env.AIRTABLE_BASE_ID) {
      const baseId = process.env.AIRTABLE_BASE_ID;
      diagnostics.validations.baseIdFormat = {
        startsWithApp: baseId.startsWith('app'),
        hasCorrectLength: baseId.length === 17,
        isValid: baseId.startsWith('app') && baseId.length === 17
      };
    }

    // 4. Si no hay variables, retornar diagnóstico
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing environment variables',
          diagnostics,
          recommendations: [
            'Add AIRTABLE_API_KEY in Netlify environment variables',
            'Add AIRTABLE_BASE_ID in Netlify environment variables',
            'Redeploy your site after adding variables'
          ]
        })
      };
    }

    // 5. Intentar conexión básica
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
      .base(process.env.AIRTABLE_BASE_ID);

    // 6. Verificar acceso a la tabla
    try {
      const records = await base('Requerimientos').select({
        maxRecords: 1,
        view: "Grid view"
      }).firstPage();

      diagnostics.connection = {
        success: true,
        tableAccess: true,
        recordCount: records.length,
        sampleFields: records[0]?.fields ? Object.keys(records[0].fields) : []
      };

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Connection successful!',
          diagnostics,
          recommendations: ['Connection is working properly']
        })
      };

    } catch (tableError) {
      diagnostics.connection = {
        success: false,
        tableAccess: false,
        error: tableError.message,
        errorType: tableError.error,
        statusCode: tableError.statusCode
      };

      let recommendations = [];
      
      if (tableError.statusCode === 404) {
        recommendations.push('Verify that table "Requerimientos" exists in your Airtable base');
        recommendations.push('Check if the table name is spelled correctly (case sensitive)');
      } else if (tableError.statusCode === 401 || tableError.statusCode === 403) {
        recommendations.push('Verify your AIRTABLE_API_KEY has proper permissions');
        recommendations.push('Ensure the API key has access to this specific base');
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Table access failed',
          diagnostics,
          recommendations
        })
      };
    }

  } catch (error) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.error,
        statusCode: error.statusCode,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        diagnostics: {
          timestamp: new Date().toISOString(),
          environment: {
            hasApiKey: !!process.env.AIRTABLE_API_KEY,
            hasBaseId: !!process.env.AIRTABLE_BASE_ID
          }
        }
      })
    };
  }
};
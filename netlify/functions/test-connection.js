const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Debug: Ver si las variables existen
    const debugInfo = {
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      apiKeyLength: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.length : 0,
      baseIdLength: process.env.AIRTABLE_BASE_ID ? process.env.AIRTABLE_BASE_ID.length : 0,
      // Primeros caracteres para verificar formato
      apiKeyStart: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.substring(0, 3) : 'none',
      baseIdStart: process.env.AIRTABLE_BASE_ID ? process.env.AIRTABLE_BASE_ID.substring(0, 3) : 'none'
    };

    // Si no hay variables, devolver el debug info
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Missing environment variables',
          debug: debugInfo
        })
      };
    }

    // Intentar conexión
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
      .base(process.env.AIRTABLE_BASE_ID);

    const records = await base('Requerimientos').select({
      maxRecords: 1
    }).firstPage();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Connection successful',
        recordCount: records.length,
        debug: debugInfo
      })
    };
  } catch (error) {
    return {
      statusCode: 200, // Cambiado a 200 para ver el error
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.error,
        statusCode: error.statusCode,
        stack: error.stack
      })
    };
  }
};
const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Verificar variables de entorno
    const hasApiKey = !!process.env.AIRTABLE_API_KEY;
    const hasBaseId = !!process.env.AIRTABLE_BASE_ID;
    
    console.log('Environment check:', {
      hasApiKey,
      hasBaseId,
      apiKeyLength: process.env.AIRTABLE_API_KEY ? process.env.AIRTABLE_API_KEY.length : 0,
      baseIdLength: process.env.AIRTABLE_BASE_ID ? process.env.AIRTABLE_BASE_ID.length : 0
    });

    if (!hasApiKey || !hasBaseId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Missing environment variables',
          hasApiKey,
          hasBaseId
        })
      };
    }

    // Intentar conexión
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
      .base(process.env.AIRTABLE_BASE_ID);

    // Intentar leer un registro para verificar permisos
    const records = await base('Requerimientos').select({
      maxRecords: 1
    }).firstPage();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Connection successful',
        recordCount: records.length
      })
    };
  } catch (error) {
    console.error('Connection error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        errorType: error.error,
        statusCode: error.statusCode
      })
    };
  }
};
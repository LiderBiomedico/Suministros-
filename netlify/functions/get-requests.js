const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Manejar preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Verificar variables de entorno
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable configuration');
    }

    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
      .base(process.env.AIRTABLE_BASE_ID);

    const records = [];
    
    // Obtener todos los registros de la tabla
    await base('Requerimientos').select({
      view: "Grid view" // O el nombre de tu vista por defecto
    }).eachPage((pageRecords, fetchNextPage) => {
      pageRecords.forEach(record => {
        records.push({
          id: record.id,
          ...record.fields
        });
      });
      fetchNextPage();
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        records: records
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message,
        records: []
      })
    };
  }
};
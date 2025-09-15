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

  // Verificar que sea POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Verificar variables de entorno
    if (!process.env.AIRTABLE_API_KEY || !process.env.AIRTABLE_BASE_ID) {
      throw new Error('Missing Airtable configuration');
    }

    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
      .base(process.env.AIRTABLE_BASE_ID);

    // Parsear datos del request
    const formData = JSON.parse(event.body);
    
    // Crear registro en Airtable
    const createdRecord = await base('Requerimientos').create([
      {
        fields: {
          'Servicio': formData.servicio,
          'Solicitante': formData.solicitante,
          'Cargo': formData.cargo,
          'Email': formData.email,
          'Telefono': formData.telefono || '',
          'Fecha': formData.fecha,
          'Justificacion': formData.justificacion,
          'Items': JSON.stringify(formData.items), // Convertir array a JSON string
          'Estado': 'Pendiente' // Estado inicial
        }
      }
    ]);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Solicitud enviada correctamente',
        recordId: createdRecord[0].id
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
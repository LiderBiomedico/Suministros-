// Archivo: netlify/functions/check-env.js

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Listar todas las variables de entorno que empiezan con AIRTABLE
  const airtableVars = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (key.includes('AIRTABLE')) {
      airtableVars[key] = value ? `${value.substring(0, 7)}...` : 'undefined';
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Environment variables check',
      airtableVars: airtableVars,
      hasApiKey: !!process.env.AIRTABLE_API_KEY,
      hasBaseId: !!process.env.AIRTABLE_BASE_ID,
      nodeVersion: process.version,
      platform: process.platform,
      suggestion: Object.keys(airtableVars).length === 0 
        ? 'No AIRTABLE variables found. Please add them in Netlify settings and redeploy.'
        : 'Variables found. Check if they are correctly named and have valid values.'
    })
  };
};
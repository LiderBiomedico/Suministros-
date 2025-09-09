const Airtable = require('airtable');

exports.handler = async (event, context) => {
  const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY})
    .base(process.env.AIRTABLE_BASE_ID);

  try {
    const data = JSON.parse(event.body);
    
    const record = await base('Requerimientos').create([
      {
        fields: data
      }
    ]);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, record })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
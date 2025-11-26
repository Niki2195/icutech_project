const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    if(event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const body = JSON.parse(event.body || '{}');
    const payloadXml = body.payloadXml || '';
    if(!payloadXml) return { statusCode: 400, body: 'Missing payloadXml' };

    const target = 'http://isapi.mekashron.com/icu-tech/icutech-test.dll';

    const res = await fetch(target, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': body.action || ''
      },
      body: payloadXml,
      timeout: 15000
    });

    const text = await res.text();

    return {
      statusCode: res.status || 200,
      headers: { 'Content-Type': 'text/plain' },
      body: text
    };
  } catch(err) {
    return { statusCode: 500, body: 'Proxy error: ' + err.message };
  }
};

// netlify/functions/yahoo.js
// Serverside proxy for Yahoo Finance - bypasses CORS completely
// Called by dashboard as: /.netlify/functions/yahoo?symbol=SPY&range=5d

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type':                 'application/json',
  };

  try {
    const params   = event.queryStringParameters || {};
    const symbol   = encodeURIComponent(params.symbol || 'SPY');
    const range    = params.range    || '5d';
    const interval = params.interval || '1d';

    const url = 'https://query1.finance.yahoo.com/v8/finance/chart/' +
      symbol + '?interval=' + interval + '&range=' + range;

    const fetch = (await import('node-fetch')).default;
    const r     = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept':     'application/json',
      }
    });

    if (!r.ok) {
      return {
        statusCode: r.status,
        headers,
        body: JSON.stringify({ error: 'Yahoo error: ' + r.status }),
      };
    }

    const data = await r.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data),
    };

  } catch(e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: e.message }),
    };
  }
};

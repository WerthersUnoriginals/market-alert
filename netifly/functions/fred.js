// netlify/functions/fred.js
// Serverside proxy for FRED API - bypasses CORS completely
// Called by dashboard as: /.netlify/functions/fred?series=T10Y2Y&limit=5

const FRED_KEY = 'e69a9af003236d23e5262222fea32062';
const FRED_BASE = 'https://api.stlouisfed.org/fred/series/observations';

exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type':                 'application/json',
  };

  try {
    const params  = event.queryStringParameters || {};
    const series  = params.series  || 'T10Y2Y';
    const limit   = params.limit   || '5';
    const start   = params.start   || '';
    const freq    = params.freq    || '';
    const order   = params.order   || 'desc';

    let url = FRED_BASE +
      '?series_id='  + series +
      '&api_key='    + FRED_KEY +
      '&file_type=json' +
      '&sort_order=' + order +
      '&limit='      + limit;

    if (start) url += '&observation_start=' + start;
    if (freq)  url += '&frequency='         + freq;

    const fetch = (await import('node-fetch')).default;
    const r     = await fetch(url);

    if (!r.ok) {
      return {
        statusCode: r.status,
        headers,
        body: JSON.stringify({ error: 'FRED error: ' + r.status }),
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

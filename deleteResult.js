const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const { userName, category, title } = JSON.parse(event.body);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    await client.query(
      'DELETE FROM quiz_results WHERE user_name = $1 AND quiz_category = $2 AND quiz_title = $3',
      [userName, category, title]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Result deleted successfully' })
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.end();
  }
};
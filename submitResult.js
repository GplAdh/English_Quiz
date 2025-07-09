const { Client } = require('pg');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const data = JSON.parse(event.body);
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    await client.connect();
    const query = `
      INSERT INTO quiz_results (user_name, quiz_category, quiz_title, score, total_questions, time_taken, answers)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    await client.query(query, [
      data.userName,
      data.category,
      data.title,
      data.score,
      data.total,
      data.timeTaken,
      JSON.stringify(data.answers)
    ]);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Result saved successfully' })
    };
  } catch (err) {
    return { statusCode: 500, body: err.toString() };
  } finally {
    await client.end();
  }
};
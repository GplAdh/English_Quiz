const { Client } = require('pg');

exports.handler = async function(event, context) {
    // Only allow GET requests
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const client = new Client({
        connectionString: process.env.NEON_DB_CONNECTION_STRING,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        const result = await client.query('SELECT userName, quizCategory, quizTitle, score, totalQuestions, timeTaken, timestamp FROM quiz_results ORDER BY timestamp DESC');
        const quizResults = result.rows;

        return {
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(quizResults),
        };
    } catch (error) {
        console.error("Database error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch quiz results", error: error.message }),
        };
    } finally {
        await client.end(); // Close the database connection
    }
};
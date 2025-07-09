const { Client } = require('pg');

exports.handler = async function(event, context) {
    // Only allow POST requests
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const client = new Client({
        // Connection string from Neon (will be set as an environment variable in Netlify)
        connectionString: process.env.NEON_DB_CONNECTION_STRING, 
        ssl: {
            // Required for secure connection to Neon
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        const data = JSON.parse(event.body);

        // Basic validation
        if (!data.userName || !data.quizCategory || !data.quizTitle || data.score === undefined || data.totalQuestions === undefined || data.timeTaken === undefined) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
        }

        const query = `
            INSERT INTO quiz_results (userName, quizCategory, quizTitle, score, totalQuestions, timeTaken)
            VALUES ($1, $2, $3, $4, $5, $6)
        `;
        const values = [
            data.userName,
            data.quizCategory,
            data.quizTitle,
            data.score,
            data.totalQuestions,
            data.timeTaken
        ];

        await client.query(query, values);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Quiz result saved successfully!" }),
        };
    } catch (error) {
        console.error("Database error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to save quiz result", error: error.message }),
        };
    } finally {
        await client.end(); // Close the database connection
    }
};
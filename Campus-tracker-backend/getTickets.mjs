import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // Create the command to scan (read all items) from the table
        const command = new ScanCommand({
            TableName: "campus-tickets-table" // Your exact table name
        });

        // Fetch data from DynamoDB
        const response = await dynamo.send(command);

        // Return the data to the frontend
        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                // These CORS headers are important for when we build the frontend!
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                message: "Tickets retrieved successfully",
                tickets: response.Items // This contains the array of tickets
            })
        };

    } catch (error) {
        console.error("Error fetching tickets:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch tickets", error: error.message })
        };
    }
};
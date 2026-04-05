import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const command = new ScanCommand({
            TableName: "campus-tickets-table" // Your exact table name
        });

        const response = await dynamo.send(command);

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                // These CORS headers are important for when we build the frontend!
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                message: "Tickets retrieved successfully",
                tickets: response.Items 
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
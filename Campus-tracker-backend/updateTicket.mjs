import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        // API Gateway passes the path parameter (the ticketId) in event.pathParameters
        const ticketId = event.pathParameters.ticketId;
        
        // API Gateway passes the new data in the body
        const body = JSON.parse(event.body);
        const newStatus = body.status; // e.g., "RESOLVED"

        // Create the command to update the specific item in DynamoDB
        const command = new UpdateCommand({
            TableName: "campus-tickets-table",
            Key: {
                ticketId: ticketId // This tells DynamoDB exactly which row to update
            },
            // This tells DynamoDB which column to change, and what value to use
            UpdateExpression: "set #status = :s",
            ExpressionAttributeNames: {
                "#status": "status" // 'status' is a reserved word in DynamoDB, so we map it to #status
            },
            ExpressionAttributeValues: {
                ":s": newStatus
            },
            // Return the updated item so we can send it back to the frontend
            ReturnValues: "ALL_NEW" 
        });

        // Send the command to DynamoDB
        const response = await dynamo.send(command);

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                message: "Ticket updated successfully",
                ticket: response.Attributes
            })
        };

    } catch (error) {
        console.error("Error updating ticket:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to update ticket", error: error.message })
        };
    }
};
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        
        const ticketId = event.pathParameters.ticketId;
        
        
        const body = JSON.parse(event.body);
        const newStatus = body.status; // e.g., "RESOLVED"

    
        const command = new UpdateCommand({
            TableName: "campus-tickets-table",
            Key: {
                ticketId: ticketId 
            },
            
            UpdateExpression: "set #status = :s",
            ExpressionAttributeNames: {
                "#status": "status" 
            },
            ExpressionAttributeValues: {
                ":s": newStatus
            },
            
            ReturnValues: "ALL_NEW" 
        });

        
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
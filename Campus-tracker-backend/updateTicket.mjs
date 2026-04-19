import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        
        const ticketId = event.pathParameters.ticketId;
        
        
        const body = JSON.parse(event.body);
        const newStatus = body.status; // e.g., "RESOLVED"
        const resolvedImageUrl = body.resolvedImageUrl || null;
        const adminComments = body.adminComments || null;

        let updateExpression = "set #status = :s";
        const expressionAttributeNames = { "#status": "status" };
        const expressionAttributeValues = { ":s": newStatus };

        if (resolvedImageUrl !== null) {
            updateExpression += ", resolvedImageUrl = :ri";
            expressionAttributeValues[":ri"] = resolvedImageUrl;
        }

        if (adminComments !== null) {
            updateExpression += ", adminComments = :ac";
            expressionAttributeValues[":ac"] = adminComments;
        }

        if (newStatus === "RESOLVED") {
            updateExpression += ", resolvedAt = :ra";
            expressionAttributeValues[":ra"] = new Date().toISOString();
        }

        const command = new UpdateCommand({
            TableName: "campus-tickets-table",
            Key: {
                ticketId: ticketId 
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
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
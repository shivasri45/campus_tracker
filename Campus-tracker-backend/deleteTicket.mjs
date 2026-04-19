import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const ticketId = event.pathParameters.ticketId;

        let deletionReason = "";
        if (event.body) {
            const body = JSON.parse(event.body);
            deletionReason = body.reason || "";
        }

        await dynamo.send(new UpdateCommand({
            TableName: "campus-tickets-table",
            Key: { ticketId: ticketId },
            UpdateExpression: "set #status = :s, deletionReason = :r, deletedAt = :da",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":s": "DELETED",
                ":r": deletionReason,
                ":da": new Date().toISOString()
            }
        }));

        return {
            statusCode: 200,
            headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Ticket deleted successfully!" })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Failed to delete ticket", error: error.message })
        };
    }
};
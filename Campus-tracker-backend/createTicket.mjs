import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const client = new DynamoDBClient({});
const dynamo = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const body = JSON.parse(event.body);
        const ticketId = crypto.randomUUID();
        
        const newTicket = {
            ticketId: ticketId,
            studentName: body.studentName,       // <--- NEW
            userEmail: body.userEmail,
            rollNo: body.rollNo,                 // <--- NEW
            title: body.title,                   
            description: body.description,       
            category: body.category,             
            status: "OPEN",                      
            createdAt: new Date().toISOString(),
            imageUrl: body.imageUrl              
        };

        const command = new PutCommand({
            TableName: "campus-tickets-table",
            Item: newTicket
        });

        await dynamo.send(command);

        return {
            statusCode: 201,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({ message: "Ticket created successfully!", ticket: newTicket })
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
            body: JSON.stringify({ message: "Failed to create ticket", error: error.message })
        };
    }
};
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3 = new S3Client({});
const BUCKET_NAME = "campus-tracker-images-bucket";

export const handler = async (event) => {
    try {
        // Generate a random file name for the image
        const imageId = crypto.randomUUID();
        const fileName = `${imageId}.jpg`; 

        // Create the command that the frontend will eventually execute
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: fileName,
            ContentType: "image/jpeg" // We expect a jpeg image
        });

        // Generate the secure URL (expires in 5 minutes / 300 seconds)
        const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

        // The URL where the image will permanently live after upload
        const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${fileName}`;

        return {
            statusCode: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            },
            body: JSON.stringify({
                uploadUrl: uploadUrl, // Frontend uses this to upload
                imageUrl: imageUrl    // Frontend saves this to the database
            })
        };

    } catch (error) {
        console.error("Error generating URL:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to generate URL", error: error.message })
        };
    }
};
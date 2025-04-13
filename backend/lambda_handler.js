const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { CloudFrontClient, CreateInvalidationCommand } = require('@aws-sdk/client-cloudfront');
const fs = require('fs').promises;
const path = require('path');

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const cloudFrontClient = new CloudFrontClient({ region: process.env.AWS_REGION });

async function uploadToS3(content, bucket, key) {
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: content,
        ContentType: 'application/json'
    });
    await s3Client.send(command);
}

async function invalidateCloudFront(distributionId, paths) {
    const command = new CreateInvalidationCommand({
        DistributionId: distributionId,
        InvalidationBatch: {
            Paths: {
                Quantity: paths.length,
                Items: paths
            },
            CallerReference: Date.now().toString()
        }
    });
    await cloudFrontClient.send(command);
}

exports.handler = async (event) => {
    try {
        const main = require('./main');
        
        await main.run();
        
        const jsonContent = await fs.readFile('/tmp/news.json', 'utf8');
        
        const s3response = await uploadToS3(
            jsonContent,
            process.env.S3_BUCKET_NAME,
            'news.json'
        );
        console.log('S3 response:', s3response);
        
        const cloudFrontResponse = await invalidateCloudFront(
            process.env.CLOUDFRONT_DISTRIBUTION_ID,
            ['/news.json']
        );
        console.log('CloudFront response:', cloudFrontResponse);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully updated news and invalidated cache'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing news update',
                error: error.message
            })
        };
    }
}; 

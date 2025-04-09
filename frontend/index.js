const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const cloudfront = new AWS.CloudFront();
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const execAsync = promisify(exec);
const copyFileAsync = promisify(fs.copyFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

exports.handler = async (event) => {
    try {
        console.log('Starting deployment process...');
        
        // Step 1: Run main.js from the backend directory
        console.log('Running main.js from backend directory...');
        const { stdout, stderr } = await execAsync('node main.js', { cwd: path.resolve(__dirname, './backend') });
        if (stderr) console.error('Error running main.js:', stderr);
        console.log('main.js output:', stdout);
        
        // Step 2: Copy news.json from backend to frontend directory
        console.log('Copying news.json from backend to frontend...');
        await copyFileAsync(
            path.resolve(__dirname, './backend/news.json'),
            path.resolve(__dirname, './frontend/news.json')
        );
        console.log('news.json copied successfully');
        
        // Step 3: Run npm run build in frontend directory
        console.log('Running npm run build in frontend directory...');
        const buildResult = await execAsync('npm run build', { cwd: path.resolve(__dirname, './frontend') });
        console.log('Build output:', buildResult.stdout);
        if (buildResult.stderr) console.error('Build errors:', buildResult.stderr);
        
        // Step 4: Sync frontend/out with S3 bucket
        console.log('Syncing frontend/out with S3 bucket...');
        const outDir = path.resolve(__dirname, './frontend/out');
        
        // Function to recursively upload files to S3
        async function uploadDirToS3(dirPath, s3Prefix = '') {
            const files = await readdirAsync(dirPath);
            
            for (const file of files) {
                const filePath = path.join(dirPath, file);
                const stats = await statAsync(filePath);
                
                if (stats.isDirectory()) {
                    // Recursively upload subdirectories
                    await uploadDirToS3(filePath, `${s3Prefix}${file}/`);
                } else {
                    // Upload file to S3
                    const fileContent = fs.readFileSync(filePath);
                    const s3Key = `${s3Prefix}${file}`;
                    
                    await s3.putObject({
                        Bucket: S3_BUCKET,
                        Key: s3Key,
                        Body: fileContent,
                        ContentType: getContentType(file)
                    }).promise();
                    
                    console.log(`Uploaded: ${s3Key}`);
                }
            }
        }
        
        // Helper function to determine content type
        function getContentType(filename) {
            const ext = path.extname(filename).toLowerCase();
            const contentTypes = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'application/javascript',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.eot': 'application/vnd.ms-fontobject',
                '.otf': 'font/otf',
                '.xml': 'application/xml',
                '.txt': 'text/plain'
            };
            
            return contentTypes[ext] || 'application/octet-stream';
        }
        
        // Upload the out directory to S3
        await uploadDirToS3(outDir);
        
        // Invalidate CloudFront cache
        console.log('Invalidating CloudFront cache...');
        await cloudfront.createInvalidation({
            DistributionId: CLOUDFRONT_DISTRIBUTION_ID,
            InvalidationBatch: {
                Paths: {
                    Quantity: 1,
                    Items: ['/*']
                },
                CallerReference: `invalidate-${Date.now()}`
            }
        }).promise();
        
        console.log('Deployment completed successfully');
        return { status: 'Success', message: 'Deployment completed successfully' };
    } catch (error) {
        console.error('Deployment failed:', error);
        return { status: 'Error', error: error.message };
    }
};
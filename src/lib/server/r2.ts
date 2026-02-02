import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID, R2_PUBLIC_URL } from '$env/static/private';
import { getRandomHeaders } from './headers';

const R2 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY
    }
});

/**
 * Uploads an image from a URL to Cloudflare R2 and returns the public URL.
 * @param imageUrl The source URL of the image
 * @param key The destination key (filename) in the bucket
 */
export async function uploadImageToR2(imageUrl: string, key: string): Promise<string> {
    try {
        const response = await fetch(imageUrl, {
            headers: getRandomHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const contentType = response.headers.get('content-type') || 'image/jpeg';

        await R2.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));

        const publicUrl = (R2_PUBLIC_URL ?? '').endsWith('/') ? R2_PUBLIC_URL : `${R2_PUBLIC_URL}/`;
        return `${publicUrl}${key}`;

    } catch (error) {
        console.error('Error uploading to R2:', error);
        throw error;
    }
}

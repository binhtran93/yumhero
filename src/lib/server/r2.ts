import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ACCOUNT_ID, R2_PUBLIC_URL } from '$env/static/private';
import { getRandomHeaders } from './headers';
import { SignatureV4 } from '@smithy/signature-v4';
import { HttpRequest } from '@smithy/protocol-http';
import { Hash } from '@smithy/hash-node';

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

const R2_HOST = `${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

function getPublicBaseUrl(): string {
    return (R2_PUBLIC_URL ?? '').endsWith('/') ? (R2_PUBLIC_URL ?? '') : `${R2_PUBLIC_URL}/`;
}

type QueryValue = string | string[] | null | undefined;
type PresignedHttpRequestLike = {
    protocol: string;
    hostname: string;
    port?: number;
    path: string;
    query?: Record<string, QueryValue>;
};

function toUrlString(request: PresignedHttpRequestLike): string {
    const base = `${request.protocol}//${request.hostname}${request.port ? `:${request.port}` : ''}${request.path}`;
    const url = new URL(base);

    if (request.query) {
        for (const [key, value] of Object.entries(request.query)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    url.searchParams.append(key, item);
                }
            } else if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        }
    }

    return url.toString();
}

function encodeR2Key(key: string): string {
    return key.split('/').map(encodeURIComponent).join('/');
}

export type PresignedR2Upload = {
    uploadUrl: string;
    publicUrl: string;
    method: 'PUT';
    headers: Record<string, string>;
    key: string;
};

export async function createPresignedR2Upload(
    key: string,
    contentType: string,
    expiresInSeconds = 300
): Promise<PresignedR2Upload> {
    const signer = new SignatureV4({
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY
        },
        region: 'auto',
        service: 's3',
        sha256: Hash.bind(null, 'sha256')
    });

    const encodedKey = encodeR2Key(key);
    const request = new HttpRequest({
        protocol: 'https:',
        hostname: R2_HOST,
        method: 'PUT',
        path: `/${R2_BUCKET_NAME}/${encodedKey}`,
        headers: {
            host: R2_HOST,
            'content-type': contentType
        }
    });

    const presignedRequest = await signer.presign(request, {
        expiresIn: expiresInSeconds
    });

    const publicUrl = `${getPublicBaseUrl()}${key}`;

    return {
        uploadUrl: toUrlString(presignedRequest),
        publicUrl,
        method: 'PUT',
        headers: {
            'Content-Type': contentType
        },
        key
    };
}

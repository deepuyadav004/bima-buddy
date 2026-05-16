import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
} from "@azure/storage-blob";

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER ?? "uploads";

if (!connectionString) {
  throw new Error("AZURE_STORAGE_CONNECTION_STRING is not set");
}

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
export const containerClient = blobServiceClient.getContainerClient(containerName);

// Parse account name + key from connection string for SAS URL signing
const accountMatch = /AccountName=([^;]+)/.exec(connectionString);
const keyMatch = /AccountKey=([^;]+)/.exec(connectionString);
const accountName = accountMatch?.[1];
const accountKey = keyMatch?.[1];

if (!accountName || !accountKey) {
  throw new Error(
    "Could not parse AccountName/AccountKey from AZURE_STORAGE_CONNECTION_STRING"
  );
}

const sharedKeyCredential = new StorageSharedKeyCredential(
  accountName,
  accountKey
);

export interface UploadResult {
  blobPath: string; // path inside the container
  contentType: string;
  sizeBytes: number;
}

/**
 * Upload a File to Azure Blob Storage.
 * Returns the blob path (relative to container).
 */
export async function uploadFileToBlob(
  file: File,
  blobPath: string
): Promise<UploadResult> {
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);
  const arrayBuffer = await file.arrayBuffer();
  await blockBlobClient.uploadData(Buffer.from(arrayBuffer), {
    blobHTTPHeaders: { blobContentType: file.type || "application/octet-stream" },
  });
  return {
    blobPath,
    contentType: file.type,
    sizeBytes: file.size,
  };
}

/**
 * Generate a short-lived (default: 1 hour) SAS read URL for a blob.
 * Used to let admins / users download their own docs without exposing storage keys.
 */
export function getReadSasUrl(blobPath: string, ttlMinutes = 60): string {
  const expiresOn = new Date(Date.now() + ttlMinutes * 60 * 1000);
  const sas = generateBlobSASQueryParameters(
    {
      containerName,
      blobName: blobPath,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
      protocol: undefined,
    },
    sharedKeyCredential
  ).toString();
  const blobClient = containerClient.getBlobClient(blobPath);
  return `${blobClient.url}?${sas}`;
}

/**
 * Ensure container exists. Call once at app startup or on first upload.
 * Safe to call repeatedly.
 */
export async function ensureContainer() {
  await containerClient.createIfNotExists();
}

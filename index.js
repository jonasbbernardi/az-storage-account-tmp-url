const crypto = require('crypto');

const generateSasUrl = (
  accountName,
  accountKey,
  containerName,
  blobName
) => {
  const permissions = 'r';
  const expiryTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobName}`;
  const stringToSign = `${permissions}\n\n${expiryTime}\n${canonicalizedResource}\n\n\n\n\n\n\n\n\n\n`;
  const decodedKey = Buffer.from(accountKey, 'base64');
  const signature = crypto.createHmac('sha256', decodedKey)
                          .update(stringToSign)
                          .digest('base64');
  const encodedSignature = encodeURIComponent(signature);
  const sasToken = `sv=2020-08-04&ss=b&srt=sco&sp=${permissions}&se=${expiryTime}&sr=b&sig=${encodedSignature}`;
  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
}

const accountName = 'myStorageAccount';
const containerName = 'myContainer';
const accountKey = 'myAccountKey';
const blobName = 'myFile.txt';

const sasUrl = generateSasUrl(
  accountName,
  containerName,
  accountKey,
  blobName
)

console.log(`SAS URL: ${sasUrl}`);
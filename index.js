const crypto = require('crypto');
const moment = require('moment');
require('dotenv').config();

const getEnvironmentVariables = () => {
  return {
    permissions:    'r',
    protocol:       'https',
    signedResource: 'b',
    signedVersion:  '2024-11-04',
    expiryTime:     moment().add(5, 'minutes').format('YYYY-MM-DDTHH:mm:ss[Z]'),
    accountName:    process.env.STORAGE_ACCOUNT_NAME,
    accountKey:     process.env.STORAGE_ACCOUNT_KEY,
    containerName:  process.env.CONTAINER_NAME,
    blobName:       process.env.BLOB_FILE_NAME,
  };
}

const montStringToSign = (vars, canonicalizedResource) => {
  const {
    permissions,
    expiryTime,
    protocol,
    signedVersion,
    signedResource
  } = vars;
  
  let stringToSign = permissions + "\n"; // signedPermissions
  stringToSign += "\n"; // signedStart
  stringToSign += expiryTime + "\n"; // signedExpiry
  stringToSign += canonicalizedResource + "\n"; // canonicalizedResource
  stringToSign += "\n"; // signedIdentifier
  stringToSign += "\n"; // signedIP
  stringToSign += protocol + "\n"; // signedProtocol
  stringToSign += signedVersion + "\n"; // signedVersion
  stringToSign += signedResource + "\n"; // signedResource
  stringToSign += "\n"; // signedSnapshotTime
  stringToSign += "\n"; // signedEncryptionScope
  stringToSign += "\n"; // rscc
  stringToSign += "\n"; // rscd
  stringToSign += "\n"; // rsce
  stringToSign += "\n"; // rscl
  stringToSign += ""; // rsct

  return stringToSign;
}

const decodeSignature = (accountKey, stringToSign) => {
  const decodedKey = Buffer.from(accountKey, 'base64');
  const signature = crypto.createHmac('sha256', decodedKey)
                          .update(stringToSign)
                          .digest('base64');
  return encodeURIComponent(signature);
}

const mountUrlQueryParameters = (vars, signature) => {
  let parameters = "sv="   + vars.signedVersion;
  parameters    += "&spr=" + vars.protocol;
  parameters    += "&sp="  + vars.permissions;
  parameters    += "&se="  + vars.expiryTime;
  parameters    += "&sr="  + vars.signedResource;
  parameters    += "&sig=" + signature;
  return parameters;
}

const generateSasUrl = () => {
  const vars = getEnvironmentVariables();
  const {
    accountName,
    accountKey,
    containerName,
    blobName
  } = vars;

  const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobName}`;
  const stringToSign = montStringToSign(vars, canonicalizedResource);
  const signature = decodeSignature(accountKey, stringToSign);
  const parameters = mountUrlQueryParameters(vars, signature);

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${parameters}`;
}

const sasUrl = generateSasUrl();

console.log(`SAS URL: ${sasUrl}`);
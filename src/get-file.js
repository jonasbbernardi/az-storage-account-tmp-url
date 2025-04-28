const crypto = require('crypto');
const { getEnvironmentVariablesForGet } = require('./envs');
require('dotenv').config();

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
  const vars = getEnvironmentVariablesForGet();
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
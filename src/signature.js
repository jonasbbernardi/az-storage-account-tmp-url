const crypto = require('crypto');

const montStringToSign = (vars, canonicalizedResource) => {
  const {
    permissions,
    now,
    expiryTime,
    protocol,
    signedVersion,
    signedResource,
  } = vars;

  let stringToSign = [
    permissions, // signedPermissions
    now,         // signedStart
    expiryTime,  // signedExpiry
    canonicalizedResource, // canonicalizedResource
    '', // signedIdentifier
    '', // signedIP
    protocol, // signedProtocol
    signedVersion, // signedVersion
    signedResource, // signedResource
    '', // signedSnapshotTime
    '', // signedEncryptionScope
    '', // rscc
    '', // rscd
    '', // rsce
    '', // rscl
    '', // rsct
  ].join("\n");

  return stringToSign;
}

const decodeSignature = (accountKey, stringToSign) => {
  if (!accountKey || !stringToSign) {
    throw new Error('accountKey and stringToSign must be provided');
  }

  const decodedKey = Buffer.from(accountKey, 'base64');
  const signature = crypto.createHmac('sha256', decodedKey)
                          .update(stringToSign)
                          .digest('base64');

  return signature;
}

const generateSas = (vars) => {
  const {
    accountName,
    accountKey,
    containerName,
    blobName,
    signedVersion,
    protocol,
    signedResource,
    expiryTime,
    permissions,
    now
  } = vars;

  const canonicalizedResource = `/blob/${accountName}/${containerName}/${blobName}`;
  const stringToSign = montStringToSign(vars, canonicalizedResource);
  const signature = decodeSignature(accountKey, stringToSign);

  const sasToken = new URLSearchParams({
    sv: signedVersion,
    spr: protocol,
    sr: signedResource,
    sig: signature,
    se: expiryTime,
    sp: permissions,
    st: now,
  });

  return {
    signature,
    token: sasToken.toString()
  };
}

module.exports = {generateSas};
const moment = require('moment');
require('dotenv').config();

const formatAzureTime = (offsetMinutes = 0) => {
  return moment().add(offsetMinutes, 'minutes').utc().format('YYYY-MM-DDTHH:mm:ss[Z]');
};

const validateEnvironmentVariables = (additionalVars = []) => {
  const requiredVars = [
    'STORAGE_ACCOUNT_NAME',
    'STORAGE_ACCOUNT_KEY',
    'CONTAINER_NAME',
    'BLOB_FILE_NAME',
    ...additionalVars
  ];

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      throw new Error(`Missing environment variable: ${varName}`);
    }
  });
}

const getDefaultEnvironmentVariables = () => {
  const {
    STORAGE_ACCOUNT_NAME: accountName,
    STORAGE_ACCOUNT_KEY:  accountKey,
    CONTAINER_NAME:       containerName,
    BLOB_FILE_NAME:       blobName,
  } = process.env;
  
  const now = formatAzureTime(-1);
  const expiryTime = formatAzureTime(5);

  const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}`;

  return {
    protocol:       'https',
    signedResource: 'b',
    signedVersion:  '2024-11-04',
    now,
    expiryTime,
    accountName,
    accountKey,
    containerName,
    blobName,
    blobUrl,
  };

}

const getEnvironmentVariablesForGet = () => {
  validateEnvironmentVariables();
  const vars = getDefaultEnvironmentVariables();

  return {
    permissions:    'r',
    ...vars
  }
}

const getEnvironmentVariablesForPut = () => {
  validateEnvironmentVariables(['SOURCE_URL']);
  const vars = getDefaultEnvironmentVariables();

  return {
    permissions: 'rcw',
    ...vars,
    sourceUrl: process.env.SOURCE_URL
  }
}

module.exports = {
  getEnvironmentVariablesForGet,
  getEnvironmentVariablesForPut
}
const axios = require('axios');
const { getEnvironmentVariablesForPut } = require('./envs');
const { generateSas } = require('./signature');

const putFileFromUrl = async () => {
  try {
    const vars = getEnvironmentVariablesForPut();
    const sas = generateSas(vars);
    const blobUrl = `${vars.blobUrl}?${sas.token}`;

    const response = await axios.put(blobUrl, null, {
      headers: {
        'x-ms-copy-source': vars.sourceUrl,
        'x-ms-version': vars.signedVersion,
        'x-ms-blob-type': 'BlockBlob',
      }
    });

    console.log('Copy initiated:', response.status);
    console.log(response.headers);
  } catch (error) {
    const errorData = error.response?.data ?? error.request?.data ?? error.message;
    throw Error(errorData);
  }
}

module.exports = {putFileFromUrl};
const { getEnvironmentVariablesForGet } = require('./envs');
const { generateSas } = require('./signature');
require('dotenv').config();

const generateSasUrl = () => {
  const vars = getEnvironmentVariablesForGet();
  const sas = generateSas(vars);
  const sasUrl = `${vars.blobUrl}?${sas.token}`;
  return sasUrl;
}

module.exports = {generateSasUrl};

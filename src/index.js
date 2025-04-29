const { generateSasUrl } = require("./get-file");

const testSasToken = async () => {
  const sasUrl = generateSasUrl();
  console.log(`SAS URL: ${sasUrl}`);
}

testSasToken();
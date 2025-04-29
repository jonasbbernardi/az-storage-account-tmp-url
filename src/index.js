const { generateSasUrl } = require("./get-file");
const { putFileFromUrl } = require("./put-file");

const testSasToken = async () => {
  await putFileFromUrl();
  const sasUrl = generateSasUrl();
  console.log(`SAS URL: ${sasUrl}`);
}

testSasToken();
<?php

function generateSasUrl(
    $accountName,
    $accountKey,
    $containerName,
    $blobName
) {
    $permissions = 'r';
    $expiryTime = (new DateTime('+5 minutes'))->format('Y-m-d\TH:i:s\Z');
    $canonicalizedResource = sprintf(
        "/blob/%s/%s/%s",
        $accountName,
        $containerName,
        $blobName
    );
    $stringToSign = sprintf(
        "%s\n\n%s\n%s\n\n\n\n\n\n\n\n\n\n",
        $permissions,
        $expiryTime,
        $canonicalizedResource
    );
    $decodedKey = base64_decode($accountKey);
    $signature = hash_hmac('sha256', $stringToSign, $decodedKey, true);
    $signature = base64_encode($signature);
    $sasToken = sprintf(
        "sv=2020-08-04&ss=b&srt=sco&sp=%s&se=%s&sr=b&sig=%s",
        $permissions,
        $expiryTime,
        urlencode($signature)
    );
    $url = sprintf(
        "https://%s.blob.core.windows.net/%s/%s?%s",
        $accountName,
        $containerName,
        $blobName,
        $sasToken
    );

    return $url;
}

$accountName = 'myStorageAccount';
$containerName = 'myContainer';
$accountKey = 'myAccountKey';
$blobName = 'myFile.txt';

$sasUrl = generateSasUrl(
  $accountName,
  $accountKey,
  $containerName,
  $blobName
)
echo "SAS URL: $sasUrl";

?>

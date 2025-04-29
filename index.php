<?php

date_default_timezone_set('UTC');

function getEnvironmentVariables() {
    $env = parse_ini_file('.env');
    return [
        'permissions'    => 'r',
        'protocol'       => 'https',
        'signedResource' => 'b',
        'signedVersion'  => '2024-11-04',
        'startTime'      => (new DateTime())->format('Y-m-d\TH:i:s\Z'),
        'expiryTime'     => (new DateTime('+5 minutes'))->format('Y-m-d\TH:i:s\Z'),
        'accountName'    => $env['STORAGE_ACCOUNT_NAME'],
        'accountKey'     => $env['STORAGE_ACCOUNT_KEY'],
        'containerName'  => $env['CONTAINER_NAME'],
        'blobName'       => $env['BLOB_FILE_NAME']
    ];
}

function mountCaononicalizedResource($vars) {
    return sprintf(
        "/blob/%s/%s/%s",
        $vars['accountName'],
        $vars['containerName'],
        $vars['blobName']
    );
}

function mountStringToSign($vars, $canonicalizedResource) {
    $stringToSign = $vars['permissions'] . "\n"; // signedPermissions
    $stringToSign .= $vars['startTime'] . "\n"; // signedStart
    $stringToSign .= $vars['expiryTime'] . "\n"; // signedExpiry
    $stringToSign .= $canonicalizedResource . "\n"; // canonicalizedResource
    $stringToSign .= "\n"; // signedIdentifier
    $stringToSign .= "\n"; // signedIP
    $stringToSign .= $vars['protocol'] . "\n"; // signedProtocol
    $stringToSign .= $vars['signedVersion'] . "\n"; // signedVersion
    $stringToSign .= $vars['signedResource'] . "\n"; // signedResource
    $stringToSign .= "\n"; // signedSnapshotTime
    $stringToSign .= "\n"; // signedEncryptionScope
    $stringToSign .= "\n"; // rscc
    $stringToSign .= "\n"; // rscd
    $stringToSign .= "\n"; // rsce
    $stringToSign .= "\n"; // rscl
    $stringToSign .= ""; // rsct

    return $stringToSign;
}

function decodeSignature($accountKey, $stringToSign) {
    $decodedKey = base64_decode($accountKey);
    $signature = hash_hmac('sha256', $stringToSign, $decodedKey, true);
    $signature = base64_encode($signature);
    return $signature;
}

function mountUrlQueryParameters($vars, $signature) {
    $parameters = "sv=" . $vars['signedVersion'];
    $parameters .= "&spr=" . $vars['protocol'];
    $parameters .= "&sp=" . $vars['permissions'];
    $parameters .= "&st=" . $vars['startTime'];
    $parameters .= "&se=" . $vars['expiryTime'];
    $parameters .= "&sr=" . $vars['signedResource'];
    $parameters .= "&sig=" . urlencode($signature);

    return $parameters;
}

function generateSasUrl() {
    $vars = getEnvironmentVariables();

    $canonicalizedResource = mountCaononicalizedResource($vars);
    $stringToSign = mountStringToSign($vars, $canonicalizedResource);
    $signature = decodeSignature($vars['accountKey'], $stringToSign);
    $parameters = mountUrlQueryParameters($vars, $signature);

    $url = sprintf(
        "https://%s.blob.core.windows.net/%s/%s?%s",
        $vars['accountName'],
        $vars['containerName'],
        $vars['blobName'],
        $parameters
    );

    return $url;
}

$sasUrl = generateSasUrl();

echo "SAS URL: $sasUrl";

?>
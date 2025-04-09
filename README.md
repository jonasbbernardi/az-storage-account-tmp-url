
# Introdution

Code snippet for create temporary URL for Azure Storage Account blob file.

# Steps

1. Canonicalize of blob file, in format `/blob/account/container/file`;
2. Generate string to signature;
3. Decode Account Key to use with string to signature;
4. Encode decoded account key with signature using sha256;
5. Encode url parameters with encoded signature;
6. Concat mounted url for file with url parameters.

# String to Sign

String to sign must follow the format bellow.

```ini
permissions\n
start time\n
expiry time\n
canonicalized resource\n
identifier\n
IP address\n
protocol\n
version\n
cache-control\n
content-disposition\n
content-encoding\n
content-language\n
content-type\n
```

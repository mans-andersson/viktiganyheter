# Creating lambda zip
```
zip -r lambda-package.zip . \
  -x "*.git*" \
  -x "*.env*" \
  -x "*.log" \
  -x "node_modules/@aws-sdk/*"
```

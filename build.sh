aws cloudformation package --s3-bucket  <your_s3_bucket>  --template-file okta-authorizer-cfn.yml --output-template-file packaged-template.yaml --force-upload --profile <your_profile> --region=<your_region>
aws cloudformation deploy --template-file packaged-template.yaml --stack-name authorizer --capabilities CAPABILITY_IAM --profile=<your_profile> --region=<your_region>

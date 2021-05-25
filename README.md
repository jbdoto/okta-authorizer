# Okta Lambda Authorizer

### Background

This project contains a demonstration AWS API Gateway Custom Lambda Authorizer, built to use with Okta.

This function is based on examples from the following info sources:

https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-lambda-authorizer-output.html

https://github.com/awslabs/aws-apigateway-lambda-authorizer-blueprints/tree/master/blueprints

The JWT debugger available here may be useful while working on this function:

https://jwt.io/

### Usage


Register for an Okta account, if you don't have one: https://www.okta.com/free-trial/

Setup an Okta Application, following steps here: https://developer.okta.com/docs/guides/add-an-external-idp/apple/register-app-in-okta/

If you're using an API Services App Integration, you can get an access_token like so:

    curl -X POST 'https://<clientid>:<client-secret>@<okta-domain>/oauth2/default/v1/token' -d grant_type=client_credentials -d scope=someoptionalscope

Then take the returned access_token to call the API served by API GW.

     curl -v -H "Authorization: Bearer <some_token>" "https://<your-api>/"

#### Deploying
You'll need to deploy the lambda to your account, I chose to do this the old school way of zipping up the function:

From within the /src file, do the following:
     
     npm install && zip -r lambdaFunc.zip .

Then, you can use cloudformation to package and deploy the function:

    aws cloudformation package --s3-bucket  <some_bucket>  --template-file authorize-cfn.yml --output-template-file packaged-template.yaml --force-upload --profile <your_profile> --region=<your_region>
    aws cloudformation deploy --template-file ./packaged-template.yaml --stack-name authorizer --capabilities CAPABILITY_IAM --profile=<your_profile>--region=<your_region>

The cloudformation template exports the function arn as an output to be referred by other cloudformation templates.


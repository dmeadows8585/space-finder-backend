import {Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {join} from 'path';
import {GenericTable} from './GenericTable';
import {Function as LambdaFunction, Runtime, Code} from 'aws-cdk-lib/aws-lambda';
import {LambdaIntegration, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {PolicyStatement} from 'aws-cdk-lib/aws-iam'


export class SpaceStack extends Stack {

    private api = new RestApi(this, 'SpaceApi');
    private spacesTable = new GenericTable(
        'SpacesTable',
        'spaceId',
        this,
    );

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const helloLambdaNodeJs = new NodejsFunction(this, 'helloLambdaNodeJs', {
            entry: (join(__dirname, '..', 'services', 'node-lambda', 'hello.ts')),
            handler: 'handler',
        });
        const s3ListPolicy = new PolicyStatement();
        s3ListPolicy.addActions('s3:ListAllMyBuckets');
        s3ListPolicy.addResources('*');
        helloLambdaNodeJs.addToRolePolicy(s3ListPolicy);

        // Hello Api lambda integration:
        const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJs);
        const helloLambdaResource = this.api.root.addResource('hello');
        helloLambdaResource.addMethod('GET', helloLambdaIntegration);
    }
}

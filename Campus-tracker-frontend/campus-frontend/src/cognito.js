import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
    UserPoolId: 'ap-south-1_iE1RA3tKG',
    ClientId: 'u3kdqpjq73rapi0vdon47rcp4'
};

export const userPool = new CognitoUserPool(poolData);
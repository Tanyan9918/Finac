class Plaid{
    userId: string = "";
    client: string = "edit this later"

    async oAuth(userId: string, client: object){
        const request = {
            grant_type: 'urn:ietf:params:oauth:grant-type:token-exchange',
            scope: 'user:read',
            subject_token_type: 'urn:plaid:params:credit:multi-user',
            audience: 'urn:plaid:params:cra-partner:fannie-mae',
            subject_token: userId
        };

        try {
            //const response = await client.oauthToken(request);
        } catch (error) {
        //Put something here later
        }

    }
}
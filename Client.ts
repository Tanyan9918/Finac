import {
    Configuration,
    PlaidApi,
    PlaidEnvironments
} from 'plaid'

const configuration = new Configuration({
    basePath: PlaidEnvironments.sandbox, baseOptions:{
        headers: {
            "PLAID-CLIENT-ID": ProcessingInstruction.env.PLAID_CLIENT_ID!,
            'PLAID_SECRET': ProcessingInstruction.env.PLAID_SECRET!
        }
    }
});

const plaidClient = new PlaidApi(configuration);
export default plaidClient;
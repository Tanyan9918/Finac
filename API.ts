import plaid, {
    ItemPublicTokenExchangeRequest,
    Products,
    AccountsGetRequest,
    LinkTokenCreateRequest,
    TransactionsGetRequest,
    TransactionsRefreshRequest
} from 'plaid';

class APIPlaid{
    public async link_token_create(): Promise<void>{
        // Account filtering isn't required here, but sometimes 
        // it's helpful to see an example. 

        const request: LinkTokenCreateRequest = {
            user: {
                client_user_id: 'user-id',
                phone_number: '+14155550123'
            },
            client_name: 'Personal Finance App',
            products: ['transactions'],
            transactions: {
                days_requested: 730
            },
            country_codes: ['US'],
            language: 'en',
            webhook: 'https://sample-web-hook.com',
            redirect_uri: 'https://domainname.com/oauth-page.html',
            account_filters: {
                depository: {
                    account_subtypes: ['checking', 'savings']
                },
                credit: {
                    account_subtypes: ['credit card']
                }
            }
        };

        try {
            const response = await plaidClient.linkTokenCreate(request);
            const linkToken = response.data.link_token;
        } catch (error) {
            // handle error
        }
    }
    
    public async public_token_exchange(): Promise<void>{
        const request: ItemPublicTokenExchangeRequest = {
        public_token: publicToken,
        };

        try {
            const response = await plaidClient.itemPublicTokenExchange(request);
            const accessToken = response.data.access_token;
            const itemId = response.data.item_id;
        } catch (err) {
            // handle error
        }
    }

    public async accounts_get(): Promise<void>{
        const request: AccountsGetRequest = {
             access_token: ACCESS_TOKEN,
        };

        try {
            const response = await plaidClient.accountsGet(request);
            const accounts = response.data.accounts;
        } catch (error) {
            // handle error
        }
    }

    public async transactions_get(): Promise<void>{
        const request: TransactionsGetRequest = {
        access_token: accessToken,
        start_date: '2018-01-01',
        end_date: '2020-02-01',
        };

        try {
            const response = await client.transactionsGet(request);
            let transactions = response.data.transactions;
            const total_transactions = response.data.total_transactions;
            // Manipulate the offset parameter to paginate
            // transactions and retrieve all available data

            while (transactions.length < total_transactions) {
                const paginatedRequest: TransactionsGetRequest = {
                    access_token: accessToken,
                    start_date: '2018-01-01',
                    end_date: '2020-02-01',
                    options: {
                        offset: transactions.length,
                    },
                };
                const paginatedResponse = await client.transactionsGet(paginatedRequest);
                transactions = transactions.concat(paginatedResponse.data.transactions);
            }
        } catch (err) {
            // handle error
        }
    }

    public async transactions_refresh(): Promise<void>{
        const request: TransactionsRefreshRequest = {
            access_token: accessToken,
        };
        try {
            await plaidClient.transactionsRefresh(request);
        } catch (error) {
            // handle error
        }
    }
}
# CommonStorage Introduction

CommonStorage is a RESTful Node.js service that allows you to store and handle static data-sets with the ability to make fast & powerful full-text search over your application data. 

We use [Elasticsearch](https://www.elastic.co/) as a database, which allows *(near) real time text-search*.

## Usage
These are examples for REST requests you can make. However, you should review the Swagger API at `/api-docs` to save some time during the process.

```
// Information about an index
{GET} http://{server}/indexes/{indexName}

// Create a new index
{POST} http://{server}/indexes

// Create a document in an index
{POST} http://{server}/indexes/{indexName}

// Search for a document by fields
{GET} http://{server}/indexes/{documentName}?{key1=value1}&{key2=value2}
```

### Use in development environment:

1. copy the template files to new service repository.
1. run `npm install `.
1. run `npm rebuild husky` to configure commit messages linting.
1. add the required logic for the new service:
   - to add new routes: create an express router and connect it to express server in ServerBuilder registerControllers function. when adding handler to the router make sure to add "validate" middleware from 'openapi-validator-middleware' for request validation.
   - modify the global error handler in the middleware folder to return better error responses and catch the errors before the global handler (currently it returns empty 500 response )
1. run `npm run confd` to generate config file from confd
1. (optional) add `.env` file to change server port and swagger host name (see `.env.example`)

### Run CommonStorage
You can run `docker_run.sh` file to run in docker, please note that default port is 8081.
For local development environment, you can just run `npm start`.
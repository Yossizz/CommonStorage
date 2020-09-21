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
import { Client } from '@elastic/elasticsearch';

// Our Elasticsearch instance configuration
const elasticConfig = {
  // node: 'http://localhost:9200',
  node: 'http://10.28.11.49:9200/',
  maxRetries: 5,
  requestTimeout: 60000,
};

// Create the client instance
const client = new Client(elasticConfig);

export default client;

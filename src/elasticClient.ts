import { Client } from '@elastic/elasticsearch';
import { get } from 'config';

// Create the client instance
const client = new Client(get("elasticConfig"));

export default client;

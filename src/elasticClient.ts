import { Client, ClientOptions } from '@elastic/elasticsearch';
import { get } from 'config';

const elasticConfig : ClientOptions = get("elastic");
// Create the client instance
const client = new Client(elasticConfig);

export default client;

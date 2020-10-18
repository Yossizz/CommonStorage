//this import must be called before the first import of tsyring
import 'reflect-metadata';
import { container } from 'tsyringe';
import { IndexesController } from '../../controllers/indexes';

const indexController = container.resolve(IndexesController);

describe('Check elastic object for query methods', () => {
  it('should return a default object to get all documents', () => {
    const expectedObject = {
      match_all: {},
    };
    // @ts-ignore
    const elasticQuery = indexController.buildElasticQuery({});
    expect(elasticQuery).toStrictEqual(expectedObject);
  });

  it('should return an object for when parameters are supplied', () => {
    const id = 3;
    const status = 'active';

    const expectedObject = {
      bool: {
        must: [{ match: { id } }, { match: { status } }],
      },
    };
    // @ts-ignore
    const elasticQuery = indexController.buildElasticQuery({ id, status });
    expect(elasticQuery).toStrictEqual(expectedObject);
  });
});

describe('Check error message parser', () => {
  const expectedStatus = 500;
  it('should return http status of ' + expectedStatus, () => {
    const errorMessage = {
      temp: 'temp',
      not_relevant: '123',
      key: 'value',
    };
    // @ts-ignore
    const errorSimplified = indexController.buildErrorMessage(errorMessage);
    expect(errorSimplified.status).toBe(expectedStatus);
  });
});

describe('Check elastic string for update-by-query', () => {
  it('should return a string with matched values', () => {
    const parameters = {
      author: 'Roee',
      role: 'developer',
    };
    const expectedString =
      'ctx._source.author=params.author;ctx._source.role=params.role;';
    // @ts-ignore
    const elsaticSource = indexController.buildElasticSource(parameters);
    expect(elsaticSource).toBe(expectedString);
  });
});

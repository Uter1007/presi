import { Test, TestingModule } from '../$node_modules/@nestjs/testing/index.js';
import { INestApplication } from '../$node_modules/@nestjs/common/index.js';
import * as request from '../$node_modules/@types/supertest/index.js';
import { AppModule } from '../src/app.module.js';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});

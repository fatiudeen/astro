/* eslint-disable no-console */
/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-unresolved */
const fs = require('fs');
const { program } = require('commander');
const { exec } = require('child_process');

// Define content and path mappings for each keyword
const paths = {
  'src/api/v1/interfaces/<Keyword>.Interface.ts': `export interface <Keyword>Interface {
    example: string
        // Define properties and methods related to <keyword>
    }`,
  'src/api/v1/repositories/<Keyword>.repository.ts': `
    import { <Keyword>Interface } from '@interfaces/<Keyword>.Interface';
    import <Keyword> from '@models/<Keyword>';
    import Repository from '@repositories/repository';
    
    export default class <Keyword>Repository extends Repository<<Keyword>Interface> {
      protected model = <Keyword>;
    }
    `,
  'src/api/v1/models/<Keyword>.ts': `
    import { <Keyword>Interface } from '@interfaces/<Keyword>.Interface';
    import { model, Schema, Model } from 'mongoose';

    const <Keyword>Schema = new Schema<<Keyword>Interface>(
    {
        // add schema here
        example: String
    },
    {
        timestamps: true,
    },
    );

    export default <Model<<Keyword>Interface>>model('<Keyword>', <Keyword>Schema);
`,
  'src/api/v1/controllers/<keyword>.controller.ts': `/* eslint-disable no-underscore-dangle */
    import { Request } from 'express';
    import <Keyword>Service from '@services/<keyword>.service';
    import { <Keyword>Interface } from '@interfaces/<Keyword>s.Interface';
    import Controller from '@controllers/controller';
    import { OPTIONS } from '@config';
    // import { <keyword>ResponseDTO } from '@dtos/<keyword>.dto';

    class <Keyword>Controller extends Controller<<Keyword>Interface> {
    service = new <Keyword>Service();
    responseDTO = undefined; // <keyword>ResponseDTO.<keyword>;
    }

    export default <Keyword>Controller;`,
  'src/api/v1/__test__/__fixtures__/<keyword>.ts': `import { faker } from '@faker-js/faker';

    export const invalid<Keyword>Id = faker.database.mongodbObjectId().toString();
    export const valid<Keyword>Id = faker.database.mongodbObjectId().toString();

    export const valid<Keyword>Data = {
    example: faker.random.word()
    };

    export const invalid<Keyword>Data = {
    examples: faker.random.word()
    };

    export const valid<Keyword>UpdateData = {
        example: faker.random.word()
    };`,
  'src/api/v1/__test__/<keyword>.test.ts': `import supertest from 'supertest';
    import { logger } from '@utils/logger';
    import App from '../app';
    import AuthService from '../services/auth.service';
    import { validUser } from './__fixtures__/user';
    import { valid<keyword>, invalid<keyword>, valid<keyword>UpdateData } from './__fixtures__/<keyword>';
    
    logger.silent = true;
    
    const authService = new AuthService();
    const app = new App().instance();
    
    let authentication: object;
    const baseUrl = '/api/v1/likes';
    
    beforeEach(async () => {
      jest.clearAllMocks();
      userId = (await authService.createUser({ ...validUser }))._id;
      const user = await authService.login({ username: validUser.email, password: validUser.password });
      authentication = { Authorization: \`Bearer \${user.token}\` };
    });
    
    describe(\`\${<keyword>.toUpperCase()} ::\`, () => {
      describe(\`POST \${baseUrl} ==========>>>>\`, () => {
        describe('given a valid <keyword> create a <keyword>, ', () => {
          it('should create <keyword> return 200', async () => {
            const { statusCode, body } = await supertest(app)
              .post(baseUrl)
              .set(authentication)
              .send({ ...valid<keyword> });
    
            //   deepLog(body)
    
            expect(statusCode).toBe(201);
            expect(body.success).toEqual(true);
          });
        });
    
        describe('given an invalid <keyword>', () => {
          it('should return 400', async () => {
            const { statusCode, body } = await supertest(app)
              .post(baseUrl)
              .set(authentication)
              .send({ ...invalid<keyword> });
    
            // deepLog(body);
    
            expect(statusCode).toBe(404);
            expect(body.success).toEqual(false);
          });
        });
      });
      describe(\`GET \${baseUrl} ==========>>>>\`, () => {
        describe('given a valid token and <keyword>s exists', () => {
          it('should return 200 and a non empty array', async () => {
            const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);
    
            expect(statusCode).toBe(200);
            expect(body.success).toEqual(true);
          });
        });
    
        describe('given a valid token', () => {
          it('should return 200, and an empty array', async () => {
            const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);
    
            expect(statusCode).toBe(200);
            expect(body.success).toEqual(true);
          });
        });
      });
      describe(\`GET \${baseUrl}/<keyword>Id ==========>>>>\`, () => {
        describe('given a valid token a valid <keyword>Id', () => {
          it('should return 200 and a ', async () => {
            const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);
    
            expect(statusCode).toBe(200);
            expect(body.success).toEqual(true);
          });
        });
    
        describe('given a valid token and an invalid <keyword>Id', () => {
          it('should return 404', async () => {
            const { statusCode, body } = await supertest(app).get(baseUrl).set(authentication);
    
            expect(statusCode).toBe(404);
            expect(body.success).toEqual(false);
          });
        });
      });
      describe(\`PUT \${baseUrl}/<keyword>Id ==========>>>>\`, () => {
        describe('given a valid token a valid <keyword>Id', () => {
          it('should update and return 200 and a ', async () => {
            const { statusCode, body } = await supertest(app)
              .put(baseUrl)
              .set(authentication)
              .send({ ...valid<keyword>UpdateData });
    
            expect(statusCode).toBe(200);
            expect(body.success).toEqual(true);
          });
        });
      });
      describe(\`DELETE \${baseUrl}/<keyword>Id ==========>>>>\`, () => {
        describe('given a valid token a valid <keyword>Id', () => {
          it('should delete and return 200 and a ', async () => {
            const { statusCode, body } = await supertest(app).delete(baseUrl).set(authentication);
    
            expect(statusCode).toBe(200);
            expect(body.success).toEqual(true);
          });
        });
      });
    });`,
  'src/api/v1/dtos/<keyword>.dto.ts': `import { body, param } from 'express-validator';

    export const <keyword>RequestDTO = {
      id: [param('<keyword>Id').exists()],
      create: [
        body('example').exists(),
      ],
      update: [
        body('example').exists(),
      ],
    };
    `,
  'src/api/v1/services/<keyword>.service.ts': `import { <Keyword>Interface } from '@interfaces/<Keyword>.Interface';
    import <Keyword>Repository from '@repositories/<Keyword>.repository';
    import Service from '@services/service';
    
    class <Keyword>Service extends Service<<Keyword>Interface, <Keyword>Repository> {
      protected repository = new <Keyword>Repository();
    }
    
    export default <Keyword>Service;`,
  'src/api/v1/routes/<keyword>.route.ts': `/* eslint-disable import/no-unresolved */
    import <Keyword>Controller from '@controllers/<keyword>.controller';
    import { <keyword>RequestDTO } from '@dtos/<keyword>.dto';
    import Route from '@routes/route';
    import { <Keyword>Interface } from '@interfaces/<Keyword>.Interface';
    
    class <Keyword>Route extends Route<<Keyword>Interface> {
      controller = new <Keyword>Controller('<keyword>');
      dto = <keyword>RequestDTO;
      initRoutes() {
        this.router.route('/').get(this.controller.get).post(this.validator(this.dto.create), this.controller.create);
        this.router
          .route('/:<keyword>Id')
          .get(this.validator(this.dto.id), this.controller.getOne)
          .put(this.validator(this.dto.update.concat(this.dto.id)), this.controller.update)
          .delete(this.validator(this.dto.id), this.controller.delete);
    
        return this.router;
      }
    }
    export default <Keyword>Route;`,
};

function createFile(filepath, content) {
  if (fs.existsSync(filepath)) {
    console.log(`File ${filepath} already exists. Skipping...`);
    return;
  }
  fs.writeFileSync(filepath, content);
  console.log(`Created ${filepath}`);
}

function removeFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Removed ${filePath}`);
  } catch (error) {
    console.error(`Error removing ${filePath}:`, error.message);
  }
}

program
  .command('new')
  .arguments('<keyword>')
  .action((keyword) => {
    keyword = keyword.toLowerCase();
    const Keyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    let _paths = '';
    for (const [path, content] of Object.entries(paths)) {
      const _path = path.replace('<keyword>', keyword).replace('<Keyword>', Keyword);
      createFile(_path, content.replaceAll('<keyword>', keyword).replaceAll('<Keyword>', Keyword));
      _paths = `${_paths} ${_path}`;
    }
    // console.log(_path);
    // eslint-disable-next-line no-unused-vars
    exec(`npm run prettier -- ${_paths}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error Formatting Files: ${error}`);
        return;
      }
      console.log(`Files Formatted: ${stdout}`);
    });
  });

program
  .command('rm')
  .arguments('<keyword>')
  .action((keyword) => {
    keyword = keyword.toLowerCase();
    const Keyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
    for (const path of Object.keys(paths)) {
      removeFile(path.replace('<keyword>', keyword).replace('<Keyword>', Keyword));
    }
  });

program.parse(process.argv);

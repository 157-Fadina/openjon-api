require('dotenv').config();
const express = require('express');

const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');
const usersApi = require('./api/users');
const errorHandler = require('./middlewares/errorHandler');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');
const authenticationsApi = require('./api/authentications');
const JobsService = require('./services/postgres/JobsService');
const JobsValidator = require('./validator/jobs');
const jobsApi = require('./api/jobs');
const ApplicationsService = require('./services/postgres/ApplicationsService');
const ApplicationsValidator = require('./validator/applications');
const applicationsApi = require('./api/applications');
const BookmarksService = require('./services/postgres/BookmarksService');
const BookmarksValidator = require('./validator/bookmarks');
const bookmarksApi = require('./api/bookmarks');
const path = require('path');
const documentsApi = require('./api/documents');
const profileApi = require('./api/profile');
const CompaniesService = require('./services/postgres/CompaniesService');
const CompaniesValidator = require('./validator/companies');
const companiesApi = require('./api/companies');
const CategoriesService = require('./services/postgres/CategoriesService');
const CategoriesValidator = require('./validator/categories');
const categoriesApi = require('./api/categories');
const DocumentsService = require('./services/postgres/DocumentsService');
const CacheService = require('./services/redis/CacheService');
const ProducerService = require('./services/rabbitmq/ProducerService');

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to OpenJob API V1' });
});

const usersService = new UsersService();
const usersValidator = UsersValidator;
const authenticationsService = new AuthenticationsService();
const authenticationsValidator = AuthenticationsValidator;
const jobsService = new JobsService();
const jobsValidator = JobsValidator; 
const applicationsService = new ApplicationsService();
const applicationsValidator = ApplicationsValidator;
const bookmarksService = new BookmarksService();
const bookmarksValidator = BookmarksValidator;
const companiesService = new CompaniesService();
const companiesValidator = CompaniesValidator;
const categoriesService = new CategoriesService();
const documentsService = new DocumentsService();
const categoriesValidator = CategoriesValidator;
const cacheService = new CacheService();

app.use('/users', usersApi(usersService, usersValidator));
app.use('/authentications', authenticationsApi(authenticationsService, usersService, TokenManager, authenticationsValidator));
app.use('/companies', companiesApi(companiesService, companiesValidator, cacheService));
app.use('/categories', categoriesApi(categoriesService, categoriesValidator));
app.use('/jobs', jobsApi(jobsService, jobsValidator));
app.use('/jobs', bookmarksApi(bookmarksService, bookmarksValidator, cacheService));
app.use('/bookmarks', bookmarksApi(bookmarksService, bookmarksValidator, cacheService));
app.use('/applications', applicationsApi(applicationsService, applicationsValidator, cacheService, ProducerService));
app.use('/profile', profileApi(usersService, applicationsService, bookmarksService));
app.use('/documents', documentsApi(documentsService));

app.use(errorHandler);

const init = async () => {
  const host = process.env.HOST;
  const port = process.env.PORT;

  app.listen(port, host, () => {
    console.log(`Server berjalan pada http://${host}:${port}`);
  });
};

init();
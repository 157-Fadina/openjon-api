require('dotenv').config(); // Pindahkan ke paling atas
const express = require('express');

// Import Services, Validators, dan API
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

const app = express();
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to OpenJob API V1' });
});

// Inisialisasi Service dan Validator
const usersService = new UsersService();
const usersValidator = UsersValidator; // PERBAIKAN: Hapus tanda kurung ()
const authenticationsService = new AuthenticationsService();
const authenticationsValidator = AuthenticationsValidator; // PERBAIKAN: Hapus tanda kurung ()
// Pasang route users
const jobsService = new JobsService();
const jobsValidator = JobsValidator; // Tanpa kurung
const applicationsService = new ApplicationsService();
const applicationsValidator = ApplicationsValidator;
const bookmarksService = new BookmarksService();
const bookmarksValidator = BookmarksValidator;
const companiesService = new CompaniesService();
const companiesValidator = CompaniesValidator;
const categoriesService = new CategoriesService();
const categoriesValidator = CategoriesValidator;

// --- AREA PEMASANGAN RUTE ---

// 1. Users & Auth
app.use('/users', usersApi(usersService, usersValidator));
app.use('/authentications', authenticationsApi(authenticationsService, usersService, TokenManager, authenticationsValidator));

// 2. Companies & Categories (Daftar ini biasanya statis, taruh di atas)
app.use('/companies', companiesApi(companiesService, companiesValidator));
app.use('/categories', categoriesApi(categoriesService, categoriesValidator));

// 3. Jobs (Pusat utama)
app.use('/jobs', jobsApi(jobsService, jobsValidator));

// 4. Bookmarks (Prefix /jobs sudah diatur di sini, 
// pastikan di index bookmark cuma tinggal :jobId/bookmark)
app.use('/jobs', bookmarksApi(bookmarksService, bookmarksValidator));
app.use('/bookmarks', bookmarksApi(bookmarksService, bookmarksValidator)); // TAMBAHKAN BARIS INI!

// 5. Applications, Profile & Docs
app.use('/applications', applicationsApi(applicationsService, applicationsValidator));
app.use('/profile', profileApi(usersService, applicationsService, bookmarksService));
app.use('/documents', documentsApi());

app.use(errorHandler);

const init = async () => {
  const host = process.env.HOST;
  const port = process.env.PORT;

  app.listen(port, host, () => {
    console.log(`Server berjalan pada http://${host}:${port}`);
  });
};

init();
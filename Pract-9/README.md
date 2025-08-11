# Product Site Backend

A clean and scalable Express.js backend server for a small product site. This project serves as a proof of concept to demonstrate the Express framework structure.

## 🚀 Features

- **Express.js Framework**: Modern, fast, and minimalist web framework
- **Security**: Helmet.js for security headers and CORS protection
- **Modular Structure**: Clean code organization for easy scalability
- **Static File Serving**: Serves HTML, CSS, and other static assets
- **API Endpoints**: RESTful API structure ready for expansion
- **Error Handling**: Comprehensive error handling middleware
- **Development Tools**: Nodemon for development auto-restart

## 📁 Project Structure

```
product-site-backend/
├── server.js              # Main server file
├── package.json           # Project dependencies and scripts
├── README.md             # Project documentation
├── public/               # Static files (HTML, CSS, images)
│   └── index.html        # Welcome page
└── routes/               # Route modules
    └── home.js           # Home and API routes
```

## 🛠️ Installation

1. Navigate to the project directory:

   ```bash
   cd Pract-9
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## 🚀 Usage

### Development Mode (with auto-restart)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

## 📋 Available Routes

### Web Routes

- `GET /` - Serves the welcome HTML page

### API Routes

- `GET /api/welcome` - Returns welcome message as JSON
- `GET /api/health` - Health check endpoint

## 🔧 Configuration

The server runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
set PORT=8000
npm start
```

## 🛡️ Security Features

- **Helmet.js**: Sets various HTTP headers for security
- **CORS**: Cross-Origin Resource Sharing enabled
- **Error Handling**: Prevents sensitive information leakage
- **Input Validation**: JSON and URL-encoded body parsing

## 🎯 Next Steps

This backend is designed to be easily extensible. Consider adding:

- Database integration (MongoDB, PostgreSQL, etc.)
- Authentication and authorization
- Product management endpoints
- User management system
- File upload capabilities
- API documentation (Swagger)
- Testing suite (Jest, Mocha)
- Logging system (Winston)

## 📝 Development Notes

- The project uses modern ES6+ features
- Follows Express.js best practices
- Implements proper error handling
- Uses modular route organization
- Ready for containerization (Docker)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

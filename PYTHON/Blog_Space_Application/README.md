# BlogSpace - Django REST Framework + React Full Stack

A modern, full-featured blogging platform built with Django REST Framework, React, and Vite.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![Django](https://img.shields.io/badge/Django-4.2.7-green)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Node](https://img.shields.io/badge/Node-16+-green)

---

## 🎯 Quick Start

### Automated Setup (Recommended)

**Windows:**
```bash
start-windows.bat
```

**Mac/Linux:**
```bash
chmod +x start.sh
./start.sh
```

### Manual Setup

**Backend (Terminal 1):**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations accounts blog
python manage.py migrate
python manage.py runserver
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install
npm run dev
```

**Visit:** http://localhost:3000

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [INSTALL.md](INSTALL.md) | Complete step-by-step installation guide |
| [DEBUG_GUIDE.md](DEBUG_GUIDE.md) | Debugging and testing procedures |
| [API_DOCUMENTATION.md](API_DOCUMENTATION.md) | Full API reference |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Quick commands and tips |
| [TROUBLESHOOTING_CHECKLIST.md](TROUBLESHOOTING_CHECKLIST.md) | Solutions for common issues |

## 📁 Project Structure

```
blogspace/
├── backend/
│   ├── blogspace/              # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py         # Project settings
│   │   ├── urls.py             # Main URL configuration
│   │   └── wsgi.py
│   ├── accounts/               # User authentication app
│   │   ├── models.py           # Custom User model
│   │   ├── serializers.py      # User serializers
│   │   ├── views.py            # Auth views
│   │   └── urls.py             # Auth URLs
│   ├── blog/                   # Blog app
│   │   ├── models.py           # Post and Comment models
│   │   ├── serializers.py      # Post/Comment serializers
│   │   ├── views.py            # Blog viewsets
│   │   ├── permissions.py      # Custom permissions
│   │   ├── admin.py            # Admin configuration
│   │   └── urls.py             # Blog URLs
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/         # React components
    │   │   ├── Header.jsx & Header.css
    │   │   ├── AuthForm.jsx & AuthForm.css
    │   │   ├── PostList.jsx & PostList.css
    │   │   ├── PostDetail.jsx & PostDetail.css (Enhanced)
    │   │   └── PostEditor.jsx & PostEditor.css
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── services/           # API service layer
    │   │   ├── api.js
    │   │   ├── authService.js
    │   │   └── postService.js
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Django 4.2** - Web framework
- **Django REST Framework 3.14** - API framework
- **Simple JWT** - JWT authentication
- **Django CORS Headers** - Cross-origin resource sharing
- **Pillow** - Image processing
- **SQLite** - Database (development)

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Context API** - State management
- **CSS3** - Advanced styling with gradients, animations, and transitions

## 📦 Installation

### Prerequisites
- Python 3.10+
- Node.js 16+
- pip
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file (optional):
```bash
SECRET_KEY=your-secret-key-here
DEBUG=True
```

5. Run migrations:
```bash
python manage.py makemigrations
python manage.py migrate
```

6. Create a superuser (optional):
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/token/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user
- `PUT /api/auth/profile/` - Update user profile
- `POST /api/auth/change-password/` - Change password

### Posts
- `GET /api/posts/` - Get all posts (paginated)
- `GET /api/posts/{id}/` - Get single post
- `POST /api/posts/` - Create post (authenticated)
- `PUT /api/posts/{id}/` - Update post (authenticated, author only)
- `PATCH /api/posts/{id}/` - Partial update post
- `DELETE /api/posts/{id}/` - Delete post (authenticated, author only)
- `GET /api/posts/{id}/comments/` - Get comments for a post
- `POST /api/posts/{id}/add_comment/` - Add comment to post (authenticated)

### Comments
- `GET /api/comments/` - Get all comments
- `GET /api/comments/{id}/` - Get single comment
- `POST /api/comments/` - Create comment (authenticated)
- `PUT /api/comments/{id}/` - Update comment (authenticated, author only)
- `DELETE /api/comments/{id}/` - Delete comment (authenticated, author only)

## 🗄️ Database Models

### User Model
```python
- id (AutoField)
- username (CharField, unique)
- email (EmailField, unique)
- password (CharField, hashed)
- bio (TextField, optional)
- avatar (ImageField, optional)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

### Post Model
```python
- id (AutoField)
- author (ForeignKey -> User)
- title (CharField)
- slug (SlugField, auto-generated, unique)
- excerpt (TextField)
- content (TextField)
- featured_image (ImageField, optional)
- published (BooleanField)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

### Comment Model
```python
- id (AutoField)
- post (ForeignKey -> Post)
- author (ForeignKey -> User)
- content (TextField)
- created_at (DateTimeField)
- updated_at (DateTimeField)
```

## 🎨 Enhanced UI Features

### Advanced CSS
- **Gradient Backgrounds** - Dynamic color gradients for avatars and buttons
- **Smooth Animations** - Fade-in, slide, and hover effects
- **Responsive Design** - Mobile-first approach with media queries
- **Modern Card Design** - Elevated cards with shadows and rounded corners
- **Interactive Elements** - Hover states, transitions, and micro-interactions
- **Icon Integration** - Emoji icons for visual appeal
- **Typography** - Carefully chosen font sizes and weights
- **Color Palette** - Professional gradient color scheme

### User Experience
- Loading states with spinners
- Error handling with friendly messages
- Confirmation dialogs for destructive actions
- Real-time comment updates
- Responsive navigation
- Accessible forms and buttons

## 🔐 Security Features

- JWT token authentication with automatic refresh
- Password hashing with Django's built-in system
- CORS protection
- CSRF protection
- SQL injection prevention (Django ORM)
- XSS protection
- Custom permissions (IsAuthorOrReadOnly)
- Secure password validation

## 🚀 Deployment

### Backend Deployment

**For Heroku:**
```bash
# Install gunicorn
pip install gunicorn

# Create Procfile
echo "web: gunicorn blogspace.wsgi" > Procfile

# Update settings.py for production
ALLOWED_HOSTS = ['your-domain.herokuapp.com']
DEBUG = False

# Deploy
git push heroku main
heroku run python manage.py migrate
```

**For Railway/Render:**
- Set environment variables
- Configure build command: `pip install -r requirements.txt`
- Configure start command: `gunicorn blogspace.wsgi`

### Frontend Deployment

**For Vercel/Netlify:**
```bash
npm run build
# Deploy dist folder
```

Update environment variables:
```
VITE_API_URL=https://your-backend-url.com/api
```

## 📝 Usage

1. **Register/Login**: Create an account or sign in
2. **Browse Posts**: View all published blog posts
3. **Create Post**: Click "Write" to create a new post
4. **Read Post**: Click on any post card to read full content
5. **Comment**: Add comments to posts (requires login)
6. **Edit/Delete**: Manage your own posts and comments
7. **Admin Panel**: Access Django admin at `/admin/`

## 🔧 Development

### Run Tests
```bash
# Backend
python manage.py test

# Frontend
npm run test
```

### Code Formatting
```bash
# Backend (install black first)
pip install black
black .

# Frontend (install prettier first)
npm install --save-dev prettier
npm run format
```

### Database Migrations
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Show migrations
python manage.py showmigrations
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🌟 Features Coming Soon

- Rich text editor (TinyMCE/Quill)
- Post categories and tags
- Search functionality
- User profiles with stats
- Like/bookmark system
- Email notifications
- Password reset via email
- Social media sharing
- Draft posts
- Post scheduling
- Image optimization
- SEO optimization
- Analytics dashboard

## 📧 Support

For issues, questions, or contributions, please open an issue on GitHub.

## 👨‍💻 Author

Created with ❤️ using Django REST Framework, React, and modern web technologies.

---

**Happy Blogging! 📝✨**
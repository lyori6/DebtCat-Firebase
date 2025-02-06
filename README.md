# DebtCat 🐱💰

DebtCat is a powerful web application designed to empower users in managing and disputing debt collections. Our platform provides an intuitive interface and guided workflows to help users navigate the complex world of debt management.

## 🌟 Features

- **Guided Dispute Process**: Step-by-step workflows for creating debt dispute letters
- **Knowledge Base**: Comprehensive articles about debt management and consumer rights
- **Interactive Tools**: Forms and templates for various debt-related scenarios
- **User Dashboard**: Track and manage dispute progress
- **Resource Center**: Educational content about debt collection practices

## 🏗️ Technical Architecture

### Technology Stack
- **Frontend**: HTML5, CSS, JavaScript
- **Hosting**: Firebase
- **CDN**: Firebase Global CDN
- **Future Ready**: Prepared for Firebase Auth and Firestore integration

### Project Structure
```
public/
├── assets/
│   ├── js/         # JavaScript files
│   ├── css/        # Stylesheets
│   └── images/     # Image assets
├── articles/       # Individual article pages
└── [main pages]    # Core application pages
```

### Core Pages
- **Main Pages**: `index.html`, `articles.html`, `dispute-form.html`
- **Auth Pages**: `log-in.html`, `sign-up.html`, `reset-password.html`
- **Application Flow**: `dispute-options.html`, `start-dispute.html`, `mail-review.html`
- **Success Pages**: `ty-chat.html`, `ty-mail.html`, `ty-pdf.html`

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Firebase CLI
- Git

### Local Development
1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd DebtCat-Firebase
   ```

2. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

3. Login to Firebase:
   ```bash
   firebase login
   ```

4. Start local development server:
   ```bash
   firebase serve
   ```

The application will be available at `http://localhost:5000`

### Deployment
Deploy to Firebase Hosting:
```bash
firebase deploy
```

## 🔧 Configuration

### Firebase Configuration
The project uses the following Firebase configuration:

```json
{
  "hosting": {
    "public": "public",
    "rewrites": [{"source": "**", "destination": "/index.html"}]
  }
}
```

## 📱 Performance Features

- **Global CDN**: Fast content delivery through Firebase's global CDN
- **Asset Optimization**: Optimized asset serving
- **Client-Side Routing**: SPA-like navigation
- **Caching**: Implemented caching strategies

## 🛣️ Roadmap

### Upcoming Features
1. **Authentication**
   - Firebase Authentication integration
   - User profile management
   - Secure data access

2. **Database Integration**
   - Firestore implementation
   - Real-time updates
   - Data persistence

3. **Performance Optimization**
   - Service worker implementation
   - Advanced caching strategies
   - Asset optimization

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please email [hello@debtcat.com](mailto:hello@debtcat.com) or open an issue in the repository.

---

Built with ❤️ by the DebtCat Team

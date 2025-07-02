# VRChat Cast Recruitment Board (CastChat)

A modern web platform for VRChat content creators to find and recruit cast members for their projects, including world creation, avatar design, events, and streaming.

## 🚀 Features

- **Cast Recruitment Posts**: Create and manage recruitment posts for VRChat projects
- **Advanced Search**: Filter by categories, tags, and requirements
- **User Profiles**: Showcase your VRChat portfolio and experience
- **Application System**: Apply to posts and manage applications
- **Real-time Notifications**: Get notified about application updates
- **Premium Features**: Enhanced visibility and analytics (Phase 2)

## 🛠️ Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Deployment**: Vercel
- **State Management**: Pinia
- **Routing**: Vue Router

## 📋 Prerequisites

- Node.js v20.x or later
- npm v10.x or later
- Git 2.x or later

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/castchat.git
   cd castchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   ./scripts/setup-env.sh
   ```

4. **Configure environment variables**
   Update `.env.local` with your Supabase credentials

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit http://localhost:5173 to see the application.

## 📁 Project Structure

```
castchat/
├── .github/            # GitHub Actions workflows
├── docs/               # Documentation
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # Vue components
│   ├── views/          # Page components
│   ├── stores/         # Pinia stores
│   ├── utils/          # Utilities
│   └── router/         # Routes
├── supabase/           # Database config
└── scripts/            # Build scripts
```

## 🔧 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview build
npm run lint         # Run linter
npm run type-check   # TypeScript check
npm test             # Run tests
```

## 🌿 Git Workflow

We follow a modified Git Flow strategy:

- `main` - Production branch
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Hot fix branches

See [Branch Strategy](./docs/branch-strategy.md) for details.

## 🚀 Deployment

- **Production**: Automatically deployed from `main` branch
- **Staging**: Automatically deployed from `develop` branch
- **Preview**: Each PR gets a preview URL

## 📚 Documentation

- [Development Setup](./docs/development-setup.md)
- [Branch Strategy](./docs/branch-strategy.md)
- [API Documentation](./docs/api.md)
- [Contributing Guide](./docs/contributing.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./docs/contributing.md) for details.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Supabase for the backend infrastructure
- Vercel for hosting and deployment
- All contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-org/castchat/issues)
- **Discord**: [Join our Discord](https://discord.gg/castchat)
- **Email**: support@castchat.jp

---

Built with ❤️ for the VRChat community

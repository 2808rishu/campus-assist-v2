# CampusAssist v2.0 🎓

A modern, multilingual campus chatbot system built with React for Smart India Hackathon (SIH). This intelligent assistant helps students get quick answers about fees, scholarships, timetables, admissions, and other college-related queries in 8 Indian languages.

## 🌟 Features

### 🗣️ Multilingual Support
- **8 Indian Languages**: English, Hindi, Marathi, Gujarati, Bengali, Tamil, Telugu, Kannada
- **Auto Language Detection**: Automatically detects user's preferred language
- **Context-Aware Responses**: Maintains conversation context across languages

### 💬 Intelligent Chat Interface
- **Real-time Conversations**: Instant responses with typing indicators
- **Quick Actions**: Pre-configured buttons for common queries
- **Message Rating**: Users can rate bot responses for continuous improvement
- **Voice Support**: Text-to-speech for accessibility
- **Copy & Share**: Easy message copying functionality

### 🎯 Smart Categories
- **Fees & Payments**: Fee structure, payment deadlines, installment options
- **Scholarships**: Available scholarships, eligibility criteria, application process
- **Academic**: Timetables, exam schedules, course information
- **Admissions**: Application procedures, eligibility requirements
- **General**: Campus facilities, events, policies

### 🔧 Admin Dashboard
- **Knowledge Base Management**: Add, edit, delete FAQ entries
- **Asset Upload**: Document and image management for chatbot responses
- **Analytics Dashboard**: Usage statistics, performance metrics, language distribution
- **Settings Configuration**: Chatbot behavior, confidence thresholds, escalation rules

## 🏗️ Project Structure

```
src/
├── pages/                    # Main application pages
│   ├── Chat.js              # Chat interface with multilingual support
│   ├── Admin.js             # Knowledge base management
│   ├── Analytics.js         # Usage analytics and reporting
│   ├── Settings.js          # System configuration
│   └── CollegeAdmin.js      # Asset and document management
│
├── components/              # Reusable UI components
│   ├── chat/               # Chat-specific components
│   │   ├── MessageBubble.js # Individual message display
│   │   ├── LanguageSelector.js # Language switching dropdown
│   │   └── QuickActions.js  # Quick question buttons
│   └── admin/              # Admin-specific components
│       └── AssetUploader.js # File upload with drag-drop
│
├── entities/               # Data schema definitions
│   ├── ChatSession.json   # User session structure
│   ├── Conversation.json  # Message exchange format
│   ├── KnowledgeBase.json # FAQ database schema
│   └── CollegeAsset.json  # File asset metadata
│
├── Layout.js              # Main application layout
└── index.js              # Component exports
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/campus-assist-v2.git
   cd campus-assist-v2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys and configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_BASE_URL=your_api_endpoint
REACT_APP_LLM_API_KEY=your_llm_api_key
REACT_APP_UPLOAD_ENDPOINT=your_file_upload_endpoint
```

### Language Support
To add or modify supported languages, update the language arrays in:
- `src/components/chat/LanguageSelector.js`
- `src/components/chat/MessageBubble.js`
- Individual page components as needed

## 📊 Analytics & Monitoring

The system includes comprehensive analytics:
- **Usage Metrics**: Total conversations, active sessions, response times
- **Language Analytics**: Distribution of queries across languages
- **Category Performance**: Most asked question categories
- **Satisfaction Tracking**: User ratings and feedback analysis

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern functional components with hooks
- **React Router**: Client-side routing
- **Framer Motion**: Smooth animations and transitions
- **Recharts**: Data visualization for analytics
- **date-fns**: Date formatting and manipulation

### UI Components
- **shadcn/ui**: Modern, accessible component library
- **Lucide React**: Beautiful icon set
- **Tailwind CSS**: Utility-first styling

### Backend Integration
- **RESTful APIs**: Integration with knowledge base and file storage
- **LLM Integration**: AI-powered response generation
- **File Upload**: Multi-format document support

## 🎨 Design Principles

- **Accessibility First**: WCAG 2.1 compliant interface
- **Mobile Responsive**: Optimized for all device sizes
- **Performance Optimized**: Lazy loading and code splitting
- **User-Centric**: Intuitive navigation and clear information hierarchy

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow React best practices and hooks patterns
- Use TypeScript for new components when possible
- Maintain consistent code formatting with Prettier
- Write meaningful commit messages
- Test components thoroughly across different languages

## 📝 API Integration

### LLM Integration Example
```javascript
const response = await InvokeLLM({
  prompt: `Answer in ${selectedLanguage}: ${userQuestion}`,
  add_context_from_internet: false
});
```

### File Upload Example
```javascript
const { file_url } = await UploadFile({ 
  file: selectedFile 
});
```

## 🌍 Multilingual Implementation

The system uses a hybrid approach:
- **Frontend Localization**: Static text translation
- **Dynamic Content**: LLM-generated responses in user's preferred language
- **Context Preservation**: Maintains conversation flow across language switches

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-friendly interface elements
- Optimized keyboard handling for mobile devices
- Progressive Web App (PWA) capabilities

## 🔒 Security & Privacy

- Input sanitization and validation
- Secure file upload with type checking
- User data privacy compliance
- Rate limiting for API calls

## 📈 Performance Features

- **Code Splitting**: Lazy load components for faster initial load
- **Image Optimization**: Automatic image compression and resizing
- **Caching Strategy**: Intelligent caching of frequently accessed data
- **Bundle Analysis**: Optimized bundle sizes

## 🎯 Future Enhancements

- [ ] Voice input support
- [ ] Advanced analytics dashboard
- [ ] Integration with college management systems
- [ ] WhatsApp and Telegram bot integration
- [ ] Offline support with service workers
- [ ] Advanced NLP for better intent recognition

## 🐛 Troubleshooting

### Common Issues

**Language not displaying correctly**
- Ensure browser supports UTF-8 encoding
- Check font loading for Indic scripts

**File upload failing**
- Verify file size limits (10MB max)
- Check supported file formats
- Ensure proper API endpoint configuration

**Chat not responding**
- Check API key configuration
- Verify network connectivity
- Check browser console for errors

## 📞 Support

For questions and support:
- 📧 Email: support@campus-assist.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/campus-assist-v2/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/campus-assist-v2/wiki)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- Smart India Hackathon for the opportunity
- Open source community for amazing tools and libraries
- Beta testers and early adopters for valuable feedback

---

**Built with ❤️ for Smart India Hackathon 2024**

*Empowering students with intelligent, multilingual campus assistance*
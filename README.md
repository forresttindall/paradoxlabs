# Paradox Labs

The official website for Paradox Labs - a cutting-edge technology company focused on innovative solutions and digital experiences.

## About Paradox Labs

Paradox Labs is a forward-thinking technology company that specializes in creating innovative digital solutions. We combine creativity with technical expertise to deliver exceptional products and services.

## Website Features

- **Modern Design**: Clean, professional interface built with React
- **Responsive Layout**: Optimized for all devices and screen sizes
- **Contact Integration**: EmailJS-powered contact form for seamless communication
- **Newsletter Signup**: Sender.net integration for subscriber management
- **Performance Optimized**: Built with Vite for fast loading and smooth user experience

## Technology Stack

- **Frontend**: React 18
- **Build Tool**: Vite
- **Styling**: CSS3 with modern design patterns
- **Email Service**: EmailJS for contact forms
- **Newsletter**: Sender.net API integration
- **Deployment**: Optimized for static hosting

## Development

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
REACT_APP_SENDER_API_KEY=your_sender_api_key
REACT_APP_SENDER_GROUP_ID=your_group_id
```

## Project Structure

```
paradoxlabs/
├── public/
│   ├── images/
│   └── index.html
├── src/
│   ├── components/
│   ├── pages/
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

---

*This is a private repository for Paradox Labs internal development.*

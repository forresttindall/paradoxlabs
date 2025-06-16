# Paradox Labs E-commerce Site

A modern e-commerce website built with React and Vite, designed for serverless deployment on Vercel.

## Features

- Modern React frontend with Vite build system
- Stripe payment integration
- Serverless API functions
- Responsive design
- Shopping cart functionality
- Product catalog
- Checkout process

## Tech Stack

- **Frontend**: React, Vite, React Router
- **Payments**: Stripe
- **Deployment**: Vercel (Serverless)
- **Styling**: CSS3 with custom properties

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_SENDER_API_KEY=your_sender_api_key_here
REACT_APP_SENDER_GROUP_ID=your_group_id_here
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_STRIPE_SECRET_KEY=sk_live_...
REACT_APP_API_URL=/api
```

## Local Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Deployment to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. Set environment variables in Vercel dashboard:
   - Go to your project settings
   - Add all environment variables from your `.env` file
   - Redeploy if necessary

## Project Structure

```
paradoxlabs/
├── api/                    # Serverless API functions
│   ├── create-payment-intent.js
│   └── package.json
├── public/                 # Static assets
├── src/                    # React source code
│   ├── api/               # Client-side API services
│   ├── components/        # React components
│   └── ...
├── .env                   # Environment variables (local)
├── vercel.json           # Vercel configuration
└── package.json          # Dependencies and scripts
```

## API Endpoints

- `POST /api/create-payment-intent` - Create Stripe payment intent

## License

MIT License

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

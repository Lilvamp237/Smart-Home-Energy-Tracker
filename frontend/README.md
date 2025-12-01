# Smart Home Energy Tracker - Frontend

A comprehensive React-based frontend for monitoring and optimizing home energy consumption.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Features

### 📊 Dashboard Overview
- Real-time energy consumption monitoring
- Quick stats with current power usage, daily costs, and trends
- Interactive energy usage charts (24h, 7d, 30d views)
- 24-hour predictive forecast with confidence intervals

### 🔌 Appliance Management
- Individual appliance monitoring
- Energy consumption breakdown by device
- Appliance comparison charts
- Detailed usage history per appliance
- Power rating and status tracking

### 💡 Optimization & Suggestions
- AI-powered energy-saving recommendations
- Priority-based suggestion filtering
- Impact scoring system (energy & cost savings)
- Action tracking (pending, completed, dismissed)
- Rule-based optimization insights

### ⚙️ Settings & Configuration
- Light/Dark theme toggle
- Appliance configuration viewer
- Project documentation
- System information display
- Technology stack details

## Tech Stack

- **React 19** - UI framework
- **React Router DOM** - Navigation
- **Recharts** - Data visualization
- **Axios** - API communication
- **CSS3** - Styling with responsive design

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure your API endpoint in `.env`:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   │   ├── charts/      # Chart components (EnergyUsageChart, ApplianceBreakdownChart, etc.)
│   │   ├── common/      # Common UI components (StatCard)
│   │   └── Navigation.js
│   ├── pages/           # Page components
│   │   ├── Dashboard.js       # Main dashboard with overview
│   │   ├── Appliances.js      # Appliance detail view
│   │   ├── Optimization.js    # Energy-saving suggestions
│   │   └── Settings.js        # Settings and documentation
│   ├── services/        # API services
│   │   └── api.js
│   ├── utils/           # Utility functions
│   │   ├── mockData.js        # Mock data for development
│   │   └── formatters.js      # Formatting utilities
│   ├── App.js           # Main app component with routing
│   └── index.js         # Entry point
└── package.json
```

## API Integration

The frontend is designed to work with the Flask backend API. Mock data is provided for development when the backend is unavailable.

### API Endpoints Used

- `GET /api/energy/usage` - Energy usage data
- `GET /api/energy/current` - Current consumption
- `GET /api/appliances` - List of appliances
- `GET /api/appliances/:id/usage` - Appliance-specific usage
- `GET /api/predictions` - Energy forecasts
- `GET /api/optimization/suggestions` - Energy-saving suggestions
- `PATCH /api/optimization/suggestions/:id` - Update suggestion status

## Development Mode

The app includes mock data for development without backend dependency. Toggle mock data in component state:

```javascript
const [useMockData] = useState(true); // Set to false for real API
```

## Responsive Design

The application is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Team

- **Frontend Developer**: Hun
- **Backend Developer**: Bubs

---

Built with ⚡ for sustainable living


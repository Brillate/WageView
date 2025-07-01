# WageView

A modern wage tracking application built with Next.js, React, and TypeScript. Track your earnings, visualize your income, and manage your work shifts with an intuitive interface.

## Features

- 💰 **Wage Tracking**: Input your pay rate and period (hourly, daily, weekly, monthly, annually)
- 📊 **Earnings Visualization**: Interactive graphs showing your earnings over time
- 🌙 **Dark/Light Theme**: Smooth animated theme toggle
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- ⚡ **Real-time Updates**: Instant calculations and visual feedback

## Tech Stack

- **Framework**: Next.js 15.3.3
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/WageView.git
cd WageView
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages:

1. Push your changes to the `master` or `main` branch
2. GitHub Actions will automatically build and deploy your site
3. Your site will be available at `https://yourusername.github.io/WageView`

### Manual Deployment

To deploy manually:

```bash
npm run build
```

The static files will be generated in the `out/` directory, ready for deployment to any static hosting service.

## Project Structure

```
src/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── ai/                 # AI-related functionality
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

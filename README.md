NexusWatch - Global Performance Intelligence
NexusWatch: React, TypeScript, Vultr

NexusWatch is a global performance intelligence platform that tests website performance from multiple regions across the world and provides AI-powered insights and recommendations.


### 🌟 Features

- Global Performance Testing: Test any website's performance from 6 global regions simultaneously
- Interactive Visualization: See network paths with animated connection lines on an interactive map
- AI-Powered Insights: Get intelligent analysis and recommendations using Vultr's Serverless Inference API
- Real-time Data: Monitor performance metrics in real-time with smooth animations
- Responsive Design: Works seamlessly across desktop and mobile devices

### 📦 Installation

Prerequisites
Node.js 16+ and npm
Python 3.8+
Vultr account with API access (for AI features)
#### Backend Setup

- Deploy 6 Vultr instances in different regions
- Set up Python agents on each instance:
- ```apt update && apt install python3-pip python3-venv -ypython3 -m venv venvsource venv/bin/activatepip install Flask```
- Create and run the agent script (see agents/agent.py)
- Set up systemd service for each agent

### FrontEnd Setup:

- Clone this Repo
- cd into repo
- ```npm install```
- create .env file and create
```REACT_APP_VULTR_INFERENCE_API_KEY=your_api_key_here```
```REACT_APP_ORCHESTRATOR_URL=http://your-sydney-instance:3000```

- npm start

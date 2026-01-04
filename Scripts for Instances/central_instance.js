const express = require('express');
const axios = require('axios');
const cors = require('cors'); // <-- IMPORT CORS

const app = express();
const PORT = 3000;

// IMPORTANT: Fill this list with your 5 agent IP addresses and their regions
const AGENTS = [
    { ip: 'ip of targeted instance', region: 'Amsterdam' },
    { ip: 'ip of targeted instance', region: 'Chicago' },
    { ip: 'ip of targeted instance', region: 'Frankfurt' },
    { ip: 'ip of targeted instance', region: 'Los Angeles' },
    { ip: 'ip of targeted instance', region: 'Tokyo' }
];

// USE CORS MIDDLEWARE - This allows your local frontend to connect
app.use(cors());

app.get('/test', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    console.log(`Testing ${targetUrl} from all agents...`);

    const agentPromises = AGENTS.map(agent => 
        axios.get(`http://${agent.ip}:5000/ping?url=${targetUrl}`, { timeout: 5000 })
            .then(response => response.data)
            .catch(error => {
                console.error(`Error from ${agent.region}:`, error.message);
                return { region: agent.region, status: 'failed', message: 'Agent unreachable' };
            })
    );

    try {
        const results = await Promise.all(agentPromises);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'A critical error occurred during aggregation.' });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Orchestrator with CORS enabled running on http://0.0.0.0:${PORT}`);
});

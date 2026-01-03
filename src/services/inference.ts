// src/services/inference.ts

interface InferenceRequest {
  model: string;
  prompt: string;
  max_tokens: number;
  temperature: number;
}

interface InferenceResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: [{
    text: string;
    index: number;
    logprobs: any;
    finish_reason: string;
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// Use Create React App's built-in environment variable support
const INFERENCE_API_KEY = process.env.REACT_APP_VULTR_INFERENCE_API_KEY || '';
const INFERENCE_ENDPOINT = 'https://api.vultrinference.com/v1/completions';

export const getPerformanceInsights = async (
  domain: string, 
  results: { region: string; latency_ms?: number; status: string }[]
): Promise<any> => {
  // If no API key is set, return mock data
  if (!INFERENCE_API_KEY) {
    console.log('No API key found, using mock insights');
    return getMockInsights(domain, results);
  }

  try {
    console.log(`Calling AI inference for ${domain}`);
    console.log('API Key available:', !!INFERENCE_API_KEY);
    
    // Prepare performance data as context for the AI
    const performanceData = results.map(r => 
      `${r.region}: ${r.status === 'success' ? r.latency_ms + 'ms' : 'Failed'}`
    ).join(', ');
    
    // Create a detailed prompt for the AI
    const prompt = `
    Analyze the following web performance data for ${domain} from global regions: ${performanceData}.
    
    Provide a JSON response with:
    1. performance_score: 0-100 based on average latency
    2. insights: {
      overall_performance: "Excellent/Good/Needs Improvement",
      reliability_score: percentage of successful regions,
      optimization_potential: "Low/Medium/High"
    }
    3. recommendations: Array of 3-4 specific actionable recommendations
    4. predictions: Array of predicted latency for each region with confidence scores
    
    Response format:
    {
      "performance_score": number,
      "insights": {
        "overall_performance": string,
        "reliability_score": number,
        "optimization_potential": string
      },
      "recommendations": [string, string, string],
      "predictions": [
        {"region": "Sydney", "predicted_latency": number, "confidence": number},
        ...
      ]
    }
    `;

    const request: InferenceRequest = {
      model: "llama-2-13b-chat",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.3
    };
    
    console.log('Sending request to inference API:', request);
    
    const response = await fetch(INFERENCE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${INFERENCE_API_KEY}`
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Inference API request failed with status ${response.status}`);
    }

    const data: InferenceResponse = await response.json();
    console.log('Received response from inference API:', data);
    
    // Parse the AI response
    try {
      const aiResponse = JSON.parse(data.choices[0].text.trim());
      console.log('Parsed AI response:', aiResponse);
      return aiResponse;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('AI response text:', data.choices[0].text);
      return getMockInsights(domain, results);
    }
  } catch (error) {
    console.error('Inference API error:', error);
    // Fallback to mock data if API fails
    return getMockInsights(domain, results);
  }
};

// Mock insights function for demo/fallback
function getMockInsights(domain: string, results: any[]): any {
  const successfulResults = results.filter(r => r.status === 'success' && r.latency_ms);
  const avgLatency = successfulResults.length > 0 
    ? successfulResults.reduce((sum, r) => sum + r.latency_ms!, 0) / successfulResults.length 
    : 0;
  
  const performanceScore = Math.max(0, Math.min(100, 100 - (avgLatency / 5)));
  
  return {
    performance_score: Math.round(performanceScore),
    predictions: results.map(r => ({
      region: r.region,
      predicted_latency: r.latency_ms ? r.latency_ms + (Math.random() - 0.5) * 20 : 0,
      confidence: 0.85 + Math.random() * 0.15
    })),
    recommendations: generateRecommendations(results),
    insights: {
      overall_performance: performanceScore > 80 ? 'Excellent' : performanceScore > 60 ? 'Good' : 'Needs Improvement',
      reliability_score: (successfulResults.length / results.length) * 100,
      optimization_potential: performanceScore > 80 ? 'Low' : performanceScore > 60 ? 'Medium' : 'High'
    }
  };
}

function generateRecommendations(results: any[]): string[] {
  const recommendations = [];
  
  const slowRegions = results.filter(r => r.latency_ms && r.latency_ms > 200);
  if (slowRegions.length > 0) {
    recommendations.push(`Deploy CDN nodes in ${slowRegions.map(r => r.region).join(', ')} to reduce latency by ~30%`);
  }
  
  const failedRegions = results.filter(r => r.status === 'failed');
  if (failedRegions.length > 0) {
    recommendations.push(`Investigate connectivity issues in ${failedRegions.map(r => r.region).join(', ')}`);
  }

  const avgLatency = results.filter(r => r.latency_ms).reduce((sum, r) => sum + r.latency_ms!, 0) / results.filter(r => r.latency_ms).length;
  if (avgLatency > 150) {
    recommendations.push('Consider implementing edge computing for better global performance');
  }

  if (recommendations.length === 0) {
    recommendations.push('Performance is optimal across all regions. Continue monitoring.');
  }

  return recommendations;
}
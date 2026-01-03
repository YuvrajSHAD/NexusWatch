import { PingResult } from '../types';

const ORCHESTRATOR_URL = 'http://45.32.190.161:3000'; // Replace with your Sydney instance IP

export const testPerformance = async (url: string): Promise<PingResult[]> => {
  try {
    const response = await fetch(`${ORCHESTRATOR_URL}/test?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error('Network response was not ok.');
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Could not connect to the backend. Is the Sydney instance running and the IP correct?');
  }
};
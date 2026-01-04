from flask import Flask, request, jsonify
import subprocess
import re
import time

app = Flask(__name__)

# Give each agent a unique name based on its location
AGENT_REGION = "Amsterdam" # <-- CHANGE THIS FOR EACH INSTANCE

@app.route('/ping')
def ping_target():
    target_url = request.args.get('url')
    if not target_url:
        return jsonify({"error": "URL parameter is required"}), 400

    # Ensure URL has protocol
    if not target_url.startswith(('http://', 'https://')):
        target_url = 'https://' + target_url

    try:
        # Use curl to measure HTTP response time
        # -w: write-out format to get timing information
        # -o: output file (we discard it with /dev/null)
        # -s: silent mode
        # --connect-timeout: max time allowed for connection
        start_time = time.time()
        command = [
            'curl', 
            '-w', '%{time_total}',
            '-o', '/dev/null',
            '-s',
            '--connect-timeout', '10',
            target_url
        ]
        
        process = subprocess.run(command, capture_output=True, text=True, timeout=15)
        
        if process.returncode == 0:
            # Extract the total time from curl's output
            total_time_str = process.stdout.strip()
            if total_time_str:
                # Convert to milliseconds
                latency_ms = float(total_time_str) * 1000
                return jsonify({
                    "region": AGENT_REGION,
                    "latency_ms": round(latency_ms, 1),
                    "status": "success"
                })
            else:
                return jsonify({
                    "region": AGENT_REGION,
                    "status": "failed",
                    "message": "Could not parse response time."
                }), 500
        else:
            return jsonify({
                "region": AGENT_REGION,
                "status": "failed",
                "message": f"HTTP request failed: {process.stderr.strip()}"
            }), 500

    except subprocess.TimeoutExpired:
        return jsonify({
            "region": AGENT_REGION,
            "status": "failed",
            "message": "Request timed out."
        }), 500
    except Exception as e:
        return jsonify({
            "region": AGENT_REGION,
            "status": "error",
            "message": str(e)
        }), 500

if __name__ == '__main__':
    # Listen on port 5000 on all network interfaces
    app.run(host='0.0.0.0', port=5000)

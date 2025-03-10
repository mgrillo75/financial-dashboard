import subprocess
import os
import sys
import time
import signal
import webbrowser
from threading import Timer

# Config
PROJECT_DIR = r"C:\Users\MIGUEL\Documents\financial-dashboard"
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:4000"

def print_colored(text, color):
    """Print colored text to console."""
    colors = {
        'red': '\033[91m',
        'green': '\033[92m',
        'yellow': '\033[93m',
        'blue': '\033[94m',
        'magenta': '\033[95m',
        'cyan': '\033[96m',
        'end': '\033[0m'
    }
    print(f"{colors.get(color, '')}{text}{colors['end']}")

def run_process(command, name, cwd=PROJECT_DIR):
    """Run a subprocess with the given command."""
    print_colored(f"Starting {name}...", "cyan")
    try:
        # Shell=True is required for Windows command execution
        process = subprocess.Popen(
            command,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        return process
    except Exception as e:
        print_colored(f"Error starting {name}: {str(e)}", "red")
        return None

def run_process_sync(command, name, cwd=PROJECT_DIR):
    """Run a subprocess synchronously and wait for completion."""
    print_colored(f"Running {name}...", "cyan")
    try:
        # Shell=True is required for Windows command execution
        process = subprocess.run(
            command,
            cwd=cwd,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            check=False  # Don't raise exception on non-zero exit
        )
        
        # Print output
        if process.stdout:
            for line in process.stdout.splitlines():
                print_colored(f"[{name}] {line}", "cyan")
        
        # Print errors if any
        if process.returncode != 0 and process.stderr:
            for line in process.stderr.splitlines():
                print_colored(f"[{name} ERROR] {line}", "red")
            return False
        
        return True
    except Exception as e:
        print_colored(f"Error running {name}: {str(e)}", "red")
        return False

def log_output(process, name, color):
    """Log output from a process with color coding."""
    for line in iter(process.stdout.readline, ""):
        if line:
            print_colored(f"[{name}] {line.strip()}", color)
    
    for line in iter(process.stderr.readline, ""):
        if line:
            print_colored(f"[{name} ERROR] {line.strip()}", "red")

def open_browser():
    """Open the browser to the frontend URL."""
    print_colored(f"Opening {FRONTEND_URL} in your browser...", "green")
    webbrowser.open(FRONTEND_URL)

def process_csv_data():
    """Process the CSV data into JSON before starting services."""
    print_colored("🔄 Checking for CSV data to process...", "yellow")
    
    # Check if CSV file exists
    csv_path = os.path.join(PROJECT_DIR, "public", "combined_truist_statements.csv")
    if not os.path.exists(csv_path):
        print_colored(f"⚠️ Warning: CSV file not found: {csv_path}", "yellow")
        print_colored("💡 The application will still start, but no data will be processed.", "yellow")
        return True
    
    print_colored("✅ CSV file found. Processing data...", "green")
    
    # Run the truist-to-json.js script to process the data
    result = run_process_sync("node truist-to-json.js", "Data Processing")
    
    if result:
        print_colored("✅ Data processing completed successfully!", "green")
        return True
    else:
        print_colored("⚠️ Data processing had issues, but we'll continue starting the application", "yellow")
        return True

def main():
    print_colored("Starting Financial Dashboard Application", "green")
    print_colored(f"Project directory: {PROJECT_DIR}", "blue")
    
    # Make sure we're in the right directory
    if not os.path.exists(os.path.join(PROJECT_DIR, "package.json")):
        print_colored(f"Error: Could not find package.json in {PROJECT_DIR}", "red")
        print_colored("Please update the PROJECT_DIR in this script to point to your financial-dashboard project", "red")
        return
    
    # Process CSV data first
    print_colored("Step 1: Processing CSV data", "blue")
    process_csv_data()
    
    # Start backend
    print_colored("Step 2: Starting backend server", "blue")
    backend_process = run_process("npm run dev:back", "Backend")
    if not backend_process:
        print_colored("Failed to start backend. Exiting...", "red")
        return
    
    # Wait a bit for backend to initialize
    time.sleep(3)
    
    # Start frontend
    print_colored("Step 3: Starting frontend server", "blue")
    frontend_process = run_process("npm run dev", "Frontend")
    if not frontend_process:
        print_colored("Failed to start frontend. Shutting down backend...", "red")
        backend_process.terminate()
        return
    
    # Open browser after a delay to ensure frontend is ready
    Timer(5, open_browser).start()
    
    # Log output from processes
    try:
        # Create daemon threads to monitor the output
        import threading
        backend_thread = threading.Thread(
            target=log_output, 
            args=(backend_process, "Backend", "cyan"),
            daemon=True
        )
        frontend_thread = threading.Thread(
            target=log_output, 
            args=(frontend_process, "Frontend", "magenta"),
            daemon=True
        )
        
        backend_thread.start()
        frontend_thread.start()
        
        print_colored("All services are now running!", "green")
        print_colored("Press Ctrl+C to stop all services and exit", "yellow")
        
        # Keep the main thread alive
        while True:
            # Check if processes are still running
            if backend_process.poll() is not None:
                print_colored("Backend process has stopped unexpectedly", "red")
                break
            if frontend_process.poll() is not None:
                print_colored("Frontend process has stopped unexpectedly", "red")
                break
            time.sleep(1)
            
    except KeyboardInterrupt:
        print_colored("\nShutting down services...", "yellow")
    finally:
        # Ensure processes are terminated
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        
        print_colored("All services have been stopped.", "green")

if __name__ == "__main__":
    # Enable colored output on Windows
    os.system('color')
    main()
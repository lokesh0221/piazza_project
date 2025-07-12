#!/usr/bin/env python3
"""
Script to start both frontend and backend services for the PDF Processing Pipeline
"""

import subprocess
import sys
import time
import os
from pathlib import Path

def check_dependencies():
    """Check if required dependencies are installed"""
    print("Checking dependencies...")
    
    # Check if Node.js is installed
    try:
        subprocess.run(["node", "--version"], check=True, capture_output=True)
        print("✓ Node.js is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ Node.js is not installed. Please install Node.js first.")
        return False
    
    # Check if npm is installed
    try:
        subprocess.run(["npm", "--version"], check=True, capture_output=True)
        print("✓ npm is installed")
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("✗ npm is not installed. Please install npm first.")
        return False
    
    # Check if Python dependencies are installed
    try:
        import fastapi
        import uvicorn
        import fitz
        import requests
        print("✓ Python dependencies are installed")
    except ImportError as e:
        print(f"✗ Missing Python dependency: {e}")
        print("Please run: pip install fastapi uvicorn PyMuPDF requests")
        return False
    
    return True

def install_frontend_dependencies():
    """Install frontend dependencies if needed"""
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("✗ Frontend directory not found")
        return False
    
    node_modules = frontend_dir / "node_modules"
    if not node_modules.exists():
        print("Installing frontend dependencies...")
        try:
            subprocess.run(["npm", "install"], cwd=frontend_dir, check=True)
            print("✓ Frontend dependencies installed")
        except subprocess.CalledProcessError:
            print("✗ Failed to install frontend dependencies")
            return False
    else:
        print("✓ Frontend dependencies already installed")
    
    return True

def start_backend():
    """Start the FastAPI backend server"""
    print("\nStarting backend server...")
    backend_dir = Path("backend")
    
    if not backend_dir.exists():
        print("✗ Backend directory not found")
        return None
    
    try:
        # Start the backend server
        backend_process = subprocess.Popen(
            [sys.executable, "main.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(3)
        
        # Check if the process is still running
        if backend_process.poll() is None:
            print("✓ Backend server started on http://localhost:8000")
            return backend_process
        else:
            stdout, stderr = backend_process.communicate()
            print(f"✗ Backend server failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"✗ Error starting backend server: {e}")
        return None

def start_frontend():
    """Start the React frontend development server"""
    print("\nStarting frontend server...")
    frontend_dir = Path("frontend")
    
    if not frontend_dir.exists():
        print("✗ Frontend directory not found")
        return None
    
    try:
        # Start the frontend development server
        frontend_process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Wait a moment for the server to start
        time.sleep(5)
        
        # Check if the process is still running
        if frontend_process.poll() is None:
            print("✓ Frontend server started on http://localhost:3000")
            return frontend_process
        else:
            stdout, stderr = frontend_process.communicate()
            print(f"✗ Frontend server failed to start:")
            print(f"STDOUT: {stdout}")
            print(f"STDERR: {stderr}")
            return None
            
    except Exception as e:
        print(f"✗ Error starting frontend server: {e}")
        return None

def main():
    """Main function to start both services"""
    print("PDF Processing Pipeline - Service Starter")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Install frontend dependencies
    if not install_frontend_dependencies():
        sys.exit(1)
    
    # Start backend
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    # Start frontend
    frontend_process = start_frontend()
    if not frontend_process:
        print("Stopping backend server...")
        backend_process.terminate()
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✓ Both services are running!")
    print("Frontend: http://localhost:3000")
    print("Backend:  http://localhost:8000")
    print("API Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop both services")
    print("=" * 50)
    
    try:
        # Keep the script running and monitor both processes
        while True:
            time.sleep(1)
            
            # Check if either process has stopped
            if backend_process.poll() is not None:
                print("\n✗ Backend server stopped unexpectedly")
                frontend_process.terminate()
                break
                
            if frontend_process.poll() is not None:
                print("\n✗ Frontend server stopped unexpectedly")
                backend_process.terminate()
                break
                
    except KeyboardInterrupt:
        print("\n\nStopping services...")
        backend_process.terminate()
        frontend_process.terminate()
        print("✓ Services stopped")

if __name__ == "__main__":
    main() 
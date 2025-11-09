"""
Video Orchestrator Module
"""

# Import VideoOrchestrator from parent directory
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

try:
    from orchestrator import VideoOrchestrator
except ImportError:
    # Fallback: create a simple mock class
    class VideoOrchestrator:
        def __init__(self):
            self.jobs = {}
        
        def create_job(self, data):
            job_id = f"job_{len(self.jobs)}"
            self.jobs[job_id] = {"status": "queued", "data": data}
            return job_id
        
        def get_job_status(self, job_id):
            return self.jobs.get(job_id, {"status": "not_found"})
        
        def get_metrics(self):
            return {"total_jobs": len(self.jobs)}

from .state import (
    VideoGenerationState,
    create_initial_state,
    validate_state,
    save_checkpoint,
    get_checkpoint,
    get_elapsed_time,
)

from .progress import (
    ProgressTracker,
    report_progress,
    calculate_step_progress,
    estimate_remaining_time,
)

# Version information
__version__ = "2.0.0"
__author__ = "Relicon Team"

# Public API
__all__ = [
    # Main orchestrator
    "VideoOrchestrator",
    # State management
    "VideoGenerationState",
    "create_initial_state",
    "validate_state",
    "save_checkpoint",
    "get_checkpoint",
    "get_elapsed_time",
    # Progress tracking
    "ProgressTracker",
    "report_progress",
    "calculate_step_progress",
    "estimate_remaining_time",
]

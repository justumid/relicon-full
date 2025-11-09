"""
Video Orchestrator Module

Ultra-modular orchestration system for AI video generation pipeline.
Coordinates planning, video generation, audio generation, and assembly
into a cohesive workflow with progress tracking and error handling.

This module has been refactored from a single 462-line file into
multiple focused modules, each under 200 lines and with comprehensive
documentation.

Modules:
    orchestrator: Main VideoOrchestrator class (will be created)
    state: State management and data structures
    progress: Progress tracking and reporting
    pipeline_steps: Individual pipeline step implementations (will be created)

Quick Start:
    ```python
    from core.orchestrator import VideoOrchestrator

    orchestrator = VideoOrchestrator()

    def progress_callback(progress: int, message: str):
        print(f"{progress}%: {message}")

    video_path = orchestrator.generate_video_ad(
        brand_name="TechCo",
        brand_description="AI-powered productivity tools",
        progress_callback=progress_callback
    )

    print(f"Video generated: {video_path}")
    ```

Architecture:
    The orchestrator uses a pipeline architecture with three main phases:
    1. Planning (0-10%): Generate video blueprint with GPT-4o
    2. Generation (10-80%): Parallel video + audio generation
    3. Assembly (80-100%): Combine into final video with FFmpeg

Features:
    - Ultra modular design (no file >200 lines)
    - Comprehensive documentation
    - Structured logging with JSON format
    - Request context tracing
    - Progress tracking and callbacks
    - Checkpoint system for debugging
    - Performance statistics
    - Blueprint caching

Author: Relicon Team
Last Updated: 2025-01-09
Version: 2.0.0 (Refactored)
"""

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

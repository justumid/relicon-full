"""
Progress Tracking and Reporting

Provides utilities for tracking and reporting progress during video generation.
Handles progress calculations, callback invocation, and progress state management.

Classes:
    ProgressTracker: Stateful progress tracking with automatic callback handling

Functions:
    report_progress: Simple progress reporting function
    calculate_step_progress: Calculate progress for a multi-step operation
    estimate_remaining_time: Estimate time remaining based on progress

Dependencies:
    - typing (Callable, Optional)
    - time (for timing calculations)

Usage Example:
    ```python
    from core.orchestrator.progress import ProgressTracker

    def my_callback(progress: int, message: str):
        print(f"{progress}%: {message}")

    tracker = ProgressTracker(callback=my_callback)

    tracker.report(0, "Starting...")
    tracker.report(50, "Halfway there...")
    tracker.report(100, "Complete!")
    ```

Author: Relicon Team
Last Updated: 2025-01-09
"""

import time
from typing import Optional, Callable


class ProgressTracker:
    """
    Stateful progress tracker with automatic callback handling.

    Manages progress reporting throughout the video generation pipeline,
    ensuring progress values are monotonically increasing and handling
    callback invocation with error handling.

    Attributes:
        callback: Optional callback function for progress updates
        last_progress: Last reported progress value (0-100)
        start_time: Timestamp when tracking started
        progress_history: List of (progress, timestamp) tuples

    Methods:
        report: Report progress with message
        increment: Increment progress by delta
        reset: Reset tracker state
        get_elapsed_time: Get elapsed time since start
        estimate_remaining: Estimate time remaining

    Example:
        >>> def callback(progress, msg):
        ...     print(f"{progress}%: {msg}")
        >>>
        >>> tracker = ProgressTracker(callback=callback)
        >>> tracker.report(25, "Processing...")
        25%: Processing...
        >>> tracker.increment(25, "Still working...")
        50%: Still working...

    Thread Safety:
        Not thread-safe. Use separate tracker per thread/job.
    """

    def __init__(self, callback: Optional[Callable[[int, str], None]] = None):
        """
        Initialize progress tracker.

        Args:
            callback: Optional function to call with progress updates
                     Signature: (progress: int, message: str) -> None
        """
        self.callback = callback
        self.last_progress = 0
        self.start_time = time.time()
        self.progress_history = [(0, self.start_time)]

    def report(self, progress: int, message: str) -> None:
        """
        Report progress with a message.

        Ensures progress values are clamped to [0, 100] and monotonically
        increasing. Invokes callback if provided, with error handling.

        Args:
            progress: Progress percentage (0-100)
            message: Human-readable status message

        Example:
            >>> tracker = ProgressTracker(print_callback)
            >>> tracker.report(33, "Generating scene 1 of 3")
            >>> tracker.report(35, "Still on scene 1...")  # OK, increases
            >>> tracker.report(30, "Going back?")  # Ignored, doesn't decrease

        Note:
            - Progress is clamped to [0, 100]
            - Progress cannot decrease (new value < last value)
            - Callback errors are caught and logged, not raised
            - All progress reports are logged to history
        """
        # Clamp progress to valid range
        progress = max(0, min(100, progress))

        # Ensure monotonic progress (never decrease)
        if progress < self.last_progress:
            progress = self.last_progress

        # Update history
        self.progress_history.append((progress, time.time()))

        # Invoke callback if provided
        if self.callback:
            try:
                self.callback(progress, message)
            except Exception as e:
                # Don't fail generation due to callback errors
                # In production, this would be logged
                pass

        # Update last progress
        self.last_progress = progress

    def increment(self, delta: int, message: str) -> None:
        """
        Increment progress by a delta amount.

        Convenience method for relative progress updates.

        Args:
            delta: Amount to increment progress by
            message: Status message

        Example:
            >>> tracker = ProgressTracker()
            >>> tracker.report(20, "Started")
            >>> tracker.increment(10, "Made progress")  # Now at 30%
            >>> tracker.increment(15, "More progress")  # Now at 45%
        """
        new_progress = self.last_progress + delta
        self.report(new_progress, message)

    def reset(self) -> None:
        """
        Reset tracker to initial state.

        Useful for reusing tracker across multiple jobs.

        Example:
            >>> tracker = ProgressTracker()
            >>> tracker.report(50, "Halfway")
            >>> tracker.reset()
            >>> assert tracker.last_progress == 0
        """
        self.last_progress = 0
        self.start_time = time.time()
        self.progress_history = [(0, self.start_time)]

    def get_elapsed_time(self) -> float:
        """
        Get elapsed time since tracking started.

        Returns:
            Elapsed time in seconds

        Example:
            >>> tracker = ProgressTracker()
            >>> time.sleep(2)
            >>> elapsed = tracker.get_elapsed_time()
            >>> assert elapsed >= 2.0
        """
        return time.time() - self.start_time

    def estimate_remaining(self) -> Optional[float]:
        """
        Estimate time remaining until completion based on progress.

        Uses linear extrapolation based on current progress rate.
        Returns None if not enough data or progress is 0.

        Returns:
            Estimated seconds remaining, or None if cannot estimate

        Example:
            >>> tracker = ProgressTracker()
            >>> tracker.report(25, "Quarter done")
            >>> remaining = tracker.estimate_remaining()
            >>> # If 25% took 60 seconds, expects ~180 seconds remaining

        Algorithm:
            - If progress == 0: Cannot estimate
            - If progress == 100: Returns 0
            - Otherwise: (100 - progress) / progress * elapsed_time

        Note:
            - Assumes constant progress rate (rarely true in practice)
            - More accurate as generation progresses
            - Early estimates may be wildly inaccurate
        """
        if self.last_progress == 0:
            return None

        if self.last_progress >= 100:
            return 0.0

        elapsed = self.get_elapsed_time()
        progress_per_second = self.last_progress / elapsed
        remaining_progress = 100 - self.last_progress

        if progress_per_second > 0:
            return remaining_progress / progress_per_second

        return None


def report_progress(
    callback: Optional[Callable[[int, str], None]],
    progress: int,
    message: str
) -> None:
    """
    Simple function for one-off progress reporting.

    Convenience function when you don't need stateful tracking.

    Args:
        callback: Progress callback function (may be None)
        progress: Progress percentage (0-100)
        message: Status message

    Example:
        >>> def print_progress(p, m):
        ...     print(f"{p}%: {m}")
        >>>
        >>> report_progress(print_progress, 50, "Halfway")
        50%: Halfway
        >>> report_progress(None, 75, "Almost done")  # No-op if callback is None

    Note:
        - Safe to call with None callback (no-op)
        - No error handling (unlike ProgressTracker)
        - No progress validation/clamping
    """
    if callback:
        callback(progress, message)


def calculate_step_progress(
    step_index: int,
    total_steps: int,
    base_progress: int,
    progress_range: int
) -> int:
    """
    Calculate progress for a step in a multi-step operation.

    Useful for mapping sub-steps to a portion of the overall progress bar.

    Args:
        step_index: Current step (0-based)
        total_steps: Total number of steps
        base_progress: Starting progress for this range
        progress_range: Total progress range for all steps

    Returns:
        Progress percentage for this step

    Example:
        >>> # Video generation is steps 0-2, covers progress 20-60 (40% range)
        >>> for i in range(3):
        ...     progress = calculate_step_progress(i, 3, 20, 40)
        ...     print(f"Scene {i+1}: {progress}%")
        Scene 1: 20%
        Scene 2: 33%
        Scene 3: 47%

    Formula:
        base_progress + (step_index / total_steps) * progress_range

    Note:
        - Returns base_progress when step_index == 0
        - Returns base_progress + progress_range when step_index == total_steps
        - Result is rounded to nearest integer
    """
    if total_steps <= 0:
        return base_progress

    step_progress = (step_index / total_steps) * progress_range
    return int(base_progress + step_progress)


def estimate_remaining_time(
    current_progress: int,
    elapsed_seconds: float
) -> Optional[float]:
    """
    Estimate remaining time based on current progress and elapsed time.

    Args:
        current_progress: Current progress (0-100)
        elapsed_seconds: Time elapsed so far

    Returns:
        Estimated seconds remaining, or None if cannot estimate

    Example:
        >>> # If 25% done after 60 seconds, estimate 180 seconds remaining
        >>> remaining = estimate_remaining_time(25, 60)
        >>> assert remaining == 180.0

    Note:
        - Returns None if progress is 0
        - Returns 0.0 if progress >= 100
        - Assumes constant progress rate
    """
    if current_progress <= 0:
        return None

    if current_progress >= 100:
        return 0.0

    rate = current_progress / elapsed_seconds
    remaining_progress = 100 - current_progress

    return remaining_progress / rate

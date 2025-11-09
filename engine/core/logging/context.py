"""
Request Context Management

Provides request-scoped context for distributed tracing and correlation
of log messages across the video generation pipeline.

Classes:
    None (uses contextvars for thread-safe context storage)

Functions:
    set_request_context: Set context for current request/job
    get_request_context: Get current request context
    clear_request_context: Clear current context
    add_context: Add fields to existing context
    with_context: Context manager for scoped context

Dependencies:
    - contextvars (Python 3.7+)
    - typing

Usage Example:
    ```python
    from core.logging.context import set_request_context, with_context
    from core.logging.logger import get_logger

    # Set context for entire job
    set_request_context(job_id="abc-123", brand="TechCo")

    logger = get_logger(__name__)
    logger.info("Starting generation")
    # Output includes: "context": {"job_id": "abc-123", "brand": "TechCo"}

    # Use context manager for temporary context
    with with_context(step="video_generation"):
        logger.info("Generating videos")
        # Output includes: {"job_id": "abc-123", "brand": "TechCo", "step": "video_generation"}
    ```

Thread Safety:
    Uses Python's contextvars module which provides thread-safe and
    async-safe context storage. Each request/job gets isolated context.

Author: Relicon Team
Last Updated: 2025-01-09
"""

import contextvars
from typing import Any, Dict, Optional
from contextlib import contextmanager


# Thread-safe context variable storage
_request_context: contextvars.ContextVar[Dict[str, Any]] = contextvars.ContextVar(
    'request_context',
    default={}
)


def set_request_context(job_id: str, **kwargs) -> None:
    """
    Set context for the current request/job.

    All subsequent log messages in the same execution context will
    automatically include these fields. Ideal for tracking requests
    across the entire video generation pipeline.

    Args:
        job_id: Unique identifier for this generation job
        **kwargs: Additional context fields (brand, user_id, etc.)

    Example:
        >>> set_request_context(
        ...     job_id="abc-123",
        ...     brand="TechCo",
        ...     user_id=456
        ... )
        >>> # All logs now include: {"job_id": "abc-123", "brand": "TechCo", "user_id": 456}

    Note:
        - Call this at the start of each job/request
        - Context persists for the entire execution context
        - Use clear_request_context() when job completes
        - Thread-safe and async-safe
    """
    context = {"job_id": job_id, **kwargs}
    _request_context.set(context)


def get_request_context() -> Dict[str, Any]:
    """
    Get the current request context.

    Returns:
        Dictionary containing all context fields, or empty dict if no context set

    Example:
        >>> set_request_context(job_id="abc-123")
        >>> context = get_request_context()
        >>> print(context)
        {'job_id': 'abc-123'}

    Note:
        - Returns a copy to prevent accidental modification
        - Use add_context() to safely add fields
    """
    return _request_context.get().copy()


def clear_request_context() -> None:
    """
    Clear the current request context.

    Should be called when a job/request completes to prevent
    context leaking into subsequent requests.

    Example:
        >>> set_request_context(job_id="abc-123")
        >>> # ... do work ...
        >>> clear_request_context()
        >>> context = get_request_context()
        >>> print(context)
        {}

    Note:
        - Always call this in a finally block
        - Not strictly necessary in request-per-process models
        - Important for long-running worker processes
    """
    _request_context.set({})


def add_context(**kwargs) -> None:
    """
    Add fields to the existing context without replacing it.

    Useful for adding step-specific context while preserving
    the job-level context set earlier.

    Args:
        **kwargs: Fields to add to context

    Example:
        >>> set_request_context(job_id="abc-123", brand="TechCo")
        >>> add_context(step="video_generation", scene=1)
        >>> context = get_request_context()
        >>> print(context)
        {'job_id': 'abc-123', 'brand': 'TechCo', 'step': 'video_generation', 'scene': 1}

    Note:
        - New fields overwrite existing fields with same name
        - Original context is preserved
    """
    current = _request_context.get().copy()
    current.update(kwargs)
    _request_context.set(current)


@contextmanager
def with_context(**kwargs):
    """
    Context manager for temporary context fields.

    Adds context fields for the duration of the with block,
    then restores the previous context.

    Args:
        **kwargs: Temporary context fields

    Yields:
        None

    Example:
        >>> set_request_context(job_id="abc-123")
        >>> with with_context(step="planning"):
        ...     logger.info("Creating blueprint")
        ...     # Logs include: {"job_id": "abc-123", "step": "planning"}
        >>> logger.info("Done")
        >>> # Logs include: {"job_id": "abc-123"} (step removed)

    Use Cases:
        - Adding step-specific context
        - Nested operation tracking
        - Temporary debug fields
        - Performance timing blocks

    Note:
        - Automatically restores previous context on exit
        - Works with exceptions (context still restored)
        - Can be nested for hierarchical context
    """
    # Save current context
    previous = _request_context.get().copy()

    try:
        # Add temporary fields
        current = previous.copy()
        current.update(kwargs)
        _request_context.set(current)
        yield
    finally:
        # Restore previous context
        _request_context.set(previous)


def get_context_field(key: str, default: Any = None) -> Any:
    """
    Get a specific field from the current context.

    Args:
        key: Context field name
        default: Value to return if field not found

    Returns:
        Field value or default

    Example:
        >>> set_request_context(job_id="abc-123", brand="TechCo")
        >>> job_id = get_context_field("job_id")
        >>> print(job_id)
        'abc-123'
        >>> user = get_context_field("user_id", default="unknown")
        >>> print(user)
        'unknown'

    Note:
        - More convenient than get_request_context() for single fields
        - Returns None by default if field not found
    """
    return _request_context.get().get(key, default)

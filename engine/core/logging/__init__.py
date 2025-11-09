"""
Relicon Structured Logging Module

Provides production-ready JSON logging with request tracing and cost tracking.

This module replaces all print() statements and basic logging with a
comprehensive structured logging system designed for production monitoring,
debugging, and cost analysis.

Key Features:
    - JSON-formatted logs for easy parsing and analysis
    - Automatic request context injection (job_id, brand, etc.)
    - Specialized logging for API calls with cost tracking
    - Video generation pipeline step tracking
    - Error logging with full stack traces
    - Thread-safe context management

Quick Start:
    ```python
    from core.logging import get_logger, set_request_context

    # Set context at job start
    set_request_context(job_id="abc-123", brand="TechCo")

    # Create logger
    logger = get_logger(__name__)

    # Log with automatic context inclusion
    logger.info("Starting video generation")
    # Output: {"timestamp": "...", "job_id": "abc-123", "brand": "TechCo", ...}
    ```

Modules:
    logger: Main logging functions and logger creation
    formatters: JSON and text formatters
    context: Request context management for distributed tracing

Environment Variables:
    LOG_LEVEL: Set logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    LOG_FORMAT: Set format (json, text) - default: json

Author: Relicon Team
Last Updated: 2025-01-09
"""

# Import main logging functions
from .logger import (
    get_logger,
    log_api_call,
    log_generation_step,
    log_error,
)

# Import context management
from .context import (
    set_request_context,
    get_request_context,
    clear_request_context,
    add_context,
    with_context,
    get_context_field,
)

# Import formatters for advanced usage
from .formatters import (
    JSONFormatter,
    TextFormatter,
)


# Version
__version__ = "1.0.0"

# Export public API
__all__ = [
    # Logger functions
    "get_logger",
    "log_api_call",
    "log_generation_step",
    "log_error",
    # Context functions
    "set_request_context",
    "get_request_context",
    "clear_request_context",
    "add_context",
    "with_context",
    "get_context_field",
    # Formatters
    "JSONFormatter",
    "TextFormatter",
]

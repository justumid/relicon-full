"""
Structured Logging System

Provides JSON-formatted logging with request tracing, cost tracking,
and production-ready log levels for the Relicon video generation engine.

This module replaces all print() statements with proper structured logging
that can be easily parsed, filtered, and analyzed in production environments.

Classes:
    None (uses functions for logger creation)

Functions:
    get_logger: Create a properly configured logger instance
    log_api_call: Log API calls with cost and performance metrics
    log_generation_step: Log video generation pipeline steps
    log_error: Log errors with full context and stack traces

Dependencies:
    - Python 3.8+ (for typing features)
    - contextvars (for request context)

Environment Variables:
    LOG_LEVEL: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
               Default: INFO
    LOG_FORMAT: Log format (json, text)
               Default: json

Usage Example:
    ```python
    from core.logging.logger import get_logger, log_api_call

    logger = get_logger(__name__)
    logger.info("Starting video generation", extra={"brand": "TechCo"})

    log_api_call(
        logger=logger,
        provider="openai",
        endpoint="chat.completions",
        cost=0.15,
        duration=2.3,
        tokens=450
    )
    ```

Author: Relicon Team
Last Updated: 2025-01-09
"""

import logging
import os
import sys
from typing import Any, Dict, Optional
from .formatters import JSONFormatter, TextFormatter
from .context import get_request_context


# Log level mapping
LOG_LEVELS = {
    'DEBUG': logging.DEBUG,
    'INFO': logging.INFO,
    'WARNING': logging.WARNING,
    'ERROR': logging.ERROR,
    'CRITICAL': logging.CRITICAL,
}


def get_logger(name: str, level: Optional[str] = None) -> logging.Logger:
    """
    Get a properly configured logger instance with structured output.

    Creates a logger with JSON or text formatting based on environment
    configuration. Automatically includes request context in all log messages.

    Args:
        name: Logger name (usually __name__ from calling module)
        level: Optional log level override (DEBUG, INFO, WARNING, ERROR, CRITICAL)
               If not provided, uses LOG_LEVEL environment variable or defaults to INFO

    Returns:
        Configured logging.Logger instance

    Example:
        >>> logger = get_logger(__name__)
        >>> logger.info("Processing request", extra={"user_id": 123})
        {"timestamp": "2025-01-09T10:30:45.123Z", "level": "INFO", ...}

    Note:
        - Logs are written to stdout for easy capture in production
        - JSON format is recommended for production environments
        - Request context is automatically included if available
    """
    logger = logging.getLogger(name)

    # Prevent duplicate handlers
    if logger.handlers:
        return logger

    # Determine log level
    if level:
        log_level = LOG_LEVELS.get(level.upper(), logging.INFO)
    else:
        env_level = os.getenv('LOG_LEVEL', 'INFO').upper()
        log_level = LOG_LEVELS.get(env_level, logging.INFO)

    logger.setLevel(log_level)

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(log_level)

    # Choose formatter based on environment
    log_format = os.getenv('LOG_FORMAT', 'json').lower()
    if log_format == 'json':
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter()

    handler.setFormatter(formatter)
    logger.addHandler(handler)

    # Don't propagate to root logger (avoid duplicates)
    logger.propagate = False

    return logger


def log_api_call(
    logger: logging.Logger,
    provider: str,
    endpoint: str,
    cost: float,
    duration: float,
    success: bool = True,
    tokens: Optional[int] = None,
    **extra_fields
) -> None:
    """
    Log API calls with standardized cost and performance tracking.

    Provides consistent logging format for all external API calls,
    making it easy to track costs, performance, and failures across
    different AI service providers.

    Args:
        logger: Logger instance to use
        provider: API provider name (e.g., "openai", "luma", "elevenlabs")
        endpoint: API endpoint called (e.g., "chat.completions", "generate")
        cost: Cost in USD for this API call
        duration: Duration in seconds
        success: Whether the call succeeded (default: True)
        tokens: Token count for text-based APIs (optional)
        **extra_fields: Additional fields to include in log

    Example:
        >>> logger = get_logger(__name__)
        >>> log_api_call(
        ...     logger=logger,
        ...     provider="openai",
        ...     endpoint="chat.completions",
        ...     cost=0.15,
        ...     duration=2.3,
        ...     tokens=450,
        ...     model="gpt-4o"
        ... )

    Cost Tracking:
        All API costs are logged in USD for easy aggregation and analysis.
        Use log aggregation tools to sum costs by provider, day, or job.
    """
    log_data = {
        "event_type": "api_call",
        "provider": provider,
        "endpoint": endpoint,
        "cost_usd": round(cost, 4),
        "duration_sec": round(duration, 2),
        "success": success,
    }

    if tokens:
        log_data["tokens"] = tokens

    # Add any extra fields
    log_data.update(extra_fields)

    # Log at appropriate level
    if success:
        logger.info(f"API call: {provider}.{endpoint}", extra=log_data)
    else:
        logger.error(f"API call failed: {provider}.{endpoint}", extra=log_data)


def log_generation_step(
    logger: logging.Logger,
    step: str,
    progress: int,
    message: str,
    **extra_fields
) -> None:
    """
    Log video generation pipeline steps with progress tracking.

    Standardized logging for each step of the video generation process,
    making it easy to track progress and identify bottlenecks.

    Args:
        logger: Logger instance to use
        step: Pipeline step name (e.g., "planning", "video_generation", "assembly")
        progress: Progress percentage (0-100)
        message: Human-readable status message
        **extra_fields: Additional context fields

    Example:
        >>> logger = get_logger(__name__)
        >>> log_generation_step(
        ...     logger=logger,
        ...     step="video_generation",
        ...     progress=45,
        ...     message="Generated 2 of 3 scenes",
        ...     scenes_complete=2,
        ...     scenes_total=3
        ... )

    Progress Tracking:
        - 0-10%: Planning and blueprint generation
        - 10-80%: Video and audio generation (parallel)
        - 80-100%: Video assembly and finalization
    """
    log_data = {
        "event_type": "generation_step",
        "step": step,
        "progress": progress,
        **extra_fields
    }

    logger.info(message, extra=log_data)


def log_error(
    logger: logging.Logger,
    error: Exception,
    context: str,
    **extra_fields
) -> None:
    """
    Log errors with full context and stack traces.

    Provides comprehensive error logging with context, making it easy
    to debug issues in production without needing to reproduce them.

    Args:
        logger: Logger instance to use
        error: Exception that was raised
        context: Description of what was happening when error occurred
        **extra_fields: Additional context fields

    Example:
        >>> logger = get_logger(__name__)
        >>> try:
        ...     result = api_call()
        ... except Exception as e:
        ...     log_error(
        ...         logger=logger,
        ...         error=e,
        ...         context="Failed to generate video blueprint",
        ...         brand="TechCo",
        ...         attempt=2
        ...     )
        ...     raise

    Note:
        This function logs the error but does NOT suppress it.
        You should still raise or handle the error appropriately.
    """
    log_data = {
        "event_type": "error",
        "error_type": type(error).__name__,
        "error_message": str(error),
        "context": context,
        **extra_fields
    }

    logger.error(
        f"Error in {context}: {str(error)}",
        extra=log_data,
        exc_info=True  # Include stack trace
    )


# Create a default logger for the logging module itself
_logger = get_logger(__name__)
_logger.debug("Logging module initialized")

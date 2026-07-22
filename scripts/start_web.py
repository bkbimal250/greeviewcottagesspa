import os
import socket
import subprocess
import sys
import time


def wait_for_postgres() -> None:
    host = os.getenv("POSTGRES_HOST", "db")
    port = int(os.getenv("POSTGRES_PORT", "5432"))
    timeout_seconds = int(os.getenv("POSTGRES_WAIT_TIMEOUT", "60"))
    deadline = time.monotonic() + timeout_seconds

    while time.monotonic() < deadline:
        try:
            with socket.create_connection((host, port), timeout=2):
                return
        except OSError:
            time.sleep(1)

    raise TimeoutError(f"PostgreSQL did not become reachable at {host}:{port}.")


def run(command: list[str]) -> None:
    subprocess.run(command, check=True)


def main() -> None:
    wait_for_postgres()

    if os.getenv("RUN_MIGRATIONS", "true").lower() == "true":
        run([sys.executable, "manage.py", "migrate", "--noinput"])

    if os.getenv("COLLECT_STATIC", "true").lower() == "true":
        run([sys.executable, "manage.py", "collectstatic", "--noinput"])

    workers = os.getenv("WEB_WORKERS", os.getenv("GUNICORN_WORKERS", "3"))
    os.execvp(
        "uvicorn",
        [
            "uvicorn",
            "config.asgi:application",
            "--host",
            "0.0.0.0",
            "--port",
            "8000",
            "--workers",
            workers,
        ],
    )


if __name__ == "__main__":
    main()

FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY hashscrap ./hashscrap
COPY migrations ./migrations
COPY alembic.ini ./

RUN pip install --no-cache-dir .

RUN useradd --create-home --uid 10001 --shell /usr/sbin/nologin hashscrap \
    && chown -R hashscrap:hashscrap /app

COPY --chown=hashscrap:hashscrap docker/wait-for-postgres.py /usr/local/bin/wait-for-postgres.py
USER 10001:10001

ENTRYPOINT ["python", "/usr/local/bin/wait-for-postgres.py"]
CMD ["python", "-m", "hashscrap.cli", "--help"]

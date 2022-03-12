import os
import sys
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# This script is used by github actions to create the schemas required
# by Django - it is only relevant for POSTGRESQL databases.

# By including initial-setup as a command line argument, it will set up the
# initial database, including adding schemas to the original table ready for
# django migration, and creating the test database template.
# `python database-setup.py initial-setup`


# List of schemas that need to be created
REQUIRED_SCHEMAS = ["accounts", "data_schema"]


def create_schemas(engine):
    """
    Create the required schemas in the database connected via engine
    """

    # Create a session manager
    Session = sessionmaker(engine)

    @contextmanager
    def session_scope():
        """Provide a transactional scope around a series of operations."""
        session = Session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()

    # Create each schema
    with session_scope() as session:
        for schema in REQUIRED_SCHEMAS:
            print(f"Creating schema {schema}")
            session.connection().execute(
                f"CREATE SCHEMA IF NOT EXISTS {schema}"
            )


def create_test_template(
    engine, main_connection_string, test_db_template_name
):
    """
    Create a template test database with the required schemas
    """

    # Create the template database
    print("Creating the template database")
    conn = engine.connect()
    # Inside the try block as if the database already exists, don't want it
    # to fail
    try:
        conn.execute(
            "commit"
        )  # Create database doesn't work inside a transaction
        conn.execute(f"CREATE DATABASE {test_db_template_name}")
    finally:
        conn.close()

    # Connect to the template database
    test_db_engine = create_engine(
        f"{main_connection_string}{test_db_template_name}",
    )

    # Create the schemas
    create_schemas(test_db_engine)

    # Drop all connections to the test database
    print("Dropping connections")
    engine.connect().execute(
        "select pg_terminate_backend(pid) from pg_stat_activity where "
        f"datname='{test_db_template_name}';"
    )

    # Convert the test database to a template with no connections
    print("Converting to template")
    conn = engine.connect()
    conn.execute("commit")
    conn.execute(
        f"ALTER DATABASE {test_db_template_name} allow_connections = FALSE "
        "is_template=TRUE;"
    )
    conn.close()


if __name__ == "__main__":

    # Get the database details
    db_name = os.environ.get("DATABASE_NAME", "postgres")
    db_user = os.environ.get("DATABASE_USER", "postgres")
    db_password = os.environ.get("DATABASE_PASSWORD", "postgres")
    db_host = os.environ.get("DATABASE_HOST", "localhost")
    db_port = os.environ.get("DATABASE_PORT", "5432")

    test_db_name = "test_development"
    test_db_template_name = "template_test"

    main_connection_string = (
        f"postgresql+psycopg2://{db_name}:{db_password}@{db_host}:{db_port}/"
    )

    # Connect to the db
    engine = create_engine(
        f"{main_connection_string}{db_name}",
    )

    if len(sys.argv) > 1:
        if sys.argv[1] == "initial-setup":
            # Create the schemas
            create_schemas(engine)

    # Create a template database for testing purposes
    create_test_template(engine, main_connection_string, test_db_template_name)

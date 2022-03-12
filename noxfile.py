import nox

nox.options.sessions = ["lint"]

PYTHON_SOURCES = ["app", "noxfile.py", "database-setup.py"]


@nox.session
def test(session):
    """
    Run the test suite
    """
    session.install("-r", "app/requirements.txt")
    session.run("python", "app/manage.py", "test", "app/", "--noinput")


@nox.session
def lint(session):
    """
    Lint all python code
    """
    session.install("black", "flake8", "isort")
    session.run("black", "--check", *PYTHON_SOURCES)
    session.run("flake8", *PYTHON_SOURCES)
    session.run("isort", "--check", *PYTHON_SOURCES)


@nox.session(name="format")
def format_(session):
    """
    Format and sort all imports in python code
    """
    session.install("black", "isort")
    session.run("black", *PYTHON_SOURCES)
    session.run("isort", *PYTHON_SOURCES)


@nox.session
def check_push(session):
    """
    Check all is ready for pushing to git
    """
    session.run("npm", "run", "lint-all", external=True)
    test(session)

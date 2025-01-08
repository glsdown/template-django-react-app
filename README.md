# Django and React App example

This is a template application built using Django and React. It is based on the video tutorial provided by [Traversy Media](https://www.youtube.com/watch?v=Uyei2iDA4Hs).

## Documentation

Documentation is included in this repository. It can be viewed using [GitHub pages](https://glsdown.github.io/template-django-react-app/).

To deploy it, simply run:

```zsh
mkdocs gh-deploy
```

Alternatively, prior to deployment, to view it locally, you can run

```zsh
mkdocs serve
```

To build the documentation into a static website for hosting elsewhere, you can do so by running:

```zsh
mkdocs build
```

## Development

### Installation

First you need to install the relevant packages. To do this ensure you have the following installed:

- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
- [python](https://www.python.org/downloads/) - I recommend using [pyenv](https://github.com/pyenv/pyenv) and [pyenv-virtualenv](https://github.com/pyenv/pyenv-virtualenv) for python installation and virtual environment setup
- [direnv](https://direnv.net/docs/installation.html) for environment variable management

Once you have installed these, you should then install the required packages for the app:

```zsh
npm i
pip install -r app/requirements.txt
```

### Environment Variables

Then you need to set up the relevant environment variables (as described in [App Settings](https://glsdown.github.io/template-django-react-app/app-settings.html#environment-variables)). If you haven't yet set up a database, you can do so in the next section. Set up your `.envrc` file using the `.envrc.example` file and run the following:

```zsh
direnv allow .
```

### Optional - Create a Postgres Database for local development

You can create a local postgresql database for development. For example using homebrew you would run:

```zsh
brew install postgresql
brew services start postgresql@14
psql postgresql
```

Once you have a server up and running, you should create the database user. The details should be the same as those you used in the `.envrc` file.

```sql
create role svc_django with login superuser password 'P@ssw0rd';
```

If you want to connect to a database (e.g. `my_database`) on the command line using psql you would run:

```sql
\c my_database svc_django;
```

However, I recommend downloading [DBeaver](https://dbeaver.io/download/), which is a free tool for connecting to databases.

Once you have your server up and running, you should initialise it using the database setup script by running the following. Make sure to customise it to include the schemas you want creating.

```zsh
python database-setup.py initial-setup
```

### Create the tables

The first time you run the app, you'll need to create all the models. You can do so using:

```zsh
python app/manage.py makemigrations
python app/manage.py migrate
```

### Viewing the application

To run the development server, you'll need to run

```zsh
python app/manage.py runserver
```

If you are working on the front end and would like React hot-reloading, you'll also need to run (in a separate terminal):

```zsh
npm run dev
```

## Building

To build the application, run

```zsh
npm run build
```

## Formatting

To format this repository to pass the GitHub tests, make sure to have nox installed, and then run:

```
>>> nox -s format
>>> npm run format
```

Alternatively, these can be combined together by using

```
>>> npm run format-all
```

## Improvements

Improvements to make:

-   Add API auto-documentation (consider the use of `react-redocs`)
-   Convert to cookie cutter

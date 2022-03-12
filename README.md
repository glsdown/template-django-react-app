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

Once you have set up the relevant environment variables (as described in [App Settings](https://glsdown.github.io/template-django-react-app/app-settings.html#environment-variables)), to run the development server, you'll need to run

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

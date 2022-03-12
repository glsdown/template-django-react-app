# Django and React App example

This is a template application built using Django and React. It is based on the video tutorial provided by [Traversy Media](https://www.youtube.com/watch?v=Uyei2iDA4Hs&t=1037s), but has been updated to use some of the latest tools and techniques.

## Tools used

The aim is to provide a base template with many of the usual required features in it. This template includes:

-   Django user and database management tools, as well as admin features
-   Django Rest Framework to provide RESTful API endpoints for accessing the data
-   Knox for management of user tokens
-   React frontend for providing an interactive user experience
-   Redux and Redux-Toolkit to manage the frontend application state
-   Django and GitHub actions for automated testing

There are a number of potential customisations, which can be found in the Customisation section to the left. It is not designed to be used as-is, as there are a number of changes that will need to be made to make the app do what you want, but instead designed to demonstrate some common use cases.

## App Overview

The basic app contains:

-   Admin setup (built-in Django admin)
-   Account Management (`accounts`)
    -   Login and Logout via API requests
    -   Password reset request, email and change via API requests
    -   Registration, including email validation via API requests
-   API examples (`api`)
    -   Demonstration of creating a fully RESTful API using DRF's `ModelViewSet`
    -   API routes are protected through the use of a Token. This must be passed to the API in the headers by including `Authorization` as `Token abc123abc123abc123`.
    -   Documentation of the api is visible by visiting the API link using the DRF default templates
    -   Pagination example
    -   Field names are converted from snake_case default of python, to the camelCase default of React.
-   Frontend application (`frontend`)
    -   React source files demonstrating use of the backend APIs with Redux-Toolkits' `CreateApi` helper. The default API set up includes use of tokens and the main API route.
    -   Complete login/logout/register/reset-password flow and usage.
    -   Alert templates

## Useful tools

I thoroughly recommend downloading these for testing, and demonstration purposes:

-   [Postman](https://www.postman.com/) - to test API requests and responses
-   [Redux DevTools](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd) Chrome Extension - to be able to see the current state and changes to the redux store as you are using the application.

## Testing

Unit tests are created using the Django testing library. You'll find them in the relevant `tests` folders inside `accounts` and `api`. The tests inside `api` are just examples and don't represent the full test suite.

Tests can be run using `python app/manage.py test app/ --noinput` or `npm run test`.

There is also an example of how this can be used with GitHub actions for automated testing on push and pull requests in `.github/workflows/test.yml`.

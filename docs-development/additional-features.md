# Adding additional features

As mentioned, this app is designed to demonstrate some common use cases, but there are likely to be many more things that you want to change about it. I won't cover all of them here, but provide some common locations to find things you might want to add.

## New tables

The tables are built using the Django `models.py` files. You can add new tables inside these using the [standard Django definitions](https://docs.djangoproject.com/en/3.2/topics/db/models/). New tables that are going to form part of the main database should be in `app/api/models.py`, but any changes required to the user profile can be found in `app/accounts/models.py`.

Once you have defined or made changes to the models, you can create the database tables by running:

```zsh
python app/manage.py makemigrations
python app/manage.py migrate
```

## New profile fields

If you are wanting to capture additional user data, you should do so using the User Profile. This can be found in `app/accounts/models.py`. Once the models have been updated, you will need to also update the `RegisterAPI` class in `app/accounts/api.py` to ensure that these are captured:

```python hl_lines="9"
# app/accounts/api.py

...
class RegisterAPI(generics.GenericAPIView):
    ...

    def post(self, request, *args, **kwargs):
        ...
        for field in ["title", "job_title"]:
            ...
...
```

## Adding fields to the admin section

There are some basic set up in the admin section included here, but it's highly likely you'll want to add additional settings. I won't include how to register tables with admin, as this is well covered in the [Django documentation](https://docs.djangoproject.com/en/3.2/ref/contrib/admin/), but instead include helpful hints.

### Tabular Paginated Inlines

When working with data models that have a large amount of related fields, it can take a very long time to load all of the related data. Instead, you can make use of the [`django-admin-inline-paginator`](https://pypi.org/project/django-admin-inline-paginator/) to paginate the inlines.

The basic structure, is to install it using `pip install django-admin-inline-paginator` (remember to also add it to your requirements file):

```python hl_lines="3"
# app/requirements.in
...
django-admin-inline-paginator
...
```

Regenerate your `requirements.txt` using `pip-compile`. Then, add it to your settings as an installed app:

```python hl_lines="5"
# app/settings.py

INSTALLED_APPS = [
    ...
    "django_admin_inline_paginator",
    ...
]
```

Then in your `admin.py` file where you create and register your models, import it and create a subclass, then add it as an inline in the parent admin model.

```python hl_lines="3 7-10 14"
# admin.py
from django.contrib import admin
from django_admin_inline_paginator.admin import TabularInlinePaginated

from api.models import MyModel, MyParentModel

class ExampleInline(TabularInlinePaginated):
    model = MyModel
    extra = 1
    per_page = 5

class ExampleAdmin(admin.ModelAdmin):
    model = MyParentModel
    inlines = [ExampleInline]
    fields = "all"
```

### List view fields

The list view (i.e. what you see when you first access the admin panel for that Model) allows any fields that are defined on the model. This includes the string representation `__str__`, as well as calculated fields defined on the model set, and custom fields defined in the ModelAdmin.

When using related fields, it's good to include, `list_prefetch_related` to speed up the table.

Here is an advanced example of how these can be combined:

```python
# admin.py
...
class UserOrganisationAdmin(admin.ModelAdmin):
    model = UserOrganisation
    list_display = [
        "__str__",
        "get_region",
        "get_number_examples",
    ]
    list_filter = ["fk_region__name"]
    list_prefetch_related = ["examples"]
    search_fields = ["code", "name", "fk_region__name"]

    # Define how to get 'get_region' from above
    def get_region(self, instance):
        return instance.fk_region.name
    # Give the field 'get_region' a readable name
    get_region.short_description = "Region"

    # Define how to get 'get_number_examples' from above
    def get_number_examples(self, instance):
        return instance.examples.count()
    # Give the field 'get_number_examples' a readable name
    get_number_examples.short_description = "Number of Examples"
...
```

### Search and Filter on related fields

As the search and filter options allow you to use any string representation of a field name, you can also include related fields as follows:

```python
class MyModelAdmin(admin.ModelAdmin):
    model = MyModel
    list_display = ["get_owner", "get_service", "get_region", "location"]
    search_fields = [
        "fk_region__name",
        "fk_provision__fk_owner__name",
        "fk_provision__fk_service__code",
        "fk_provision__fk_service__description",
    ]
    list_filter = ["fk_region"]
    list_select_related = [
        "fk_region",
        "fk_provision",
        "fk_provision__fk_owner",
        "fk_provision__fk_service",
    ]

    ...
```

### Readonly and revoke delete permissions

You can set readonly fields within the admin panel by using the [`readonly_fields`](https://docs.djangoproject.com/en/3.2/ref/contrib/admin/#django.contrib.admin.ModelAdmin.readonly_fields) attribute.

If you want to make something editable only only creation, then you need to use the `get_readonly_fields` method. Additionally, if you want to prevent the user from being able to delete it, then you need to use the `has_delete_permission` method.

```python
class ExampleAdmin(admin.ModelAdmin):
    model = MyModel

    def get_readonly_fields(self, request, obj=None):
        # Don't allow the user to change the description
        if obj:
            return ["description"]
        else:
            return []

    def has_delete_permission(self, request, obj=None):
        # Don't allow the user to delete
        return False
```

## New API endpoints

### Backend API creation

When you have new data, it is likely that you will want to create ways of accessing this by exposing them via API endpoints. The easiest way to do this, is to create a `ModelSerializer` in `app/api/serializers.py` then use the `ModelViewSet` to automatically create all required REST API endpoints. You can see an example of how this can be used, and integrated with pagination, filter and search functionality in the example provided in `app/api/api.py`.

Once you have this defined, you need to register it with your router in `app/api/urls.py`:

```python hl_lines="5 8"
# app/api/urls.py

from rest_framework import routers

from api.api import ExampleDataTableViewSet

router = routers.DefaultRouter()
router.register("examples", ExampleDataTableViewSet, "examples")

urlpatterns = router.urls
```

If you don't need all endpoints (for example, perhaps you only want to create a read-only endpoint), then instead, you want to use a [View Class](https://www.django-rest-framework.org/api-guide/generic-views/#concrete-view-classes). You will still need to create the serializer first.

You can see an example of making use of Generic Views in the `app/accounts/api.py` file, as they are used as part of the user management process.

The biggest difference when using them, is that you don't register them with the router, but instead provide them as paths in your `app/api/urls.py` file:

```python hl_lines="4 6 11 13"
# app/api/urls.py

from rest_framework import routers
from django.urls import path

from api.api import ExampleDataTableViewSet, UserAPI

router = routers.DefaultRouter()
router.register("examples", ExampleDataTableViewSet, "examples")

urlpatterns = [path("user", UserAPI.as_view())]

urlpatterns += router.urls

```

When creating the views, it's worth using `prefetch_related` and `select_related` to speed up the collection of related data. You can read about the detail of this [here](https://www.geeksforgeeks.org/prefetch_related-and-select_related-functions-in-django/). Broadly though:

!!! note ""

    In Django, `select_related` and `prefetch_related` are designed to stop the deluge of database queries that are caused by accessing related objects.

    -   `select_related()` “follows” foreign-key relationships, selecting additional related-object data when it executes its query.
    -   `prefetch_related()` does a separate lookup for each relationship, and does the “joining” in Python.

    One uses `select_related` when the object that you’re going to be selecting is a single object, so `OneToOneField` or a `ForeignKey`. You use `prefetch_related` when you’re going to get a “set” of things, so `ManyToManyFields` or reverse ForeignKeys.

### Frontend API pickup

Once you have created (and tested) your API endpoints, you can then integrate them into the frontend app. To do this, you need to identify whether this is a new _feature_ of the app, or it relates to something that already exists.

If it's a new feature, you should add a new folder inside `app/frontend/src/features`, if not, you can add the endpoint to the relevant Slice. For API calls, as the base route for all is the same, there is a single `CreateAPI` slice created in `app/frontend/src/app/splitApiSlice.js`, and endpoints are injected into it from the individual feature slices.

Here is an example of a full CRUD API set up, including how tags can be added and validated, and success messages can be sent. Broadly speaking, `queries` are used when the database isn't changed, whereas `mutations` involve a change in the underlying data.

```js
// app/frontend/src/features/data/dataApiSlice.js
import splitApiSlice from '../../app/splitApiSlice';
import { createMessage } from '../messages/messageSlice';

export const reducerName = 'data';

export const dataApiSlice = splitApiSlice.injectEndpoints({
    endpoints(builder) {
        return {
            // Add an entry via a POST request
            addData: builder.mutation({
                query: (data) => ({
                    url: '/examples/',
                    method: 'POST',
                    body: data,
                }),
                // Invalidate all currently loaded data - force a complete refresh
                invalidatesTags: [{ type: `${reducerName}`, id: 'LIST' }],
                async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
                    // Display a message when it's been added
                    await cacheDataLoaded;
                    dispatch(
                        createMessage({
                            msg: 'Entry Added',
                            alertType: 'success',
                        }),
                    );
                },
            }),
            // Delete an entry via a DELETE request
            deleteData: builder.mutation({
                query: (id) => ({
                    url: `/examples/${id}`,
                    method: 'DELETE',
                }),
                // Invalidate the entry relating to that ID
                invalidatesTags: (result, error, { id }) => [
                    { type: `${reducerName}`, id },
                ],
                async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
                    // Display a message when it's been deleted
                    await cacheDataLoaded;
                    dispatch(
                        createMessage({
                            msg: 'Entry Deleted',
                            alertType: 'success',
                        }),
                    );
                },
            }),
            // (Partially) update an entry via a PATCH request
            // Using PUT would update the entire entry
            updateData: builder.mutation({
                query: (data) => {
                    const { id, ...body } = data;
                    return {
                        url: `/examples/${id}/`,
                        method: 'PATCH',
                        body,
                    };
                },
                // Invalidate the entry relating to that ID
                invalidatesTags: (result, error, { id }) => [
                    { type: `${reducerName}`, id },
                ],
                // Update the details for that single item in the store
                async onQueryStarted(
                    { id, ...patch },
                    { dispatch, queryFulfilled },
                ) {
                    const patchResult = dispatch(
                        splitApiSlice.util.updateQueryData(
                            'getDataPoint',
                            id,
                            (draft) => {
                                Object.assign(draft, patch);
                            },
                        ),
                    );
                    try {
                        await queryFulfilled;
                    } catch {
                        patchResult.undo();
                    }
                },
                async onCacheEntryAdded(arg, { dispatch, cacheDataLoaded }) {
                    // Display a message when successfully updated
                    await cacheDataLoaded;
                    dispatch(
                        createMessage({
                            msg: 'Entry Updated',
                            alertType: 'success',
                        }),
                    );
                },
            }),
            // Get all the entries from the API (paginated) using a GET request
            getData: builder.query({
                query: ({ limit = 10, page = 1 }) => ({
                    url: `/examples/?limit=${limit}&page=${page}`,
                }),
                // Tag all the entries with the ID
                providesTags: (result) => {
                    if (result && result.results) {
                        return [
                            ...result.results.map(({ id }) => ({
                                type: `${reducerName}`,
                                id,
                            })),
                            { type: `${reducerName}`, id: 'LIST' },
                        ];
                    }
                    return [{ type: `${reducerName}`, id: 'LIST' }];
                },
            }),
            // Get a single entry using a GET request
            getDataPoint: builder.query({
                query: (id) => `/examples/${id}/`,
                // Tag it with the right ID
                providesTags: (result, error, id) => [
                    { type: `${reducerName}`, id },
                ],
            }),
        };
    },
    // Don't override existing endpoints in the slice
    overrideExisting: false,
});

// Export the required hooks
export const {
    useGetDataQuery,
    useAddDataMutation,
    useDeleteDataMutation,
    useUpdateDataMutation,
} = dataApiSlice;
```

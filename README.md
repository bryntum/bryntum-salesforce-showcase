# Bryntum Salesforce showcase

This application demonstrates how Bryntum components can be used in a Salesforce environment.

## Application structure

The Bryntum Salesforce showcase application consists of Lightning Web Components (LWCs) for the supported Bryntum
products (Grid, Scheduler, Gantt, Task Board, and Calendar), a Lightning `Bryntum` app with a tab for each component,
and a community page called "Demo".

Each LWC loads the Bryntum bundle from a product-specific static resource:

| Static resource     | Loaded by                                                                     |
|---------------------|-------------------------------------------------------------------------------|
| `bryntum_grid`      | `grid_component`, `grid_temp_demo`                                            |
| `bryntum_scheduler` | `scheduler_component`, `scheduler_drag_from_grid`, `scheduler_unplanned_grid` |
| `bryntum_gantt`     | `gantt_component`                                                             |
| `bryntum_calendar`  | `calendar_component`                                                          |
| `bryntum_taskboard` | `taskboard_component`                                                         |

The static resources are not stored in the repository. They are created from the Bryntum npm packages as part of the
setup, see [Creating the static resources](#creating-the-static-resources).

## Version requirements

| Showcase Version | Bryntum Version |
|------------------|-----------------|
| 1.0.0            | 6.x.x           |
| 2.0.0            | 7.x.x           |
| 3.0.0            | 8.x.x           |

## Setting up the Bryntum Salesforce showcase application

1. Set up your environment:

    - Enable **Dev Hub** in your Salesforce org
    - Install the Salesforce CLI
    - Install Node.js 18 or later

2. Authorize your hub org and assign it an alias (for example, `myorg`) if you haven't already:

    ```
    sf org login web -d -a myorg
    ```

3. Clone this repository:

    ```
    git clone https://github.com/bryntum/bryntum-salesforce-showcase
    cd bryntum-salesforce-showcase
    ```

4. Create the static resources, see [Creating the static resources](#creating-the-static-resources):

    ```
    npm install
    npm run create-static-resources
    ```

5. Create a scratch org and assign it an alias (for example, `bryntum-demo`) using the following command:

    ```
    sf org create scratch -d -f config/project-scratch-def.json -a bryntum-demo
    ```

6. Enable Digital Experience in the scratch org:

    ```
    sf org open
    ```

    Go to settings, search for 'Digital Experience', enable it and save.

7. Push the app to your scratch org:

    ```
    sf project deploy start
    ```

8. Assign the `bryntum-demo` permission set to the default user:

    ```
    sf org permset assign -n bryntumdemo
    ```

9. Open the scratch org:

    ```
    sf org open
    ```

10. In the **App Launcher**, select the Bryntum app.

### Creating the static resources

The LWCs import the `bryntum_*` static resources, so the resources must exist before the app is deployed. They are
created from the `@bryntum/<product>-salesforce-enterprise` npm packages listed in `package.json`. The packages are
public on npmjs.com, no login is required.

```
npm install
npm run create-static-resources
```

The second command runs the `bryntum-<product>-salesforce` script of each package, which creates the static resource
and its `.resource-meta.xml` file in `force-app/main/default/staticresources`:

| Static resource     | npm package                                |
|---------------------|--------------------------------------------|
| `bryntum_grid`      | `@bryntum/grid-salesforce-enterprise`      |
| `bryntum_scheduler` | `@bryntum/scheduler-salesforce-enterprise` |
| `bryntum_gantt`     | `@bryntum/gantt-salesforce-enterprise`     |
| `bryntum_calendar`  | `@bryntum/calendar-salesforce-enterprise`  |
| `bryntum_taskboard` | `@bryntum/taskboard-salesforce-enterprise` |

Each static resource holds only the runtime files: the minified bundle (`<product>.lwc.min.js`), the component styles
(`<product>.css`), the default theme (`svalbard.css`) and the `fontawesome` folder. Salesforce limits the size of a
static resource to 5 MB, so the other themes, the locales and the source maps stay in the npm package. To use another
theme or a locale, copy the file from `node_modules/@bryntum/<product>-salesforce-enterprise` into the static resource
folder and load it in the LWC.

To upgrade to a newer Bryntum version, change the versions of the `@bryntum/*-salesforce-enterprise` packages in
`package.json`, run the two commands again and redeploy. To deploy only the static resources, run:

```
sf project deploy start --source-dir force-app/main/default/staticresources
```

### Registering the license key

The Salesforce packages are available only for the Enterprise tier and are valid only with an Enterprise license.
Without a license key the components run in trial mode, which is fully functional for 14 days. To register your
license key, set it on the `bryntum` global object in the LWC before the component is created, for example in
`createGrid()` in `force-app/main/default/lwc/grid_component/grid_component.js`:

```javascript
bryntum.licenseKey = 'key-goes-here';
```

## Links

- [Salesforce quick start](https://bryntum.com/products/grid/docs/guide/Grid/quick-start/salesforce)
- [Salesforce integration guide](https://bryntum.com/products/grid/docs/guide/Grid/integration/salesforce/readme)
- [Support forum](https://forum.bryntum.com)

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
Without a license key the components run in trial mode, which is fully functional for 14 days. The key can be
registered in one of two ways: loaded from the org, or put into the code directly.

**Option 1: load the key from the org (default)**

The key is kept out of source. Each component calls the `BryntumLicense.getKey()` Apex method on load, which reads
the key from the `Bryntum License` custom object (`Bryntum_License__c.Key__c`) and assigns it to `bryntum.licenseKey`
before the component is created. To store your key in the org, create a single record:

```
sf data create record -s Bryntum_License__c -v "Name='Showcase' Key__c='<your license key>'"
```

To replace it later:

```
sf data update record -s Bryntum_License__c -w "Name='Showcase'" -v "Key__c='<your new license key>'"
```

Both commands target the project default org, pass `-o <alias>` to use another one. Hard reload the components to
pick up a changed key.

Users need access to the `BryntumLicense` Apex class, which the `bryntumdemo` permission set grants to internal
users and the `Demo Profile` guest profile grants to visitors of the Digital Experience site. The class runs in
system mode, so no record access is needed. If the record is missing, or the user cannot call the class, the
components fall back to trial mode without failing.

**Option 2: put the key into the code**

Replace the org lookup where each component assigns the key, for example in
`force-app/main/default/lwc/grid_component/grid_component.js`:

```javascript
// Register your Bryntum Enterprise license key here, without a key the component runs in trial mode.
// This showcase reads the key from the Bryntum_License__c record in the org, replace it with your own:
// bryntum.licenseKey = 'key-goes-here';
if (licenseKey) {
    bryntum.licenseKey = licenseKey;
}
```

Keep in mind that a key committed to source is visible to everyone with access to the repository.

### Favicon and logo of the demo site

Both images are asset files in `force-app/main/default/contentassets` and are deployed with the rest of the metadata,
so no upload through Experience Builder is needed. Guests load them from the site under
`/demo/sfsites/c/file-asset/<asset name>`.

- The favicon is `bryntum_favicon` (64x64 PNG). The Build Your Own (LWR) template has no favicon setting, so it is
  registered through the head markup in
  `force-app/main/default/digitalExperiences/site/Demo1/sfdc_cms__appPage/mainAppPage/content.json`
  (Experience Builder: Settings, Advanced, Edit Head Markup).
- The header logo is `bryntum_logo_white`, the white Bryntum wordmark, shown by the Site Logo component in the
  header theme layout
  `force-app/main/default/digitalExperiences/site/Demo1/sfdc_cms__themeLayout/scopedHeaderAndFooter/content.json`.
  Its `imageInfo` attribute points at the asset URL instead of a CMS image, which keeps the logo out of the org's
  CMS workspace and makes the site reproducible from the repo. On phones the component switches to the blue square
  mark `bryntum_logo` through `imageInfoMobile`, and a media query in the head markup drops the blue bar background
  there so the square logo sits on a plain header. The Site Logo component caps the image height at 25px on phones
  inside its own shadow DOM, so the mobile logo width is set to 25 as well; a larger value only adds empty space. The standard navigation bar cannot hold an image, so the header
  section itself is the brand bar: a 2/12 logo column and a 10/12 navigation column laid out as a row on every
  device size (a 1/12 column squeezes the logo below 90px on small desktops), the CSS class `bryntum-header` whose blue background is defined in the head markup, and a transparent
  navigation bar so both sit on one strip.
- The layout has a device-specific Mobile version, stored as `mobile/mobile.json` next to `content.json`. Device
  versions are only retrieved and deployed with API version 64 or later, which is why `sourceApiVersion` in
  `sfdx-project.json` is 64.0. Deploying the layout with an older API version fails with "We can't delete some device
  versions".

To swap either image, replace the `.asset` file, deploy `force-app/main/default/contentassets`, and publish the site
with `sf community publish -n Demo`.

## Links

- [Salesforce quick start](https://bryntum.com/products/grid/docs/guide/Grid/quick-start/salesforce)
- [Salesforce integration guide](https://bryntum.com/products/grid/docs/guide/Grid/integration/salesforce/readme)
- [Support forum](https://forum.bryntum.com)

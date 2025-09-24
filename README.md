# Bryntum Salesforce showcase

This application demonstrates how Bryntum components can be used in a Salesforce environment.

## Application structure

The Bryntum Salesforce showcase application creates 6 static resources, 6 Lightning Web Components (LWCs), a
Lightning `Bryntum` app and a community page called "Demo".

An LWC is provided for each Bryntum product: Grid, Scheduler, Scheduler Pro, Gantt, Task Board, and Calendar. Each LWC
uses a bundle-specific static resource.

By default, the app uses dummy resources. To enable the LWCs, follow the instructions below to configure the correct
resources.

## Setting up the Bryntum Salesforce showcase application

Setting up the application involves two steps:

1. [Deploying the application skeleton to Salesforce](https://github.com/bryntum/bryntum-salesforce-showcase#setting-up-and-deploying-to-a-scratch-org).
2. [Configuring the correct static resource](https://github.com/bryntum/bryntum-salesforce-showcase#configuring-the-static-resource) to enable the LWC.

### Setting up and deploying to a scratch org

1. Set up your environment:

    - Enable **Dev Hub** in your Salesforce org
    - Install the Salesforce CLI
    - Install Visual Studio Code
    - Install the Visual Studio Code Salesforce extensions, including the Lightning Web Components extension

2. Authorize your hub org and assign it an alias (for example, `myorg`) if you haven't already:

    ```
    sf org login web -d -a myorg
    ```

3. Clone this repository:

    ```
    git clone https://github.com/bryntum/bryntum-salesforce-showcase
    cd bryntum-salesforce-showcase
    ```

4. Create a scratch org and assign it an alias (for example, `bryntum-demo`) using the following command:

    ```
    sf org create scratch -d -f config/project-scratch-def.json -a bryntum-demo
    ```
5. Enable Digital Experience in the scratch org:

   ```shell
   sf org open
   ```

Go to settings, search for 'Digital Experience', enable it and save

6. Push the app to your scratch org:

    ```
    sf project deploy start
    ```

7. Assign the `bryntum-demo` permission set to the default user:

    ```
    sf org permset assign -n bryntumdemo
    ```

8. Open the scratch org:

    ```
    sf org open
    ```

9. In the **App Launcher**, select the Bryntum app.

### Configuring the static resource

The Bryntum Salesforce showcase app uses mocked resources by default. While Lightning Web Components (LWCs) can be loaded, they will not function properly. 

To enable LWCs, create the correct static resource using the trial or licensed source code.

The following steps explain how to create the static resource for a Bryntum Grid LWC. Adjust these steps as needed to create the static resource for the Bryntum component you're working with.

1. Download the source code.

- **Licensed customers:** Download the source code from the Bryntum Customer Zone or via npm.
- **Trial customers:** Access the trial version from the [Bryntum website](https://bryntum.com/download/).

3. Update the static resource.

    Navigate to `staticresources/bryntum_grid` and copy the following directories and files to the static resource:
        
        - `fonts/`
        - `locales/`
        - `grid.stockholm.css`: The default theme, imported by LWC.
        - `grid.lwc.module.js`

4. Upload the static resource.

    ```
    sfdx force:source:deploy --sourcepath force-app/main/default/staticresources/bryntum_grid.resource-meta.xml
    ```

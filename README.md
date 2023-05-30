# Bryntum Salesforce showcase

This application demonstrates Bryntum components in Salesforce environment.

## Design

This app creates 6 static resources, 6 Lightning Web Components and a Lightning `Bryntum` App. There is an LWC
for every Bryntum product: Grid, Scheduler, SchedulerPro, Gantt, Taskboard and Calendar. Each LWC uses
bundle-specific static resource. By default app uses dummy resource, to enable LWC you need to create
proper resource (see below for instructions)

## Setup

Setup is divided into two steps:
1. [Uploading](https://github.com/bryntum/bryntum-salesforce-showcase#setup-using-scratch-org) application skeleton to Salesforce.
2. [Creating](https://github.com/bryntum/bryntum-salesforce-showcase#setup-static-resource) proper static resources to enable LWC.

## Setup using Scratch org

1. Set up your environment:

    - Enable Dev Hub in your Salesforce Org
    - Install Salesforce CLI
    - Install Visual Studio Code
    - Install the Visual Studio Code Salesforce extensions, including the Lightning Web Components extension

2. If you haven't already done so, authorize your hub org and provide it with an alias (myorg in the command below):

    ```
    sfdx auth:web:login -d -a myorg
    ```

3. Clone this repository:

    ```
    git clone https://github.com/bryntum/bryntum-salesforce-showcase
    cd bryntum-salesforce-showcase
    ```

4. Create a scratch org and provide it with an alias (bryntum-demo in the command below):

    ```
    sfdx force:org:create -s -f config/project-scratch-def.json -a bryntum-demo
    ```

5. Push the app to your scratch org:

    ```
    sfdx force:source:push
    ```

6. Assign the bryntum-demo permission set to the default user:

    ```
    sfdx force:user:permset:assign -n bryntum-demo
    ```

7. Open the scratch org:

    ```
    sfdx force:org:open
    ```

8. In App Launcher, select the Bryntum app.

## Setup static resource

By default this app uses mocked resources. Lightning Web Components could be loaded but will not be
functional. To enable them you need to create a proper static resource. Either from trial or licensed
source code.

To create a Grid static resource follow these steps:

1. Download source code.

    You can get it from customer zone, NPM or trial version from [site](https://bryntum.com/download/)

2. Remove old resource - `staticresources/bryntum_grid.resource`

3. Create new resource

    Create directory `staticresources/bryntum_grid` and copy contents from the distributable to static resource:
        
        - fonts/
        - locales/
        - grid.stockholm.css - This is a default theme and it is imported by LWC
        - grid.lwc.module.js

4. Upload static resource

    ```
    sfdx force:source:deploy --sourcepath force-app/main/default/staticresources/bryntum_grid.resource-meta.xml
    ```

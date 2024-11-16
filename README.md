# Google Apps Script Development Environment Template

This template provides a development environment for Google Apps Script projects, enabling developers to write TypeScript code and leverage VSCode's advanced features instead of Google's web interface. 

Another advantage of using VSCode (or any other local IDE) is that it allows easy Git integration, pull requests, and code reviews. With web interface, managing changes can get problematic.

Features:
- Typescript support
- Prettier
- eslint
- jest
- includes Google Apps Script types / doc hints
- no minification or obfuscation for readability and easier debugging

## Usage

### Compile and Upload to Google
```bash
# just compile 
$ npx gulp build
# compile and push
$ npx gulp push
```

### Running Tests

```bash
$ npx jest --verbose
# or with coverage (HTML report generated in coverage/lcov-report directory)
$ npx jest --verbose --coverage
```

### Overview
With this setup, you can utilize TypeScript's full potential (including syntax and type checking) and manage simple, local imports (no external libraries supported). The compiler will convert the TypeScript code to JavaScript (V8 dialect), resolve dependencies, cleanup the syntax and output Google parsable script (either combined to single file or multiple ones) to `dist/` directory.

Since TypeScript is used locally, you can run unit and integration tests on your code.

### Merger Tool Operation
The merger tool processes JavaScript code, resolves dependencies, and generates output compatible with Google's parsing requirements.

The tool accepts two types of **input**:
1. Single Input File: Starting from a specified input file, it recursively resolves all dependencies, compiles them, and cleans up the output.
1. Directory: The tool traverses the entire input directory without a specific order, compiling and cleaning up each file.

**Output** can be combined into a single file,  or multiple files - preserving the original structure.

Default Mode:
The template is configured for multi-file mode by default. This is because Google Apps Script seems to handle dependency resolution without explicit imports.

For more detailed information on switching modes, please use the help command:
```Bash
tools/merger --help
```

## Setup

### Prerequisites
- Python3 (for the merger script)
    - A JavaScript version may be introduced in the future, but for now, Python3 is required. Contributions are welcome!

### Client/VSCode Setup

1. Install [Node.js](https://nodejs.org/en) if it’s not installed already.
2. Clone this template project from Git.
3. Install the required Node.js modules:
    ```bash
    npm install
    ```
4. In VSCode, go to "Extensions." Click the filter icon in the search bar and select "Recommended" to view and install workspace-defined extensions.

#### Set Up Clasp and Apps Script Pull/Push

[Google Clasp](https://github.com/google/clasp) is a command-line tool for developers to manage Google Apps Script projects from local filesystem.

The clasp was installed using the `npm install` command, but the configuration is still needed.  

> **Tip**: Clasp uses Google OAuth for authorization. If you're using VSCode's remote feature (browser on a different host than VSCode), you might need to set up SSH port forwarding for proper authorization. The forwarding port is included in the last few digits of the authorization URL presented by `clasp login`. More information can be found [here](docs/clasp_ssh_forwarding.md).

1. Create a Google Apps Script project the usual way:
    1. For a Spreadsheet App:
        - Go to [Google Sheets](https://docs.google.com/spreadsheets/u/0/).
        - Create a new spreadsheet and name it for easy reference.
        - Select `Extensions > Apps Script` from the menu to create a script linked to the sheet.
        - You'll be redirected to the Apps Script interface.
    2. Retrieve the Script ID:
        - In the Apps Script interface, go to Project Settings (gear/cog icon on the left).
    3. Clone the code in the `dist` directory:
        ```bash
        # Clasp login provides global access to your account
        $ npx clasp login
        # Work only within the dist directory, not the whole repo
        $ cd dist/
        $ npx clasp clone <Script ID>
        ```
    4. This will clone the current code and set up the directory for future pushes/pulls.

#### (Optional) Set Up Local Clasp Run

The clasp allows you to schedule code execution from CLI and retrieve results. For example:

```bash
# This will compile TypeScript to JavaScript and push it to Google
$ npx gulp push
$ npx clasp run myFunction
"This is the return value of myFunction"
```

One limitation of `clasp run` is that it doesn't display logs or exceptions. To debug, you can:
- use the included `claspRunWrapper` and `SimpleLogger`/`mylog` functions.
- manually collect logs, catch exceptions, and include them in the return string, 
- use the following command to view recent logs:
    ```bash
    $ npx clasp logs --simplified
    INFO       unknown         {"message": "Calling HTTP put: XXXXXXXXXX", "serviceContext" :{ "service": "XXXXXXXX"}}
    INFO       unknown         {"serviceContext":{"service":"XXXXXXXXXXX"},"message":"Time: 0.415"}
    INFO       unknown         {"serviceContext":{"service":"XXXXXXXXXXXXXXX"},"message":"Done"}
    INFO       unknown         {"message": "200", "serviceContext" :{ "service": "XXXXXXXXX"}}
    ```
- or use a web interface

You can follow [Clasp Run Documentation](https://github.com/google/clasp/blob/master/docs/run.md) for `clasp run` setup details, but here are key points:

1. FYI: you don't need `clasp run` to develop or test locally. You only need it if you want to execute code in Google's environment and see/test the results on local console.
1. `clasp login --creds creds.json` provides "project-specific" authorization. It supplements your main login, not replaces it.
2. If you change script permissions/scopes (manually or by editing `appsscript.json`), rerun `clasp login --creds creds.json` to reauthorize, updating granted permissions.
1. I had to manually do following steps to get my app working both with web interface and `clasp run`
    1. add following scopes to `appsscript.json`
        ```json
        "oauthScopes": [
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/script.external_request",
            "https://www.googleapis.com/auth/script.container.ui",
            "https://www.googleapis.com/auth/spreadsheets"
        ]
        ```
    1. push changes with 
        ```bash
        $ npx clasp push -f
        ```
    1. reauthenticate with 
        ```bash
        $ npx clasp login --creds creds.json`
        ```
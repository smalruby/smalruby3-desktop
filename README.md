# smalruby3-desktop

Smalruby3 as a standalone desktop application forked from [LLK/scratch-desktop](https://github.com/LLK/scratch-desktop).

## Developer Instructions

### Prepare `smalruby3-gui`

This step is temporary: eventually, the `smalruby3-desktop` branch of the smalruby3-gui repository will be merged with
that repository's main development line. For now, though, the `smalruby3-desktop` branch holds a few changes that are
necessary for Scratch Desktop to function correctly but are not yet merged into the main development branch.

#### Prepare `smalruby3-gui`: Quick Start

1. Clone both `smalruby3-desktop` and `smalruby3-gui`
   1. `mkdir smalruby3`
   2. `cd smalruby3`
   3. `git clone https://github.com/smalruby/smalruby3-desktop.git`
   3. `git clone https://github.com/smalruby/smalruby3-gui.git`
2. `cd smalruby3-gui`
   1. `git checkout smalruby3-desktop`
   2. `npm install`
   3. `npm link`
   4. `cd ..`
3. `cd smalruby3-desktop`
   1. `npm install`
   2. `npm link smalruby3-gui`
   3. `npm run build-gui` or `npm run watch-gui`

Your copy of `smalruby3-gui` should now be ready for use with Smalruby3 Desktop.

### Prepare media library assets

In the `smalruby3-desktop` directory, run `npm run fetch`. Re-run this any time you update `smalruby3-gui` or make any
other changes which might affect the media libraries.

### Run in development mode

`npm start`

### Make a packaged build

`npm run dist`

Node that on macOS this will require installing various certificates.

#### Signing the NSIS installer (Windows, non-store)

By default all Windows installers are unsigned. An APPX package for the Microsoft Store shouldn't be signed: it will
be signed automatically as part of the store submission process. On the other hand, the non-Store NSIS installer
should be signed.

To generate a signed NSIS installer:

1. Acquire our latest digital signing certificate and save it on your computer as a `p12` file.
2. Set `WIN_CSC_LINK` to the path to your certificate file. For maximum compatibility I use forward slashes.
   - CMD: `set WIN_CSC_LINK=C:/Users/You/Somewhere/Certificate.p12`
   - PowerShell: `$env:WIN_CSC_LINK = "C:/Users/You/Somewhere/Certificate.p12"`
3. Set `WIN_CSC_KEY_PASSWORD` to the password string associated with your P12 file.
   - CMD: `set WIN_CSC_KEY_PASSWORD=superSecret`
   - PowerShell: `$env:WIN_CSC_KEY_PASSWORD = "superSecret"`
4. Build the NSIS installer only: building the APPX installer will fail if these environment variables are set.
   - `npm run dist -- -w nsis`

### Make a semi-packaged build

This will simulate a packaged build without actually packaging it: instead the files will be copied to a subdirectory
of `dist`.

`npm run dist:dir`

### Debugging

You can debug the renderer process by opening the Chromium development console. This should be the same keyboard
shortcut as Chrome on your platform. This won't work on a packaged build.

You can debug the main process the same way as any Node.js process. I like to use Visual Studio Code with a
configuration like this:

```jsonc
    "launch": {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Desktop",
                "type": "node",
                "request": "launch",
                "cwd": "${workspaceFolder:smalruby3-desktop}",
                "runtimeExecutable": "npm",
                "autoAttachChildProcesses": true,
                "runtimeArgs": ["start", "--"],
                "protocol": "inspector",
                "skipFiles": [
                    // it seems like skipFiles only reliably works with 1 entry :(
                    //"<node_internals>/**",
                    "${workspaceFolder:scratch-desktop}/node_modules/electron/dist/resources/*.asar/**"
                ],
                "sourceMaps": true,
                "timeout": 30000,
                "outputCapture": "std"
            }
        ]
    },
```


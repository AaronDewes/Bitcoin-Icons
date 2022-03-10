# Bitcoin Icons release process

## Problem

Between Figma, Github releases and NPM modules, it’s getting tricky to keep things in sync.

## Solution

Implement a release process using milestones.
1. We always have an active milestone
1. New requests for icons and icon changes are added as Github issues
1. As we complete them, we add them to the milestone
1. Every few weeks, one of us goes through the release process (if we have enough changes, this won't be very often)

## Release process

This is pretty tedious. If there are parts that could be simplified or automated, let's do it.

### 1. Prepare a milestone

Each release starts with a [milestone](https://github.com/BitcoinDesign/Bitcoin-Icons/milestones) whose name includes the new version number. Create issues for all changes (to icons or otherwise) to be made.

### 2. Prepare icons in Figma

Address the icon changes in Figma. Use the [Export helper plugin](https://github.com/BitcoinDesign/Bitcoin-Icons/tree/main/figma-plugins/icon-export-helper) to prepare clean, exportable frames. Check the dev console in Figma for issues.

### 3. Export icons

1. Export the icons from Figma into your local version of the repo.
2. Run `yarn build` to create optimized files (this may introduce issues, as the SVG code gets modified)
3. Run `yarn prepublishOnly` to prep the modules for local testing

### 4. Test the Vue module

Locally verify icons render correctly. You can use the [bitcoinicons.com](https://github.com/GBKS/bitcoinicons.com) repo for the Vue module.

This is an example of installing the pre-published module and running the site.
```
cd packages/website
yarn serve
```

### 5. Test the React module

There is a [simple test project](https://github.com/GBKS/bitcoin-icons-react-test) you can use.

```
npm i
npm uninstall @bitcoin-design/bitcoin-icons-react
npm install {{ your workspace directory }}/Bitcoin-Icons/packages/react
npm start
```

### 6. Test the SVG module

There is a [simple test project](https://github.com/GBKS/bitcoin-icons-svg-test) you can use.

```
npm i
npm uninstall @bitcoin-design/bitcoin-icons-svg
npm install {{ your workspace directory }}/Bitcoin-Icons/raw
npm run serve
```

### 7. Push icon updates to Github

To bump the version for all packages, run:

`yarn workspaces foreach version -i patch`

Replace patch with what part of the version you want to update: `major.minor.patch`. For example, ``yarn workspaces foreach version -i minor` would change version 0.1.7 to version 0.2.0.

If needed, also update the README files for all packages manually.

If everything looks good, create a branch and PR with the updated icons. Name it like "Milestone 0.1.7". Get it reviewed and merged.

### 8. Publish the Vue module

Run `yarn workspace @bitcoin-design/bitcoin-icons-vue npm publish`.

### 9. Publish the React module

Run `yarn workspace @bitcoin-design/bitcoin-icons-react foreach npm publish`.

### 10. Publish the SVG module

Run `yarn workspace @bitcoin-design/bitcoin-icons-svg npm publish`.

### 11. Publish the release

This is the ZIP file linked to from the site to download all icon SVGs at once.
Create a release branch that only includes the icons.
Link it to the milestone.
Create the release.

### 12. Re-publish the Figma file

Re-publish the file to Figma community with the new version number and a short update.

### 13. Update [bitcoinicons.com](https://github.com/GBKS/bitcoinicons.com)

Update it to latest published version.
Branch, PR, review & merge.

### 14. Double-check

Review it all to ensure the icons are looking badass.

### 15. Prepare the next milestone

Create a new milestone that new issues can be added to.

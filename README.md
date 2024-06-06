# Lighthouse Viewer Action

[![GitHub release](https://img.shields.io/github/v/release/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square)](https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/releases) [![GitHub last commit](https://img.shields.io/github/last-commit/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square)](https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/commits/main) [![GitHub issues](https://img.shields.io/github/issues/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square)](https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/issues) [![GitHub pull requests](https://img.shields.io/github/issues-pr/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square)](https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/pulls) ![GitHub stars](https://img.shields.io/github/stars/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square) [![GitHub license](https://img.shields.io/github/license/JackywithaWhiteDog/lighthouse-viewer-action?style=flat-square)](https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/blob/main/LICENSE)

> View Lighthouse results from [Lighthouse CI Action](https://github.com/treosh/lighthouse-ci-action) in Command Line Interface.

This action is inspired by the [issue of Lighthouse CI Action](https://github.com/treosh/lighthouse-ci-action/issues/2). Make it easier to view the reports from Lighthouse auditing in Command Line Interface. As a separate action, it can also display other reports that follow the same format of [Lighthouse CI Action results](https://github.com/treosh/lighthouse-ci-action#resultspath).

<img width="598" alt="screenshot" src="https://github.com/JackywithaWhiteDog/lighthouse-viewer-action/assets/45003637/bf792b88-f40f-41b0-ac72-3d66d1143de6">

## Table of Contents

- [Usage](#usage)
- [Input parameters](#input-parameters)

## Usage

Run this action after the Lighthouse CI Action, and specify the `resultsPath` as the input parameters. To display reports even when a assertion fails, set `continue-on-error: true` for Lighthouse CI Action and pass the `lighthouseOutcome` to raise errors after showing the reports.

```yml
name: Lighthouse Auditing

on: push

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    name: Lighthouse-CI
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Audit with Lighthouse
        id: lighthouse
        continue-on-error: true
        uses: treosh/lighthouse-ci-action@v11
        with:
          urls: |
              https://example.com/
          configPath: './lighthouserc.json'
      - name: Display Report
        uses: jackywithawhitedog/lighthouse-viewer-action@v2
        with:
          resultsPath: ${{ steps.lighthouse.outputs.resultsPath }}
          lighthouseOutcome: ${{ steps.lighthouse.outcome }}
```

## Input Parameters

### `resultsPath`

Results path of Lighthouse CI Action. The action would take files that match the pattern `<resultsPath>/lhr-*.json` as the result files.

```yml
resultsPath: ${{ steps.<lighthouse_ci_step_id>.outputs.resultsPath }}
```

### `lighthouseOutcome`

The outcome of Lighthouse CI Action. Set `continue-on-error` for Lighthouse CI Action and pass the outcome here to delay the assertion failure after displaying Lighthouse reports.

```yml
lighthouseOutcome: ${{ steps.<lighthouse_ci_step_id>.outcome }}
```

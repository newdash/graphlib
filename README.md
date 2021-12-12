# Graph Library - NewDash Fork

> graphlib with security update & type definition

[![npm (scoped)](https://img.shields.io/npm/v/@newdash/graphlib?label=graphlib)](https://www.npmjs.com/package/@newdash/graphlib)
[![node-test](https://github.com/newdash/graphlib/actions/workflows/nodejs.yml/badge.svg)](https://github.com/newdash/graphlib/actions/workflows/nodejs.yml)
[![codecov](https://codecov.io/gh/newdash/graphlib/branch/main/graph/badge.svg?token=fiCYkiPBex)](https://codecov.io/gh/newdash/graphlib)

[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=newdash_graphlib&metric=security_rating)](https://sonarcloud.io/dashboard?id=newdash_graphlib)
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=newdash_graphlib&metric=bugs)](https://sonarcloud.io/dashboard?id=newdash_graphlib)
[![Technical Debt](https://sonarcloud.io/api/project_badges/measure?project=newdash_graphlib&metric=sqale_index)](https://sonarcloud.io/dashboard?id=newdash_graphlib)

## Quick Start

```bash
npm i -S @newdash/graphlib
```

```typescript
import { Graph } from "@newdash/graphlib"

const g = var g = new Graph({ directed: true, compound: true, multigraph: true });
g.setNode("my-id", "my-label");
g.node("my-id"); // returns "my-label"
```

## [API REFERENCE](https://github.com/dagrejs/graphlib/wiki/API-Reference)

## [CHANGELOG](./CHANGELOG.md)

## [LICENSE](./LICENSE)

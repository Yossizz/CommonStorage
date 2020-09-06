# Work Standard

## Map Colonies

This repo describes the work standard for Hermon's team (vector team)

### Git
There are a few packages that will help us sustain an healthy repo, an healthy repo is
a repo that hides no magic for the newbies.
In order to achieve such goal we will need to:

1. Version our services correctly
2. Post proper and well documented docs (REST APIs, Installation guides)
3. Update our Changelogs for better clarity of changes between versions
4. Be IDE\dev enviorment agnostic that means we use the same tools and work process our features in the same way.

The tools (packages) are:
1. [commitlint](https://www.npmjs.com/package/@commitlint/cli) ([Official website](https://commitlint.js.org/#/) [github](https://github.com/conventional-changelog/commitlint)) - this package introduces an optionated linter for our commit messages, it is based on the commit standard that angularjs uses. In short our tasks are divided into scopes (feat, build, chore etc etc(more can be found in docs)) therefore when we commit our code we should all speak the same language and use the same terms.
2. [standard-version](https://www.npmjs.com/package/standard-version) - A utility for versioning using semver and CHANGELOG generation powered by Conventional Commits. (more on versioning later)
3. [Husky](https://www.npmjs.com/package/husky) - Husky can prevent bad git commit, git push and more 🐶 woof!


### lint

Our code should be linted and styled under the same standards, therefore we will force our code style with the following tools:

1. [eslint](https://www.npmjs.com/package/eslint) - ESLint is a tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
   1. we will use different plugins for frontend and backend
   2. configurations for backend and frontend can be found in standard library
2. [prettier](https://prettier.io/) - Prettier is an opinionated code formatter. It enforces a consistent style by parsing your code and re-printing it with its own rules that take the maximum line length into account, wrapping code when necessary.
   1. vscode installation can be found [here](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode#:~:text=Prettier%20Formatter%20for%20Visual%20Studio,account%2C%20wrapping%20code%20when%20necessary.)
   2. jetbrains installation can be found [here](https://plugins.jetbrains.com/plugin/10456-prettier)

### Versioning

we use [semver2](https://semver.org/)

Every release should contain the proper git tag, changelog and should be in sync with `package.json` version

### Testing
1. Use the best practices described in [goldbergyoni/javascript-testing-best-practices](https://github.com/goldbergyoni/javascript-testing-best-practices#clap-doing-it-right-example-testing-many-input-permutations-with-fast-check)
2. Unit test should check for code coverage, code coverage is not the only kpi for `code quality` but it is a factor. [more on nyc here](https://www.npmjs.com/package/nyc).
3. Code without tests or bugs fixes without new tests introduced that covers the bug fix are **not** welcome!
4. when describing tests user `Unhappy` and `Happy` paths more on that, [here](https://en.wikipedia.org/wiki/Happy_path) and [here](https://www.h2kinfosys.com/blog/happy-path-testing/)


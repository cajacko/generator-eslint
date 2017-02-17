const Generator = require('yeoman-generator');
const winston = require('winston');

winston.cli();
winston.level = 'debug';

module.exports = class extends Generator {
  copyConfig() {
    this.fs.copy(
      this.templatePath('../../../.eslintrc'),
      this.destinationPath('.eslintrc')
    );

    this.fs.copy(
      this.templatePath('../../../.eslintignore'),
      this.destinationPath('.eslintignore')
    );
  }

  installDependencies() {
    this.npmInstall(['eslint'], { 'save-dev': true });
    this.npmInstall(['eslint-plugin-import'], { 'save-dev': true });
    this.npmInstall(['eslint-plugin-jsx-a11y'], { 'save-dev': true });
    this.npmInstall(['eslint-plugin-react'], { 'save-dev': true });
    this.npmInstall(['eslint-config-airbnb'], { 'save-dev': true });
  }

  addLintScript() {
    const packageJsonPath = this.destinationPath('package.json');
    let packageJson;
    const lintScript = 'eslint **/*.js';

    try {
      packageJson = require(packageJsonPath);
    } catch (firstError) {
      winston.log('info', 'No package.json file, creating one');
      this.spawnCommandSync('npm', ['init']);

      try {
        packageJson = require(packageJsonPath);
      } catch (secondError) {
        winston.log('error', 'No package.json file');
        throw 'Could not create package.json file';
      }
    }

    winston.log('debug', 'packageJson', packageJson);

    if (!packageJson.scripts) {
      packageJson.scripts = {
        lint: lintScript
      };
    } else {
      packageJson.scripts.lint = lintScript;
    }

    winston.log('debug', 'packageJson', packageJson);

    packageJson = JSON.stringify(packageJson, null, 2);

    this.fs.write(
      this.destinationPath('package.json'),
      packageJson
    );
  }
};

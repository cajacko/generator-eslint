const Generator = require('yeoman-generator');
const winston = require('winston');
const npmAddScript = require('npm-add-script');

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

    try {
      packageJson = this.fs.readJSON(packageJsonPath);
    } catch (e) {
      winston.log('info', 'No package.json file, creating one');
      this.spawnCommandSync('npm', ['init']);
      packageJson = this.fs.readJSON(packageJsonPath);
    }

    winston.log('debug', 'packageJson', packageJson);

    if (packageJson.scripts && packageJson.scripts.lint) {
      return false;
    }

    npmAddScript({ key: 'lint', value: 'eslint **/*.js' });
    winston.log('debug', 'packageJson', packageJson);

    return true;
  }
};

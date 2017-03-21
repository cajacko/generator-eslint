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

    // Needed for the atom eslint plugin: ask this with a prompt?
    this.npmInstall(['babel-eslint'], { 'save-dev': true });
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

    if (!packageJson.scripts || !packageJson.scripts.lint) {
      npmAddScript({ key: 'lint', value: 'eslint **/*.js' });
    }

    if (!packageJson.scripts || !packageJson.scripts.eslint) {
      npmAddScript({ key: 'eslint', value: 'eslint' });
    }

    winston.log('debug', 'packageJson', packageJson);

    return true;
  }

  readme() {
    this.composeWith(require.resolve('generator-readme-cj/generators/app'), {
      tag: 'generator-eslint',
      markdown: this.fs.read(this.templatePath('README.md'))
    });
  }
};

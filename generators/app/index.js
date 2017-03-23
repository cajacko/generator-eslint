const Generator = require('yeoman-generator');
const winston = require('winston');
const npmAddScript = require('npm-add-script');

winston.cli();
winston.level = 'debug';

module.exports = class extends Generator {
  _addYeomanSupport() {
    // keeping to comma dangle threw an error when running yeoman
    // generators, so turned it off
    this.eslintrc.rules['comma-dangle'] = 'off';

    // Needed as yeoman considers methods starting with _ as private
    this.eslintrc.rules['no-underscore-dangle'] = [
      'error',
      { allowAfterThis: true }
    ];

    //  Needed for Yeoman generators
    this.eslintrc.rules['class-methods-use-this'] = [
      'error',
      { exceptMethods: ['initializing'] }
    ];

    delete this.eslintrc.rules['max-lines'];
  }

  _addFlowSupport() {
    this.flow = true;

    if (this.eslintrc.plugins) {
      this.eslintrc.plugins.push('flowtype');
    } else {
      this.eslintrc.plugins = ['flowtype'];
    }

    this.eslintrc.parser = 'babel-eslint';

    if (this.eslintrc.extends) {
      this.eslintrc.extends.push('plugin:flowtype/recommended');
    } else {
      this.eslintrc.extends = ['plugin:flowtype/recommended'];
    }

    if (this.eslintrc.settings) {
      this.eslintrc.settings.flowtype = { onlyFilesWithFlowAnnotation: true };
    } else {
      this.eslintrc.settings = {
        flowtype: { onlyFilesWithFlowAnnotation: true }
      };
    }
  }

  _addWebpackSupport() {
    this.webpack = true;

    // So eslint understands Webpacks name alias'
    if (this.eslintrc.settings) {
      if (this.eslintrc.settings['import/resolver']) {
        this.eslintrc.settings['import/resolver'].webpack = {
          config: 'webpack.config.js'
        };
      } else {
        this.eslintrc.settings['import/resolver'] = {
          webpack: { config: 'webpack.config.js' }
        };
      }
    } else {
      this.eslintrc.settings = {
        'import/resolver': {
          webpack: { config: 'webpack.config.js' }
        }
      };
    }
  }

  _addBrowserGlobals() {
    if (this.eslintrc.globals) {
      this.eslintrc.globals.document = false;
      this.eslintrc.globals.window = false;
    } else {
      this.eslintrc.globals = {
        document: false,
        window: false
      };
    }
  }

  prompting() {
    this.eslintrc = {
      extends: ['airbnb'],
      rules: {
        'max-lines': [
          'error',
          {
            max: 100,
            skipBlankLines: true,
            skipComments: true
          }
        ],
        'max-len': [
          'error',
          {
            code: 80,
            ignoreStrings: true,
            ignoreUrls: true,
            ignoreRegExpLiterals: true
          }
        ]
      }
    };

    const questions = [];

    if (this.options && this.options.yeoman) {
      this._addYeomanSupport();
    } else {
      questions.push({
        type: 'confirm',
        name: 'yeoman',
        message: 'Is this project a Yeoman Generator',
        default: false
      });
    }

    if (this.options && this.options.flow) {
      this._addFlowSupport();
    } else {
      questions.push({
        type: 'confirm',
        name: 'flow',
        message: 'Do you want to use flowtype in this project',
        default: false
      });
    }

    if (this.options && this.options.webpack) {
      this._addWebpackSupport();
    } else {
      questions.push({
        type: 'confirm',
        name: 'webpack',
        message: 'Is this project using webpack',
        default: false
      });
    }

    if (this.options && this.options.browserGlobals) {
      this._addBrowserGlobals();
    } else {
      questions.push({
        type: 'confirm',
        name: 'browserGlobals',
        message: 'Will this project use browser globals (window and document)',
        default: false
      });
    }

    if (questions.length) {
      return this.prompt(questions).then((answers) => {
        if (answers.yeoman) {
          this._addYeomanSupport();
        }

        if (answers.flow) {
          this._addFlowSupport();
        }

        if (answers.webpack) {
          this._addWebpackSupport();
        }

        if (answers.browserGlobals) {
          this._addBrowserGlobals();
        }
      });
    }

    return true;
  }

  copyConfig() {
    this.fs.write(
      this.destinationPath('.eslintrc'),
      JSON.stringify(this.eslintrc, null, 2)
    );

    this.fs.copy(
      this.templatePath('eslintignore'),
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

    if (this.flow) {
      this.npmInstall(['eslint-plugin-flowtype'], { 'save-dev': true });
    }

    if (this.webpack) {
      this.npmInstall(['eslint-import-resolver-webpack'], { 'save-dev': true });
    }
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
}

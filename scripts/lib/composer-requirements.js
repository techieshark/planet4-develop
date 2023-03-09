const { readFileSync, writeFileSync, copyFileSync } = require('fs');
const { run } = require('./run');
const { isDir } = require('./utils');

function generateBaseComposerRequirements(config) {
  copyFileSync(`${config.baseDir}/composer.json`, `${config.appDir}/composer.json`);

  run(`wp-env run composer -d /app/${config.appDir}/ config --unset repositories.0`);
  run(`wp-env run composer -d /app/${config.appDir}/ config --unset extra.merge-plugin`);
  run(`wp-env run composer -d /app/${config.appDir}/ config --json extra.installer-paths '"{\\"plugins/{\\$name}/\\": [\\"type:wordpress-plugin\\"],\\"themes/{\\$name}/\\": [\\"type:wordpress-theme\\"]}"'`);
  run(`wp-env run composer -d /app/${config.appDir}/ config platform.php "${config.phpVersion}"`);

  if (isDir(`${config.themesDir}/planet4-master-theme`)) {
      run(`wp-env run composer -d /app/${config.appDir}/ remove --no-update greenpeace/planet4-master-theme`);
  }

  if (isDir(`${config.pluginsDir}/planet4-plugin-gutenberg-blocks`)) {
      run(`wp-env run composer -d /app/${config.appDir}/ remove --no-update greenpeace/planet4-plugin-gutenberg-blocks`);
  }

  return JSON.parse(readFileSync(`${config.appDir}/composer.json`));
}

function generateNROComposerRequirements(config) {
  const baseComposerConfig = JSON.parse(readFileSync(`${config.appDir}/composer.json`));
  const nroComposerConfig = JSON.parse(readFileSync(`${config.nro.dir}/composer-local.json`)) || {};

  const merged = {
    "require": { ...baseComposerConfig.require, ...nroComposerConfig.require },
    "config": { ...baseComposerConfig.config, ...nroComposerConfig.config },
    "scripts": { ...baseComposerConfig.scripts, ...nroComposerConfig.scripts },
  };
  const composerConfig = { ...baseComposerConfig, ...merged };
  // @todo: resolve composer scripts and/or `wp` usage from composer container
  writeFileSync(`${config.appDir}/composer.json`, JSON.stringify(composerConfig));

  return composerConfig;
}

module.exports = {
  generateBaseComposerRequirements,
  generateNROComposerRequirements
}

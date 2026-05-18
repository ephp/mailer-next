<?php
namespace Deployer;

require 'recipe/common.php';

// Run with
// ~/.composer/vendor/bin/dep deploy -o remote_user=admin -o become=root
// REQUIRES DEPLOYER TO BE INSTALLED GLOBALLY:
// composer global require deployer/deployer

// Config

set('repository', 'git@github.com:Oimmei-Digital-Boutique/TwinsbrosNext.git');
set('default_timeout', 3600);
set('keep_releases', 3);

add('shared_files', ['.env.local']);

// Hosts

host('3.125.68.183')
    ->set('deploy_path', '/var/nextjs/twins.oimmei.dev-nextjs');

// Tasks

desc('Deploys project');
task('deploy', [
    'deploy:prepare',
    'deploy:publish',
]);

task('build', function () {
    cd('{{release_path}}');
    run('yarn install');
    run('./node_modules/.bin/next build');
});

task('nextjs:restart', function () {
    // Restarting PHP to load the new container file.
//    run('systemctl stop nextjs-dev-twins.service');
//    run('systemctl start nextjs-dev-twins.service');
    run('systemctl restart nextjs-dev-twins.service');
});

after('deploy:failed', 'deploy:unlock');
after('deploy:symlink', 'build');
after('deploy:cleanup', 'nextjs:restart');

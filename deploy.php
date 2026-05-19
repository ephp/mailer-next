<?php
namespace Deployer;

require 'recipe/common.php';

// Run with
// ~/.composer/vendor/bin/dep deploy -o remote_user=epep -o become=root
// REQUIRES DEPLOYER TO BE INSTALLED GLOBALLY:
// composer global require deployer/deployer

// Config

set('repository', 'git@github.com:ephp/mailer-next.git');
set('default_timeout', 3600);
set('keep_releases', 3);

add('shared_files', ['.env.local', '.npmrc']);

// Hosts

host('116.203.226.28')
    ->set('deploy_path', '/var/nextjs/mailer');

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
//    run('systemctl stop nextjs-mailer.service');
//    run('systemctl start nextjs-mailer.service');
//    run('systemctl restart nextjs-mailer.service');
});

after('deploy:failed', 'deploy:unlock');
after('deploy:symlink', 'build');
after('deploy:cleanup', 'nextjs:restart');

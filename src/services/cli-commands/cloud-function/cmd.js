'use strict';

const chalk = require('chalk');
const { exec } = require('child_process');
const homedir = require('os').homedir();
const fs = require('fs');
const Configstore = require('configstore');
const path = require('path');
const pkg = require('../../../../package.json');

const dockerImage = `dilantha111/clocal-gcp-function:0`;
const defaultPort = 8000;

const action = (cmd, first, second) => {
  switch (cmd) {
    case 'start':
      start();
      break;
    case 'stop':
      stop();
      break;
    case 'deploy':
      deploy(first);
      break;
    case 'call':
      call(first);
      break;
    case 'list':
      list();
      break;
    case 'delete':
      deleteFunc(first);
      break;

    default:
      console.log(`command invalid ${cmd} ${first} ${second}`);
  }
};

const deploy = functionName => {
  const config = new Configstore(path.join(pkg.name, '.containerList'));
  const dockerId = config.get('function');
  try {
    exec(
      `docker cp . ${dockerId}:/functions/${functionName}`,
      (err, stdout, stderr) => {
        if (err) console.log(chalk.bgRed(`failed to execute\n${stderr}`));
        exec(
          `docker exec ${dockerId} bash scripts/deploy.sh ${functionName}`,
          (err, stdout, stderr) => {
            if (err) console.log(chalk.bgRed(`failed to execute\n${stderr}`));
            console.log(`${stdout}`);
          }
        );
      }
    );
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

const call = functionName => {
  try {
    const config = new Configstore(path.join(pkg.name, '.containerList'));
    const dockerId = config.get('function');
    exec(
      `docker exec ${dockerId} bash scripts/call.sh ${functionName}`,
      (err, stdout, stderr) => {
        if (err) console.log(chalk.bgRed(`failed to execute\n${stderr}`));
        console.log(stdout);
      }
    );
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

const list = functionName => {
  try {
    const config = new Configstore(path.join(pkg.name, '.containerList'));
    const dockerId = config.get('function');
    exec(
      `docker exec ${dockerId} bash scripts/list.sh`,
      (err, stdout, stderr) => {
        if (err) console.log(chalk.bgRed(`failed to execute\n${stderr}`));
        console.log(stdout);
      }
    );
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

const deleteFunc = functionName => {
  try {
    const config = new Configstore(path.join(pkg.name, '.containerList'));
    const dockerId = config.get('function');
    exec(
      `docker exec ${dockerId} bash scripts/delete.sh ${functionName}`,
      (err, stdout, stderr) => {
        if (err) console.log(chalk.bgRed(`failed to execute\n${stderr}`));
        console.log(stdout);
      }
    );
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

const start = () => {
  try {
    console.log(chalk.blueBright('starting gcp function ...'));
    const config = new Configstore(path.join(pkg.name, '.containerList'));
    exec(`docker run -d ${dockerImage}`, (err, stdout, stderr) => {
      if (err) console.log(chalk.bgRed(`failed to start\n${stderr}`));
      config.set('function', stdout.trim());
      console.log(chalk.green.bgWhiteBright(`gcp function started ...`));
    });
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

const stop = () => {
  try {
    console.log(chalk.blueBright('stopping gcp function ...'));
    const config = new Configstore(path.join(pkg.name, '.containerList'));
    const dockerId = config.get('function');

    if (dockerId) {
      exec(`docker container rm -f ${dockerId}`, (err, stdout, stderr) => {
        if (err) console.log(chalk.bgRed(`failed to stop\n${stderr}`));

        if (dockerId === stdout.trim()) {
          console.log(
            chalk.green.bgWhiteBright(`stopped gcp function. ${dockerId}`)
          );
        } else {
          console.log(
            chalk.blueBright.bgRed(
              'something unintended happen. Try to manually stop the docker containers ...'
            )
          );
        }
        config.delete('function');
      });
    } else {
      console.log(
        chalk.blueBright.bgRed('clocal gcp function is not running ...')
      );
    }
  } catch (err) {
    console.log(chalk.blueBright.bgRed(err));
  }
};

module.exports = {
  commandName: 'func <cmd> [first] [second]',
  action: action,
};

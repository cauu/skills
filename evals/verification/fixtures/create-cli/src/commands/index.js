const commands = {
  add: require('./add'),
  list: require('./list'),
  export: require('./export'),
};

function parse(argv) {
  const options = {};
  const args = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--data') options.data = argv[++i];
    else args.push(argv[i]);
  }
  return { options, args };
}

function run(argv) {
  const { options, args } = parse(argv);
  const [name, ...rest] = args;
  if (name === '--version') {
    console.log(require('../../package.json').version);
    return 0;
  }
  const command = commands[name];
  if (!command) {
    console.error(`usage: notes [--data <file>] <${Object.keys(commands).join('|')}> [args]`);
    return 2;
  }
  return command(options, rest);
}

module.exports = { run };

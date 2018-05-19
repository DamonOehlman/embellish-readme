const test = require('tape');
const embellish = require('..');

test('can embellish a simple file', async t => {
  t.plan(1);
  const output = await getOutput('input/simple/README.md');
  console.log(output);
});

function getOutput(filename) {
  return embellish({
    filename: path.resolve(__dirname, filename),
    reporter: null
  });
}

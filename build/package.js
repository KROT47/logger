const basePackageJson = require( '../package.json' );

const {
    name,
    version,
    description,
    author,
    repository,
    engines,
    dependencies,
    license,
} = basePackageJson;

module.exports = {
    name,
    version,
    description,
    author,
    repository,
    engines,
    dependencies,
    license,
    "main": "index",
};

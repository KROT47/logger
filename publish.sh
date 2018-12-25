#!/bin/bash
set -e

yarn build

cd dist
npm publish --access public

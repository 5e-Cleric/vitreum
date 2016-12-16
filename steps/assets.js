const _ = require('lodash');
const fse = require('fs-extra');
const path = require('path');
const minimatch = require('minimatch');

const log = require('../utils/log.js');
const addPartial = require('../utils/partialfn.js');


const scanFolder = (globs, folder) => {
	return new Promise((resolve, reject) => {
		let items = [];
		fse.walk(folder)
			.on('data', (item) => {
				const matched = _.find(globs, (glob) => {
					return minimatch(item.path, glob, {matchBase : true});
				});
				if(matched) items.push(item.path);
			})
			.on('end', function () {
				_.each(items, (assetPath)=>{
					const dest = path.resolve(`./build/assets`, path.relative(folder, assetPath));
					fse.copySync(assetPath, dest);
				});
				return resolve();
			});
		});
};

const runAssets = (globs, folders) => {
	const endLog = log.time('assets');
	return Promise.all(_.map(_.flatten(folders), (folder)=>{
		return scanFolder(globs, folder);
	})).then(endLog);
};

module.exports = addPartial(runAssets);
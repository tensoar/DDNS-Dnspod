const fs = require('fs');
const { join } = require('path');

const shell = require('shelljs');
const gulp = require('gulp');

const PACK_OUT = join(__dirname, 'pack');
const isLinux = /^linux/.test(process.platform) ? true : false;

async function build() {
    const buildExec = shell.exec('npx tsc');
    if (buildExec.code !== 0) {
        console.error('build failed ...');
    }
    return buildExec.code;
}



async function clearPack() {
    if (fs.existsSync(PACK_OUT)) {
        console.log(`rm out folder: ${PACK_OUT} ...`);
        shell.rm('-rf', PACK_OUT);
    }

    console.info(`creating out folder: ${PACK_OUT} ...`);
    fs.mkdirSync(PACK_OUT);
    return 0;
}

async function packBinaryWin() {
    const PACK_PLAT = 'node12-win-x64';
    const packCommand = `${join(__dirname, 'node_modules', '.bin', 'pkg')} ${join(__dirname, 'package.json')} -o ${join(PACK_OUT, 'ddns')} -t ${PACK_PLAT}  --out_path ${PACK_OUT}`;
    const packRes = shell.exec(packCommand);
    return packRes.code;
}

async function packBinaryLinux() {
    const PACK_PLAT = 'node12-linux-x64';
    const packCommand = `${join(__dirname, 'node_modules', '.bin', 'pkg')} ${join(__dirname, 'package.json')} -o ${join(PACK_OUT, 'ddns')} -t ${PACK_PLAT} --out_path ${PACK_OUT}`;
    const packRes = shell.exec(packCommand);
    return packRes.code;
}


exports.build = build;
exports.packWin = gulp.series(clearPack, build, packBinaryWin);
exports.packLinux = gulp.series(clearPack, build, packBinaryLinux);
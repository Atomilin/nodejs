const fs = require('fs');
const path = require('path');
const params = require('commander');

params
.option('--in [in]', 'Input folder', './in')
.option('--out [out]', 'Output folder', './out')
.option('--delete', 'Delete input folder')
  .parse(process.argv);

const startDir = params.in;
const endDir = params.out;
const deleteInDir = params.delete;

fs.access(startDir, err => {
  if (err) {
    console.log('Start folder does not exist.');
  } else {
    fs.access(endDir, err => {
      if (err) {
        fs.mkdir(endDir, err => {
          if (err) {
            console.log('Can not create output folder.');
          } else {
            sort(startDir);
          }
        });
      } else {
        sort(startDir);
      }
    });
  }
});

function sort (dir) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.log('Can not read directory ' + dir);
    } else {
      files.forEach(item => {
        const itemPath = path.join(dir, item);

        fs.stat(itemPath, (err, state) => {
          if (err) {
            console.log('Can not check ' + itemPath);
          } else {
            if (state.isFile()) {
              const letter = item[0].toUpperCase();
              const targetDir = path.join(endDir, letter);
              const targetFile = path.join(targetDir, item);

              fs.access(targetDir, err => {
                if (err) {
                  fs.mkdir(targetDir, () => {
                    moveFile(item, itemPath, targetFile, targetDir, dir);
                  });
                } else {
                  moveFile(item, itemPath, targetFile, targetDir, dir);
                }
              });
            }
            if (state.isDirectory()) {
              sort(itemPath);
            }
          }
        });
      });
    }
  });
}

function moveFile (item, itemPath, targetFile, targetDir, dir) {
  let fileNameSuffix = 1;

  while (fs.existsSync(targetFile)) {
    const itemParts = path.parse(item);
    targetFile = path.join(targetDir, itemParts.name + '_' + fileNameSuffix + itemParts.ext);
    fileNameSuffix++;
  }

  fs.link(itemPath, targetFile, err => {
    const result = err ? '[error]' : '[ok]';
    console.log(itemPath + ' -> ' + targetFile + ' ' + result);

    if (deleteInDir) {
      fs.unlink(itemPath, () => {
        fs.rmdir(dir, () => {});
        fs.rmdir(startDir, () => {});
      });
    }
  });
}
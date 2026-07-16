import * as fs from 'fs';
import * as path from 'path';
import * as fss from 'fs-extra';

export class FileTransfer {
  async fileTransfer(filename, id, fid?) {
    console.log();
    const targetDir = `./upload/${id}`;
    try {
      const source = path.join('./temp-upload', filename);
      const dest = path.join(targetDir, filename);

      if (fid.userFile && fs.existsSync(targetDir)) {
        fs.readdir(`./upload/${id}`, 'utf-8', (err, files) => {
          if (err) {
            console.log(err + 'hello');
          } else {
            files.forEach((file) => {
              if (file) {
                fs.promises.unlink(`./upload/${id}/` + file);
              }
            });
          }
        });
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      await fs.promises.rename(source, dest);
    } catch (error) {
      throw error;
    }
    return true;
  }

  async fileTransfer2(filename, id, fid?) {
    const targetDir = `./upload/group/${id}`;
    try {
      const source = path.join('./temp-upload', filename);
      const dest = path.join(targetDir, filename);

      if (fid.groupFile && fs.existsSync(targetDir)) {
        fs.readdir(`./upload/group/${id}`, 'utf-8', (err, files) => {
          if (err) {
          } else {
            files.forEach((file) => {
              if (file) {
                //console.log(`./upload/${id}/` + file)
                fs.promises.unlink(`./upload/group/${id}/` + file);
              }
            });
          }
        });
      } else {
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // const datafile = await fs.promises.readFile(source, "utf-8");
      // await fs.promises.writeFile(dest, datafile, "utf-8");

      //await fss.move(source, dest, { overwrite: true });
      await fs.promises.rename(source, dest);
      // await fs.promises.copyFile(source, dest)

      //  await fs.promises.unlink(source)
    } catch (error) {
      return error;
    }
  }

  async fileTransfer3(filename, id, fid?) {
    const targetDir = `./upload/company/${id}`;
    try {
      const source = path.join('./temp-upload', filename);
      const dest = path.join(targetDir, filename);

      if (fid.companyFile && fs.existsSync(targetDir)) {
        fs.readdir(`./upload/company/${id}`, 'utf-8', (err, files) => {
          if (err) {
          } else {
            files.forEach((file) => {
              if (file) {
                //console.log(`./upload/${id}/` + file)
                fs.promises.unlink(`./upload/company/${id}/` + file);
              }
            });
          }
        });
      } else {
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      // const datafile = await fs.promises.readFile(source, "utf-8");
      // await fs.promises.writeFile(dest, datafile, "utf-8");

      //await fss.move(source, dest, { overwrite: true });
      await fs.promises.rename(source, dest);
      // await fs.promises.copyFile(source, dest)

      //  await fs.promises.unlink(source)
    } catch (error) {
      return error;
    }
  }
}

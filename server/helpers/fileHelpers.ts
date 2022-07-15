import { unlinkSync, renameSync } from 'fs';

export const renameLocalFile = (
  oldFileName: string,
  newFileName: string,
  directory = './tmp',
) => {
  renameSync(directory + '/' + oldFileName, directory + '/' + newFileName);
};

export const deleteLocalFile = (fileName: string, directory = './tmp') => {
  unlinkSync(directory + '/' + fileName);
};

import type { FileRecord } from '../types';

type Props = {
  selected: FileRecord[];
  runOperation: (operation: () => Promise<void>) => Promise<void>;
  clearSelection: () => void;
};

const joinPath = (a: string, b: string) => `${a.replace(/[\\/]+$/, '')}/${b}`;

export const BulkActions = ({ selected, runOperation, clearSelection }: Props) => {
  const count = selected.length;

  const bulkDelete = async () => {
    await runOperation(async () => {
      for (const file of selected) {
        await window.smartApi.deletePath(file.path);
      }
    });
    clearSelection();
  };

  const bulkMove = async () => {
    const destination = prompt('Move selected items to folder path:');
    if (!destination) return;
    await runOperation(async () => {
      for (const file of selected) {
        await window.smartApi.movePath(file.path, joinPath(destination, file.name));
      }
    });
    clearSelection();
  };

  const bulkCopy = async () => {
    const destination = prompt('Copy selected items to folder path:');
    if (!destination) return;
    await runOperation(async () => {
      for (const file of selected) {
        await window.smartApi.copyPath(file.path, joinPath(destination, file.name));
      }
    });
    clearSelection();
  };

  const createFolder = async () => {
    if (!selected.length) return;
    const parent = selected[0].parentFolder;
    const name = prompt('New folder name:');
    if (!name) return;
    await runOperation(() => window.smartApi.createFolder(joinPath(parent, name)));
  };

  const renameOne = async () => {
    if (selected.length !== 1) return;
    const file = selected[0];
    const next = prompt('Rename to:', file.name);
    if (!next || next === file.name) return;
    await runOperation(() => window.smartApi.renamePath(file.path, joinPath(file.parentFolder, next)));
    clearSelection();
  };

  return (
    <div className="bulk-actions">
      <strong>{count} selected</strong>
      <button className="button" onClick={createFolder}>Create Folder</button>
      <button className="button" onClick={renameOne} disabled={count !== 1}>Rename</button>
      <button className="button" onClick={bulkMove} disabled={count === 0}>Move</button>
      <button className="button" onClick={bulkCopy} disabled={count === 0}>Copy</button>
      <button className="button danger" onClick={bulkDelete} disabled={count === 0}>Delete</button>
    </div>
  );
};

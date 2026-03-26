import { useEffect, useMemo } from 'react';
import { AutoOrganizePanel } from './components/AutoOrganizePanel';
import { BulkActions } from './components/BulkActions';
import { Dashboard } from './components/Dashboard';
import { FileList } from './components/FileList';
import { FileToolbar } from './components/FileToolbar';
import { PreviewPanel } from './components/PreviewPanel';
import { Sidebar } from './components/Sidebar';
import { selectVisibleFiles, useAppStore } from './store';

export const App = () => {
  const state = useAppStore();
  const visibleFiles = useMemo(() => selectVisibleFiles(state), [state]);

  useEffect(() => {
    state.initialize();
  }, []);

  const selectedFiles = visibleFiles.filter((file) => state.selectedIds.includes(file.id));

  return (
    <div className="app">
      <Sidebar
        section={state.section}
        setSection={state.setSection}
        onPickFolders={state.pickFolders}
        roots={state.settings.scanRoots}
      />
      <main className="main">
        {state.error && <div className="error">{state.error}</div>}
        {state.loading && <div className="loading">Working...</div>}

        {state.section === 'dashboard' && <Dashboard scan={state.scan} files={visibleFiles} />}

        {state.section === 'files' && (
          <>
            <FileToolbar
              files={state.scan.files}
              search={state.search}
              setSearch={state.setSearch}
              filters={state.filters}
              setFilter={state.setFilter}
              sort={state.sort}
              setSort={state.setSort}
              viewMode={state.settings.viewMode}
              setViewMode={state.setViewMode}
            />
            <BulkActions
              selected={selectedFiles}
              runOperation={state.runFileOperation}
              clearSelection={() => state.setSelected([])}
            />
            <div className="content-grid">
              <section className="list-wrap">
                <FileList
                  files={visibleFiles}
                  selectedIds={state.selectedIds}
                  setSelected={state.setSelected}
                  activeFile={state.activeFile}
                  setActiveFile={state.setActiveFile}
                  viewMode={state.settings.viewMode}
                />
              </section>
              <PreviewPanel
                file={state.activeFile}
                onToggleFavorite={state.toggleFavorite}
                onSetTags={state.setTags}
              />
            </div>
          </>
        )}

        {state.section === 'organize' && (
          <AutoOrganizePanel
            autoRule={state.autoRule}
            setAutoRule={state.setAutoRule}
            autoPlan={state.autoPlan}
            previewPlan={state.previewAutoPlan}
            applyPlan={state.applyAutoPlan}
            undoPlan={state.undoAutoPlan}
          />
        )}
      </main>
    </div>
  );
};

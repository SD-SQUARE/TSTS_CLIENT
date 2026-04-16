import React from 'react';

const TicketListStyles: React.FC = () => (
    <style>{`
        .tree-select-no-scroll .ant-select-tree-list-holder-inner { width: 100% !important; }
        .tree-select-no-scroll .ant-select-tree-node-content-wrapper { flex: 1 !important; overflow: hidden !important; display: flex !important; }
        .tree-select-no-scroll .ant-select-tree-title { flex: 1 !important; overflow: hidden !important; }

        .react-resizable { position: relative; background-clip: padding-box; }
        .react-resizable-handle {
            position: absolute; right: -10px !important; bottom: 0;
            z-index: 10; width: 20px !important; height: 100%; cursor: col-resize;
        }

        .ant-table-empty .ant-table-body { max-height: none !important; height: auto !important; overflow-y: hidden !important; }
        .ant-table-placeholder { display: flex; align-items: center; justify-content: center; border-bottom: none; }
        .ant-table-placeholder .ant-table-expanded-row-fixed {
            min-height: calc(100vh - 200px) !important;
            display: flex; align-items: center; justify-content: center; border-bottom: none;
        }
        .ant-table-body { min-height: calc(100vh - 270px); }

        .row-highlight-open           { background-color: #e6f4ff !important; }
        .row-highlight-closed,
        .row-highlight-resolved       { background-color: #f6ffed !important; }
        .row-highlight-in-progress    { background-color: #fff7e6 !important; }
        .row-highlight-pending        { background-color: #fffbe6 !important; }
        .row-highlight-out-of-service { background-color: #fff1f0 !important; }

        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-left         { background-color: #e6f4ff !important; }
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-left     { background-color: #f6ffed !important; }
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-left  { background-color: #fff7e6 !important; }
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-left      { background-color: #fffbe6 !important; }
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-left { background-color: #fff1f0 !important; }

        [class^="row-highlight-"]:hover > td { filter: brightness(0.97); }
        [dir='rtl'] .react-resizable-handle { left: 0 !important; right: auto !important; cursor: col-resize; }
        [dir='ltr'] .react-resizable-handle { right: 0 !important; left: auto !important; cursor: col-resize; }
        .react-resizable-handle-active { z-index: 1000; }
    `}</style>
);

export default TicketListStyles;
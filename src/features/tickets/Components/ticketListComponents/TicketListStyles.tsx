import React from 'react';

const TicketListStyles: React.FC = () => (
    <style>{`
        .tree-select-no-scroll .ant-select-tree-list-holder-inner { width: 100% !important; }
        .tree-select-no-scroll .ant-select-tree-node-content-wrapper { flex: 1 !important; overflow: hidden !important; display: flex !important; }
        .tree-select-no-scroll .ant-select-tree-title { flex: 1 !important; overflow: hidden !important; }

        .react-resizable { background-clip: padding-box; }
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

        .row-highlight-open, 
        .row-highlight-re-open         { background-color: #e6f4ff !important; }
        .row-highlight-closed         { background-color: #abf6ab !important; }
        .row-highlight-resolved       { background-color: #65c165 !important; }
        .row-highlight-in-progress    { background-color: #bfcfff !important; }
        .row-highlight-pending        { background-color: #ffffbf !important; }
        .row-highlight-out-of-service { background-color: #fff1f0 !important; }

        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-open > td.ant-table-cell-fix-end         { background-color: #e6f4ff !important; }
        .ant-table-tbody > tr.row-highlight-re-open > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-re-open > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-re-open > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-re-open > td.ant-table-cell-fix-end         { background-color: #e6f4ff !important; }
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-closed > td.ant-table-cell-fix-end       { background-color: #abf6ab !important; }
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-resolved > td.ant-table-cell-fix-end     { background-color: #65c165 !important; }
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-in-progress > td.ant-table-cell-fix-end  { background-color: #bfcfff !important; }
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-pending > td.ant-table-cell-fix-end      { background-color: #ffffbf !important; }
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-start,
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-left,
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-right,
        .ant-table-tbody > tr.row-highlight-out-of-service > td.ant-table-cell-fix-end { background-color: #fff1f0 !important; }

        [class^="row-highlight-"]:hover > td { filter: brightness(0.97); }
        .ticket-title-cell { min-width: 0; width: 100%; overflow: hidden; }
        .ticket-title-cell__text { min-width: 0; overflow: hidden; }
        .ticket-sla-tag { flex: 0 0 auto; margin-inline-end: 0; }
        [dir='rtl'] .ant-table-filter-column { flex-direction: row; }
        [dir='rtl'] .ant-table-filter-column-title { text-align: right; }
        [dir='rtl'] .ant-table-filter-trigger { margin-right: 8px; margin-left: 0; }
        [dir='rtl'] .react-resizable-handle { left: -10px !important; right: auto !important; }
        .react-resizable-handle-w { left: -10px !important; right: auto !important; cursor: col-resize; }
        .react-resizable-handle-e { right: -10px !important; left: auto !important; cursor: col-resize; }
        .react-resizable-handle-active { z-index: 1000; }
    `}</style>
);

export default TicketListStyles;

export const createColumnFilters = (columns) => {
  return columns.map((e) => {
    return {
      field: e.field,
      handler: (sortModel, selectionOrderIds, tableData) => {
        let selected = tableData.filter((o) =>
          selectionOrderIds.includes(o.id)
        );
        let filtered = tableData.filter(
          (o) => !selectionOrderIds.includes(o.id)
        );
        if (sortModel === "asc") {
          selected.sort((a, b) => (a[e.field] > b[e.field] ? 1 : -1));
          filtered.sort((a, b) => (a[e.field] > b[e.field] ? 1 : -1));
        }
        if (sortModel === "desc") {
          selected.sort((a, b) => (a[e.field] < b[e.field] ? 1 : -1));
          filtered.sort((a, b) => (a[e.field] < b[e.field] ? 1 : -1));
        }
        return selected.concat(filtered);
      },
    };
  });
};

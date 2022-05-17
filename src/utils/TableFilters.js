export const createColumnFilters = (columns) => {
  return columns.map((e) => {
    return {
      field: e.field,
      handler: (
        sortModel,
        selectionOrderIds,
        tableData,
        ignoreSelected = false
      ) => {
        let selected = [];
        if (!ignoreSelected)
          selected = tableData.filter((o) => selectionOrderIds.includes(o.id));
          
        let filtered = [];
        if (!ignoreSelected)
          filtered = tableData.filter((o) => !selectionOrderIds.includes(o.id));
        else filtered = [...tableData];

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

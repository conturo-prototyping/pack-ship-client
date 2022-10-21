export const getSortFromModel = (sortModel) => {
  if (sortModel.length === 0) {
    return { sortBy: "CUSTOMER", sortOrder: 1 };
  } else if (
    sortModel[0].field === "label" &&
    sortModel[0].sort === "asc"
  ) {
    return { sortBy: "CUSTOMER", sortOrder: 1 };
  } else if (
    sortModel[0].field === "label" &&
    sortModel[0].sort === "desc"
  ) {
    return { sortBy: "CUSTOMER", sortOrder: -1 };
  } else if (
    sortModel[0].field === "dateCreated" &&
    sortModel[0].sort === "asc"
  ) {
    return { sortBy: "DATE", sortOrder: 1 };
  } else if (
    sortModel[0].field === "dateCreated" &&
    sortModel[0].sort === "desc"
  ) {
    return { sortBy: "DATE", sortOrder: -1 };
  } else {
    return { sortBy: "CUSTOMER", sortOrder: 1 };
  }
};

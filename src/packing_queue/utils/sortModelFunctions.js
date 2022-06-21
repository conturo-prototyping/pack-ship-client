const SORT = {
  asc: 1,
  desc: -1,
};

const FIELD = {
  packingSlipId: "SLIPNUM",
  dateCreated: "DATE",
  orderId: "ORDER",
};

export const getSortFromModel = (sortModel) => {
  if (sortModel.length === 0) {
    return { sortBy: "ORDER", sortOrder: 1 };
  }

  sortModel = sortModel[0];
  if ("field" in sortModel && "sort" in sortModel) {
    return { sortBy: FIELD[sortModel.field], sortOrder: SORT[sortModel.sort] };
  }

  return { sortBy: "ORDER", sortOrder: 1 };
};

import { Checkbox } from "@mui/material";

export const getCheckboxColumn = (
  disabledFn,
  selectionOrderIds,
  isSelectAllOn,
  queueData,
  onSelectAll,
  onRowClick,
  isFulfilledBatchesOn,
  searchString,
  displayHeaderCheckbox = true
) => {
  return {
    field: "completed",
    editable: false,
    width: 60,
    sortable: false,
    hideSortIcons: true,
    headerClassName: "checkbox-column",
    renderCell: (params) => {
      // If orders are selected, disable selecting of
      // other orders if the order number does not match
      // that if the selected order
      return (
        <Checkbox
          style={{ paddingLeft: "4px" }}
          disabled={disabledFn(params)}
          checked={selectionOrderIds.includes(params.id) || false}
          disableRipple
          disableFocusRipple
          onClick={() =>
            onRowClick(params.id, queueData, isFulfilledBatchesOn, searchString)
          }
        />
      );
    },
    renderHeader: () =>
      displayHeaderCheckbox ? (
        <Checkbox
          checked={isSelectAllOn}
          disableRipple
          disableFocusRipple
          onChange={(e) =>
            onSelectAll(
              e.target.checked,
              queueData,
              isFulfilledBatchesOn,
              searchString
            )
          }
          style={{ paddingLeft: "0px" }}
        />
      ) : (
        <></>
      ),
  };
};

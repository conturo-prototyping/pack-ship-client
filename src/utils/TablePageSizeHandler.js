export const onPageSizeChange = (
  pageValue,
  pageNumber,
  dataLength,
  onPageChange,
  setResultsPerPage
) => {
  // If changing the page size would cause the current page to be "bad", we need to go to the last one
  if (pageValue * pageNumber >= dataLength) {
    onPageChange(Math.floor(dataLength / pageValue));
  }
  setResultsPerPage(pageValue);
};

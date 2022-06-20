export const extractHistoryDetails = (history) => {
  return history.map((e) => {
    const dc = new Date(e.dateCreated);

    return {
      id: e._id,
      packingSlipId: e.packingSlipId,
      orderId: e.orderNumber,
      dateCreated: dc.toLocaleString(),
      dateCreatedValue: dc.getTime(),
    };
  });
};

export const extractHistoryDetails = (history) => {
  return history.map((e) => {
    const dc = new Date(e.dateCreated);

    return {
      ...e,
      id: e._id,
      orderId: e.orderNumber,
      dateCreated: dc.toLocaleString(),
      dateCreatedValue: dc.getTime(),
      items: e.items.map((item) => {
        return {
          ...item,
          item: {
            ...item.item,
            routerUploadReady: item.item.downloadUrl !== undefined,
          },
        };
      }),
    };
  });
};

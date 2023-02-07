export const extractHistoryDetails = (history) => {
  return history.map((e) => {
    const dc = new Date(e.dateCreated);

    return {
      id: e._id,
      label: e.label,
      trackingNumber: e.trackingNumber,
      dateCreated: dc.toLocaleString(),
      dateCreatedValue: dc.getTime(),
      destination: e.manifest[0].destination, // Can take just the first one since they all must be the same
    };
  });
};

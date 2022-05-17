const getFormattedDate = (dateString) => {
    const dt = new Date(dateString);
    return `${dt.getFullYear()}-${dt.getMonth() + 1}-${dt.getDate()}`;
};

export const extractHistoryDetails = (history) => {
    return history.map((e) => {
        return {
        id: e._id,
        shipmentId: e.shipmentId,
        trackingNumber: e.trackingNumber,
        dateCreated: getFormattedDate(e.dateCreated),
        };
    });
};
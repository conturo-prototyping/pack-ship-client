export const extractHistoryDetails = (history) => {
    return history.map((e) => {
        return {
        id: e._id,
        shipmentId: e.shipmentId,
        trackingNumber: e.trackingNumber,
        dateCreated: new Date(e.dateCreated).toLocaleString()
        };
    });
};
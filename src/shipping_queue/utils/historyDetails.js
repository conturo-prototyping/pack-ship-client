export const extractHistoryDetails = (history) => {
    return history.map((e) => {
        const dc = new Date(e.dateCreated);

        return {
        id: e._id,
        shipmentId: e.shipmentId,
        trackingNumber: e.trackingNumber,
        dateCreated: dc.toLocaleString(),
        };
    });
};
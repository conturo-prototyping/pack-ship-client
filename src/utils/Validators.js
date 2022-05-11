export const checkCostError = (shippingInfo) => {
  return !/^\d+(?:\.?\d{0,2})$/.test(shippingInfo.cost)
    ? "Enter valid cost amount"
    : undefined;
};

export const isShippingInfoValid = (shippingInfo) => {
  return (
    (isCarrierValid(shippingInfo?.carrier) &&
      isDeliverySpeedValid(shippingInfo?.deliverySpeed)) ||
    isDropoffOrPickup(shippingInfo?.deliveryMethod)
  );
};

export const isCarrierValid = (carrier) => {
  return carrier && carrier !== "-----";
};

export const isDeliverySpeedValid = (deliverySpeed) => {
  return deliverySpeed && deliverySpeed !== "";
};

export const isDropoffOrPickup = (deliveryMethod) => {
  return (
    deliveryMethod &&
    (deliveryMethod === "PICKUP" || deliveryMethod === "DROPOFF")
  );
};

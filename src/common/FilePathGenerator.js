import { v4 as uuidv4 } from "uuid";

export const FilePathGenerator = {
  createPackingSlipRouterPath(id) {
    return `${id}/shipping/router-${uuidv4()}`;
  },

  createTempShipmentpRouterPath(id) {
    return `${id}/tempShipment/router-${uuidv4()}`;
  },
};
